import { useState, useEffect } from "react";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ExternalLink, Info, Copy, CheckCircle, Loader2 } from "lucide-react";
import { JobStatusBadge } from "./dashboard";
import { useWallet } from "@/contexts/wallet";

interface PayQuote {
  quoteId: string;
  model: string;
  amountUsdc: number;
  treasuryWallet: string;
  usdcMint: string;
  network: string;
  expiresAt: string;
}

/* ─ Pricing data ──────────────────────────────────────────── */
interface ModelPricing {
  model: string;
  label: string;
  inputPer1k: string;
  outputPer1k: string;
  speed: string;
  minCost: string;
  vramMin: number;
}

const MODEL_PRICING: ModelPricing[] = [
  { model: "llama3-8b-q4",     label: "Llama 3 8B (Q4)",        inputPer1k: "$0.0001", outputPer1k: "$0.0004", speed: "~35 tok/s",  minCost: "$0.0001", vramMin: 6  },
  { model: "llama3-70b-q4",    label: "Llama 3 70B (Q4)",       inputPer1k: "$0.0004", outputPer1k: "$0.0016", speed: "~8 tok/s",   minCost: "$0.0005", vramMin: 40 },
  { model: "mistral-7b-q4",    label: "Mistral 7B (Q4)",        inputPer1k: "$0.0001", outputPer1k: "$0.0003", speed: "~40 tok/s",  minCost: "$0.0001", vramMin: 6  },
  { model: "qwen2-7b-q4",      label: "Qwen 2 7B (Q4)",         inputPer1k: "$0.0001", outputPer1k: "$0.0003", speed: "~38 tok/s",  minCost: "$0.0001", vramMin: 6  },
  { model: "whisper-large-v3", label: "Whisper Large v3",       inputPer1k: "$0.0006/min", outputPer1k: "N/A", speed: "~10× RT",    minCost: "$0.0001", vramMin: 8  },
];

const MODELS = MODEL_PRICING.map(m => m.model);

