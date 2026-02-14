import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/ModeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen w-full items-center justify-center">
        <div className="absolute top-3 right-3 z-50 sm:top-5 sm:right-10">
          <ModeToggle />
        </div>
        <Card className="dark:bg-foreground flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center bg-black">
          <Card className="bg-background relative z-10 flex w-[98%] flex-col items-center justify-center py-2 sm:p-6 md:w-[96%]">
            <h1 className="-z-10 mb-8 text-center text-3xl font-[500] tracking-tight sm:mb-12 sm:text-4xl md:mb-20 md:text-5xl lg:text-6xl">
              create-next-wallet@latest
            </h1>
            <Image
              src="/main1.png"
              alt="main"
              height={500}
              width={500}
              className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 md:h-[450px] md:w-[450px]"
            />
            <Card className="border-foreground/70 dark:bg-background w-[95%] border-2 p-2 shadow-2xl sm:p-4 md:w-2xl md:p-8 md:pt-6">
              <CardContent className="relative flex flex-col items-center justify-center gap-4">
                <CardDescription>Pick your poison.</CardDescription>
                <div className="flex w-full justify-center gap-2 md:gap-10">
                  <Button className="bg-destructive text-destructive-foreground hover:bg-destructive flex items-center justify-center border-0 px-3 py-1 text-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0)] transition-all hover:translate-y-[4px] hover:shadow-none sm:px-8 sm:py-4 md:px-10 md:py-5 md:text-base">
                    Hop onto MAINNET
                  </Button>

                  <Button className="bg-primary text-destructive-foreground flex items-center justify-center border-0 px-3 py-1 text-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0)] transition-all hover:translate-y-[4px] hover:shadow-none sm:px-8 sm:py-4 md:px-10 md:py-5 md:text-base">
                    Play around with Wallets.
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Card>
        </Card>
      </main>
    </>
  );
}
