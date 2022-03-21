import { Controller, Get, Logger, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('/api/calendar')
export class CalendarController {
    private readonly logger = new Logger(CalendarController.name);

    constructor(private readonly calendarService: CalendarService) {}

    @Get('/file/:groupName.ical')
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
    async getCalendarICAL(
        @Param('groupName') groupName: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.logger.log(
            `Generate calendar [${groupName}]`,
            req.headers['user-agent'],
        );

        const calendar = await this.calendarService.generateCalenadr(groupName);
        if (!calendar) {
            res.sendStatus(404);
            return;
        }
        calendar.serve(res, encodeURIComponent(`${groupName}.ics`));
    }
}
