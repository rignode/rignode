import { useRoute } from "wouter";
import { useGetNode, useListNodeJobs, useListNodeEarnings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { NodeStatusBadge, JobStatusBadge } from "./dashboard";

export function NodeDetail() {
  const [, params] = useRoute("/nodes/:id");
  const id = parseInt(params?.id ?? "0", 10);

  const { data: node, isLoading }            = useGetNode(id, { query: { enabled: !!id, queryKey: ["getNode", id] } });
  const { data: jobs,     isLoading: ljobs } = useListNodeJobs(id,     { query: { enabled: !!id, queryKey: ["listNodeJobs", id] } });
  const { data: earnings, isLoading: learn } = useListNodeEarnings(id, { query: { enabled: !!id, queryKey: ["listNodeEarnings", id] } });

  if (isLoading) return (
    <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-6">
      <Skeleton className="h-10 w-64" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />)}
      </div>
    </div>
  );

  if (!node) return (
    <div className="container max-w-screen-xl mx-auto px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
      Node not found. <Link href="/nodes"><span className="hover:underline cursor-pointer" style={{ color: "#FF4D4D" }}>Back to nodes</span></Link>
    </div>
  );

  const kpis = [
    { label: "Total Earned",   value: `$${Number(node.totalEarningsUsdc).toFixed(4)}`, red: true  },
    { label: "Pending Payout", value: `$${Number(node.pendingPayoutUsdc).toFixed(4)}`, red: false },
    { label: "Jobs Completed", value: `${node.jobsCompleted ?? 0}`,                     red: false },
    { label: "Trust Score",    value: `${node.trustScore.toFixed(0)}/100`,              red: false, progress: node.trustScore },
  ];

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: -150, right: -100, opacity: 0.2 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Back + title */}
        <div className="flex items-start gap-4">
          <Link href="/nodes">
            <div className="mt-1 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <ArrowLeft className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Node Detail</div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="section-heading text-4xl text-white">Node #{node.id}</h1>
              <NodeStatusBadge status={node.status} />
            </div>
            <p className="mt-2 text-sm font-mono truncate max-w-xl" style={{ color: "rgba(255,255,255,0.25)" }}>{node.walletAddress}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm pt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
            <span>{node.gpuModel}</span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span>{node.vram}GB VRAM</span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span>{node.region}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {kpis.map(k => (
            <div key={k.label} className="glass-card p-6 relative overflow-hidden" style={{ borderRadius: 20 }}>
              {k.red && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
              <div className="text-xs font-semibold tracking-widest uppercase mb-3 relative" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{k.label}</div>
              <div className="font-bold text-2xl relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.02em", color: k.red ? "#FF4D4D" : "#fff" }}>{k.value}</div>
              {k.progress !== undefined && (
                <div className="progress-bar mt-3 relative"><div className="progress-fill" style={{ width: `${k.progress}%` }} /></div>
              )}
            </div>
          ))}
        </div>

        {/* Throughput */}
        <div className="glass-card px-6 py-4 flex items-center justify-between" style={{ borderRadius: 16 }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Live Throughput</span>
          <span className="font-bold text-2xl text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            {node.tokensPerSec.toFixed(0)} <span className="text-sm font-normal" style={{ color: "#9A9A9A" }}>tok/s</span>
          </span>
        </div>

        {/* Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Jobs */}
          <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                Job History ({jobs?.length ?? 0} jobs)
              </span>
            </div>
            <table className="w-full dark-table">
              <thead><tr><th>ID</th><th>Model</th><th>Status</th><th>Earned</th></tr></thead>
              <tbody>
                {ljobs
                  ? <tr><td colSpan={4}><Skeleton className="h-8" style={{ background: "rgba(255,255,255,0.04)" }} /></td></tr>
                  : jobs?.length === 0
                    ? <tr><td colSpan={4} className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>No jobs yet</td></tr>
                    : jobs?.slice(0, 10).map(job => (
                      <tr key={job.id}>
                        <td className="font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>#{job.id}</td>
                        <td>{job.model}</td>
                        <td><JobStatusBadge status={job.status} /></td>
                        <td className="font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>+${Number(job.earningUsdc).toFixed(4)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Earnings */}
          <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                Earnings History: USDC on Solana
              </span>
            </div>
            <table className="w-full dark-table">
              <thead><tr><th>Date</th><th>Jobs</th><th>Amount</th><th>Tx</th></tr></thead>
              <tbody>
                {learn
                  ? <tr><td colSpan={4}><Skeleton className="h-8" style={{ background: "rgba(255,255,255,0.04)" }} /></td></tr>
                  : earnings?.length === 0
                    ? <tr><td colSpan={4} className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>No payouts yet</td></tr>
                    : earnings?.map(e => (
                      <tr key={e.id}>
                        <td style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8125rem" }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                        <td style={{ color: "rgba(255,255,255,0.4)" }}>{e.batchedJobs}</td>
                        <td className="font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>+${Number(e.amountUsdc).toFixed(4)}</td>
                        <td>
                          {e.txSignature
                            ? <a href={`https://explorer.solana.com/tx/${e.txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: "rgba(255,184,61,0.8)" }}>
                                {e.txSignature.slice(0, 8)}… <ExternalLink className="h-3 w-3" />
                              </a>
                            : <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: "rgba(255,184,61,0.7)", background: "rgba(255,184,61,0.08)", border: "1px solid rgba(255,184,61,0.2)" }}>Pending</span>}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
