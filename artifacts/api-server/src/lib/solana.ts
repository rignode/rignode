import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_MINT_DEVNET  = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const USDC_DECIMALS     = 6;

export function getSolanaConfig() {
  const network        = (process.env["SOLANA_NETWORK"] ?? "mainnet-beta") as "mainnet-beta" | "devnet";
  const rpcUrl         = process.env["SOLANA_RPC_URL"] ?? `https://api.${network}.solana.com`;
  const usdcMint       = network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
  const treasuryWallet = process.env["TREASURY_WALLET"] ?? "";
  return { network, rpcUrl, usdcMint, treasuryWallet };
}

export async function verifyUsdcPayment(
  txSignature: string,
  expectedAmountUsdc: number,
): Promise<{ ok: boolean; paidUsdc?: number; error?: string }> {
  const { rpcUrl, treasuryWallet, usdcMint } = getSolanaConfig();

  if (!treasuryWallet) {
    return { ok: false, error: "TREASURY_WALLET env var not configured on server" };
  }

  const connection = new Connection(rpcUrl, "confirmed");

  let tx;
  try {
    tx = await connection.getParsedTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return { ok: false, error: "Failed to fetch transaction from Solana RPC" };
  }

  if (!tx)          return { ok: false, error: "Transaction not found — may not be confirmed yet, retry in a few seconds" };
  if (tx.meta?.err) return { ok: false, error: "Transaction failed on-chain" };

  const treasuryAta = await getAssociatedTokenAddress(
    new PublicKey(usdcMint),
    new PublicKey(treasuryWallet),
  );
  const treasuryAtaStr = treasuryAta.toBase58();

  const accountKeys = tx.transaction.message.accountKeys;
  const ataIdx = accountKeys.findIndex((k) => {
    const key = "pubkey" in k ? k.pubkey.toBase58() : String(k);
    return key === treasuryAtaStr;
  });

  if (ataIdx === -1) {
    return { ok: false, error: "Treasury USDC account not found in this transaction — check recipient wallet" };
  }

  const pre  = tx.meta?.preTokenBalances?.find((b) => b.accountIndex === ataIdx && b.mint === usdcMint);
  const post = tx.meta?.postTokenBalances?.find((b) => b.accountIndex === ataIdx && b.mint === usdcMint);

  const preAmt   = pre?.uiTokenAmount.uiAmount  ?? 0;
  const postAmt  = post?.uiTokenAmount.uiAmount ?? 0;
  const paidUsdc = postAmt - preAmt;

  if (paidUsdc < expectedAmountUsdc - 0.000001) {
    return {
      ok: false,
      error: `Underpayment: received $${paidUsdc.toFixed(6)} USDC, required $${expectedAmountUsdc.toFixed(6)} USDC`,
    };
  }

  return { ok: true, paidUsdc };
}
