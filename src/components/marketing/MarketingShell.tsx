import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type MarketingShellProps = {
  children: React.ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
