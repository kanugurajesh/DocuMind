"use client";

import { useUser } from "@clerk/nextjs";
import type React from "react";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Show welcome notification when user signs in
  useEffect(() => {
    if (isLoaded && user && !hasShownWelcome) {
      showToast.success(`Welcome back, ${user.firstName || "User"}!`);
      setHasShownWelcome(true);
    }
  }, [isLoaded, user, hasShownWelcome]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
