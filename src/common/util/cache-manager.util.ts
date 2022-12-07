import { Logger } from '@nestjs/common';
import * as Fs from 'fs-extra';
import * as Path from 'path';
import * as lodash from 'lodash';

import * as xEnv from '@my-environment';
import { md5 } from '@my-common';

export type CacheData<T = any> = {
    /** Cache update timestamp in milliseconds */
    time: number;
    /** TTL in seconds (or -1) */
    ttl: number;
    data: T;
    /** Source file path */
    source: string;
};

export type PathType = string | [string, string];

export class CacheManager {
    private cache: Record<string, CacheData> = {};

    constructor(public readonly path = xEnv.CACHE_PATH) {
        Fs.ensureDir(this.path).then();
    }

    private async parseFilePath(path: PathType, ensure = true) {
        if (Array.isArray(path)) {
            if (path.length !== 2) {
                console.error('[cacheman] wrong file! [dir, file]');
                return null;
            }
            if (ensure) {
                await Fs.ensureDir(Path.resolve(this.path, path[0]));
            }
            return [path[0], path[1]] as PathType;
        }
        return ['', path] as PathType;
    }

    public async create(file: PathType, data: any) {
        return this.update(file, data);
    }

    public async delete(file: PathType, onlyMemory = false) {
        const arFile = await this.parseFilePath(file);
        if (!arFile) {
            return;
        }
        const [apath, afile] = arFile;

        const path = this.getPath(apath, afile);
        const name = this.genName(afile);
        try {
            delete this.cache[name];
            if (!onlyMemory) {
                await Fs.unlink(path);
            }
        } catch (err) {}
    }

    /**
     * Update cache file
     * @param file Path to cache file
     * @param data Cache data
     * @param ttl TTL in **seconds** *(if `-1`, then indefinite)*
     */
    public async update(
        file: PathType,
        data: any,
        ttl: number = xEnv.CACHE_MANAGER_TTL,
    ) {
        const arFile = await this.parseFilePath(file);
        if (!arFile) {
            return false;
        }
        const [apath, afile] = arFile;

        const path = this.getPath(apath, afile);
        const name = this.genName(afile);

        const lastData = await this.readData(file, false);
        if (!Array.isArray(data)) {
            data = lodash.merge(lastData, data);
        }

        this.cache[name] = {
            time: Date.now(),
            ttl,
            data,
            source: afile,
        };

        await Fs.writeFile(path, JSON.stringify(this.cache[name], null, 2));
        return true;
    }

    public async readData<T = any>(file: PathType, forceFile: boolean = false) {
        const { data } = (await this.read<T>(file, forceFile)) || {
            data: null,
        };
        return data;
    }

    public async read<T = any>(
        file: PathType,
        forceFile: boolean = false,
    ): Promise<CacheData<T> | null> {
        const arFile = await this.parseFilePath(file);
        if (!arFile) {
            return null;
        }
        const [apath, afile] = arFile;

        const name = this.genName(afile);
        if (!forceFile && this.cache[name]) {
            return lodash.cloneDeep(this.cache[name]);
        }

        const path = this.getPath(apath, afile);
        if (!Fs.existsSync(path)) {
            return null;
        }

        const str = await Fs.readFile(path, 'utf8');
        try {
            if (!str) return null;
            const data = JSON.parse(str);
            if (!forceFile) {
                this.cache[name] = data;
            }
            return lodash.cloneDeep(data);
        } catch (err) {
            console.error(path, err);
            return null;
        }
    }

    public isset(file: PathType, forceFile: boolean = false) {
        let apath = '';
        if (Array.isArray(file)) {
            if (file.length !== 2) {
                console.error('[cacheman] wrong file! [dir, file]');
                return null;
            }
            [apath, file] = file;
        }

        const path = this.getPath(apath, file);
        const name = this.genName(file);
        if (!forceFile && this.cache[name]) {
            return true;
        }
        return Fs.existsSync(path);
    }

    /**
     * Is cache file timeout
     *
     * @returns `number` in seconds (or `-1` if infinite) if withTime true,
     * else `true` if timeout,`false` if not, `null` if file not exists
     */
    public async checkTimeout(file: PathType): Promise<boolean>;
    public async checkTimeout(file: PathType, withTime: true): Promise<number>;
    public async checkTimeout(file: PathType, withTime = false) {
        const arFile = await this.parseFilePath(file);
        if (!arFile) {
            return null;
        }

        const cache = await this.read(file);
        if (cache === null) {
            return null;
        }
        const { time, ttl } = cache;

        if (withTime) {
            return ttl === -1
                ? -1
                : (ttl - (Date.now() - (time || 0)) / 1e3) | 0;
        }
        return ttl === -1 ? false : Date.now() - (time || 0) > ttl * 1e3;
    }

    public async prolongTimeout(
        file: PathType,
        ttl: number = xEnv.CACHE_MANAGER_TTL,
    ) {
        // await this.update(file, null, xEnv.CACHE_MANAGER_TTL);
        Logger.log(
            `Prolong: (${file}) set TTL [${ttl}] seconds`,
            'CacheManager',
        );

        const arFile = await this.parseFilePath(file);
        if (!arFile) {
            return false;
        }
        const [apath, afile] = arFile;

        const path = this.getPath(apath, afile);
        const name = this.genName(afile);

        const { data, ttl: lastTtl } = await this.read(file, true);

        this.cache[name] = {
            time: Date.now(),
            ttl: ttl || lastTtl,
            data,
            source: afile,
        };

        await Fs.writeFile(path, JSON.stringify(this.cache[name], null, 2));
        return true;
    }

    public async clearOfGarbage(maxCount = 100, subpath: string[] = []) {
        let skipCount = 0;
        let files: { file: string; outtime: number }[] = [];

        const path2cache = Path.resolve(this.path, ...subpath);
        const dirFiles = await Fs.readdir(path2cache);
        for (const fileName of dirFiles) {
            const filePath = Path.resolve(path2cache, fileName);
            const stat = await Fs.stat(filePath);
            if (stat.isFile()) {
                const file = [Path.join(...subpath), fileName] as [
                    string,
                    string,
                ];
                const cache = await this.read(file);
                if (cache === null) {
                    continue;
                }
                const { time, ttl } = cache;
                if (ttl !== -1 && Date.now() - (time || 0) > ttl * 1e3) {
                    this.delete(file);
                    files.push({
                        file: file.join('/'),
                        outtime: Date.now() - (time || 0),
                    });
                    --maxCount;
                } else {
                    // Clear cache by memory (5 minutes)
                    if (Date.now() - (time || 0) > 5 * 60 * 1e3) {
                        this.delete(file, true);
                    }
                    ++skipCount;
                }
            } else {
                // Deep
                const subres = await this.clearOfGarbage(maxCount, [
                    ...subpath,
                    fileName,
                ]);
                files.push(...subres.files);
                maxCount -= subres.files.length;
                skipCount += subres.skipCount;
            }
            if (maxCount < 1) {
                break;
            }
        }
        return {
            files,
            skipCount,
            maxCount,
        };
    }

    public getPath(path: string, file: string) {
        return `${Path.resolve(this.path, path, this.genName(file))}.json`;
    }

    public genName(str: string) {
        if (str.endsWith('.json') && str.split('.').length > 1) {
            return str.slice(0, -'.json'.length);
        }
        return `${str.replace(/[^0-9А-яA-z-_]/gi, '').slice(0, 25)}.${md5(
            str.toLowerCase(),
        ).slice(-8)}`;
    }
}

export const cacheManager = new CacheManager();
