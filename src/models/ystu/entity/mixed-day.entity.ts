import { Lesson } from './lesson.entity';
import { WeekDay } from './week-day.entity';

/**
 * Mixed Days with lessons from one all weeks
 */
export class MixedDay {
    info: WeekDay;
    lessons: Lesson[];
}
