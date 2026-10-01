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

describe('GET /classes', () => {
    it('returns 400 when required filters are missing', async () => {
        const res = await GET(getRequest({}));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: 'Missing filters to search classes' });
    });

    it('returns 400 when only some filters are provided', async () => {
        const res = await GET(getRequest({ subject: 'Matemática' }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: 'Missing filters to search classes' });
    });

    it('returns classes matching subject, week_day and time', async () => {
        await POST(postRequest(validClassPayload));

        const res = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({ subject: 'Matemática', name: 'Alan Turing' });
    });

    it('returns an empty list when no class matches the filters', async () => {
        await POST(postRequest(validClassPayload));

        const res = await GET(getRequest({ subject: 'Matemática', week_day: '2', time: '09:00' }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([]);
    });
});

describe('POST /classes', () => {
    it('creates a class with its schedule and returns 201 with no body', async () => {
        const res = await POST(postRequest(validClassPayload));

        expect(res.status).toBe(201);
        const text = await res.text();
        expect(text).toBe('');

        const [{ total: usersTotal }] = await db('users').count('* as total');
        const [{ total: classesTotal }] = await db('classes').count('* as total');
        const [{ total: scheduleTotal }] = await db('class_schedule').count('* as total');

        expect(usersTotal).toBe(1);
        expect(classesTotal).toBe(1);
        expect(scheduleTotal).toBe(1);
    });

    it('returns 400 when a required field is missing and does not block the pool', async () => {
        const { name, ...incompletePayload } = validClassPayload;
        void name;

        const res = await POST(postRequest(incompletePayload));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
        expect(typeof body.error).toBe('string');

        const [{ total: usersTotal }] = await db('users').count('* as total');
        expect(usersTotal).toBe(0);

        const followUp = await POST(postRequest(validClassPayload));
        expect(followUp.status).toBe(201);
    });

    it('returns 400 with "Invalid JSON body" for a malformed body', async () => {
        const req = new NextRequest('http://localhost/classes', {
            method: 'POST',
            body: 'not-json{',
            headers: { 'Content-Type': 'application/json' },
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toEqual({ error: 'Invalid JSON body' });
    });

    it('associates class_schedule with the correct class_id, not the user_id', async () => {
        await db('users').insert({
            name: 'Extra User',
            avatar: 'https://example.com/extra.png',
            whatsapp: '11988888888',
            bio: 'Desync helper',
        });

        const res = await POST(postRequest(validClassPayload));
        expect(res.status).toBe(201);

        const lastClass = await db('classes').orderBy('id', 'desc').first();
        const lastUser = await db('users').orderBy('id', 'desc').first();

        expect(lastClass.id).not.toBe(lastUser.id);

        const scheduleRows = await db('class_schedule').where({
            class_id: lastClass.id,
        });

        expect(scheduleRows).toHaveLength(1);

        const wrongScheduleRows = await db('class_schedule').where({
            class_id: lastUser.id,
        });

        expect(wrongScheduleRows).toHaveLength(0);
    });
});
