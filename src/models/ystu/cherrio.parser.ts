import * as cheerio from 'cheerio';
import * as chTableParser from 'cheerio-tableparser';
import { IAudienceData, IInstituteData, ITeacherData } from '@my-interfaces';
import { normalizeScheduleLink } from '@my-common';

import * as scheduleParser from './schedule.parser';

import { MixedDay } from './entity/mixed-day.entity';
import { AudienceLesson } from './entity/audience-lesson.entity';
import { TeacherLesson } from './entity/teacher-lesson.entity';

export const getName = (html: string) => {
    const $ = cheerio.load(html);
    const nameString = $('.ContentHeader ul lir:nth-child(3)').text().trim();
    const matchResult = nameString.match(
        /(?<name>.+) \((?<login>[a-z0-9\._\-]{1,40})\)( (?<group>[а-я0-9\-]{1,10}))?/i,
    );

    const { name, login, group } = matchResult?.groups || {};
    return name ? { name, login, group } : { name: nameString };
};

export const getScheduleLinks = (html: string) => {
    const $ = cheerio.load(html);
    const links = $(`#tab1 > tbody > tr > td:nth-child(1) > a`)
        .toArray()
        .map((e) => $(e).attr('href'));
    return links.map((link) => normalizeScheduleLink(`/WPROG/rasp/${link}`));
};

export const getInstituteLinks = (html: string) => {
    const $ = cheerio.load(html);
    const instituteLinks: IInstituteData[] = [];

    const trSelector =
        'body > div.WidthLimiter > div.Content > div.RightContentColumn > div > div > div.hidetext > table > tbody > tr';

    const nbInstitutes = $(trSelector).length;
    if (nbInstitutes % 2 === 0) {
        for (let i = 1; i < nbInstitutes; i += 2) {
            const name = $(`${trSelector}:nth-child(${i})`).text().trim();
            const contentHTML = $(
                `${trSelector}:nth-child(${i + 1}) > td:nth-child(2) > a`,
            );
            const contentLectureHTML = $(
                `${trSelector}:nth-child(${i + 1}) > td:nth-child(2) > div > a`,
            );

            const lectureLinks = contentLectureHTML.toArray().map((el) => ({
                name: $(el).text().trim(),
                link: normalizeScheduleLink(
                    `/WPROG/rasp/${$(el).attr('href')}`,
                ),
            }));

            const groups = contentHTML.toArray().map((el) => {
                const name = $(el).text().trim();
                const linkLecture = (
                    lectureLinks.find((e) => e.name.slice(0, -3) === name) || {}
                ).link;
                return {
                    // * Пропускаем ненужные обозначения в скобках, например, `ДСЭ-46(лс)` => `ДСЭ-46`
                    name: name.trim().split('(')[0].trim(),
                    link: normalizeScheduleLink(
                        '/WPROG/rasp/' + $(el).attr('href'),
                    ),
                    extraLinks: linkLecture ? [linkLecture] : [],
                };
            });

            instituteLinks.push({
                name,
                groups,
            });
        }
    }

    const name = $(
        'body > div.WidthLimiter > div.Content > div.RightContentColumn > div > div > div.hidetext > font',
    )
        .text()
        .trim();

    return { name, links: instituteLinks };
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
            .trim()
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

export const getTeachersScheduleFormData = async (html: string) => {
    const $ = cheerio.load(html);
    const rows = $('#tab1 > tbody > tr').toArray();

    const teachers: ITeacherData[] = [];
    for (const row of rows) {
        const $row = $(row);
        const days = $row.find('td:nth-child(4)').text().trim().split(' ');

        const $form = $row.find('td:nth-child(2) > form');
        const name = $form.find('a').text().trim();
        const idprep = Number($form.find('input[name="idprep"]').val()) || null;

        teachers.push({ id: idprep, name, days });
    }
    return teachers;
};

export const getTeacherSchedule = async (
    html: string,
    datts: { datt0: string; datt1: string },
) => {
    const $ = cheerio.load(html);
    // chTableParser($);
    // const data = ($('#tab1') as any).parsetable(
    //     false,
    //     true,
    //     true,
    // ) as string[][];
    // const schedule = scheduleParser.parseTeacherDays(data);

    const rows = $('#tab1 > tbody > tr').toArray();
    const schedule: TeacherLesson[] = [];
    for (const row of rows) {
        const day = scheduleParser.parseTeacherDayCherrio($, row, datts, false);
        schedule.push(day);
    }
    return schedule;
};

export const getAudiencesScheduleFormData = async (html: string) => {
    const $ = cheerio.load(html);
    const rows = $('#tab1 > tbody > tr').toArray();

    const audiences: IAudienceData[] = [];
    for (const row of rows) {
        const $row = $(row);
        const days = $row.find('td:nth-child(4)').text().trim().split(' ');

        const $form = $row.find('td:nth-child(2) > form');
        const name = $form.find('a').text().trim();
        const id = Number($form.find('input[name="idaudi"]').val()) || null;

        audiences.push({ id, name, days });
    }
    return audiences;
};

export const getAudienceSchedule = async (
    html: string,
    datts: { datt0: string; datt1: string },
) => {
    const $ = cheerio.load(html);

    const rows = $('#tab1 > tbody > tr').toArray();
    const schedule: AudienceLesson[] = [];
    for (const row of rows) {
        const day = scheduleParser.parseTeacherDayCherrio($, row, datts, true);
        schedule.push(day);
    }
    return schedule;
};
