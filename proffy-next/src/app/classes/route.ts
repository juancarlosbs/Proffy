import { NextRequest, NextResponse } from 'next/server';

import { createClass, findClasses } from '@/server/repositories/classes';
import convertHourToMinutes from '@/server/utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

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

    const classesWithSchedule = await findClasses({
        subject,
        weekDay: Number(week_day),
        timeInMinutes,
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
        await createClass({
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule: schedule as ScheduleItem[],
        });

        return new NextResponse(null, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Unexpected error while creating new class' },
            { status: 400 },
        );
    }
}
