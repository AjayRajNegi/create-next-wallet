import { useState } from "react";
import { Card } from "../ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";

export function ViewCredentials({ publicKey }: { publicKey: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  async function getBalance() {
    setLoading(true);
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );

      const pubKey = new PublicKey(publicKey);
      const balanceInLamports = await connection.getBalance(pubKey);
      setBalance(balanceInLamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(publicKey);
    alert("Private key copied!");
  }

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger>
          <p
            className="bg-primary text-primary-foreground flex h-8 items-center rounded-md px-3 text-sm font-medium shadow-[2px_2px_0_rgba(0,0,0)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:border hover:border-black hover:bg-white/50 hover:tracking-wider hover:text-black hover:shadow-[4px_4px_0_rgba(0,0,0)]"
            onClick={() => {
              getBalance();
            }}
          >
            View Balance
          </p>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <p>
                    Balance: {balance !== null ? `${balance} SOL` : "0.0 SOL"}
                  </p>
                </>
              )}
            </DrawerTitle>
            <DrawerDescription>
              <Input
                type={`${isVisible ? "text" : "password"}`}
                className="private"
                value={publicKey}
                disabled
              />
              <Button
                onClick={() => {
                  setIsVisible(!isVisible);
                }}
                className="eyeButton"
              >
                {isVisible ? (
                  <>
                    <Eye />
                  </>
                ) : (
                  <>
                    <EyeOff />
                  </>
                )}
              </Button>
              <Button onClick={copyToClipboard} className="copyButton">
                Copy
              </Button>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-0">
            <DrawerClose>
              <Card className="bg-primary text-card flex w-full flex-row items-center justify-center rounded-md py-2">
                Cancel
              </Card>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
