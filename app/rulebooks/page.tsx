import type { Metadata } from "next";
import { RULEBOOKS } from "@/data/rulebooks";

export const metadata: Metadata = {
  title: "Rulebooks — Dominion 2026 | E-Sports Club CUJ",
  description: "Official BGMI and Free Fire rulebooks for Dominion 2026.",
};

export default function RulebooksPage() {
  const rulebooks = Object.values(RULEBOOKS);

  return (
    <main className="rulebooks-page">
      <nav className="page-nav" aria-label="Page navigation">
        <a href="/">Home</a>
        <a href="/register">Register</a>
      </nav>

      <header className="rulebooks-page__hero">
        <p className="meta">Dominion 2026 · Official documents</p>
        <h1 className="dsp">Game rulebooks</h1>
        <p>
          Read the rules for your game before registering. Each PDF opens in a
          new tab and can also be downloaded for offline access.
        </p>
      </header>

      <section className="rulebook-library" aria-label="Available rulebooks">
        {rulebooks.map((rulebook, index) => (
          <article className="rulebook-library__card" key={rulebook.game}>
            <div className="rulebook-library__topline">
              <span className="meta">Official PDF</span>
              <span aria-hidden="true">0{index + 1}</span>
            </div>
            <div>
              <h2 className="dsp">{rulebook.game}</h2>
              <p>Dominion 2026 rules and regulations</p>
            </div>
            <div className="rulebook-library__actions">
              <a
                className="button"
                href={rulebook.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read rulebook <span aria-hidden="true">↗</span>
              </a>
              <a className="rulebook-library__download" href={rulebook.href} download>
                Download PDF <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>
        ))}
      </section>

      <aside className="rulebooks-page__cta">
        <div>
          <p className="meta">Ready to compete?</p>
          <h2>Choose your game and register your squad.</h2>
        </div>
        <a className="button" href="/register">
          Register now <span aria-hidden="true">→</span>
        </a>
      </aside>
    </main>
  );
}
