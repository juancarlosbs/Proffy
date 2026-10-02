import { NextRequest, NextResponse } from 'next/server';

import {
    createRating,
    findCommentsByUserIds,
    findRatingsSummaryByUserIds,
    teacherExists,
} from '@/server/ratings';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const userIds = searchParams.getAll('user_id').map(Number).filter(id => !Number.isNaN(id));

    const [summary, comments] = await Promise.all([
        findRatingsSummaryByUserIds(userIds),
        findCommentsByUserIds(userIds),
    ]);

    return NextResponse.json({ summary, comments });
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

    const { user_id, score, comment } = body;

    if (user_id === undefined || user_id === null || score === undefined || score === null) {
        return NextResponse.json(
            { error: 'Missing user_id or score' },
            { status: 400 },
        );
    }

    if (score < 1 || score > 5) {
        return NextResponse.json(
            { error: 'score must be between 1 and 5' },
            { status: 400 },
        );
    }

    if (!(await teacherExists(user_id))) {
        return NextResponse.json(
            { error: 'Teacher not found' },
            { status: 400 },
        );
    }

    await createRating({ user_id, score, comment });

    return new NextResponse(null, { status: 201 });
}
