import { useGetTokenStats, useListJobs } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./dashboard";

/* ─ Helpers ───────────────────────────────────────────────── */
const MODEL_LABELS: Record<string, string> = {
  "llama3-8b-q4":     "Llama 3 8B (Q4)",
  "llama3-70b-q4":    "Llama 3 70B (Q4)",
  "mistral-7b-q4":    "Mistral 7B (Q4)",
  "qwen2-7b-q4":      "Qwen 2 7B (Q4)",
  "whisper-large-v3": "Whisper Large v3",
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ─ Live countdown badge ──────────────────────────────────── */
function LiveBadge({ intervalSec = 10 }: { intervalSec?: number }) {
  const [secs, setSecs] = useState(intervalSec);
  useEffect(() => {
    setSecs(intervalSec);
    const t = setInterval(() => setSecs(s => (s <= 1 ? intervalSec : s - 1)), 1000);
    return () => clearInterval(t);
  }, [intervalSec]);
  return (
    <div className="flex items-center gap-2 text-xs select-none" style={{ fontFamily: "Inter, sans-serif" }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#FF2D2D" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#FF4D4D" }} />
      </span>
      <span style={{ color: "#FF4D4D" }}>LIVE</span>
      <span style={{ color: "rgba(255,255,255,0.25)" }}>· refreshes in {secs}s</span>
    </div>
  );
}

/* ─ Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, accent = false, loading = false }: {
  label: string; value: string; sub: string; accent?: boolean; loading?: boolean;
}) {
  return (
    <div className="glass-card p-6 relative overflow-hidden" style={{ borderRadius: 20 }}>
      {accent && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
      <div className="relative">
        {loading
          ? <Skeleton className="h-9 w-24 mb-1" style={{ background: "rgba(255,255,255,0.05)" }} />
          : <div className="font-bold text-3xl mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: accent ? "#FF4D4D" : "#fff" }}>{value}</div>
        }
        <div className="text-xs font-semibold tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>{label}</div>
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>{sub}</div>
      </div>
    </div>
  );
}

/* ─ Network Transparency page ─────────────────────────────── */
export function Network() {
  const INTERVAL = 10_000;

  const { data: stats, isLoading: statsLoading, dataUpdatedAt } = useGetTokenStats({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { refetchInterval: INTERVAL } as any,
  });
  const { data: jobs, isLoading: jobsLoading } = useListJobs({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { refetchInterval: INTERVAL } as any,
  });

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt).toLocaleTimeString());
  }, [dataUpdatedAt]);

  const maxTotal = stats
    ? Math.max(...stats.byModel.map(m => m.inputTokens + m.outputTokens), 1)
    : 1;

  const recentJobs = (jobs ?? []).slice().reverse().slice(0, 50);

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.1 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Public · No sign-in required</div>
            <h1 className="section-heading text-4xl text-white">Network Transparency</h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              Every token consumed, every job processed, every USDC paid — public and real-time.
              Data pulled directly from the node registry and on-chain records.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <LiveBadge intervalSec={INTERVAL / 1000} />
            {lastUpdated && (
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "Inter, sans-serif" }}>
                Last updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* ── Key stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Input Tokens Consumed"
            value={stats ? fmt(stats.totalInputTokens) : "..."}
            sub="Prompt tokens sent to the network"
            loading={statsLoading}
          />
          <StatCard
            label="Output Tokens Generated"
            value={stats ? fmt(stats.totalOutputTokens) : "..."}
            sub="Response tokens produced by nodes"
            accent
            loading={statsLoading}
          />
          <StatCard
            label="Total Inference Jobs"
            value={stats ? fmt(stats.totalJobs) : "..."}
            sub="Across all nodes and all models"
            loading={statsLoading}
          />
          <StatCard
            label="USDC Paid to Operators"
            value={stats ? `$${stats.totalUsdcPaid.toFixed(4)}` : "..."}
            sub="80% of every job, on-chain"
            loading={statsLoading}
          />
        </div>

        {/* ── Token breakdown by model ── */}
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Token Usage by Model</div>
              <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>What tokens were used for</div>
            </div>
            <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>All-time · all nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full dark-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Purpose</th>
                  <th>Input Tokens</th>
                  <th>Output Tokens</th>
                  <th>Jobs</th>
                  <th>USDC Paid</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {statsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><Skeleton className="h-4 w-16" style={{ background: "rgba(255,255,255,0.05)" }} /></td>
                      ))}
                    </tr>
                  ))
                  : (stats?.byModel.length ?? 0) === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                          No jobs processed yet. Be the first to submit one.
                        </td>
                      </tr>
                    )
                    : stats!.byModel.map(m => {
                      const total = m.inputTokens + m.outputTokens;
                      const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                      const purpose =
                        m.model.includes("whisper") ? "Speech-to-text transcription" :
                        m.model.includes("70b")     ? "Complex reasoning / long-context LLM" :
                                                      "Text generation / chat completion";
                      return (
                        <tr key={m.model}>
                          <td className="font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Space Grotesk, sans-serif" }}>
                            {MODEL_LABELS[m.model] ?? m.model}
                          </td>
                          <td className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif", maxWidth: 160 }}>
                            {purpose}
                          </td>
                          <td className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {fmt(m.inputTokens)}
                          </td>
                          <td className="font-mono text-sm font-semibold" style={{ color: "#FF4D4D" }}>
                            {fmt(m.outputTokens)}
                          </td>
                          <td style={{ color: "rgba(255,255,255,0.4)" }}>
                            {m.jobCount.toLocaleString()}
                          </td>
                          <td className="font-mono text-sm font-bold" style={{ color: "#FF4D4D" }}>
                            ${m.usdcPaid.toFixed(4)}
                          </td>
                          <td style={{ minWidth: 130 }}>
                            <div className="flex items-center gap-2">
                              <div className="progress-bar flex-1">
                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs shrink-0 w-8 text-right" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Totals row */}
          {stats && stats.byModel.length > 0 && (
            <div className="px-6 py-4 flex flex-wrap gap-6 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Network Total</span>
              <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
                {fmt(stats.totalInputTokens + stats.totalOutputTokens)} tokens
              </span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
                across {stats.totalJobs.toLocaleString()} jobs
              </span>
              <span className="ml-auto text-sm font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
                ${stats.totalUsdcPaid.toFixed(4)} paid out
              </span>
            </div>
          )}
        </div>

        {/* ── Live job feed ── */}
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Live Job Feed</div>
              <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Every inference request, in real time</div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>Most recent 50</span>
              <LiveBadge intervalSec={INTERVAL / 1000} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full dark-table" style={{ minWidth: 740 }}>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Model</th>
                  <th>Input tok</th>
                  <th>Output tok</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Operator Earned</th>
                  <th>Time</th>
                  <th>Solana Tx</th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j}><Skeleton className="h-4 w-14" style={{ background: "rgba(255,255,255,0.05)" }} /></td>
                      ))}
                    </tr>
                  ))
                  : recentJobs.length === 0
                    ? (
                      <tr>
                        <td colSpan={9} className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                          No jobs yet.
                        </td>
                      </tr>
                    )
                    : recentJobs.map(job => (
                      <tr key={job.id}>
                        <td className="font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                          #{job.id}
                        </td>
                        <td className="font-medium" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Space Grotesk, sans-serif" }}>
                          {MODEL_LABELS[job.model] ?? job.model}
                        </td>
                        <td className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {fmt(job.inputTokens)}
                        </td>
                        <td className="font-mono text-sm font-semibold" style={{ color: "#FF4D4D" }}>
                          {fmt(job.outputTokens)}
                        </td>
                        <td><JobStatusBadge status={job.status} /></td>
                        <td>
                          {job.verified
                            ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: "#FF4D4D", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)" }}>✓</span>
                            : <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>}
                        </td>
                        <td className="font-bold font-mono" style={{ color: "#FF4D4D" }}>
                          +${Number(job.earningUsdc).toFixed(4)}
                        </td>
                        <td style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>
                          {new Date(job.createdAt).toLocaleString()}
                        </td>
                        <td>
                          {job.txSignature
                            ? (
                              <a
                                href={`https://explorer.solana.com/tx/${job.txSignature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                                style={{ color: "rgba(255,184,61,0.8)", fontFamily: "Inter, sans-serif" }}
                              >
                                {job.txSignature.slice(0, 8)}…
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )
                            : <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer note ── */}
        <div className="text-center py-2">
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "Inter, sans-serif", maxWidth: 600, margin: "0 auto" }}>
            All data is sourced directly from on-chain Solana records and the RIGNODE node registry.
            Token counts are exact, not estimated. USDC amounts shown are operator share (80% of job fee).
            This page requires no sign-in and refreshes automatically every {INTERVAL / 1000} seconds.
          </p>
        </div>

      </div>
    </div>
  );
}
