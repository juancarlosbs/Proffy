"use client";

import { useState } from "react";

import PageHeader from "@/components/PageHeader";
import TeacherItem, { Teacher } from "@/components/TeacherItem";
import { getFavorites } from "@/utils/favorites";

export default function Favorites() {
  const [teachers] = useState<Teacher[]>(() => getFavorites());

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
          <TeacherItem key={teacher.id} teacher={teacher} />
        ))}
      </main>
    </div>
  );
}
