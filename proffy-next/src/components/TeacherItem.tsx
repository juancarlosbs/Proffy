"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

import whatsappIcon from "@/assets/images/icons/whatsapp.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";
import { isFavorite, toggleFavorite } from "@/utils/favorites";
import { hasRated, markAsRated } from "@/utils/ratings";
import { getWeekDayLabel } from "@/utils/weekDays";

export interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export interface RatingItem {
  score: number;
  comment: string | null;
  created_at: string;
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
  avg_rating?: number | null;
  ratings_count?: number;
  ratings?: RatingItem[];
}

interface TeacherItemProps {
  teacher: Teacher;
  onUnfavorite?: (teacherId: number) => void;
}

export default function TeacherItem({ teacher, onUnfavorite }: TeacherItemProps) {
  const [favorite, setFavorite] = useState(() => isFavorite(teacher.id));
  const [rated, setRated] = useState(() => hasRated(teacher.id));
  const [showRatings, setShowRatings] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const ratingsCount = teacher.ratings_count ?? 0;
  const comments = (teacher.ratings ?? []).filter((item) => item.comment);

  async function submitRating(e: FormEvent) {
    e.preventDefault();

    if (score < 1 || score > 5) {
      setRatingError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setSubmitting(true);
    setRatingError(null);

    try {
      const res = await fetch("/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: teacher.id,
          score,
          comment: comment || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setRatingError(body?.error ?? "Não foi possível enviar a avaliação.");
        return;
      }

      markAsRated(teacher.id);
      setRated(true);
    } catch {
      setRatingError("Não foi possível enviar a avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

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

      <div className="px-8 pt-4">
        <p className="font-archivo text-sm text-text-complement">
          {ratingsCount > 0
            ? `${teacher.avg_rating?.toFixed(1)} ★ (${ratingsCount} avaliações)`
            : "Sem avaliações"}
        </p>

        {ratingsCount > 0 && (
          <button
            type="button"
            onClick={() => setShowRatings((prev) => !prev)}
            className="mt-1 text-sm font-bold text-primary hover:text-primary-dark"
          >
            {showRatings ? "Ocultar avaliações" : "Ver avaliações"}
          </button>
        )}

        {showRatings && (
          <ul className="mt-2">
            {comments.length === 0 && (
              <li className="text-sm text-text-complement">
                Nenhum comentário ainda.
              </li>
            )}
            {comments.map((item, index) => (
              <li key={index} className="mt-2 text-sm text-text-complement">
                {item.score} ★ — {item.comment}
              </li>
            ))}
          </ul>
        )}

        {rated ? (
          <p className="mt-4 text-sm text-text-complement">
            Você já avaliou
          </p>
        ) : (
          <form onSubmit={submitRating} className="mt-4 space-y-2">
            <div
              role="radiogroup"
              aria-label="Nota"
              className="flex space-x-1"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={score === value}
                  aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                  onClick={() => setScore(value)}
                  className="text-2xl leading-none"
                >
                  {score >= value ? "★" : "☆"}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentário (opcional)"
              className="w-full rounded-lg border border-line-in-white bg-input-background p-2 text-sm outline-none"
            />
            {ratingError && (
              <p className="text-sm text-red-500">{ratingError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-secondary px-4 py-2 font-archivo text-sm font-bold text-button-text transition-colors hover:bg-secondary-dark disabled:opacity-50"
            >
              Enviar avaliação
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
