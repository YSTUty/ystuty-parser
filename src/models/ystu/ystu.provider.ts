import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as Iconv from 'iconv-lite';
import * as FormData from 'form-data';

import * as xEnv from '@my-environment';
import { cacheManager, md5 } from '@my-common';
import { InstituteLinkType } from '@my-interfaces';

import * as cherrioParser from './cherrio.parser';

export const COOKIES_FILE = 'cookies';

@Injectable()
export class YSTUProvider {
    private readonly logger = new Logger(YSTUProvider.name);

    private cookies: Record<string, any> = null;
    private authPayload = {
        login: xEnv.YSTU_USERNAME,
        password: xEnv.YSTU_PASSWORD,
    };

    public authorizedUser: {
        name: string;
        login?: string;
        group?: string;
    } = null;

    constructor(private readonly httpService: HttpService) {
        httpService.axiosRef.defaults.baseURL = xEnv.YSTU_URL;
        httpService.axiosRef.interceptors.request.use((config) => {
            if (!config.url.toLowerCase().includes('/WPROG/'.toLowerCase())) {
                return config;
            }
            config.responseType = 'arraybuffer';

            return config;
        });

        httpService.axiosRef.interceptors.response.use(async (response) => {
            if (
                !response.config.url
                    ?.toLowerCase()
                    .includes('/WPROG/'.toLowerCase())
            ) {
                return response;
            }

            response.data = Iconv.decode(response.data, 'cp1251');

            const setCookie = response.headers['set-cookie'] as string[];
            if (Array.isArray(setCookie)) {
                const cookies = setCookie.reduce((prev, str) => {
                    const [name, data] = str.split('=');
                    const [value] = data.split(';');
                    return { ...prev, [name]: value };
                }, {});

                Object.assign(this.cookies, cookies);
                await cacheManager.update(
                    COOKIES_FILE,
                    { cookies: this.cookies },
                    -1,
                );
                this.logger.debug('Updated cookies', this.cookies);
            }

            return response;
        });
    }

    public async init() {
        if (!this.cookies) {
            const { cookies } =
                (await cacheManager.readData(COOKIES_FILE)) || {};
            this.cookies = cookies;
        }

        if (!this.cookies) {
            this.cookies = {};
        }

        try {
            const lkstudResponse = await this.fetch('/WPROG/lk/lkstud.php');
            this.authorizedUser = cherrioParser.getName(lkstudResponse.data);
            if (!xEnv.YSTU_DISABLE_USERINFO) {
                this.logger.debug('Authorized user', this.authorizedUser);
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    public fetch<T = any, D = any>(
        url: string,
        options: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache: true | number;
            bypassCache?: boolean;
            useReauth?: boolean;
        },
    ): Promise<AxiosResponse<T, D> | { isCache: true; data: any }>;
    public fetch<T = any, D = any>(
        url: string,
        options?: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache?: false;
            bypassCache?: boolean;
            useReauth?: boolean;
        },
    ): Promise<AxiosResponse<T, D>>;
    public async fetch(
        url: string,
        {
            method = 'GET',
            postData = {},
            axiosConfig = {},
            useCache = false,
            bypassCache = false,
            useReauth = true,
        }: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache?: boolean | number;
            bypassCache?: boolean;
            useReauth?: boolean;
        } = {},
    ) {
        method = method.toUpperCase() as Method;

        if (!axiosConfig.headers) {
            axiosConfig.headers = {
                'Cache-Control': 'no-cache',
            };
        }

        if (method !== 'GET') {
            if (postData instanceof FormData) {
                axiosConfig.headers = postData.getHeaders(axiosConfig.headers);
                axiosConfig.data = postData.getBuffer();
            } else {
                const params = new URLSearchParams(postData);
                axiosConfig.data = params.toString();
            }
        }

        if (this.cookies) {
            const cookies = Object.entries(this.cookies)
                .map(([k, v]) => `${k}=${v}`)
                .join('; ')
                .trim();
            if (axiosConfig.headers['Cookie']) {
                axiosConfig.headers['Cookie'] += `; ${cookies}`;
            } else {
                axiosConfig.headers['Cookie'] = cookies;
            }
        }

        axiosConfig.params = method === 'GET' ? postData : {};
        axiosConfig.url = url;
        axiosConfig.method = method;

        let file: [string, string];
        if (useCache) {
            const cloneConfig = JSON.parse(JSON.stringify(axiosConfig));
            // * to bypass duplicate caches from different PHPSESSID
            delete cloneConfig?.['headers'];
            const hash = md5(JSON.stringify(cloneConfig));
            file = ['web', `${url}_${method}_${hash}`];
            if (!bypassCache) {
                const isTimeout = await cacheManager.checkTimeout(file);

                if (isTimeout === false) {
                    const { data } = await cacheManager.readData<{
                        data: string;
                    }>(file);
                    if (!data.includes('input type="submit" name="login1"')) {
                        return { isCache: true, data };
                    }
                }
            }
        }

        try {
            let response = await firstValueFrom(
                this.httpService.request(axiosConfig),
            );

            // TODO: check content `site is blocked`

            if (
                useReauth &&
                response.data.includes('input type="submit" name="login1"')
            ) {
                this.logger.debug('Reauthorization attempt...');

                const success = await this.startAuth();
                if (!success) {
                    throw new Error('Failed auth');
                }
                response = await firstValueFrom(
                    this.httpService.request(axiosConfig),
                );
            }

            if (useCache) {
                this.logger.debug(`[fetch] Update cache: ${url.slice(0, 35)}`);
                await cacheManager.update(
                    file,
                    { data: response.data },
                    typeof useCache === 'boolean' ? 60 * 30 : useCache,
                );
            }
            return response;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            return err as AxiosResponse;
        }
    }

