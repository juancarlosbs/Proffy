"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

import whatsappIcon from "@/assets/images/icons/whatsapp.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";
import { isFavorite, toggleFavorite } from "@/utils/favorites";
import { hasRated, markRated } from "@/utils/ratings";
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
  averageRating?: number | null;
  ratingsCount?: number;
}

interface Comment {
  user_id: number;
  comment: string;
  created_at: string;
}

interface TeacherItemProps {
  teacher: Teacher;
  onUnfavorite?: (teacherId: number) => void;
}

export default function TeacherItem({ teacher, onUnfavorite }: TeacherItemProps) {
  const [favorite, setFavorite] = useState(() => isFavorite(teacher.id));
  const [rated, setRated] = useState(() => hasRated(teacher.id));
  const [averageRating, setAverageRating] = useState(teacher.averageRating ?? null);
  const [ratingsCount, setRatingsCount] = useState(teacher.ratingsCount ?? 0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);

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

  async function handleToggleComments() {
    const next = !showComments;
    setShowComments(next);

    if (next && comments === null) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/ratings?user_id=${teacher.id}`);
        const data = await res.json();
        setComments(data.comments ?? []);
      } catch {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function handleSubmitRating(e: FormEvent) {
    e.preventDefault();

    if (!score) return;

    setSubmitting(true);

    try {
      const res = await fetch("/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: teacher.id,
          score,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) return;

      markRated(teacher.id);
      setRated(true);

      const newCount = ratingsCount + 1;
      const newAverage =
        Math.round((((averageRating ?? 0) * ratingsCount + score) / newCount) * 10) / 10;
      setAverageRating(newAverage);
      setRatingsCount(newCount);

      if (comment.trim() && comments !== null) {
        setComments([
          ...comments,
          { user_id: teacher.id, comment: comment.trim(), created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setSubmitting(false);
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

      <div className="px-8 pt-4">
        <p className="text-sm text-text-complement">
          {ratingsCount > 0
            ? `${averageRating!.toFixed(1)} ⭐ (${ratingsCount} avaliação${ratingsCount > 1 ? "ões" : ""})`
            : "Sem avaliações"}
        </p>

        <button
          type="button"
          onClick={handleToggleComments}
          className="mt-2 text-sm font-bold text-primary hover:text-primary-dark"
        >
          {showComments ? "Ocultar avaliações" : "Ver avaliações"}
        </button>

        {showComments && (
          <div className="mt-2">
            {loadingComments && <p className="text-sm">Carregando...</p>}
            {!loadingComments && comments && comments.length === 0 && (
              <p className="text-sm text-text-complement">Nenhum comentário ainda.</p>
            )}
            {!loadingComments && comments && comments.length > 0 && (
              <ul className="space-y-2">
                {comments.map((item, index) => (
                  <li key={index} className="text-sm text-text-complement">
                    {item.comment}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {rated ? (
          <p className="mt-4 text-sm font-bold text-text-complement">Você já avaliou</p>
        ) : (
          <form onSubmit={handleSubmitRating} className="mt-4 space-y-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                  aria-pressed={score >= value}
                  className={score >= value ? "opacity-100" : "opacity-30"}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentário (opcional)"
              className="w-full rounded-lg border border-line-in-white bg-input-background p-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!score || submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-button-text disabled:opacity-50"
            >
              Avaliar
            </button>
          </form>
        )}
      </div>

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
