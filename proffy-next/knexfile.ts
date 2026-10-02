import path from 'path';
import type { Knex } from 'knex';

const config: Knex.Config = {
    client: 'better-sqlite3',
    connection: {
        filename: process.env.PROFFY_DB_FILE ?? path.resolve(process.cwd(), 'src', 'server', 'database', 'database.sqlite'),
    },
    migrations: {
        directory: path.resolve(process.cwd(), 'src', 'server', 'database', 'migrations'),
        extension: 'ts',
    },
    useNullAsDefault: true,
    // better-sqlite3 enforces foreign keys by default; the legacy sqlite3 driver did not.
    pool: {
        afterCreate: (conn: { pragma: (sql: string) => void }, done: (err: Error | null, conn: unknown) => void) => {
            conn.pragma('foreign_keys = OFF');
            done(null, conn);
        },
    },
};

export default config;
