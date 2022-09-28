import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { IInstituteData, ITeacherData, IAuditoryData } from '@my-interfaces';
import { cacheManager } from '@my-common';

import { YSTUProvider } from './ystu.provider';
import * as cherrioParser from './cherrio.parser';

import { OneWeek } from './entity/one-week.entity';
import { MixedDay } from './entity/mixed-day.entity';

@Injectable()
export class YSTUService implements OnModuleInit {
    private readonly logger = new Logger(YSTUService.name);

    constructor(private readonly ystuProvider: YSTUProvider) {}

    public isLoaded = false;
    public instituteLinks: IInstituteData[] = [];
    public extramuralLinks: IInstituteData[] = [];

    public teachersData: ITeacherData[] = [];
    public auditoriesData: IAuditoryData[] = [];

    async onModuleInit() {
        this.logger.log('Start initializing provider...');
        await this.ystuProvider.init();
        this.logger.log('Initializing provider finished');

        this.init().then();
    }

    public async init() {
        [this.instituteLinks, this.extramuralLinks] =
            await this.ystuProvider.getRaspZLinks();

        this.teachersData = await this.ystuProvider.getTeachers();
        this.auditoriesData = await this.ystuProvider.getAuditories();

        // ...
        this.isLoaded = true;
    }

    public async getMe() {
        // if (!this.isLoaded) {
        //     throw new BadRequestException('wait for app initialization');
        // }

        return this.ystuProvider.authorizedUser;
    }

    public async getInstitutes(withExtramural = false) {
        if (!this.isLoaded) {
            throw new BadRequestException('wait for app initialization');
        }

        return [
            ...this.instituteLinks.map((e) => ({
                name: e.name,
                groups: e.groups.map((e) => e.name),
            })),
            ...(withExtramural
                ? this.extramuralLinks.map((e) => ({
                      name: e.name,
                      groups: e.groups.map((e) => e.name),
                  }))
                : []),
        ];
    }

    public getGroups(onlyNames?: true, withExams?: boolean): Promise<string[]>;
    public getGroups(
        onlyNames: false,
        withExams?: boolean,
    ): Promise<
        {
            link: string;
            linksLecture?: string[];
            name: string;
        }[]
    >;
    public async getGroups(onlyNames = true, withExtramural = false) {
        if (!this.isLoaded) {
            throw new BadRequestException('wait for app initialization');
        }

        return [
            ...this.instituteLinks.reduce(
                (prev: string[], list) => [
                    ...prev,
                    ...list.groups.map(({ name, ...links }) =>
                        onlyNames ? name : { name, ...links },
                    ),
                ],
                [],
            ),
            ...(withExtramural
                ? this.extramuralLinks.reduce(
                      (prev: string[], list) => [
                          ...prev,
                          ...list.groups.map(({ name, ...links }) =>
                              onlyNames ? name : { name, ...links },
                          ),
                      ],
                      [],
                  )
                : []),
        ];
    }

    public getScheduleByGroup(
        name: string,
        short?: boolean,
    ): Promise<{ isCache: boolean; items: OneWeek[] }>;
    public getScheduleByGroup(
        name: string,
        short: true,
    ): Promise<{ isCache: boolean; items: MixedDay[] }>;
    public async getScheduleByGroup(name: string, short = false) {
        const file: [string, string] = ['schedule', name];
        const isTimeout = await cacheManager.checkTimeout(file);

        if (isTimeout === false) {
            const cacheData = await cacheManager.readData(file);
            if (cacheData.length) {
                return { isCache: true, items: cacheData };
            }
        }

        const groupInfo = (await this.getGroups(false, true)).find(
            (e) => e.name.toLowerCase() === name.toLowerCase(),
        );
        if (!groupInfo) {
            throw new NotFoundException('group not found by this name');
        }

        const scheduleResponse = await this.ystuProvider.fetch(groupInfo.link, {
            useCache: false,
        });
        const scheduleData = await cherrioParser.getSchedule(
            scheduleResponse.data,
            short,
        );

        const scheduleLectureData: (OneWeek | MixedDay)[] = [];
        if (groupInfo.linksLecture?.length > 0) {
            for (const link of groupInfo.linksLecture) {
                const scheduleLectureResponse = await this.ystuProvider.fetch(
                    link,
                    { useCache: false },
                );
                scheduleLectureData.push(
                    ...(await cherrioParser.getSchedule(
                        scheduleLectureResponse.data,
                        short,
                    )),
                );
            }
        }

        const items = [...scheduleLectureData, ...scheduleData];
        await cacheManager.update(file, items, 86400);

        return { isCache: false, items };
    }

    public async getTeachers() {
        return this.teachersData.map((e) => ({
            id: e.formData.idprep,
            name: e.teacherName,
        }));
    }

    public async getScheduleByTeacher(nameOrId: string | number) {
        let teacher: ITeacherData = null;
        if (typeof nameOrId === 'number' || !isNaN(Number(nameOrId))) {
            teacher = this.teachersData.find((e) => e.id === Number(nameOrId));
        } else {
            teacher = this.teachersData.find((e) =>
                e.teacherName.toLowerCase().includes(nameOrId.toLowerCase()),
            );
        }

        if (!teacher) {
            throw new NotFoundException('teacher not found by this name or id');
        }

        const raspz_prep1Response = await this.ystuProvider.fetch(
            '/WPROG/rasp/raspz_prep1.php',
            {
                useCache: true,
                method: 'POST',
                postData: teacher.formData,
                axiosConfig: { timeout: 10e3 },
            },
        );

        const html = raspz_prep1Response?.data;
        const teacherSchedule = await cherrioParser.getTeacherSchedule(html);
        return {
            teacher: { id: teacher.id, name: teacher.teacherName },
            items: teacherSchedule,
        };
    }

    public async getAuditories() {
        return this.auditoriesData.map((e) => ({ id: e.id, name: e.name }));
    }

    public async getScheduleByAuditory(nameOrId: string | number) {
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
            throw new NotFoundException(
                'auditory not found by this name or id',
            );
        }

        // TODO: improve it?
        const year = new Date().getFullYear();
        const postData = {
            datt0: `01.08.${year}`,
            datt1: `31.10.${year + 1}`,
            idaudi: auditory.id,
        };

        const raspz_prep1Response = await this.ystuProvider.fetch(
            '/WPROG/rasp/raspz_prep1.php',
            {
                useCache: true,
                method: 'POST',
                postData,
                axiosConfig: { timeout: 10e3 },
            },
        );

        const html = raspz_prep1Response?.data;
        const auditorySchedule = await cherrioParser.getAuditorySchedule(html);
        return {
            auditory: { id: auditory.id, name: auditory.name },
            items: auditorySchedule,
        };
    }
}
