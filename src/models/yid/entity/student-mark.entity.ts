import { Exclude, Expose, plainToClass } from 'class-transformer';
import { ViewEntity, ViewColumn, ManyToOne, JoinColumn } from 'typeorm';

import { trimTransformer } from '../tools';
import { StudentView } from './student.entity';

export enum ControlType {
    Test = 'test',
    DiffTest = 'diffTest',
    Exam = 'exam',
}
export enum ControlTypeRev {
    'зачет' = 'test',
    'зачет дифференцированный' = 'diffTest',
    'экзамен' = 'exam',
}

@ViewEntity({ name: 'ocstudv' })
@Exclude()
export class StudentMarkView {
    @Expose({ groups: ['mark'] })
    @ViewColumn({ name: 'profile' })
    public studentId: number;

    @Expose()
    @ManyToOne(() => StudentView, (e) => e.marks)
    @JoinColumn({ name: 'profile', referencedColumnName: 'id' })
    public student?: StudentView;

    /**
     * Course number
     * @example 4
     */
    @Expose()
    @ViewColumn({ name: 'kurs' })
    public course: number;

    /**
     * Semester number
     * @example 7
     */
    @Expose()
    @ViewColumn({ name: 'sem' })
    public semester: number;

    @ViewColumn({ name: 'namepredmet' })
    public lessonName: string;

    @Expose()
    @ViewColumn({
        name: 'namevidk',
        transformer: {
            from: (value: string) => ControlTypeRev[value],
            to: (value: ControlType) => ControlType[value],
        },
    })
    public controlType: ControlType;

    @Expose()
    @ViewColumn({ transformer: trimTransformer })
    public result: string;

    @Expose()
    @ViewColumn({
        transformer: {
            from: (value: string) => (value && Number(value.trim())) || null,
            to: (value: number | null) => value && value.toString(),
        },
    })
    public ball: number;

    @Expose()
    @ViewColumn({
        name: 'vkl_v_dipl',
        transformer: {
            from: (value: string) => value && value.trim() === '*',
            to: (value: boolean) => (value ? '*' : null),
        },
    })
    public isDiplom: boolean;

    @Expose()
    @ViewColumn({
        name: 'dolg',
        transformer: {
            from: (value: string) =>
                value && value.trim().toLowerCase() === 'долг',
            to: (value: boolean) => (value ? 'Долг' : null),
        },
    })
    public isDebt: boolean;

    /**
     * Academic year
     * @example 2020/2021
     */
    @Expose()
    @ViewColumn({ name: 'Уч_Год', transformer: trimTransformer })
    public year: string;

    constructor(input?: Omit<Partial<StudentMarkView>, 'toResponseObject'>) {
        if (input) {
            Object.assign(this, plainToClass(StudentMarkView, input));
        }
    }
}
