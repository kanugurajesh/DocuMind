// Unified server-side auth for both modes. Downstream callers only ever
// destructure `{ userId }` from auth() or check currentUser() for truthiness,
// so both branches just need to match those two shapes — not Clerk's full
// AuthObject/User types. Dynamic imports keep whichever SDK isn't active
// (Auth.js vs Clerk) out of the eagerly-evaluated module graph.

export interface NormalizedUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddresses: { emailAddress: string }[];
}

function isLocalAuth(): boolean {
  return process.env.AUTH_MODE === "local";
}

export async function auth(): Promise<{ userId: string | null }> {
  if (isLocalAuth()) {
    const { auth: localAuth } = await import("@/auth");
    const session = await localAuth();
    return { userId: session?.user?.id ?? null };
  }

  const { auth: clerkAuth } = await import("@clerk/nextjs/server");
  return clerkAuth();
}

export async function currentUser(): Promise<NormalizedUser | null> {
  if (isLocalAuth()) {
    const { auth: localAuth } = await import("@/auth");
    const session = await localAuth();
    if (!session?.user) return null;

    return {
      id: session.user.id,
      firstName: session.user.firstName ?? null,
      lastName: session.user.lastName ?? null,
      imageUrl: session.user.imageUrl ?? null,
      emailAddresses: session.user.email
        ? [{ emailAddress: session.user.email }]
        : [],
    };
  }

  const { currentUser: clerkCurrentUser } = await import(
    "@clerk/nextjs/server"
  );
  return clerkCurrentUser();
}
