import { NextRequest, NextResponse } from 'next/server';

import db from '@/server/db';

export async function GET() {
    const totalConnections = await db('connections').count('* as total');

    const { total } = totalConnections[0];

    return NextResponse.json({ total });
}

export async function POST(req: NextRequest) {
    const { user_id } = await req.json();

    await db('connections').insert({
        user_id,
    });

    return new NextResponse(null, { status: 201 });
}
