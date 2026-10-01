import path from 'path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import request from 'supertest';

import { db } from '@/db/client';
import { connections, users } from '@/db/schema';
import * as connectionsRoute from '@/app/connections/route';
import { createTestServer, registerRoute } from './testServer';

describe('/connections', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>;

  beforeAll(async () => {
    migrate(db, { migrationsFolder: path.resolve(__dirname, '../drizzle/migrations') });
    registerRoute('/connections', connectionsRoute);
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(async () => {
    await db.delete(connections).run();
    await db.delete(users).run();
  });

  it('GET returns the total count of connections', async () => {
    const response = await request(server.url).get('/connections');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ total: 0 });
  });

  it('POST creates a connection and GET reflects the new total', async () => {
    const [user] = await db
      .insert(users)
      .values({ name: 'Maria', avatar: 'a.png', whatsapp: '999', bio: 'bio' })
      .returning({ id: users.id })
      .all();

    const createResponse = await request(server.url)
      .post('/connections')
      .send({ user_id: user.id });

    expect(createResponse.status).toBe(201);

    const response = await request(server.url).get('/connections');
    expect(response.body).toEqual({ total: 1 });
  });
});
