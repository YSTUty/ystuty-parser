import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { ViewEntity, ViewColumn } from 'typeorm';

import { trimTransformer } from '../tools';

@ViewEntity({ name: 'raspzgrv' })
@Exclude()
export class ScheduleView {
    /** Schedule ID (not unique) */
    @Expose()
    @ViewColumn({ name: 'idz' })
    public sid: number;

    @Expose({ toClassOnly: true })
    @ApiHideProperty()
    @ViewColumn({ name: 'namegr', transformer: trimTransformer })
    public groupName: string;

    @Expose()
    @ViewColumn({ name: 'dat' })
    public date: Date;

    @Expose()
    @ViewColumn({ name: 'namepar' })
    public timePeriod: string;

    @Expose()
    @ViewColumn({ name: 'textz' })
    public conetnt: string;

    @Expose({ toClassOnly: true })
    @ApiHideProperty()
    @ViewColumn({ name: 'lastload' })
    public lastload: Date;

    constructor(input?: Omit<Partial<ScheduleView>, 'toResponseObject'>) {
        if (input) {
            Object.assign(this, plainToClass(ScheduleView, input));
        }
    }
}
