import { useGetNetworkStats, useListJobs, useListNodes } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Zap, Activity, Cpu, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/wallet";

/* ─ Status badges ─────────────────────────────────────────── */
export function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: "Completed", color: "#FF4D4D", bg: "rgba(255,45,45,0.1)" },
    running:   { label: "Running",   color: "#FFB83D", bg: "rgba(255,184,61,0.1)" },
    pending:   { label: "Pending",   color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" },
    failed:    { label: "Failed",    color: "rgba(255,45,45,0.6)",   bg: "rgba(255,45,45,0.06)" },
    disputed:  { label: "Disputed",  color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.03)" },
    assigned:  { label: "Assigned",  color: "#7B61FF",               bg: "rgba(123,97,255,0.1)"  },
  };
  const s = map[status] ?? { label: status, color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.03)" };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30`, fontFamily: "Space Grotesk, sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function NodeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    online:    { color: "#FF4D4D", bg: "rgba(255,45,45,0.1)" },
    busy:      { color: "#FFB83D", bg: "rgba(255,184,61,0.1)" },
    offline:   { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)" },
    suspended: { color: "rgba(255,45,45,0.5)", bg: "rgba(255,45,45,0.05)" },
  };
  const s = map[status] ?? { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)" };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40`, fontFamily: "Space Grotesk, sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  );
}

/* ─ KPI card ──────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, red }: { label: string; value?: string; sub: string; icon: React.ElementType; red?: boolean }) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group hover:border-white/[0.12] transition-colors" style={{ borderRadius: 20 }}>
      <div className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(255,45,45,0.08) 0%, transparent 60%)" }} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,45,45,0.08)" }}>
          <Icon className="h-4 w-4" style={{ color: red ? "#FF4D4D" : "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
      {value === undefined
        ? <Skeleton className="h-9 w-28 mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
        : <div className="font-bold text-3xl text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: red ? "#FF4D4D" : "#fff" }}>{value}</div>}
      <div className="text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{sub}</div>
    </div>
  );
}

/* ─ Wallet gate ───────────────────────────────────────────── */
function WalletGate({ connect, connecting }: { connect: () => Promise<void>; connecting: boolean }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.15 }} />
      <div className="glass-card p-12 text-center max-w-md w-full mx-6 relative z-10" style={{ borderRadius: 24 }}>
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-[24px]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,45,45,0.5),transparent)" }} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,45,45,0.08)", border: "1px solid rgba(255,45,45,0.2)" }}>
          <Wallet className="h-7 w-7" style={{ color: "#FF4D4D" }} />
        </div>
        <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Operator Access</div>
        <h2 className="section-heading text-3xl text-white mb-3">Connect Your Wallet</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
          The Dashboard is operator-gated. Connect your Solana wallet to view your nodes, track earnings, and monitor job activity.
        </p>
        <button className="btn-primary w-full justify-center py-3 mb-4" onClick={connect} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Wallet →"}
        </button>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
          Supports Phantom and Solflare. Read-only access, no transactions signed.
        </p>
      </div>
    </div>
  );
}

