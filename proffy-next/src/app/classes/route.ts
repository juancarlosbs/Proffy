import { NextRequest, NextResponse } from 'next/server';
import { and, eq, exists, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { classSchedule, classes, users } from '@/db/schema';
import convertHourtoMinutes from '@/utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const subject = searchParams.get('subject');
  const week_day = searchParams.get('week_day');
  const time = searchParams.get('time');

  if (!week_day || !subject || !time) {
    return NextResponse.json(
      { error: 'Missing filters to search classes' },
      { status: 400 },
    );
  }

  const timeInMinutes = convertHourtoMinutes(time);

  const rows = await db
    .select({ classes, users })
    .from(classes)
    .innerJoin(users, eq(classes.user_id, users.id))
    .where(
      and(
        eq(classes.subject, subject),
        exists(
          db
            .select()
            .from(classSchedule)
            .where(
              and(
                eq(classSchedule.class_id, classes.id),
                eq(classSchedule.week_day, Number(week_day)),
                sql`${classSchedule.from} <= ${timeInMinutes}`,
                sql`${classSchedule.to} > ${timeInMinutes}`,
              ),
            ),
        ),
      ),
    );

  const result = rows.map((row) => ({ ...row.classes, ...row.users }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { name, avatar, whatsapp, bio, subject, cost, schedule } = await request.json();

  try {
    await db.transaction((trx) => {
      const [insertedUser] = trx
        .insert(users)
        .values({ name, avatar, whatsapp, bio })
        .returning({ id: users.id })
        .all();

      const [insertedClass] = trx
        .insert(classes)
        .values({ subject, cost, user_id: insertedUser.id })
        .returning({ id: classes.id })
        .all();

      const classScheduleRows = (schedule as ScheduleItem[]).map((scheduleItem) => ({
        class_id: insertedClass.id,
        week_day: scheduleItem.week_day,
        from: convertHourtoMinutes(scheduleItem.from),
        to: convertHourtoMinutes(scheduleItem.to),
      }));

      trx.insert(classSchedule).values(classScheduleRows).run();
    });

    return new NextResponse(null, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Unexpected error while creating new class' },
      { status: 400 },
    );
  }
}
