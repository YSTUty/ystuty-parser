import 'dotenv/config';
// import { ExtractJwt } from 'passport-jwt';

export enum EnvType {
    DEV = 'development',
    PROD = 'production',
    TEST = 'testing',
}

// environment
export const NODE_ENV: EnvType =
    (process.env.NODE_ENV as EnvType) || EnvType.DEV;

export const CACHE_PATH: string = process.env.CACHE_PATH || './.cache-store';
export const INSTANCE_NAME: string =
    process.env.INSTANCE_NAME || 'ystuty-parser';

// Application
export const APP_NAME: string = process.env.MAIN_NAME || 'YSTUty Parser';
export const APP_DOMAIN: string = process.env.MAIN_DOMAIN || '127.0.0.1';
export const SERVER_PORT: number = +process.env.SERVER_PORT || 8080;
export const SERVER_URL: string =
    process.env.SERVER_URL || `http://${APP_DOMAIN}:${SERVER_PORT}`;

export const SERVER_URL_NEW: string | null = process.env.SERVER_URL_NEW || null;
export const SERVER_URL_ICAL_NEW: string | null =
    process.env.SERVER_URL_ICAL_NEW || null;
export const REDIRECT_TO_NEW_ICAL: number =
    +process.env.REDIRECT_TO_NEW_ICAL || null;

export const YSTU_URL: string = process.env.YSTU_URL || 'https://www.ystu.ru';
export const YSTU_HTTP_TIMEOUT: number = +process.env.YSTU_HTTP_TIMEOUT || 10e3;

export const YSTU_DISABLE_USERINFO: boolean =
    process.env.YSTU_DISABLE_USERINFO === 'true';

// ? What will happen after the overflow of 9999?
export const YSTU_RASPZ_ID_ALL: number[] = (process.env.YSTU_RASPZ_ID_ALL || '')
    .split(',')
    .map((e) => Number(e))
    .filter(Boolean);
export const YSTU_RASPZ_ID_EXTRA: number =
    +process.env.YSTU_RASPZ_ID_EXTRA || null;

// // Postgres
// export const POSTGRES_LOGGING: boolean = process.env.POSTGRES_LOGGING === 'true';
// export const POSTGRES_HOST: string = process.env.POSTGRES_HOST || '127.0.0.1';
// export const POSTGRES_PORT: number = +process.env.POSTGRES_PORT || 5432;
// export const POSTGRES_USER: string = process.env.POSTGRES_USER || 'admin';
// export const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD;
// export const POSTGRES_DATABASE: string = process.env.POSTGRES_DATABASE || 'ystuty';

// // Redis
// export const REDIS_HOST: string = process.env.REDIS_HOST || '127.0.0.1';
// export const REDIS_PORT: number = +process.env.REDIS_PORT || 6379;
// export const REDIS_USER: string = process.env.REDIS_USER;
// export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD;
// export const REDIS_DATABASE: number = +process.env.REDIS_DATABASE || 0;
// export const REDIS_CACHE_DURATION: number = +process.env.REDIS_CACHE_DURATION || 15e3;

// // JWT (jsonwebtoken)
// export const JWT_ACCESS_TOKEN_FN = ExtractJwt.fromAuthHeaderAsBearerToken();
// export const JWT_ACCESS_TOKEN_SECRET: string = process.env.JWT_ACCESS_TOKEN_SECRET || '';
// export const JWT_ACCESS_TOKEN_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || '2d';
// export const JWT_REFRESH_TOKEN_SECRET: string = process.env.JWT_REFRESH_TOKEN_SECRET || '';
// export const JWT_REFRESH_TOKEN_EXPIRATION_TIME: number =
//     +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || 60 * 60 * 24 * 30;

// // * Typeorm
// const typeormDefault = {
//     logging: POSTGRES_LOGGING,
//     host: POSTGRES_HOST,
//     port: POSTGRES_PORT,
//     username: POSTGRES_USER,
//     password: POSTGRES_PASSWORD,
//     database: POSTGRES_DATABASE,
// };
// const typeormEnviroment = {
//     [EnvType.DEV]: { ...typeormDefault },
//     [EnvType.TEST]: { ...typeormDefault },
//     [EnvType.PROD]: { ...typeormDefault },
// };

// export const TYPEORM = typeormEnviroment[NODE_ENV];

// // redis
// const redis_enviroment = {
//     host: REDIS_HOST,
//     port: REDIS_PORT,
//     username: REDIS_USER,
//     password: REDIS_PASSWORD,
//     db: REDIS_DATABASE,
// };

// export const REDIS = redis_enviroment;

// * Swagger
export const SWAGGER_ACCESS_USERNAME: string =
    process.env.SWAGGER_ACCESS_USERNAME || '';
export const SWAGGER_ACCESS_PASSWORD: string =
    process.env.SWAGGER_ACCESS_PASSWORD || '';

// export const METRIC_ACCESS_USERNAME: string = process.env.METRIC_ACCESS_USERNAME || '';
// export const METRIC_ACCESS_PASSWORD: string = process.env.METRIC_ACCESS_PASSWORD || '';

export const YSTU_USERNAME: string = process.env.YSTU_USERNAME || '';
export const YSTU_PASSWORD: string = process.env.YSTU_PASSWORD || '';

// * Cache maanger
/** Default cahce ttl (in seconds) */
export const CACHE_MANAGER_TTL: number =
    +process.env.CACHE_MANAGER_TTL || 60 * 60 * 24 * 3;
/** Default cahce ttl for http fetch (in seconds) */
export const CACHE_MANAGER_HTTP_FETCH_TTL: number =
    +process.env.CACHE_MANAGER_HTTP_FETCH_TTL || CACHE_MANAGER_TTL;

// * Collector
/** Max number of requests to YSTU server in one loop */
export const YSTU_COLLECTOR_QUEUE_CHUNK: number =
    +process.env.YSTU_COLLECTOR_QUEUE_CHUNK || 3;
/** Max attempts number of fail requests to YSTU server */
export const YSTU_COLLECTOR_RATE_LIMIT: number =
    +process.env.YSTU_COLLECTOR_RATE_LIMIT || 5;
/** Cooldown time for requests to YSTU server (in seconds) */
export const YSTU_COLLECTOR_RATE_LIMIT_COOLDOWN: number =
    +process.env.YSTU_COLLECTOR_RATE_LIMIT_COOLDOWN || 60 * 10;

// * Delays (in seconds)

// 6 hours
export const YSTU_DELAY_RASP_LINKS: number =
    +process.env.YSTU_DELAY_RASP_LINKS || 6 * 3600;

export const YSTU_COLLECTOR_DELAY_LOOP: number =
    +process.env.YSTU_COLLECTOR_DELAY_LOOP || 30 * 60;

export const YSTU_COLLECTOR_DELAY_UPDATER: number =
    +process.env.YSTU_COLLECTOR_DELAY_UPDATER || 5 * 60;

export const YSTU_COLLECTOR_DELAY_QUEUE: number =
    +process.env.YSTU_COLLECTOR_DELAY_QUEUE || 10;

export const APP_CACHE_CLEANER_DELAY: number =
    +process.env.APP_CACHE_CLEANER_DELAY || 2 * 60;

// * Proxy
export const PROXY_AGENT_URL: string = process.env.PROXY_AGENT_URL || null;
