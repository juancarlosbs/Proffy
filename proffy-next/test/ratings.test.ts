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

function postRequest(body: unknown) {
    return new NextRequest('http://localhost/ratings', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

function getRequest(userIds: number[]) {
    const url = new URL('http://localhost/ratings');
    userIds.forEach(id => url.searchParams.append('user_id', String(id)));
    return new NextRequest(url);
}

describe('POST /ratings', () => {
    it('creates a rating and returns 201 with no body', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id, score: 4, comment: 'Great teacher' }));

        expect(res.status).toBe(201);
        const text = await res.text();
        expect(text).toBe('');

        const [{ total }] = await db('ratings').count('* as total');
        expect(total).toBe(1);
    });

    it('creates a rating without a comment', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id, score: 3 }));

        expect(res.status).toBe(201);
        const [rating] = await db('ratings').where({ user_id });
        expect(rating.comment).toBeNull();
    });

    it('returns 400 when user_id is missing', async () => {
        const res = await POST(postRequest({ score: 4 }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('returns 400 when score is missing', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('returns 400 when score is out of range', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id, score: 6 }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('returns 400 when user_id does not reference an existing teacher', async () => {
        const res = await POST(postRequest({ user_id: 9999, score: 4 }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');

        const [{ total }] = await db('ratings').count('* as total');
        expect(total).toBe(0);
    });
});

describe('GET /ratings', () => {
    it('returns the average, count and comments for the given teachers', async () => {
        const user_id = await createUser();

        await POST(postRequest({ user_id, score: 4, comment: 'Good' }));
        await POST(postRequest({ user_id, score: 2, comment: '' }));
        await POST(postRequest({ user_id, score: 5 }));

        const res = await GET(getRequest([user_id]));

        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.summary).toEqual([{ user_id, average: 3.7, count: 3 }]);
        expect(body.comments).toHaveLength(1);
        expect(body.comments[0].comment).toBe('Good');
    });

    it('returns an empty summary and comments when no teachers are requested', async () => {
        const res = await GET(getRequest([]));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ summary: [], comments: [] });
    });
});
