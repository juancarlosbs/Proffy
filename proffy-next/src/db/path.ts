import fs from "node:fs";
import path from "node:path";

export function databasePath(): string {
  const file = process.env.DATABASE_PATH ?? path.resolve(process.cwd(), "data", "proffy.sqlite");
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}
