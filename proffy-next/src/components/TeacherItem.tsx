"use client";

import Image from "next/image";
import { useState } from "react";

import whatsappIcon from "@/assets/images/icons/whatsapp.svg";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export interface Teacher {
  id: number;
  avatar: string;
  bio: string;
  cost: number;
  name: string;
  subject: string;
  whatsapp: string;
}

interface TeacherItemProps {
  teacher: Teacher;
}

export default function TeacherItem({ teacher }: TeacherItemProps) {
  const [favorited, setFavorited] = useState(() => isFavorite(teacher.id));

  function createNewConnection() {
    fetch("/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: teacher.id }),
    });
  }

  function handleToggleFavorite() {
    const nowFavorited = toggleFavorite(teacher);
    setFavorited(nowFavorited);
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
            favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          aria-pressed={favorited}
          className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center text-2xl transition-colors"
        >
          <span
            className={favorited ? "text-primary" : "text-line-in-white"}
            aria-hidden
          >
            {favorited ? "♥" : "♡"}
          </span>
        </button>
      </header>

      <p className="px-8 text-base leading-7">{teacher.bio}</p>

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
