import {
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { cacheManager } from '@my-common';

import { YSTUProvider } from './ystu.provider';

@Injectable()
export class YSTUService implements OnModuleInit {
    private readonly logger = new Logger(YSTUService.name);

    constructor(private readonly ystuProvider: YSTUProvider) {}

    public isLoaded = false;
    public instituteLinks: IInstituteData[] = [];

    async onModuleInit() {
        this.logger.log('Start initializing provider...');
        await this.ystuProvider.init();
        this.logger.log('Initializing provider finished');
    }

    public async getMe() {
        // if (!this.isLoaded) {
        //     throw new BadRequestException('wait for app initialization');
        // }

        return this.ystuProvider.authorizedUser;
    }
}
