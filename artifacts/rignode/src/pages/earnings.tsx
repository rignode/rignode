import { useState } from "react";
import { useListNodes, useListNodeEarnings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

function NodeEarnings({ nodeId }: { nodeId: number }) {
  const { data: earnings, isLoading } = useListNodeEarnings(nodeId, {
    query: { enabled: !!nodeId, queryKey: ["listNodeEarnings", nodeId] },
  });
  if (isLoading) return <tr><td colSpan={5}><Skeleton className="h-8 w-full" style={{ background: "rgba(255,255,255,0.04)" }} /></td></tr>;
  if (!earnings?.length) return (
    <tr><td colSpan={5} className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No earnings yet for node #{nodeId}.</td></tr>
  );
  return (
    <>
      {earnings.map(e => (
        <tr key={e.id} className="group">
          <td style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8125rem" }}>
            {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </td>
          <td className="font-semibold" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>#{e.nodeId}</td>
          <td style={{ color: "rgba(255,255,255,0.4)" }}>{e.batchedJobs}</td>
          <td className="font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>+${Number(e.amountUsdc).toFixed(4)}</td>
          <td>
            {e.txSignature
              ? <a href={`https://explorer.solana.com/tx/${e.txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: "rgba(255,184,61,0.8)" }}>
                  {e.txSignature.slice(0, 12)}… <ExternalLink className="h-3 w-3" />
                </a>
              : <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: "rgba(255,184,61,0.7)", background: "rgba(255,184,61,0.08)", border: "1px solid rgba(255,184,61,0.2)" }}>Pending</span>}
          </td>
        </tr>
      ))}
    </>
  );
}

export function Earnings() {
  const { data: nodes, isLoading: loadNodes } = useListNodes();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("all");

  const totalEarned  = nodes?.reduce((s, n) => s + Number(n.totalEarningsUsdc), 0) ?? 0;
  const totalPending = nodes?.reduce((s, n) => s + Number(n.pendingPayoutUsdc), 0) ?? 0;
  const displayNodeIds = selectedNodeId === "all" ? (nodes?.map(n => n.id) ?? []) : [parseInt(selectedNodeId, 10)];

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: -150, left: -100, opacity: 0.2 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Payouts</div>
            <h1 className="section-heading text-4xl text-white">Earnings</h1>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>Every payout verifiable on Solana Explorer.</p>
          </div>
          <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
            <SelectTrigger className="w-56" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.875rem" }}>
              <SelectValue placeholder="Filter by node" />
            </SelectTrigger>
            <SelectContent style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
              <SelectItem value="all" style={{ fontFamily: "Space Grotesk, sans-serif" }}>All Nodes</SelectItem>
              {nodes?.map(n => (
                <SelectItem key={n.id} value={String(n.id)} style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Node #{n.id}: {n.gpuModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Lifetime Earned", value: loadNodes ? null : `$${totalEarned.toFixed(4)}`, red: true },
            { label: "Pending Payout",  value: loadNodes ? null : `$${totalPending.toFixed(4)}`, red: false },
            { label: "Nodes Registered",value: loadNodes ? null : String(nodes?.length ?? 0), red: false },
          ].map(s => (
            <div key={s.label} className="glass-card p-6 relative overflow-hidden" style={{ borderRadius: 20 }}>
              {s.red && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
              <div className="text-xs font-semibold tracking-widest uppercase mb-3 relative" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
              {s.value === null
                ? <Skeleton className="h-9 w-28" style={{ background: "rgba(255,255,255,0.05)" }} />
                : <div className="font-bold text-3xl relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: s.red ? "#FF4D4D" : "#fff" }}>{s.value}</div>}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Payout History</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>Solana tx → on-chain verification</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dark-table" style={{ minWidth: 520 }}>
              <thead>
                <tr><th>Timestamp</th><th>Node</th><th>Jobs Batched</th><th>Amount (USDC)</th><th>Tx Signature</th></tr>
              </thead>
              <tbody>
                {loadNodes
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><Skeleton className="h-4 w-16" style={{ background: "rgba(255,255,255,0.05)" }} /></td>)}</tr>
                  ))
                  : displayNodeIds.length === 0
                    ? <tr><td colSpan={5} className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No nodes registered.</td></tr>
                    : displayNodeIds.map(nid => <NodeEarnings key={nid} nodeId={nid} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
