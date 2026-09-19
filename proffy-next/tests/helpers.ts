import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

process.env.DATABASE_PATH = ":memory:";

import { getDb } from "@/db";

export function setupDb() {
  const db = getDb();
  migrate(db, { migrationsFolder: path.resolve(__dirname, "..", "drizzle") });
  return db;
}

export function resetDb() {
  const { $client } = getDb();
  for (const table of ["class_schedule", "classes", "connections", "users"]) {
    $client.exec(`DELETE FROM ${table}`);
  }
  $client.exec("DELETE FROM sqlite_sequence");
}

export function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const teacher = {
  name: "Diego",
  avatar: "https://example.com/a.png",
  whatsapp: "11999999999",
  bio: "Professor de química",
  subject: "Química",
  cost: 80,
  schedule: [
    { week_day: 1, from: "8:00", to: "12:00" },
    { week_day: 3, from: "13:30", to: "18:00" },
  ],
};
