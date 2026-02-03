"use client";
import { useEffect, useEffectEvent, useState } from "react";
import * as bip39 from "bip39";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}
export default function Home() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);

  const onMount = useEffectEvent(() => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    const storedSeed = localStorage.getItem("seed");
    const storedWallets = localStorage.getItem("wallets");

    if (storedMnemonic && storedSeed && storedWallets) {
      router.push("/seed");
    }
  });

  useEffect(() => {
    onMount();
  }, []);

  useEffect(() => {
    if (seed && mnemonic.length > 0 && wallets.length > 0) {
      router.push("/seed");
    }
  }, [seed, mnemonic, router, wallets]);

  async function generateMnemonic() {
    if (mnemonic.length === 0) {
      const generatedMnemonic = bip39.generateMnemonic();
      const words = generatedMnemonic.split(" ");

      setMnemonic(words);
      localStorage.setItem("mnemonic", JSON.stringify(words));

      const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic);
      setSeed(generatedSeed);
      localStorage.setItem("seed", generatedSeed.toString("hex"));

      await generateWallet(generatedSeed);
    }
    return;
  }

  async function generateWallet(seed: Buffer | null) {
    if (!seed) {
      alert("Generate Mnemonics first!");
      return;
    }

    setWallets((prev) => {
      const walletIndex = prev.length;
      const path = `m/44'/501'/${walletIndex}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const keyPair = Keypair.fromSeed(derivedSeed);

      const newWallet: WalletData = {
        keyPair,
        publicKey: keyPair.publicKey.toBase58(),
        privateKey: Buffer.from(keyPair.secretKey).toString("hex"),
      };

      const updated = [...prev, newWallet];
      localStorage.setItem("wallets", JSON.stringify(updated));
      return updated;
    });
  }
  return (
    <>
      <Button className="w-full" size="lg" onClick={generateMnemonic}>
        Generate Your Mnemonics <ChevronDown className="-rotate-90" />
      </Button>
    </>
  );
}
