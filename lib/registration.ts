// Pure helpers shared by the /register server action. No "use server" here —
// this file exports plain functions and constants, not server actions.

export const GAMES = ["BGMI", "Free Fire"] as const;
export type Game = (typeof GAMES)[number];

// 13 September 2026, 23:59 IST == 2026-09-13T18:29:59Z. Stored as a fixed UTC
// instant so the check doesn't depend on the server's local timezone.
export const REGISTRATION_DEADLINE_UTC = new Date("2026-09-13T18:29:59.000Z");

export function isRegistrationClosed(now: Date = new Date()): boolean {
  return now.getTime() > REGISTRATION_DEADLINE_UTC.getTime();
}

// Accepts "80821 94395", "8082194395", "+91 80821 94395", "080821 94395",
// "8082-194-395" and similar — strips spaces/dashes, a leading +91, and a
// leading 0, then requires exactly 10 digits.
export function normalizePhone(raw: string): string | null {
  let value = raw.replace(/[\s-]/g, "");
  if (value.startsWith("+91")) value = value.slice(3);
  if (value.startsWith("0")) value = value.slice(1);
  return /^\d{10}$/.test(value) ? value : null;
}

// University roll numbers look like "24BECSE62": 2-digit intake year,
// programme "BE", then a department code, then a trailing number. Only the
// department code is used for the same-department check. Rolls that don't
// match this shape return null so callers can skip the check and let the
// club verify by hand, rather than rejecting the team.
const ROLL_PATTERN = /^\d{2}BE([A-Z]{2,6})\d{2,4}$/i;

export function rollDepartmentCode(roll: string): string | null {
  const match = roll.trim().toUpperCase().match(ROLL_PATTERN);
  return match ? match[1] : null;
}
