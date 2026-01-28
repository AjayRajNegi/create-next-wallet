"use client";
import * as bip39 from "bip39";
import { useState } from "react";

export default function Page() {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [seed, setSeed] = useState<Buffer | null>(null);

  function generateMnemonic() {
    const generatedMnemonic = bip39.generateMnemonic();
    setMnemonic(generatedMnemonic.split(" "));

    const generatedSeed = bip39.mnemonicToSeedSync(generatedMnemonic, "");
    setSeed(generatedSeed);
    console.log(generatedSeed.toString("hex"));
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
      </section>
    </>
  );
}
