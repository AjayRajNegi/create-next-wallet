"use client";
import { useEffect, useEffectEvent, useState } from "react";
import * as bip39 from "bip39";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    console.log(generatedMnemonic);

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic);
    setSeed(generatedSeed);
    localStorage.setItem("seed", generatedSeed.toString("hex"));

    await generateWallet(generatedSeed);

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

  async function generateSeedFromInputMnemonics() {
    if (inputMnemonic.length !== 0) {
      const seedFromInput = bip39.mnemonicToSeedSync(inputMnemonic);
      setSeed(seedFromInput);
      const words = inputMnemonic.split(" ");
      localStorage.setItem("mnemonic", JSON.stringify(words));
      localStorage.setItem("seed", seedFromInput.toString("hex"));
      await generateWallet(seedFromInput);
      await router.push("/seed");
    }
    return;
  }
  return (
    <section className="flex h-screen items-center justify-center">
      <Card className="w-5xl border-[2px] border-black/80 text-black">
        <CardHeader>Add/Generate your phrases</CardHeader>
        <CardContent className="flex w-full items-center">
          <Input
            type="text"
            className="mr-[3px] h-[40px] rounded-r-none"
            onChange={(e) => setInputMnemonic(e.target.value)}
          />
          <Button
            className="rounded-none border-r-2 border-white"
            size="lg"
            onClick={() => {
              generateSeedFromInputMnemonics();
            }}
          >
            Add
          </Button>

          <Button
            className="rounded-l-none"
            size="lg"
            onClick={generateMnemonic}
          >
            Generate
            <ChevronDown className="-rotate-90" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
