import db from '@/server/db';

export interface ClassScheduleRow {
    class_id: number;
    week_day: number;
    from: number;
    to: number;
}

export interface ClassScheduleInput {
    week_day: number;
    from: number;
    to: number;
}

export interface NewClassInput {
    name: string;
    avatar: string;
    whatsapp: string;
    bio: string;
    subject: string;
    cost: string;
    schedule: ClassScheduleInput[];
}

export async function findClassesBySubjectAndTime(
    subject: string,
    weekDay: number,
    timeInMinutes: number,
) {
    return db('classes')
        .whereExists(function () {
            this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('`class_schedule` . `class_id` = `classes` . `id`')
                .whereRaw('`class_schedule` . `week_day` = ??', [weekDay])
                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
        })
        .where('classes.subject', '=', subject)
        .join('users', 'classes.user_id', '=', 'users.id')
        .select(['classes.*', 'users.*', 'classes.id as class_id']);
}

export async function findScheduleByClassIds(
    classIds: number[],
): Promise<ClassScheduleRow[]> {
    if (!classIds.length) {
        return [];
    }

    return db('class_schedule').whereIn('class_id', classIds);
}

export async function findClassByUserId(user_id: string) {
    return db('classes').where('user_id', user_id).first();
}

export async function findScheduleByClassId(
    classId: number,
): Promise<ClassScheduleRow[]> {
    return db('class_schedule').where('class_id', classId);
}

export async function createClassWithSchedule(input: NewClassInput) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = input;

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

        const classSchedule = schedule.map(scheduleItem => ({
            class_id,
            week_day: scheduleItem.week_day,
            from: scheduleItem.from,
            to: scheduleItem.to,
        }));

        await trx('class_schedule').insert(classSchedule);

        await trx.commit();
    } catch (error) {
        await trx.rollback();
        throw error;
    }
}
