import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import type { Knex } from 'knex';

import { setupTestDb, teardownTestDb } from './testDb';

let dbFile: string;
let db: Knex;
let GET: typeof import('@/app/classes/route').GET;
let POST: typeof import('@/app/classes/route').POST;

beforeAll(async () => {
    dbFile = await setupTestDb();

    const route = await import('@/app/classes/route');
    GET = route.GET;
    POST = route.POST;

    db = (await import('@/server/db')).default;
});

afterEach(async () => {
    await db('ratings').del();
    await db('class_schedule').del();
    await db('classes').del();
    await db('users').del();
});

afterAll(async () => {
    await teardownTestDb(dbFile, db);
});

function getRequest(query: Record<string, string>) {
    const url = new URL('http://localhost/classes');
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

describe('GET /classes ratings aggregation', () => {
    it('returns ratings_count 0 and avg_rating null when there are no ratings', async () => {
        await POST(postRequest(validClassPayload));

        const res = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));
        const body = await res.json();

        expect(body[0].ratings_count).toBe(0);
        expect(body[0].avg_rating).toBeNull();
        expect(body[0].ratings).toEqual([]);
    });

    it('rounds avg_rating to 1 decimal place', async () => {
        await POST(postRequest(validClassPayload));

        const res1 = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));
        const [{ id: user_id }] = await res1.json();

        await db('ratings').insert({ user_id, score: 4, comment: 'Bom professor' });
        await db('ratings').insert({ user_id, score: 5, comment: null });

        const res2 = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));
        const body = await res2.json();

        expect(body[0].avg_rating).toBe(4.5);
        expect(body[0].ratings_count).toBe(2);
        expect(body[0].ratings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ score: 4, comment: 'Bom professor' }),
                expect.objectContaining({ score: 5, comment: null }),
            ]),
        );
    });

    it('only includes ratings belonging to the matching teacher', async () => {
        await POST(postRequest(validClassPayload));
        await POST(postRequest({ ...validClassPayload, name: 'Ada Lovelace' }));

        const res1 = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));
        const [teacherA, teacherB] = await res1.json();

        await db('ratings').insert({ user_id: teacherA.id, score: 1 });

        const res2 = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));
        const body = await res2.json();

        const resultA = body.find((t: { id: number }) => t.id === teacherA.id);
        const resultB = body.find((t: { id: number }) => t.id === teacherB.id);

        expect(resultA.ratings_count).toBe(1);
        expect(resultB.ratings_count).toBe(0);
    });
});
