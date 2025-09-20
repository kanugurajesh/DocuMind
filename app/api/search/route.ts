import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { performDocumentSearch } from "@/lib/ai/chat";
import type { SearchApiResponse, SearchRequest } from "@/types";

// POST /api/search - Search documents
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: SearchRequest = await request.json();

    // Validate request
    if (!body.query?.trim()) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 },
      );
    }

    // Ensure user can only search their own documents
    if (body.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Perform document search
    const searchResults = await performDocumentSearch({
      query: body.query.trim(),
      userId,
      maxResults: body.limit || 20,
      minScore: body.minScore || 0.2,
      docIds: body.docIds,
    });

    const apiResponse: SearchApiResponse = {
      success: true,
      results: searchResults,
      total: searchResults.length,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Search API error:", error);

    const errorResponse: SearchApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET /api/search - Get search suggestions (placeholder for future implementation)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    // TODO: Implement search suggestions based on document content
    // For now, return empty suggestions
    return NextResponse.json({
      success: true,
      suggestions: [],
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get search suggestions" },
      { status: 500 },
    );
  }
}
