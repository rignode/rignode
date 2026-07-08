# RIGNODE

Decentralized compute exchange where GPU and CPU owners earn USDC per verified AI inference job, built on Solana.

**Live:** [rignode.xyz](https://rignode.xyz) | **Twitter:** [@Rignode](https://x.com/Rignode) | **GitHub:** [github.com/rignode](https://github.com/rignode)

---

## What Is RIGNODE

RIGNODE is an open marketplace that connects GPU owners with AI workloads. Every time a node completes an inference job, the operator receives 80% of the job fee as USDC directly to their Solana wallet. Payments are on-chain SPL token transfers, verifiable by anyone on [Solana Explorer](https://explorer.solana.com).

**No middlemen. No lock-in. No private keys required.**

---

## Repository Structure

```
rignode/                  Root pnpm workspace
  artifacts/
    api-server/           Express 5 REST API (Node.js 24, TypeScript)
    rignode/              React + Vite frontend
    mockup-sandbox/       Isolated component preview server (dev only)
  lib/
    api-spec/             OpenAPI 3.1 contract (source of truth)
    api-client-react/     Orval-generated React Query hooks
    api-zod/              Orval-generated Zod validators
    db/                   Drizzle ORM schema and migrations (PostgreSQL)
  scripts/                Utility scripts (seed, migrations)
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Wouter, TanStack Query, shadcn/ui |
| API | Express 5, Node.js 24, TypeScript 5.9 |
| Database | PostgreSQL 16, Drizzle ORM |
| Validation | Zod, Orval codegen from OpenAPI |
| Payments | Solana web3.js, SPL Token (USDC mainnet) |
| Wallets | Phantom, Solflare (via window.solana provider) |

---

## Prerequisites

- Node.js 24 or later
- pnpm 9 or later
- PostgreSQL 16 (connection string in `DATABASE_URL`)

---

## Getting Started

```bash
git clone https://github.com/rignode/rignode.git
cd rignode
pnpm install
```

Copy and fill in environment variables:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random secret for session signing |
| `TREASURY_WALLET` | Solana wallet address receiving USDC payments |
| `SOLANA_NETWORK` | `mainnet-beta` or `devnet` (default: `mainnet-beta`) |

Push the database schema:

```bash
pnpm --filter @workspace/db run push
```

Start all services:

```bash
# Terminal 1: API server
pnpm --filter @workspace/api-server run dev

# Terminal 2: Frontend
pnpm --filter @workspace/rignode run dev
```

---

## API Overview

Base URL: `https://rignode.xyz/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | /healthz | Health check |
| GET | /nodes | List all registered nodes |
| POST | /nodes | Register a new node |
| GET | /nodes/:id | Get node details |
| PATCH | /nodes/:id | Update node status or speed |
| POST | /nodes/:id/heartbeat | Mark node as online |
| GET | /nodes/:id/jobs | Jobs assigned to a node |
| GET | /nodes/:id/earnings | Earnings history for a node |
| GET | /jobs | List all inference jobs |
| POST | /jobs | Submit a new job |
| GET | /jobs/:id | Get job details |
| POST | /pay/quote | Get a USDC price quote |
| GET | /stats/network | Network-wide statistics |
| GET | /stats/tokens | Token usage by model |
| GET | /stats/profitability | GPU profitability estimate |

Full schema: [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)

---

## Payment Flow

1. Client calls `POST /api/pay/quote` with model and prompt length
2. Server returns USDC amount and treasury wallet address
3. Client sends USDC on Solana mainnet using Phantom or Solflare
4. Client submits job with the Solana `txSignature`
5. Server verifies the on-chain transfer before accepting the job

USDC mints:
- Mainnet: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Devnet: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

## Model Pricing

| Model | Price per 1K output tokens |
|---|---|
| llama3-8b-q4 | $0.0004 USDC |
| llama3-70b-q4 | $0.0016 USDC |
| mistral-7b-q4 | $0.0003 USDC |
| qwen2-7b-q4 | $0.0003 USDC |
| whisper-large-v3 | $0.0006 USDC |

Revenue split: 80% to node operator, 20% to protocol.

---

## Database Schema

Three tables managed by Drizzle ORM:

- **nodes** - GPU hardware, wallet address, status, trust score, earnings
- **jobs** - Inference requests, model, token counts, USDC earning, tx signature
- **earnings** - Payout history with batched job counts and Solana tx links

---

## Development Commands

```bash
pnpm run typecheck                         # Full TypeScript check
pnpm run build                             # Build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate hooks and validators from OpenAPI
pnpm --filter @workspace/db run push       # Apply schema to database
```

---

## Related Packages

- [@rignode/sdk](https://github.com/rignode/rignode-sdk) - TypeScript SDK for submitting jobs programmatically
- [@rignode/cli](https://github.com/rignode/rignode-cli) - CLI for node operators (register, heartbeat, earnings)

---

## Contributors

- [rignode](https://github.com/rignode)
- [claude](https://anthropic.com)

---

## License

MIT
