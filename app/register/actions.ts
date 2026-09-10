"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  GAMES,
  isRegistrationClosed,
  normalizePhone,
  rollDepartmentCode,
  type Game,
} from "@/lib/registration";
import type { RegisterActionState } from "./types";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

type RequiredPlayer = { name: string; ign: string; uid: string; roll: string };

function readOptionalPlayer(
  formData: FormData,
  prefix: string,
  label: string
): { ok: true; player: RequiredPlayer | null } | { ok: false; message: string } {
  const name = field(formData, `${prefix}_name`);
  const ign = field(formData, `${prefix}_ign`);
  const uid = field(formData, `${prefix}_uid`);
  const roll = field(formData, `${prefix}_roll`);
  const filledCount = [name, ign, uid, roll].filter(Boolean).length;

  if (filledCount === 0) return { ok: true, player: null };
  if (filledCount < 4) {
    return {
      ok: false,
      message: `${label} is missing a name, IGN, UID or roll number.`,
    };
  }
  return { ok: true, player: { name, ign, uid, roll } };
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  // Honeypot. Deliberately vague — this message should not help a bot iterate.
  if (field(formData, "website") !== "") {
    return { status: "error", message: "Submission could not be processed." };
  }

  if (isRegistrationClosed()) {
    return {
      status: "error",
      message: "Registration closed on 13 September 2026 at 11:59 PM IST.",
    };
  }

  const game = field(formData, "game");
  if (!GAMES.includes(game as Game)) {
    return { status: "error", message: "Select a game." };
  }

  const teamName = field(formData, "teamName");
  const department = field(formData, "department");
  const year = field(formData, "year");
  const semester = field(formData, "semester");

  if (!teamName) return { status: "error", message: "Team name is required." };
  if (!department)
    return { status: "error", message: "Department is required." };
  if (!year) return { status: "error", message: "Year is required." };
  if (!semester) return { status: "error", message: "Semester is required." };

  const igl = {
    name: field(formData, "igl_name"),
    ign: field(formData, "igl_ign"),
    uid: field(formData, "igl_uid"),
    roll: field(formData, "igl_roll"),
    phone: field(formData, "igl_phone"),
  };
  if (!igl.name || !igl.ign || !igl.uid || !igl.roll || !igl.phone) {
    return { status: "error", message: "All IGL fields are required." };
  }

  const normalizedPhone = normalizePhone(igl.phone);
  if (!normalizedPhone) {
    return {
      status: "error",
      message: "Enter a valid 10-digit phone number for the IGL.",
    };
  }

  const p2 = {
    name: field(formData, "p2_name"),
    ign: field(formData, "p2_ign"),
    uid: field(formData, "p2_uid"),
    roll: field(formData, "p2_roll"),
  };
  if (!p2.name || !p2.ign || !p2.uid || !p2.roll) {
    return { status: "error", message: "A second player is required." };
  }

  const p3Result = readOptionalPlayer(formData, "p3", "Player 3");
  if (!p3Result.ok) return { status: "error", message: p3Result.message };

  const p4Result = readOptionalPlayer(formData, "p4", "Player 4");
  if (!p4Result.ok) return { status: "error", message: p4Result.message };

  const players: Array<RequiredPlayer & { role: string }> = [
    { role: "IGL", name: igl.name, ign: igl.ign, uid: igl.uid, roll: igl.roll },
    { role: "Player 2", ...p2 },
    ...(p3Result.player ? [{ role: "Player 3", ...p3Result.player }] : []),
    ...(p4Result.player ? [{ role: "Player 4", ...p4Result.player }] : []),
  ];

  // Duplicate UID within this submission only — cross-team duplicates are
  // checked by hand before the event, see README.md.
  const seenUids = new Map<string, string>();
  for (const p of players) {
    const key = p.uid.trim().toLowerCase();
    if (seenUids.has(key)) {
      return {
        status: "error",
        message: `UID "${p.uid}" is used more than once in this team.`,
      };
    }
    seenUids.set(key, p.role);
  }

  // Same-department check, via the department segment of each roll number.
  // Roll numbers that don't match the expected pattern are skipped rather
  // than rejected, so the club can verify those by hand — but every skip is
  // recorded in dept_check_note so those rows are easy to find in the export.
  const iglDept = rollDepartmentCode(igl.roll);
  if (iglDept) {
    for (const p of players.slice(1)) {
      const dept = rollDepartmentCode(p.roll);
      if (dept && dept !== iglDept) {
        return {
          status: "error",
          message: `${p.role}'s roll number is from a different department than the IGL's.`,
        };
      }
    }
  }

  const unverifiedRoles = players
    .filter((p) => !rollDepartmentCode(p.roll))
    .map((p) => p.role);

  let deptCheckNote: string | null = null;
  if (unverifiedRoles.length === players.length) {
    deptCheckNote =
      "Not verified — no roll number in this team matched the expected pattern.";
  } else if (unverifiedRoles.length > 0) {
    deptCheckNote = `Not verified for: ${unverifiedRoles.join(", ")}.`;
  }

  const { error } = await supabaseAdmin.from("registrations").insert({
    game,
    team_name: teamName,
    department,
    year,
    semester,
    igl_name: igl.name,
    igl_ign: igl.ign,
    igl_uid: igl.uid,
    igl_roll: igl.roll,
    igl_phone: normalizedPhone,
    p2_name: p2.name,
    p2_ign: p2.ign,
    p2_uid: p2.uid,
    p2_roll: p2.roll,
    p3_name: p3Result.player?.name ?? null,
    p3_ign: p3Result.player?.ign ?? null,
    p3_uid: p3Result.player?.uid ?? null,
    p3_roll: p3Result.player?.roll ?? null,
    p4_name: p4Result.player?.name ?? null,
    p4_ign: p4Result.player?.ign ?? null,
    p4_uid: p4Result.player?.uid ?? null,
    p4_roll: p4Result.player?.roll ?? null,
    dept_check_note: deptCheckNote,
  });

  if (error) {
    console.error("registration insert failed:", error);
    return {
      status: "error",
      message: "We could not save your registration. Please try again.",
    };
  }

  return {
    status: "success",
    submission: {
      game: game as Game,
      teamName,
      department,
      year,
      semester,
      iglPhone: normalizedPhone,
      players,
    },
  };
}
