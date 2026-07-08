import { useState, useEffect } from "react";
import { useGetNetworkStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Cpu, Zap, Shield, TrendingUp, Terminal, Lock, Globe, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

/* ── Floating glass chip ───────────────────────────────────── */
function Chip({ icon: Icon, label, style }: { icon: any; label: string; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute flex items-center gap-2 px-3 py-2 animate-float"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        backdropFilter: "blur(12px)",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: "rgba(255,255,255,0.7)",
        fontFamily: "Space Grotesk, sans-serif",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: "#FF4D4D" }} />
      {label}
    </div>
  );
}

/* ── GPU Fan (SVG spinning blades) ─────────────────────────── */
function GpuFan({ size = 90, delay = "0s", uid = "0" }: { size?: number; delay?: string; uid?: string }) {
  const blades = 7;
  const gradId = `fan-blade-${uid}`;
  const hubGradId = `fan-hub-${uid}`;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      border: "2.5px solid #FF2D2D",
      boxShadow: "0 0 20px rgba(255,45,45,0.6), 0 0 8px rgba(255,45,45,0.25) inset",
      background: "#0c0606",
      position: "relative", overflow: "hidden",
    }}>
      <svg
        viewBox="0 0 100 100"
        width={size - 5} height={size - 5}
        style={{
          position: "absolute", top: 0, left: 0,
          animation: "spin-fast 1.6s linear infinite",
          animationDelay: delay,
        }}
      >
        <defs>
          <radialGradient id={gradId} cx="65%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4a1a1a" />
            <stop offset="60%" stopColor="#2a0d0d" />
            <stop offset="100%" stopColor="#120505" />
          </radialGradient>
          <radialGradient id={hubGradId} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ff6060" />
            <stop offset="100%" stopColor="#cc1a1a" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="49" fill="#0c0606" />

        {/* 7 fan blades */}
        {Array.from({ length: blades }).map((_, i) => (
          <g key={i} transform={`rotate(${i * (360 / blades)} 50 50)`}>
            <path
              d="M50,50 C56,36 72,24 82,14 C76,10 62,16 54,26 C52,30 50,40 50,50"
              fill={`url(#${gradId})`}
              stroke="rgba(255,60,60,0.3)"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Center hub */}
        <circle cx="50" cy="50" r="9" fill={`url(#${hubGradId})`} />
        <circle cx="50" cy="50" r="5" fill="#FF2D2D" />
        <circle cx="50" cy="50" r="2.5" fill="#ff9090" />
        <circle cx="48" cy="48" r="1" fill="rgba(255,255,255,0.7)" />
      </svg>

      {/* Outer ring accent */}
      <div style={{ position: "absolute", inset: 4, borderRadius: "50%", border: "1px solid rgba(255,45,45,0.15)", pointerEvents: "none" }} />
    </div>
  );
}

/* ── Full GPU card hero ──────────────────────────────────────── */
function GpuHero() {
  return (
    <div
      className="animate-float"
      style={{
        position: "relative",
        transform: "perspective(900px) rotateY(-14deg) rotateX(4deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Red ambient glow behind */}
      <div style={{
        position: "absolute", inset: -50, borderRadius: 32,
        background: "radial-gradient(ellipse at 50% 50%, rgba(255,45,45,0.28) 0%, transparent 65%)",
        filter: "blur(24px)", pointerEvents: "none",
      }} />

      {/* GPU main body */}
      <div style={{
        width: 420, position: "relative",
        background: "linear-gradient(160deg, #313131 0%, #222222 35%, #161616 100%)",
        borderRadius: 14,
        border: "1.5px solid rgba(255,255,255,0.18)",
        boxShadow: "0 0 60px rgba(255,45,45,0.4), 0 0 120px rgba(255,45,45,0.18), 0 28px 70px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}>
        {/* Top highlight */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)", borderRadius: "14px 14px 0 0" }} />

        {/* Top-right diagonal hash accent */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, overflow: "hidden", borderRadius: "0 14px 0 0" }}>
          <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(-45deg, rgba(255,45,45,0.22) 0px, rgba(255,45,45,0.22) 2px, transparent 2px, transparent 9px)" }} />
        </div>
        {/* Top-left diagonal hash */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 44, height: 80, overflow: "hidden", borderRadius: "14px 0 0 0" }}>
          <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(-45deg, rgba(255,45,45,0.13) 0px, rgba(255,45,45,0.13) 2px, transparent 2px, transparent 9px)" }} />
        </div>

        {/* ── RIGNODE brand logo on card ── */}
        <div style={{ padding: "12px 18px 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Brand icon */}
          <img src="/rignode-logo.png" alt="RIGNODE" style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(255,45,45,0.8))" }} />
          {/* RIGNODE text — metallic engraved style */}
          <div style={{ position: "relative" }}>
            <span style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: "1.05rem",
              letterSpacing: "0.18em",
              background: "linear-gradient(180deg, #ffffff 0%, #c8c8c8 40%, #888888 70%, #aaaaaa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
            }}>
              RIG<span style={{
                background: "linear-gradient(180deg,#ff6060 0%,#FF2D2D 50%,#cc1a1a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 6px rgba(255,45,45,0.8))",
              }}>NODE</span>
            </span>
          </div>
          {/* Series label */}
          <span style={{ marginLeft: 2, fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, alignSelf: "flex-end", marginBottom: 2 }}>COMPUTE</span>
        </div>

        {/* Inner shroud / heatsink area behind fans */}
        <div style={{
          margin: "10px 14px 0 14px", borderRadius: 10, overflow: "hidden",
          background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          {/* Vent lines (heatsink fins) */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 1, left: `${2 + i * 4.5}%`, background: "rgba(255,255,255,0.028)" }} />
            ))}
          </div>

          {/* Fans row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "12px 14px", gap: 10, position: "relative" }}>
            <GpuFan size={108} delay="0s" uid="1" />
            <GpuFan size={108} delay="-0.55s" uid="2" />
            <GpuFan size={108} delay="-1.1s" uid="3" />
          </div>
        </div>

        {/* Bottom label strip */}
        <div style={{ padding: "8px 18px 12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>AI INFERENCE ACCELERATOR · SOLANA VERIFIED</span>
          {/* Red LED bar */}
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 0.7, 0.4].map((op, i) => (
              <div key={i} style={{ width: 14, height: 2, borderRadius: 1, background: "#FF2D2D", opacity: op, boxShadow: `0 0 ${6 * op}px rgba(255,45,45,0.9)` }} />
            ))}
          </div>
        </div>

        {/* Bottom edge glow line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 14px 14px",
          background: "linear-gradient(90deg, transparent 5%, #FF2D2D 35%, #ff4040 50%, #FF2D2D 65%, transparent 95%)",
          boxShadow: "0 0 16px rgba(255,45,45,0.9)",
        }} />
      </div>

      {/* 3-D side face — visible because of rotateY tilt */}
      <div style={{
        position: "absolute", right: -18, top: 6, bottom: 6,
        width: 18,
        background: "linear-gradient(90deg,#1a1a1a,#0d0d0d)",
        borderRadius: "0 8px 8px 0",
        border: "1px solid rgba(255,255,255,0.06)", borderLeft: "none",
        transform: "rotateY(90deg)",
        transformOrigin: "left center",
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 3, right: 3, height: 1, background: "rgba(255,255,255,0.07)", top: `${15 + i * 13}%` }} />
        ))}
      </div>

      {/* PCIe bracket (right side) */}
      <div style={{
        position: "absolute", right: -13, top: 10, bottom: 10, width: 13,
        background: "linear-gradient(90deg, #1e1e1e, #141414)",
        borderRadius: "0 6px 6px 0",
        border: "1px solid rgba(255,255,255,0.07)", borderLeft: "none",
      }}>
        {/* Vent slots */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 3, right: 3, height: 1, background: "rgba(255,255,255,0.08)", top: `${20 + i * 14}%` }} />
        ))}
      </div>

      {/* PCIe edge connector */}
      <div style={{
        position: "absolute", bottom: -9, left: "20%", width: "52%", height: 9,
        background: "linear-gradient(180deg, #1e1e1e, #0f0f0f)",
        borderRadius: "0 0 4px 4px",
        border: "1px solid rgba(255,255,255,0.06)", borderTop: "none",
        display: "flex", alignItems: "center", paddingLeft: 4, gap: 2,
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{ width: 3, height: 6, background: "rgba(255,100,60,0.35)", borderRadius: 1, flexShrink: 0 }} />
        ))}
      </div>

      {/* Floor glow */}
      <div style={{
        position: "absolute", bottom: -26, left: "8%", width: "84%", height: 18,
        background: "radial-gradient(ellipse, rgba(255,45,45,0.4) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />
    </div>
  );
}

