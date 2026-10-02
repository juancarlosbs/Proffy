"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import whatsappIcon from "@/assets/images/icons/whatsapp.svg";
import purpleHeartIcon from "@/assets/images/icons/purple-heart.svg";
import { isFavorite, toggleFavorite } from "@/utils/favorites";
import { hasRated, markAsRated } from "@/utils/ratings";
import { getWeekDayLabel } from "@/utils/weekDays";

interface Rating {
  id: number;
  user_id: number;
  stars: number;
  comment: string | null;
  created_at: string;
}

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
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [rated, setRated] = useState(() => hasRated(teacher.id));
  const [showRatings, setShowRatings] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`/ratings?user_id=${teacher.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Rating[]) => {
        if (active) setRatings(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [teacher.id]);

  const totalRatings = ratings.length;
  const averageRating = totalRatings
    ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / totalRatings
    : 0;

  async function handleSubmitRating() {
    if (!selectedStars) return;

    setSubmitting(true);

    try {
      const res = await fetch("/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: teacher.id,
          stars: selectedStars,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        markAsRated(teacher.id);
        setRated(true);
        setRatings((prev) => [
          {
            id: Date.now(),
            user_id: teacher.id,
            stars: selectedStars,
            comment: comment.trim() || null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setSelectedStars(0);
        setComment("");
      }
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
          <span className="mt-1 block text-sm text-text-complement">
            {totalRatings > 0
              ? `★ ${averageRating.toFixed(1)} (${totalRatings} avaliação${
                  totalRatings > 1 ? "ões" : ""
                })`
              : "Sem avaliações"}
          </span>
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
        {totalRatings > 0 && (
          <button
            type="button"
            onClick={() => setShowRatings((prev) => !prev)}
            className="text-sm font-bold text-primary hover:underline"
          >
            {showRatings ? "Ocultar avaliações" : "Ver avaliações"}
          </button>
        )}

        {showRatings && (
          <ul className="mt-4 space-y-3">
            {ratings.map((rating) => (
              <li key={rating.id} className="border-b border-line-in-white pb-3 text-sm">
                <span className="font-archivo font-bold text-text-title">
                  {"★".repeat(rating.stars)}
                  {"☆".repeat(5 - rating.stars)}
                </span>
                {rating.comment && (
                  <p className="mt-1 text-text-complement">{rating.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {rated ? (
          <p className="mt-4 text-sm text-text-complement">
            Você já avaliou este proffy.
          </p>
        ) : (
          <div className="mt-4">
            <span className="mb-2 block text-sm font-bold text-text-title">
              Avaliar este proffy
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStars(star)}
                  aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                  className="text-2xl leading-none"
                >
                  {star <= selectedStars ? "★" : "☆"}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentário (opcional)"
              className="mt-2 w-full rounded-lg border border-line-in-white bg-transparent p-2 text-sm"
              rows={2}
            />
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={!selectedStars || submitting}
              className="mt-2 rounded-lg bg-secondary px-4 py-2 font-archivo text-sm font-bold text-button-text transition-colors hover:bg-secondary-dark disabled:opacity-50"
            >
              Enviar avaliação
            </button>
          </div>
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
