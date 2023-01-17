import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { LessonFlags, WeekNumberType, WeekParityType } from '@my-interfaces';

import { Lesson } from './entity/lesson.entity';
import { MixedDay } from './entity/mixed-day.entity';
import { OneDay } from './entity/one-day.entity';
import { OneWeek } from './entity/one-week.entity';
import { AudienceLesson } from './entity/audience-lesson.entity';
import { TeacherLesson } from './entity/teacher-lesson.entity';
import { ExamDay } from './entity/exam-day.entity';

export const parseRange = (str: string) => {
    return JSON.parse(
        `[${str.replace(/(\d+)-(\d+)/g, (range, start: number, end: number) =>
            Array(end - start + 1)
                .fill(+start)
                .map((x, i) => x + i)
                .toString(),
        )}]`,
    ) as number[];
};

const RegExpWeek =
    /((?<weekParity>ч|н)\/н )?((?<weekRange>[,\-0-9]+)н)( \((?<weekDistParity>(ч|н)\/н )?((?<weekDistRange>[,\-0-9]+)н) дистант\))?/i;
const RegExpTime =
    /(?<number>[0-9])\. (?<start>[0-9:]{4,5})-((?<end>[0-9:]{4,5})?([.]{3}(?<duration>[0-9]{1,3})ч)?)/i;

