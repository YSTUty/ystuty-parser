import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { YSTUController } from './ystu.controller';
import { YSTUProvider } from './ystu.provider';
import { YSTUService } from './ystu.service';

@Module({
    imports: [HttpModule],
    controllers: [YSTUController],
    providers: [YSTUService, YSTUProvider],
})
export class YSTUModule {}