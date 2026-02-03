"use client";

import Wallet from "@/components/components/Wallet";
import WalletHeader from "@/components/components/WalletHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}

export default function Page() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Get the values from localStorage
  const onMount = useEffectEvent(() => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    const storedSeed = localStorage.getItem("seed");
    const storedWallets = localStorage.getItem("wallets");

    if (storedMnemonic && storedSeed && storedWallets) {
      setMnemonic(JSON.parse(storedMnemonic));
      setSeed(Buffer.from(storedSeed, "hex"));
      setWallets(JSON.parse(storedWallets));
    }

    setInitialized(true);
  });

  useEffect(() => {
    onMount();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (wallets.length === 0 && mnemonic.length === 0) {
      localStorage.removeItem("mnemonic");
      localStorage.removeItem("seed");
      localStorage.removeItem("wallets");
      router.push("/");
    }
  }, [wallets, initialized, router, mnemonic]);

  // Generate Mnemonics
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
  // Generate Wallets
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

  // Clear Wallets
  function clearWallet() {
    setMnemonic([]);
    setSeed(null);
    setWallets([]);
    localStorage.clear();
  }

  // Delete Single Wallet
  function deleteWallet(id: number) {
    setWallets((prev) => {
      const updated = prev.filter((_, index) => index !== id);
      localStorage.setItem("wallets", JSON.stringify(updated));

      if (updated.length === 0) {
        clearWallet();
      }

      return updated;
    });
  }

  return (
    <div className="bg-background mx-auto min-h-screen max-w-7xl">
      <section className="mx-auto mt-5 max-w-7xl">
        <WalletHeader mnemonic={mnemonic} generateMnemonic={generateMnemonic} />

        {/* Wallet */}
        <section className="mt-5 flex max-w-7xl justify-evenly">
          {/* New Wallet */}
          <Card className="h-fit w-[25%] shrink-0 border-2 border-black/70 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-4xl">Solana Wallets</CardTitle>
              <CardDescription>Manage your solana wallets.</CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-2">
              <Button
                size="sm"
                className="w-full shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                onClick={() => generateWallet(seed)}
              >
                Add Wallet
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                onClick={clearWallet}
              >
                Clear Wallet
              </Button>
            </CardFooter>
          </Card>

          {/* All Wallets */}
          <ScrollArea className="bg-card/40 h-[60vh] w-[70%] overflow-hidden rounded-xl border-2 border-black/70 shadow-2xl [&_[data-radix-scroll-area-scrollbar]]:hidden [&_[data-radix-scroll-area-viewport]]:pr-0">
            {/* Viewport content */}
            <Wallet wallets={wallets} onDeleteWallet={deleteWallet} />
          </ScrollArea>
        </section>
      </section>
    </div>
  );
}
