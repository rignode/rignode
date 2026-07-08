import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const NODE_STEPS = [
  { num: "01", title: "Download the node client", body: "Windows & Linux, single installer. No dependencies to manage. The client ships its own runtime." },
  { num: "02", title: "Automatic hardware detection", body: "GPU model, VRAM, drivers, and bandwidth are detected and benchmarked. Specs are proven on-chain, not self-reported." },
  { num: "03", title: "Paste your Solana address", body: "Receive-only. The app never asks for or stores a private key. Your wallet is a destination, not a credential." },
  { num: "04", title: "Pass the mandatory benchmark", body: "Your rig runs reference prompts with known answers. If the output matches, you pass. If not, diagnose before going live." },
  { num: "05", title: "Go online", body: "The scheduler routes jobs matching your capability, trust score, and region. You can set minimum rates and model restrictions." },
  { num: "06", title: "Track everything", body: "Live earnings, trust score, job history. Every payout linked to an on-chain Solana transaction you can verify in Explorer." },
];

const COMPUTE_STEPS = [
  { num: "01", title: "Get an API key", body: "Or connect natively through ACP if you're an agent. Either path routes to the same verified compute pool." },
  { num: "02", title: "Pick a catalog model", body: "Llama, Qwen, Mistral, Whisper, embeddings. Curated, signed images only, no arbitrary code from unknown sources." },
  { num: "03", title: "Funds lock in escrow", body: "Payment is guaranteed to providers, delivery is guaranteed to you. The smart contract holds the balance until verification clears." },
  { num: "04", title: "Results are verified", body: "Canary jobs plus redundancy sampling run before output is released. You don't receive unverified work." },
  { num: "05", title: "Pay only for verified output", body: "If verification fails, escrow is not released. You are not charged for work that doesn't pass." },
];

const FAQS = [
  {
    q: "Do I need to buy a token to earn?",
    a: "No. You earn USDC for verified work. No token purchase, stake, or NFT is ever required.",
  },
  {
    q: "Is this safe for my PC?",
    a: "Jobs run inside isolated Docker containers with no host filesystem access and whitelisted networking. Only signed images from our registry ever run.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts are batched on Solana (roughly hourly or at a $1 threshold) to keep fees near zero. Every payout has an on-chain signature.",
  },
  {
    q: "What hardware qualifies?",
    a: "Mid-range consumer GPUs (8GB+ VRAM) for LLM inference. More device classes including CPUs and Apple Silicon are on the roadmap.",
  },
  {
    q: "Can node operators see my data?",
    a: "At MVP, inference runs in plaintext on provider hardware. Sensitive workloads should use the trusted-tier. We state this limit openly (see Architecture).",
  },
  {
    q: "Who pays for the jobs?",
    a: "Real clients: AI agents buying through ACP escrow and developers using the direct API. We built demand before supply. A network without buyers is just idle GPUs.",
  },
];

const CODE = `curl https://api.rignode.xyz/v1/chat/completions \\
  -H "Authorization: Bearer $RIGNODE_KEY" \\
  -d '{"model":"llama-3.1-8b","messages":[{"role":"user","content":"Hello"}]}'`;

function StepCard({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex gap-5 items-start">
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
        style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.25)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
        {num}
      </div>
      <div>
        <div className="font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{title}</div>
        <p className="text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{body}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-medium text-white text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "#FF4D4D" }} /> : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>
      {open && (
        <div className="px-6 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="pt-4 text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export function HowItWorks() {
  const [tab, setTab] = useState<"node" | "compute">("node");

  return (
    <div className="relative" style={{ background: "#0A0505" }}>
      {/* ── HERO ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="pill-badge-red mb-6 inline-flex"><div className="dot-red" />How It Works</div>
          <h1 className="section-heading text-5xl md:text-7xl mb-6 text-white">
            Simple steps.<br />
            <span style={{ color: "#FF4D4D" }}>Honest payouts.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>
            Whether you're selling compute or buying inference, here's exactly how it works. No surprises.
          </p>
        </div>
      </section>

      {/* ── STICKY TOGGLE ── */}
      <div className="sticky top-16 z-30 px-6 pb-6 pt-2" style={{ background: "rgba(10,5,5,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="inline-flex rounded-full p-1 gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => setTab("node")}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                background: tab === "node" ? "linear-gradient(135deg,#FF2D2D,#B30000)" : "transparent",
                color: tab === "node" ? "#fff" : "rgba(255,255,255,0.4)",
                boxShadow: tab === "node" ? "0 0 16px rgba(255,45,45,0.4)" : "none",
              }}
            >
              Run a Node
            </button>
            <button
              onClick={() => setTab("compute")}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                background: tab === "compute" ? "linear-gradient(135deg,#FF2D2D,#B30000)" : "transparent",
                color: tab === "compute" ? "#fff" : "rgba(255,255,255,0.4)",
                boxShadow: tab === "compute" ? "0 0 16px rgba(255,45,45,0.4)" : "none",
              }}
            >
              Buy Compute
            </button>
          </div>
        </div>
      </div>

      {/* ── RUN A NODE ── */}
      {tab === "node" && (
        <section className="px-6 py-16">
          <div className="container max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="section-heading text-3xl text-white mb-2">Run a Node</h2>
              <p className="text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>Six steps from download to first payout. Real work. Real hardware. Real payouts.</p>
            </div>
            <div className="space-y-4 mb-10">
              {NODE_STEPS.map((s) => <StepCard key={s.num} {...s} />)}
            </div>
            {/* Earnings honesty callout */}
            <div className="rounded-2xl p-7" style={{ background: "rgba(255,45,45,0.05)", borderLeft: "3px solid #FF2D2D", border: "1px solid rgba(255,45,45,0.2)" }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Earnings: honest answer</div>
              <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
                We won't promise you numbers. Earnings scale with network demand, your utilization, and your hardware. The built-in profitability calculator asks for your electricity rate and tells you the truth, <span style={{ color: "rgba(255,255,255,0.6)" }}>including when running a node would lose you money.</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── BUY COMPUTE ── */}
      {tab === "compute" && (
        <section className="px-6 py-16">
          <div className="container max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="section-heading text-3xl text-white mb-2">Buy Compute</h2>
              <p className="text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>OpenAI-compatible API. ACP-native for agents. Pay only for verified output.</p>
            </div>
            <div className="space-y-4 mb-10">
              {COMPUTE_STEPS.map((s) => <StepCard key={s.num} {...s} />)}
            </div>
            {/* Code block */}
            <div className="rounded-2xl overflow-hidden mb-10" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>
                <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>shell</span>
              </div>
              <pre className="px-5 py-5 overflow-x-auto text-sm leading-relaxed" style={{ background: "#050202", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "rgba(255,255,255,0.7)" }}>
                <code>{CODE}</code>
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="px-6 pb-28" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container max-w-3xl mx-auto pt-20">
          <div className="mb-10">
            <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />FAQ</div>
            <h2 className="section-heading text-3xl text-white">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
