import { Controller, Get, Logger, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('/calendar')
export class CalendarController {
    private readonly logger = new Logger(CalendarController.name);

    constructor(private readonly calendarService: CalendarService) {}

    @Get('/file/:groupName.ical')
    @Get('/group/:groupName.ical')
    @ApiOperation({ summary: 'Get an ical file for importing calendar events' })
    @ApiParam({
        name: 'groupName',
        required: true,
        examples: {
            a: {
                summary: 'Группа ЭИС-46',
                value: 'ЭИС-46',
            },
            b: {
                summary: 'Группа ЦИС-16',
                value: 'ЦИС-16',
            },
        },
    })
    @ApiResponse({
        status: 200,
        content: {
            ['text/calendar']: {},
        },
        headers: {
            ['Content-Disposition']: {
                schema: {
                    type: 'string',
                    example: 'attachment; filename="groupName.ical"',
                },
            },
        },
    })
    async getCalendarForGroupICAL(
        @Param('groupName') groupName: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.logger.log(
            `Generate calendar [${groupName}]`,
            req.headers['user-agent'],
        );

        const calendar = await this.calendarService.generateCalenadrForGroup(
            groupName,
        );
        calendar.serve(res, encodeURIComponent(`${groupName}.ics`));
    }

    @Get('/teacher/:teacherId.ical')
    @ApiOperation({ summary: 'Get an ical file for importing calendar events' })
    @ApiParam({
        name: 'teacherId',
        required: true,
        examples: {
            a: {
                summary: 'Преподаватель Иванов Иван Иванович',
                value: 1,
            },
            b: {
                summary: 'Преподаватель Петров Петр Петрович',
                value: 2,
            },
        },
    })
    @ApiResponse({
        status: 200,
        content: {
            ['text/calendar']: {},
        },
        headers: {
            ['Content-Disposition']: {
                schema: {
                    type: 'string',
                    example: 'attachment; filename="teacherId.ical"',
                },
            },
        },
    })
    async getCalendarForTeacherICAL(
        @Param('teacherId') teacherId: number,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.logger.log(
            `Generate calendar [${teacherId}]`,
            req.headers['user-agent'],
        );

        const calendar = await this.calendarService.generateCalenadrForTeacher(
            teacherId,
        );
        calendar.serve(res, encodeURIComponent(`${teacherId}.ics`));
    }
}
