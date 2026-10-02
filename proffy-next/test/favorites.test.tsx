import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import Favorites from "@/app/favorites/page";
import type { Teacher } from "@/components/TeacherItem";

const STORAGE_KEY = "proffy:favorite-teachers";

const teacher: Teacher = {
  id: 1,
  avatar: "https://example.com/avatar.png",
  bio: "Bio de teste",
  cost: 50,
  name: "Maria Teste",
  subject: "Matemática",
  whatsapp: "5511999999999",
};

describe("Favorites page", () => {
  beforeEach(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([teacher]));
  });

  afterEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it("removes the card from the list immediately when unfavorited, without reload", () => {
    render(<Favorites />);

    expect(screen.getByText(teacher.name)).toBeInTheDocument();

    const removeButton = screen.getByRole("button", {
      name: "Remover dos favoritos",
    });
    fireEvent.click(removeButton);

    expect(screen.queryByText(teacher.name)).not.toBeInTheDocument();
  });
});
