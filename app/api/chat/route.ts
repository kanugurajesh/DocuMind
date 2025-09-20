import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/chat";
import { validateUserAccess, withAuth } from "@/lib/api/auth-middleware";
import {
  createForbiddenError,
  createValidationError,
  handleApiError,
} from "@/lib/api/error-handling";
import type { ChatApiResponse, ChatRequest } from "@/types";

// POST /api/chat - Generate chat response
export const POST = withAuth<ChatApiResponse>(async ({ userId, request }) => {
  try {
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.query?.trim()) {
      return createValidationError("Query is required");
    }

    // Ensure user can only query their own documents
    const accessError = validateUserAccess(body.userId, userId);
    if (accessError) {
      return createForbiddenError();
    }

    // Generate chat response
    const chatResponse = await generateChatResponse({
      query: body.query.trim(),
      userId,
      maxResults: body.maxResults || 10,
      docIds: body.docIds,
    });

    return NextResponse.json({
      success: true,
      data: chatResponse,
    } as ChatApiResponse);
  } catch (error) {
    return handleApiError(error, "Chat API");
  }
});

// GET /api/chat - Get chat history (placeholder for future implementation)
export const GET = withAuth<any>(async ({ userId: _userId }) => {
  try {
    // TODO: Implement chat history retrieval
    // For now, return empty history
    return NextResponse.json({
      success: true,
      data: {
        messages: [],
        total: 0,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get chat history");
  }
});
