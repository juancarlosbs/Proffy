import { NextRequest, NextResponse } from 'next/server';

import db from '@/server/db';
import convertMinutesToHour from '@/server/utils/convertMinutesToHour';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json(
            { error: 'Missing user_id' },
            { status: 400 },
        );
    }

    const klass = await db('classes').where('user_id', user_id).first();

    if (!klass) {
        return NextResponse.json([]);
    }

    const scheduleRows = await db('class_schedule').where('class_id', klass.id);

    const schedule = scheduleRows.map(row => ({
        week_day: row.week_day,
        from: convertMinutesToHour(row.from),
        to: convertMinutesToHour(row.to),
    }));

    return NextResponse.json(schedule);
}
