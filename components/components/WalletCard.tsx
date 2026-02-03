import { Keypair } from "@solana/web3.js";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { ViewCredentials } from "./ViewCredentials";

interface WalletData {
  keyPair: Keypair;
  publicKey: string;
  privateKey: string;
}
interface WalletCardProps {
  wallet: WalletData;
  index: number;
  onDelete: (id: number) => void;
}

export default function WalletCard({
  wallet,
  index,
  onDelete,
}: WalletCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  function copyToClipboard(privateKey: string) {
    navigator.clipboard.writeText(privateKey);
    alert("Private key copied!");
  }

  return (
    <Card className="border-2 border-black/70">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-2xl tracking-tight">
          Wallet {index}
          <div className="flex gap-1">
            <ViewCredentials publicKey={wallet.publicKey} />
            <Button
              variant="destructive"
              size="sm"
              className="border-destructive shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]"
              onClick={() => onDelete(index)}
            >
              Delete
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground text-sm">Public Key</p>
          <p className="break-all">{wallet.publicKey}</p>
        </div>

        <Separator />

        <div>
          <p className="text-muted-foreground text-sm">Private Key</p>
          <div className="flex items-center justify-between gap-2">
            {isVisible ? (
              <p className="min-h-[50px] max-w-full break-all">
                {wallet.privateKey}
              </p>
            ) : (
              <>
                <p className="hidden min-h-[50px] items-center break-all lg:flex">
                  ************************************************************************************
                </p>
                <p className="hidden min-h-[50px] items-center break-all md:flex lg:hidden">
                  *********************************************************
                </p>
                <p className="flex min-h-[50px] items-center break-all md:hidden">
                  ***************************
                </p>
              </>
            )}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsVisible(!isVisible)}
                className="eyeButton"
              >
                {isVisible ? <Eye /> : <EyeOff />}
              </Button>
              <Button
                onClick={() => copyToClipboard(wallet.privateKey)}
                className="copyButton"
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
