import { useState, useMemo } from "react";
import { useListNodes } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ExternalLink, Cpu, Zap, Shield, Globe, ChevronDown } from "lucide-react";

/* ── Helpers ────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; border: string }> = {
  online:    { label: "Online",    dot: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.25)" },
  busy:      { label: "Busy",      dot: "#FF4D4D", bg: "rgba(255,45,45,0.08)",  border: "rgba(255,45,45,0.25)" },
  offline:   { label: "Offline",   dot: "#6B7280", bg: "rgba(107,114,128,0.08)",border: "rgba(107,114,128,0.2)" },
  suspended: { label: "Suspended", dot: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.dot, fontFamily: "Space Grotesk, sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* Models a GPU can serve based on VRAM */
function getCompatibleModels(vram: number): { model: string; label: string; pricePerK: number }[] {
  const all = [
    { model: "llama3-8b-q4",     label: "Llama 3 8B",      minVram: 6,  pricePerK: 0.0004 },
    { model: "mistral-7b-q4",    label: "Mistral 7B",       minVram: 6,  pricePerK: 0.0003 },
    { model: "qwen2-7b-q4",      label: "Qwen 2 7B",        minVram: 6,  pricePerK: 0.0003 },
    { model: "whisper-large-v3", label: "Whisper Large v3", minVram: 8,  pricePerK: 0.0006 },
    { model: "llama3-70b-q4",    label: "Llama 3 70B",      minVram: 40, pricePerK: 0.0016 },
  ];
  return all.filter(m => vram >= m.minVram);
}

function TrustBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score * 10));
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#FF4D4D" : "#F59E0B";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color, fontFamily: "Space Grotesk, sans-serif" }}>{score.toFixed(1)}</span>
    </div>
  );
}

/* ── GPU Card ───────────────────────────────────────────────── */
function GpuCard({ node }: { node: {
  id: number; gpuModel: string; vram: number; status: string; region: string;
  trustScore: number; tokensPerSec: number; walletAddress: string;
  jobsCompleted?: number | null;
} }) {
  const compatible = getCompatibleModels(node.vram);
  const minPrice = compatible.length ? Math.min(...compatible.map(m => m.pricePerK)) : 0;
  const maxPrice = compatible.length ? Math.max(...compatible.map(m => m.pricePerK)) : 0;
  const isAvailable = node.status === "online";

  return (
    <div
      className="glass-card flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/20"
      style={{ borderRadius: 20, padding: "1.5rem", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Top glow for available nodes */}
      {isAvailable && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(34,197,94,0.4),transparent)" }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)" }}>
            <Cpu className="h-5 w-5" style={{ color: "#FF4D4D" }} />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {node.gpuModel}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
              Node #{node.id}
            </div>
          </div>
        </div>
        <StatusBadge status={node.status} />
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>VRAM</div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{node.vram} GB</div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>Speed</div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{node.tokensPerSec} tok/s</div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-0.5 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
            <Globe className="h-3 w-3" /> Region
          </div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{node.region}</div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>Jobs Done</div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{node.jobsCompleted ?? 0}</div>
        </div>
      </div>

      {/* Trust score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
            <Shield className="h-3 w-3" /> Trust Score
          </span>
        </div>
        <TrustBar score={node.trustScore} />
      </div>

      {/* Compatible models + price */}
      <div className="space-y-2">
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>
          Supported Models
        </div>
        <div className="flex flex-wrap gap-1.5">
          {compatible.map(m => (
            <span key={m.model} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,45,45,0.08)", border: "1px solid rgba(255,45,45,0.15)", color: "rgba(255,77,77,0.8)", fontFamily: "Inter, sans-serif" }}>
              {m.label}
            </span>
          ))}
          {compatible.length === 0 && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No supported models</span>
          )}
        </div>
      </div>

      {/* Price range */}
      {compatible.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,45,45,0.05)", border: "1px solid rgba(255,45,45,0.12)" }}>
          <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
            <Zap className="h-3 w-3" /> Price / 1K out tokens
          </span>
          <span className="font-bold text-sm" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>
            ${minPrice.toFixed(4)}{minPrice !== maxPrice ? `–$${maxPrice.toFixed(4)}` : ""} USDC
          </span>
        </div>
      )}

      {/* CTA */}
      <Link href="/jobs">
        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={isAvailable
            ? { background: "rgba(255,45,45,0.9)", color: "#fff", fontFamily: "Space Grotesk, sans-serif", boxShadow: "0 4px 20px rgba(255,45,45,0.3)" }
            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif", cursor: "not-allowed" }
          }
          disabled={!isAvailable}
        >
          {isAvailable ? "Submit Job to Network →" : node.status === "busy" ? "Node Busy" : "Offline"}
        </button>
      </Link>
    </div>
  );
}

