"use client";

import { useUser } from "@clerk/nextjs";
import { BarChart3, FileText, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

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
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                  <FileText className="h-6 w-6 icon-blue" />
                </div>
                <span className="font-bold text-enhanced">Documind</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="h-9 w-9 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-2">
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-800 hover:text-blue-700 font-semibold border border-transparent hover:border-blue-200"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/chat"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-800 hover:text-green-700 font-semibold border border-transparent hover:border-green-200"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <span>Chat</span>
              </Link>

              <Link
                href="/graph"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 text-gray-800 hover:text-purple-700 font-semibold border border-transparent hover:border-purple-200"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
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
