import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { processDocumentSimilarity } from "@/lib/ai/document-similarity";

// POST /api/graph/similarity - Trigger document similarity analysis
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Trigger document similarity analysis
    await processDocumentSimilarity(userId);

    return NextResponse.json({
      success: true,
      message: "Document similarity analysis completed successfully",
    });
  } catch (error) {
    console.error("Document similarity analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
