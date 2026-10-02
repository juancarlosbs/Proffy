const STORAGE_KEY = "proffy:rated-teachers";

function readAll(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(teacherIds: number[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teacherIds));
}

export function hasRated(teacherId: number): boolean {
  return readAll().includes(teacherId);
}

export function markAsRated(teacherId: number) {
  const rated = readAll();
  if (rated.includes(teacherId)) return;

  writeAll([...rated, teacherId]);
}
