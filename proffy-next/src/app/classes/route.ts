import { NextRequest, NextResponse } from 'next/server';

import db from '@/server/db';
import convertHourToMinutes from '@/server/utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

async function attachSchedule(classes: Array<{ class_id: number } & Record<string, unknown>>) {
    const classIds = classes.map((classItem) => classItem.class_id);

    const schedules = await db('class_schedule').whereIn(
        'class_id',
        classIds,
    );

    return classes.map(({ class_id, ...classItem }) => ({
        ...classItem,
        schedule: schedules
            .filter((scheduleItem) => scheduleItem.class_id === class_id)
            .map((scheduleItem) => ({
                week_day: scheduleItem.week_day,
                from: scheduleItem.from,
                to: scheduleItem.to,
            })),
    }));
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const ids = searchParams.get('ids');

    if (ids) {
        const classIds = ids
            .split(',')
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id));

        const classes = await db('classes')
            .whereIn('users.id', classIds)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*', 'classes.id as class_id']);

        return NextResponse.json(await attachSchedule(classes));
    }

    const subject = searchParams.get('subject');
    const week_day = searchParams.get('week_day');
    const time = searchParams.get('time');

    if (!week_day || !subject || !time) {
        return NextResponse.json(
            { error: 'Missing filters to search classes' },
            { status: 400 },
        );
    }

    const timeInMinutes = convertHourToMinutes(time);

    const classes = await db('classes')
        .whereExists(function () {
            this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('`class_schedule` . `class_id` = `classes` . `id`')
                .whereRaw('`class_schedule` . `week_day` = ??', [Number(week_day)])
                .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
        })
        .where('classes.subject', '=', subject)
        .join('users', 'classes.user_id', '=', 'users.id')
        .select(['classes.*', 'users.*', 'classes.id as class_id']);

    return NextResponse.json(await attachSchedule(classes));
}

export async function POST(req: NextRequest) {
    let body;

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 },
        );
    }

    const {
        name,
        avatar,
        whatsapp,
        bio,
        subject,
        cost,
        schedule,
    } = body;

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

        return new NextResponse(null, { status: 201 });
    } catch {
        await trx.rollback();
        return NextResponse.json(
            { error: 'Unexpected error while creating new class' },
            { status: 400 },
        );
    }
}
