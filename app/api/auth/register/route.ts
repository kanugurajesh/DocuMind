import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db/mongodb";
import type { ErrorResponse } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-up endpoint for AUTH_MODE=local only — Clerk handles sign-up in cloud mode.
export async function POST(request: NextRequest) {
  if (process.env.AUTH_MODE !== "local") {
    return NextResponse.json(
      {
        success: false,
        error: "Local registration is disabled",
      } as ErrorResponse,
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : undefined;
    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : undefined;

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid email address",
        } as ErrorResponse,
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        } as ErrorResponse,
        { status: 400 },
      );
    }

    const usersCollection = await getUsersCollection();
    // Idempotent — cheap no-op once the index already exists. ensureIndexes()
    // in lib/db/init.ts isn't wired up to run automatically, so this is the
    // only place this index is guaranteed to get created.
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      email,
      passwordHash,
      firstName,
      lastName,
      imageUrl: null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists",
        } as ErrorResponse,
        { status: 409 },
      );
    }

    console.error("Error registering local user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ErrorResponse,
      { status: 500 },
    );
  }
}
