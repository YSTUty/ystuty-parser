import { LessonFlags } from '@my-interfaces';

export class TeacherLesson {
    /**
     * Номер учебной недели
     */
    weekNumber: number;
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
     * Буква корпуса и номер аудитори
     */
    // auditories: string[];
    auditoryName?: string;
    /**
     * Названия групп
     */
    groups: string[];
}
