import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import * as xEnv from '@my-environment';

import { StudentView } from './entity/student.entity';
import { StudentMarkView } from './entity/student-mark.entity';
import { ScheduleView } from './entity/schedule.entity';

import { YidService } from './yid.service';
import { YidController } from './yid.controller';

@Module({
    imports: [],
})
export class YidModule {
    static register() {
        return {
            module: YidModule,
            ...(xEnv.TYPEORM_CONFIG_YID.host && {
                imports: [
                    TypeOrmModule.forRootAsync({
                        useFactory: async () => ({
                            ...xEnv.TYPEORM_CONFIG_YID,

                            autoLoadEntities: true,
                            entities: getMetadataArgsStorage().tables.map(
                                (t) => t.target,
                            ),
                        }),
                    }),
                    TypeOrmModule.forFeature([
                        StudentView,
                        StudentMarkView,
                        ScheduleView,
                    ]),
                ],
                controllers: [YidController],
                providers: [YidService],
            }),
        };
    }
}
