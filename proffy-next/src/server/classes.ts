import db from '@/server/db';
import convertHourToMinutes from '@/server/utils/convertHourToMinutes';

export interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export async function findClassesBySubjectWeekDayAndTime(
    subject: string,
    week_day: number,
    timeInMinutes: number,
) {
    return db('classes')
        .whereExists(function () {
            this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('`class_schedule` . `class_id` = `classes` . `id`')
                .whereRaw('`class_schedule` . `week_day` = ??', [week_day])
                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
        })
        .where('classes.subject', '=', subject)
        .join('users', 'classes.user_id', '=', 'users.id')
        .select(['classes.*', 'users.*', 'classes.id as class_id']);
}

export async function findScheduleByClassIds(classIds: number[]) {
    return classIds.length
        ? db('class_schedule').whereIn('class_id', classIds)
        : [];
}

interface CreateClassParams {
    name: string;
    avatar: string;
    whatsapp: string;
    bio: string;
    subject: string;
    cost: number;
    schedule: ScheduleItem[];
}

export async function createClassWithSchedule({
    name,
    avatar,
    whatsapp,
    bio,
    subject,
    cost,
    schedule,
}: CreateClassParams) {
    const trx = await db.transaction();

    try {
        const insertedUsersIds = await trx('users').insert({
            name,
            avatar,
            whatsapp,
            bio,
        });

        const user_id = insertedUsersIds[0];

        const insertedClassesIds = await trx('classes').insert({
            subject,
            cost,
            user_id,
        });

        const class_id = insertedClassesIds[0];

        const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
            return {
                class_id,
                week_day: scheduleItem.week_day,
                from: convertHourToMinutes(scheduleItem.from),
                to: convertHourToMinutes(scheduleItem.to),
            };
        });

        await trx('class_schedule').insert(classSchedule);

        await trx.commit();
    } catch (error) {
        await trx.rollback();
        throw error;
    }
}

export async function findClassByUserId(user_id: string) {
    return db('classes').where('user_id', user_id).first();
}

export async function findScheduleByClassId(class_id: number) {
    return db('class_schedule').where('class_id', class_id);
}
