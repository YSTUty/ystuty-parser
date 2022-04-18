import { Module } from '@nestjs/common';
import * as xEnv from '@my-environment';

import { YSTUModule } from '../ystu/ystu.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
    imports: [YSTUModule.register()],
})
export class CalendarModule {
    static register() {
        return {
            module: CalendarModule,
            ...(xEnv.YSTU_PASSWORD && {
                controllers: [CalendarController],
                providers: [CalendarService],
            }),
        };
    }
}
