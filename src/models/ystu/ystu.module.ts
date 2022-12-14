import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import * as xEnv from '@my-environment';
import { makeProxy } from '@my-common';

import { YSTUController } from './ystu.controller';
import { YSTUProvider } from './ystu.provider';
import { YSTUService } from './ystu.service';
import { YSTUCollector } from './ystu.collector';

const [proxyType, httpsAgent] = makeProxy();

@Module({
    imports: [
        HttpModule.register({
            httpsAgent,
            httpAgent: httpsAgent,
        }),
    ],
})
export class YSTUModule {
    private static readonly logger = new Logger(YSTUModule.name);

    static register() {
        this.logger.log('YSTU module registered');
        if (proxyType !== 'https') {
            this.logger.log(`HTTP Agent using "${proxyType}"`);
        }

        return {
            module: YSTUModule,
            ...(xEnv.YSTU_PASSWORD && {
                controllers: [YSTUController],
                providers: [YSTUService, YSTUProvider, YSTUCollector],
                exports: [YSTUService, YSTUCollector],
            }),
        };
    }
}
