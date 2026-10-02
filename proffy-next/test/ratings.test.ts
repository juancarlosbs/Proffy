import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let GET: typeof import('@/app/ratings/route').GET;
let POST: typeof import('@/app/ratings/route').POST;

beforeAll(async () => {
    dbFile = await setupTestDb();

    const route = await import('@/app/ratings/route');
    GET = route.GET;
    POST = route.POST;

    db = (await import('@/server/db')).default;
});

afterEach(async () => {
    await db('ratings').del();
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

function makeRequest(url: string, body: unknown) {
    return new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('GET /ratings', () => {
    it('returns the ratings for the given teacher', async () => {
        const user_id = await createUser();
        await db('ratings').insert({ user_id, stars: 5, comment: 'Ótimo!' });
        await db('ratings').insert({ user_id, stars: 3, comment: null });

        const req = new NextRequest(
            `http://localhost/ratings?user_id=${user_id}`,
        );
        const res = await GET(req);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(2);
    });

    it('returns 400 when user_id is missing', async () => {
        const req = new NextRequest('http://localhost/ratings');
        const res = await GET(req);

        expect(res.status).toBe(400);
    });
});

describe('POST /ratings', () => {
    it('creates a new rating and returns 201 with no body', async () => {
        const user_id = await createUser();

        const req = makeRequest('http://localhost/ratings', {
            user_id,
            stars: 4,
            comment: 'Muito bom',
        });

        const res = await POST(req);

        expect(res.status).toBe(201);
        const text = await res.text();
        expect(text).toBe('');

        const [{ total }] = await db('ratings').count('* as total');
        expect(total).toBe(1);
    });

    it('creates a rating without a comment', async () => {
        const user_id = await createUser();

        const req = makeRequest('http://localhost/ratings', {
            user_id,
            stars: 5,
        });

        const res = await POST(req);

        expect(res.status).toBe(201);
    });

    it('returns 400 when stars is out of range', async () => {
        const user_id = await createUser();

        const req = makeRequest('http://localhost/ratings', {
            user_id,
            stars: 6,
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    it('returns 400 when user_id is missing', async () => {
        const req = makeRequest('http://localhost/ratings', {
            stars: 5,
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    it('returns 400 with an error body when the teacher does not exist', async () => {
        const req = makeRequest('http://localhost/ratings', {
            user_id: 9999,
            stars: 5,
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: expect.any(String) });
    });
});
