"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import TeacherItem, { Teacher } from "@/components/TeacherItem";
import {
  getFavorites,
  updateFavoriteRatings,
  updateFavoriteSchedule,
} from "@/utils/favorites";

export default function Favorites() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => getFavorites());

  useEffect(() => {
    const teachersMissingSchedule = teachers.filter(
      (teacher) => teacher.schedule === undefined
    );

    teachersMissingSchedule.forEach(async (teacher) => {
      try {
        const res = await fetch(`/classes/schedule?user_id=${teacher.id}`);
        if (!res.ok) return;

        const schedule = await res.json();

        setTeachers((prev) =>
          prev.map((item) =>
            item.id === teacher.id ? { ...item, schedule } : item
          )
        );
        updateFavoriteSchedule(teacher.id, schedule);
      } catch {
        // backfill is best-effort; leave the card without schedule on failure
      }
    });

    teachers.forEach(async (teacher) => {
      try {
        const res = await fetch(`/teachers/ratings?user_id=${teacher.id}`);
        if (!res.ok) return;

        const ratings = await res.json();

        setTeachers((prev) =>
          prev.map((item) =>
            item.id === teacher.id ? { ...item, ...ratings } : item
          )
        );
        updateFavoriteRatings(teacher.id, ratings);
      } catch {
        // backfill is best-effort; leave the card without ratings on failure
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen">
      <PageHeader title="Seus proffys favoritos" />

      <main className="mx-auto my-8 w-[90%] lg1100:max-w-[740px] lg1100:py-8">
        {teachers.length === 0 && (
          <p className="mt-8 text-center text-base text-text-complement">
            Você ainda não favoritou nenhum proffy.
          </p>
        )}

        {teachers.map((teacher) => (
          <TeacherItem
            key={teacher.id}
            teacher={teacher}
            onUnfavorite={(id) =>
              setTeachers((prev) => prev.filter((item) => item.id !== id))
            }
          />
        ))}
      </main>
    </div>
  );
}
