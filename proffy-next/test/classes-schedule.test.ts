import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let GET: typeof import('@/app/classes/schedule/route').GET;
let POST: typeof import('@/app/classes/route').POST;

beforeAll(async () => {
    dbFile = await setupTestDb();

    GET = (await import('@/app/classes/schedule/route')).GET;
    POST = (await import('@/app/classes/route')).POST;

    db = (await import('@/server/db')).default;
});

afterEach(async () => {
    await db('class_schedule').del();
    await db('classes').del();
    await db('users').del();
});

afterAll(async () => {
    await teardownTestDb(dbFile, db);
});

function getRequest(query: Record<string, string>) {
    const url = new URL('http://localhost/classes/schedule');
    for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
    }
    return new NextRequest(url);
}

function postRequest(body: unknown) {
    return new NextRequest('http://localhost/classes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

const validClassPayload = {
    name: 'Alan Turing',
    avatar: 'https://example.com/avatar.png',
    whatsapp: '11999999999',
    bio: 'Computer scientist',
    subject: 'Matemática',
    cost: 50,
    schedule: [
        { week_day: 1, from: '08:00', to: '12:00' },
    ],
};

describe('GET /classes/schedule', () => {
    it('returns 400 when user_id is missing', async () => {
        const res = await GET(getRequest({}));

        expect(res.status).toBe(400);
    });

    it('returns the schedule for an existing user_id', async () => {
        await POST(postRequest(validClassPayload));

        const [user] = await db('users').orderBy('id', 'desc').limit(1);

        const res = await GET(getRequest({ user_id: String(user.id) }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([
            { week_day: 1, from: '08:00', to: '12:00' },
        ]);
    });

    it('returns an empty list for a non-existent user_id', async () => {
        const res = await GET(getRequest({ user_id: '999999' }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([]);
    });
});
