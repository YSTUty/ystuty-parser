import { AudienceLesson } from './audience-lesson.entity';

export class AccumulativeSchedule {
    /** Номер аудитории */
    id: number;
    /** Название аудитории */
    name: string;
    /** Расписание */
    items: AudienceLesson[];
    /** Время обновления */
    time: number;
}
