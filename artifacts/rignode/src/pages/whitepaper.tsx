import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";

/* ─ Table of contents ─────────────────────────────────────── */
const TOC = [
  { id: "abstract",       num: "0", label: "Abstract" },
  { id: "introduction",   num: "1", label: "Introduction" },
  { id: "architecture",   num: "2", label: "System Architecture" },
  { id: "node-lifecycle", num: "3", label: "Node Lifecycle" },
  { id: "job-lifecycle",  num: "4", label: "Job Lifecycle" },
  { id: "verification",   num: "5", label: "Verification System" },
  { id: "settlement",     num: "6", label: "Payment Settlement" },
  { id: "economics",      num: "7", label: "Token Economics" },
  { id: "security",       num: "8", label: "Security Model" },
  { id: "roadmap",        num: "9", label: "Roadmap" },
  { id: "references",     num: "10", label: "References" },
];

/* ─ Reusable section wrapper ──────────────────────────────── */
function Section({ id, num, title, children, sectionRefs }: {
  id: string; num: string; title: string; children: React.ReactNode;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  return (
    <section
      id={id}
      ref={el => { sectionRefs.current[id] = el; }}
      className="space-y-5"
      style={{ scrollMarginTop: 96 }}
    >
      <div className="flex items-baseline gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xs font-bold tabular-nums" style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif", minWidth: 24 }}>{num}.</span>
        <h2 className="section-heading text-2xl md:text-3xl text-white">{title}</h2>
      </div>
      <div className="space-y-4 pl-8">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-[1.9]" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-base mt-7 mb-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Space Grotesk, sans-serif" }}>{children}</h3>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="pl-4 py-2" style={{ borderLeft: "2px solid rgba(255,45,45,0.4)", background: "rgba(255,45,45,0.04)", borderRadius: "0 8px 8px 0" }}>
      <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>{children}</p>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-2">
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {headers.map(h => (
              <th key={h} className="text-left py-2.5 pr-6 text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-6 text-sm align-top" style={{ color: j === 0 ? "rgba(255,255,255,0.65)" : "#7A7A7A" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─ Main whitepaper page ──────────────────────────────────── */
export function Whitepaper() {
  const [activeSection, setActiveSection] = useState("abstract");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "absolute", width: 700, height: 700, top: -250, left: "50%", transform: "translateX(-50%)", opacity: 0.2 }} />

      {/* ── Hero ── */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="container max-w-3xl mx-auto relative z-10">
          <div className="pill-badge-red mb-5 inline-flex"><div className="dot-red" />Technical Whitepaper v0.1</div>
          <h1 className="section-heading text-5xl md:text-6xl mb-5 text-white">
            RIGNODE<br />
            <span style={{ color: "#FF4D4D" }}>Whitepaper</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "#7A7A7A", fontFamily: "Inter, sans-serif" }}>
            A decentralized inference exchange where GPU operators earn USDC per verified AI job,
            settled on-chain via Solana. This document covers architecture, verification,
            economics, and security.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
            <span>Version 0.1 · July 2026</span>
            <span style={{ color: "rgba(255,255,255,0.08)" }}>|</span>
            <span>rignode.xyz</span>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="px-6 pb-32">
        <div className="container max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">

            {/* Sticky TOC — desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-0.5">
                <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>Contents</div>
                {TOC.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-sm transition-all"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: activeSection === item.id ? "#FF4D4D" : "rgba(255,255,255,0.28)",
                      background: activeSection === item.id ? "rgba(255,45,45,0.07)" : "transparent",
                      borderLeft: activeSection === item.id ? "2px solid #FF2D2D" : "2px solid transparent",
                    }}
                  >
                    <span className="tabular-nums text-xs w-5 shrink-0" style={{ color: activeSection === item.id ? "rgba(255,45,45,0.6)" : "rgba(255,255,255,0.15)" }}>{item.num}.</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>

            {/* Mobile TOC */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 mb-8 -mx-6 px-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {TOC.map(item => (
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
                  {item.num}. {item.label}
                </a>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="space-y-20">

              {/* 0. Abstract */}
              <Section id="abstract" num="0" title="Abstract" sectionRefs={sectionRefs}>
                <P>
                  RIGNODE is a permissionless compute exchange that connects GPU operators to AI inference demand, settling every job in USDC on the Solana blockchain. The protocol enables any owner of a qualifying GPU (8 GB+ VRAM) to earn a stable-denomination income by serving inference requests from AI agents and developers — without staking tokens, without lock-ups, and without a centralized intermediary holding funds.
                </P>
                <P>
                  This document describes the technical architecture of the RIGNODE protocol: how nodes are registered and matched to jobs, how job results are verified without re-running inference, how payments are batched and settled on-chain, and how the economic model is designed to remain viable across demand cycles. We also describe the threat model and the known limitations of our verification approach.
                </P>
                <Note>
                  This is a living document. Protocol parameters (split ratios, batch thresholds, canary rates) may be updated as the network matures. All changes will be versioned and published at rignode.xyz/whitepaper.
                </Note>
              </Section>

              {/* 1. Introduction */}
              <Section id="introduction" num="1" title="Introduction" sectionRefs={sectionRefs}>
                <P>
                  The global stock of consumer and prosumer GPUs capable of running 7B-70B parameter quantized models is in the tens of millions. The vast majority sit idle for 20+ hours per day. Simultaneously, the emergence of autonomous AI agents has created a new class of compute buyer: software that spends on-chain, per inference, without a human approving each transaction.
                </P>
                <P>
                  Existing cloud inference APIs require a credit card, a rate-limit policy, and a human-readable invoice. They are not designed for machine-to-machine commerce at sub-cent granularity. RIGNODE is.
                </P>
                <H3>1.1 Design Goals</H3>
                <Table
                  headers={["Goal", "Description"]}
                  rows={[
                    ["Permissionless entry", "Any operator with a qualifying GPU can register and begin earning. No whitelist, no minimum stake."],
                    ["Stable denomination", "Payouts in USDC. Operators price their risk in USD, not in a volatile protocol token."],
                    ["On-chain auditability", "Every settlement has a Solana transaction signature. Any party can verify the payout independently."],
                    ["Verifiable output", "Job results are verified via a multi-layer system before settlement is approved."],
                    ["ACP-native", "The protocol is a first-class citizen of the Agent Commerce Protocol, designed for machine-to-machine settlement."],
                  ]}
                />
                <H3>1.2 Non-Goals</H3>
                <P>
                  RIGNODE does not issue a protocol token. It does not provide training compute. It does not custody private keys. It is not a VPN or privacy layer. Model weights remain on the operator's machine; RIGNODE routes jobs and settles payment, it does not store or re-distribute model artifacts.
                </P>
              </Section>

              {/* 2. Architecture */}
              <Section id="architecture" num="2" title="System Architecture" sectionRefs={sectionRefs}>
                <P>
                  The RIGNODE system has four logical layers: the Operator Layer (GPU nodes), the Coordinator Layer (the RIGNODE gateway and scheduler), the Settlement Layer (Solana + USDC), and the Client Layer (AI agents and developers).
                </P>
                <H3>2.1 Component Overview</H3>
                <Table
                  headers={["Component", "Role", "Who operates it"]}
                  rows={[
                    ["Node Client", "Docker container on the operator's machine. Receives jobs, runs inference, returns results and token counts.", "Operator"],
                    ["Coordinator / Scheduler", "Matches jobs to nodes based on GPU capability, region, trust score, and availability. Routes canary jobs.", "RIGNODE"],
                    ["Verification Engine", "Compares outputs against canary answers, checks token count consistency, flags anomalies.", "RIGNODE"],
                    ["Settlement Gateway", "Batches approved payouts, signs Solana transactions, emits on-chain USDC transfers.", "RIGNODE"],
                    ["Node Registry (DB)", "Stores node metadata, status, earnings, trust scores. Public read via /api/nodes.", "RIGNODE"],
                    ["Job Ledger (DB)", "Stores job records including model, token counts, status, tx signature. Public read via /api/jobs.", "RIGNODE"],
                  ]}
                />
                <H3>2.2 API Surface</H3>
                <P>
                  The RIGNODE public API is defined in OpenAPI 3.1 and auto-generates typed client hooks via Orval. All endpoints are under <code style={{ color: "#FF4D4D", fontFamily: "monospace", fontSize: "0.875em" }}>/api</code>. The full spec is available at <code style={{ color: "#FF4D4D", fontFamily: "monospace", fontSize: "0.875em" }}>/api/spec</code>.
                </P>
                <Table
                  headers={["Endpoint", "Description"]}
                  rows={[
                    ["GET /nodes", "List all registered nodes with status, GPU, trust score, earnings"],
                    ["POST /nodes", "Register a new node (wallet address, GPU model, VRAM, region)"],
                    ["GET /jobs", "List all inference jobs with status, model, token counts, tx signature"],
                    ["POST /jobs", "Submit an inference job (model, prompt, optional client wallet)"],
                    ["GET /stats/network", "Aggregate network stats: nodes, jobs/hr, USDC paid, top models"],
                    ["GET /stats/tokens", "Per-model token breakdown: input tokens, output tokens, job count"],
                  ]}
                />
              </Section>

              {/* 3. Node lifecycle */}
              <Section id="node-lifecycle" num="3" title="Node Lifecycle" sectionRefs={sectionRefs}>
                <H3>3.1 Registration</H3>
                <P>
                  An operator submits their GPU model, VRAM, region, and Solana wallet address via the Nodes page or the API. RIGNODE records this in the node registry and returns an install script. No payment or deposit is required at registration. The wallet address is receive-only; RIGNODE never requests a private key or signing authority.
                </P>
                <H3>3.2 Node Client Installation</H3>
                <P>
                  The node client is a Docker container that the operator runs on their machine. On startup it authenticates to the RIGNODE coordinator, downloads the assigned model weights (if not already cached), and begins polling for jobs. The client sends heartbeat pings every 30 seconds; a node that misses 3 consecutive pings transitions to <code style={{ color: "#FF4D4D", fontFamily: "monospace", fontSize: "0.875em" }}>offline</code> status and stops receiving work.
                </P>
                <H3>3.3 Status State Machine</H3>
                <Table
                  headers={["Status", "Meaning", "Receives jobs?"]}
                  rows={[
                    ["online", "Connected, heartbeat current, no active job", "Yes"],
                    ["busy", "Currently processing a job", "No (until job completes)"],
                    ["offline", "No heartbeat for 90+ seconds", "No"],
                    ["suspended", "Flagged by verification engine (repeated canary failures)", "No"],
                  ]}
                />
                <H3>3.4 Trust Score</H3>
                <P>
                  Each node has a trust score from 0.0 to 1.0, initialized at 0.5 on registration. The score increases with successful jobs and decreases with canary failures, timeout events, and result-hash mismatches. Nodes with scores below 0.3 are automatically suspended pending review. Trust score is public via the node registry API.
                </P>
              </Section>

              {/* 4. Job lifecycle */}
              <Section id="job-lifecycle" num="4" title="Job Lifecycle" sectionRefs={sectionRefs}>
                <P>
                  Every inference request follows a deterministic lifecycle. No human approves individual jobs; the entire flow is automated.
                </P>
                <Table
                  headers={["Stage", "Actor", "Description"]}
                  rows={[
                    ["pending", "Client", "Job submitted via POST /jobs or ACP negotiation"],
                    ["assigned", "Coordinator", "Matched to an available node with correct GPU + model"],
                    ["running", "Node Client", "Inference executing on the operator's GPU"],
                    ["completed", "Verification Engine", "Output returned, token counts checked, canary result validated"],
                    ["failed", "System", "Timeout, model error, or canary failure — job re-queued or refunded"],
                    ["disputed", "Verification Engine", "Anomalous output requiring manual review before settlement"],
                  ]}
                />
                <H3>4.1 Job Matching</H3>
                <P>
                  The scheduler selects nodes using a weighted score: trust score (50%), region proximity to client (20%), current load (20%), and historical latency (10%). Nodes running the required model get priority over nodes that need to load it cold. Cold-load jobs incur a 45-second warm-up window before the job timeout starts.
                </P>
                <H3>4.2 Timeouts</H3>
                <P>
                  Jobs that do not return within 120 seconds (warm) or 165 seconds (cold) are marked <code style={{ color: "#FF4D4D", fontFamily: "monospace", fontSize: "0.875em" }}>failed</code> and the node's trust score is decremented. The job is re-queued on the next available node at no cost to the client.
                </P>
              </Section>

              {/* 5. Verification */}
              <Section id="verification" num="5" title="Verification System" sectionRefs={sectionRefs}>
                <P>
                  The verification problem is this: you cannot mathematically prove a node ran your inference without re-running it yourself, which defeats the purpose. Zero-knowledge ML proofs exist in research but generating a zk-SNARK of a 7B-parameter forward pass costs more compute than the inference itself. RIGNODE does not claim cryptographic verification. It uses three complementary mechanisms that collectively make cheating economically irrational.
                </P>
                <H3>5.1 Canary Jobs</H3>
                <P>
                  Approximately 8% of jobs routed to any node are canary jobs — real-looking prompts with deterministic, pre-known correct answers. Canaries are indistinguishable from client jobs at the protocol level. A node that substitutes cached or hallucinated outputs will fail canaries at a statistically detectable rate within 50–200 jobs.
                </P>
                <H3>5.2 Redundant Execution</H3>
                <P>
                  New nodes (fewer than 20 completed jobs) have 30% of their jobs double-run on an established node. Outputs are compared by embedding similarity (cosine distance with threshold 0.82 on a 384-dim sentence embedding). Mismatch triggers a disputed state and manual review.
                </P>
                <H3>5.3 Token Count Consistency</H3>
                <P>
                  The node client reports input and output token counts. The coordinator independently re-tokenizes the prompt and checks that the reported input count is within ±2 tokens (accounting for BOS/EOS differences by model). Output token count is compared against the character/word ratio expected for the model. Outliers exceeding 3 standard deviations trigger a review flag.
                </P>
                <H3>5.4 Economic Deterrence</H3>
                <P>
                  A node's expected value of future work — aggregated over its trust score trajectory — exceeds the maximum gain from a single fraudulent job by orders of magnitude. Nodes in good standing earn continuously; fraud earns once and loses the revenue stream permanently. This is not a guarantee, but it is sufficient deterrence for rational actors.
                </P>
                <Note>
                  We publish this limitation explicitly. The operators who understand it are the partners who build reliable infrastructure. We will publish adversarial stress-test results as the network scales.
                </Note>
              </Section>

              {/* 6. Settlement */}
              <Section id="settlement" num="6" title="Payment Settlement" sectionRefs={sectionRefs}>
                <H3>6.1 Why Solana</H3>
                <P>
                  Per-job stablecoin settlement is only viable if the fee-to-payout ratio is small. At an average job payout of $0.002 and a Solana median transaction fee of $0.00025, the fee overhead is 12.5% — economically acceptable. Ethereum's median fee during normal conditions exceeds $1; at that cost, per-job settlement is impossible. Solana's USDC liquidity is deep, its finality is sub-second, and transaction signatures are human-readable in Solana Explorer.
                </P>
                <H3>6.2 Batching</H3>
                <P>
                  RIGNODE batches payouts to each node hourly or when the pending balance exceeds $1.00 USD, whichever comes first. Batching reduces on-chain overhead per job from ~$0.00025 to effectively negligible without meaningfully delaying operator payouts. Each batch settlement emits a single Solana transaction with a public signature that any operator can verify independently.
                </P>
                <H3>6.3 Split</H3>
                <Table
                  headers={["Recipient", "Share", "Notes"]}
                  rows={[
                    ["Node operator", "80%", "Transferred directly to the wallet address registered with the node. RIGNODE never custodies operator funds."],
                    ["Protocol fee", "20%", "Funds verification infrastructure, scheduler operations, and the reserve for disputed job refunds."],
                  ]}
                />
                <H3>6.4 Pricing Model</H3>
                <Table
                  headers={["Token type", "Price", "Who pays"]}
                  rows={[
                    ["Output tokens", "$0.0001 per 1,000 tokens", "Client (per job submission)"],
                    ["Input tokens", "Free in Phase 0", "N/A (will be priced in Phase 1)"],
                    ["Settlement fee", "~$0.00025 amortized", "Protocol (absorbed into the 20% fee)"],
                  ]}
                />
              </Section>

              {/* 7. Economics */}
              <Section id="economics" num="7" title="Token Economics" sectionRefs={sectionRefs}>
                <P>
                  RIGNODE has no protocol token. Payouts are in USDC. This is a deliberate design choice: operators price their electricity and hardware amortization costs in USD-denominated terms, and receiving USDC eliminates the conversion friction and volatility risk present in token-based DePIN networks.
                </P>
                <H3>7.1 Operator Earnings Estimate</H3>
                <P>
                  Earnings depend on GPU throughput (tokens/sec), network utilization, and the output token price. The table below uses conservative, baseline, and optimistic utilization scenarios at the Phase 0 price point.
                </P>
                <Table
                  headers={["GPU", "TPS", "Utilization", "Daily gross (USDC)", "Daily net after ~$0.10 electricity"]}
                  rows={[
                    ["RTX 3070", "30 tok/s", "5% (conservative)", "$0.10", "$0.00"],
                    ["RTX 3070", "30 tok/s", "15% (baseline)", "$0.31", "$0.21"],
                    ["RTX 3070", "30 tok/s", "40% (optimistic)", "$0.83", "$0.73"],
                    ["RTX 4090", "80 tok/s", "15% (baseline)", "$0.83", "$0.53"],
                    ["RTX 4090", "80 tok/s", "40% (optimistic)", "$2.21", "$1.91"],
                  ]}
                />
                <Note>
                  These are projections at the Phase 0 pricing. Phase 1 input-token pricing will increase gross earnings per job. The Calculator page at /calculator provides an interactive model with your specific GPU, power draw, and electricity rate.
                </Note>
                <H3>7.2 Demand Bootstrapping</H3>
                <P>
                  To avoid the supply-without-demand failure mode common in DePIN networks, RIGNODE operates a Phase 0 where inference is served to paying clients before external nodes are recruited. Revenue from Phase 0 validates the price point and seeds the verification system's reputation ledger with real job history. External node recruitment begins in Phase 1 when demand is demonstrated, not speculated.
                </P>
              </Section>

              {/* 8. Security */}
              <Section id="security" num="8" title="Security Model" sectionRefs={sectionRefs}>
                <H3>8.1 Operator Wallet Security</H3>
                <P>
                  RIGNODE stores only the public wallet address provided at registration. No private key is ever requested, transmitted, or stored. Settlement transactions are signed by RIGNODE's own settlement keypair; operators receive USDC at their address. If an operator provides a wrong address, funds go to that address — there is no recovery mechanism. Operators are responsible for the accuracy of their wallet address.
                </P>
                <H3>8.2 Client Prompt Privacy</H3>
                <P>
                  Prompts are transmitted to node operators in plaintext to enable inference. RIGNODE does not encrypt prompts in transit to the node (the node must read the prompt to process it). Clients requiring prompt confidentiality should use a dedicated private node or request an NDA-backed enterprise arrangement. This is a known limitation of the current architecture.
                </P>
                <H3>8.3 Sybil Resistance</H3>
                <P>
                  Node registration is free and permissionless. A malicious actor could register many nodes to concentrate job routing. RIGNODE mitigates this via trust-score gating (new nodes receive a smaller share of routing until they build reputation) and canary rate increases for clusters of nodes sharing IP subnets. Economic Sybil attacks are unprofitable because the cost of running multiple idle GPUs exceeds earnings at low utilization.
                </P>
                <H3>8.4 Dispute Resolution</H3>
                <P>
                  Jobs in the <code style={{ color: "#FF4D4D", fontFamily: "monospace", fontSize: "0.875em" }}>disputed</code> state are reviewed manually within 24 hours. If the dispute is resolved in the client's favor, RIGNODE refunds the job fee from the protocol reserve. If resolved in the node's favor, the job is settled normally. Nodes with a high dispute rate are suspended pending investigation.
                </P>
              </Section>

              {/* 9. Roadmap */}
              <Section id="roadmap" num="9" title="Roadmap" sectionRefs={sectionRefs}>
                <Table
                  headers={["Phase", "Target", "Milestones"]}
                  rows={[
                    ["Phase 0 — Internal", "Q3 2026", "OpenAI-compatible API live. Paying clients. Internal node fleet. Verification system calibrated on real workloads. ACP gateway in development."],
                    ["Phase 1 — External Nodes", "Q4 2026", "External node registration open. Node client public Docker image. Canary system active on all external nodes. First on-chain USDC settlements to external operators."],
                    ["Phase 2 — ACP Integration", "Q1 2027", "Full ACP (Agent Commerce Protocol) endpoint live. Agent wallets can discover RIGNODE nodes, escrow funds, and settle autonomously. Multi-model routing (whisper, vision models)."],
                    ["Phase 3 — Decentralized Scheduler", "2027", "Scheduler logic migrated to a verifiable on-chain program. Node operators participate in governance of routing parameters. Reputation scores written on-chain."],
                  ]}
                />
                <Note>
                  Dates are targets, not commitments. Protocol development prioritizes correctness over speed. We will not open external node recruitment until the verification system is stable.
                </Note>
              </Section>

              {/* 10. References */}
              <Section id="references" num="10" title="References" sectionRefs={sectionRefs}>
                <div className="space-y-3">
                  {[
                    { num: "1", text: "Solana: A new architecture for a high-performance blockchain", href: "https://solana.com/solana-whitepaper.pdf" },
                    { num: "2", text: "USDC: Centre Consortium — USD Coin Overview", href: "https://www.centre.io/usdc" },
                    { num: "3", text: "Agent Commerce Protocol (ACP) — Virtuals Protocol", href: "https://whitepaper.virtuals.io/" },
                    { num: "4", text: "llama.cpp — Efficient inference of LLaMA models", href: "https://github.com/ggerganov/llama.cpp" },
                    { num: "5", text: "Render Network: Distributed GPU rendering on blockchain", href: "https://rendernetwork.com" },
                    { num: "6", text: "Akash Network: Decentralized cloud compute marketplace", href: "https://akash.network" },
                    { num: "7", text: "io.net: Decentralized GPU network for ML workloads", href: "https://io.net" },
                  ].map(ref => (
                    <div key={ref.num} className="flex items-start gap-3">
                      <span className="text-xs tabular-nums mt-0.5 shrink-0" style={{ color: "rgba(255,45,45,0.5)", fontFamily: "monospace" }}>[{ref.num}]</span>
                      <a href={ref.href} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>
                        {ref.text} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  ))}
                </div>
              </Section>

              {/* CTA */}
              <div className="pt-4">
                <div className="glass-card-red rounded-2xl p-8 text-center">
                  <div className="pill-badge-red mb-4 inline-flex"><div className="dot-red" />Real work. Real hardware. Real payouts.</div>
                  <h3 className="section-heading text-2xl md:text-3xl text-white mb-3">Ready to put your GPU to work?</h3>
                  <p className="text-sm mb-6" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>No token required. No staking. Earnings start with the first verified job.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/nodes">
                      <button className="btn-primary flex items-center gap-2">Register a Node <ArrowRight className="h-4 w-4" /></button>
                    </Link>
                    <Link href="/network">
                      <button className="btn-secondary">View Live Network Stats</button>
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
