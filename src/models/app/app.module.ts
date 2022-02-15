import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { YSTUModule } from '../ystu/ystu.module';

@Module({
    imports: [YSTUModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
