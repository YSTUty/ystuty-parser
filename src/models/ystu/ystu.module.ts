import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { YSTUController } from './ystu.controller';
import { YSTUProvider } from './ystu.provider';
import { YSTUService } from './ystu.service';

@Module({
    imports: [HttpModule.register({})],
    controllers: [YSTUController],
    providers: [YSTUService, YSTUProvider],
    exports: [YSTUService],
})
export class YSTUModule {}
