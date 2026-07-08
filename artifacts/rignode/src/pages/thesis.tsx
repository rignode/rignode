import React, { useState, useEffect, useRef } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const TOC = [
  { id: "idle-capacity",       label: "The Idle Capacity Cycle" },
  { id: "agents-buyers",       label: "Agents Are the New Buyers" },
  { id: "micro-jobs-solana",   label: "Why Micro-Jobs Need Solana" },
  { id: "verification",        label: "The Verification Problem" },
  { id: "demand-before-supply",label: "Demand Before Supply" },
  { id: "risks",               label: "Risks We State Openly" },
];

const SECTIONS: { id: string; title: string; pullQuote: string; paragraphs: string[] }[] = [
  {
    id: "idle-capacity",
    title: "The Idle Capacity Cycle",
    pullQuote: "Every computing era monetized waste. The agent economy is the next turn of the same cycle.",
    paragraphs: [
      "Every major computing transition follows the same arc: a new workload arrives, it outpaces centralized supply, and capital flows to whoever can aggregate the latent capacity already sitting in homes and offices. Volunteer computing monetized university lab downtime. Mining monetized consumer GPUs between gaming sessions. Cloud arbitrage monetized reserved instances that enterprises under-utilized.",
      "The pattern is not coincidence. Centralized providers optimize for average load, which means they always underprovide at demand spikes and overprovide at troughs. That structural gap is where decentralized networks find their margin. The compute that runs your inference at 3 AM was almost certainly sitting idle. The question is only whether its owner was connected to the right market.",
      "The agent economy is the next turn of this cycle. AI agents do not work 9-to-5. They run continuously, in parallel, spending money autonomously. The demand is real, growing, and distributed across thousands of applications. The hardware capable of serving it already exists in the hands of millions of GPU owners who have no reliable way to sell it. RIGNODE is the market that closes this gap.",
    ],
  },
  {
    id: "agents-buyers",
    title: "Agents Are the New Buyers",
    pullQuote: "Machine-to-machine commerce does not negotiate. It settles on-chain, per job, without a human in the loop.",
    paragraphs: [
      "The structural shift is simple but profound: the buyer of inference is no longer a human with a credit card. It is an AI agent with an on-chain wallet, executing a plan set by its human principal. ACP (the Agent Commerce Protocol) defines how agents request, negotiate, escrow, and settle for services. The lifecycle is deterministic: request → negotiate → escrow → work → evaluate → settle. No invoice, no net-30, no chargebacks.",
      "Agents structurally prefer micro-priced, on-chain-payable inference for three reasons. First, they can verify results programmatically before approving settlement. They do not need to trust the provider. Second, escrow removes counterparty risk from both sides; the agent's payment is locked before work begins, and the node operator's payout is guaranteed before they execute. Third, per-job pricing aligns cost precisely with output. There is no minimum subscription that forces an agent to over-buy.",
      "This is why ACP-native compute providers have a structural advantage over traditional API vendors in the agent economy. A billing portal designed for human engineers is an obstacle to an agent. An ACP endpoint is a native interface.",
    ],
  },
  {
    id: "micro-jobs-solana",
    title: "Why Micro-Jobs Need Solana",
    pullQuote: "Sub-cent fees make per-job stablecoin payouts viable. This model is impossible on a high-fee chain.",
    paragraphs: [
      "The economics of per-inference settlement are simple: if a job pays $0.002, the settlement fee must be orders of magnitude smaller. Solana's median transaction fee is approximately $0.00025. That is less than 13% of a $0.002 job, economically viable. Ethereum's median fee during normal conditions exceeds a dollar; at that cost, per-job settlement is structurally impossible unless jobs are large and infrequent.",
      "RIGNODE batches payouts hourly or at a $1 threshold per node, keeping the per-settlement overhead under 0.025% of payout value. Every settlement emits a transaction signature that any operator can verify in Solana Explorer, not a receipt in our system, but a record that exists independently of us.",
      "This is not a preference for Solana's ecosystem. It is an engineering constraint: the business model requires sub-cent settlement fees, and that requirement selects the chain. If another high-throughput, low-fee chain with a mature stablecoin ecosystem emerges, the gateway is designed to be modular enough to support it.",
    ],
  },
  {
    id: "verification",
    title: "The Verification Problem, Honestly",
    pullQuote: "We make cheating detectable and unprofitable, not impossible. Anyone claiming otherwise is selling you something.",
    paragraphs: [
      "The honest framing of the verification problem: you cannot mathematically prove that a GPU operator ran your inference rather than substituting a cached or corrupted output, not without running the inference again yourself, which defeats the purpose. Zero-knowledge machine learning proofs exist in research, but generating a zk-SNARK proof of a 7-billion-parameter forward pass costs more in compute than the inference itself. We state this explicitly because competitors who imply otherwise are making a claim that does not survive contact with the current cost curves.",
      "Our approach combines three mechanisms that are individually imperfect and collectively robust. Canary jobs (hidden test prompts with known answers) are indistinguishable from real work. A node that substitutes outputs will fail canaries at a rate determined by sampling frequency. Redundant execution double-runs new nodes and randomly samples established ones. Economic reputation makes each canary failure costly: a node's expected value of future work far exceeds what any single job could steal, so rational actors comply.",
      "The result: cheating is economically irrational for rational actors and statistically detectable for irrational ones. It is not cryptographically impossible. We publish this distinction because the operators who understand it are exactly the partners we want.",
    ],
  },
  {
    id: "demand-before-supply",
    title: "Demand Before Supply",
    pullQuote: "Supply-first DePIN networks die because idle GPUs without buyers are not a product, they are an electricity bill.",
    paragraphs: [
      "Most decentralized physical infrastructure networks recruit supply first and hope demand follows. The result is a familiar pattern: token incentives attract GPU owners, GPU owners come online, clients never materialize in sufficient volume, token price collapses, GPU owners leave. The infrastructure was never really infrastructure. It was a speculation vehicle.",
      "RIGNODE's Phase 0 sells an OpenAI-compatible API to real paying clients before ACP integration is complete and before a single external node is recruited. Revenue from Phase 0 validates that clients will pay at RIGNODE's price point, calibrates the verification system against real workloads, and seeds the reputation ledger with actual job history.",
      "When the network opens to external node operators, demand is already present. Reputation built on ACP compounds: agents that have settled successfully through RIGNODE's gateway include it in future provider preference lists. Supply joins a network with buyers, not a waiting room with promises.",
    ],
  },
  {
    id: "risks",
    title: "Risks We State Openly",
    pullQuote: "Stating risks clearly is not pessimism. It is the only way to build trust with operators who have heard every pitch.",
    paragraphs: [
      "Demand risk: the agent economy is real, but volumes in 2025 are still early. If ACP adoption is slower than projected, node earnings will be lower than the calculator's optimistic scenarios. We model conservative, baseline, and optimistic cases and show all three. Operators who cannot survive the conservative case should not join yet.",
      "Competition risk: large inference providers can copy the gateway and undercut on price. Our defensible advantage is verification infrastructure, ACP reputation history, and the operator community that trusts the system. Infrastructure is not copied overnight. Verification adversaries: sufficiently sophisticated operators could attempt to game canary sampling. We model this threat and will publish adversarial stress-test results. We expect a small fraction of attempts and high detection rates.",
      "Regulatory variance by jurisdiction creates uncertainty for operators in some regions. We do not provide legal advice. Dependency on ACP is mitigated by a modular gateway designed to support alternative agent protocols; ACP is our first integration, not our only possible one. We publish this risk register in full. If you find a risk we have not listed, we want to hear from you.",
    ],
  },
];

