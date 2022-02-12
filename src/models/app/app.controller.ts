import { Controller, Get } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';

import { AppService } from './app.service';

@Controller('/api')
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
}
