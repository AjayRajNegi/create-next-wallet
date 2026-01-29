"use client";
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
    <>
      <section className="max-w-7xl mx-auto bg-secondary py-10">
        <h1 className="text-5xl py-10 max-w-6xl mx-auto text-center">
          create-next-wallet@latest
        </h1>
        <div className="max-w-6xl mx-auto flex justify-between">
          <button
            className="py-5 text-primary-foreground bg-muted-foreground w-full"
            onClick={() => {
              generateMnemonic();
            }}
          >
            Generate Your Mnemonics
          </button>
        </div>

        <div className="flex justify-between max-w-6xl mx-auto mt-5">
          {mnemonic.map((word, id) => (
            <div className="px-3 py-1 bg-muted-foreground text-white" key={id}>
              {word}
            </div>
          ))}
        </div>

        {/* Wallet */}
        <section className="max-w-6xl mx-auto mt-20">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-[500] ">Solana Wallet</h1>
            <div>
              <button
                className="px-4 py-2 text-muted-foreground bg-primary-foreground border-[1px] border-border mr-2"
                onClick={() => {
                  generateWallet(seed);
                }}
              >
                Add Wallet
              </button>
              <button
                className="px-4 py-2 text-primary-foreground bg-destructive border-[1px] border-border"
                onClick={() => {
                  clearWallet();
                }}
              >
                Clear Wallet
              </button>
            </div>
          </div>

          {/* All Wallets */}
          <div className="flex gap-1 flex-col">
            {wallets.map((wallet, id) => (
              <div
                key={id}
                className="tracking-tighter text-base p-4 bg-foreground/80 text-white "
              >
                <h4 className="text-white/80 text-3xl font-[600] flex justify-between items-center">
                  Wallet{id}
                  <button
                    className="bg-destructive px-3 py-1 w-fit h-fit text-xs"
                    onClick={() => {
                      deleteWallet(id);
                    }}
                  >
                    Delete
                  </button>
                </h4>
                <div className="tracking-tighter text-base p-4 bg-foreground/80 text-white border-[0.5px] border-white/40">
                  <p>Public Key</p>
                  <p>{wallet.publicKey}</p>
                </div>
                <div className="tracking-tighter text-base p-4 bg-foreground/80 text-white">
                  <p>Private Key</p>
                  <p>{wallet.publicKey}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* <div className=" gap-4 max-w-6xl mx-auto mt-10">
          <div
            className="px-4 py-1 text-accent bg-muted-foreground text-center "
            onClick={() => {
              generateKeyPair();
            }}
          >
            Show
          </div>
          <div className="bg-background text-foreground p-4 shadow-lg shadow-accent-foreground">
            <h3>
              <span className="bg-muted-foreground px-4 py-2 mr-2 text-primary">
                Public Key <br />
              </span>
              {keyPair?.publicKey.toBase58()}
            </h3>
            <h3 className="">
              <span className="bg-muted-foreground px-4 py-2 mr-2 text-primary break-all">
                Private Key <br />
              </span>
              {keyPair?.secretKey ? (
                <>{Buffer.from(keyPair.secretKey).toString("hex")}</>
              ) : (
                <></>
              )}
            </h3>
          </div>
        </div> */}
      </section>
    </>
  );
}
