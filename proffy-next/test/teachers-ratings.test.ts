import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let GET: typeof import('@/app/teachers/ratings/route').GET;

beforeAll(async () => {
    dbFile = await setupTestDb();

    const route = await import('@/app/teachers/ratings/route');
    GET = route.GET;

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

function getRequest(query: Record<string, string>) {
    const url = new URL('http://localhost/teachers/ratings');
    for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
    }
    return new NextRequest(url);
}

describe('GET /teachers/ratings', () => {
    it('returns 400 when user_id is missing', async () => {
        const res = await GET(getRequest({}));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: 'Missing user_id' });
    });

    it('returns null avg_rating and zero count when there are no ratings', async () => {
        const user_id = await createUser();

        const res = await GET(getRequest({ user_id: String(user_id) }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({ avg_rating: null, ratings_count: 0, ratings: [] });
    });

    it('returns aggregated rating data for the given teacher', async () => {
        const user_id = await createUser();
        await db('ratings').insert({ user_id, score: 4, comment: 'Bom' });
        await db('ratings').insert({ user_id, score: 5, comment: null });

        const res = await GET(getRequest({ user_id: String(user_id) }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.avg_rating).toBe(4.5);
        expect(body.ratings_count).toBe(2);
        expect(body.ratings).toHaveLength(2);
    });
});
