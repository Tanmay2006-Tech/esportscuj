"use client";

import { useActionState, useState } from "react";
import { GAMES, type Game } from "@/lib/registration";
import { registerAction } from "./actions";
import { initialRegisterState } from "./types";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;
const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
] as const;

function uidLabel(game: Game | ""): string {
  if (game === "BGMI") return "BGMI UID";
  if (game === "Free Fire") return "Free Fire UID";
  return "In-game UID";
}

type PlayerFieldsProps = {
  prefix: string;
  legend: string;
  uidLabelText: string;
  optional?: boolean;
  onRemove?: () => void;
};

function PlayerFields({
  prefix,
  legend,
  uidLabelText,
  optional,
  onRemove,
}: PlayerFieldsProps) {
  return (
    <fieldset className="field-group">
      <div className="field-group__head">
        <legend>{legend}</legend>
        {optional && onRemove ? (
          <button type="button" className="link-btn" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <div className="field-row">
        <label htmlFor={`${prefix}_name`}>
          Full name
          <input
            id={`${prefix}_name`}
            name={`${prefix}_name`}
            type="text"
            autoComplete="off"
            required={!optional}
          />
        </label>
        <label htmlFor={`${prefix}_ign`}>
          In-game name (IGN)
          <input
            id={`${prefix}_ign`}
            name={`${prefix}_ign`}
            type="text"
            autoComplete="off"
            required={!optional}
          />
        </label>
      </div>
      <div className="field-row">
        <label htmlFor={`${prefix}_uid`}>
          {uidLabelText}
          <input
            id={`${prefix}_uid`}
            name={`${prefix}_uid`}
            type="text"
            autoComplete="off"
            required={!optional}
          />
        </label>
        <label htmlFor={`${prefix}_roll`}>
          Roll number
          <input
            id={`${prefix}_roll`}
            name={`${prefix}_roll`}
            type="text"
            autoComplete="off"
            placeholder="e.g. 24BECSE62"
            required={!optional}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialRegisterState
  );
  const [game, setGame] = useState<Game | "">("");
  const [extraSlots, setExtraSlots] = useState(0); // 0, 1 or 2 -> shows p3, p3+p4

  if (state.status === "success") {
    const { submission } = state;
    return (
      <section className="success" aria-live="polite">
        <p className="success__eyebrow">Registration received</p>
        <h2>Screenshot this page</h2>
        <p className="success__note">
          There are no confirmation emails. This page is the only record you
          will get — save it now.
        </p>

        <dl className="success__facts">
          <div>
            <dt>Game</dt>
            <dd>{submission.game}</dd>
          </div>
          <div>
            <dt>Team name</dt>
            <dd>{submission.teamName}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{submission.department}</dd>
          </div>
          <div>
            <dt>Year / semester</dt>
            <dd>
              {submission.year}, {submission.semester}
            </dd>
          </div>
          <div>
            <dt>IGL phone</dt>
            <dd>{submission.iglPhone}</dd>
          </div>
        </dl>

        <table className="success__table">
          <caption>Players</caption>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Name</th>
              <th scope="col">IGN</th>
              <th scope="col">UID</th>
              <th scope="col">Roll number</th>
            </tr>
          </thead>
          <tbody>
            {submission.players.map((p) => (
              <tr key={p.role}>
                <td>{p.role}</td>
                <td>{p.name}</td>
                <td>{p.ign}</td>
                <td>{p.uid}</td>
                <td>{p.roll}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <a className="button" href="/register">
          Register another team
        </a>
      </section>
    );
  }

  return (
    <form action={formAction} className="register-form" noValidate>
      {state.status === "error" ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Honeypot — hidden from real users, left empty by them. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset className="field-group">
        <legend>Game</legend>
        <div className="game-panels" role="radiogroup" aria-label="Game">
          {GAMES.map((g) => (
            <label
              key={g}
              className={`game-panel${game === g ? " game-panel--selected" : ""}`}
            >
              <input
                type="radio"
                name="game"
                value={g}
                checked={game === g}
                onChange={() => setGame(g)}
                required
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>Team</legend>
        <div className="field-row">
          <label htmlFor="teamName">
            Team name
            <input id="teamName" name="teamName" type="text" required />
          </label>
        </div>
        <div className="field-row">
          <label htmlFor="department">
            Department
            <input
              id="department"
              name="department"
              type="text"
              placeholder="e.g. Computer Science and Engineering"
              required
            />
          </label>
        </div>
        <div className="field-row">
          <label htmlFor="year">
            Year
            <select id="year" name="year" defaultValue="" required>
              <option value="" disabled>
                Select year
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="semester">
            Semester
            <select id="semester" name="semester" defaultValue="" required>
              <option value="" disabled>
                Select semester
              </option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <PlayerFields prefix="igl" legend="IGL (Player 1)" uidLabelText={uidLabel(game)} />
      <div className="field-row">
        <label htmlFor="igl_phone">
          IGL phone number
          <input
            id="igl_phone"
            name="igl_phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 98765 43210"
            required
          />
        </label>
      </div>

      <PlayerFields prefix="p2" legend="Player 2" uidLabelText={uidLabel(game)} />

      {extraSlots >= 1 && (
        <PlayerFields
          prefix="p3"
          legend="Player 3"
          uidLabelText={uidLabel(game)}
          optional
          onRemove={() => setExtraSlots(0)}
        />
      )}
      {extraSlots >= 2 && (
        <PlayerFields
          prefix="p4"
          legend="Player 4"
          uidLabelText={uidLabel(game)}
          optional
          onRemove={() => setExtraSlots(1)}
        />
      )}

      {extraSlots < 2 ? (
        <button
          type="button"
          className="link-btn"
          onClick={() => setExtraSlots((n) => Math.min(n + 1, 2))}
        >
          + Add player
        </button>
      ) : null}

      <button type="submit" className="button" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
