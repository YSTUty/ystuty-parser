import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { IInstituteData } from '@my-interfaces';
import { cacheManager } from '@my-common';

import { YSTUProvider } from './ystu.provider';
import { YSTUCollector } from './ystu.collector';
import * as cherrioParser from './cherrio.parser';

import { OneWeek } from './entity/one-week.entity';
import { MixedDay } from './entity/mixed-day.entity';

@Injectable()
export class YSTUService implements OnModuleInit {
    private readonly logger = new Logger(YSTUService.name);

    constructor(
        private readonly ystuProvider: YSTUProvider,
        private readonly ystuCollector: YSTUCollector,
    ) {}

    public isLoaded = false;
    public instituteLinks: IInstituteData[] = [];
    public extramuralLinks: IInstituteData[] = [];

    async onModuleInit() {
        this.logger.log('Start initializing provider...');
        await this.ystuProvider.init();
        await this.ystuCollector.init();
        this.logger.log('Initializing provider finished');

        this.init().then();
    }

    public async init() {
        [this.instituteLinks, this.extramuralLinks] =
            await this.ystuProvider.getRaspZLinks();

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
        const file: [string, string] = ['schedule', name.toLowerCase()];
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
            useCache: true,
            bypassCache: true,
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
        // cache 1 day
        await cacheManager.update(file, items, 60 * 60 * 24);

        return { isCache: false, items };
    }
}
