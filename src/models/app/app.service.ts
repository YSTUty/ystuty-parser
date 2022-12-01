import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as xEnv from '@my-environment';
import { cacheManager, delay } from '@my-common';

@Injectable()
export class AppService implements OnModuleInit {
    private readonly logger = new Logger(AppService.name);

    async onModuleInit() {
        this.clearCacheGarbage().then();
    }

    getIp(ip: string): string {
        this.logger.log(`Getting IP (${ip})`);
        return `IP:${ip}`;
    }

    public async clearCacheGarbage() {
        await delay(1 * 60 * 1e3);

        const loop = async () => {
            try {
                const maxCount = 40;
                const res = await cacheManager.clearOfGarbage(maxCount);
                this.logger.log(
                    `Clear garbage: [Remove:${res.files.length}]/[Max:${maxCount}/${res.maxCount}]/[Skip:${res.skipCount}]`,
                );
            } catch (err) {
                this.logger.error(err);
            }

            await delay(xEnv.APP_CACHE_CLEANER_DELAY * 1e3);

            setImmediate(loop);
        };
        await loop();
    }
}
