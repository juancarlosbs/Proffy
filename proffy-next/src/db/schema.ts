import { sql } from 'drizzle-orm';
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  whatsapp: text('whatsapp').notNull(),
  bio: text('bio').notNull(),
});

export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subject: text('subject').notNull(),
  cost: numeric('cost').notNull(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
});

export const classSchedule = sqliteTable('class_schedule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  week_day: integer('week_day').notNull(),
  from: integer('from').notNull(),
  to: integer('to').notNull(),
  class_id: integer('class_id')
    .notNull()
    .references(() => classes.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
});

export const connections = sqliteTable('connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  created_at: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
