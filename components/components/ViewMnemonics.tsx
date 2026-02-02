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
  return (
    <div className="mt-1">
      <Drawer direction="top">
        <DrawerTrigger className="w-full">
          <div className="bg-primary text-card flex w-full flex-row items-center justify-center rounded-md py-2 text-[15px]">
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
