/**
 * Данные об институте
 */
export interface IInstituteData {
    /**
     * Название института
     */
    name: string;
    /**
     * Массив групп
     */
    groups: IGroupData[];
}

/**
 * Данные о группе
 */
export interface IGroupData {
    /**
     * Название группы
     */
    name: string;
    /**
     * Ссылка на расписание группы
     */
    link: string;
    /**
     * Ссылка на расписание лекционной недели группы
     */
    linkLecture?: string;
}

/**
 * Тип четности недели для пары
 */
export enum WeekParityType {
    CUSTOM = 0,
    ODD = 1,
    EVEN = 2,
}

/**
 * Флаг типа пары
 */
export enum LessonFlags {
    None = 0,
    Lecture = 1 << 1,
    Practical = 1 << 2,
    Labaratory = 1 << 3,
    CourseProject = 1 << 4,
    Consultation = 1 << 5,
    Test = 1 << 6,
    DifferentiatedTest = 1 << 7,
    Exam = 1 << 8,
    Library = 1 << 9,
    ResearchWork = 1 << 10,
}

/**
 * Тип/номер дня недели
 */
export enum WeekNumberType {
    Monday = 0,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday = 6,
}

export type InstituteLinkType = {
    name: string;
    groups: {
        name: string;
        link: string;
        linkLecture: string;
    }[];
};