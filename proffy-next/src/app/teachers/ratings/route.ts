import { NextRequest, NextResponse } from 'next/server';

import { findRatingsByUserId } from '@/server/ratings';
import aggregateRatings from '@/server/utils/aggregateRatings';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json(
            { error: 'Missing user_id' },
            { status: 400 },
        );
    }

    const rows = await findRatingsByUserId(user_id);

    return NextResponse.json(aggregateRatings(rows));
}
