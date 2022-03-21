import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { YSTUModule } from '../ystu/ystu.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
    imports: [YSTUModule],
    controllers: [CalendarController],
    providers: [CalendarService],
})
export class CalendarModule {}
