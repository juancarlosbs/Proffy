import { NextRequest, NextResponse } from 'next/server';

import { findScheduleByUserId } from '@/server/repositories/classes';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json(
            { error: 'Missing user_id' },
            { status: 400 },
        );
    }

    const schedule = await findScheduleByUserId(user_id);

    return NextResponse.json(schedule);
}
