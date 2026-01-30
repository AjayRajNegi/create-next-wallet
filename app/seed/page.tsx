"use client";

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
    <div className="bg-background max-w-7xl mx-auto min-h-screen border-border border-1 ">
      <section className="max-w-7xl mx-auto py-10">
        <Card className="mx-5 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-5xl">
              create-next-wallet@latest
            </CardTitle>
            <CardDescription>
              Securely generate your wallet mnemonic phrase
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button className="w-full" size="lg" onClick={generateMnemonic}>
              Generate Your Mnemonics
            </Button>

            {mnemonic.length > 0 && (
              <Card className="mt-2 p-2 py-2.5 rounded-md">
                <CardContent className="flex justify-between ">
                  {mnemonic.map((word, id) => (
                    <div key={id} className="justify-center  text-sm">
                      {word}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground text-center justify-center">
            Never share your mnemonic phrase with anyone.
          </CardFooter>
        </Card>

        {/* Wallet */}
        <section className="max-w-7xl mt-5 flex justify-evenly ">
          {/* New Wallet */}
          <Card className="w-[25%] max-h-[215px] shrink-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-4xl">Solana Wallets</CardTitle>
              <CardDescription>Manage your solana wallets.</CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-2">
              <Button
                size="sm"
                className="w-full shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] "
                onClick={() => generateWallet(seed)}
              >
                Add Wallet
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
                onClick={clearWallet}
              >
                Clear Wallet
              </Button>
            </CardFooter>
          </Card>

          {/* All Wallets */}
          <ScrollArea
            className="
      w-[70%]
      h-[60vh]
      rounded-xl
      border
      overflow-hidden
      [&_[data-radix-scroll-area-scrollbar]]:hidden
      [&_[data-radix-scroll-area-viewport]]:pr-0
          shadow-2xl bg-card/40
    "
          >
            {/* Viewport content */}
            <div className="flex flex-col gap-3 p-4">
              {wallets.map((wallet, id) => (
                <Card key={id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-2xl tracking-tight">
                      Wallet {id}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:-translate-x-[1px] hover:-translate-y-[1px]"
                        onClick={() => deleteWallet(id)}
                      >
                        Delete
                      </Button>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Public Key
                      </p>
                      <p className="break-all">{wallet.publicKey}</p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm text-muted-foreground">
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
