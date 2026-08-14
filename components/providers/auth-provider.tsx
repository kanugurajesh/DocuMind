"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { SessionProvider } from "next-auth/react";
import type React from "react";
import { isLocalAuth } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isLocalAuth) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
