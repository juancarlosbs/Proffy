import { beforeAll, describe, expect, it } from "vitest";

import { getDb } from "@/db";
import { setupDb } from "./helpers";

beforeAll(setupDb);

type Column = { name: string; type: string; notnull: number; dflt_value: string | null; pk: number };

const columns = (table: string) =>
  (getDb().$client.prepare(`pragma table_info(${table})`).all() as Column[]).map(
    ({ name, type, notnull, dflt_value, pk }) => ({ name, type: type.toLowerCase(), notnull, dflt_value, pk }),
  );

const foreignKeys = (table: string) =>
  getDb().$client.prepare(`pragma foreign_key_list(${table})`).all();

describe("schema do banco (igual ao do knex legado)", () => {
  it("users", () => {
    expect(columns("users").map((c) => [c.name, c.notnull, c.pk])).toEqual([
      ["id", 1, 1], ["name", 1, 0], ["avatar", 1, 0], ["whatsapp", 1, 0], ["bio", 1, 0],
    ]);
  });

  it("classes", () => {
    expect(columns("classes").map((c) => [c.name, c.type, c.notnull])).toEqual([
      ["id", "integer", 1], ["subject", "text", 1], ["cost", "real", 1], ["user_id", "integer", 1],
    ]);
    expect(foreignKeys("classes")).toMatchObject([
      { table: "users", from: "user_id", to: "id", on_update: "CASCADE", on_delete: "CASCADE" },
    ]);
  });

  it("class_schedule", () => {
    expect(columns("class_schedule").map((c) => c.name)).toEqual([
      "id", "week_day", "from", "to", "class_id",
    ]);
    expect(foreignKeys("class_schedule")).toMatchObject([
      { table: "classes", from: "class_id", to: "id", on_update: "CASCADE", on_delete: "CASCADE" },
    ]);
  });

  it("connections", () => {
    expect(columns("connections")).toMatchObject([
      { name: "id", pk: 1 },
      { name: "user_id", notnull: 1 },
      { name: "created_at", type: "time", notnull: 1, dflt_value: "'CURRENT_TIMESTAMP'" },
    ]);
    expect(foreignKeys("connections")).toMatchObject([
      { table: "users", from: "user_id", to: "id", on_update: "CASCADE", on_delete: "CASCADE" },
    ]);
  });
});
