import { WeekNumberType, WeekParityType } from '@my-interfaces';

export class WeekDay {
    name: string;
    type: WeekNumberType;
    date?: Date;
    dateStr?: string;
    weekNumber?: number;
    parity?: WeekParityType;
}
