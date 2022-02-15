import { resolve } from 'path';
import { config } from 'dotenv';

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
export const INSTANCE_NAME: string = process.env.INSTANCE_NAME || 'ystuty';

// Application
export const SERVER_PORT: number = +process.env.SERVER_PORT || 7576;

export const YSTU_USERNAME: string = process.env.YSTU_USERNAME || '';
export const YSTU_PASSWORD: string = process.env.YSTU_PASSWORD || '';
