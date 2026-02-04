import { Keypair } from "@solana/web3.js";
import WalletCard from "./WalletCard";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}
interface WalletProps {
  wallets: WalletData[];
  onDeleteWallet: (id: number) => void;
}

export default function Wallet({ wallets, onDeleteWallet }: WalletProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {wallets.map((wallet, id) => (
        <WalletCard
          key={id}
          wallet={wallet}
          index={id}
          onDelete={onDeleteWallet}
        />
      ))}
    </div>
  );
}