export const parseDayLesson = (str: string[]) => {
    const [_time, _weeks, _title, _type, _audit, _teacher] = str;

    let timeInfo = _time.match(RegExpTime).groups;

    // * number
    let number = Number(timeInfo.number) || 0;
    // Смещаем номер пары из-за большого перерыва
    if (number > 2 || number > 7) {
        --number;
    }

    let parity = WeekParityType.CUSTOM;
    let range: number[] = [];
    let rangeDist: number[] = [];

    if (_weeks) {
        const { weekParity, weekRange, weekDistParity, weekDistRange } =
            _weeks.match(RegExpWeek).groups;

        parity =
            weekParity === 'н'
                ? WeekParityType.ODD
                : weekParity === 'ч'
                ? WeekParityType.EVEN
                : WeekParityType.CUSTOM;
        range = weekRange
            ? parseRange(weekRange).filter(
                  (weekNumber) =>
                      parity === WeekParityType.CUSTOM ||
                      weekNumber % 2 !== parity - 1,
              )
            : [];

        const distParity: WeekParityType =
            weekDistParity === 'н'
                ? WeekParityType.ODD
                : weekDistParity === 'ч'
                ? WeekParityType.EVEN
                : WeekParityType.CUSTOM;
        rangeDist = weekDistRange
            ? parseRange(weekDistRange).filter(
                  (weekNumber) =>
                      distParity === WeekParityType.CUSTOM ||
                      weekNumber % 2 !== distParity - 1,
              )
            : [];
    }

    // *
    const lessonName = _title.trim();

    // TODO: add more support condiitions
    // * => 'лаб. 4ч по п/г пр.з.4ч, с 8н лаб'
    // * => 'лек. пр.з., с 16н.лаб.4ч,'
    // * => 'лек. TEAMS пр.з.,'
    // * => 'лек. TEAMS пр.з.+ лаб., +,'
    // * => 'лаб.* по п/г 3-5н. пр.з.4ч,'
    // * => 'лек. 4ч пр.з.4ч+,'

    const typeRegExp = new RegExp(
        '(?<types>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?)?(?<star>\\*)?' +
            '( ?(?<duration>[0-9]+)ч)?' +
            '( ?(?<delim>по п\\/г))?' +
            '( ?(?<online>\\(онлайн\\)))?' +
            '(,? ?(\\+ ?)?(?<types2>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?))?' +
            '(,? ?(\\+ ?)?(?<types3>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?))?' +
            '(,? ?(\\+ ?)?(?<types4>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?))?' +
            '(,? ?(\\+ ?)?(?<types5>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?))?' +
            '(,? ?\\(\\+(?<types6>teams|лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.?зач\\.?|экз\\.?)\\))?' +
            ',?\\+?' +
            '( ?(?<subInfo>.*))?',
        'i',
    );

    const typeGroups = _type.match(typeRegExp).groups || {};
    const duration = Number(typeGroups.duration) || 2;
    const isStream = !!typeGroups.star;
    const isDivision = !!typeGroups.delim;
    const isOnline = !!typeGroups.online;
    const subInfo = typeGroups.subInfo;

    let durationMinutes = ((f) => f * 90 + (f - 1) * 10)(
        Math.floor(duration / 2),
    );

    const ds = timeInfo.start.split(':').map(Number);

    // 1 08:30-10:00
    // 2 10:10-11:40 * +30
    // 4 12:20-13:50
    // 5 14:00-15:30
    // 6 15:40-17:10 * +10
    // 7 17:30-19:00
    // 8 19:10-20:40
    if (duration > 2) {
        const dm = ds[0] * 60 + ds[1];
        durationMinutes +=
            dm > 11 * 60 + 40 - durationMinutes && dm < 12 * 60 + 20 ? 30 : 0;
        durationMinutes +=
            dm > 17 * 60 + 10 - durationMinutes && dm < 17 * 60 + 30 ? 10 : 0;
    }

    const dateTime = moment(timeInfo.start, 'HH:mm').add(durationMinutes, 'm');
    const endTime = dateTime.format('HH:mm');

    // * time
    const time = `${timeInfo.start}-${
        timeInfo.end || endTime || timeInfo.duration
    }`;

    let type: LessonFlags = [
        typeGroups.types || '',
        typeGroups.types2 || '',
        typeGroups.types3 || '',
        typeGroups.types4 || '',
        typeGroups.types5 || '',
        typeGroups.types6 || '',
    ]
        .flatMap((e) => e.split(','))
        .map((e) => e.trim().toLowerCase())
        .reduce(
            (prev, type) =>
                (prev |= type.includes('пр' /* 'пр.з' */)
                    ? LessonFlags.Practical
                    : type.includes('лек')
                    ? LessonFlags.Lecture
                    : type.includes('лаб')
                    ? LessonFlags.Labaratory
                    : type.includes('кп')
                    ? LessonFlags.CourseProject
                    : type.includes('конс')
                    ? LessonFlags.Consultation
                    : type.includes('диф')
                    ? LessonFlags.DifferentiatedTest
                    : type.includes('зач')
                    ? LessonFlags.Test
                    : type.includes('экз')
                    ? LessonFlags.Exam
                    : LessonFlags.None),
            LessonFlags.None,
        );

    const auditoryName = _audit.trim() /* .split(' ') */ || null;
    const teacherName = _teacher.trim() || null;

    const startAt = null;

    const subInfoLower = subInfo?.toLowerCase();
    if (subInfoLower) {
        let libraryStrings = [subInfoLower, lessonName.toLowerCase()];
        if (
            libraryStrings.some(
                (str) =>
                    str.includes('библ.') ||
                    str.includes('библиот') ||
                    str.includes('книговыдача'),
            )
        ) {
            type |= LessonFlags.Library;
        }
    }

    if (subInfoLower?.includes('teams') || isOnline) {
        if (rangeDist.length === 0) {
            rangeDist = [...range];
        }
    }

    if (type === LessonFlags.None) {
        // TODO: add more combinations
        if (lessonName.includes('исследовательская работа')) {
            type |= LessonFlags.ResearchWork;
        }
    }

    return {
        number,
        startAt,
        time,
        originalTimeTitle: _time,
        parity,
        range,
        rangeDist,
        lessonName,
        type,
        isStream,
        duration,
        durationMinutes,
        isDivision,
        auditoryName,
        teacherName,
        subInfo,
    } as Lesson;
};

