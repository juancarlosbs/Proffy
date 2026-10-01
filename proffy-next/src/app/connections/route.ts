import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { connections } from '@/db/schema';

export async function GET() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(connections);

  return NextResponse.json({ total });
}

export async function POST(request: NextRequest) {
  const { user_id } = await request.json();

  await db.insert(connections).values({ user_id }).run();

  return new NextResponse(null, { status: 201 });
}
