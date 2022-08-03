import * as cheerio from 'cheerio';
import * as chTableParser from 'cheerio-tableparser';

import * as scheduleParser from './schedule.parser';

import { MixedDay } from './entity/mixed-day.entity';

export const getName = (html: string) => {
    const $ = cheerio.load(html);
    const nameString = $('.ContentHeader ul lir:nth-child(3)').text();
    const matchResult = nameString.match(
        /(?<name>.+) \((?<login>[a-z0-9\._\-]{1,40})\)( (?<group>[а-я0-9\-]{1,10}))?/i,
    );

    const { name, login, group } = matchResult?.groups || {};
    return name ? { name, login, group } : { name: nameString };
};

export const getLink2FullList = (html: string) => {
    const $ = cheerio.load(html);
    const getLink = (index = 1) =>
        ((e) => e && `/WPROG/rasp/${e}`)(
            $(
                `#tab1 > tbody > tr:nth-child(${index}) > td:nth-child(1) > a`,
            ).attr('href'),
        );
    return [getLink(), getLink(2)] as const;
};

export const getInstituteLinks = (html: string) => {
    const $ = cheerio.load(html);
    const instituteLinks: {
        name: string;
        groups: {
            name: string;
            link: string;
            linkLecture: string;
        }[];
    }[] = [];

    const trSelector =
        'body > div.WidthLimiter > div.Content > div.RightContentColumn > div > div > div.hidetext > table > tbody > tr';

    const nbInstitutes = $(trSelector).length;
    if (nbInstitutes % 2 === 0) {
        for (let i = 1; i < nbInstitutes; i += 2) {
            const name = $(`${trSelector}:nth-child(${i})`).text();
            const contentHTML = $(
                `${trSelector}:nth-child(${i + 1}) > td:nth-child(2) > a`,
            );
            const contentLectureHTML = $(
                `${trSelector}:nth-child(${i + 1}) > td:nth-child(2) > div > a`,
            );

            const lectureLinks = contentLectureHTML.toArray().map((el) => ({
                name: $(el).text(),
                link: '/WPROG/rasp/' + $(el).attr('href'),
            }));

            const groups = contentHTML.toArray().map((el) => {
                const name = $(el).text();
                return {
                    name,
                    link: '/WPROG/rasp/' + $(el).attr('href'),
                    linkLecture: (
                        lectureLinks.find(
                            (e) => e.name.slice(0, -3) === name,
                        ) || {}
                    ).link,
                };
            });

            instituteLinks.push({ name, groups });
        }
    }

    return instituteLinks;
};

export const getSchedule = async (html: string, short = false) => {
    const $ = cheerio.load(html);
    chTableParser($);

    const weekerStr = $('#nned option:eq(0)').val() as string;
    const [, semesterStartDate] = weekerStr?.split(' - ') || [];

    const days: MixedDay[] = [];
    const tables = $('table.sortm').toArray();
    for (const table of tables) {
        const [dayName, lessonDateStr] = $(table)
            .parent()
            .find('center')
            .text()
            ?.split(' ');
        const data = ($(table) as any).parsetable(
            false,
            true,
            true,
        ) as string[][];

        const dayNameLower = dayName?.toLowerCase() || null;
        const day = scheduleParser.parseWeekDay(
            data,
            dayNameLower,
            lessonDateStr,
        );
        days.push(day);
    }

    return short ? days : scheduleParser.splitToWeeks(days, semesterStartDate);
};
