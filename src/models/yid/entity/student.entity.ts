import { Exclude, Expose, plainToClass, Type } from 'class-transformer';
import { ViewEntity, ViewColumn, OneToMany } from 'typeorm';
import { trimTransformer } from '../tools';
import { StudentMarkView } from './student-mark.entity';

@ViewEntity({ name: 'liststudv' })
@Exclude()
export class StudentView {
    @Expose()
    @ViewColumn({ name: 'proid' })
    public id: number;

    // @Expose()
    // @ViewColumn({ name: 'man' })
    // manId: number;

    @Expose()
    @ViewColumn({ name: 'fam' })
    public lastname: string;

    @Expose()
    @ViewColumn({ name: 'imja' })
    public firstname: string;

    @Expose()
    @ViewColumn({ name: 'otch' })
    public patronymic?: string;

    @Expose()
    @ViewColumn({ name: 'ngr', transformer: trimTransformer })
    public groupName: string;

    /**
     * Student's date of birth
     * @example new Date('2000-06-05T20:00:00.000Z')
     */
    @Expose()
    @ViewColumn({ name: 'd_r' })
    public dateBirth: Date;

    @Expose()
    @ViewColumn({
        transformer: {
            from: (value: string) => value && value.trim().split(' '),
            to: (values: string[]) => (values && values.join(' ')) || '',
        },
    })
    public tel: string[];

    @Expose()
    @ViewColumn({ transformer: trimTransformer })
    public email: string;

    @Expose()
    @ViewColumn({ transformer: trimTransformer })
    public login: string;

    /** Student marks for semesters */
    @Expose()
    @OneToMany(() => StudentMarkView, (e) => e.student)
    @Type(() => StudentMarkView, {})
    public marks?: StudentMarkView[];

    constructor(input?: Omit<Partial<StudentView>, 'toResponseObject'>) {
        if (input) {
            Object.assign(this, plainToClass(StudentView, input));
        }
    }
}
