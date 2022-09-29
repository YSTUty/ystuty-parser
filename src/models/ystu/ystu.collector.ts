import { Injectable, Logger } from '@nestjs/common';
import { ITeacherData, IAudienceData } from '@my-interfaces';

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
                await new Promise((resolve) =>
                    // 5 minutes
                    setTimeout(resolve, 5 * 60 * 1e3),
                );
            }

            try {
                const teachersData = await this.ystuProvider.getTeachers(false);
                if (teachersData.length === 0) {
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
                if (audiencesData.length === 0) {
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

                const audiencesWithSchedule = await Promise.all(
                    queueAudiences.map(async (audience) => ({
                        ...audience,
                        items: await this.ystuProvider.getScheduleByAudience(
                            audience.id,
                            // true,
                        ),
                    })),
                );

                for (const { id, name, items } of audiencesWithSchedule) {
                    const rec = this.accumulativeSchedule.find(
                        (e) => e.id === id,
                    );
                    const time = new Date().getTime();
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

        let audiences: { id: number; name: string }[] = [];
        let audienceChunks: typeof audiences[] = [];
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
                    audienceChunks = chunk(audiences, 3);
                }

                //
                const queueAudiences = audienceChunks.shift();
                if (audienceChunks.length === 0) {
                    // Cooldown for 5 minutes
                    await new Promise((resolve) =>
                        setTimeout(resolve, 5 * 60 * 1e3),
                    );
                }

                yield queueAudiences;
            } catch (err) {
                this.logger.error(err);
            }

            // Wait 10 second
            await new Promise((resolve) => setTimeout(resolve, 10 * 1e3));
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
