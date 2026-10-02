"use client";

import { useState } from "react";
import Image from "next/image";

import whatsappIcon from "@/assets/images/icons/whatsapp.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";
import { isFavorite, toggleFavorite } from "@/utils/favorites";
import { getWeekDayLabel } from "@/utils/weekDays";

export interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export interface Teacher {
  id: number;
  avatar: string;
  bio: string;
  cost: number;
  name: string;
  subject: string;
  whatsapp: string;
  schedule?: ScheduleItem[];
}

interface TeacherItemProps {
  teacher: Teacher;
  onUnfavorite?: (teacherId: number) => void;
}

export default function TeacherItem({ teacher, onUnfavorite }: TeacherItemProps) {
  const [favorite, setFavorite] = useState(() => isFavorite(teacher.id));

  function createNewConnection() {
    fetch("/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: teacher.id }),
    });
  }

  function handleToggleFavorite() {
    const newFavorite = toggleFavorite(teacher);
    setFavorite(newFavorite);

    if (!newFavorite) {
      onUnfavorite?.(teacher.id);
    }
  }

  return (
    <article className="mt-6 overflow-hidden rounded-lg border border-line-in-white bg-box-base">
      <header className="flex items-center p-8">
        <Image
          src={teacher.avatar}
          alt={teacher.name}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 rounded-full object-cover"
        />
        <div className="ml-6 flex-1">
          <strong className="block font-archivo text-2xl font-bold text-text-title">
            {teacher.name}
          </strong>
          <span className="mt-1 block text-base">{teacher.subject}</span>
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={
            favorite
              ? "Remover dos favoritos"
              : "Adicionar aos favoritos"
          }
          aria-pressed={favorite}
          className="h-8 w-8 shrink-0 transition-opacity hover:opacity-70"
        >
          <Image
            src={purpleHeartIcon}
            alt=""
            className={favorite ? "opacity-100" : "opacity-30"}
          />
        </button>
      </header>

      <p className="px-8 text-base leading-7">{teacher.bio}</p>

      {teacher.schedule && teacher.schedule.length > 0 && (
        <ul className="px-8 pt-4">
          {teacher.schedule.map((item, index) => (
            <li
              key={index}
              className="font-archivo text-sm text-text-complement"
            >
              {getWeekDayLabel(item.week_day)} — {item.from} às {item.to}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-8 flex items-center justify-between border-t border-line-in-white bg-box-footer p-8">
        <p className="text-base">
          Preço/hora
          <strong className="block text-base text-primary lg1100:ml-4 lg1100:inline">
            R$ {teacher.cost}
          </strong>
        </p>
        <a
          target="_blank"
          rel="noreferrer"
          onClick={createNewConnection}
          href={`https://wa.me/${teacher.whatsapp}`}
          className="flex h-14 w-[200px] items-center justify-evenly rounded-lg bg-secondary font-archivo text-sm font-bold text-button-text no-underline transition-colors hover:bg-secondary-dark lg1100:w-[245px] lg1100:justify-center lg1100:text-base"
        >
          <Image src={whatsappIcon} alt="Whatsapp" className="lg1100:mr-4" />
          Entrar em contato
        </a>
      </footer>
    </article>
  );
}
