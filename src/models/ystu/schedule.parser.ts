import { LessonFlags, WeekNumberType, WeekParityType } from '@my-interfaces';
import { Lesson } from './entity/lesson.entity';
import { MixedDay } from './entity/mixed-day.entity';
import { OneDay } from './entity/one-day.entity';
import { OneWeek } from './entity/one-week.entity';

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
    /(?<number>[0-9])\. (?<start>[0-9:]{4,5})-((?<end>[0-9:]{4,5})?([.]{3}(?<ff>[0-9]{1,3})ч)?)/i;

export const parseDayLesson = (str: string[]) => {
    const [_time, _weeks, _title, _type, _audit, _teacher] = str;

    let timeInfo = _time.match(RegExpTime).groups;

    // * number
    let number = Number(timeInfo.number) || 0;
    // Смещаем номер пары из-за большого перерыва
    if (number > 2 || number > 7) {
        --number;
    }

    const { weekParity, weekRange, weekDistParity, weekDistRange } =
        _weeks.match(RegExpWeek).groups;

    const parity: WeekParityType =
        weekParity === 'н'
            ? WeekParityType.ODD
            : weekParity === 'ч'
            ? WeekParityType.EVEN
            : WeekParityType.CUSTOM;
    const range = weekRange
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
    const rangeDist = weekDistRange
        ? parseRange(weekDistRange).filter(
              (weekNumber) =>
                  distParity === WeekParityType.CUSTOM ||
                  weekNumber % 2 !== distParity - 1,
          )
        : [];

    // *
    const lessonName = _title.trim();

    const typeRegExp = new RegExp(
        '(?<types>лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?)?(?<star>\\*)?' +
            '( ?(?<duration>[0-9]+)ч)?' +
            '( ?(?<delim>по п\\/г))?' +
            '(,? ?(?<types2>лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?))?' +
            '(,? ?(?<types3>лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?))?' +
            '(,? ?(?<types4>лекция|лек\\.|лаб\\.|пр\\.з\\.?|кп\\.?))?' +
            '(,? ?\\(\\+(?<types5>лекция|лек\\.?|лаб\\.?|пр\\.?з?\\.?|кп\\.?)\\))?' +
            ',?' +
            '( ?(?<subInfo>.*))?',
        'i',
    );

    const typeGroups =
        _type.match(
            typeRegExp,
            // /(?<types>лекция|лек\.|лаб\.|пр\.з\.?|кп\.?)?(?<star>\*)?( ?(?<duration>[0-9]+)ч)?( ?(?<delim>по п\/г))?( ?(?<subInfo>.*))?/i,
        ).groups || {};
    const duration = Number(typeGroups.duration) || 2;
    const isStream = !!typeGroups.star;
    const isDivision = !!typeGroups.delim;
    const subInfo = typeGroups.subInfo;

    const durationMinutes = ((f) => f * 90 + (f - 1) * 10)(
        Math.floor(duration / 2),
    );

    const dateTime = new Date(0);
    const ds = timeInfo.start.split(':').map(Number);
    dateTime.setHours(ds[0], ds[1]);
    dateTime.setMinutes(dateTime.getMinutes() + durationMinutes);
    const endTime = `${dateTime
        .getHours()
        .toString()
        .padStart(2, '0')}:${dateTime
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

    // * time
    const time = `${timeInfo.start}-${timeInfo.end || endTime || timeInfo.ff}`;

    const type: LessonFlags = [
        typeGroups.types || '',
        typeGroups.types2 || '',
        typeGroups.types3 || '',
        typeGroups.types4 || '',
        typeGroups.types5 || '',
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
                    : LessonFlags.None),
            LessonFlags.None,
        );

    const auditoryName = _audit.trim() /* .split(' ') */ || null;
    const teacherName = _teacher.trim() || null;

    const startAt = null;

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

export const parseWeekDay = (data: string[][], weekDayName: string) => {
    const [titles, ...lessonsArr] = data[0].map((_, i) =>
        data.map((row) => row[i]),
    );

    const day: MixedDay = {
        info: {
            name: weekDayName,
            type: getWeekDayTypeByName(weekDayName),
        },
        lessons: [],
    };

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
    return str.startsWith('пон')
        ? WeekNumberType.Monday
        : str.startsWith('втор')
        ? WeekNumberType.Tuesday
        : str.startsWith('сред')
        ? WeekNumberType.Wednesday
        : str.startsWith('чет')
        ? WeekNumberType.Thursday
        : str.startsWith('пят')
        ? WeekNumberType.Friday
        : str.startsWith('суб')
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
) =>
    allDays.forEach(({ info, lessons }) => {
        info.date = getDateByWeek(weekNumber + offsetWeek, info.type);
        info.dateStr = `${info.date.getDate().toString().padStart(2, '0')}.${(
            info.date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}.${info.date.getFullYear()}`;
        lessons.forEach((lesson) => {
            const [hours, minutes] = lesson.time.split('-')[0].split(':');
            lesson.startAt = createDateAsUTC(
                info.date,
                Number(hours),
                Number(minutes),
            );
            lesson.endAt = new Date(
                lesson.startAt.getTime() + lesson.durationMinutes * 60e3,
            ).toISOString();
        });
    });

const getWeekNumber = (date: string | number | Date) => {
    const now = new Date(date);
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
        ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) /
            7,
    );
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

const getStartDateOfSemester = (d = new Date()) => {
    const date = new Date(d);
    const semDate = new Date(
        date.getFullYear(),
        (date.getMonth() > 7 ? 9 : 2) - 1,
        1,
    );
    const firstWeekday = semDate.getDay() || 7;
    if (firstWeekday > 5) {
        semDate.setHours(24 * (8 - firstWeekday));
    }

    return dateSkipWeek(semDate.getMonth() > 7 ? 0 : 1, semDate);
};

export const splitToWeeks = (
    allDays: MixedDay[],
    semesterStartDate?: Date | string | number,
) => {
    const minWeek = getMinWeekNumber(allDays);
    const maxWeek = getMaxWeekNumber(allDays);
    const offsetWeek =
        getWeekNumber(semesterStartDate ?? getStartDateOfSemester()) - 1;
    const weeks: OneWeek[] = [];

    for (let number = minWeek; number < maxWeek + 1; ++number) {
        const days = splitLessonsDayByWeekNumber(allDays, number);
        setDaysDate(days, number, offsetWeek);

        weeks.push({ number, days });
    }

    return weeks;
};
