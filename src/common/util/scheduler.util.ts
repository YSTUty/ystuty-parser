import { LessonFlags } from '@my-interfaces';

export const getLessonTypeStrArr = (type: LessonFlags) => {
    const types: string[] = [];
    if (type & LessonFlags.Lecture) types.push('Лек');
    if (type & LessonFlags.Practical) types.push('ПР');
    if (type & LessonFlags.Labaratory) types.push('ЛР');
    if (type & LessonFlags.CourseProject) types.push('КП');
    if (type & LessonFlags.Consultation) types.push('Консультация');
    if (type & LessonFlags.DifferentiatedTest) types.push('ДИФ.ЗАЧ');
    if (type & LessonFlags.Test) types.push('ЗАЧ');
    if (type & LessonFlags.Exam) types.push('ЭКЗ');
    if (type & LessonFlags.Library) types.push('Библиотека');
    if (type & LessonFlags.ResearchWork) types.push('НИР');
    if (type & LessonFlags.OrganizationalMeeting) types.push('Орг. собрание');
    if (type & LessonFlags.Unsupported) types.push('N/A');
    if (type & LessonFlags.None) types.push('???');
    return types;
};

export const normalizeScheduleLink = (link: string) => {
    const [url, queryStr] = link.split('?');
    const query = new URLSearchParams(queryStr);
    for (const [key, value] of query) {
        if (
            !['raspz', 'idgr'].some((e) => key.includes(e)) ||
            isNaN(+value) ||
            value.length < 9
        ) {
            continue;
        }
        const targetNum = value.slice(3, -3);
        query.set(key, `xxx${targetNum}xxx`);
    }
    return [url, query.toString()].join('?');
};
