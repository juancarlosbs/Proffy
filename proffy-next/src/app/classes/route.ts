import { NextRequest, NextResponse } from 'next/server';

import {
    createClassWithSchedule,
    findClassesBySubjectWeekDayAndTime,
    findScheduleByClassIds,
    ScheduleItem,
} from '@/server/classes';
import convertHourToMinutes from '@/server/utils/convertHourToMinutes';
import convertMinutesToHour from '@/server/utils/convertMinutesToHour';
import { findRatingsSummaryByUserIds } from '@/server/ratings';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

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

    const classes = await findClassesBySubjectWeekDayAndTime(
        subject,
        Number(week_day),
        timeInMinutes,
    );

    const classIds = classes.map(klass => klass.class_id);

    const scheduleRows = await findScheduleByClassIds(classIds);

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

    const ratingsSummary = await findRatingsSummaryByUserIds(
        classes.map(klass => klass.id),
    );
    const ratingsByUserId = new Map(
        ratingsSummary.map(summary => [summary.user_id, summary]),
    );

    const classesWithSchedule = classes.map(klass => {
        const { class_id, ...rest } = klass;
        const ratings = ratingsByUserId.get(klass.id);
        return {
            ...rest,
            schedule: scheduleByClassId.get(class_id) ?? [],
            averageRating: ratings ? ratings.average : null,
            ratingsCount: ratings ? ratings.count : 0,
        };
    });

    return NextResponse.json(classesWithSchedule);
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

    try {
        await createClassWithSchedule({
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule,
        });

        return new NextResponse(null, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Unexpected error while creating new class' },
            { status: 400 },
        );
    }
}
