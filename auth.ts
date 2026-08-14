import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { getUsersCollection } from "./lib/db/mongodb";

// Node runtime only (Credentials provider needs bcrypt + MongoDB) — never
// import this from middleware.ts, which runs on the Edge runtime.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const usersCollection = await getUsersCollection();
        const userDoc = await usersCollection.findOne({
          email: email.toLowerCase(),
        });

        if (!userDoc?.passwordHash) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          userDoc.passwordHash,
        );
        if (!passwordMatches) {
          return null;
        }

        return {
          id: userDoc._id!.toString(),
          email: userDoc.email,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          imageUrl: userDoc.imageUrl ?? null,
        };
      },
    }),
  ],
});
