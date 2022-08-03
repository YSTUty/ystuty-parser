import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as Iconv from 'iconv-lite';

import { cacheManager, md5 } from '@my-common';
import * as xEnv from '@my-environment';

import * as cherrioParser from './cherrio.parser';
import { InstituteLinkType } from '@my-interfaces';

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
                await cacheManager.update(COOKIES_FILE, {
                    cookies: this.cookies,
                });
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
            const lkstudResponse = await this.fetch('/WPROG/lk/lkstud.php', {
                useCache: false,
            });
            this.authorizedUser = cherrioParser.getName(lkstudResponse.data);
            this.logger.debug('Authorized user', this.authorizedUser);
        } catch (err) {
            this.logger.error(err);
        }
    }

    public fetch(
        url: string,
        options?: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache?: true;
            useReauth?: boolean;
        },
    ): Promise<AxiosResponse | { isCache: true; data: any }>;
    public fetch(
        url: string,
        options: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache: false;
            useReauth?: boolean;
        },
    ): Promise<AxiosResponse>;
    public async fetch(
        url: string,
        {
            method = 'GET',
            postData = {},
            axiosConfig = {},
            useCache = false,
            useReauth = true,
        }: {
            method?: Method;
            postData?: any;
            axiosConfig?: AxiosRequestConfig<any>;
            useCache?: boolean;
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
            const params = new URLSearchParams(postData);
            axiosConfig.data = params;
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
            file = [
                'web',
                `${url}_${method}_${md5(JSON.stringify(axiosConfig))}`,
            ];
            const isTimeout = await cacheManager.checkTimeout(file);

            if (isTimeout === false) {
                const { data } = await cacheManager.readData<{ data: string }>(
                    file,
                );
                if (!data.includes('input type="submit" name="login1"')) {
                    return { isCache: true, data };
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
                await cacheManager.update(file, { data: response.data });
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
            useCache: false,
        });

        // check content on `auth1.php`
        if (auth1Response.data.toLowerCase().includes('<a href="auth.php">')) {
            throw new Error('Wrong login:password');
        }

        const lkstudResponse = await this.fetch('/WPROG/lk/lkstud.php', {
            useCache: false,
        });
        const needAuth = lkstudResponse.request.path?.includes('auth.php');
        return !needAuth;
    }

    //

    public async getRaspZLinks() {
        const raspzResponse = await this.fetch('/WPROG/rasp/raspz.php', {
            useCache: true,
        });

        const [linkToFullList, linkToExtramural] =
            cherrioParser.getLink2FullList(raspzResponse.data);

        const [raspzListResponse, raspzListExtramuralResponse] =
            await Promise.all([
                linkToFullList &&
                    this.fetch(linkToFullList, { useCache: true }),
                linkToExtramural &&
                    this.fetch(linkToExtramural, { useCache: true }),
            ]);

        let instituteLinks: InstituteLinkType[] = [];
        if (raspzListResponse) {
            instituteLinks = cherrioParser.getInstituteLinks(
                raspzListResponse.data,
            );
            await cacheManager.update(
                ['links', 'instituteLinks'],
                instituteLinks,
            );
        }

        let extramuralLinks: InstituteLinkType[] = [];
        if (raspzListExtramuralResponse) {
            extramuralLinks = cherrioParser.getInstituteLinks(
                raspzListExtramuralResponse.data,
            );
            await cacheManager.update(
                ['links', 'extramuralLinks'],
                extramuralLinks,
            );
        }

        return [instituteLinks, extramuralLinks] as const;
    }
}
