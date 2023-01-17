import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { IInstituteData } from '@my-interfaces';
import { cacheManager, delay } from '@my-common';

import { YSTUProvider } from './ystu.provider';
import { YSTUCollector } from './ystu.collector';
import * as cherrioParser from './cherrio.parser';
import * as scheduleParser from './schedule.parser';

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
        if (!(await this.ystuProvider.init())) {
            // throw new Error('Failed to initialize YSTU provider');
            this.logger.warn('Workink in offline mode');
        }
        await this.ystuCollector.init();
        this.logger.log('Initializing provider finished');

        this.startLoop().then(() => {
            this.isLoaded = true;
        });
    }

    private async startLoop() {
        const loop = async (first = false) => {
            if (!first) {
                // 12 hours delay
                await delay(12 * 3600 * 1e3);
            }

            try {
                [this.instituteLinks, this.extramuralLinks] =
                    await this.ystuProvider.getRaspZLinks();
            } catch (err) {
                this.logger.error(err);
            }

            setImmediate(loop);
        };
        await loop(true);
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
    ): Promise<IInstituteData['groups']>;
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
        forceCache?: boolean,
    ): Promise<{ isCache: boolean; items: OneWeek[] }>;
    public getScheduleByGroup(
        name: string,
        short: true,
        forceCache?: boolean,
    ): Promise<{ isCache: boolean; items: MixedDay[] }>;
    public async getScheduleByGroup(
        name: string,
        short = false,
        forceCache = false,
    ) {
        const file: [string, string] = [
            'schedule',
            `${name.toLowerCase()}-s_${short}`,
        ];
        const remainedTime = await cacheManager.checkTimeout(file, true);

        if (
            forceCache ||
            ((remainedTime === -1 || remainedTime > 60 * 5) &&
                Math.random() > 0.2)
        ) {
            const cacheData = await cacheManager.read(file);
            if (cacheData?.data.length) {
                // Prolong ttl if more than half the time has passed
                if (forceCache && remainedTime < cacheData.ttl / 2) {
                    await cacheManager.prolongTimeout(file);
                }
                return { isCache: true, items: cacheData.data };
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
            nullOnError: true,
        });
        if (!scheduleResponse) {
            if (!forceCache) {
                return await this.getScheduleByGroup(name, short, true);
            }
            throw new BadGatewayException(
                'connection problem with the YSTU server',
            );
        }

        const scheduleData = await cherrioParser.getSchedule(
            scheduleResponse.data,
            short,
        );

        const scheduleLectureData: (OneWeek | MixedDay)[] = [];
        if (groupInfo.extraLinks.length > 0) {
            scheduleLectureData.push(
                ...((
                    await Promise.all(
                        groupInfo.extraLinks.map((link) =>
                            this.ystuProvider
                                .fetch(link, {
                                    useCache: true,
                                    bypassCache: true,
                                    nullOnError: true,
                                })
                                .then(
                                    (e) =>
                                        e &&
                                        cherrioParser.getSchedule(
                                            e.data,
                                            short,
                                        ),
                                ),
                        ),
                    )
                )
                    .filter(Boolean)
                    .flat(1) as (OneWeek | MixedDay)[]),
            );
        }

        // TODO: sort by date
        const items = [...scheduleLectureData, ...scheduleData];

        const exams = await this.ystuCollector.getExamsSchedule(name);
        if (exams.length > 0) {
            scheduleParser.injectExams(items, exams, short);
        }

        // cache 1 day
        await cacheManager.update(file, items, 60 * 60 * 24);

        return { isCache: false, items };
    }
}
