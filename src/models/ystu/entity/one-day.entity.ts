import { Lesson } from './lesson.entity';
import { WeekDay } from './week-day.entity';

/**
 * Filtered Days with lessons from one week
 */
export class OneDay {
    info: WeekDay;
    lessons: Lesson[];
}
