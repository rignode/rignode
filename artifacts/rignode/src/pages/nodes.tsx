import { useState, useEffect } from "react";
import { useListNodes, useRegisterNode, getListNodesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { Plus, ExternalLink, Copy, CheckCheck, ChevronDown, Cpu, Download, Zap, DollarSign } from "lucide-react";
import { NodeStatusBadge } from "./dashboard";
import { useWallet, isValidSolanaAddress } from "@/contexts/wallet";

/* ─ How it works flow banner ─────────────────────────────── */
const FLOW_STEPS = [
  { icon: Cpu,        num: "01", title: "You own a GPU",          body: "NVIDIA RTX/GTX, AMD Radeon RX, Intel Arc, or data-center cards with 8 GB+ VRAM all qualify." },
  { icon: Plus,       num: "02", title: "Register it here",       body: "Declare your GPU model, VRAM, region, and your Solana wallet address. This is what the scheduler uses to match jobs to your machine." },
  { icon: Download,   num: "03", title: "Install the node client", body: "One-command Docker install. The client runs on your machine, accepts jobs from the network, and executes AI inference locally using your GPU." },
  { icon: DollarSign, num: "04", title: "Earn USDC per job",      body: "Each verified inference job pays USDC directly to your wallet. 80% to you, 20% protocol fee. Every payout has an on-chain Solana signature." },
];

function HowItWorksBanner() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-8" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF2D2D", boxShadow: "0 0 6px rgba(255,45,45,0.8)" }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>How it works</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.num} className="relative p-5" style={{ borderRight: i < FLOW_STEPS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              {/* Connector arrow (hidden on last) */}
              {i < FLOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-xs" style={{ color: "rgba(255,45,45,0.3)" }}>›</div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.2)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: "#FF4D4D" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "rgba(255,45,45,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>{s.num}</span>
              </div>
              <div className="font-semibold text-sm mb-1.5 text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{s.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>{s.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─ GPU catalogue ─────────────────────────────────────────── */
const GPU_CATALOG: { model: string; vram: number; tps: number; power: number; brand: string }[] = [
  // NVIDIA GeForce RTX 30-series
  { model: "RTX 3060",          vram: 12, tps: 18,  power: 170, brand: "NVIDIA" },
  { model: "RTX 3060 Ti",       vram: 8,  tps: 22,  power: 200, brand: "NVIDIA" },
  { model: "RTX 3070",          vram: 8,  tps: 28,  power: 220, brand: "NVIDIA" },
  { model: "RTX 3070 Ti",       vram: 8,  tps: 32,  power: 290, brand: "NVIDIA" },
  { model: "RTX 3080",          vram: 10, tps: 42,  power: 320, brand: "NVIDIA" },
  { model: "RTX 3080 Ti",       vram: 12, tps: 48,  power: 350, brand: "NVIDIA" },
  { model: "RTX 3090",          vram: 24, tps: 58,  power: 350, brand: "NVIDIA" },
  { model: "RTX 3090 Ti",       vram: 24, tps: 62,  power: 450, brand: "NVIDIA" },
  // NVIDIA GeForce RTX 40-series
  { model: "RTX 4060",          vram: 8,  tps: 35,  power: 115, brand: "NVIDIA" },
  { model: "RTX 4060 Ti",       vram: 16, tps: 45,  power: 160, brand: "NVIDIA" },
  { model: "RTX 4070",          vram: 12, tps: 55,  power: 200, brand: "NVIDIA" },
  { model: "RTX 4070 Ti",       vram: 12, tps: 68,  power: 285, brand: "NVIDIA" },
  { model: "RTX 4070 Ti Super", vram: 16, tps: 75,  power: 285, brand: "NVIDIA" },
  { model: "RTX 4080",          vram: 16, tps: 88,  power: 320, brand: "NVIDIA" },
  { model: "RTX 4080 Super",    vram: 16, tps: 92,  power: 320, brand: "NVIDIA" },
  { model: "RTX 4090",          vram: 24, tps: 120, power: 450, brand: "NVIDIA" },
  // NVIDIA GeForce RTX 50-series
  { model: "RTX 5070",          vram: 12, tps: 110, power: 250, brand: "NVIDIA" },
  { model: "RTX 5070 Ti",       vram: 16, tps: 130, power: 300, brand: "NVIDIA" },
  { model: "RTX 5080",          vram: 16, tps: 145, power: 360, brand: "NVIDIA" },
  { model: "RTX 5090",          vram: 32, tps: 200, power: 575, brand: "NVIDIA" },
  // NVIDIA Data Center
  { model: "RTX A4000",         vram: 16, tps: 72,  power: 140, brand: "NVIDIA" },
  { model: "RTX A4500",         vram: 20, tps: 85,  power: 200, brand: "NVIDIA" },
  { model: "RTX A6000",         vram: 48, tps: 105, power: 300, brand: "NVIDIA" },
  { model: "A10",               vram: 24, tps: 95,  power: 150, brand: "NVIDIA" },
  { model: "A100 40G",          vram: 40, tps: 180, power: 400, brand: "NVIDIA" },
  { model: "A100 80G",          vram: 80, tps: 200, power: 400, brand: "NVIDIA" },
  { model: "H100 SXM",          vram: 80, tps: 350, power: 700, brand: "NVIDIA" },
  { model: "H100 PCIe",         vram: 80, tps: 280, power: 350, brand: "NVIDIA" },
  // AMD Radeon RX 6000-series
  { model: "RX 6600 XT",        vram: 8,  tps: 12,  power: 160, brand: "AMD" },
  { model: "RX 6700 XT",        vram: 12, tps: 18,  power: 230, brand: "AMD" },
  { model: "RX 6800",           vram: 16, tps: 24,  power: 250, brand: "AMD" },
  { model: "RX 6800 XT",        vram: 16, tps: 28,  power: 300, brand: "AMD" },
  { model: "RX 6900 XT",        vram: 16, tps: 32,  power: 300, brand: "AMD" },
  { model: "RX 6950 XT",        vram: 16, tps: 35,  power: 335, brand: "AMD" },
  // AMD Radeon RX 7000-series
  { model: "RX 7600",           vram: 8,  tps: 16,  power: 165, brand: "AMD" },
  { model: "RX 7700 XT",        vram: 12, tps: 22,  power: 245, brand: "AMD" },
  { model: "RX 7800 XT",        vram: 16, tps: 32,  power: 263, brand: "AMD" },
  { model: "RX 7900 GRE",       vram: 16, tps: 40,  power: 260, brand: "AMD" },
  { model: "RX 7900 XT",        vram: 20, tps: 48,  power: 315, brand: "AMD" },
  { model: "RX 7900 XTX",       vram: 24, tps: 55,  power: 355, brand: "AMD" },
  // AMD Radeon RX 9000-series
  { model: "RX 9070",           vram: 16, tps: 42,  power: 220, brand: "AMD" },
  { model: "RX 9070 XT",        vram: 16, tps: 52,  power: 304, brand: "AMD" },
  // Intel Arc
  { model: "Arc A770 16G",      vram: 16, tps: 14,  power: 225, brand: "Intel" },
  { model: "Arc B580",          vram: 12, tps: 16,  power: 150, brand: "Intel" },
  { model: "Arc B770",          vram: 16, tps: 22,  power: 200, brand: "Intel" },
];

const REGIONS: { value: string; label: string }[] = [
  { value: "us-east",      label: "US East (Virginia)" },
  { value: "us-west",      label: "US West (Oregon)" },
  { value: "eu-west",      label: "EU West (Frankfurt)" },
  { value: "ap-southeast", label: "Asia Pacific (Singapore)" },
  { value: "sa-east",      label: "South America (São Paulo)" },
];

/* ─ Install script generator ─────────────────────────────── */
// Node client lifecycle after install:
//   1. Starts → reads /etc/rignode/config.json
//   2. POST {apiEndpoint}/api/nodes/{nodeId}/heartbeat every 30s → status = "online"
//   3. Polls {apiEndpoint}/api/jobs for assigned jobs
//   4. Runs inference via local Ollama, reports results back
//   5. If heartbeat stops for 5min → node auto-marked "offline" by API
const API_ENDPOINT = "https://api.rignode.xyz";

function linuxScript(nodeId: number, wallet: string, region: string) {
  return `#!/bin/bash
# RIGNODE Node Client — Linux (systemd) Setup
# Node #${nodeId} | Wallet: ${wallet} | Region: ${region}
set -euo pipefail

NODE_ID=${nodeId}
WALLET="${wallet}"
REGION="${region}"
API="${API_ENDPOINT}"
CONFIG_DIR="/etc/rignode"
IMAGE="ghcr.io/rignode/node-client:latest"

echo "► RIGNODE Node Client — Install"
echo "  Node #$NODE_ID | Region: $REGION"
echo ""

# ── 1. Docker ─────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
  echo "  ✓ Docker installed"
  echo "  NOTE: Log out and back in if you see permission errors below."
else
  echo "  ✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi

# ── 2. NVIDIA Container Toolkit ───────────────────────────────
if ! dpkg -l nvidia-container-toolkit &>/dev/null 2>&1; then
  echo "Installing NVIDIA Container Toolkit..."
  DIST=$(. /etc/os-release && echo "$ID$VERSION_ID")
  curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
    | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
  curl -fsSL "https://nvidia.github.io/libnvidia-container/$DIST/libnvidia-container.list" \
    | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
    | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -q nvidia-container-toolkit
  sudo nvidia-ctk runtime configure --runtime=docker
  sudo systemctl restart docker
  echo "  ✓ NVIDIA Container Toolkit installed"
else
  echo "  ✓ NVIDIA Container Toolkit already installed"
fi

# ── 3. Pull node client image ─────────────────────────────────
echo "Pulling $IMAGE..."
sudo docker pull "$IMAGE"
echo "  ✓ Image ready"

# ── 4. Write config to /etc/rignode/config.json ───────────────
sudo mkdir -p "$CONFIG_DIR"
sudo tee "$CONFIG_DIR/config.json" > /dev/null << RIGCONFIG
{
  "nodeId": $NODE_ID,
  "walletAddress": "$WALLET",
  "region": "$REGION",
  "apiEndpoint": "$API",
  "heartbeatIntervalSec": 30,
  "maxConcurrentJobs": 2
}
RIGCONFIG
sudo chmod 640 "$CONFIG_DIR/config.json"
echo "  ✓ Config written to $CONFIG_DIR/config.json"

# ── 5. systemd service ────────────────────────────────────────
# ExecStart uses full path — systemd does not search PATH
sudo tee /etc/systemd/system/rignode.service > /dev/null << 'UNIT'
[Unit]
Description=RIGNODE Node Client
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Restart=always
RestartSec=15
ExecStartPre=-/usr/bin/docker stop rignode
ExecStartPre=-/usr/bin/docker rm   rignode
ExecStart=/usr/bin/docker run --rm --name rignode --gpus all --log-driver=journald -v /etc/rignode:/config:ro ghcr.io/rignode/node-client:latest
ExecStop=/usr/bin/docker stop rignode

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now rignode
echo "  ✓ rignode.service enabled and running"

# ── 6. Verify ─────────────────────────────────────────────────
sleep 3
if sudo systemctl is-active --quiet rignode; then
  echo ""
  echo "✓ Node #$NODE_ID is online."
  echo ""
  echo "  Status:    sudo systemctl status rignode"
  echo "  Logs:      sudo journalctl -u rignode -f"
  echo "  Stop:      sudo systemctl stop rignode"
  echo "  Dashboard: ${API_ENDPOINT}"
  echo ""
  echo "  The client sends a heartbeat to the RIGNODE API every 30 seconds."
  echo "  Your node will appear as Online in the dashboard within 1 minute."
else
  echo ""
  echo "✗ rignode.service failed to start. Check logs:"
  echo "  sudo journalctl -u rignode -n 50 --no-pager"
  exit 1
fi`;
}

function windowsScript(nodeId: number, wallet: string, region: string) {
  return `# RIGNODE Node Client — Windows (Docker Desktop) Setup
# Node #${nodeId} | Wallet: ${wallet} | Region: ${region}
# Run this script in PowerShell as Administrator

$ErrorActionPreference = "Stop"

$NODE_ID  = ${nodeId}
$WALLET   = "${wallet}"
$REGION   = "${region}"
$API      = "${API_ENDPOINT}"
$CONFIG   = "$env:ProgramData\\rignode\\config.json"
$IMAGE    = "ghcr.io/rignode/node-client:latest"

Write-Host "► RIGNODE Node Client — Install" -ForegroundColor Cyan
Write-Host "  Node #$NODE_ID | Region: $REGION"
Write-Host ""

# ── 1. Docker Desktop ─────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Docker Desktop not found. Opening download page..." -ForegroundColor Yellow
  Start-Process "https://www.docker.com/products/docker-desktop/"
  Read-Host "Install Docker Desktop, start it, then press Enter to continue"
}

docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker is not running. Start Docker Desktop and retry."
}
Write-Host "  ✓ Docker running"

# ── 2. Pull node client image ─────────────────────────────────
Write-Host "Pulling $IMAGE..."
docker pull $IMAGE
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to pull image." }
Write-Host "  ✓ Image ready"

# ── 3. Write config ───────────────────────────────────────────
New-Item -ItemType Directory -Force -Path (Split-Path $CONFIG) | Out-Null
[ordered]@{
  nodeId               = $NODE_ID
  walletAddress        = $WALLET
  region               = $REGION
  apiEndpoint          = $API
  heartbeatIntervalSec = 30
  maxConcurrentJobs    = 2
} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $CONFIG
Write-Host "  ✓ Config written to $CONFIG"

# ── 4. Remove old container if present ───────────────────────
docker rm -f rignode 2>$null

# ── 5. Start container ────────────────────────────────────────
docker run -d --name rignode --gpus all --restart unless-stopped -v "$env:ProgramData\\rignode:/config:ro" $IMAGE
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to start rignode container." }

Write-Host ""
Write-Host "✓ Node #$NODE_ID is running." -ForegroundColor Green
Write-Host ""
Write-Host "  Logs:      docker logs -f rignode"
Write-Host "  Stop:      docker stop rignode"
Write-Host "  Dashboard: $API"
Write-Host ""
Write-Host "  The client sends a heartbeat every 30 seconds."
Write-Host "  Your node will appear Online in the dashboard within 1 minute."`;
}

function macosScript(nodeId: number, wallet: string, region: string) {
  return `#!/bin/bash
# RIGNODE Node Client — macOS (Docker Desktop, CPU-only) Setup
# Node #${nodeId} | Wallet: ${wallet} | Region: ${region}
# NOTE: macOS Docker does not support GPU passthrough.
#       Use a Linux machine for GPU-accelerated inference.
set -euo pipefail

NODE_ID=${nodeId}
WALLET="${wallet}"
REGION="${region}"
API="${API_ENDPOINT}"
CONFIG_DIR="$HOME/.config/rignode"
IMAGE="ghcr.io/rignode/node-client:latest"

echo "► RIGNODE Node Client — Install (macOS / CPU-only)"
echo "  Node #$NODE_ID | Region: $REGION"
echo ""

# ── 1. Docker Desktop ─────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "Docker Desktop not found. Opening download page..."
  open "https://www.docker.com/products/docker-desktop/"
  read -rp "Install Docker Desktop, launch it, then press Enter: "
fi

if ! docker info &>/dev/null; then
  echo "ERROR: Docker is not running. Start Docker Desktop and retry."
  exit 1
fi
echo "  ✓ Docker running"

# ── 2. Pull node client image ─────────────────────────────────
echo "Pulling $IMAGE..."
docker pull "$IMAGE"
echo "  ✓ Image ready"

# ── 3. Write config ───────────────────────────────────────────
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_DIR/config.json" << RIGCONFIG
{
  "nodeId": $NODE_ID,
  "walletAddress": "$WALLET",
  "region": "$REGION",
  "apiEndpoint": "$API",
  "heartbeatIntervalSec": 30,
  "maxConcurrentJobs": 1
}
RIGCONFIG
chmod 600 "$CONFIG_DIR/config.json"
echo "  ✓ Config written to $CONFIG_DIR/config.json"

# ── 4. Remove old container ───────────────────────────────────
docker rm -f rignode 2>/dev/null || true

# ── 5. Start container (no --gpus on macOS) ───────────────────
docker run -d --name rignode --restart unless-stopped -v "$CONFIG_DIR:/config:ro" "$IMAGE"
echo "  ✓ Container started"

sleep 2
if docker ps --filter "name=rignode" --filter "status=running" | grep -q rignode; then
  echo ""
  echo "✓ Node #$NODE_ID is running (CPU-only)."
  echo ""
  echo "  Logs:      docker logs -f rignode"
  echo "  Stop:      docker stop rignode"
  echo "  Dashboard: $API"
  echo ""
  echo "  Heartbeat sent every 30 seconds. Node appears Online within 1 minute."
  echo "  ⚠  GPU inference requires Linux. macOS nodes run CPU-only workloads."
else
  echo ""
  echo "✗ Container failed to start. Check:"
  echo "  docker logs rignode"
  exit 1
fi`;
}

/* ─ Copy button ───────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
      style={{
        background: copied ? "rgba(255,45,45,0.15)" : "rgba(255,255,255,0.06)",
        border: copied ? "1px solid rgba(255,45,45,0.35)" : "1px solid rgba(255,255,255,0.1)",
        color: copied ? "#FF4D4D" : "rgba(255,255,255,0.4)",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─ Install script panel ──────────────────────────────────── */
function InstallScriptPanel({ nodeId, wallet, region }: { nodeId: number; wallet: string; region: string }) {
  const [tab, setTab] = useState<"linux" | "windows" | "macos">("linux");
  const scripts = { linux: linuxScript(nodeId, wallet, region), windows: windowsScript(nodeId, wallet, region), macos: macosScript(nodeId, wallet, region) };
  const current = scripts[tab];

  return (
    <div className="mt-2">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(["linux","windows","macos"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
            style={tab === t
              ? { background: "rgba(255,45,45,0.18)", color: "#FF4D4D", border: "1px solid rgba(255,45,45,0.4)", fontFamily: "Space Grotesk, sans-serif" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Space Grotesk, sans-serif" }
            }
          >
            {t === "macos" ? "macOS" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto">
          <CopyButton text={current} />
        </div>
      </div>

      {/* Script */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <pre className="p-4 text-xs leading-relaxed overflow-x-auto overflow-y-auto" style={{ color: "#9A9A9A", fontFamily: "monospace", maxHeight: 280, whiteSpace: "pre" }}>
          <code>{current}</code>
        </pre>
      </div>

      {tab === "macos" && (
        <p className="mt-2 text-xs" style={{ color: "rgba(255,184,61,0.7)", fontFamily: "Inter, sans-serif" }}>
          ⚠ macOS Docker does not support GPU passthrough. For GPU inference, use Linux.
        </p>
      )}
    </div>
  );
}

/* ─ Nodes page ────────────────────────────────────────────── */
export function Nodes() {
  const { data: nodes, isLoading } = useListNodes();
  const registerNode = useRegisterNode();
  const queryClient = useQueryClient();
  const { publicKey, connected } = useWallet();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "script">("form");
  const [registeredNode, setRegisteredNode] = useState<{ wallet: string; region: string; id: number } | null>(null);
  const [addrError, setAddrError] = useState("");
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [form, setForm] = useState({
    walletAddress: "",
    gpuModel: "",
    vram: "",
    region: "",
  });

  // Pre-fill wallet from connected wallet
  useEffect(() => {
    if (connected && publicKey) {
      setForm(f => ({ ...f, walletAddress: publicKey }));
    }
  }, [connected, publicKey]);

  const selectedGpu = GPU_CATALOG.find(g => g.model === form.gpuModel);

  const handleGpuChange = (model: string) => {
    const gpu = GPU_CATALOG.find(g => g.model === model);
    setForm(f => ({ ...f, gpuModel: model, vram: gpu ? String(gpu.vram) : f.vram }));
  };

  const handleAddressChange = (val: string) => {
    setForm(f => ({ ...f, walletAddress: val }));
    if (val.length === 0) { setAddrError(""); return; }
    if (!isValidSolanaAddress(val)) {
      setAddrError("Invalid Solana address: must be 32-44 base58 characters");
    } else {
      setAddrError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.walletAddress || !form.gpuModel || !form.vram || !form.region) return;
    if (!isValidSolanaAddress(form.walletAddress)) {
      setAddrError("Invalid Solana address");
      return;
    }
    registerNode.mutate(
      { data: { walletAddress: form.walletAddress, gpuModel: form.gpuModel, vram: parseInt(form.vram, 10), region: form.region } },
      {
        onSuccess: (node) => {
          queryClient.invalidateQueries({ queryKey: getListNodesQueryKey() });
          setRegisteredNode({ wallet: form.walletAddress, region: form.region, id: node.id });
          setStep("script");
        },
      }
    );
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setTimeout(() => {
        setStep("form");
        setRegisteredNode(null);
        setAddrError("");
        setForm(f => ({ ...f, gpuModel: "", vram: "", region: "" }));
      }, 300);
    }
  };

  const addrValid = form.walletAddress.length > 0 && isValidSolanaAddress(form.walletAddress);

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0505" }}>
      <div className="radial-glow-red pointer-events-none" style={{ position: "fixed", width: 500, height: 500, top: -150, left: -100, opacity: 0.2 }} />

      <div className="container max-w-screen-xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <div className="pill-badge-red mb-3 inline-flex"><div className="dot-red" />Registry</div>
            <h1 className="section-heading text-4xl text-white">Node Network</h1>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A", fontFamily: "Inter, sans-serif" }}>{nodes?.length ?? 0} machines connected to RIGNODE.</p>
          </div>
          <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
              <button className="btn-primary"><Plus className="h-4 w-4" />Register Node</button>
            </DialogTrigger>
            <DialogContent
              className="w-[calc(100vw-2rem)] max-w-[540px] p-0 gap-0 overflow-hidden"
              style={{
                background: "#0D0606",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                maxHeight: "90dvh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: "linear-gradient(90deg,transparent,rgba(255,45,45,0.6),transparent)" }} />

              {/* Scrollable body — scrollbar hidden */}
              <div
                className="overflow-y-auto flex-1 p-6"
                style={{ scrollbarWidth: "none" }}
              >
                {step === "form" ? (
                  <>
                    {/* Header */}
                    <DialogHeader className="mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF2D2D", boxShadow: "0 0 6px rgba(255,45,45,0.8)" }} />
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>Step 1 of 3</span>
                      </div>
                      <DialogTitle className="font-bold text-white text-xl leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        Declare your hardware
                      </DialogTitle>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
                        Tell the scheduler what GPU you have and where. After submitting you'll get an install script — run it on the machine with this GPU.
                      </p>
                    </DialogHeader>

                    {/* Step track */}
                    <div className="flex items-center gap-2 mb-6">
                      {["Declare hardware", "Install client", "Earn USDC"].map((label, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                background: i === 0 ? "#FF2D2D" : "rgba(255,255,255,0.05)",
                                color: i === 0 ? "#fff" : "rgba(255,255,255,0.18)",
                                fontFamily: "Space Grotesk, sans-serif",
                                fontSize: "0.65rem",
                              }}>
                              {i + 1}
                            </div>
                            <span className="text-xs hidden sm:block truncate" style={{ color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)", fontFamily: "Inter, sans-serif" }}>{label}</span>
                          </div>
                          {i < 2 && <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Wallet */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                            Payout Wallet
                          </Label>
                          {form.walletAddress.length > 0 && (
                            <span className="text-xs font-semibold" style={{ color: addrValid ? "#FF4D4D" : "rgba(255,100,100,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>
                              {addrValid ? "✓ Valid address" : "✗ Invalid"}
                            </span>
                          )}
                        </div>
                        <input
                          className="glass-input"
                          placeholder="Solana address — e.g. 9xQeWvG816bUx9EPj…"
                          value={form.walletAddress}
                          onChange={e => handleAddressChange(e.target.value)}
                          required
                          style={addrError ? { borderColor: "rgba(255,80,80,0.4)" } : addrValid ? { borderColor: "rgba(255,45,45,0.4)" } : undefined}
                        />
                        {addrError
                          ? <p className="text-xs" style={{ color: "rgba(255,100,100,0.8)", fontFamily: "Inter, sans-serif" }}>{addrError}</p>
                          : <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "Inter, sans-serif" }}>USDC is paid directly here. RIGNODE never holds your funds.</p>
                        }
                      </div>

                      {/* GPU */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                          GPU Model
                        </Label>
                        <Select value={form.gpuModel} onValueChange={handleGpuChange}>
                          <SelectTrigger style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: form.gpuModel ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.875rem" }}>
                            <SelectValue placeholder="Choose the GPU in your machine" />
                          </SelectTrigger>
                          <SelectContent style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
                            {(["NVIDIA", "AMD", "Intel"] as const).map(brand => {
                              const gpus = GPU_CATALOG.filter(g => g.brand === brand);
                              if (!gpus.length) return null;
                              return (
                                <SelectGroup key={brand}>
                                  <SelectLabel style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                                    {brand}
                                  </SelectLabel>
                                  {gpus.map(g => (
                                    <SelectItem key={g.model} value={g.model} style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                      {g.model} · {g.vram}GB · ~{g.tps} tok/s
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {selectedGpu && (
                          <div className="flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>
                            <span>VRAM <span className="font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{selectedGpu.vram} GB</span></span>
                            <span>Speed <span className="font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>~{selectedGpu.tps} tok/s</span></span>
                            <span>TDP <span className="font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{selectedGpu.power} W</span></span>
                          </div>
                        )}
                      </div>

                      {/* VRAM + Region */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>VRAM (GB)</Label>
                          <input
                            type="number" className="glass-input" placeholder="Auto-filled" min={4} max={160}
                            value={form.vram}
                            onChange={e => setForm(f => ({ ...f, vram: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Region</Label>
                          <Select value={form.region} onValueChange={v => setForm(f => ({ ...f, region: v }))}>
                            <SelectTrigger style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: form.region ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.875rem" }}>
                              <SelectValue placeholder="Where is it?" />
                            </SelectTrigger>
                            <SelectContent style={{ background: "#0D0606", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
                              {REGIONS.map(r => (
                                <SelectItem key={r.value} value={r.value} style={{ fontFamily: "Space Grotesk, sans-serif" }}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {registerNode.isError && (
                        <p className="text-sm text-center py-2 px-3 rounded-lg" style={{ color: "#FF4D4D", background: "rgba(255,45,45,0.07)", border: "1px solid rgba(255,45,45,0.15)", fontFamily: "Inter, sans-serif" }}>
                          Registration failed. Check your inputs and try again.
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn-primary w-full justify-center py-3 mt-1"
                        disabled={registerNode.isPending || !!addrError || !addrValid || !form.gpuModel || !form.region}
                      >
                        {registerNode.isPending ? "Registering…" : "Register → Get Install Script"}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Success header */}
                    <DialogHeader className="mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,45,45,0.15)", border: "1px solid rgba(255,45,45,0.3)" }}>
                          <span className="text-xs" style={{ color: "#FF4D4D" }}>✓</span>
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,45,45,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>Node Registered</span>
                      </div>
                      <DialogTitle className="font-bold text-white text-xl leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        Node #{registeredNode?.id} is ready to activate
                      </DialogTitle>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
                        Run the install script on the machine with your GPU to go online and start earning.
                      </p>
                    </DialogHeader>

                    {/* What happens next */}
                    <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="px-4 py-3" style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>What happens next</span>
                      </div>
                      <div>
                        {[
                          { step: "2", label: "Run the install script on your machine", sub: "One command — installs Docker and the RIGNODE node client." },
                          { step: "3", label: "Client detects your GPU, sends heartbeat", sub: "Node status changes to Online within 30 seconds." },
                          { step: "4", label: "Jobs are routed to your GPU automatically", sub: "Matched by model size, VRAM, and region." },
                          { step: "5", label: "USDC lands in your wallet per verified job", sub: "80% to you. On-chain Solana signature every payout." },
                        ].map((item, i, arr) => (
                          <div key={item.step} className="flex gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                              style={{ background: "rgba(255,45,45,0.1)", color: "#FF4D4D", border: "1px solid rgba(255,45,45,0.2)", fontFamily: "Space Grotesk, sans-serif", fontSize: "0.65rem" }}>
                              {item.step}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{item.label}</div>
                              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif" }}>{item.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Install script */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                        Install Script
                      </p>
                      <InstallScriptPanel
                        nodeId={registeredNode?.id ?? 0}
                        wallet={registeredNode?.wallet ?? ""}
                        region={registeredNode?.region ?? ""}
                      />
                    </div>

                    <button
                      className="btn-secondary w-full justify-center py-3"
                      onClick={() => handleClose(false)}
                    >
                      Done — I'll run this on my machine
                    </button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* How it works flow */}
        <HowItWorksBanner />

        {/* Existing node install script accordion */}
        {nodes && nodes.length > 0 && (
          <div className="glass-card overflow-hidden" style={{ borderRadius: 16 }}>
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left"
              style={{ borderBottom: openAccordion !== null ? "1px solid rgba(255,255,255,0.06)" : "none" }}
              onClick={() => setOpenAccordion(openAccordion === -1 ? null : -1)}
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                  Already Registered?
                </span>
                <span className="ml-3 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                  Get the install script for any of your existing nodes
                </span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: openAccordion === -1 ? "rotate(180deg)" : "none" }} />
            </button>
            {openAccordion === -1 && (
              <div className="px-6 pb-6 space-y-4">
                {nodes.map(node => (
                  <div key={node.id}>
                    <button
                      className="w-full flex items-center justify-between py-3 text-left"
                      onClick={() => setOpenAccordion(openAccordion === node.id ? null : node.id)}
                    >
                      <span className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        Node #{node.id}: {node.gpuModel} · {node.region}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform shrink-0" style={{ color: "rgba(255,255,255,0.3)", transform: openAccordion === node.id ? "rotate(180deg)" : "none" }} />
                    </button>
                    {openAccordion === node.id && (
                      <InstallScriptPanel nodeId={node.id} wallet={node.walletAddress} region={node.region} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Node table */}
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>All Nodes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dark-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>Node</th><th>GPU</th><th>VRAM</th><th>Region</th><th>Trust</th><th>Tok/s</th><th>Status</th><th>Earned</th><th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => <td key={j}><Skeleton className="h-4 w-16" style={{ background: "rgba(255,255,255,0.05)" }} /></td>)}
                    </tr>
                  ))
                  : nodes?.length === 0
                    ? <tr><td colSpan={9} className="text-center py-16" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>No nodes registered yet. Be the first.</td></tr>
                    : nodes?.map(node => (
                      <tr key={node.id} className="group">
                        <td className="font-bold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
                          #{node.id}
                          {node.walletAddress === publicKey && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,45,45,0.12)", color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>mine</span>
                          )}
                        </td>
                        <td>{node.gpuModel}</td>
                        <td style={{ color: "rgba(255,255,255,0.4)" }}>{node.vram}GB</td>
                        <td style={{ color: "rgba(255,255,255,0.35)" }}>{node.region}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{node.trustScore.toFixed(0)}</span>
                            <div className="progress-bar w-14"><div className="progress-fill" style={{ width: `${node.trustScore}%` }} /></div>
                          </div>
                        </td>
                        <td style={{ color: "rgba(255,255,255,0.4)" }}>{node.tokensPerSec.toFixed(0)}</td>
                        <td><NodeStatusBadge status={node.status} /></td>
                        <td className="font-bold" style={{ color: "#FF4D4D", fontFamily: "Space Grotesk, sans-serif" }}>${Number(node.totalEarningsUsdc).toFixed(4)}</td>
                        <td>
                          <Link href={`/nodes/${node.id}`}>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity cursor-pointer" style={{ color: "#FF4D4D" }} />
                          </Link>
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
