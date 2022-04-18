import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import * as xEnv from '@my-environment';

import { YSTUController } from './ystu.controller';
import { YSTUProvider } from './ystu.provider';
import { YSTUService } from './ystu.service';

@Module({
    imports: [HttpModule.register({})],
})
export class YSTUModule {
    static register() {
        return {
            module: YSTUModule,
            ...(xEnv.YSTU_PASSWORD && {
                controllers: [YSTUController],
                providers: [YSTUService, YSTUProvider],
                exports: [YSTUService],
            }),
        };
    }
}
