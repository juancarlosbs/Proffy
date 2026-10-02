import { NextRequest, NextResponse } from 'next/server';

import { createRating, findRatingsByUserIds, userExists } from '@/server/ratings';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json(
            { error: 'Missing user_id to search ratings' },
            { status: 400 },
        );
    }

    const ratings = await findRatingsByUserIds([Number(user_id)]);

    return NextResponse.json(ratings);
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

    const { user_id, stars, comment } = body;

    if (!user_id || !Number.isInteger(stars) || stars < 1 || stars > 5) {
        return NextResponse.json(
            { error: 'Invalid rating data' },
            { status: 400 },
        );
    }

    if (!(await userExists(user_id))) {
        return NextResponse.json(
            { error: 'Teacher not found' },
            { status: 400 },
        );
    }

    try {
        await createRating({ user_id, stars, comment });

        return new NextResponse(null, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Unexpected error while creating new rating' },
            { status: 400 },
        );
    }
}
