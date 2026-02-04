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
import { derivePath } from "ed25519-hd-key";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";

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

  // Generate Wallets
  async function generateWallet(seed: Buffer | null) {
    if (!seed) {
      alert("Generate Mnemonics first!");
      return;
    }

    const walletIndex = wallets.length;
    const path = `m/44'/501'/${walletIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keyPair = Keypair.fromSeed(derivedSeed);

    const newWallet: WalletData = {
      keyPair,
      publicKey: keyPair.publicKey.toBase58(),
      privateKey: Buffer.from(keyPair.secretKey).toString("hex"),
    };

    const updated = [...wallets, newWallet];
    setWallets(updated);
    localStorage.setItem("wallets", JSON.stringify(updated));
    toast.success("Wallet Created!!", { position: "top-center" });
  }

  // Clear Wallets
  function clearWallet() {
    setMnemonic([]);
    setSeed(null);
    setWallets([]);
    localStorage.clear();
    toast.success("Cleared all Wallets.", { position: "top-center" });
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
    <div className="bg-background mx-auto h-fit max-w-7xl md:max-h-screen">
      <section className="mx-auto mt-5 max-w-7xl">
        <WalletHeader mnemonic={mnemonic} />

        {/* Wallet */}
        <section className="mt-5 flex max-w-7xl flex-col items-center gap-5 md:flex-row md:justify-evenly md:gap-0">
          {/* New Wallet */}
          <Card className="h-fit w-[90%] shrink-0 border-2 border-black/70 shadow-2xl md:w-[25%]">
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
          <ScrollArea className="bg-card/40 mb-5 h-[60vh] w-[90%] overflow-hidden rounded-xl border-2 border-black/70 shadow-2xl md:mb-0 md:w-[70%] [&_[data-radix-scroll-area-scrollbar]]:hidden [&_[data-radix-scroll-area-viewport]]:pr-0">
            {/* Viewport content */}
            <Wallet wallets={wallets} onDeleteWallet={deleteWallet} />
          </ScrollArea>
        </section>
      </section>
    </div>
  );
}
