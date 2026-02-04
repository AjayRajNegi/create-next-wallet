import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { ViewMnemonics } from "./ViewMnemonics";

interface WalletHeaderProps {
  mnemonic: string[];
}

export default function WalletHeader({ mnemonic }: WalletHeaderProps) {
  return (
    <Card className="mx-5 border-2 border-black/70 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-5xl">create-next-wallet@latest</CardTitle>
        <CardDescription>
          Securely generate your wallet mnemonic phrases and wallets
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ViewMnemonics mnemonic={mnemonic} />
      </CardContent>

      <CardFooter className="text-muted-foreground justify-center text-center text-xs">
        Never share your mnemonic phrase with anyone.
      </CardFooter>
    </Card>
  );
}
