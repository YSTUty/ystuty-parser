import { Injectable } from '@nestjs/common';
import ical, { ICalAlarmType } from 'ical-generator';
import * as moment from 'moment';
import { getLessonTypeStrArr } from '@my-common';
import * as xEnv from '@my-environment';

import { YSTUService } from '../ystu/ystu.service';

@Injectable()
export class CalendarService {
    constructor(private readonly ystuServiec: YSTUService) {}

    public async generateCalenadr(groupName: string) {
        const schedule = await this.ystuServiec.getScheduleByGroup(groupName);

        const calendar = ical()
            .name(`YSTUty [${groupName}]`)
            .url(xEnv.SERVER_URL)
            .source(`${xEnv.SERVER_URL}/calendar/${groupName}.ical`)
            .prodId({
                company: 'YSTUty',
                product: 'Schedule',
                language: 'RU',
            })
            .timezone('Europe/Moscow')
            .ttl(60 * 60);

        for (const week of schedule.items) {
            for (const day of week.days) {
                for (const lesson of day.lessons) {
                    calendar
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
                                lesson.lessonName
                            } [${lesson.auditoryName}]`,
                        )
                        .description(
                            `[${lesson.auditoryName}]${
                                lesson.isDistant ? ' (Дистант)' : ''
                            } ${lesson.teacherName}`,
                        )
                        .alarms([
                            { type: ICalAlarmType.display, trigger: 60 * 30 },
                        ])
                        .organizer({
                            name: lesson.teacherName,
                            email: 'nope@ystu.ru',
                        })
                        .location({
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
            }
        }

        return calendar;
    }
}
