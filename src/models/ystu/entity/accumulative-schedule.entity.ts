import { AuditoryLesson } from './auditory-lesson.entity';

export class AccumulativeSchedule {
    /** Номер аудитории */
    id: number;
    /** Название аудитории */
    name: string;
    /** Расписание */
    items: AuditoryLesson[];
    /** Время обновления */
    time: number;
}
