import { Injectable } from '@nestjs/common';
import ical, {
    ICalCalendarMethod,
    ICalEventTransparency,
    ICalEventStatus,
    ICalCalendar,
    ICalAlarmType,
} from 'ical-generator';
import * as moment from 'moment';
import { getLessonTypeStrArr } from '@my-common';
import * as xEnv from '@my-environment';

import { YSTUService } from '../ystu/ystu.service';
import { YSTUCollector } from '../ystu/ystu.collector';

@Injectable()
export class CalendarService {
    constructor(
        private readonly ystuServiec: YSTUService,
        private readonly ystuCollector: YSTUCollector,
    ) {}

    public async generateCalenadrForGroup(groupName: string) {
        const schedule = await this.ystuServiec.getScheduleByGroup(groupName);

        const calendar = ical()
            .name(`YSTUty [${groupName}]`)
            .prodId({
                company: 'YSTUty',
                product: `${xEnv.APP_NAME} Schedule`,
                language: 'RU',
            })
            .scale('gregorian')
            .method(ICalCalendarMethod.PUBLISH)
            .timezone('Europe/Moscow')
            .description(`Расписание занятий ЯГТУ для группы ${groupName}`)
            .ttl(60 * 60);

        if (xEnv.SERVER_URL_ICAL_NEW) {
            calendar
                .url(xEnv.SERVER_URL_ICAL_NEW)
                .source(`${xEnv.SERVER_URL_ICAL_NEW}/group/${groupName}.ical`);
            this.injectNewCalendar(calendar, groupName);
        } else {
            calendar
                .url(xEnv.SERVER_URL)
                .source(`${xEnv.SERVER_URL}/calendar/group/${groupName}.ical`);
        }

        for (const week of schedule.items) {
            for (const day of week.days) {
                for (const lesson of day.lessons) {
                    const event = calendar
                        .createEvent({
                            // id: `Z-${week.number}-${day.info.type}-${lesson.number}`,
                            // busystatus: ICalEventBusyStatus.BUSY,
                        })
                        .start(moment(lesson.startAt))
                        .end(moment(lesson.endAt))
                        .summary(
                            `${
                                lesson.isDistant ? '(🖥) ' : ''
                            }[${getLessonTypeStrArr(lesson.type).join('|')}] ${
                                lesson.lessonName || lesson.subInfo
                            }${((e) => (e ? ` [${e}]` : ''))(
                                lesson.auditoryName,
                            )}`,
                        )
                        .description(
                            `${((e) => (e ? `[${e}]` : ''))(
                                lesson.auditoryName,
                            )}${lesson.isDistant ? ' (Дистант)' : ''} ${
                                lesson.teacherName
                            }`,
                        )
                        // .alarms([
                        //     { type: ICalAlarmType.display, trigger: 60 * 30 },
                        // ])
                        .status(ICalEventStatus.CONFIRMED)
                        .transparency(ICalEventTransparency.OPAQUE);

                    if (
                        moment(lesson.startAt).isBefore(
                            moment(lesson.endAt),
                            'day',
                        )
                    ) {
                        event.allDay(true);
                    }
                    if (lesson.auditoryName) {
                        event.location({
                            title: `${lesson.auditoryName}`,
                            address: `Ярославль, ЯГТУ${
                                lesson.auditoryName
                                    ? `, Корпус ${
                                          lesson.auditoryName.split('-')[0]
                                      }`
                                    : ''
                            }`,
                        });
                    }
                    if (lesson.teacherName) {
                        event.organizer({
                            name: lesson.teacherName,
                            email: 'nope@ystu.ru',
                        });
                    }
                }
            }
        }

        return calendar;
    }

