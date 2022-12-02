import { Injectable } from '@nestjs/common';
import ical, {
    ICalCalendarMethod,
    ICalEventTransparency,
    ICalEventStatus,
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
            .url(xEnv.SERVER_URL)
            .source(`${xEnv.SERVER_URL}/calendar/group/${groupName}.ical`)
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
            .url(xEnv.SERVER_URL)
            .source(`${xEnv.SERVER_URL}/calendar/teacher/${teacherId}.ical`)
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
}
