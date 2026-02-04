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
import { toast } from "sonner";

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
    toast("Mnemonics copied to clipboard.", { position: "top-center" });
  }
  return (
    <div className="mt-1">
      <Drawer direction="top">
        <DrawerTrigger className="w-full">
          <div className="bg-primary flex w-full flex-row items-center justify-center rounded-md py-2 text-[15px] text-white shadow-[0px_5px_0px_0px_rgba(0,0,0)] transition-all hover:translate-y-[5px] hover:cursor-zoom-in hover:shadow-none">
            <p>View Your Mnemonics</p>
            <ChevronDown className="ml-2 -rotate-90" size={18} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="pt-10">
          <DrawerHeader className="py-2">
            <DrawerTitle>
              Never share your mnemonic phrases with anyone.
            </DrawerTitle>
            <div className="flex h-fit w-full flex-col gap-2 md:flex-row md:items-end">
              {mnemonic.length > 0 && (
                <Card className="w-full rounded-md border border-black p-4">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {mnemonic.map((word, id) => (
                        <div
                          key={id}
                          className="bg-secondary rounded-md px-3 py-2 text-center text-sm font-medium"
                        >
                          <span className="text-muted-foreground text-xs">
                            {id + 1}.
                          </span>{" "}
                          {word}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card
                onClick={copyToClipboard}
                className="hover:bg-secondary flex w-full cursor-pointer items-center justify-center rounded-md border border-black p-2 transition-all hover:scale-95 md:w-auto md:min-w-[100px]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span className="text-sm font-medium">Copy</span>
                </div>
              </Card>
            </div>
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