export const parseWeekDay = (
    data: string[][],
    weekDayName: string,
    lessonDateStr?: string,
) => {
    const [titles, ...lessonsArr] = data[0]
        .map((_, i) => data.map((row) => row[i]))
        .filter((e) => e.some(Boolean));

    const day: MixedDay = {
        info: {
            name: weekDayName,
            type: getWeekDayTypeByName(weekDayName),
        },
        lessons: [],
    };

    // * Если у таблицы нет столбца с неделями, то дата указана в названии таблицы
    // if without 'weeks' column
    if (titles.length === 5) {
        if (lessonDateStr) {
            // * Set date by table name
            const [dateDay, month, year] = lessonDateStr.split('.').map(Number);
            day.info.date = new Date(Date.UTC(year, month - 1, dateDay));
            day.info.dateStr = lessonDateStr;
        }

        for (const lessonArr of lessonsArr) {
            if (lessonArr.length !== titles.length) {
                continue;
            }

            const dayLesson = parseDayLesson([
                ...lessonArr.slice(0, 1),
                null,
                ...lessonArr.slice(1),
            ]);
            day.lessons.push(dayLesson);
        }
        return day;
    }

    for (const lessonArr of lessonsArr) {
        if (lessonArr.length !== titles.length) {
            continue;
        }

        const dayLesson = parseDayLesson(lessonArr);
        day.lessons.push(dayLesson);
    }

    return day;
};

export const getMaxWeekNumber = (allDays: MixedDay[]) =>
    allDays.reduce(
        (lastMax, day) =>
            Math.max(lastMax, ...day.lessons.map((l) => Math.max(...l.range))),
        0,
    );

export const getMinWeekNumber = (allDays: MixedDay[]) =>
    allDays.reduce(
        (lastMin, day) =>
            Math.min(lastMin, ...day.lessons.map((l) => Math.min(...l.range))),
        99,
    );

export const splitLessonsDayByWeekNumber = (
    allDays: MixedDay[],
    weekNumber: number,
) => {
    const clone = JSON.parse(JSON.stringify(allDays)) as OneDay[];
    return clone.filter((day) => {
        if (weekNumber === null) {
            return true;
        }

        const lessons = day.lessons.filter((lesson) => {
            lesson.isDistant = lesson.rangeDist.includes(weekNumber);
            return (
                lesson.range.includes(weekNumber) &&
                (lesson.parity === WeekParityType.CUSTOM ||
                    weekNumber % 2 !== lesson.parity - 1)
            );
        });
        if (lessons.length < 1) {
            return false;
        }

        day.lessons = lessons;
        day.info = {
            ...day.info,
            // * Set fake date
            date: new Date(),
            parity:
                weekNumber % 2 === 0 ? WeekParityType.EVEN : WeekParityType.ODD,
            weekNumber,
        };

        return true;
    });
};

const getDateByWeek = (
    week: number,
    day: number = 0,
    year = new Date().getFullYear(),
) =>
    new Date(
        Date.UTC(
            year,
            0,
            2 + day + (week - 1) * 7 - new Date(year, 0, 1).getDay(),
        ),
    );

const getWeekDayTypeByName = (str: string) => {
    str = str.toLocaleLowerCase();
    return str.startsWith('пон') || str === 'пн'
        ? WeekNumberType.Monday
        : str.startsWith('втор') || str === 'вт'
        ? WeekNumberType.Tuesday
        : str.startsWith('сред') || str === 'ср'
        ? WeekNumberType.Wednesday
        : str.startsWith('чет') || str === 'чт'
        ? WeekNumberType.Thursday
        : str.startsWith('пят') || str === 'пт'
        ? WeekNumberType.Friday
        : str.startsWith('суб') || str === 'сб'
        ? WeekNumberType.Saturday
        : WeekNumberType.Sunday;
};

const createDateAsUTC = (date: Date, hours: number, minutes: number) =>
    new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hours,
        minutes,
    );