    public async generateCalenadrForTeacher(teacherId: number) {
        const data = await this.ystuCollector.getScheduleByTeacher(teacherId);
        if (!data) {
            return null;
        }
        const { teacher, items: schedule } = data;

        const calendar = ical()
            .name(`YSTUty [${teacher.name}]`)
            .prodId({
                company: 'YSTUty',
                product: `${xEnv.APP_NAME} Teacher Schedule`,
                language: 'RU',
            })
            .scale('gregorian')
            .method(ICalCalendarMethod.PUBLISH)
            .timezone('Europe/Moscow')
            .description(
                `Расписание занятий ЯГТУ для преподавателя ${teacher.name}`,
            )
            .ttl(60 * 60);

        if (xEnv.SERVER_URL_ICAL_NEW) {
            calendar
                .url(xEnv.SERVER_URL_ICAL_NEW)
                .source(
                    `${xEnv.SERVER_URL_ICAL_NEW}/teacher/${teacherId}.ical`,
                );
            this.injectNewCalendar(calendar, teacherId);
        } else {
            calendar
                .url(xEnv.SERVER_URL)
                .source(
                    `${xEnv.SERVER_URL}/calendar/teacher/${teacherId}.ical`,
                );
        }

        for (const lesson of schedule) {
            const event = calendar
                .createEvent({
                    // id: `Z-${week.number}-${day.info.type}-${lesson.number}`,
                    // busystatus: ICalEventBusyStatus.BUSY,
                })
                .start(moment(lesson.startAt))
                .end(moment(lesson.endAt))
                .summary(
                    `${lesson.isDistant ? '(🖥) ' : ''}[${getLessonTypeStrArr(
                        lesson.lessonType,
                    ).join('|')}] ${lesson.lessonName}${((e) =>
                        e ? ` [${e}]` : '')(lesson.auditoryName)}`,
                )
                .description(
                    `${((e) => (e ? `[${e}]` : ''))(lesson.auditoryName)}${
                        lesson.isDistant ? ' (Дистант)' : ''
                    } Групп${
                        lesson.groups.length > 1 ? 'а' : 'ы'
                    } (${lesson.groups.join(', ')})`,
                )
                // .alarms([
                //     { type: ICalAlarmType.display, trigger: 60 * 30 },
                // ])
                .status(ICalEventStatus.CONFIRMED)
                .transparency(ICalEventTransparency.OPAQUE);

            if (moment(lesson.startAt).isBefore(moment(lesson.endAt), 'day')) {
                event.allDay(true);
            }

            if (lesson.auditoryName) {
                event.location({
                    title: `${lesson.auditoryName}`,
                    address: `Ярославль, ЯГТУ${
                        lesson.auditoryName
                            ? `, Корпус ${lesson.auditoryName.split('-')[0]}`
                            : ''
                    }`,
                });
            }
        }

        return calendar;
    }

    private injectNewCalendar(calendar: ICalCalendar, target: string | number) {
        const today = moment();
        const monday = today.clone().startOf('isoWeek');
        const nextMonday = monday.clone().add(1, 'week');

        for (let date = monday; date.isBefore(nextMonday); date.add(1, 'day')) {
            const isMonday = date.day() === 1;

            const eventDuration = isMonday
                ? moment.duration(1, 'day')
                : moment.duration(5, 'hours');

            const startDate = date.clone().hour(8);
            const event = calendar
                .createEvent({})
                .start(startDate.toDate())
                .end(startDate.clone().add(eventDuration).toDate())
                .summary(
                    `🚨 [YSTUty] Устарел календарь! Нужно обновить ссылку на расписание (ics.ystuty.ru)`,
                )
                .description(
                    `Перейти на сайт ics.ystuty.ru (<a href="https://ics.ystuty.ru/#${target}">перейти</a>) для получения новой ссылки на расписание.\n` +
                        `А этот импортированный календарь надо либо удалить, либо обновить ссылку в настройках вашего календаря для него.\n` +
                        `В ближайшее время этот календарь (старый) будет отключен.\n` +
                        'Сейчас используется старый механизм получения расписания и расписание может быть некорректным.',
                )
                .alarms([{ type: ICalAlarmType.display, trigger: 60 * 30 }])
                .status(ICalEventStatus.CONFIRMED)
                .transparency(ICalEventTransparency.OPAQUE);

            if (isMonday) {
                event.allDay(true);
            }
        }
    }
}
