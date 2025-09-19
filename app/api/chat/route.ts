import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai/chat';
import { ChatRequest, ChatApiResponse } from '@/types';

// POST /api/chat - Generate chat response
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.query?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Ensure user can only query their own documents
    if (body.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate chat response
    const chatResponse = await generateChatResponse({
      query: body.query.trim(),
      userId,
      maxResults: body.maxResults || 10,
      docIds: body.docIds,
    });

    const apiResponse: ChatApiResponse = {
      success: true,
      data: chatResponse,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    const errorResponse: ChatApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET /api/chat - Get chat history (placeholder for future implementation)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get chat history' },
      { status: 500 }
    );
  }
}