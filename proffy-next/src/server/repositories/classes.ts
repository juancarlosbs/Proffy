import db from '@/server/db';
import convertHourToMinutes from '@/server/utils/convertHourToMinutes';
import convertMinutesToHour from '@/server/utils/convertMinutesToHour';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

interface FindClassesParams {
    subject: string;
    weekDay: number;
    timeInMinutes: number;
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

export async function findClasses({ subject, weekDay, timeInMinutes }: FindClassesParams) {
    const classes = await db('classes')
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

    const classIds = classes.map(klass => klass.class_id);

    const scheduleRows = classIds.length
        ? await db('class_schedule').whereIn('class_id', classIds)
        : [];

    const scheduleByClassId = new Map<number, ScheduleItem[]>();
    for (const row of scheduleRows) {
        const list = scheduleByClassId.get(row.class_id) ?? [];
        list.push({
            week_day: row.week_day,
            from: convertMinutesToHour(row.from),
            to: convertMinutesToHour(row.to),
        });
        scheduleByClassId.set(row.class_id, list);
    }

    return classes.map(klass => {
        const { class_id, ...rest } = klass;
        return {
            ...rest,
            schedule: scheduleByClassId.get(class_id) ?? [],
        };
    });
}

export async function createClass({
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

        return insertedUsersIds[0];
    } catch (error) {
        await trx.rollback();
        throw error;
    }
}

export async function findScheduleByUserId(user_id: string) {
    const klass = await db('classes').where('user_id', user_id).first();

    if (!klass) {
        return [];
    }

    const scheduleRows = await db('class_schedule').where('class_id', klass.id);

    return scheduleRows.map(row => ({
        week_day: row.week_day,
        from: convertMinutesToHour(row.from),
        to: convertMinutesToHour(row.to),
    }));
}
