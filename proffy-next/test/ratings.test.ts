import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let POST: typeof import('@/app/ratings/route').POST;

beforeAll(async () => {
    dbFile = await setupTestDb();

    const route = await import('@/app/ratings/route');
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

describe('POST /ratings', () => {
    it('creates a new rating and returns 201 with no body', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id, score: 5, comment: 'Ótimo!' }));

        expect(res.status).toBe(201);
        const text = await res.text();
        expect(text).toBe('');

        const [rating] = await db('ratings').where({ user_id });
        expect(rating).toMatchObject({ user_id, score: 5, comment: 'Ótimo!' });
    });

    it('creates a new rating without a comment', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id, score: 3 }));

        expect(res.status).toBe(201);

        const [rating] = await db('ratings').where({ user_id });
        expect(rating.comment).toBeNull();
    });

    it.each([0, 6, 3.5, -1])(
        'returns 400 with { error } when score is out of range (%s)',
        async (score) => {
            const user_id = await createUser();

            const res = await POST(postRequest({ user_id, score }));

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toHaveProperty('error');

            const ratingsCount = await db('ratings').where({ user_id });
            expect(ratingsCount).toHaveLength(0);
        },
    );

    it('returns 400 with { error } when score is missing', async () => {
        const user_id = await createUser();

        const res = await POST(postRequest({ user_id }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('returns 400 with { error } when user_id does not exist', async () => {
        const res = await POST(postRequest({ user_id: 999999, score: 4 }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');

        const [{ total }] = await db('ratings').count('* as total');
        expect(total).toBe(0);
    });
});
