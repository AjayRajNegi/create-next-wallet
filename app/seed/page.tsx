"use client";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useState } from "react";

export default function Page() {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);
  const [keyPair, setKeyPair] = useState<Keypair | null>(null);

  function generateMnemonic() {
    const generatedMnemonic = bip39.generateMnemonic();
    setMnemonic(generatedMnemonic.split(" "));

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic, "");
    setSeed(generatedSeed);
    console.log(generatedSeed.toString("hex"));
  }

  function generateKeyPair() {
    const path = `m/44'/501'/0'/0'`;
    if (!seed) {
      return;
    }
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keyPair = Keypair.fromSeed(derivedSeed);

    setKeyPair(keyPair);

    console.log("Public key:", keyPair.publicKey.toBase58());
    console.log("Private key:", Buffer.from(keyPair.secretKey).toString("hex"));
  }

  return (
    <>
      <section className="max-w-7xl mx-auto bg-secondary py-10">
        <h1 className="text-5xl p-5">Create Solana Wallet</h1>
        <div className="max-w-6xl mx-auto flex justify-between">
          <button className="px-4 py-1 text-primary bg-muted-foreground">
            Add Your Mnemonics +
          </button>
          <button
            className="px-4 py-1 text-primary bg-muted-foreground"
            onClick={() => {
              generateMnemonic();
            }}
          >
            Generate +
          </button>
        </div>

        <div className="flex gap-4 max-w-6xl mx-auto mt-5">
          {mnemonic.map((word, id) => (
            <div className="px-3 py-1 bg-muted-foreground text-white" key={id}>
              {word}
            </div>
          ))}
        </div>

        <div className=" gap-4 max-w-6xl mx-auto mt-10">
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
        </div>
      </section>
    </>
  );
}
