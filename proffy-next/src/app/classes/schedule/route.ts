import { NextRequest, NextResponse } from 'next/server';

import {
    findClassByUserId,
    findScheduleByClassId,
} from '@/server/repositories/classesRepository';
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

    const klass = await findClassByUserId(user_id);

    if (!klass) {
        return NextResponse.json([]);
    }

    const scheduleRows = await findScheduleByClassId(klass.id);

    const schedule = scheduleRows.map(row => ({
        week_day: row.week_day,
        from: convertMinutesToHour(row.from),
        to: convertMinutesToHour(row.to),
    }));

    return NextResponse.json(schedule);
}
