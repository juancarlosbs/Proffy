import { NextRequest, NextResponse } from 'next/server';

import { createRating } from '@/server/ratings';

export async function POST(req: NextRequest) {
    const { user_id, score, comment } = await req.json();

    try {
        await createRating({ user_id, score, comment });

        return new NextResponse(null, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unexpected error while creating rating' },
            { status: 400 },
        );
    }
}
