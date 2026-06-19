import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/top-nav";
import { Footer } from "@/components/shell/footer";

export function AppShell({
  children,
  walletless = false,
  className,
  contained = true,
}: {
  children: React.ReactNode;
  walletless?: boolean;
  className?: string;
  contained?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav walletless={walletless} />
      <main className="flex-1">
        {contained ? (
          <div className={cn("mx-auto w-full max-w-[1200px] px-5 py-8 lg:px-6", className)}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}