const setDaysDate = (
    allDays: OneDay[],
    weekNumber: number,
    offsetWeek: number = 0,
    semStartWeekDate: Date = getStartDateOfSemester(),
) => {
    for (const { info, lessons } of allDays) {
        if (/* !info.dateStr &&  */ weekNumber !== null) {
            info.date = getDateByWeek(
                weekNumber + offsetWeek,
                info.type,
                semStartWeekDate.getFullYear(),
            );
            // * Fix year after new year in autumn semester
            if (semStartWeekDate.getMonth() < 9 && info.date.getMonth() < 8) {
                info.date = getDateByWeek(weekNumber + offsetWeek, info.type);
            }

            info.dateStr = `${info.date
                .getDate()
                .toString()
                .padStart(2, '0')}.${(info.date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}.${info.date.getFullYear()}`;
        }

        for (const lesson of lessons) {
            const [hours, minutes] = lesson.time.split('-')[0].split(':');
            lesson.startAt = createDateAsUTC(
                info.date,
                Number(hours),
                Number(minutes),
            );
            lesson.endAt = new Date(
                lesson.startAt.getTime() + lesson.durationMinutes * 60e3,
            ).toISOString();
        }
    }
};

const dateSkipWeek = (skipWeeks: number, _date: Date = new Date()) => {
    const date = new Date(_date);
    date.setHours(0);
    const firstWeekday = date.getDay() || 7;
    // const monthWeek = Math.floor((date.getDate() + firstWeekday - 2) / 7) + 1;

    if (skipWeeks > 0) {
        if (firstWeekday > 0) {
            date.setHours(-24 * (firstWeekday - 1));
        }
        date.setHours(24 * 7 * skipWeeks);
    }
    // else if (monthWeek == 1 && firstWeekday > 4) {
    //     date.setHours(24 * (8 - firstWeekday));
    // }

    return date;
};

const getStartDateOfSemester = () => {
    const now = new Date();
    const semDate = new Date(
        now.getFullYear() - (now.getMonth() < 2 ? 1 : 0),
        (now.getMonth() < 2 || now.getMonth() > 7 ? 9 : 2) - 1,
        1,
    );

    // TODO: rewrite to moment

    const firstWeekday = semDate.getDay() || 7;
    if (firstWeekday > 5) {
        semDate.setHours(24 * (8 - firstWeekday));
    }

    return dateSkipWeek(semDate.getMonth() > 7 ? 0 : 1, semDate);
};

export const splitToWeeks = (
    allDays: MixedDay[],
    semStartWeekDate: Date = getStartDateOfSemester(),
) => {
    const semStartWeekMoment = moment(semStartWeekDate);
    const offsetWeek = semStartWeekMoment.week() - 1;

    if (allDays.some((day) => day.info.dateStr)) {
        const weeks: OneWeek[] = [];

        const splitWeekDays: MixedDay[][] = [];
        let week = 0;
        let lastWeekType: WeekNumberType = 0;
        for (const day of allDays) {
            if (!splitWeekDays[week]) {
                splitWeekDays[week] = [];
            }
            if (
                splitWeekDays[week].some(
                    (e) => e.info.type === day.info.type,
                ) ||
                day.info.type < lastWeekType
            ) {
                ++week;
                splitWeekDays[week] = [];
            }
            lastWeekType = day.info.type;
            day.info.weekNumber =
                moment(day.info.date).diff(semStartWeekMoment, 'weeks') + 1;

            splitWeekDays[week].push(day);
        }

        for (const days of splitWeekDays) {
            setDaysDate(days, null, null, semStartWeekDate);
            weeks.push({ number: days[0].info.weekNumber, days });
        }

        return weeks;
    }

    const minWeek = getMinWeekNumber(allDays);
    const maxWeek = getMaxWeekNumber(allDays);
    const weeks: OneWeek[] = [];

    for (let number = minWeek; number < maxWeek + 1; ++number) {
        const days = splitLessonsDayByWeekNumber(allDays, number);
        setDaysDate(days, number, offsetWeek, semStartWeekDate);
        weeks.push({ number, days });
    }

    return weeks;
};

type ParseTeacherDayCherrio = {
    (
        $: cheerio.CheerioAPI,
        row: cheerio.Element,
        datts: { datt0: string; datt1: string },
        byAudiences: boolean | undefined,
    ): TeacherLesson;
    (
        $: cheerio.CheerioAPI,
        row: cheerio.Element,
        datts: { datt0: string; datt1: string },
        byAudiences: true,
    ): AudienceLesson;
};

