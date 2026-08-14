import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/documents(.*)",
  "/api/chat(.*)",
  "/api/upload(.*)",
  "/graph(.*)",
]);

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// Built only from the Edge-safe auth.config.ts (no providers, no DB imports)
// — its authorized() callback already replicates the redirect-vs-401 split
// that auth.protect() gives Clerk above. Never import ./auth.ts here: its
// Credentials provider pulls in the mongodb driver, which breaks the Edge
// build.
const { auth: localAuthMiddleware } = NextAuth(authConfig);

export default process.env.AUTH_MODE === "local"
  ? localAuthMiddleware
  : clerkAuthMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