/* ─ Pricing table ─────────────────────────────────────────── */
function PricingTable({ highlightModel }: { highlightModel?: string }) {
  return (
    <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Info className="h-4 w-4" style={{ color: "#FF4D4D" }} />
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>Pay-per-use</div>
          <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Model Pricing (USDC)</div>
        </div>
        <div className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>
          80% node operator · 20% protocol
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full dark-table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Input / 1K tokens</th>
              <th>Output / 1K tokens</th>
              <th>Speed</th>
              <th>Min cost</th>
              <th>Min VRAM</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_PRICING.map(p => (
              <tr key={p.model} style={highlightModel === p.model ? { background: "rgba(255,45,45,0.04)" } : undefined}>
                <td className="font-semibold" style={{ color: highlightModel === p.model ? "#FF4D4D" : "rgba(255,255,255,0.8)", fontFamily: "Space Grotesk, sans-serif" }}>
                  {p.label}
                  {highlightModel === p.model && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,45,45,0.15)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>selected</span>
                  )}
                </td>
                <td className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{p.inputPer1k}</td>
                <td className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{p.outputPer1k}</td>
                <td style={{ color: "rgba(255,255,255,0.4)" }}>{p.speed}</td>
                <td className="font-mono text-sm" style={{ color: "#FF4D4D" }}>{p.minCost}</td>
                <td style={{ color: "rgba(255,255,255,0.35)" }}>{p.vramMin} GB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Escrow explainer */}
      <div className="px-6 py-4 flex flex-wrap gap-6 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>Escrow Flow</span>
        {["1. Client locks USDC in escrow", "2. Job runs on matched node", "3. Output verified on-chain", "4. 80% released to operator", "5. 20% protocol fee"].map((step, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
            <div className="w-1 h-1 rounded-full shrink-0" style={{ background: i === 3 ? "#FF4D4D" : "rgba(255,255,255,0.2)" }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─ Jobs page ─────────────────────────────────────────────── */
export function Jobs() {
  const { data: jobs, isLoading } = useListJobs();
  const queryClient = useQueryClient();
  const { publicKey, connected, connect, sendUsdc } = useWallet();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "quote" | "paying">("form");
  const [form, setForm] = useState({ model: "", prompt: "", clientAddress: "" });
  const [quote, setQuote] = useState<PayQuote | null>(null);
  const [txSig, setTxSig] = useState("");
  const [copied, setCopied] = useState(false);
  const [payError, setPayError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setForm(f => ({ ...f, clientAddress: publicKey }));
    }
  }, [connected, publicKey]);

  const resetDialog = () => {
    setStep("form");
    setQuote(null);
    setTxSig("");
    setPayError("");
    setIsPaying(false);
    setForm(f => ({ ...f, model: "", prompt: "" }));
  };

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model || !form.prompt) return;
    setPayError("");
    try {
      const res = await fetch("/api/pay/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: form.model, promptLength: form.prompt.length }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setPayError(String(data.error ?? "Quote failed")); return; }
      setQuote(data as unknown as PayQuote);
      setStep("quote");
    } catch {
      setPayError("Network error — try again");
    }
  };

  const handleWalletPay = async () => {
    if (!quote) return;
    setPayError("");
    setIsPaying(true);
    try {
      const sig = await sendUsdc(quote.treasuryWallet, quote.amountUsdc, undefined, quote.usdcMint);
      setTxSig(sig);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmitJob = async () => {
    if (!form.model || !form.prompt) return;
    setPayError("");
    setIsPaying(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: form.model,
          prompt: form.prompt,
          clientAddress: form.clientAddress || null,
          txSignature: txSig.trim() || undefined,
        }),
      });
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) { setPayError(String(json.error ?? "Job submission failed")); return; }
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      setOpen(false);
      resetDialog();
    } catch {
      setPayError("Network error — try again");
    } finally {
      setIsPaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const selectedPricing = MODEL_PRICING.find(p => p.model === form.model);

  const total = jobs?.length ?? 0;
  const completed = jobs?.filter(j => j.status === "completed").length ?? 0;
  const active = jobs?.filter(j => j.status === "running" || j.status === "pending" || j.status === "assigned").length ?? 0;

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: -150, right: -100, opacity: 0.2 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Marketplace</div>
            <h1 className="section-heading text-4xl text-white">Job Queue</h1>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
              Inference workloads submitted to the decentralized network. Pay-per-use, USDC escrow.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary"><Plus className="h-4 w-4" />Submit Job</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]" style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20 }}>
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-[20px]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,45,45,0.5),transparent)" }} />
              <DialogHeader>
                <DialogTitle className="font-bold text-white text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {step === "form" ? "Submit Inference Job" : step === "quote" ? "Pay to Submit" : "Submitting…"}
                </DialogTitle>
              </DialogHeader>

              {/* ── Step 1: Job form ── */}
              {step === "form" && (
                <form onSubmit={handleGetQuote} className="space-y-5 mt-4">
                  {/* Model */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Model</Label>
                    <Select value={form.model} onValueChange={v => setForm(f => ({ ...f, model: v }))}>
                      <SelectTrigger style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
                        {MODELS.map(m => {
                          const p = MODEL_PRICING.find(x => x.model === m)!;
                          return (
                            <SelectItem key={m} value={m} style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                              {p.label} · out {p.outputPer1k}/1K
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedPricing && (
                      <div className="flex gap-4 text-xs px-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
                        <span>In: <span className="text-white/60">{selectedPricing.inputPer1k}/1K</span></span>
                        <span>Out: <span className="text-white/60">{selectedPricing.outputPer1k}/1K</span></span>
                        <span>Speed: <span className="text-white/60">{selectedPricing.speed}</span></span>
                        <span>Min: <span style={{ color: "#FF4D4D" }}>{selectedPricing.minCost}</span></span>
                      </div>
                    )}
                  </div>
                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Prompt</Label>
                    <textarea
                      style={{ borderBottom: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, background: "rgba(255,255,255,0.03)", padding: "0.875rem", height: 110, color: "#fff", fontFamily: "Inter, sans-serif", fontSize: "0.875rem", outline: "none", width: "100%", resize: "none" }}
                      placeholder="Enter your inference prompt…"
                      value={form.prompt}
                      onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                      required
                    />
                  </div>
                  {/* Client wallet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Client Wallet</Label>
                      {connected && <span className="text-xs" style={{ color: "rgba(255,45,45,0.7)", fontFamily: "Inter, sans-serif" }}>Auto-filled from connected wallet</span>}
                    </div>
                    <input
                      className="glass-input"
                      placeholder={connected ? "Connected wallet auto-filled" : "Your Solana wallet address (optional)"}
                      value={form.clientAddress}
                      onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                    />
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>Used for on-chain job attribution and refund routing in case of dispute.</p>
                  </div>
                  {payError && <p className="text-sm text-center" style={{ color: "#FF4D4D", fontFamily: "Inter, sans-serif" }}>{payError}</p>}
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={!form.model || !form.prompt}>
                    Get Payment Quote →
                  </button>
                </form>
              )}

              {/* ── Step 2: Pay ── */}
              {step === "quote" && quote && (
                <div className="space-y-5 mt-4">
                  {/* Amount box */}
                  <div className="rounded-2xl px-5 py-4 text-center" style={{ background: "rgba(255,45,45,0.06)", border: "1px solid rgba(255,45,45,0.2)" }}>
                    <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>Amount Due</div>
                    <div className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#FF4D4D", letterSpacing: "-0.03em" }}>
                      ${quote.amountUsdc.toFixed(6)} <span className="text-base font-semibold" style={{ color: "rgba(255,77,77,0.6)" }}>USDC</span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>
                      {quote.model} · {quote.network} · expires {new Date(quote.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Treasury wallet */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Send USDC to Treasury Wallet</div>
                    <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <code className="flex-1 text-xs break-all" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}>{quote.treasuryWallet}</code>
                      <button type="button" onClick={() => copyToClipboard(quote.treasuryWallet)} className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors">
                        {copied ? <CheckCircle className="h-4 w-4" style={{ color: "#22c55e" }} /> : <Copy className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />}
                      </button>
                    </div>
                  </div>

                  {/* Wallet pay button */}
                  {connected ? (
                    <button
                      type="button"
                      onClick={handleWalletPay}
                      disabled={isPaying || !!txSig}
                      className="btn-primary w-full justify-center py-3"
                    >
                      {isPaying ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Sending USDC…</>
                      ) : txSig ? (
                        <><CheckCircle className="h-4 w-4" />Payment Sent!</>
                      ) : (
                        "Pay with Wallet →"
                      )}
                    </button>
                  ) : (
                    <button type="button" onClick={connect} className="btn-primary w-full justify-center py-3">
                      Connect Wallet to Pay →
                    </button>
                  )}

                  {/* Manual txSig paste fallback */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>
                      Or paste your transaction signature manually
                    </div>
                    <input
                      className="glass-input"
                      placeholder="Solana transaction signature (base58, 64–88 chars)…"
                      value={txSig}
                      onChange={e => { setTxSig(e.target.value); setPayError(""); }}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem" }}
                    />
                  </div>

                  {payError && <p className="text-sm text-center" style={{ color: "#FF4D4D", fontFamily: "Inter, sans-serif" }}>{payError}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep("form"); setPayError(""); }} className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitJob}
                      disabled={isPaying || !txSig.trim()}
                      className="flex-2 flex-grow py-3 btn-primary justify-center"
                    >
                      {isPaying ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : "Confirm & Submit Job →"}
                    </button>
                  </div>

                  <div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                    Server verifies on-chain that USDC reached the treasury before creating your job.
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[{ label: "Total Jobs", value: total, red: false }, { label: "Completed", value: completed, red: true }, { label: "Active / Queued", value: active, red: false }].map(s => (
            <div key={s.label} className="glass-card py-6 text-center relative overflow-hidden" style={{ borderRadius: 20 }}>
              {s.red && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,45,45,0.1) 0%, transparent 60%)" }} />}
              <div className="font-bold text-3xl relative" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.03em", color: s.red ? "#FF4D4D" : "#fff" }}>{s.value}</div>
              <div className="mt-2 text-sm relative" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pricing table */}
        <PricingTable />

        {/* Network status notice */}
        <div className="rounded-xl px-5 py-4 flex items-start gap-3" style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.18)" }}>
          <div className="shrink-0 w-2 h-2 rounded-full animate-pulse" style={{ background: "#FFB400", marginTop: 6 }} />
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FFB400", fontFamily: "Space Grotesk, sans-serif" }}>Early Access — Live Network</span>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
              This is the real RIGNODE job queue. All stats — nodes, completions, and USDC paid — reflect genuine activity on the network. Job routing, verification, and on-chain payouts are active. Numbers shown are not simulated.
            </p>
          </div>
        </div>

        {/* Job table */}
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>All Jobs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dark-table" style={{ minWidth: 680 }}>
              <thead>
                <tr><th>ID</th><th>Model</th><th>Tokens In/Out</th><th>Status</th><th>Verified</th><th>Earning</th><th>Date</th><th>Tx</th></tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j}><Skeleton className="h-4 w-16" style={{ background: "rgba(255,255,255,0.05)" }} /></td>)}</tr>
                  ))
                  : jobs?.length === 0
                    ? <tr><td colSpan={8} className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No jobs submitted yet.</td></tr>
                    : jobs?.map(job => (
                      <tr key={job.id} className="group">
                        <td className="font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>#{job.id}</td>
                        <td>{job.model}</td>
                        <td style={{ color: "rgba(255,255,255,0.4)" }}>{job.inputTokens}/{job.outputTokens}</td>
                        <td><JobStatusBadge status={job.status} /></td>
                        <td>
                          {job.verified
                            ? <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: "#FF4D4D", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)" }}>Verified</span>
                            : <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>}
                        </td>
                        <td className="font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>+${Number(job.earningUsdc).toFixed(4)}</td>
                        <td style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem" }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td>
                          {job.txSignature
                            ? <a href={`https://explorer.solana.com/tx/${job.txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: "rgba(255,184,61,0.8)", fontFamily: "Inter, sans-serif" }}>
                                {job.txSignature.slice(0, 8)}… <ExternalLink className="h-3 w-3" />
                              </a>
                            : <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>}
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
