import { Injectable, Logger } from '@nestjs/common';
import {
    ITeacherData,
    IAuditoryData,
} from '@my-interfaces';

import { YSTUProvider } from './ystu.provider';

@Injectable()
export class YSTUCollector {
    private readonly logger = new Logger(YSTUCollector.name);
    public aborted = false;

    public teachersData: ITeacherData[] = [];
    public auditoriesData: IAuditoryData[] = [];

    constructor(private readonly ystuProvider: YSTUProvider) {}

    public async init() {
        this.logger.log('Collector starting...');
        // do {
        //     await new Promise((resolve) => setImmediate(resolve));
        // } while (!this.ystuServiec.isLoaded);

        await this.startLoop();

        this.logger.log('Collector started');
    }

    /**
     * Update teachers and auditories every 5 minutes
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
                const auditoriesData = await this.ystuProvider.getAuditories(
                    false,
                );
                if (auditoriesData.length === 0) {
                    throw new Error('Empty array for auditories');
                }
                this.auditoriesData = auditoriesData;
            } catch (err) {
                this.logger.error(err);
            }

            setImmediate(loop);
        };
        await loop(true);
    }

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

    public async getAuditories() {
        return this.auditoriesData.map((e) => ({ id: e.id, name: e.name }));
    }

    public async getScheduleByAuditory(
        nameOrId: string | number,
        bypassCache: boolean = false,
    ) {
        let auditory: IAuditoryData = null;
        if (typeof nameOrId === 'number' || !isNaN(Number(nameOrId))) {
            auditory = this.auditoriesData.find(
                (e) => e.id === Number(nameOrId),
            );
        } else {
            auditory = this.auditoriesData.find((e) =>
                e.name.toLowerCase().includes(nameOrId.toLowerCase()),
            );
        }

        if (!auditory) {
            return null;
        }

        const items = await this.ystuProvider.getScheduleByAuditory(
            auditory.id,
            bypassCache,
        );
        return { auditory: { id: auditory.id, name: auditory.name }, items };
    }
}