/* ── Region filter pill ─────────────────────────────────────── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={active
        ? { background: "#FF2D2D", color: "#fff", fontFamily: "Space Grotesk, sans-serif" }
        : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Space Grotesk, sans-serif" }
      }
    >
      {label}
    </button>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export function GpuMarket() {
  const { data: nodes, isLoading } = useListNodes();
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "busy" | "offline">("all");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"trust" | "speed" | "vram">("trust");

  const regions = useMemo(() => {
    const set = new Set<string>(["All"]);
    nodes?.forEach(n => set.add(n.region));
    return Array.from(set);
  }, [nodes]);

  const filtered = useMemo(() => {
    if (!nodes) return [];
    return nodes
      .filter(n => statusFilter === "all" || n.status === statusFilter)
      .filter(n => regionFilter === "All" || n.region === regionFilter)
      .sort((a, b) => {
        if (sortBy === "trust") return b.trustScore - a.trustScore;
        if (sortBy === "speed") return b.tokensPerSec - a.tokensPerSec;
        return b.vram - a.vram;
      });
  }, [nodes, statusFilter, regionFilter, sortBy]);

  const online  = nodes?.filter(n => n.status === "online").length ?? 0;
  const busy    = nodes?.filter(n => n.status === "busy").length ?? 0;
  const totalVram = nodes?.reduce((s, n) => s + n.vram, 0) ?? 0;

  return (
    <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-10">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="pill-badge-red inline-flex"><div className="dot-red" />GPU Marketplace</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="section-heading text-4xl text-white">Rent a GPU</h1>
            <p className="mt-2 text-sm max-w-lg" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              Browse the live network of decentralized GPUs available for AI inference. Pay-per-job, no subscription, no minimum commitment.
            </p>
          </div>
          {/* Pricing note */}
          <div className="px-4 py-3 rounded-2xl text-xs leading-relaxed max-w-xs" style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.18)", fontFamily: "Inter, sans-serif" }}>
            <span className="font-semibold" style={{ color: "#FFB400" }}>Harga ditentukan oleh RIGNODE.</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}> Semua node menggunakan tarif protokol yang sama. Operator tidak menentukan harga sendiri — ini menjamin keseragaman & fairness bagi client.</span>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total GPU Nodes", value: nodes?.length ?? 0, accent: false },
          { label: "Online & Ready",  value: online,             accent: true },
          { label: "Total VRAM",      value: `${totalVram} GB`,  accent: false },
        ].map(s => (
          <div key={s.label} className="glass-card py-6 text-center relative overflow-hidden" style={{ borderRadius: 20 }}>
            {s.accent && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
            <div className="font-bold text-3xl relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: s.accent ? "#FF4D4D" : "#fff" }}>{s.value}</div>
            <div className="mt-2 text-sm relative" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold tracking-widest uppercase mr-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>Status</span>
          {(["all", "online", "busy", "offline"] as const).map(s => (
            <FilterPill key={s} label={s === "all" ? "All" : STATUS_CONFIG[s].label} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold tracking-widest uppercase mr-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>Region</span>
          {regions.map(r => (
            <FilterPill key={r} label={r} active={regionFilter === r} onClick={() => setRegionFilter(r)} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>Sort</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none px-4 pr-8 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: "Space Grotesk, sans-serif", outline: "none", cursor: "pointer" }}
            >
              <option value="trust">Trust Score</option>
              <option value="speed">Speed</option>
              <option value="vram">VRAM</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </div>

      {/* ── GPU grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 20, padding: "1.5rem", height: 420 }}>
              <Skeleton className="h-full w-full" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
          No GPUs match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(node => (
            <GpuCard key={node.id} node={node} />
          ))}
        </div>
      )}

      {/* ── Pricing explainer ── */}
      <div className="rounded-2xl px-6 py-6 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: "#FF4D4D" }} />
          <span className="font-bold text-sm text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Bagaimana harga ditentukan?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
          <div>
            <p><span className="font-semibold text-white/70">Harga ditetapkan oleh RIGNODE</span>, bukan oleh operator node. Semua GPU di jaringan menggunakan tarif per-model yang sama — sehingga client selalu mendapatkan harga yang konsisten tanpa perlu negosiasi.</p>
          </div>
          <div>
            <p><span className="font-semibold text-white/70">Split: 80% operator / 20% protokol.</span> Operator GPU otomatis menerima 80% dari setiap pembayaran job sebagai USDC ke wallet mereka. Tidak ada staking, tidak ada token protokol.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { label: "Llama 3 8B (Q4)",      price: "$0.0004" },
            { label: "Mistral 7B (Q4)",       price: "$0.0003" },
            { label: "Qwen 2 7B (Q4)",        price: "$0.0003" },
            { label: "Whisper Large v3",      price: "$0.0006" },
            { label: "Llama 3 70B (Q4)",      price: "$0.0016" },
          ].map(m => (
            <div key={m.label} className="rounded-xl px-3 py-3 text-center" style={{ background: "rgba(255,45,45,0.06)", border: "1px solid rgba(255,45,45,0.12)" }}>
              <div className="text-xs leading-tight mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>{m.label}</div>
              <div className="font-bold text-sm" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>{m.price} USDC</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>per 1K out tokens</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA bottom ── */}
      <div className="text-center py-6">
        <Link href="/nodes">
          <button className="inline-flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
            Want to add your GPU? <span style={{ color: "#FF4D4D" }}>Register as a Node →</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
