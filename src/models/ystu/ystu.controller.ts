import {
    Controller,
    Get,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

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
}
