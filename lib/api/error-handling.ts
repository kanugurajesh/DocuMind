import { NextResponse } from "next/server";
import type { ErrorResponse } from "@/types";

export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any,
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    } as ErrorResponse,
    { status },
  );
}

export function createValidationError(
  message: string,
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, 400);
}

export function createUnauthorizedError(): NextResponse<ErrorResponse> {
  return createErrorResponse("Unauthorized", 401);
}

export function createForbiddenError(): NextResponse<ErrorResponse> {
  return createErrorResponse("Access denied", 403);
}

export function createNotFoundError(
  resource?: string,
): NextResponse<ErrorResponse> {
  const message = resource ? `${resource} not found` : "Resource not found";
  return createErrorResponse(message, 404);
}

export function createInternalServerError(
  message?: string,
): NextResponse<ErrorResponse> {
  return createErrorResponse(message || "Internal server error", 500);
}

export function handleApiError(
  error: unknown,
  context: string,
): NextResponse<ErrorResponse> {
  console.error(`${context} error:`, error);

  if (error instanceof Error) {
    return createInternalServerError(error.message);
  }

  return createInternalServerError();
}
