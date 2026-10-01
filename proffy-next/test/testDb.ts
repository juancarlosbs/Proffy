import fs from 'fs';
import os from 'os';
import path from 'path';
import knex, { type Knex } from 'knex';

export async function setupTestDb() {
    const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'proffy-test-')), 'database.sqlite');
    process.env.PROFFY_DB_FILE = dbFile;

    const migrationDb = knex({
        client: 'better-sqlite3',
        connection: { filename: dbFile },
        migrations: {
            directory: path.resolve(__dirname, '..', 'src', 'server', 'database', 'migrations'),
            extension: 'ts',
        },
        useNullAsDefault: true,
    });

    await migrationDb.migrate.latest();
    await migrationDb.destroy();

    return dbFile;
}

export async function teardownTestDb(dbFile: string, db: Knex) {
    await db.destroy();
    fs.rmSync(path.dirname(dbFile), { recursive: true, force: true });
}
