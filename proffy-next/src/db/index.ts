import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { databasePath } from "./path";
import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const globalForDb = globalThis as unknown as { __proffyDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__proffyDb) {
    const client = new Database(databasePath());
    // O sqlite3 do knex não impõe chaves estrangeiras; o better-sqlite3 impõe por padrão.
    // Desligado para manter o comportamento da API original.
    client.pragma("foreign_keys = OFF");
    globalForDb.__proffyDb = drizzle(client, { schema });
  }
  return globalForDb.__proffyDb;
}

export { schema };
