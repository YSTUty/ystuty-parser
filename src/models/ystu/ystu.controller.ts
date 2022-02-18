import {
    Controller,
    DefaultValuePipe,
    Get,
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
import { MixedDay } from './entity/mixed-day.entity';
import { OneWeek } from './entity/one-week.entity';

import { YSTUService } from './ystu.service';

@ApiTags('ystu')
@Controller('/api/ystu')
export class YSTUController {
    constructor(private readonly ystuService: YSTUService) {}

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
        return this.ystuService.getMe();
    }

    @Get('schedule/institutes')
    @ApiOperation({
        summary: 'List of available institutes with a list of groups',
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
    async getInstitutes() {
        return { items: await this.ystuService.getInstitutes() };
    }

    @Get('schedule/groups')
    @ApiOperation({ summary: 'List of available groups' })
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
    async getGroups() {
        return { items: await this.ystuService.getGroups() };
    }

    @ApiOperation({ summary: 'Get a schedule for the specified group' })
    @Get('schedule/group/:name')
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
}
