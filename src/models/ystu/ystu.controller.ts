import {
    Controller,
    Get,
} from '@nestjs/common';

import { YSTUService } from './ystu.service';

@Controller('/api/ystu')
export class YSTUController {
    constructor(private readonly ystuService: YSTUService) {}

    /** For debug */
    @Get('me')
    getMe() {
        return this.ystuService.getMe();
    }
}
