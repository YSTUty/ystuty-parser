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
import * as cherrioParser from './cherrio.parser';

import { OneWeek } from './entity/one-week.entity';
import { MixedDay } from './entity/mixed-day.entity';

@Injectable()
export class YSTUService implements OnModuleInit {
    private readonly logger = new Logger(YSTUService.name);

    constructor(private readonly ystuProvider: YSTUProvider) {}

    public isLoaded = false;
    public instituteLinks: IInstituteData[] = [];

    async onModuleInit() {
        this.logger.log('Start initializing provider...');
        await this.ystuProvider.init();
        this.logger.log('Initializing provider finished');

        this.init().then();
    }

    public async init() {
        this.instituteLinks = await this.ystuProvider.getInstituteLinks();

        // ...
        this.isLoaded = true;
    }

    public async getMe() {
        // if (!this.isLoaded) {
        //     throw new BadRequestException('wait for app initialization');
        // }

        return this.ystuProvider.authorizedUser;
    }

    public async getInstitutes() {
        if (!this.isLoaded) {
            throw new BadRequestException('wait for app initialization');
        }

        return this.instituteLinks.map((e) => ({
            name: e.name,
            groups: e.groups.map((e) => e.name),
        }));
    }

    public getGroups(onlyNames?: true): Promise<string[]>;
    public getGroups(onlyNames: false): Promise<
        {
            link: string;
            linkLecture?: string;
            name: string;
        }[]
    >;
    public async getGroups(onlyNames = true) {
        if (!this.isLoaded) {
            throw new BadRequestException('wait for app initialization');
        }

        return this.instituteLinks.reduce(
            (prev: string[], list) => [
                ...prev,
                ...list.groups.map(({ name, ...links }) =>
                    onlyNames ? name : { name, ...links },
                ),
            ],
            [],
        );
    }

    public getByGroup(
        name: string,
        short?: boolean,
    ): Promise<{ isCache: boolean; items: (OneWeek | MixedDay)[] }>;
    public getByGroup(
        name: string,
        short: true,
    ): Promise<{ isCache: boolean; items: MixedDay[] }>;
    public async getByGroup(name: string, short = false) {
        const file: [string, string] = ['schedule', name];
        const isTimeout = await cacheManager.checkTimeout(file);

        if (isTimeout === false) {
            const cacheData = await cacheManager.readData(file);
            if (cacheData.length) {
                return { isCache: true, items: cacheData };
            }
        }

        const groupInfo = (await this.getGroups(false)).find(
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
        if (groupInfo.linkLecture) {
            const scheduleLectureResponse = await this.ystuProvider.fetch(
                groupInfo.linkLecture,
                { useCache: false },
            );
            scheduleLectureData.push(
                ...(await cherrioParser.getSchedule(
                    scheduleLectureResponse.data,
                    short,
                )),
            );
        }

        const items = [...scheduleLectureData, ...scheduleData];
        await cacheManager.update(file, items, 86400);

        return { isCache: false, items };
    }
}
