import type { Game } from "@/lib/registration";

export type Rulebook = {
  game: Game;
  href: string;
  available: boolean;
};

// Set `available` to true after adding the PDFs at these exact public paths.
export const RULEBOOKS: Record<Game, Rulebook> = {
  BGMI: {
    game: "BGMI",
    href: "/rulebooks/dominion-2026-bgmi.pdf",
    available: true,
  },
  "Free Fire": {
    game: "Free Fire",
    href: "/rulebooks/dominion-2026-free-fire.pdf",
    available: true,
  },
};
