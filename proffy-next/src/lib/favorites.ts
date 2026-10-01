import { Teacher } from "@/components/TeacherItem";

const STORAGE_KEY = "proffy:favorites";

function readFavorites(): Teacher[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as Teacher[];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: Teacher[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function getFavorites(): Teacher[] {
  return readFavorites();
}

export function isFavorite(id: number): boolean {
  return readFavorites().some((teacher) => teacher.id === id);
}

export function toggleFavorite(teacher: Teacher): boolean {
  const favorites = readFavorites();
  const exists = favorites.some((item) => item.id === teacher.id);

  const next = exists
    ? favorites.filter((item) => item.id !== teacher.id)
    : [...favorites, teacher];

  writeFavorites(next);

  return !exists;
}
