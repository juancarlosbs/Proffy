import path from 'path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import request from 'supertest';

import { db } from '@/db/client';
import { classSchedule, classes, users } from '@/db/schema';
import * as classesRoute from '@/app/classes/route';
import { createTestServer, registerRoute } from './testServer';

describe('/classes', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>;

  beforeAll(async () => {
    migrate(db, { migrationsFolder: path.resolve(__dirname, '../drizzle/migrations') });
    registerRoute('/classes', classesRoute);
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(async () => {
    await db.delete(classSchedule).run();
    await db.delete(classes).run();
    await db.delete(users).run();
  });

  it('GET without filters returns 400', async () => {
    const response = await request(server.url).get('/classes');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing filters to search classes' });
  });

  it('POST creates user, class and schedule with correct class_id, then GET lists it', async () => {
    const createResponse = await request(server.url)
      .post('/classes')
      .send({
        name: 'Maria',
        avatar: 'avatar.png',
        whatsapp: '99999999',
        bio: 'bio',
        subject: 'Matemática',
        cost: 50,
        schedule: [{ week_day: 1, from: '08:00', to: '10:00' }],
      });

    expect(createResponse.status).toBe(201);

    const scheduleRows = await db.select().from(classSchedule);
    const classRows = await db.select().from(classes);
    expect(scheduleRows).toHaveLength(1);
    expect(scheduleRows[0].class_id).toBe(classRows[0].id);

    const listResponse = await request(server.url)
      .get('/classes')
      .query({ subject: 'Matemática', week_day: 1, time: '09:00' });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      subject: 'Matemática',
      name: 'Maria',
    });
  });

  it('GET with filters that do not match returns an empty array', async () => {
    const response = await request(server.url)
      .get('/classes')
      .query({ subject: 'Física', week_day: 2, time: '09:00' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST that fails to create schedule rolls back and returns 400', async () => {
    const response = await request(server.url)
      .post('/classes')
      .send({
        name: 'Joao',
        avatar: 'avatar.png',
        whatsapp: '99999999',
        bio: 'bio',
        subject: 'Português',
        cost: 50,
        schedule: [{ week_day: 1, from: 'invalid', to: '10:00' }],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Unexpected error while creating new class' });

    const userRows = await db.select().from(users);
    const classRows = await db.select().from(classes);
    expect(userRows).toHaveLength(0);
    expect(classRows).toHaveLength(0);
  });
});
