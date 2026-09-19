import { and, eq, exists, sql } from "drizzle-orm";

import { getDb, schema } from "@/db";
import convertHourToMinutes from "@/lib/convertHourToMinutes";
import { empty, json, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

const { classes, classSchedule, users } = schema;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const subject = params.get("subject");
  const weekDay = params.get("week_day");
  const time = params.get("time");

  if (!weekDay || !subject || !time) {
    return json({ error: "Missing filters to search classes" }, 400);
  }

  const timeInMinutes = convertHourToMinutes(time);
  const db = getDb();

  // `id` vem de `users` (como no `select classes.*, users.*` original, em que users.id sobrescrevia classes.id).
  const rows = db
    .select({
      id: users.id,
      subject: classes.subject,
      cost: classes.cost,
      user_id: classes.user_id,
      name: users.name,
      avatar: users.avatar,
      whatsapp: users.whatsapp,
      bio: users.bio,
    })
    .from(classes)
    .innerJoin(users, eq(classes.user_id, users.id))
    .where(
      and(
        exists(
          db
            .select({ one: sql`1` })
            .from(classSchedule)
            .where(
              and(
                eq(classSchedule.class_id, classes.id),
                eq(classSchedule.week_day, Number(weekDay)),
                sql`${classSchedule.from} <= ${timeInMinutes}`,
                sql`${classSchedule.to} > ${timeInMinutes}`,
              ),
            ),
        ),
        eq(classes.subject, subject),
      ),
    )
    .all();

  return json(rows);
}

export async function POST(req: Request) {
  try {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = await req.json();

    getDb().transaction((tx) => {
      const user = tx.insert(users).values({ name, avatar, whatsapp, bio }).run();
      const user_id = Number(user.lastInsertRowid);

      tx.insert(classes).values({ subject, cost, user_id }).run();

      // Comportamento legado preservado: o `class_id` do horário é o id do usuário, não o da aula.
      const class_id = user_id;

      const classSchedules = (schedule as ScheduleItem[]).map((item) => ({
        class_id,
        week_day: item.week_day,
        from: convertHourToMinutes(item.from),
        to: convertHourToMinutes(item.to),
      }));

      tx.insert(classSchedule).values(classSchedules).run();
    });

    return empty(201);
  } catch {
    return json({ error: "Unexpected error while creating new class" }, 400);
  }
}
