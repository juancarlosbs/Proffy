import path from 'path';
import type { Knex } from 'knex';

const config: Knex.Config = {
    client: 'better-sqlite3',
    connection: {
        filename: process.env.PROFFY_DB_FILE ?? path.resolve(process.cwd(), 'src', 'server', 'database', 'database.sqlite'),
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'server', 'database', 'migrations'),
        extension: 'ts',
    },
    useNullAsDefault: true,
};

export default config;
