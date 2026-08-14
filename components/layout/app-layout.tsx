"use client";

import { BarChart3, FileText, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/auth/client";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useAuthUser();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 h-full w-80 bg-card shadow-[3px_0_0_0_var(--color-border)] z-50 md:hidden transform transition-transform duration-300 ease-in-out border-r border-border">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-sm border border-border bg-background">
                  <FileText className="h-5 w-5 icon-blue" />
                </div>
                <span className="font-display font-semibold text-enhanced">Documind</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-1">
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 border-l-2 border-transparent hover:border-l-ledger hover:bg-secondary/60 text-foreground font-medium transition-colors"
              >
                <BarChart3 className="h-4 w-4 icon-blue" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/chat"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 border-l-2 border-transparent hover:border-l-ledger hover:bg-secondary/60 text-foreground font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4 icon-green" />
                <span>Chat</span>
              </Link>

              <Link
                href="/graph"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 border-l-2 border-transparent hover:border-l-ledger hover:bg-secondary/60 text-foreground font-medium transition-colors"
              >
                <BarChart3 className="h-4 w-4 icon-purple" />
                <span>Knowledge Graph</span>
              </Link>
            </nav>
          </div>
        </>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
