import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const STATEMENTS = [
  {
    body: "SETI@home proved people would donate their cycles. Mining proved they would sell them. Cloud proved businesses would buy them. Each wave turned wasted computation into value, and each wave needed new rails to do it.",
  },
  {
    body: "The next wave has already begun. Autonomous AI agents (trading, researching, creating) now buy services from each other through machine-to-machine payments. The next buyers of compute are not humans.",
  },
  {
    body: "Agents don't need data centers. They need billions of small inferences: cheap, fast enough, and payable on-chain. This workload fits consumer hardware perfectly, the same GPUs sitting idle 20 hours a day in homes across the planet.",
  },
  {
    body: "Work, not speculation. Rignode pays for verified output. No staking to unlock earnings. No NFT passes. No token you must buy first. If your hardware works, you earn. If it doesn't, you don't. That's the entire model.",
  },
];

const MISSION_CARDS = [
  {
    label: "MISSION",
    body: "Connect the world's idle consumer hardware to autonomous machine demand, with verification and payouts no one has to trust, only verify.",
  },
  {
    label: "PROMISE",
    body: "We publish our limits before others discover them. Every constraint of this system is documented openly.",
  },
  {
    label: "MEASURE",
    body: "One metric matters: USDC earned by node operators for verified work. Everything else is vanity.",
  },
];

export function Vision() {
  return (
    <div className="relative" style={{ background: "#0A0505" }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 700, height: 700, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }} />
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="pill-badge-red mb-8 inline-flex fade-up">
            <div className="dot-red animate-pulse-dot" />
            VISION
          </div>
          <h1 className="fade-up-1 section-heading text-4xl sm:text-6xl md:text-7xl leading-[1.02] text-white">
            Every wave of computing<br />
            <span style={{ color: "#FF4D4D" }}>created a market</span><br />
            for idle capacity.
          </h1>
        </div>
      </section>

      {/* ── STATEMENT BLOCKS ── */}
      <div>
        {STATEMENTS.map((s, i) => (
          <section
            key={i}
            className="relative px-6 py-20 md:py-28"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: i % 2 === 1 ? "rgba(0,0,0,0.25)" : "transparent",
            }}
          >
            {i === 1 && (
              <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.1 }} />
            )}
            <div className="container max-w-3xl mx-auto relative z-10">
              <p
                className="text-xl md:text-2xl leading-relaxed font-medium"
                style={{ color: i % 2 === 0 ? "#C0C0C0" : "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}
              >
                {s.body}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* ── VISION QUOTE CARD ── */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.25 }} />
        <div className="container max-w-4xl mx-auto relative z-10">
          <div
            className="relative p-10 md:p-16 rounded-3xl text-center"
            style={{
              background: "rgba(255,45,45,0.06)",
              border: "1px solid rgba(255,45,45,0.2)",
              boxShadow: "0 0 80px rgba(255,45,45,0.12), inset 0 0 40px rgba(255,45,45,0.04)",
            }}
          >
            {/* Corner accents */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 48, height: 48, borderTop: "2px solid rgba(255,45,45,0.5)", borderLeft: "2px solid rgba(255,45,45,0.5)", borderRadius: "12px 0 0 0" }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 48, height: 48, borderTop: "2px solid rgba(255,45,45,0.5)", borderRight: "2px solid rgba(255,45,45,0.5)", borderRadius: "0 12px 0 0" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 48, height: 48, borderBottom: "2px solid rgba(255,45,45,0.5)", borderLeft: "2px solid rgba(255,45,45,0.5)", borderRadius: "0 0 0 12px" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 48, height: 48, borderBottom: "2px solid rgba(255,45,45,0.5)", borderRight: "2px solid rgba(255,45,45,0.5)", borderRadius: "0 0 12px 0" }} />

            <div className="text-4xl mb-8" style={{ color: "rgba(255,45,45,0.35)" }}>"</div>
            <blockquote
              className="text-2xl md:text-3xl font-semibold leading-snug text-white"
              style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.02em" }}
            >
              A world where anyone with a capable machine can sell honest computation to an economy of machines, and get paid like it's 2026, not 1996.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── MISSION STRIP ── */}
      <section className="px-6 pb-28" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="container max-w-5xl mx-auto pt-20">
          <div className="text-center mb-16">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />The Foundation</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">Mission, promise, and measure</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {MISSION_CARDS.map((c) => (
              <div
                key={c.label}
                className="glass-card p-8 rounded-2xl relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,45,0.5), transparent)" }}
                />
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-5"
                  style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {c.label}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#A0A0A0", fontFamily: "Inter, sans-serif", lineHeight: 1.8 }}
                >
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-6 text-center overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.2 }} />
        <div className="container max-w-2xl mx-auto relative z-10">
          <p className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>
            Convinced? Read the reasoning.
          </p>
          <h2 className="section-heading text-4xl text-white mb-8">
            The case is in<br />
            <span style={{ color: "#FF4D4D" }}>the thesis.</span>
          </h2>
          <Link href="/thesis">
            <button className="btn-primary text-base px-8 py-3">
              Read the Thesis <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
