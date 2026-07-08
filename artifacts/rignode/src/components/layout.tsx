import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/contexts/wallet";

function WalletButton() {
  const { connected, connecting, connect, disconnect, truncated, walletName } = useWallet();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  if (!connected) {
    return (
      <button
        className="btn-primary text-sm px-5 py-2"
        onClick={connect}
        disabled={connecting}
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
        style={{
          background: "rgba(255,45,45,0.12)",
          border: "1px solid rgba(255,45,45,0.35)",
          color: "#FF4D4D",
          fontFamily: "Space Grotesk, sans-serif",
        }}
        onClick={() => setShowMenu(m => !m)}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "#FF4D4D", boxShadow: "0 0 6px rgba(255,45,45,0.9)" }} />
        {truncated}
      </button>
      {showMenu && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
          style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
              {walletName ?? "Wallet"}
            </div>
            <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}>
              {truncated}
            </div>
          </div>
          <Link href="/dashboard" onClick={() => setShowMenu(false)}>
            <div className="px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>
              My Dashboard
            </div>
          </Link>
          <Link href="/nodes" onClick={() => setShowMenu(false)}>
            <div className="px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>
              My Nodes
            </div>
          </Link>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              className="w-full text-left px-4 py-3 text-sm transition-all hover:bg-white/5"
              style={{ color: "rgba(255,45,45,0.7)", fontFamily: "Inter, sans-serif" }}
              onClick={() => { disconnect(); setShowMenu(false); }}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/gpu-market", label: "GPU Market" },
  { href: "/nodes",      label: "Nodes" },
  { href: "/jobs",       label: "Jobs" },
  { href: "/earnings",   label: "Earnings" },
  { href: "/network",    label: "Network" },
  { href: "/calculator", label: "Calculator" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0505" }}>
      {/* ── Glass navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(10,5,5,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="container max-w-screen-xl mx-auto px-6 h-16 flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/rignode-logo.png" alt="RIGNODE" className="w-8 h-8 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(255,45,45,0.6))" }} />
            <span className="font-bold text-base tracking-tight text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              RIG<span style={{ color: "#FF4D4D" }}>NODE</span>
            </span>
          </Link>

          {/* Nav links — absolutely centered */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((l) => {
              const active = location === l.href || location.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all",
                    active
                      ? "text-white bg-white/[0.07]"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                  )}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      {/* ── Footer ── */}
      <footer style={{ background: "#070303", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container max-w-screen-xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-12 justify-between">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                <img src="/rignode-logo.png" alt="RIGNODE" className="w-8 h-8 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(255,45,45,0.5))" }} />
                <span className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>RIGNODE</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>
                Decentralized compute exchange on Solana. Real work. Real hardware. Real payouts.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              {[
                { label: "Product",  links: [{ label: "Dashboard", href: "/dashboard" }, { label: "GPU Market", href: "/gpu-market" }, { label: "Nodes", href: "/nodes" }, { label: "Jobs", href: "/jobs" }, { label: "Earnings", href: "/earnings" }, { label: "Network", href: "/network" }, { label: "Calculator", href: "/calculator" }] },
                { label: "Learn",    links: [{ label: "Whitepaper", href: "/whitepaper" }, { label: "Vision", href: "/vision" }, { label: "About", href: "/about" }, { label: "Architecture", href: "/architecture" }, { label: "How It Works", href: "/how-it-works" }, { label: "Thesis", href: "/thesis" }] },
                { label: "Legal",    links: [{ label: "Terms", href: "#" }, { label: "Privacy", href: "#" }, { label: "Disclaimers", href: "#" }] },
              ].map(col => (
                <div key={col.label}>
                  <div className="font-semibold text-white/60 mb-3 tracking-wide text-xs uppercase" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{col.label}</div>
                  <ul className="space-y-2">
                    {col.links.map(l => (
                      <li key={l.label}>
                        <Link href={l.href} className="hover:text-white/80 transition-colors" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif" }}>© 2026 Rignode. No tokens required to earn.</span>
            <span className="text-xs italic" style={{ color: "#4A4A4A", fontFamily: "Inter, sans-serif" }}>Real work. Real hardware. Real payouts.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
