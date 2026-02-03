import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Card, CardContent } from "../ui/card";

export function ViewMnemonics({ mnemonic }: { mnemonic: string[] }) {
  function copyToClipboard() {
    let allMnemonics: string = "";
    mnemonic.forEach((element, id) => {
      if (id !== 0) {
        allMnemonics = allMnemonics + " " + element;
      } else if (id === 0) {
        allMnemonics = element;
      }
    });
    navigator.clipboard.writeText(allMnemonics);
    alert("Private key copied!");
  }
  return (
    <div className="mt-1">
      <Drawer direction="top">
        <DrawerTrigger className="w-full">
          <div className="flex w-full flex-row items-center justify-center rounded-md border-2 border-black/70 bg-white py-2 text-[15px] text-black">
            <p>View Your Mnemonics</p>
            <ChevronDown className="ml-2 -rotate-90" size={18} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="pt-10">
          <DrawerHeader className="py-2">
            <DrawerTitle>
              Never share your mnemonic phrases with anyone.
            </DrawerTitle>
            {mnemonic.length > 0 && (
              <Card className="mt-4 rounded-md p-2 py-2.5">
                <CardContent className="flex justify-between">
                  {mnemonic.map((word, id) => (
                    <div key={id} className="justify-center text-sm">
                      {word}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            <Card
              onClick={() => {
                copyToClipboard();
              }}
            >
              Copy
            </Card>
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
    </div>
  );
}
