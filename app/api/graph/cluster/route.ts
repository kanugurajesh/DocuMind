import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { processEntityClustering } from '@/lib/ai/entities';

// POST /api/graph/cluster - Trigger entity clustering for user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Trigger entity clustering process
    await processEntityClustering(userId);

    return NextResponse.json({
      success: true,
      message: 'Entity clustering completed successfully',
    });
  } catch (error) {
    console.error('Entity clustering error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