/* ══ Neon flow diagram ══════════════════════════════════════ */
const VW = 520, VH = 360;
const SRC_NODE = { cx: 108, cy: 180 };
const BRANCH_NODES = [
  { cx: 408, cy: 72,  icon: Shield,     label: "Canary Check"  },
  { cx: 408, cy: 180, icon: Cpu,        label: "Run Inference" },
  { cx: 408, cy: 288, icon: TrendingUp, label: "USDC Released" },
];
const SRC_HW = 72, BR_HW = 86;

const FLOW_STEPS = [
  { label: "Job Request",   status: "Queued"  },
  { label: "Canary Check",  status: "Testing" },
  { label: "Run Inference", status: "Running" },
  { label: "USDC Released", status: "Settled" },
];

/* ── Isometric job-flow diagram ──────────────────────────────── */
function IsoJobFlow() {
  const c = 0.866;
  const s = 0.5;
  const pr = (x: number, y: number, z: number): [number, number] => [
    (x - y) * c,
    (x + y) * s - z,
  ];

  const W = 340, D = 105, H = 22, STEP = 38;

  const STEPS = [
    { n: "01", title: "Request",       note: "Submitted to network",      hot: false },
    { n: "02", title: "Escrow locked", note: "USDC locked in ACP",        hot: false },
    { n: "03", title: "Scheduled",     note: "Matched to optimal node",   hot: false },
    { n: "04", title: "Executed",      note: "Runs in isolated sandbox",  hot: true  },
    { n: "05", title: "Verified",      note: "Output verified on-chain",  hot: false },
    { n: "06", title: "USDC payout",   note: "80% released to operator",  hot: false },
  ];

  const slabs = STEPS.map((st, i) => {
    const z0 = i * STEP, z1 = z0 + H;
    return {
      st,
      FLt: pr(0, 0, z1), FRt: pr(W, 0, z1), BRt: pr(W, D, z1), BLt: pr(0, D, z1),
      FLb: pr(0, 0, z0), FRb: pr(W, 0, z0), BRb: pr(W, D, z0),
    };
  });

  const xs = slabs.flatMap(sl => [sl.FLt[0], sl.FRt[0], sl.BRt[0], sl.BLt[0], sl.FLb[0], sl.FRb[0], sl.BRb[0]]);
  const ys = slabs.flatMap(sl => [sl.FLt[1], sl.FRt[1], sl.BRt[1], sl.BLt[1], sl.FLb[1], sl.FRb[1], sl.BRb[1]]);
  const pad = 24;
  const inputAreaW = 140;
  const ox = -Math.min(...xs) + pad + inputAreaW;
  const oy = -Math.min(...ys) + pad;
  const svgW = Math.max(...xs) + ox + 320;
  const svgH = Math.max(...ys) + oy + pad;

  const poly = (pts: [number, number][]) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${(x + ox).toFixed(1)},${(y + oy).toFixed(1)}`).join("") + "Z";

  const act = slabs[3];
  const connY = act.FLt[1] + oy + ((act.FLb[1] - act.FLt[1]) / 2);
  const connX = act.FLt[0] + ox;

  return (
    <svg viewBox={`0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}`} className="w-full" style={{ display: "block" }}>
      <defs>
        <filter id="iglow-top" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="iglow-halo" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" />
        </filter>
        <pattern id="iso-grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0L0 0 0 18" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* AI Agent input chip */}
      <rect x={pad / 2} y={connY - 36} width={inputAreaW - 20} height={72} rx="8"
        fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
      <rect x={pad / 2} y={connY - 36} width={8} height={72} rx="4"
        fill="rgba(255,255,255,0.06)" />
      <text x={pad / 2 + (inputAreaW - 20) / 2 + 4} y={connY - 12} textAnchor="middle"
        fontSize="11" fontWeight="700" fontFamily="Space Grotesk,sans-serif" fill="rgba(255,255,255,0.28)">
        AI AGENT
      </text>
      <text x={pad / 2 + (inputAreaW - 20) / 2 + 4} y={connY + 6} textAnchor="middle"
        fontSize="10" fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.14)">
        buyer / caller
      </text>
      <text x={pad / 2 + (inputAreaW - 20) / 2 + 4} y={connY + 22} textAnchor="middle"
        fontSize="9" fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.1)">
        Solana wallet
      </text>
      {/* dashed connector to slab */}
      <line x1={pad / 2 + inputAreaW - 20} y1={connY} x2={connX - 4} y2={connY}
        stroke="rgba(255,255,255,0.11)" strokeWidth="0.8" strokeDasharray="4,4" />
      <circle cx={connX - 4} cy={connY} r="3" fill="rgba(255,255,255,0.1)" />

      {/* Slab stack (bottom → top, so higher slabs paint over lower) */}
      {slabs.map(({ st, FLt, FRt, BRt, BLt, FLb, FRb, BRb }, i) => {
        const hot = st.hot;
        const tfill   = hot ? "rgba(255,28,28,0.17)" : "rgba(16,8,8,0.88)";
        const tstroke = hot ? "#FF2D2D" : "rgba(255,255,255,0.11)";
        const tsw     = hot ? 2 : 0.6;
        const ffill   = hot ? "rgba(155,10,10,0.52)" : "rgba(9,4,4,0.96)";
        const rfill   = hot ? "rgba(120,8,8,0.58)" : "rgba(7,3,3,0.98)";
        const sst     = hot ? "rgba(255,45,45,0.35)" : "rgba(255,255,255,0.05)";
        const ssw     = hot ? 1 : 0.35;
        const lx = FRt[0] + ox + 20;
        const ly = FRt[1] + oy;

        return (
          <g key={i}>
            {hot && (
              <>
                {/* wide halo behind top face */}
                <path d={poly([FLt, FRt, BRt, BLt])} fill="rgba(255,20,20,0.18)" filter="url(#iglow-halo)" />
              </>
            )}
            {/* front face (y=0 side) */}
            <path d={poly([FLb, FRb, FRt, FLt])} fill={ffill} stroke={sst} strokeWidth={ssw} />
            {/* right face (x=W side) */}
            <path d={poly([FRb, BRb, BRt, FRt])} fill={rfill} stroke={sst} strokeWidth={ssw} />
            {/* top face */}
            <path d={poly([FLt, FRt, BRt, BLt])} fill={tfill} stroke={tstroke} strokeWidth={tsw}
              filter={hot ? "url(#iglow-top)" : undefined} />
            {/* subtle grid on top */}
            <path d={poly([FLt, FRt, BRt, BLt])} fill="url(#iso-grid)" opacity={hot ? 0.15 : 0.4} />

            {/* connector dot + line to label */}
            <circle cx={(FRt[0] + ox).toFixed(1)} cy={ly.toFixed(1)} r="3"
              fill={hot ? "#FF2D2D" : "rgba(255,255,255,0.15)"} />
            <line
              x1={(FRt[0] + ox + 4).toFixed(1)} y1={ly.toFixed(1)}
              x2={lx.toFixed(1)} y2={ly.toFixed(1)}
              stroke={hot ? "rgba(255,45,45,0.45)" : "rgba(255,255,255,0.07)"}
              strokeWidth={hot ? 1.2 : 0.5}
            />

            {/* step number */}
            <text x={lx} y={ly + 5}
              fontSize="11" fontWeight="700" fontFamily="Space Grotesk,sans-serif"
              fill={hot ? "#FF4D4D" : "rgba(255,255,255,0.22)"}>
              {st.n}
            </text>
            {/* step title */}
            <text x={lx + 30} y={ly + 5}
              fontSize="15" fontWeight={hot ? "700" : "500"} fontFamily="Space Grotesk,sans-serif"
              fill={hot ? "#fff" : "rgba(255,255,255,0.52)"}>
              {st.title}
            </text>
            {/* step note */}
            <text x={lx + 30} y={ly + 22}
              fontSize="11.5" fontFamily="Inter,sans-serif"
              fill="rgba(255,255,255,0.22)">
              {st.note}
            </text>

            {/* Red glow underline for active */}
            {hot && (
              <line
                x1={lx + 30} y1={ly + 9} x2={lx + 30 + 140} y2={ly + 9}
                stroke="rgba(255,45,45,0.3)" strokeWidth="6" strokeLinecap="round"
                filter="url(#iglow-top)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const HOME_VISION_STATEMENTS = [
  { body: "Every major computing transition follows the same arc: a new workload arrives, it outpaces centralized supply, and capital flows to whoever can aggregate the latent capacity sitting idle in homes and offices. Volunteer computing, mining, cloud, each wave turned wasted computation into value." },
  { body: "The next buyers of compute are not humans. Autonomous AI agents (trading, researching, creating) buy services from each other through machine-to-machine payments on-chain. The demand is real, growing, and distributed across thousands of applications." },
  { body: "Agents don't need data centers. They need billions of small inferences: cheap, fast enough, and payable on-chain. This workload fits consumer hardware perfectly, the same GPUs sitting idle 20 hours a day in homes across the planet." },
];

const HOME_ARCH_LAYERS = [
  { label: "Demand Layer",  sublabel: "Who submits inference jobs",            chips: ["ACP Agents (Virtuals)", "Direct API (OpenAI-compatible)", "Rignode Console"],                                            color: "rgba(255,45,45,0.45)" },
  { label: "Coordinator",   sublabel: "Scheduling, verification, settlement",  chips: ["ACP Gateway", "Job Queue & Scheduler", "Verification Engine", "Payment Engine", "Reputation Ledger"],                    color: "rgba(255,45,45,0.28)" },
  { label: "Supply Layer",  sublabel: "Node operators running hardware",        chips: ["Node Client (Go daemon)", "Docker sandbox", "Heartbeat telemetry", "Receive-only Solana wallet"],                        color: "rgba(255,45,45,0.15)" },
];

const HOME_VERIFICATION = [
  { num: "01", title: "Canary jobs",          body: "Hidden test jobs with known answers, indistinguishable from real work. Fail one and your trust score collapses." },
  { num: "02", title: "Redundant execution",  body: "New nodes: 100% double-run during probation. Trusted nodes: random 5–10% sampling. High-value jobs: always verified twice." },
  { num: "03", title: "Economic reputation",  body: "Trust rises slowly, falls instantly. The expected value of future work always exceeds what one fake job could steal." },
];

const HOME_NODE_STEPS = [
  { num: "01", title: "Download the node client",   body: "Windows & Linux, single installer. No dependencies to manage. The client ships its own runtime." },
  { num: "02", title: "Hardware auto-detection",    body: "GPU model, VRAM, and drivers benchmarked. Specs proven on-chain, not self-reported." },
  { num: "03", title: "Paste your Solana address",  body: "Receive-only. We never ask for or store a private key. Your wallet is a destination, not a credential." },
  { num: "04", title: "Pass the benchmark",         body: "Reference prompts with known answers. If output matches, you pass. If not, diagnose before going live." },
  { num: "05", title: "Go online",                  body: "Scheduler routes jobs matching your capability, trust score, and region. Set minimum rates and model restrictions." },
  { num: "06", title: "Track everything",           body: "Live earnings, trust score, job history. Every payout linked to a Solana transaction you can verify in Explorer." },
];

const HOME_PRINCIPLES = [
  { num: "01", title: "Honesty by design",    body: "Our docs state what the system cannot do. Marketing never edits engineering." },
  { num: "02", title: "Non-custodial always", body: "Your wallet only receives. There is no internal balance we can freeze." },
  { num: "03", title: "Sandboxed by default", body: "Every job runs in an isolated container with no host access. You never trust the job. Isolation guarantees it." },
  { num: "04", title: "Demand before supply", body: "We validated paying customers before recruiting a single node. A network without demand is just idle GPUs." },
];

const HOME_THESIS_QUOTES = [
  { chapter: "The Idle Capacity Cycle",    quote: "Every computing era monetized waste. The agent economy is the next turn of the same cycle." },
  { chapter: "Agents Are the New Buyers",  quote: "Machine-to-machine commerce does not negotiate. It settles on-chain, per job, without a human in the loop." },
  { chapter: "Why Micro-Jobs Need Solana", quote: "Sub-cent fees make per-job stablecoin payouts viable. This model is impossible on a high-fee chain." },
  { chapter: "Demand Before Supply",       quote: "Supply-first DePIN networks die because idle GPUs without buyers are not a product, they are an electricity bill." },
];

const HOME_FAQS = [
  { q: "Do I need to buy a token to earn?",     a: "No. You earn USDC for verified work. No token purchase, stake, or NFT is ever required." },
  { q: "Is this safe for my PC?",               a: "Jobs run inside isolated Docker containers with no host filesystem access and whitelisted networking. Only signed images from our registry ever run." },
  { q: "When do I get paid?",                   a: "Payouts are batched on Solana (roughly hourly or at a $1 threshold) to keep fees near zero. Every payout has an on-chain signature." },
  { q: "What hardware qualifies?",              a: "Mid-range consumer GPUs (8 GB+ VRAM) for LLM inference. CPUs and Apple Silicon are on the roadmap." },
  { q: "Can node operators see my data?",       a: "At MVP, inference runs in plaintext on provider hardware. Sensitive workloads should use the trusted-tier. We state this limit openly (see Architecture)." },
  { q: "Who pays for the jobs?",                a: "Real clients: AI agents buying through ACP escrow and developers using the direct API. We built demand before supply. A network without buyers is just idle GPUs." },
];

function HomeFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-medium text-white text-sm pr-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{q}</span>
        {open
          ? <ChevronUp  className="h-4 w-4 shrink-0" style={{ color: "#FF4D4D" }} />
          : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>
      {open && (
        <div className="px-6 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="pt-4 text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

function FlowDiagram({ activeStep }: { activeStep: number }) {
  const paths = BRANCH_NODES.map((b) => {
    const x1 = SRC_NODE.cx + SRC_HW;
    const y1 = SRC_NODE.cy;
    const x2 = b.cx - BR_HW;
    const y2 = b.cy;
    const mx = (x1 + x2) / 2;
    return Math.abs(y1 - y2) < 4
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
  });

  const srcActive = activeStep === 0;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="neon-outer" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="neon-inner" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {paths.map((d, i) => {
          const isActive = activeStep === i + 1;
          return (
            <g key={i}>
              {/* Path — brighter glow when active */}
              <path
                id={`flow-p-${i}`}
                d={d} fill="none" strokeLinecap="round"
                stroke={isActive ? "rgba(220,30,30,0.50)" : "rgba(220,30,30,0.20)"}
                strokeWidth="20"
                filter="url(#neon-outer)"
                style={{ transition: "stroke 0.5s ease" }}
              />
              <path
                d={d} fill="none" strokeLinecap="round"
                stroke={isActive ? "rgba(255,55,55,0.85)" : "rgba(255,50,50,0.42)"}
                strokeWidth="5"
                filter="url(#neon-inner)"
                style={{ transition: "stroke 0.5s ease" }}
              />
              <path d={d} fill="none" stroke="#FF3333" strokeWidth="1.5" strokeLinecap="round" />

              {/* Traveling glow dot */}
              <g style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.35s ease" }}>
                <circle r="8" fill="rgba(255,45,45,0.35)" filter="url(#neon-outer)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#flow-p-${i}`} />
                  </animateMotion>
                </circle>
                <circle r="3.5" fill="#FF6060">
                  <animateMotion dur="1.5s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#flow-p-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Source node */}
      <div style={{
        position: "absolute",
        left: `${(SRC_NODE.cx / VW) * 100}%`,
        top:  `${(SRC_NODE.cy / VH) * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 2,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
          borderRadius: 12, whiteSpace: "nowrap", backdropFilter: "blur(12px)",
          background: srcActive ? "rgba(255,45,45,0.22)" : "rgba(255,45,45,0.13)",
          border: "1px solid rgba(255,45,45,0.42)",
          boxShadow: srcActive
            ? "0 0 40px rgba(255,45,45,0.45), 0 4px 16px rgba(0,0,0,0.55)"
            : "0 0 28px rgba(255,45,45,0.22), 0 4px 16px rgba(0,0,0,0.55)",
          transition: "all 0.5s ease",
        }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,45,45,0.25)", flexShrink: 0 }}>
            <Zap style={{ width: 13, height: 13, color: "#FF4D4D" }} />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14, color: "#fff" }}>Job Request</span>
          {srcActive && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4D4D", boxShadow: "0 0 8px rgba(255,77,77,1)", flexShrink: 0, animation: "pulse 1s ease-in-out infinite" }} />
          )}
        </div>
      </div>

      {/* Branch nodes */}
      {BRANCH_NODES.map((b, i) => {
        const Icon = b.icon;
        const isActive = activeStep === i + 1;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${(b.cx / VW) * 100}%`,
            top:  `${(b.cy / VH) * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              borderRadius: 12, whiteSpace: "nowrap", backdropFilter: "blur(12px)",
              background: isActive ? "rgba(255,45,45,0.18)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isActive ? "rgba(255,45,45,0.48)" : "rgba(255,255,255,0.13)"}`,
              boxShadow: isActive
                ? "0 0 36px rgba(255,45,45,0.35), 0 4px 16px rgba(0,0,0,0.55)"
                : "0 4px 20px rgba(0,0,0,0.45)",
              transition: "all 0.5s ease",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                background: isActive ? "rgba(255,45,45,0.30)" : "rgba(255,255,255,0.09)",
                transition: "background 0.5s ease",
              }}>
                <Icon style={{ width: 13, height: 13, color: isActive ? "#FF4D4D" : "rgba(255,255,255,0.5)", transition: "color 0.5s ease" }} />
              </div>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14, color: isActive ? "#fff" : "rgba(255,255,255,0.55)", transition: "color 0.5s ease" }}>{b.label}</span>
              {isActive && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4D4D", boxShadow: "0 0 8px rgba(255,77,77,1)", flexShrink: 0 }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Flow section with cycling animation ─────────────────── */
function FlowSection() {
  const [activeStep, setActiveStep] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % 4), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* Left: text + animated mockup */}
      <div>
        <div className="pill-badge-red mb-4 inline-flex">
          <div className="dot-red animate-pulse-dot" />
          THE FLOW
        </div>
        <h2 className="section-heading mb-6" style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)", lineHeight: 1.05 }}>
          <span className="white-word">YOUR GPU,</span><br />
          <span style={{ color: "#FF2D2D" }}>ALWAYS EARNING.</span>
        </h2>
        <p className="body-dim text-base mb-10 max-w-sm">
          Compute flows that trigger on real AI demand, verify every result, and settle on-chain, not on schedules.
        </p>

        {/* Animated dashboard mockup */}
        <div className="glass-card rounded-2xl overflow-hidden" style={{ maxWidth: 300 }}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            <img src="/rignode-logo.png" alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>rignode</span>
            <div className="ml-auto flex gap-1">
              <div className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(255,45,45,0.18)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Inference Flow</div>
              <div className="px-2 py-0.5 rounded text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Executions</div>
            </div>
          </div>
          {/* Rows */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
              Job Flow <span className="opacity-50">· 4 steps</span>
            </div>
            {FLOW_STEPS.map((step, i, arr) => {
              const isActive = i === activeStep;
              return (
                <div key={step.label} className="flex items-center gap-2.5 py-2" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: isActive ? "#FF2D2D" : "rgba(255,255,255,0.12)",
                    boxShadow: isActive ? "0 0 10px rgba(255,45,45,1), 0 0 20px rgba(255,45,45,0.5)" : "none",
                    transition: "all 0.4s ease",
                  }} />
                  <span style={{
                    fontSize: 12, fontFamily: "Inter, sans-serif",
                    color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
                    transition: "color 0.4s ease",
                  }}>{step.label}</span>
                  <div className="ml-auto text-xs font-semibold" style={{
                    color: isActive ? "#FF4D4D" : "transparent",
                    fontFamily: "Space Grotesk, sans-serif",
                    transition: "color 0.4s ease",
                  }}>{step.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: animated neon flow diagram */}
      <div className="relative hidden md:block" style={{ height: 360 }}>
        <FlowDiagram activeStep={activeStep} />
      </div>

      {/* Mobile fallback */}
      <div className="flex md:hidden flex-col gap-4">
        {[
          { icon: Zap,        label: "Job Request",  body: "Agent sends inference request via ACP escrow." },
          { icon: Shield,     label: "Canary Check", body: "Hidden test job verifies node integrity first." },
          { icon: Cpu,        label: "Run Inference",body: "GPU executes the real job inside isolated container." },
          { icon: TrendingUp, label: "USDC Released",body: "Verified output triggers on-chain USDC payout." },
        ].map(({ icon: Icon, label, body }, i) => (
          <div key={label} className="glass-card rounded-xl p-5 flex items-start gap-4" style={{
            border: i === activeStep ? "1px solid rgba(255,45,45,0.3)" : undefined,
            transition: "border-color 0.4s ease",
          }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,45,45,0.12)", border: "1px solid rgba(255,45,45,0.25)" }}>
              <Icon className="h-4 w-4" style={{ color: "#FF4D4D" }} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{label}</div>
              <div className="text-xs" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section heading with pill badge ───────────────────────── */
function SectionBadge({ label }: { label: string }) {
  return (
    <div className="pill-badge-red mb-4 inline-flex">
      <div className="dot-red animate-pulse-dot" />
      {label}
    </div>
  );
}

/* ── Numbered row (pillar) ──────────────────────────────────── */
function PillarRow({
  num, title, body, highlighted = false,
}: { num: string; title: string; body: string; highlighted?: boolean }) {
  return (
    <div className={highlighted ? "glass-card-red p-7" : "glass-card p-7"} style={{ borderRadius: 20 }}>
      <div className="flex gap-6 items-start">
        <div className="serial-num shrink-0">{num}</div>
        <div>
          <h3 className="font-bold text-white text-lg mb-2" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.01em" }}>{title}</h3>
          <p className="body-dim text-sm">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="glass-card p-6 text-center relative"
      style={{ borderRadius: 20 }}
    >
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.12) 0%, transparent 60%)" }}
      />
      <div className="font-bold text-3xl text-white relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em" }}>{value}</div>
      <div className="mt-2 text-sm relative" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{label}</div>
    </div>
  );
}

/* ── Timeline step ──────────────────────────────────────────── */
function TimelineStep({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex-1 text-center px-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm"
        style={{ background: "linear-gradient(135deg,#FF2D2D,#B30000)", color: "#fff", fontFamily: "Space Grotesk, sans-serif", boxShadow: "0 0 20px rgba(255,45,45,0.4)" }}
      >
        {num}
      </div>
      <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{title}</div>
      <div className="text-xs" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{body}</div>
    </div>
  );
}

export function Home() {
  const { data: stats } = useGetNetworkStats();

  return (
    <div className="relative overflow-hidden">
      {/* ══════════════════════════════════════ HERO ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden" style={{ overflowX: "hidden" }}>
        {/* Radial glows */}
        <div className="radial-glow-red" style={{ width: 700, height: 700, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.5 }} />
        <div className="radial-glow-red" style={{ width: 400, height: 400, top: -100, left: -100 }} />
        <div className="radial-glow-red" style={{ width: 400, height: 400, top: -100, right: -100, left: "auto" }} />
        {/* Dot grid texture */}
        <div className="dot-grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="fade-up mb-8">
            <div className="pill-badge-red inline-flex">
              <div className="dot-red animate-pulse-dot" />
              DECENTRALIZED COMPUTE EXCHANGE
            </div>
          </div>

          {/* Headline */}
          <h1 className="fade-up-1 section-heading text-3xl sm:text-5xl md:text-7xl mb-6">
            <span className="dim-word">Your GPU works for the AI agent economy.</span>{" "}
            <span className="white-word">You get paid in USDC.</span>
          </h1>

          <p className="fade-up-2 body-dim text-base md:text-lg max-w-2xl mx-auto mb-10">
            Rignode connects idle consumer hardware to autonomous AI agents that buy inference through machine-to-machine payments on Solana. Per-job payouts. Verified on-chain.
          </p>

          {/* CTAs */}
          <div className="fade-up-3 flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/nodes"><button className="btn-primary text-base px-8 py-3">Run a Node <ArrowRight className="h-4 w-4" /></button></Link>
            <Link href="/dashboard"><button className="btn-secondary text-base px-8 py-3">Open Dashboard</button></Link>
          </div>

          {/* 3D R Logomark centerpiece — hidden on mobile, shown md+ */}
          <div className="relative hidden md:flex items-center justify-center mb-8 fade-up-4">
            {/* Floating glass chips */}
            <Chip icon={Cpu}       label="Inference Ready"    style={{ top: "5%",  left: "5%",  animationDelay: "0s" }} />
            <Chip icon={Zap}       label="USDC / Job"         style={{ top: "5%",  right: "5%", animationDelay: "1s" }} />
            <Chip icon={Shield}    label="Verified Output"    style={{ bottom: "15%", left: "3%", animationDelay: "0.5s" }} />
            <Chip icon={TrendingUp}label="Solana Speed"       style={{ bottom: "15%", right: "3%", animationDelay: "1.5s" }} />

            {/* GPU Hero */}
            <GpuHero />
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-8">
          {["Built on Solana", "Non-custodial", "Pay-per-use USDC", "Early Access"].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em" }}>
              <CheckCircle className="h-3.5 w-3.5" style={{ color: "rgba(255,45,45,0.5)" }} />
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════ STATS BAND ══════════════════════════════════════ */}
      <section className="relative py-16 px-6 border-y" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={stats ? String(stats.activeNodes) : "..."} label="Active Nodes" />
            <StatCard value={stats ? String(stats.totalJobsCompleted) : "..."} label="Jobs Completed" />
            <StatCard value={stats ? `$${stats.totalUsdcPaid.toFixed(2)}` : "..."} label="USDC Paid Out" />
            <StatCard value={stats ? `${stats.avgTrustScore.toFixed(0)}/100` : "..."} label="Avg Trust Score" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CORE PILLARS ════════════════════════════════════════ */}
      <section className="relative py-28 px-6">
        <div className="dot-grid absolute inset-0 pointer-events-none opacity-50" />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="THE PROTOCOL" />
            <h2 className="section-heading text-4xl md:text-5xl">
              <span className="dim-word">How Rignode</span>{" "}
              <span className="white-word">earns you USDC</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PillarRow num="01" title="Real Work" body="Your hardware executes real AI inference jobs: LLM completions, embeddings, speech-to-text, for agents and developers who pay per verified result." />
            <PillarRow num="02" title="Verified Results" highlighted body="Canary jobs, redundant execution, and an on-chain reputation ledger ensure every payout corresponds to genuine, verifiable output." />
            <PillarRow num="03" title="Instant Payouts" body="USDC per verified job, batched and settled on Solana. On-chain proof for every transfer, no custodian, no delay, no permission required." />
            <PillarRow num="04" title="Machine Demand" body="Autonomous AI agents buy compute directly via ACP escrow. The demand side is software, not humans, scalable, 24/7, programmable." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ HOW IT FLOWS ════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 500, height: 500, bottom: -80, right: -80, opacity: 0.13 }} />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <FlowSection />
          <div className="text-center mt-14">
            <Link href="/how-it-works"><button className="btn-secondary">See the full flow →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ VISION ══════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.1 }} />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <SectionBadge label="VISION" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Every wave of computing</span><br />
              <span style={{ color: "#FF2D2D" }}>created a market for idle capacity.</span>
            </h2>
          </div>

          {/* Statement blocks */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {HOME_VISION_STATEMENTS.map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,45,45,0.4),transparent)" }} />
                <div className="text-3xl font-bold mb-4" style={{ color: "rgba(255,45,45,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>0{i + 1}</div>
                <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif", lineHeight: 1.85 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/vision"><button className="btn-secondary">Read the full vision →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ ARCHITECTURE ═════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="ARCHITECTURE" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Engineered to be</span><br />
              <span style={{ color: "#FF2D2D" }}>verified, not trusted.</span>
            </h2>
            <p className="body-dim text-base mt-4 max-w-xl mx-auto">Every architectural decision traces back to one question: can this be independently verified?</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left: 3-tier stack */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Three-tier system</div>
              {HOME_ARCH_LAYERS.map((layer, i) => (
                <div key={layer.label}>
                  <div className="glass-card rounded-2xl p-6" style={{ border: `1px solid ${layer.color}` }}>
                    <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: layer.color, fontFamily: "Space Grotesk, sans-serif" }}>{layer.label}</div>
                    {layer.sublabel && <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>{layer.sublabel}</div>}
                    <div className="flex flex-wrap gap-2">
                      {layer.chips.map((c) => (
                        <span key={c} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                  {i < HOME_ARCH_LAYERS.length - 1 && (
                    <div className="flex justify-center my-0 py-1">
                      <div className="flex flex-col items-center gap-0">
                        <div style={{ width: 1, height: 18, background: "linear-gradient(to bottom,rgba(255,45,45,0.6),rgba(255,45,45,0.2))" }} />
                        <div className="animate-ping w-2 h-2 rounded-full" style={{ background: "#FF2D2D", animationDuration: "1.8s" }} />
                        <div style={{ width: 1, height: 18, background: "linear-gradient(to bottom,rgba(255,45,45,0.2),rgba(255,45,45,0.04))" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: verification methods */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>How we check the work</div>
              <div className="space-y-4 mb-10">
                {HOME_VERIFICATION.map((v) => (
                  <div key={v.num} className="glass-card rounded-2xl p-6 flex gap-5 items-start">
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.22)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{v.num}</div>
                    <div>
                      <div className="font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{v.title}</div>
                      <p className="text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{v.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Honest limits callout */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(180,120,0,0.06)", border: "1px solid rgba(200,150,0,0.2)" }}>
                <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block mb-3" style={{ background: "rgba(200,150,0,0.1)", border: "1px solid rgba(200,150,0,0.25)", color: "#C8A000", fontFamily: "Space Grotesk, sans-serif" }}>⚠ Honest limits</span>
                <p className="text-sm leading-relaxed" style={{ color: "#C0A060", fontFamily: "Inter, sans-serif" }}>
                  The coordinator is centralized at MVP. Verification is probabilistic, not cryptographic zkML. Inference runs in plaintext in your VRAM at MVP. We publish our limits before others discover them.
                </p>
              </div>
            </div>
          </div>

          {/* Job lifecycle - isometric layer diagram */}
          <div className="glass-card rounded-2xl p-6 mb-12 overflow-hidden">
            {/* Branded header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/rignode-logo.png"
                  alt="RIGNODE"
                  className="w-10 h-10 object-contain animate-float"
                  style={{ filter: "drop-shadow(0 0 10px rgba(255,45,45,0.9)) drop-shadow(0 0 24px rgba(255,45,45,0.45))" }}
                />
                <div>
                  <div className="font-bold tracking-widest" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.88)", fontSize: 16, letterSpacing: "0.2em" }}>
                    RIGNODE
                  </div>
                  <div className="text-xs tracking-widest uppercase flex items-center gap-1.5 mt-0.5" style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.22)" }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "#FF2D2D", animationDuration: "1.6s" }} />
                    Job Lifecycle
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.16)", fontFamily: "Space Grotesk, sans-serif" }}>
                Every job, step by step
              </div>
            </div>
            <IsoJobFlow />
          </div>

          <div className="text-center">
            <Link href="/architecture"><button className="btn-secondary">Full system architecture →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ HOW IT WORKS ═════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 500, height: 500, top: -80, left: -80, opacity: 0.1 }} />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="HOW IT WORKS" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Six steps to</span><br />
              <span style={{ color: "#FF2D2D" }}>your first payout.</span>
            </h2>
            <p className="body-dim text-base mt-4 max-w-xl mx-auto">No surprises. No token purchases. No staking requirements. Just verified work and USDC.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {HOME_NODE_STEPS.map((s) => (
              <div key={s.num} className="glass-card rounded-2xl p-6 flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.25)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{s.num}</div>
                <div>
                  <div className="font-bold text-white mb-1 text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{s.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A", fontFamily: "Inter, sans-serif" }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Earnings honesty */}
          <div className="rounded-2xl p-7 mb-12 max-w-3xl mx-auto" style={{ background: "rgba(255,45,45,0.05)", border: "1px solid rgba(255,45,45,0.2)" }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Earnings: honest answer</div>
            <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              We won't promise you numbers. Earnings scale with network demand, your utilization, and your hardware. The built-in profitability calculator tells you the truth, <span style={{ color: "rgba(255,255,255,0.6)" }}>including when running a node would lose you money.</span>
            </p>
          </div>

          <div className="text-center">
            <Link href="/how-it-works"><button className="btn-secondary">Full step-by-step guide →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ ABOUT / PRINCIPLES ═══════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 500, height: 500, bottom: -80, right: -80, opacity: 0.12 }} />
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="ABOUT" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Built by operators,</span><br />
              <span style={{ color: "#FF2D2D" }}>for operators.</span>
            </h2>
            <p className="body-dim text-base mt-4 max-w-xl mx-auto">Rignode exists because the gap was obvious: an exploding economy of AI agents that buy compute autonomously, and millions of capable GPUs with no honest way to serve it.</p>
          </div>

          {/* What is / isn't */}
          <div className="grid md:grid-cols-2 gap-6 mb-14">
            <div className="glass-card p-8 rounded-2xl" style={{ border: "1px solid rgba(255,45,45,0.25)" }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>✦ What RIGNODE Is</div>
              <ul className="space-y-3">
                {["A compute marketplace where hardware owners sell verified inference work", "Non-custodial payouts in USDC on Solana", "An ACP-native provider serving autonomous agent demand", "An open node client anyone can inspect"].map((item) => (
                  <li key={item} className="flex items-start gap-3" style={{ fontFamily: "Inter, sans-serif", color: "#D0D0D0", fontSize: 14, lineHeight: 1.7 }}>
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#FF4D4D" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>✕ What RIGNODE Is Not</div>
              <ul className="space-y-3">
                {["Not a yield farm", "Not token-gated", "Not custodial: we never hold your funds", "Not a promise of passive riches, earnings scale with real network demand"].map((item) => (
                  <li key={item} className="flex items-start gap-3" style={{ fontFamily: "Inter, sans-serif", color: "#6A6A6A", fontSize: 14, lineHeight: 1.7 }}>
                    <span className="shrink-0 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Principles */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Principles</div>
              <h3 className="section-heading text-2xl text-white">How we build</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {HOME_PRINCIPLES.map((p) => (
                <div key={p.num} className="glass-card p-7 rounded-2xl">
                  <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{p.num}</div>
                  <h4 className="font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{p.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/about"><button className="btn-secondary">About RIGNODE →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ THESIS ═══════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
        <div className="container max-w-screen-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <SectionBadge label="THE THESIS" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Why this.</span><br />
              <span style={{ color: "#FF2D2D" }}>Why now.</span>
            </h2>
            <p className="body-dim text-base mt-4 max-w-xl mx-auto">The long-form argument for decentralized inference markets, including the risks we'd rather you read here than discover elsewhere.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {HOME_THESIS_QUOTES.map((t) => (
              <div key={t.chapter} className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,45,45,0.35),transparent)" }} />
                <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{t.chapter}</div>
                <blockquote className="text-base leading-relaxed pl-4" style={{ borderLeft: "3px solid rgba(255,45,45,0.5)", color: "rgba(255,255,255,0.82)", fontFamily: "Inter, sans-serif", fontStyle: "italic" }}>
                  "{t.quote}"
                </blockquote>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/thesis"><button className="btn-secondary">Read the full thesis →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FAQ ══════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 400, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.08 }} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <SectionBadge label="FAQ" />
            <h2 className="section-heading mt-4" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.08 }}>
              <span className="white-word">Common</span> <span style={{ color: "#FF2D2D" }}>questions.</span>
            </h2>
          </div>
          <div className="space-y-3 mb-12">
            {HOME_FAQS.map((faq) => <HomeFaqItem key={faq.q} {...faq} />)}
          </div>
          <div className="text-center">
            <Link href="/how-it-works"><button className="btn-secondary">More answers in the guide →</button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ DUAL AUDIENCE SPLIT ═════════════════════════════════════ */}
      <section className="relative py-24 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Node Operators */}
            <div className="glass-card p-10 relative overflow-hidden" style={{ borderRadius: 24 }}>
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,45,45,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="pill-badge-red mb-6 inline-flex"><div className="dot-red" />For Node Operators</div>
              <h3 className="section-heading text-3xl text-white mb-4">
                <span className="dim-word">Turn your rig into</span>
                <br /><span className="white-word">a paid node</span>
              </h3>
              <p className="body-dim text-sm mb-8">
                Connect your GPU once. Earn USDC continuously as AI agents consume your compute. No technical expertise required beyond installation. Earnings scale with network demand. We publish real numbers, not promises.
              </p>
              <ul className="space-y-3 mb-10">
                {["80% revenue share, on-chain verifiable", "USDC payouts, no token required", "Built-in profitability calculator", "Non-custodial: your wallet, your keys"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FF2D2D", boxShadow: "0 0 6px rgba(255,45,45,0.6)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/nodes"><button className="btn-primary">Register Your Node <ArrowRight className="h-4 w-4" /></button></Link>
            </div>

            {/* For Agents & Devs */}
            <div className="glass-card p-10 relative overflow-hidden" style={{ borderRadius: 24 }}>
              <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,45,45,0.1) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="pill-badge mb-6 inline-flex"><Terminal className="h-3 w-3" style={{ color: "rgba(255,45,45,0.7)" }} />For Agents &amp; Developers</div>
              <h3 className="section-heading text-3xl text-white mb-4">
                <span className="dim-word">Pay per call,</span>
                <br /><span className="white-word">on-chain escrow</span>
              </h3>
              <p className="body-dim text-sm mb-8">
                OpenAI-compatible API. ACP-native escrow means funds are locked until output is verified. No subscription, no prepay lock-in, pure pay-per-use inference at consumer hardware prices.
              </p>
              <div className="mb-10 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", padding: "1.25rem" }}>
                <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "#9A9A9A", fontFamily: "monospace" }}><code>{`curl https://api.rignode.xyz/v1/chat/completions \\
  -H "Authorization: Bearer $KEY" \\
  -d '{"model":"llama3-8b-q4",
       "messages":[{"role":"user",
       "content":"hello"}]}'`}</code></pre>
              </div>
              <Link href="/jobs"><button className="btn-secondary">Explore Job Queue →</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FINAL CTA ═══════════════════════════════════════════ */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="radial-glow-red animate-glow-pulse" style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.35 }} />
        <div className="dot-grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="/rignode-logo.png"
              alt="RIGNODE"
              className="w-20 h-20 object-contain animate-float"
              style={{ filter: "drop-shadow(0 0 32px rgba(255,45,45,0.7)) drop-shadow(0 0 64px rgba(255,45,45,0.35))" }}
            />
          </div>

          <h2 className="section-heading text-4xl md:text-5xl text-white mb-6">
            The agent economy is hiring hardware.
          </h2>
          <p className="body-dim text-lg mb-10">
            Just your GPU, an internet connection, and a Solana wallet address. Earnings scale with verified work. We publish real numbers.
          </p>
          <Link href="/nodes">
            <button className="btn-primary text-base px-10 py-4">
              Run a Node Today <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
            Earnings are conditional on network demand and hardware utilization. We publish real numbers.
          </p>
        </div>
      </section>
    </div>
  );
}
