"use client";
import { useEffect, useState } from "react";
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
import CryptoJS from "crypto-js";
import { useKey } from "@/context/KeyContext";
import { ModeToggle } from "@/components/ui/ModeToggle";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}

// Encrypt the data
function encryptWithKey(data: string, encryptionKey: string): string {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

export default function Home() {
  const router = useRouter();
  const { setKey } = useKey();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [inputMnemonic, setInputMnemonic] = useState<string>("");
  const [userKey, setUserKey] = useState<string>("");

  const onMount = () => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    const storedSeed = localStorage.getItem("seed");
    const storedWallets = localStorage.getItem("wallets");

    if (storedMnemonic && storedSeed && storedWallets) {
      router.push("/seed");
    }
  };

  // Check for data in localStorage
  useEffect(() => {
    if (seed && mnemonic.length > 0 && wallets.length > 0) {
      router.push("/seed");
    }
  }, [seed, mnemonic, router, wallets]);

  // Generate Mnemonics
  async function generateMnemonic() {
    if (!userKey) {
      toast("Generate Key!!");
      return;
    }
    const generatedMnemonic = bip39.generateMnemonic();
    const words = generatedMnemonic.split(" ");

    setMnemonic(words);

    const encryptedMnemonic = encryptWithKey(JSON.stringify(words), userKey);
    localStorage.setItem("mnemonic", encryptedMnemonic);
    toast.success("Generated mnemonics.", { position: "top-center" });

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic);
    setSeed(generatedSeed);
    toast.success("Generated seed.", { position: "top-center" });
    const encryptedSeed = encryptWithKey(
      generatedSeed.toString("hex"),
      userKey,
    );
    localStorage.setItem("seed", encryptedSeed);
    await generateWallet(generatedSeed);

    return;
  }

  // Generate first wallet
  async function generateWallet(seed: Buffer | null) {
    if (!userKey) {
      toast("Generate Key!!");
      return;
    }
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
    const encryptedWallets = encryptWithKey(JSON.stringify(updated), userKey);

    setWallets(updated);
    localStorage.setItem("wallets", encryptedWallets);
    toast.success("Wallet Created!!", { position: "top-center" });
  }

  // Generate seed from the input mnemonics
  async function generateSeedFromInputMnemonics() {
    if (!userKey) {
      toast("Generate Key!!");
      return;
    }
    if (inputMnemonic.length !== 0) {
      const isValidMnemonics = bip39.validateMnemonic(inputMnemonic);
      if (!isValidMnemonics) {
        toast.error("Input valid mnemonics");
        return;
      }
      const seedFromInput = bip39.mnemonicToSeedSync(inputMnemonic);
      setSeed(seedFromInput);
      toast.success("Generated seed.", { position: "top-center" });
      const words = inputMnemonic.split(" ");

      const encryptedMnemonic = encryptWithKey(JSON.stringify(words), userKey);
      localStorage.setItem("mnemonic", encryptedMnemonic);
      toast.success("Generated mnemonics.", { position: "top-center" });

      const encryptedSeed = encryptWithKey(
        seedFromInput.toString("hex"),
        userKey,
      );
      localStorage.setItem("seed", encryptedSeed);
      toast.success("Generated mnemonics.", { position: "top-center" });

      await generateWallet(seedFromInput);
      router.push("/seed");
    }
    return;
  }

  // Get the encryption key from the user
  async function addUserKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (userKey) {
      setKey(userKey);
      onMount();
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center p-4 md:h-screen md:p-0">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-end gap-2 md:flex-row">
        <Card className="border-foreground/70 w-[90%] border-2 pt-6 shadow-xl md:w-auto md:pt-10">
          <CardHeader className="space-y-2 py-6 text-center md:py-10">
            <CardTitle className="text-4xl md:text-5xl">
              create-next-wallet@latest
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Securely generate your wallet mnemonic phrases and wallets
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <Card className="border-foreground/70 py- 4 w-full gap-0 border-[2px] text-black md:w-4xl">
              <CardHeader className="text-foreground px-4 py-0">
                Add your phrases
              </CardHeader>
              <CardContent className="flex w-full flex-col items-stretch gap-2 p-4 py-2 md:flex-row md:items-center">
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
        <Card className="border-foreground/70 gap-2 border-2 p-4 shadow-xl">
          <form onSubmit={addUserKey} className="">
            <h4 className="mb-2">Enter Secret Key</h4>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Key to ENCRYPT data."
                type="password"
                value={userKey}
                className="mt-1 h-[38px]"
                onChange={(e) => setUserKey(e.target.value)}
              />

              <Button
                type="submit"
                size="sm"
                className="shadow-[0px_4px_0px_0px_rgba(0,0,0)] hover:translate-y-[4px] hover:shadow-none"
              >
                Submit
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
