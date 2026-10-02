import { Teacher } from "@/components/TeacherItem";

const STORAGE_KEY = "proffy:favorite-teachers";

function readAll(): Teacher[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(teachers: Teacher[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
}

export function getFavorites(): Teacher[] {
  return readAll();
}

export function isFavorite(teacherId: number): boolean {
  return readAll().some((teacher) => teacher.id === teacherId);
}

export function addFavorite(teacher: Teacher) {
  const favorites = readAll();
  if (favorites.some((item) => item.id === teacher.id)) return;

  writeAll([...favorites, teacher]);
}

export function updateFavorite(teacher: Teacher) {
  const favorites = readAll();
  if (!favorites.some((item) => item.id === teacher.id)) return;

  writeAll(
    favorites.map((item) => (item.id === teacher.id ? teacher : item)),
  );
}

export function removeFavorite(teacherId: number) {
  writeAll(readAll().filter((teacher) => teacher.id !== teacherId));
}

export function toggleFavorite(teacher: Teacher): boolean {
  if (isFavorite(teacher.id)) {
    removeFavorite(teacher.id);
    return false;
  }

  addFavorite(teacher);
  return true;
}