/* ─ Dashboard ─────────────────────────────────────────────── */
export function Dashboard() {
  const { connected, publicKey, connect, connecting, truncated } = useWallet();
  const { data: nodes, isLoading: loadNodes } = useListNodes();
  const { data: jobs,  isLoading: loadJobs  } = useListJobs();
  const { data: stats } = useGetNetworkStats();

  if (!connected) {
    return <WalletGate connect={connect} connecting={connecting} />;
  }

  const myNodes = nodes?.filter(n => n.walletAddress === publicKey) ?? [];
  const myActiveCount = myNodes.filter(n => n.status === "online" || n.status === "busy").length;
  const myTotalEarned = myNodes.reduce((a, n) => a + Number(n.totalEarningsUsdc), 0);
  const myTotalPending = myNodes.reduce((a, n) => a + Number(n.pendingPayoutUsdc), 0);

  const myNodeIds = new Set(myNodes.map(n => n.id));
  const myJobs = jobs?.filter(j => j.nodeId != null && myNodeIds.has(j.nodeId)) ?? [];
  const recentJobs = myJobs.slice(-5).reverse();

  const hasNodes = !loadNodes && myNodes.length > 0;

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 600, height: 600, top: -200, right: -100, opacity: 0.25 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red animate-pulse-dot" />Operator</div>
            <h1 className="section-heading text-4xl text-white">Command Center</h1>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              Viewing as <span className="font-mono" style={{ color: "rgba(255,45,45,0.8)" }}>{truncated}</span>
            </p>
          </div>
          {!hasNodes && !loadNodes && (
            <Link href="/nodes">
              <button className="btn-primary text-sm">Register Your First Node →</button>
            </Link>
          )}
        </div>

        {/* No-node prompt */}
        {!loadNodes && myNodes.length === 0 && (
          <div className="glass-card p-10 text-center" style={{ borderRadius: 20 }}>
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="section-heading text-2xl text-white mb-2">No nodes registered for this wallet</h3>
            <p className="text-sm mb-6" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              Register a node with wallet address <span className="font-mono" style={{ color: "rgba(255,45,45,0.7)" }}>{truncated}</span> to start earning USDC.
            </p>
            <Link href="/nodes">
              <button className="btn-primary">Register a Node →</button>
            </Link>
          </div>
        )}

        {/* KPIs — my nodes */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <KpiCard label="My Earned" value={loadNodes ? undefined : `$${myTotalEarned.toFixed(2)}`} sub="USDC lifetime" icon={Zap} red />
          <KpiCard label="My Pending" value={loadNodes ? undefined : `$${myTotalPending.toFixed(2)}`} sub="Awaiting settlement" icon={Activity} />
          <KpiCard label="My Active Nodes" value={loadNodes ? undefined : `${myActiveCount} / ${myNodes.length}`} sub="Currently serving" icon={Cpu} />
          <KpiCard label="Network Trust" value={stats ? `${stats.avgTrustScore.toFixed(0)}/100` : undefined} sub="Network average" icon={ShieldCheck} />
        </div>

        {/* Content row */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Jobs table */}
          <div className="lg:col-span-4 glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <div className="px-6 py-5 flex items-center justify-between gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>My Jobs</div>
                <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Recent Activity</div>
              </div>
              <Link href="/jobs">
                <button className="btn-secondary py-1.5 px-4 text-xs shrink-0">View All →</button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full dark-table" style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>ID</th><th>Model</th><th>Status</th><th className="text-right pr-6">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {loadJobs
                    ? <tr><td colSpan={4}><Skeleton className="h-8 w-full" style={{ background: "rgba(255,255,255,0.04)" }} /></td></tr>
                    : recentJobs.length === 0
                      ? <tr><td colSpan={4} className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No jobs yet for your nodes</td></tr>
                      : recentJobs.map(j => (
                        <tr key={j.id}>
                          <td className="font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>#{j.id}</td>
                          <td>{j.model}</td>
                          <td><JobStatusBadge status={j.status} /></td>
                          <td className="text-right pr-6 font-semibold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>+${Number(j.earningUsdc).toFixed(4)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Node health */}
          <div className="lg:col-span-3 glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>My Infrastructure</div>
              <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Node Health</div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(255,45,45,0.06)", border: "1px solid rgba(255,45,45,0.15)" }}>
                <div className="flex items-center gap-3">
                  <div className="dot-red animate-pulse-dot" />
                  <div>
                    <div className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Network Status</div>
                    <div className="text-xs" style={{ color: "#9A9A9A" }}>All systems nominal</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,45,45,0.15)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>OK</span>
              </div>

              {loadNodes
                ? <Skeleton className="h-20 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                : myNodes.length === 0
                  ? (
                    <div className="text-center py-6 text-sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                      No nodes yet.{" "}
                      <Link href="/nodes"><span className="underline cursor-pointer hover:text-white/50">Register one →</span></Link>
                    </div>
                  )
                  : myNodes.slice(0, 4).map(node => (
                    <div key={node.id} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: node.status === "online" ? "#FF4D4D" : node.status === "busy" ? "#FFB83D" : "rgba(255,255,255,0.2)" }} />
                        <div>
                          <Link href={`/nodes/${node.id}`}>
                            <span className="text-sm font-semibold text-white hover:text-red-400 transition-colors cursor-pointer" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Node #{node.id}</span>
                          </Link>
                          <div className="text-xs" style={{ color: "#9A9A9A" }}>{node.gpuModel} · {node.vram}GB</div>
                        </div>
                      </div>
                      <NodeStatusBadge status={node.status} />
                    </div>
                  ))}

              <Link href="/nodes">
                <div className="text-center text-xs py-2 transition-colors cursor-pointer hover:text-red-400" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                  View all nodes →
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Network stats strip */}
        {stats && (
          <div className="glass-card px-6 py-4 flex flex-wrap items-center gap-6" style={{ borderRadius: 16 }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#FF4D4D" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Network</span>
            </div>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
              <span className="font-bold text-white">{stats.totalNodes}</span> nodes total
            </span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
              <span className="font-bold text-white">{stats.activeNodes}</span> active
            </span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
              <span className="font-bold" style={{ color: "#FF4D4D" }}>${stats.totalUsdcPaid.toFixed(2)}</span> USDC paid
            </span>
            <div className="ml-auto flex flex-wrap gap-4">
              {stats.topModels.map((m, i) => (
                <span key={m} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>
                  <span className="font-bold" style={{ color: "#FF4D4D" }}>{String(i + 1).padStart(2, "0")}</span>
                  {m}
                </span>
              ))}
            </div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>{stats.jobsPerHour} jobs/hr</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
