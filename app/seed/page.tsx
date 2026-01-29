"use client";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useState } from "react";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}

export default function Page() {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  //const [keyPair, setKeyPair] = useState<Keypair | null>(null);

  const [wallet, setWallet] = useState<WalletData[]>([]);

  function generateMnemonic() {
    const generatedMnemonic = bip39.generateMnemonic();
    setMnemonic(generatedMnemonic.split(" "));

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic, "");
    setSeed(generatedSeed);
    console.log(generatedSeed.toString("hex"));
  }

  function generateWallet() {
    if (!seed) {
      console.log("Generate Seed.");
      return;
    }

    const walletIndex = wallet.length;

    const path = `m/44'/501'/${walletIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keyPair = Keypair.fromSeed(derivedSeed);

    const newWallet: WalletData = {
      keyPair,
      publicKey: keyPair.publicKey.toBase58(),
      privateKey: Buffer.from(keyPair.secretKey).toString("hex"),
    };

    setWallet((prev) => [...prev, newWallet]);
  }

  return (
    <>
      <section className="max-w-7xl mx-auto bg-secondary py-10">
        <h1 className="text-5xl p-5">Create Solana Wallet</h1>
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
            <h1 className="text-5xl font-[500]">Solana Wallet</h1>
            <div>
              <button
                className="px-4 py-2 text-muted-foreground bg-primary-foreground border-[1px] border-border mr-2"
                onClick={() => {
                  generateWallet();
                }}
              >
                Add Wallet
              </button>
              <button className="px-4 py-2 text-primary-foreground bg-destructive border-[1px] border-border">
                Clear Wallet
              </button>
            </div>
          </div>

          {/* All Wallets */}
          <div className="flex gap-10 flex-col">
            {wallet.map((wallet, id) => (
              <div key={id} className="">
                {wallet.privateKey}
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
