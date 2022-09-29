import { LessonFlags } from '@my-interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class AudienceLesson {
    /**
     * Порядковый номер пары на дню
     */
    number: number;
    /**
     * Временной интервал пары
     */
    timeRange: string;
    /**
     * Timestamp начала пары
     */
    startAt: string | Date;
    /**
     * Timestamp конца пары
     */
    endAt: string | Date;
    /**
     * Пара дистанционно
     */
    @ApiProperty({ type: Boolean })
    isDistant?: true;
    /**
     * Название предмета пары
     */
    lessonName: string;
    /**
     * Флаг типа пары
     */
    lessonType: LessonFlags;
    /**
     * Длительность пары в часах
     */
    duration: number;
    /**
     * Длительность пары в минутах
     */
    // durationMinutes: number;
    /**
     * Названия групп
     */
    groups: string[];
    /**
     * ФИО преподователя
     */
    teacherName: string;
}
