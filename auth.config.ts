import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no providers, no DB imports. middleware.ts (Edge runtime)
// must only ever import this file, never ./auth.ts — the mongodb driver used
// by the Credentials provider's authorize() relies on Node builtins that
// Next's Edge bundler rejects at build time.

const protectedPageRoutes = ["/dashboard", "/graph"];
const protectedApiRoutes = ["/api/documents", "/api/chat", "/api/upload"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // populated in auth.ts (Node runtime) with the Credentials provider
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (matchesRoute(pathname, protectedApiRoutes)) {
        if (isLoggedIn) return true;
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      if (matchesRoute(pathname, protectedPageRoutes)) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      // user is only present on the initial sign-in call; explicitly copy
      // everything onto the token rather than relying on default propagation,
      // since this callback fully replaces Auth.js's built-in jwt callback.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.imageUrl = user.imageUrl;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.imageUrl = token.imageUrl as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
