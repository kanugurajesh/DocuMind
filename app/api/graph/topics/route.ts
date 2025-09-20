import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { processTopicModeling } from "@/lib/ai/topic-modeling";

// POST /api/graph/topics - Trigger topic modeling for user documents
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Trigger topic modeling process
    await processTopicModeling(userId);

    return NextResponse.json({
      success: true,
      message: "Topic modeling completed successfully",
    });
  } catch (error) {
    console.error("Topic modeling error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