    public async startAuth() {
        if (Object.values(this.authPayload).some((e) => e.length < 2)) {
            return false;
        }

        const auth1Response = await this.fetch('/WPROG/auth1.php', {
            method: 'POST',
            postData: {
                ...this.authPayload,
                codeYSTU: Date.now() % 11e9,
            },
        });

        // check content on `auth1.php`
        if (auth1Response.data.toLowerCase().includes('<a href="auth.php">')) {
            throw new Error('Wrong login:password');
        }

        const lkstudResponse = await this.fetch('/WPROG/lk/lkstud.php');
        const needAuth = lkstudResponse.request.path?.includes('auth.php');
        return !needAuth;
    }

    //

    public async getRaspZLinks() {
        let linkToFullList: string = null;
        let linkToExtramural: string = null;
        let linkToAdditionalLecture: string = null;

        if (!xEnv.YSTU_RASPZ_ID && !xEnv.YSTU_RASPZ_ID_EXTRA) {
            const raspzResponse = await this.fetch('/WPROG/rasp/raspz.php', {
                useCache: true,
            });

            [linkToFullList, linkToExtramural] = cherrioParser.getLink2FullList(
                raspzResponse.data,
            );
        } else {
            linkToFullList =
                xEnv.YSTU_RASPZ_ID &&
                `/WPROG/rasp/raspz.php?IDraspz=xxx${xEnv.YSTU_RASPZ_ID}xxx`;
            linkToExtramural =
                xEnv.YSTU_RASPZ_ID_EXTRA &&
                `/WPROG/rasp/raspz.php?IDraspz=xxx${xEnv.YSTU_RASPZ_ID_EXTRA}xxx`;
        }

        if (xEnv.YSTU_RASPZ_ID_LECTURE_ADDITIONAL) {
            linkToAdditionalLecture = `/WPROG/rasp/raspz.php?IDraspz=xxx${xEnv.YSTU_RASPZ_ID_LECTURE_ADDITIONAL}xxx`;
        }

        const [
            raspzListResponse,
            raspzListExtramuralResponse,
            raspzListAdditionalLectureResponse,
        ] = await Promise.all([
            linkToFullList && this.fetch(linkToFullList, { useCache: true }),
            linkToExtramural &&
                this.fetch(linkToExtramural, { useCache: true }),
            linkToAdditionalLecture &&
                this.fetch(linkToAdditionalLecture, { useCache: true }),
        ]);

        let instituteLinks: InstituteLinkType[] = [];
        if (raspzListResponse) {
            const response = cherrioParser.getInstituteLinks(
                raspzListResponse.data,
            );
            instituteLinks = response.links;
            let scheduleName = response.name;
            this.logger.log(
                `Getting schedule for "instituteLinks": ${scheduleName}`,
            );

            if (raspzListAdditionalLectureResponse) {
                try {
                    const response = cherrioParser.getInstituteLinks(
                        raspzListAdditionalLectureResponse.data,
                    );
                    const instituteLinks2 = response.links;
                    let scheduleName = response.name;
                    this.logger.log(
                        `Getting additional lecture schedule for "instituteLinks": ${scheduleName}`,
                    );
                    for (const institute2 of instituteLinks2) {
                        const institute = instituteLinks.find(
                            (e) => e.name === institute2.name,
                        );
                        if (institute) {
                            for (const group2 of institute2.groups) {
                                const group = institute.groups.find(
                                    (e) => e.name === group2.name,
                                );
                                if (group) {
                                    group.linksLecture.push(group2.link);
                                }
                            }
                        }
                    }
                } catch (err) {
                    this.logger.warn(
                        'Error on getting additional lecture schedule',
                    );
                    this.logger.error(err);
                }
            }
            await cacheManager.update(
                ['links', 'instituteLinks'],
                instituteLinks,
            );
        }

        let extramuralLinks: InstituteLinkType[] = [];
        if (raspzListExtramuralResponse) {
            const response = cherrioParser.getInstituteLinks(
                raspzListExtramuralResponse.data,
            );
            extramuralLinks = response.links;
            let scheduleName = response.name;
            this.logger.log(
                `Getting schedule for "extramuralLinks": ${scheduleName}`,
            );
            await cacheManager.update(
                ['links', 'extramuralLinks'],
                extramuralLinks,
            );
        }

        return [instituteLinks, extramuralLinks] as const;
    }

