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

    it('includes the class schedule in the response, matched by class id even when it differs from the user id', async () => {
        // Insert a class row directly so the class created below gets an id different from its user's id.
        await db('classes').insert({ subject: 'Dummy', cost: 1, user_id: 1 });
        await POST(postRequest(validClassPayload));

        const res = await GET(getRequest({ subject: 'Matemática', week_day: '1', time: '09:00' }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0].id).not.toBe(undefined);
        expect(body[0].schedule).toEqual([
            { week_day: 1, from: 480, to: 720 },
        ]);
    });

    it('returns classes by ids (user ids) with their schedule, ignoring subject/week_day/time filters', async () => {
        await POST(postRequest(validClassPayload));
        const [user] = await db('users').orderBy('id', 'desc').limit(1);

        const res = await GET(getRequest({ ids: String(user.id) }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({ id: user.id, name: 'Alan Turing' });
        expect(body[0].schedule).toEqual([
            { week_day: 1, from: 480, to: 720 },
        ]);
    });

    it('returns an empty list for ids with no matching class', async () => {
        const res = await GET(getRequest({ ids: '999999' }));

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

    it('returns 400 (not 500) when required data is missing, and keeps the API usable afterwards', async () => {
        const payloadWithoutName = { ...validClassPayload } as Partial<typeof validClassPayload>;
        delete payloadWithoutName.name;

        const res = await POST(postRequest(payloadWithoutName));

        expect(res.status).toBe(400);

        const [{ total: usersTotal }] = await db('users').count('* as total');
        const [{ total: classesTotal }] = await db('classes').count('* as total');
        expect(usersTotal).toBe(0);
        expect(classesTotal).toBe(0);

        const followUpRes = await POST(postRequest(validClassPayload));
        expect(followUpRes.status).toBe(201);
    });

    it('returns a clear 400 error when the request body is not valid JSON', async () => {
        const req = new NextRequest('http://localhost/classes', {
            method: 'POST',
            body: '{not valid json',
            headers: { 'Content-Type': 'application/json' },
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('stores the schedule linked to the class id, not the user id', async () => {
        // Insert a class row directly (foreign keys are off in this schema) so that the
        // next class created has a different id than the user created alongside it.
        await db('classes').insert({ subject: 'Dummy', cost: 1, user_id: 1 });

        const res = await POST(postRequest(validClassPayload));
        expect(res.status).toBe(201);

        const [user] = await db('users').orderBy('id', 'desc').limit(1);
        const [createdClass] = await db('classes').where({ subject: 'Matemática' }).orderBy('id', 'desc').limit(1);

        expect(createdClass.id).not.toBe(user.id);

        const schedules = await db('class_schedule').where({ class_id: createdClass.id });
        expect(schedules).toHaveLength(1);
    });
});
