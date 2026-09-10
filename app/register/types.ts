// Plain types + initial state for the register form. Kept out of actions.ts
// because a "use server" file may only export async functions — anything
// else (a const, a type re-exported as a value, etc.) is invalid there.

import type { Game } from "@/lib/registration";

export type PlayerSummary = {
  role: string;
  name: string;
  ign: string;
  uid: string;
  roll: string;
};

export type SubmissionSummary = {
  game: Game;
  teamName: string;
  department: string;
  year: string;
  semester: string;
  iglPhone: string;
  players: PlayerSummary[];
};

export type RegisterActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; submission: SubmissionSummary };

export const initialRegisterState: RegisterActionState = { status: "idle" };
