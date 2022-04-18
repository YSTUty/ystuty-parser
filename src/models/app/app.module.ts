import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CalendarModule } from '../calendar/calendar.module';
import { YSTUModule } from '../ystu/ystu.module';
import { YidModule } from '../yid/yid.module';

@Module({
    imports: [
        YSTUModule.register(),
        CalendarModule.register(),
        YidModule.register(),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
