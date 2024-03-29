import {
    Controller,
    DefaultValuePipe,
    Get,
    HttpException,
    NotFoundException,
    Param,
    ParseBoolPipe,
    Query,
} from '@nestjs/common';
import {
    ApiExtraModels,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import * as xEnv from '@my-environment';

import { MixedDay } from './entity/mixed-day.entity';
import { OneWeek } from './entity/one-week.entity';
import { AudienceLesson } from './entity/audience-lesson.entity';
import { TeacherLesson } from './entity/teacher-lesson.entity';
import { AccumulativeSchedule } from './entity/accumulative-schedule.entity';

import { YSTUService } from './ystu.service';
import { YSTUCollector } from './ystu.collector';

@ApiTags('ystu')
@Controller('/ystu')
export class YSTUController {
    constructor(
        private readonly ystuService: YSTUService,
        private readonly ystuCollector: YSTUCollector,
    ) {}

    @Get('me')
    @ApiOperation({ summary: 'Information about the authorized user' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    example: 'Василий Василий Василий',
                },
                login: {
                    type: 'string',
                    example: 'vasily.00',
                    nullable: true,
                },
                group: {
                    type: 'string',
                    example: 'ЭИС-66',
                    nullable: true,
                },
            },
        },
    })
    // For debug
    getMe() {
        if (xEnv.YSTU_DISABLE_USERINFO) {
            throw new HttpException('User info is disabled', 403);
        }
        return this.ystuService.getMe();
    }

    @Get('schedule/count')
    @ApiOperation({ summary: 'List of available amount of data' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                institutes: { type: 'number', example: 8 },
                groups: { type: 'number', example: 256 },
                teachers: { type: 'number', example: 460 },
                audiences: { type: 'number', example: 260 },
            },
        },
    })
    async getCount() {
        return {
            institutes: (await this.ystuService.getInstitutes(true)).length,
            groups: (await this.ystuService.getGroups(true, true)).length,
            teachers: (await this.ystuCollector.getTeachers()).length,
            audiences: (await this.ystuCollector.getAudiences()).length,
        };
    }

    @Get('schedule/institutes')
    @ApiOperation({
        summary: 'List of available institutes with a list of groups',
    })
    @ApiQuery({
        name: 'extramural',
        description: 'Append groups of extramural education.',
        type: Boolean,
        required: false,
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            groups: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                        },
                    },
                    example: [
                        {
                            name: 'Институт архитектуры и дизайна',
                            groups: ['САР-14', 'САР-14м', 'САРД-15'],
                        },
                        {
                            name: 'Институт инженеров строительства и транспорта',
                            groups: ['АТ-44', 'ОВР-46'],
                        },
                        {
                            name: 'Институт цифровых систем',
                            groups: ['ЦПС-10', 'ЭИС-46', 'ЭИС-47'],
                        },
                    ],
                },
            },
        },
    })
    async getInstitutes(
        @Query('extramural', new DefaultValuePipe(false), ParseBoolPipe)
        withExtramural?: boolean,
    ) {
        return { items: await this.ystuService.getInstitutes(withExtramural) };
    }

    @Get('schedule/groups')
    @ApiOperation({ summary: 'List of available groups' })
    @ApiQuery({
        name: 'extramural',
        description: 'Append groups of extramural education.',
        type: Boolean,
        required: false,
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    example: [
                        'САР-14',
                        'САР-14м',
                        'АСДМ-36',
                        'ЭИС-36',
                        'АСДМ-46',
                    ],
                },
            },
        },
    })
    async getGroups(
        @Query('extramural', new DefaultValuePipe(false), ParseBoolPipe)
        withExtramural?: boolean,
    ) {
        return {
            items: await this.ystuService.getGroups(true, withExtramural),
        };
    }

    @Get('schedule/group/:name')
    @ApiOperation({ summary: 'Get a schedule for the specified group' })
    @ApiParam({
        name: 'name',
        description: 'Group name',
        allowEmptyValue: false,
        examples: {
            eis46: {
                summary: 'Группа ЭИС-46',
                value: 'ЭИС-46',
            },
            sar14: {
                summary: 'Группа САР-14',
                value: 'САР-14',
            },
        },
    })
    @ApiQuery({
        name: 'short',
        description:
            'Get only brief information about the schedule in the form of an array of weeks.',
        type: Boolean,
        required: false,
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                isCache: {
                    type: 'boolean',
                },
                items: {
                    type: 'array',
                    items: {
                        oneOf: [
                            { $ref: getSchemaPath(OneWeek) },
                            { $ref: getSchemaPath(MixedDay) },
                        ],
                    },
                },
            },
        },
    })
    @ApiExtraModels(OneWeek, MixedDay)
    getByGroup(
        @Param('name') name: string,
        @Query('short', new DefaultValuePipe(false), ParseBoolPipe)
        short?: boolean,
    ) {
        return this.ystuService.getScheduleByGroup(name, short);
    }

    @Get('schedule/teachers')
    @ApiOperation({ summary: 'List of available teachers' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                        },
                    },
                    example: [
                        { id: 1, name: 'Иванов Иван Иванович' },
                        { id: 2, name: 'Петров Петр Петрович' },
                        { id: 3, name: 'Сидоров Сидор Сидорович' },
                        { id: 4, name: 'Семенов Семен Семенович' },
                        { id: 5, name: 'Павлов Павел Павлович' },
                    ],
                },
            },
        },
    })
    async getTeachers() {
        return {
            items: await this.ystuCollector.getTeachers(),
        };
    }

    @Get('schedule/teacher/:teacherNameOrId')
    @ApiOperation({ summary: 'Get a schedule for the specified teacher' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                isCache: { type: 'boolean' },
                teacher: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                    },
                },
                items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(TeacherLesson) },
                },
            },
        },
    })
    @ApiExtraModels(TeacherLesson)
    async getByTeacher(@Param('teacherNameOrId') nameOrId: string) {
        const data = await this.ystuCollector.getScheduleByTeacher(nameOrId);
        if (!data) {
            throw new NotFoundException('teacher not found by this name or id');
        }
        return data;
    }

    @Get('schedule/audiences')
    @ApiOperation({ summary: 'List of available audiences' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                        },
                    },
                    example: [
                        { id: 1, name: 'Г-777' },
                        { id: 2, name: 'А-202' },
                    ],
                },
                count: {
                    type: 'number',
                    example: 2,
                },
            },
        },
    })
    async getAudiences() {
        const items = await this.ystuCollector.getAudiences();
        return { items, count: items.length };
    }

    @Get('schedule/audience/:nameOrId')
    @ApiOperation({ summary: 'Get a schedule for the specified audience' })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                isCache: { type: 'boolean' },
                audience: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                    },
                },
                items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(AudienceLesson) },
                },
            },
        },
    })
    @ApiExtraModels(AudienceLesson)
    async getByAudience(@Param('nameOrId') nameOrId: string) {
        const data = await this.ystuCollector.getScheduleByAudience(nameOrId);
        if (!data) {
            throw new NotFoundException(
                'audience not found by this name or id',
            );
        }
        return data;
    }

    @Get('schedule/accumulative')
    @ApiOperation({
        summary: 'List of available accumulative schedules by audiences',
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(AccumulativeSchedule) },
                },
                percent: {
                    type: 'number',
                    example: 5,
                },
                count: {
                    type: 'number',
                    example: 1,
                },
                total: {
                    type: 'number',
                    example: 20,
                },
            },
        },
    })
    @ApiExtraModels(AccumulativeSchedule)
    async getAccumulative() {
        const audiences = await this.ystuCollector.getAudiences();
        const data = await this.ystuCollector.getAccumulative();
        return { ...data, count: data.items.length, total: audiences.length };
    }
}
