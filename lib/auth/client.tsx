"use client";

import { useClerk, useUser as useClerkUser } from "@clerk/nextjs";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { useMemo } from "react";
import type { NormalizedUser } from "./index";

export const isLocalAuth = process.env.NEXT_PUBLIC_AUTH_MODE === "local";

interface AuthUserResult {
  user: NormalizedUser | null;
  isLoaded: boolean;
}

// NOTE: useAuthUser/useAuthActions below pick ONE underlying hook function at
// module-evaluation time (isLocalAuth never changes without a rebuild), not
// inside a shared hook body. That keeps each exported hook itself compliant
// with the Rules of Hooks, and — critically — means the unused SDK's hook
// (which would throw without its provider mounted, since AuthProvider only
// ever mounts one of ClerkProvider/SessionProvider) is never called at all.

function useLocalAuthUser(): AuthUserResult {
  const { data: session, status } = useSession();
  const sessionUser = session?.user;

  // Keep the returned `user` reference stable across renders when the
  // underlying session data hasn't changed. Consumers put `user` in
  // useEffect dependency arrays, and a fresh object literal here on every
  // render (regardless of whether the data changed) causes those effects
  // to re-fire every render, e.g. an infinite document-fetch loop.
  const user = useMemo<NormalizedUser | null>(() => {
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      firstName: sessionUser.firstName ?? null,
      lastName: sessionUser.lastName ?? null,
      imageUrl: sessionUser.imageUrl ?? null,
      emailAddresses: sessionUser.email
        ? [{ emailAddress: sessionUser.email }]
        : [],
    };
  }, [
    sessionUser?.id,
    sessionUser?.firstName,
    sessionUser?.lastName,
    sessionUser?.imageUrl,
    sessionUser?.email,
  ]);

  return { user, isLoaded: status !== "loading" };
}

function useClerkAuthUser(): AuthUserResult {
  const { user, isLoaded } = useClerkUser();
  return { user: user as unknown as NormalizedUser | null, isLoaded };
}

export const useAuthUser: () => AuthUserResult = isLocalAuth
  ? useLocalAuthUser
  : useClerkAuthUser;

interface AuthActions {
  signOut: () => void;
  openUserProfile: () => void;
}

function useLocalAuthActions(): AuthActions {
  return {
    signOut: () => {
      nextAuthSignOut({ callbackUrl: "/" });
    },
    // No hosted account-management UI in local mode — callers should hide
    // the menu item that would trigger this rather than call it.
    openUserProfile: () => {},
  };
}

function useClerkAuthActions(): AuthActions {
  const { signOut, openUserProfile } = useClerk();
  return {
    signOut: () => {
      signOut({ redirectUrl: "/" });
    },
    openUserProfile,
  };
}

export const useAuthActions: () => AuthActions = isLocalAuth
  ? useLocalAuthActions
  : useClerkAuthActions;
