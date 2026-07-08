import React from "react";

const DEMAND_NODES = ["ACP Agents (Virtuals)", "Direct API (OpenAI-compatible)", "Rignode Console"];
const COORD_NODES = ["ACP Gateway", "Job Queue & Scheduler", "Verification Engine", "Payment Engine", "Reputation Ledger"];
const SUPPLY_NODES = ["Node Client (Go daemon)", "Docker sandbox", "Heartbeat telemetry", "Receive-only Solana wallet"];

const VERIFICATION = [
  {
    num: "01",
    title: "Canary jobs",
    body: "Hidden test jobs with known answers, indistinguishable from real work. Fail one and your trust score collapses.",
  },
  {
    num: "02",
    title: "Redundant execution",
    body: "New nodes: 100% of jobs double-run during probation. Trusted nodes: random 5–10% sampling. High-value jobs: always verified twice.",
  },
  {
    num: "03",
    title: "Economic reputation",
    body: "Trust rises slowly, falls instantly. The expected value of future work always exceeds what one fake job could steal. Cheating becomes irrational, not impossible.",
  },
];

const TIMELINE = [
  { label: "Request",          icon: "01" },
  { label: "Escrow locked",    icon: "02" },
  { label: "Scheduled",        icon: "03" },
  { label: "Executed in sandbox", icon: "04" },
  { label: "Verified",         icon: "05" },
  { label: "USDC payout",      icon: "06" },
];

const STACK = ["Go", "Docker", "vLLM", "llama.cpp", "gRPC", "PostgreSQL", "Redis", "Solana", "SPL / USDC", "ACP SDK"];

function LayerBox({ label, sublabel, chips, color }: { label: string; sublabel?: string; chips: string[]; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6" style={{ border: `1px solid ${color}` }}>
      <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color, fontFamily: "Space Grotesk, sans-serif" }}>{label}</div>
      {sublabel && <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>{sublabel}</div>}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.65)", fontFamily: "Space Grotesk, sans-serif" }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center my-0 py-1">
      <div className="flex flex-col items-center gap-0">
        <div style={{ width: 1, height: 20, background: "linear-gradient(to bottom, rgba(255,45,45,0.6), rgba(255,45,45,0.2))" }} />
        <div className="animate-ping w-2 h-2 rounded-full" style={{ background: "#FF2D2D", animationDuration: "1.8s" }} />
        <div style={{ width: 1, height: 20, background: "linear-gradient(to bottom, rgba(255,45,45,0.2), rgba(255,45,45,0.05))" }} />
      </div>
    </div>
  );
}

export function Architecture() {
  return (
    <div className="relative" style={{ background: "#0A0505" }}>
      {/* ── HERO ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="pill-badge-red mb-6 inline-flex"><div className="dot-red" />System Design</div>
          <h1 className="section-heading text-5xl md:text-7xl mb-6 text-white">
            Engineered to be<br />
            <span style={{ color: "#FF4D4D" }}>verified, not trusted.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>
            Every architectural decision traces back to one question: can this be independently verified? Here is the honest answer.
          </p>
        </div>
      </section>

      {/* ── SYSTEM DIAGRAM ── */}
      <section className="px-6 pb-28">
        <div className="container max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Architecture</div>
            <h2 className="section-heading text-3xl text-white">Three-tier system</h2>
          </div>
          <LayerBox label="Demand Layer" sublabel="Who submits inference jobs" chips={DEMAND_NODES} color="rgba(255,45,45,0.4)" />
          <Connector />
          <LayerBox label="Coordinator" sublabel="Scheduling, verification, settlement" chips={COORD_NODES} color="rgba(255,45,45,0.25)" />
          <Connector />
          <LayerBox label="Supply Layer" sublabel="Node operators running hardware" chips={SUPPLY_NODES} color="rgba(255,45,45,0.15)" />
        </div>
      </section>

      {/* ── VERIFICATION DEEP-DIVE ── */}
      <section className="px-6 pb-28" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container max-w-3xl mx-auto pt-20">
          <div className="mb-12">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Verification</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">How we check the work</h2>
            <p className="mt-3 text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>
              Three complementary mechanisms. None alone is sufficient. Together they make cheating economically irrational.
            </p>
          </div>
          <div className="space-y-4">
            {VERIFICATION.map((v) => (
              <div key={v.num} className="glass-card rounded-2xl p-7 flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
                  {v.num}
                </div>
                <div>
                  <div className="font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{v.title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB LIFECYCLE TIMELINE ── */}
      <section className="px-6 pb-28 relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 500, height: 500, left: -150, top: "50%", transform: "translateY(-50%)", opacity: 0.12 }} />
        <div className="container max-w-5xl mx-auto pt-20">
          <div className="mb-12 text-center">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Lifecycle</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">Every job, step by step</h2>
          </div>
          {/* Desktop horizontal */}
          <div className="hidden md:flex items-start gap-0">
            {TIMELINE.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 relative"
                    style={{ background: "rgba(255,45,45,0.15)", border: "1px solid rgba(255,45,45,0.4)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
                    {step.icon}
                    {i === TIMELINE.length - 1 && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#FF2D2D" }} />
                    )}
                  </div>
                  <div className="text-xs text-center font-medium" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Space Grotesk, sans-serif", maxWidth: 80 }}>{step.label}</div>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="flex-1 flex items-center mt-5">
                    <div className="w-full h-px" style={{ background: "linear-gradient(to right, rgba(255,45,45,0.4), rgba(255,45,45,0.1))" }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Mobile vertical */}
          <div className="flex md:hidden flex-col gap-0">
            {TIMELINE.map((step, i) => (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ background: "rgba(255,45,45,0.15)", border: "1px solid rgba(255,45,45,0.4)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
                    {step.icon}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(255,45,45,0.4), rgba(255,45,45,0.1))", marginTop: 2 }} />
                  )}
                </div>
                <div className="pt-1.5 pb-8">
                  <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>{step.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HONEST LIMITS ── */}
      <section className="px-6 pb-28">
        <div className="container max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10" style={{ background: "rgba(180,120,0,0.06)", border: "1px solid rgba(200,150,0,0.2)" }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full" style={{ background: "rgba(200,150,0,0.1)", border: "1px solid rgba(200,150,0,0.25)", color: "#C8A000", fontFamily: "Space Grotesk, sans-serif" }}>
                ⚠ Honest limits
              </span>
            </div>
            <h3 className="font-bold text-lg text-white mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>What we won't pretend</h3>
            <ul className="space-y-4">
              {[
                "The coordinator is centralized at MVP. Decentralizing it is roadmap, not marketing.",
                "Verification is probabilistic and economic, not cryptographic zkML. Full on-chain proof of every inference is not yet economically viable, and anyone claiming otherwise is selling you something.",
                "Inference runs in plaintext in your VRAM. Sensitive workloads use a trusted-tier of high-reputation nodes.",
                "We publish our limits before others discover them.",
              ].map((limit) => (
                <li key={limit} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#C0A060", fontFamily: "Inter, sans-serif" }}>
                  <span className="shrink-0 mt-1" style={{ color: "#C8A000" }}>·</span>
                  {limit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── STACK STRIP ── */}
      <section className="px-6 pb-24" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container max-w-3xl mx-auto pt-12 text-center">
          <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Tech Stack</div>
          <div className="flex flex-wrap justify-center gap-2">
            {STACK.map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
