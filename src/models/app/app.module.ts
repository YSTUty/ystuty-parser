import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { YSTUModule } from '../ystu/ystu.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
    imports: [YSTUModule, CalendarModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
