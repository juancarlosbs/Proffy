import { customType, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// O schema legado (knex) declarava `created_at` como `time`; mantemos o tipo para não alterar o schema.
const time = customType<{ data: string }>({ dataType: () => "time" });

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  whatsapp: text("whatsapp").notNull(),
  bio: text("bio").notNull(),
});

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),
  cost: real("cost").notNull(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
});

export const classSchedule = sqliteTable("class_schedule", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  week_day: integer("week_day").notNull(),
  from: integer("from").notNull(),
  to: integer("to").notNull(),
  class_id: integer("class_id")
    .notNull()
    .references(() => classes.id, { onUpdate: "cascade", onDelete: "cascade" }),
});

export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  // O default literal (não a função) vem do schema legado e é preservado de propósito.
  created_at: time("created_at").notNull().default("CURRENT_TIMESTAMP"),
});
