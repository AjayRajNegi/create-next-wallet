"use client";
import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Page() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const publicKey = "BuuQuN1bbogiUb44oj8MFEJuqWP19zRwNqUsxeRqLPh7";

  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      try {
        // const connection = new Connection(
        //   "https://api.devnet.solana.com",
        //   "confirmed",
        // );
        // const pubKey = new PublicKey(publicKey);
        // const balanceInLamports = await connection.getBalance(pubKey);

        const response = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [publicKey],
          }),
        });
        const data = await response.json();
        const balanceInLamports = data.result.value;
        setBalance(balanceInLamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>Balance: {balance !== null ? `${balance} SOL` : "N/A"}</p>
      )}
    </div>
  );
}
