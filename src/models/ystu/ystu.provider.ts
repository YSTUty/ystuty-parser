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

const hasLogin1 = 'input type="submit" name="login1"'.toLowerCase();

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
        httpService.axiosRef.defaults.timeout = xEnv.YSTU_HTTP_TIMEOUT;

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

            await this.updateCookies(response.headers['set-cookie']);

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
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }

    public tryInjectCookeis(
        headers?: Record<string, any>,
        setCookie?: string[],
    ) {
        let cookies = this.cookies;
        if (setCookie?.length > 0) {
            cookies = setCookie.reduce((prev, str) => {
                const [name, data] = str.split('=');
                const [value] = data.split(';');
                return { ...prev, [name]: value };
            }, {});
        }

        if (!cookies) {
            return null;
        }
        let cookiesStr = Object.entries(cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ')
            .trim();
        if (headers) {
            if (typeof headers['Cookie'] === 'string') {
                const cookieEntries = Object.entries(cookies);
                const oldCookies = headers['Cookie']
                    .split(';')
                    .map((e) => e.trim().split('='));

                for (const [name, value] of cookieEntries) {
                    const cookieIndex = oldCookies.findIndex(
                        ([n]) => n === name,
                    );
                    if (cookieIndex !== -1) {
                        oldCookies[cookieIndex][1] = value;
                    } else {
                        oldCookies.push([name, value]);
                    }
                }
                cookiesStr = oldCookies
                    .map(([k, v]) => `${k}=${v}`)
                    .join('; ')
                    .trim();
            }

            headers['Cookie'] = cookiesStr;
        }
        return cookiesStr;
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
            nullOnError?: boolean;
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
            nullOnError?: boolean;
        },
    ): Promise<AxiosResponse<T, D>>;
    public async fetch(
        url: string,
        options: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache?: boolean | number;
            bypassCache?: boolean;
            useReauth?: boolean;
            nullOnError?: boolean;
        } = {},
    ) {
        let {
            method = 'GET',
            postData = {},
            axiosConfig = {},
            useCache = false,
            bypassCache = false,
            useReauth = true,
            nullOnError = false,
        } = options;
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

        this.tryInjectCookeis(axiosConfig.headers);

        axiosConfig.beforeRedirect = (opts, responseDetails) => {
            let setCookie = responseDetails?.headers?.[
                'set-cookie'
            ] as unknown as string[];
            if (responseDetails.headers) {
                this.updateCookies(setCookie).then();
            }

            if (!('Cookies' in opts.headers)) {
                this.tryInjectCookeis(opts.headers, setCookie);
            }
        };

        axiosConfig.params = method === 'GET' ? postData : {};
        axiosConfig.url = url;
        axiosConfig.method = method;

        // this.logger.debug(`[Fetch] (${method}) "${url}"`, {
        //     postData,
        //     useCache,
        //     bypassCache,
        //     useReauth,
        //     axiosConfig,
        // });

        const getFilePath = () => {
            const cloneConfig = JSON.parse(JSON.stringify(axiosConfig));
            // * to bypass duplicate caches from different PHPSESSID
            delete cloneConfig?.['headers'];
            const hash = md5(JSON.stringify(cloneConfig));
            const file = ['web', `${url}_${method}_${hash}`] as [
                string,
                string,
            ];
            return file;
        };

        let file = useCache && getFilePath();

        const getCacheData = async (force = false, prolong = false) => {
            if (force || !bypassCache) {
                if (!file) {
                    file = getFilePath();
                }
                const remainedTime = await cacheManager.checkTimeout(
                    file,
                    true,
                );

                if (force || remainedTime === -1 || remainedTime > 0) {
                    const cacheData = await cacheManager.read<{
                        data: string;
                    } | null>(file);
                    if (
                        cacheData &&
                        !cacheData.data?.data.toLowerCase().includes(hasLogin1)
                    ) {
                        // Prolong ttl if more than half the time has passed
                        if (prolong && remainedTime < cacheData.ttl / 2) {
                            await cacheManager.prolongTimeout(
                                file /* , false */,
                            );
                        }
                        return { isCache: true, data: cacheData.data };
                    }
                }
            }
            return null;
        };

        if (useCache) {
            const cacheData = await getCacheData();
            if (cacheData) {
                return cacheData;
            }
        }

        try {
            let response = await firstValueFrom(
                this.httpService.request(axiosConfig),
            );

            // TODO: check content `site is blocked`

            if (useReauth && response.data.toLowerCase().includes(hasLogin1)) {
                this.logger.debug('Reauthorization attempt...');

                const success = await this.startAuth();
                if (!success) {
                    throw new Error('Failed auth');
                }
                return await this.fetch(url, options as any);
            }

            if (useCache) {
                this.logger.debug(`[fetch] Update cache: ${url.slice(0, 45)}`);
                await cacheManager.update(
                    file,
                    { data: response.data },
                    typeof useCache === 'boolean'
                        ? xEnv.CACHE_MANAGER_HTTP_FETCH_TTL
                        : useCache,
                );
            }
            return response;
        } catch (err) {
            if (!(err instanceof Error)) {
                return err as AxiosResponse;
            }

            if (
                ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNABORTED', 'timeout'].some(
                    (e) => err.message?.toLowerCase().includes(e.toLowerCase()),
                )
            ) {
                const cacheData = await getCacheData(true, true);
                if (cacheData) {
                    this.logger.warn(`Fetch: ${err.message}. Using cache...`);

                    return {
                        error: { message: err.message },
                        ...cacheData,
                    };
                }
            }

            if (nullOnError) {
                this.logger.error(
                    `Fetch fail: [${method}] "${err.message}" (${url.slice(
                        0,
                        45,
                    )})`,
                );
                return null;
            }

            throw err;
        }
    }

    private async updateCookies(setCookie: string[]) {
        if (!Array.isArray(setCookie)) {
            return;
        }
        const cookies = setCookie.reduce((prev, str) => {
            const [name, data] = str.split('=');
            const [value] = data.split(';');
            return { ...prev, [name]: value };
        }, {});

        Object.assign(this.cookies, cookies);
        await cacheManager.update(COOKIES_FILE, { cookies: this.cookies }, -1);
        this.logger.debug('Updated cookies', this.cookies);
    }

    public async startAuth() {
        if (Object.values(this.authPayload).some((e) => e.length < 2)) {
            return false;
        }

        const auth1Response = await this.fetch('/WPROG/auth1.php', {
            method: 'POST',
            postData: {
                ...this.authPayload,
                codeYSTU: Date.now() % 11e8,
            },
            useReauth: false,
        });

        if (auth1Response.data.toLowerCase().includes()) {
            throw new Error('FTW #45');
        }

        // check content on `auth1.php`
        if (auth1Response.data.toLowerCase().includes('<a href="auth.php">')) {
            throw new Error('Wrong login:password');
        }

        const lkstudResponse = await this.fetch('/WPROG/lk/lkstud.php', {
            useReauth: false,
        });
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
            linkToFullList &&
                this.fetch(linkToFullList, {
                    useCache: true,
                    nullOnError: true,
                }),
            linkToExtramural &&
                this.fetch(linkToExtramural, {
                    useCache: true,
                    nullOnError: true,
                }),
            linkToAdditionalLecture &&
                this.fetch(linkToAdditionalLecture, {
                    useCache: true,
                    nullOnError: true,
                }),
        ]);

        const institutePath = ['links', 'instituteLinks'] as [string, string];
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
            if (instituteLinks.length > 0) {
                await cacheManager.update(institutePath, instituteLinks, -1);
            }
        } else {
            instituteLinks = await cacheManager.readData(institutePath);
        }

        const extramuralPath = ['links', 'extramuralLinks'] as [string, string];
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
            if (extramuralLinks.length > 0) {
                await cacheManager.update(extramuralPath, extramuralLinks, -1);
            }
        } else {
            extramuralLinks = await cacheManager.readData(extramuralPath);
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
                nullOnError: true,
            },
        );
        if (!raspz_prepResponse) {
            return null;
        }

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
                nullOnError: true,
            },
        );
        if (!raspz_prepResponse) {
            return null;
        }

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
                nullOnError: true,
            },
        );
        if (!raspz_prep1Response) {
            return null;
        }

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
                nullOnError: true,
            },
        );
        if (!raspz_prep1Response) {
            return null;
        }

        const html = raspz_prep1Response?.data;
        const audienceSchedule = await cherrioParser.getAudienceSchedule(html);
        return audienceSchedule;
    }
}
