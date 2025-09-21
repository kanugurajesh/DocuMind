"use client";

import { useUser } from "@clerk/nextjs";
import type React from "react";
import { useState } from "react";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();


  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
