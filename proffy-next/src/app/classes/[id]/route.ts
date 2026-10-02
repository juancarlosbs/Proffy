import { NextRequest, NextResponse } from 'next/server';

import db from '@/server/db';
import { attachSchedule } from '../route';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    const classItem = await db('classes')
        .join('users', 'classes.user_id', '=', 'users.id')
        .where('classes.id', '=', id)
        .select(['classes.*', 'users.*'])
        .first();

    if (!classItem) {
        return NextResponse.json(
            { error: 'Class not found' },
            { status: 404 },
        );
    }

    const [classWithSchedule] = await attachSchedule([classItem]);

    return NextResponse.json(classWithSchedule);
}