export function Thesis() {
  const [activeSection, setActiveSection] = useState(TOC[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative" style={{ background: "#0A0505" }}>
      {/* ── HERO ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="pill-badge-red mb-6 inline-flex"><div className="dot-red" />Thesis</div>
          <h1 className="section-heading text-5xl md:text-7xl mb-6 text-white">
            Why this.<br />
            <span style={{ color: "#FF4D4D" }}>Why now.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#8A8A8A", fontFamily: "Inter, sans-serif" }}>
            The long-form argument for decentralized inference markets, including the risks we'd rather you read here than discover elsewhere.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="px-6 pb-28">
        <div className="container max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16">

            {/* Sticky TOC — desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-1">
                <div className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Contents</div>
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block py-2 px-3 rounded-lg text-sm transition-all"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      color: activeSection === item.id ? "#FF4D4D" : "rgba(255,255,255,0.3)",
                      background: activeSection === item.id ? "rgba(255,45,45,0.07)" : "transparent",
                      borderLeft: activeSection === item.id ? "2px solid #FF2D2D" : "2px solid transparent",
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>

            {/* Mobile TOC */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 mb-8 -mx-6 px-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    background: activeSection === item.id ? "rgba(255,45,45,0.15)" : "rgba(255,255,255,0.04)",
                    border: activeSection === item.id ? "1px solid rgba(255,45,45,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    color: activeSection === item.id ? "#FF4D4D" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-20">
              {SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => { sectionRefs.current[sec.id] = el; }}
                >
                  <h2 className="section-heading text-2xl md:text-3xl text-white mb-8" style={{ scrollMarginTop: 96 }}>
                    {sec.title}
                  </h2>

                  {/* Pull quote */}
                  <blockquote className="mb-8 pl-5 py-1" style={{ borderLeft: "3px solid #FF2D2D" }}>
                    <p className="text-base md:text-lg italic leading-relaxed" style={{ color: "#C04040", fontFamily: "Inter, sans-serif" }}>
                      "{sec.pullQuote}"
                    </p>
                  </blockquote>

                  {/* Paragraphs */}
                  <div className="space-y-5">
                    {sec.paragraphs.map((para, i) => (
                      <p key={i} className="text-base leading-[1.85]" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Download + CTA */}
              <div className="pt-8 space-y-6">
                <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Full Document (PDF)</div>
                    <p className="text-sm" style={{ color: "#6A6A6A", fontFamily: "Inter, sans-serif" }}>Expanded version with data appendix and technical footnotes.</p>
                  </div>
                  <button className="btn-secondary flex items-center gap-2 shrink-0 py-2.5 px-5 text-sm">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>

                <div className="glass-card-red rounded-2xl p-8 text-center">
                  <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Real work. Real hardware. Real payouts.</div>
                  <h3 className="section-heading text-2xl md:text-3xl text-white mb-3">Ready to put your GPU to work?</h3>
                  <p className="text-sm mb-6" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>No token required. No staking. Earnings scale with real network demand.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/nodes">
                      <button className="btn-primary flex items-center gap-2">Run a Node <ArrowRight className="h-4 w-4" /></button>
                    </Link>
                    <Link href="/how-it-works">
                      <button className="btn-secondary">See how it works</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
