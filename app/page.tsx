"use client";
import { useEffect, useEffectEvent, useState } from "react";
import * as bip39 from "bip39";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [inputMnemonic, setInputMnemonic] = useState<string>("");

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
    const generatedMnemonic = bip39.generateMnemonic();
    const words = generatedMnemonic.split(" ");

    setMnemonic(words);
    localStorage.setItem("mnemonic", JSON.stringify(words));
    toast.success("Generated mnemonics.", { position: "top-center" });

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic);
    setSeed(generatedSeed);
    toast.success("Generated seed.", { position: "top-center" });
    localStorage.setItem("seed", generatedSeed.toString("hex"));

    await generateWallet(generatedSeed);

    return;
  }

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

  async function generateSeedFromInputMnemonics() {
    if (inputMnemonic.length !== 0) {
      const seedFromInput = bip39.mnemonicToSeedSync(inputMnemonic);
      setSeed(seedFromInput);
      toast.success("Generated seed.", { position: "top-center" });
      const words = inputMnemonic.split(" ");
      localStorage.setItem("mnemonic", JSON.stringify(words));
      localStorage.setItem("seed", seedFromInput.toString("hex"));
      toast.success("Generated mnemonics.", { position: "top-center" });
      await generateWallet(seedFromInput);
      router.push("/seed");
    }
    return;
  }
  return (
    <section className="flex min-h-screen items-center justify-center p-4 md:h-screen md:p-0">
      <Card className="w-full border-2 border-black/70 pt-6 shadow-xl md:w-auto md:pt-10">
        <CardHeader className="space-y-2 py-6 text-center md:py-10">
          <CardTitle className="text-4xl md:text-5xl">
            create-next-wallet@latest
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Securely generate your wallet mnemonic phrases and wallets
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Card className="w-full gap-0 border-[2px] border-black/70 py-4 text-black md:w-5xl">
            <CardHeader className="px-4 py-0">Add your phrases</CardHeader>
            <CardContent className="m flex w-full flex-col items-stretch gap-2 p-4 py-2 md:flex-row md:items-center">
              <Input
                type="text"
                className="h-[44px] md:mt-1 md:mr-2"
                placeholder="If you do not have phrases just click on Generate."
                onChange={(e) => setInputMnemonic(e.target.value)}
              />

              <div className="flex w-full gap-0 md:w-auto">
                <Button
                  className="flex-1 rounded-r-none shadow-[0px_4px_0px_0px_rgba(0,0,0)] hover:translate-y-[4px] hover:shadow-none md:flex-none"
                  size="lg"
                  onClick={() => {
                    generateSeedFromInputMnemonics();
                  }}
                >
                  Add
                </Button>

                <Button
                  className="hover:border-l-primary/50 flex-1 rounded-l-none border-l-1 border-l-black shadow-[0px_4px_0px_0px_rgba(0,0,0)] hover:translate-y-[4px] hover:shadow-none md:flex-none"
                  size="lg"
                  onClick={generateMnemonic}
                >
                  Generate
                  <ChevronDown className="-rotate-90" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}