export const parseTeacherDayCherrio = ((
    $: cheerio.CheerioAPI,
    row: cheerio.Element,
    datts: { datt0: string; datt1: string },
    byAudiences = false,
) => {
    const $row = $(row);
    // * (1) Нед.
    const weekNumber = Number($row.find('td:nth-child(1)').text()) || null;
    // * (2) Дата
    const dateStr =
        $row.find('td:nth-child(2)').text()?.trim().split(' ') || null;
    // * (3) Пара (номер и время)
    // const time = $row.find('td:nth-child(3) > font').text()?.trim() || null;
    const timeStr = $row.find('td:nth-child(3)').text()?.trim() || null;
    // * (4) Группа
    const groups =
        $row.find('td:nth-child(4)').text()?.trim().split(' ') || null;
    // * (5) Дисциплина
    const lessonName = $row.find('td:nth-child(5)').text()?.trim() || null;
    // * (6) Вид занятий
    const lessonTypeStr =
        $row
            .find('td:nth-child(6)')
            .text()
            .replace(/ +(?= )/g, '')
            .trim() || null;
    // * (7) Аудитория
    const auditoryName = $row.find('td:nth-child(7)').text()?.trim() || null;
    // * (8) Преподаватели
    const teacherName = $row.find('td:nth-child(8)').text()?.trim() || null;

    const [number, timeRange] = (([a, b]) => [Number(a), b])(
        timeStr?.split(' '),
    );

    const TIME_REGEXP = /[0-9]{1,2}:[0-9]{1,2}/;

    const durationMinutes = 90;
    const durationHours = ((d) => Math.round((d + 10) / 50))(durationMinutes);
    const fixedTimeStart = (([e]) => (TIME_REGEXP.test(e) ? e : '00:00'))(
        timeRange.split('-'),
    );

    const [[, minMonth, minYear], [, maxMonth]] = ((d) =>
        d.map((e) => e.split('.').map(Number)))([datts.datt0, datts.datt1]);
    const lessonMonth = Number(dateStr[0].split('.')[1]);

    // * Исправление даты из-за отсутствия года в данных
    // ! Не будет работать с интервалом больше года
    const fixYear = minYear + (lessonMonth < minMonth ? 1 : 0);
    const startAt = moment(
        `${fixYear}.${dateStr[0]} ${fixedTimeStart}`,
        'YYYY.DD.MM hh:mm',
    )
        .utc()
        .toDate();
    const endAt = new Date(
        startAt.getTime() + durationMinutes * 60e3,
    ).toISOString();

    //

    const typeRegExp = new RegExp(
        '' +
            '(,? ?(\\+ ?)?(?<types2>teams|лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.зач\\.?|экз\\.?))?' +
            '(,? ?\\(?(\\+ ?)?(?<types3>teams|лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.?зач\\.?|экз\\.?)\\)?)?' +
            '(,? ?\\(?(\\+ ?)?(?<types4>teams|лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.?зач\\.?|экз\\.?)\\)?)?' +
            '(,? ?\\(?(\\+ ?)?(?<types5>teams|лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.?зач\\.?|экз\\.?)\\)?)?' +
            '(,? ?\\(?(\\+ ?)?(?<types6>teams|лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?|конс\\.?|зач\\.?|диф\\.?зач\\.?|экз\\.?)\\)?)?',
        'i',
    );

    const typeGroups = lessonTypeStr?.match(typeRegExp).groups || {};

    // const lessonType = lessonTypeStr
    //     .replace(/[()]/g, '')
    //     .replace(/ +(?= )/g, '')
    //     .split(',')
    //     .flatMap((e) => e.toLowerCase().split('+'))
    //     .map((e) => e.trim())
    //     .filter(Boolean);
    //     .reduce(...);

    let lessonType: LessonFlags = [
        typeGroups.types2 || '',
        typeGroups.types3 || '',
        typeGroups.types4 || '',
        typeGroups.types5 || '',
        typeGroups.types6 || '',
    ]
        .flatMap((e) => e.split(','))
        .map((e) => e.trim().toLowerCase())
        .reduce(
            (prev, type) =>
                (prev |= type.includes('пр' /* 'пр.з' */)
                    ? LessonFlags.Practical
                    : type.includes('лек')
                    ? LessonFlags.Lecture
                    : type.includes('лаб')
                    ? LessonFlags.Labaratory
                    : type.includes('кп')
                    ? LessonFlags.CourseProject
                    : type.includes('конс')
                    ? LessonFlags.Consultation
                    : type.includes('диф')
                    ? LessonFlags.DifferentiatedTest
                    : type.includes('зач')
                    ? LessonFlags.Test
                    : type.includes('экз')
                    ? LessonFlags.Exam
                    : LessonFlags.None),
            LessonFlags.None,
        );

    const payload = {
        number,
        timeRange,
        startAt,
        endAt,
        ...(auditoryName?.toLocaleLowerCase() === 'дистант' && {
            isDistant: true,
        }),
        lessonName,
        lessonType,
        duration: durationHours,
        // weekName: dateStr[1],
        // weekType: dateStr[1] ? getWeekDayTypeByName(dateStr[1]) : null,
        // date,
        // dateStr: dateStr[0],
        groups,
    };

    if (byAudiences) {
        payload['teacherName'] = teacherName;
        return payload as AudienceLesson;
    }

    payload['weekNumber'] = weekNumber;
    payload['auditoryName'] = auditoryName;
    return payload as TeacherLesson;
}) as ParseTeacherDayCherrio;

