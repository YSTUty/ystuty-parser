import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CalendarModule } from '../calendar/calendar.module';
import { YSTUModule } from '../ystu/ystu.module';

@Module({
    imports: [YSTUModule.register(), CalendarModule.register()],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
