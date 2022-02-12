import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    getIp(ip: string): string {
        this.logger.log(`Getting IP (${ip})`);
        return `IP:${ip}`;
    }
}
