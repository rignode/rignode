import { useState } from "react";
import { useGetProfitability } from "@workspace/api-client-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const GPU_GROUPS: { label: string; models: { model: string; tps: number; power: number }[] }[] = [
  { label: "NVIDIA RTX 30-series", models: [
    { model: "RTX 3060",    tps: 18,  power: 170 },
    { model: "RTX 3060 Ti", tps: 22,  power: 200 },
    { model: "RTX 3070",    tps: 28,  power: 220 },
    { model: "RTX 3070 Ti", tps: 32,  power: 290 },
    { model: "RTX 3080",    tps: 42,  power: 320 },
    { model: "RTX 3080 Ti", tps: 48,  power: 350 },
    { model: "RTX 3090",    tps: 58,  power: 350 },
    { model: "RTX 3090 Ti", tps: 62,  power: 450 },
  ]},
  { label: "NVIDIA RTX 40-series", models: [
    { model: "RTX 4060",          tps: 35,  power: 115 },
    { model: "RTX 4060 Ti",       tps: 45,  power: 160 },
    { model: "RTX 4070",          tps: 55,  power: 200 },
    { model: "RTX 4070 Ti",       tps: 68,  power: 285 },
    { model: "RTX 4070 Ti Super", tps: 75,  power: 285 },
    { model: "RTX 4080",          tps: 88,  power: 320 },
    { model: "RTX 4080 Super",    tps: 92,  power: 320 },
    { model: "RTX 4090",          tps: 120, power: 450 },
  ]},
  { label: "NVIDIA RTX 50-series", models: [
    { model: "RTX 5070",    tps: 110, power: 250 },
    { model: "RTX 5070 Ti", tps: 130, power: 300 },
    { model: "RTX 5080",    tps: 145, power: 360 },
    { model: "RTX 5090",    tps: 200, power: 575 },
  ]},
  { label: "NVIDIA Data Center", models: [
    { model: "RTX A4000",  tps: 72,  power: 140 },
    { model: "RTX A6000",  tps: 105, power: 300 },
    { model: "A10",        tps: 95,  power: 150 },
    { model: "A100 40G",   tps: 180, power: 400 },
    { model: "A100 80G",   tps: 200, power: 400 },
    { model: "H100 SXM",   tps: 350, power: 700 },
    { model: "H100 PCIe",  tps: 280, power: 350 },
  ]},
  { label: "AMD Radeon RX 6000", models: [
    { model: "RX 6600 XT", tps: 12, power: 160 },
    { model: "RX 6700 XT", tps: 18, power: 230 },
    { model: "RX 6800",    tps: 24, power: 250 },
    { model: "RX 6800 XT", tps: 28, power: 300 },
    { model: "RX 6900 XT", tps: 32, power: 300 },
    { model: "RX 6950 XT", tps: 35, power: 335 },
  ]},
  { label: "AMD Radeon RX 7000", models: [
    { model: "RX 7600",     tps: 16, power: 165 },
    { model: "RX 7700 XT",  tps: 22, power: 245 },
    { model: "RX 7800 XT",  tps: 32, power: 263 },
    { model: "RX 7900 GRE", tps: 40, power: 260 },
    { model: "RX 7900 XT",  tps: 48, power: 315 },
    { model: "RX 7900 XTX", tps: 55, power: 355 },
  ]},
  { label: "AMD Radeon RX 9000", models: [
    { model: "RX 9070",    tps: 42, power: 220 },
    { model: "RX 9070 XT", tps: 52, power: 304 },
  ]},
  { label: "Intel Arc", models: [
    { model: "Arc A770 16G", tps: 14, power: 225 },
    { model: "Arc B580",     tps: 16, power: 150 },
    { model: "Arc B770",     tps: 22, power: 200 },
  ]},
];

const GPU_FLAT = GPU_GROUPS.flatMap(g => g.models);

