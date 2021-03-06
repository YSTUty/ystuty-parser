import { LessonFlags, WeekParityType } from '@my-interfaces';

export class Lesson {
    /**
     * Порядковый номер пары на дню
     */
    number: number;
    /**
     * Временной интервал пары
     */
    time: string;
    /**
     * Timestamp начала пары
     */
    startAt?: string | Date;
    /**
     * Timestamp конца пары
     */
    endAt?: string | Date;
    /**
     * Оригинальная строка с порядковым номером пары на дню со интервалом времени
     */
    originalTimeTitle: string;
    /**
     * Тип четности пары
     */
    parity: WeekParityType;
    /**
     * Диапазон номеров недель с парой
     */
    range: number[];
    /**
     * Диапазон номеров недель с парой дистанционно
     */
    rangeDist: number[];
    /**
     * Пара дистанционно
     */
    isDistant?: boolean;
    /**
     * Название предмета пары
     */
    lessonName?: string;
    /**
     * Флаг типа пары
     */
    type: LessonFlags;
    /**
     * Занятия в потоке
     */
    isStream: boolean;
    /**
     * Длительность пары в часах
     */
    duration: number;
    /**
     * Длительность пары в минутах
     */
    durationMinutes: number;
    /**
     * Разделение по подгруппам
     */
    isDivision: boolean;
    /**
     * Буква корпуса и номер аудитори
     */
    auditoryName?: string;
    /**
     * ФИО преподователя
     */
    teacherName?: string;
    /**
     * Дополнительная информация
     */
    subInfo?: string;
}
