'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from './header';
import { showToast } from '@/lib/toast';

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
      showToast.success(`Welcome back, ${user.firstName || 'User'}!`);
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
