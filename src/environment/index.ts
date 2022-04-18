import { resolve } from 'path';
import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
// import { ExtractJwt } from 'passport-jwt';

const repoBranch = '';

config({
    path: resolve(process.cwd(), `.env${repoBranch ? `.${repoBranch}` : ''}`),
});

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

export const mssqlDefaults: DataSourceOptions = {
    type: 'mssql' as const,
    synchronize: false,
    logging: true,
    maxQueryExecutionTime: 3000,
    options: {
        encrypt: false,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1',
        },
    },
};

export const TYPEORM_CONFIG_YID = {
    ...mssqlDefaults,
    host: process.env.TYPEORM_YID_HOST,
    port: +process.env.TYPEORM_YID_PORT || 1433,
    username: process.env.TYPEORM_YID_USER,
    password: process.env.TYPEORM_YID_PASSWORD,
    database: process.env.TYPEORM_YID_DATABASE || 'master',
    schema: process.env.TYPEORM_YID_SCHEMA,
};

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
