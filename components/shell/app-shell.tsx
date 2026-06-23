import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { BrandLogoMark } from "@/components/shell/brand-logo";
import { TopNav } from "@/components/shell/top-nav";
import { Footer } from "@/components/shell/footer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  if (walletless) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <TopNav walletless />
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-bg">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger />
          <BrandLogoMark size="sm" labelled={false} className="hidden md:block" />
          <div className="min-w-0 flex-1">
            <p className="ds-mono truncate text-[11px] uppercase text-ink-dim">ScribeZero workspace</p>
          </div>
        </header>
        <div className="flex-1">
          {contained ? (
            <div className={cn("mx-auto w-full max-w-[1200px] px-5 py-8 lg:px-6", className)}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