export function Calculator() {
  const [gpuModel, setGpuModel]         = useState("RTX 3070");
  const [powerWatts, setPowerWatts]     = useState("220");

  function handleGpuSelect(model: string) {
    setGpuModel(model);
    const spec = GPU_FLAT.find(g => g.model === model);
    if (spec) setPowerWatts(String(spec.power));
  }
  const [electricityRate, setRate]      = useState("0.12");
  const [utilizationPct, setUtil]       = useState([15]);

  const { data, isLoading } = useGetProfitability({
    gpuModel,
    powerWatts:       parseFloat(powerWatts)    || undefined,
    electricityRate:  parseFloat(electricityRate) || undefined,
    utilizationPct:   utilizationPct[0],
  });

  const profit = (data?.dailyNetUsdc ?? 0) > 0;

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: -150, left: -100, opacity: 0.2 }} />
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 400, height: 400, bottom: 0, right: -100, opacity: 0.15 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Estimator</div>
          <h1 className="section-heading text-4xl text-white">Profitability Calculator</h1>
          <p className="mt-2 text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
            Real numbers, honest math. Earnings scale with network demand. We never inflate projections.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Inputs */}
          <div className="lg:col-span-2 glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Your Setup</span>
            </div>
            <div className="p-6 space-y-7">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>GPU Model</Label>
                <Select value={gpuModel} onValueChange={handleGpuSelect}>
                  <SelectTrigger style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
                    {GPU_GROUPS.map(group => (
                      <SelectGroup key={group.label}>
                        <SelectLabel style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                          {group.label}
                        </SelectLabel>
                        {group.models.map(g => (
                          <SelectItem key={g.model} value={g.model} style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {g.model}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Power Draw (Watts)</Label>
                <input
                  type="number" className="glass-input" value={powerWatts} min={50} max={600}
                  onChange={e => setPowerWatts(e.target.value)}
                />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>Check your GPU spec sheet for TDP.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Electricity Rate ($/kWh)</Label>
                <input
                  type="number" className="glass-input" value={electricityRate} step={0.01} min={0.01}
                  onChange={e => setRate(e.target.value)}
                />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>US ~$0.12 · EU ~$0.22 · SEA ~$0.08</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Utilization</Label>
                  <span className="font-bold text-lg" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#FF4D4D" }}>{utilizationPct[0]}%</span>
                </div>
                <Slider
                  value={utilizationPct} onValueChange={setUtil}
                  min={5} max={90} step={5}
                  className="[&_[role=slider]]:bg-[#FF2D2D] [&_[role=slider]]:border-[#FF2D2D] [&_[role=slider]]:shadow-[0_0_12px_rgba(255,45,45,0.5)]"
                />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>Early network: 10–20% · Mature: 50%+</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Primary result */}
            <div className="grid gap-4 grid-cols-2">
              {[
                { label: "Daily Gross", value: data?.dailyEarningsUsdc.toFixed(4), prefix: "$", red: false, sub: "USDC before electricity" },
                { label: "Daily Net",   value: data?.dailyNetUsdc !== undefined ? (profit ? `+${data?.dailyNetUsdc.toFixed(4)}` : data?.dailyNetUsdc.toFixed(4)) : undefined, red: profit, sub: "After electricity cost" },
              ].map(s => (
                <div key={s.label} className="glass-card p-6 relative overflow-hidden" style={{ borderRadius: 20 }}>
                  {s.red && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
                  <div className="text-xs font-semibold tracking-widest uppercase mb-3 relative" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
                  {isLoading
                    ? <Skeleton className="h-10 w-28" style={{ background: "rgba(255,255,255,0.05)" }} />
                    : <div className="font-bold text-3xl relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: s.red ? "#FF4D4D" : "#fff" }}>
                        {s.prefix && !s.value?.startsWith("+") ? s.prefix : ""}{s.value}
                      </div>}
                  <div className="text-xs mt-2 relative" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 grid-cols-2">
              {[
                { label: "Monthly Gross", value: data?.monthlyEarningsUsdc.toFixed(2), prefix: "$" },
                { label: "Monthly Net",   value: data?.monthlyNetUsdc !== undefined ? (profit ? `+$${data.monthlyNetUsdc.toFixed(2)}` : `$${data.monthlyNetUsdc.toFixed(2)}`) : undefined, red: profit },
              ].map(s => (
                <div key={s.label} className="glass-card p-5" style={{ borderRadius: 16 }}>
                  <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
                  {isLoading
                    ? <Skeleton className="h-7 w-24" style={{ background: "rgba(255,255,255,0.05)" }} />
                    : <div className="font-bold text-xl" style={{ fontFamily: "Space Grotesk, sans-serif", color: (s as any).red ? "#FF4D4D" : "#fff" }}>{s.prefix && !s.value?.startsWith("+") ? s.prefix : ""}{s.value}</div>}
                </div>
              ))}
            </div>

            {/* Electricity row */}
            <div className="glass-card px-6 py-4 flex items-center justify-between" style={{ borderRadius: 16 }}>
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Electricity Cost</div>
                {isLoading ? <Skeleton className="h-5 w-28" style={{ background: "rgba(255,255,255,0.05)" }} /> : (
                  <div className="text-sm text-white" style={{ fontFamily: "Inter, sans-serif" }}>${data?.dailyElectricityCostUsd.toFixed(4)}/day</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Break-Even Utilization</div>
                {isLoading ? <Skeleton className="h-5 w-20" style={{ background: "rgba(255,255,255,0.05)" }} /> : (
                  <div className="text-sm text-white" style={{ fontFamily: "Inter, sans-serif" }}>{data?.breakEvenUtilizationPct.toFixed(1)}%</div>
                )}
              </div>
            </div>

            {/* Warning */}
            {!isLoading && !profit && (
              <div className="flex gap-4 p-5 rounded-[16px]" style={{ background: "rgba(255,45,45,0.05)", border: "1px solid rgba(255,45,45,0.15)" }}>
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "rgba(255,45,45,0.6)" }} />
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Not profitable at {utilizationPct[0]}% utilization</div>
                  <p className="text-xs leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
                    Your electricity cost exceeds earnings at this utilization level. Try lower power draw, cheaper electricity, or wait for higher network demand before joining.
                  </p>
                </div>
              </div>
            )}

            {/* Assumptions */}
            {!isLoading && data?.assumptions && (
              <div className="glass-card px-6 py-4" style={{ borderRadius: 16 }}>
                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Assumptions</div>
                <p className="text-xs leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{data.assumptions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
