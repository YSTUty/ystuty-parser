import { Controller, Get } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { cacheManager, formatByteSize, memorySizeOf } from '@my-common';

import { AppService } from './app.service';

const { version } = require('../../../package.json');

@Controller('/app')
export class AppController {
    public readonly timeStart = Date.now();

    constructor(private readonly appService: AppService) {}

    @Get('ip')
    getIp(@RealIP() ipAddress: string) {
        return this.appService.getIp(ipAddress);
    }

    @Get('uptime')
    getTime() {
        return `uptime:${Date.now() - this.timeStart}`;
    }

    @Get('cache_size')
    getCacheSize() {
        const size = memorySizeOf(cacheManager['cache']);
        return {
            count: Object.keys(cacheManager['cache']).length,
            bytes: size,
            size: formatByteSize(size),
        };
    }

    @Get('v')
    getVersion() {
        return { version };
    }
}
