"use client";

import { ViewCredentials } from "@/components/components/ViewCredentials";
import { ViewMnemonics } from "@/components/components/ViewMnemonics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { ChevronDown, View } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}

export default function Page() {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);

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
  });

  useEffect(() => {
    onMount();
  }, []);

  // Generate Mnemonics
  async function generateMnemonic() {
    const generatedMnemonic = bip39.generateMnemonic();
    const words = generatedMnemonic.split(" ");

    setMnemonic(words);
    localStorage.setItem("mnemonic", JSON.stringify(words));

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic);
    setSeed(generatedSeed);
    localStorage.setItem("seed", generatedSeed.toString("hex"));

    await generateWallet(generatedSeed);
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
        <Card className="mx-5 border-2 border-black/50 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-5xl">
              create-next-wallet@latest
            </CardTitle>
            <CardDescription>
              Securely generate your wallet mnemonic phrase
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button className="w-full" size="lg" onClick={generateMnemonic}>
              Generate Your Mnemonics <ChevronDown className="-rotate-90" />
            </Button>
            <ViewMnemonics mnemonic={mnemonic} />
          </CardContent>

          <CardFooter className="text-muted-foreground justify-center text-center text-xs">
            Never share your mnemonic phrase with anyone.
          </CardFooter>
        </Card>

        {/* Wallet */}
        <section className="mt-5 flex max-w-7xl justify-evenly">
          {/* New Wallet */}
          <Card className="h-fit w-[25%] shrink-0 border-2 border-black/50 shadow-2xl">
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
          <ScrollArea className="bg-card/40 h-[60vh] w-[70%] overflow-hidden rounded-xl border-2 border-black/50 shadow-2xl [&_[data-radix-scroll-area-scrollbar]]:hidden [&_[data-radix-scroll-area-viewport]]:pr-0">
            {/* Viewport content */}
            <div className="flex flex-col gap-3 p-4">
              {wallets.map((wallet, id) => (
                <Card key={id} className="border-2 border-black/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-2xl tracking-tight">
                      Wallet {id}
                      <div className="flex gap-1">
                        <ViewCredentials publicKey={wallet.publicKey} />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="border-destructive shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]"
                          onClick={() => deleteWallet(id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Public Key
                      </p>
                      <p className="break-all">{wallet.publicKey}</p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Private Key
                      </p>
                      <p className="break-all">{wallet.privateKey}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </section>
      </section>
    </div>
  );
}
