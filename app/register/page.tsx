import type { Metadata } from "next";
import { EVENT } from "@/data/event";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register — Dominion 2026 | E-Sports Club CUJ",
  description: "Register your squad for Dominion 2026, 15 September 2026.",
};

export default function RegisterPage() {
  return (
    <main className="register wrap">
      <nav className="page-nav" aria-label="Page navigation">
        <a href="/">Home</a>
        <a href="/rulebooks">Rulebooks</a>
      </nav>
      <div className="register__intro">
        <p className="meta">Dominion 2026 registration</p>
        <h1 className="dsp">Register your squad</h1>
        <dl className="register__facts">
          <div>
            <dt>Date</dt>
            <dd>{EVENT.date}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{EVENT.time}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{EVENT.venue}</dd>
          </div>
          <div>
            <dt>Registration closes</dt>
            <dd>{EVENT.registrationCloses}</dd>
          </div>
        </dl>
        <ul className="register__notices">
          <li>{EVENT.ownDeviceNotice}</li>
          <li>{EVENT.idNotice}</li>
        </ul>
      </div>
      <RegisterForm />
    </main>
  );
}
