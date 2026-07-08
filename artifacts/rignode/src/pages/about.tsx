import React, { useState } from "react";
import { Twitter, Linkedin, Send, CheckCircle } from "lucide-react";

const PRINCIPLES = [
  { num: "01", title: "Honesty by design", body: "Our docs state what the system cannot do. Marketing never edits engineering." },
  { num: "02", title: "Non-custodial always", body: "Your wallet only receives. There is no internal balance we can freeze." },
  { num: "03", title: "Sandboxed by default", body: "Every job runs in an isolated container with no host access. You never trust the job; the isolation guarantees it." },
  { num: "04", title: "Demand before supply", body: "We validated paying customers before recruiting a single node. A network without demand is just idle GPUs with extra steps." },
];

const TEAM = [
  { role: "Founder & Protocol Lead",      initials: "AR", name: "A. Reyes",   bio: "Protocol architecture, economics, and operator relationships.", hue: "135deg,#FF2D2D,#7A0000" },
  { role: "Infrastructure Engineer",       initials: "MK", name: "M. Kim",     bio: "Node client, Docker sandbox hardening, telemetry pipeline.",   hue: "135deg,#B30000,#3A0000" },
  { role: "Verification & Security",       initials: "SP", name: "S. Patel",   bio: "Canary job design, redundancy sampling, reputation ledger.",    hue: "135deg,#FF4D4D,#800000" },
  { role: "Ecosystem & ACP Partnerships",  initials: "JL", name: "J. Lee",     bio: "ACP integrations, Virtuals partnership, agent onboarding.",     hue: "135deg,#CC0000,#500000" },
];

const STACK_CHIPS = ["Solana", "Virtuals ACP", "vLLM", "Docker", "USDC"];

const PINGS: { top: string; left: string; delay: string }[] = [
  { top: "22%", left: "12%",  delay: "0s" },
  { top: "38%", left: "52%",  delay: "0.8s" },
  { top: "18%", left: "70%",  delay: "0.4s" },
  { top: "62%", left: "28%",  delay: "1.2s" },
  { top: "55%", left: "78%",  delay: "0.6s" },
  { top: "72%", left: "48%",  delay: "1.6s" },
  { top: "30%", left: "88%",  delay: "0.2s" },
];

export function About() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="relative" style={{ background: "#0A0505" }}>
      {/* ── HERO ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.4 }} />
        <div className="container max-w-4xl mx-auto relative z-10">
          <div className="pill-badge-red mb-6 inline-flex"><div className="dot-red" />About RIGNODE</div>
          <h1 className="section-heading text-5xl md:text-7xl mb-6 text-white">
            Built by operators,<br />
            <span style={{ color: "#FF4D4D" }}>for operators.</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
            Rignode exists because the gap was obvious: an exploding economy of AI agents that buy compute autonomously, and millions of capable GPUs with no honest way to serve it.
          </p>
        </div>
      </section>

      {/* ── CONTRAST CARDS ── */}
      <section className="px-6 pb-24">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* What it IS */}
          <div className="glass-card p-8 rounded-2xl" style={{ border: "1px solid rgba(255,45,45,0.25)" }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>✦ What RIGNODE Is</div>
            <ul className="space-y-4">
              {[
                "A compute marketplace where hardware owners sell verified inference work",
                "Non-custodial payouts in USDC on Solana",
                "An ACP-native provider serving autonomous agent demand",
                "An open node client anyone can inspect",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ fontFamily: "Inter, sans-serif", color: "#D0D0D0", fontSize: 15, lineHeight: 1.7 }}>
                  <CheckCircle className="h-4 w-4 shrink-0 mt-1" style={{ color: "#FF4D4D" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What it's NOT */}
          <div className="glass-card p-8 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>✕ What RIGNODE Is Not</div>
            <ul className="space-y-4">
              {[
                "Not a yield farm",
                "Not token-gated",
                "Not custodial: we never hold your funds",
                "Not a promise of passive riches, earnings scale with real network demand",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ fontFamily: "Inter, sans-serif", color: "#6A6A6A", fontSize: 15, lineHeight: 1.7 }}>
                  <span className="shrink-0 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className="px-6 pb-28 relative">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 500, height: 500, bottom: -100, right: -100, opacity: 0.15 }} />
        <div className="container max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Principles</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">How we build</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PRINCIPLES.map((p) => (
              <div key={p.num} className="glass-card p-7 rounded-2xl group hover:border-red-900/40 transition-colors">
                <div className="text-xs font-bold tracking-widest mb-4" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{p.num}</div>
                <h3 className="font-bold text-lg text-white mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="px-6 pb-28" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="mb-12 text-center pt-20">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Team</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">People behind the node</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((m) => (
              <div key={m.name} className="glass-card rounded-2xl overflow-hidden group hover:border-red-900/30 transition-colors">
                {/* Avatar */}
                <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(${m.hue})`, opacity: 0.85 }}>
                  <span className="text-3xl font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif", opacity: 0.9 }}>{m.initials}</span>
                </div>
                <div className="p-5">
                  {/* Role badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
                    {m.role}
                  </div>
                  <div className="font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{m.name}</div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>{m.bio}</p>
                  <div className="flex gap-3">
                    <a href="#" className="transition-opacity opacity-30 hover:opacity-70"><Twitter className="h-4 w-4 text-white" /></a>
                    <a href="#" className="transition-opacity opacity-30 hover:opacity-70"><Linkedin className="h-4 w-4 text-white" /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORLD BAND ── */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#060202", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Dot-grid background */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,45,45,0.18) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Ping dots */}
        {PINGS.map((p, i) => (
          <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-60" style={{ background: "#FF2D2D", animationDelay: p.delay, animationDuration: "2s" }} />
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#FF4D4D" }} />
          </div>
        ))}
        <div className="container max-w-3xl mx-auto text-center relative z-10">
          <h2 className="section-heading text-3xl md:text-5xl text-white mb-4">
            Nodes around the world,<br />one settlement layer.
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>Every payout settles on Solana, one chain, sub-cent fees, verifiable on-chain.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {STACK_CHIPS.map((c) => (
              <span key={c} className="px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="px-6 py-28">
        <div className="container max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Contact</div>
            <h2 className="section-heading text-3xl md:text-4xl text-white">Get in touch</h2>
            <p className="mt-2 text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>Operators, integrators, researchers: we read every message.</p>
          </div>
          <div className="glass-card rounded-2xl p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <CheckCircle className="h-10 w-10" style={{ color: "#FF4D4D" }} />
                <p className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Message received.</p>
                <p className="text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {(["name", "email"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>
                      {field === "name" ? "Name" : "Email"}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      required
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "Inter, sans-serif" }}
                      placeholder={field === "name" ? "Your name" : "you@example.com"}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-colors resize-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "Inter, sans-serif" }}
                    placeholder="What's on your mind?"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Get in touch
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
