import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export function isValidSolanaAddress(addr: string): boolean {
  return BASE58_RE.test(addr.trim());
}

interface WalletContextValue {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  truncated: string;
  sendUsdc: (toAddress: string, amountUsdc: number, rpcUrl?: string, usdcMint?: string) => Promise<string>;
}

const WalletCtx = createContext<WalletContextValue>({
  publicKey: null,
  connected: false,
  connecting: false,
  walletName: null,
  connect: async () => {},
  disconnect: () => {},
  truncated: "",
  sendUsdc: async () => { throw new Error("Wallet not connected"); },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProvider(): any {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.phantom?.solana ?? w.solana ?? w.solflare ?? null;
}

const STORAGE_KEY = "rn_wallet";

const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = 6;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(() =>
    typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  );
  const [connecting, setConnecting] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);

  const connected = !!publicKey;
  const truncated = publicKey ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}` : "";

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = await provider.connect();
      const key: string = resp.publicKey.toString();
      setPublicKey(key);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = provider as any;
      setWalletName(p.isPhantom ? "Phantom" : p.isSolflare ? "Solflare" : "Wallet");
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // user cancelled
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    getProvider()?.disconnect?.();
    setPublicKey(null);
    setWalletName(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const p = getProvider();
    if (!p) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.on?.("accountChanged", (pubKey: any) => {
      if (pubKey) {
        const key: string = pubKey.toString();
        setPublicKey(key);
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        setPublicKey(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }, []);

  const sendUsdc = useCallback(async (
    toAddress: string,
    amountUsdc: number,
    rpcUrl = "https://api.mainnet-beta.solana.com",
    usdcMint = USDC_MINT_MAINNET,
  ): Promise<string> => {
    const provider = getProvider();
    if (!provider || !publicKey) throw new Error("Wallet not connected");

    const {
      Connection,
      PublicKey,
      Transaction,
    } = await import("@solana/web3.js");

    const {
      createTransferInstruction,
      createAssociatedTokenAccountInstruction,
      getAssociatedTokenAddressSync,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    } = await import("@solana/spl-token");

    const connection  = new Connection(rpcUrl, "confirmed");
    const senderPk    = new PublicKey(publicKey);
    const recipientPk = new PublicKey(toAddress);
    const mintPk      = new PublicKey(usdcMint);

    const senderAta    = getAssociatedTokenAddressSync(mintPk, senderPk);
    const recipientAta = getAssociatedTokenAddressSync(mintPk, recipientPk);
    const amount       = BigInt(Math.round(amountUsdc * 10 ** USDC_DECIMALS));

    const tx = new Transaction();

    const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientAtaInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          senderPk,
          recipientAta,
          recipientPk,
          mintPk,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }

    tx.add(
      createTransferInstruction(
        senderAta,
        recipientAta,
        senderPk,
        amount,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = senderPk;

    const signed = await provider.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

    return signature;
  }, [publicKey]);

  return (
    <WalletCtx.Provider value={{ publicKey, connected, connecting, walletName, connect, disconnect, truncated, sendUsdc }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  return useContext(WalletCtx);
}