    public getDatt() {
        // TODO: improve it
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        return {
            datt0: month > 7 ? `01.08.${year}` : `01.02.${year}`,
            datt1: month > 7 ? `01.02.${year + 1}` : `01.08.${year}`,
        };
    }

    public async getTeachers(bypassCache: boolean = false) {
        const { datt0, datt1 } = this.getDatt();
        const postData = new FormData();
        postData.append('datt0', datt0);
        postData.append('datt1', datt1);
        postData.append('rprep', '');

        const raspz_prepResponse = await this.fetch(
            '/WPROG/rasp/raspz_prep.php',
            {
                useCache: true,
                bypassCache,
                method: 'POST',
                postData,
                axiosConfig: { timeout: 10e3 },
            },
        );
        const html = raspz_prepResponse?.data;

        const teachersData = await cherrioParser.getTeachersScheduleFormData(
            html,
        );

        return teachersData;
    }

    public async getAudiences(bypassCache: boolean = false) {
        const { datt0, datt1 } = this.getDatt();
        const postData = new FormData();
        postData.append('datt0', datt0);
        postData.append('datt1', datt1);
        postData.append('raudi', '');

        const raspz_prepResponse = await this.fetch(
            '/WPROG/rasp/raspz_prep.php',
            {
                useCache: true,
                bypassCache,
                method: 'POST',
                postData,
                axiosConfig: { timeout: 10e3 },
            },
        );
        const html = raspz_prepResponse?.data;

        const audiencesData = await cherrioParser.getAudiencesScheduleFormData(
            html,
        );

        return audiencesData;
    }

    public async getScheduleByTeacher(
        teacherId: number,
        bypassCache: boolean = false,
    ) {
        const { datt0, datt1 } = this.getDatt();
        const postData = { datt0, datt1, idprep: teacherId };

        const raspz_prep1Response = await this.fetch(
            '/WPROG/rasp/raspz_prep1.php',
            {
                useCache: true,
                bypassCache,
                method: 'POST',
                postData,
                axiosConfig: { timeout: 10e3 },
            },
        );

        const html = raspz_prep1Response?.data;
        const teacherSchedule = await cherrioParser.getTeacherSchedule(html);
        return teacherSchedule;
    }

    public async getScheduleByAudience(
        audienceId: number,
        bypassCache: boolean = false,
    ) {
        const { datt0, datt1 } = this.getDatt();
        const postData = { datt0, datt1, idaudi: audienceId };

        const raspz_prep1Response = await this.fetch(
            '/WPROG/rasp/raspz_prep1.php',
            {
                useCache: true,
                bypassCache,
                method: 'POST',
                postData,
                axiosConfig: { timeout: 10e3 },
            },
        );

        const html = raspz_prep1Response?.data;
        const audienceSchedule = await cherrioParser.getAudienceSchedule(html);
        return audienceSchedule;
    }
}
