import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StudentView } from './entity/student.entity';
import { StudentMarkView } from './entity/student-mark.entity';
import { ScheduleView } from './entity/schedule.entity';

@Injectable()
export class YidService {
    constructor(
        @InjectRepository(StudentView)
        private readonly studentView: Repository<StudentView>,
        @InjectRepository(StudentMarkView)
        private readonly studentMarkView: Repository<StudentMarkView>,
        @InjectRepository(ScheduleView)
        private readonly scheduleView: Repository<ScheduleView>,
    ) {}

    async getStudentInfoByLogin(login: string, withMarks = false) {
        const [student] = await this.studentView.find({
            where: { login },
            relations: [...(withMarks ? ['marks'] : [])],
        });
        return student || null;
    }

    async getStudentsByGroupName(groupName: string, withMarks = false) {
        const students = await this.studentView.find({
            where: { groupName },
            order: { id: 'ASC' },
            relations: [...(withMarks ? ['marks'] : [])],
        });
        return students || [];
    }

    async getScheduleByGroupName(groupName: string) {
        const schedule = await this.scheduleView.find({
            where: { groupName },
            order: { sid: 'ASC' },
        });
        return schedule || [];
    }
}
