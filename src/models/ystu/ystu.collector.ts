import { Injectable, Logger } from '@nestjs/common';
import * as lodash from 'lodash';

import * as xEnv from '@my-environment';
import { ITeacherData, IAudienceData } from '@my-interfaces';
import { delay } from '@my-common';

import { YSTUProvider } from './ystu.provider';
import { AccumulativeSchedule } from './entity/accumulative-schedule.entity';

@Injectable()
export class YSTUCollector {
    private readonly logger = new Logger(YSTUCollector.name);
    public aborted = false;

    public teachersData: ITeacherData[] = [];
    public audiencesData: IAudienceData[] = [];
    public accumulativeSchedule: AccumulativeSchedule[] = [];

    constructor(private readonly ystuProvider: YSTUProvider) {}

    public async init() {
        this.logger.log('Collector starting...');
        // do {
        //     await new Promise((resolve) => setImmediate(resolve));
        // } while (!this.ystuServiec.isLoaded);

        await this.startLoop();
        this.startUpdater().then();

        this.logger.log('Collector started');
    }

    /**
     * Update teachers and audiences every 5 minutes
     */
    private async startLoop() {
        const loop = async (first = false) => {
            if (!first) {
                await delay(xEnv.YSTU_COLLECTOR_DELAY_LOOP * 1e3);
            }

            try {
                const teachersData = await this.ystuProvider.getTeachers(false);
                if (!teachersData || teachersData.length === 0) {
                    throw new Error('Empty array for teachers');
                }
                this.teachersData = teachersData;
            } catch (err) {
                this.logger.error(err);
            }

            try {
                const audiencesData = await this.ystuProvider.getAudiences(
                    false,
                );
                if (!audiencesData || audiencesData.length === 0) {
                    throw new Error('Empty array for audiences');
                }
                this.audiencesData = audiencesData;
            } catch (err) {
                this.logger.error(err);
            }

            setImmediate(loop);
        };
        await loop(true);
    }

    private async startUpdater() {
        try {
            for await (const queueAudiences of this[Symbol.asyncIterator]()) {
                if (!queueAudiences) {
                    continue;
                }
                try {
                    const audiencesWithSchedule = await Promise.all(
                        queueAudiences.map(async (audience) => ({
                            ...audience,
                            items:
                                (await this.ystuProvider.getScheduleByAudience(
                                    audience.id,
                                    false,
                                    audience.onlyCahce,
                                )) || (audience.onlyCahce ? null : []),
                        })),
                    );

                    for (const { id, name, items } of audiencesWithSchedule) {
                        const recId = this.accumulativeSchedule.findIndex(
                            (e) => e.id === id,
                        );
                        const rec = this.accumulativeSchedule[recId];

                        if (!items) {
                            if (rec) {
                                this.accumulativeSchedule.splice(recId, 1);
                            }
                            continue;
                        }

                        const time = Date.now();
                        if (!rec) {
                            this.accumulativeSchedule.push({
                                id,
                                name,
                                items,
                                time,
                            });
                            continue;
                        }

                        // Update items
                        rec.time = time;
                        rec.items = items;
                    }
                } catch (err) {
                    this.logger.error(err);
                }
            }
        } finally {
            this.logger.warn('Collector stopped');
        }
    }

    private async *[Symbol.asyncIterator]() {
        const chunk = <T>(arr: T[], size: number) =>
            Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
                arr.slice(i * size, i * size + size),
            );

        let audiences: { id: number; name: string; onlyCahce?: true }[] = [];
        let audienceChunks: typeof audiences[] = [];
        let isFirst = true;
        do {
            try {
                if (audienceChunks.length === 0) {
                    audiences = await this.getAudiences();
                    // audienceIds.sort();
                    audiences.sort(() => Math.random() - 0.5);

                    const audienceIds = audiences.map((e) => e.id);
                    // ? filter or use deleting in for?
                    this.accumulativeSchedule =
                        this.accumulativeSchedule.filter((e) =>
                            audienceIds.includes(e.id),
                        );

                    // * First try to load the schedule from the cache
                    if (isFirst) {
                        const delim = 7;
                        audienceChunks = [];
                        for (const audienceIndex in audiences) {
                            const part = Number(audienceIndex) % delim;
                            const audience = lodash.cloneDeep(
                                audiences[audienceIndex],
                            );
                            audience.onlyCahce = true;
                            if (!audienceChunks[part]) {
                                audienceChunks[part] = [];
                            }
                            audienceChunks[part].push(audience);
                        }
                    } else {
                        audienceChunks = chunk(
                            audiences,
                            xEnv.YSTU_COLLECTOR_QUEUE_CHUNK,
                        );
                    }
                }

                //
                const queueAudiences = audienceChunks.shift();
                if (audienceChunks.length === 0) {
                    isFirst = false;
                    this.logger.log(
                        `Loaded [${this.accumulativeSchedule.length}] audiences from cache`,
                    );
                    await delay(xEnv.YSTU_COLLECTOR_DELAY_UPDATER * 1e3);
                }

                yield queueAudiences;
            } catch (err) {
                this.logger.error(err);
            }

            if (isFirst) {
                await delay(5 * 1e3);
                continue;
            }

            while (this.ystuProvider.isRateLimited && Math.random() > 0.2) {
                await delay(xEnv.YSTU_COLLECTOR_DELAY_QUEUE * 1e3);
            }
            await delay(xEnv.YSTU_COLLECTOR_DELAY_QUEUE * 1e3);
        } while (!this.aborted);
    }

    //

    public async getTeachers() {
        return this.teachersData.map((e) => ({ id: e.id, name: e.name }));
    }

    public async getScheduleByTeacher(
        nameOrId: string | number,
        bypassCache: boolean = false,
    ) {
        let teacher: ITeacherData = null;
        if (typeof nameOrId === 'number' || !isNaN(Number(nameOrId))) {
            teacher = this.teachersData.find((e) => e.id === Number(nameOrId));
        } else {
            teacher = this.teachersData.find((e) =>
                e.name.toLowerCase().includes(nameOrId.toLowerCase()),
            );
        }

        if (!teacher) {
            return null;
        }

        const items = await this.ystuProvider.getScheduleByTeacher(
            teacher.id,
            bypassCache,
        );
        if (!items) {
            return null;
        }
        return { teacher: { id: teacher.id, name: teacher.name }, items };
    }

    public async getAudiences() {
        return this.audiencesData.map((e) => ({ id: e.id, name: e.name }));
    }

    public async getScheduleByAudience(
        nameOrId: string | number,
        bypassCache: boolean = false,
    ) {
        let audience: IAudienceData = null;
        if (typeof nameOrId === 'number' || !isNaN(Number(nameOrId))) {
            audience = this.audiencesData.find(
                (e) => e.id === Number(nameOrId),
            );
        } else {
            audience = this.audiencesData.find((e) =>
                e.name.toLowerCase().includes(nameOrId.toLowerCase()),
            );
        }

        if (!audience) {
            return null;
        }

        const items = await this.ystuProvider.getScheduleByAudience(
            audience.id,
            bypassCache,
        );
        if (!items) {
            return null;
        }
        return { audience: { id: audience.id, name: audience.name }, items };
    }

    public async getAccumulative() {
        const items = this.accumulativeSchedule.map((e) => e);
        const percent = Math.round(
            (items.length / this.audiencesData.length) * 100,
        );
        return { items, percent };
    }
}
