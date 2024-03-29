import { createHash } from 'crypto';

export const md5 = (str: string) => createHash('md5').update(str).digest('hex');

export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export * from './filter/http-exception.filter';

export * from './pipe/validation-http.pipe';

export * from './util/cache-manager.util';
export * from './util/memory-size.util';
export * from './util/proxy-agent.util';
export * from './util/scheduler.util';
