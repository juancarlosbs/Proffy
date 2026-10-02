import { NextRequest, NextResponse } from 'next/server';

import { countConnections, createConnection } from '@/server/connections';

export async function GET() {
    const totalConnections = await countConnections();

    const { total } = totalConnections[0];

    return NextResponse.json({ total });
}

export async function POST(req: NextRequest) {
    const { user_id } = await req.json();

    await createConnection(user_id);

    return new NextResponse(null, { status: 201 });
}
