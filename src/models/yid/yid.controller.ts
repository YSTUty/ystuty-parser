import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseBoolPipe,
    Query,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';

import { ScheduleView } from './entity/schedule.entity';
import { StudentView } from './entity/student.entity';
import { YidService } from './yid.service';

@ApiTags('yid')
@Controller('/yid')
export class YidController {
    constructor(private readonly yidService: YidService) {}

    @ApiOperation({ summary: 'Get student info by login' })
    @Get('student/login/:login')
    @ApiParam({
        name: 'login',
        description: 'Student login',
        allowEmptyValue: false,
        examples: {
            example1: {
                summary: 'Test user',
                value: 'ivanovdd.22',
            },
        },
    })
    @ApiQuery({
        name: 'marks',
        description: 'Get user marks for semesters.',
        type: Boolean,
        required: false,
    })
    @ApiResponse({
        status: 200,
        type: StudentView,
    })
    async getStudentInfoByLogin(
        @Param('login') login: string,
        @Query('marks', new DefaultValuePipe(false), ParseBoolPipe)
        marks?: boolean,
    ) {
        return instanceToPlain(
            await this.yidService.getStudentInfoByLogin(login, marks),
        );
    }

    @ApiOperation({ summary: 'Get students list by group name' })
    @Get('student/group/:name')
    @ApiParam({
        name: 'name',
        description: 'Student group name',
        allowEmptyValue: false,
        examples: {
            example1: {
                summary: 'Example group name',
                value: 'ЭИС-46',
            },
        },
    })
    @ApiResponse({
        status: 200,
        type: StudentView,
        isArray: true,
    })
    async getStudentsInfoByGroupName(@Param('name') groupName: string) {
        return instanceToPlain(
            await this.yidService.getStudentsByGroupName(groupName),
        );
    }

    @ApiOperation({ summary: 'Get remaining schedule for the next time' })
    @Get('schedule/group/:name')
    @ApiParam({
        name: 'name',
        description: 'Group name',
        allowEmptyValue: false,
        examples: {
            example1: {
                summary: 'Example group name',
                value: 'ЭИС-36',
            },
        },
    })
    @ApiResponse({
        status: 200,
        type: ScheduleView,
    })
    async getScheduleByGroupName(@Param('name') groupName: string) {
        return instanceToPlain(
            await this.yidService.getScheduleByGroupName(groupName),
        );
    }
}
