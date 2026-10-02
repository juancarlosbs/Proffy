"use client";

import { useEffect, useState } from "react";

import PageHeader from "@/components/PageHeader";
import TeacherItem, { Teacher } from "@/components/TeacherItem";
import { getFavorites, updateFavorite } from "@/utils/favorites";

export default function Favorites() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => getFavorites());

  useEffect(() => {
    teachers
      .filter((teacher) => !teacher.schedule)
      .forEach(async (teacher) => {
        try {
          const res = await fetch(`/classes/${teacher.id}`);
          if (!res.ok) return;

          const updatedTeacher = await res.json();

          updateFavorite(updatedTeacher);
          setTeachers((prev) =>
            prev.map((item) =>
              item.id === updatedTeacher.id ? updatedTeacher : item,
            ),
          );
        } catch {
          // ignore backfill failures
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
