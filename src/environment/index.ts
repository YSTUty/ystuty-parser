import { resolve } from 'path';
import { config } from 'dotenv';

const repoBranch = '';

config({ path: resolve(process.cwd(), `.env${repoBranch ? `.${repoBranch}` : ''}`) });

export enum EnvType {
    DEV = 'development',
    PROD = 'production',
    TEST = 'testing',
}

// environment
export const NODE_ENV: EnvType = (process.env.NODE_ENV as EnvType) || EnvType.DEV;

export const LOG_PATH: string = process.env.LOG_PATH || './logs/all.log';
export const INSTANCE_NAME: string = process.env.INSTANCE_NAME || 'ystuty';

// Application
export const SERVER_PORT: number = +process.env.SERVER_PORT || 7576;
