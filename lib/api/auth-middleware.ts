import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import type { ErrorResponse } from "@/types";

export interface AuthContext {
  userId: string;
  request: NextRequest;
}

export type AuthenticatedApiHandler<T = any> = (
  context: AuthContext,
) => Promise<NextResponse<T>>;

export function withAuth<T = any>(
  handler: AuthenticatedApiHandler<T>,
): (request: NextRequest) => Promise<NextResponse<T | ErrorResponse>> {
  return async (request: NextRequest) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
          } as ErrorResponse,
          { status: 401 },
        );
      }

      return handler({ userId, request });
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        } as ErrorResponse,
        { status: 500 },
      );
    }
  };
}

export function validateUserAccess(
  requestUserId: string,
  authenticatedUserId: string,
): ErrorResponse | null {
  if (requestUserId !== authenticatedUserId) {
    return {
      success: false,
      error: "Access denied",
    };
  }
  return null;
}