export const parseTeacherDays = (data: string[][]) => {
    const schedule: TeacherLesson[] = [];

    const [titles, ...lessonsStrArr] = data[0]
        .map((_, i) => data.map((row) => row[i]))
        .filter((e) => e.some(Boolean));

    // TODO: add merging of duplicate lessons

    return schedule;
};

export const injectExams = (
    schedule: (OneWeek | MixedDay)[],
    exams: {
        exam: ExamDay;
        teacherId: number;
        teacherName: string;
    }[],
    short: boolean,
) => {
    for (const { teacherName, exam } of exams) {
        let targetDay: OneDay | MixedDay = null;

        if (short) {
            targetDay = (schedule as MixedDay[]).find((day) =>
                day.lessons.some((e) =>
                    moment(e.startAt).isSame(exam.date, 'day'),
                ),
            );
        } else {
            let isFound = false;
            for (const { days } of schedule as OneWeek[]) {
                if (isFound) break;
                for (const day of days) {
                    if (
                        day.lessons.some((e) =>
                            moment(e.startAt).isSame(exam.date, 'day'),
                        )
                    ) {
                        targetDay = day;
                        isFound = true;
                        break;
                    }
                }
            }
        }

        const lessonFormat: Lesson = {
            startAt: exam.date,
            endAt: moment(exam.date).add(1, 'day').toDate(),

            number: null,
            time: null,
            parity: null,
            range: null,
            rangeDist: null,

            lessonName: exam.lessonName,
            type: LessonFlags.Exam,

            originalTimeTitle: null,
            isStream: false,
            duration: null,
            durationMinutes: null,
            isDivision: false,
            auditoryName: exam.auditoryName,
            teacherName,
        };

        if (targetDay) {
            targetDay.lessons.push(lessonFormat);
            continue;
        }

        const oneDayExam: OneDay = {
            info: { name: null },
            lessons: [lessonFormat],
        };

        if (!short) {
            const semStartWeekMoment = moment(getStartDateOfSemester());
            const weekNumber =
                moment(lessonFormat.startAt).diff(semStartWeekMoment, 'weeks') +
                1;
            const newWeek = {
                number: weekNumber,
                days: [oneDayExam],
            };
            const weekIndex = (schedule as OneWeek[]).findIndex(
                (e) => e.number === weekNumber,
            );
            if (weekIndex === -1) {
                (schedule as OneWeek[]).push(newWeek);
            } else {
                (schedule[weekIndex] as OneWeek).days.push(oneDayExam);
            }
        } else {
            (schedule as MixedDay[]).push(oneDayExam);
        }
    }
};
