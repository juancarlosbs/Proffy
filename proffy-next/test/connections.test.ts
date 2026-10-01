import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let GET: typeof import('@/app/connections/route').GET;
let POST: typeof import('@/app/connections/route').POST;

beforeAll(async () => {
    dbFile = await setupTestDb();

    const route = await import('@/app/connections/route');
    GET = route.GET;
    POST = route.POST;

    db = (await import('@/server/db')).default;
});

afterEach(async () => {
    await db('connections').del();
    await db('users').del();
});

afterAll(async () => {
    await teardownTestDb(dbFile, db);
});

async function createUser() {
    const [user_id] = await db('users').insert({
        name: 'Alan Turing',
        avatar: 'https://example.com/avatar.png',
        whatsapp: '11999999999',
        bio: 'Computer scientist',
    });
    return user_id;
}

describe('GET /connections', () => {
    it('returns the total number of connections', async () => {
        const user_id = await createUser();
        await db('connections').insert({ user_id });
        await db('connections').insert({ user_id });

        const res = await GET();

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ total: 2 });
    });

    it('returns zero when there are no connections', async () => {
        const res = await GET();

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ total: 0 });
    });
});

describe('POST /connections', () => {
    it('creates a new connection and returns 201 with no body', async () => {
        const user_id = await createUser();

        const req = new NextRequest('http://localhost/connections', {
            method: 'POST',
            body: JSON.stringify({ user_id }),
            headers: { 'Content-Type': 'application/json' },
        });

        const res = await POST(req);

        expect(res.status).toBe(201);
        const text = await res.text();
        expect(text).toBe('');

        const [{ total }] = await db('connections').count('* as total');
        expect(total).toBe(1);
    });
});
