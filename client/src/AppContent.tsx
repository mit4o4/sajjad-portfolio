import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { useRevealAll } from "./hooks/useRevealAll";

/** Shared chrome for every page: header, footer, floating WhatsApp and entrance reveals. */
export default function AppContent({ children }: { children: ReactNode }) {
  useRevealAll();
  return (
    <TooltipProvider>
      <Toaster />
      <div className="tb-page">
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
