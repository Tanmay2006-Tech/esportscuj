// Placeholder home page. Built in Step 2 per the build plan — this just
// keeps "/" from 404ing while /register is developed.
export default function HomePage() {
  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <p className="meta">E-Sports Club CUJ</p>
      <h1 className="dsp" style={{ fontSize: "2rem", marginTop: 12 }}>
        Home page — coming in Step 2
      </h1>
      <p style={{ marginTop: 16 }}>
        <a className="button" href="/register">
          Register for Dominion 2026
        </a>
      </p>
    </main>
  );
}
