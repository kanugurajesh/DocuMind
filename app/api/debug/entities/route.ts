import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { extractEntities, processChunkEntities } from '@/lib/ai/entities';
import { getUserGraphData } from '@/lib/db/neo4j';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text, testChunk = false } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug: Testing entity extraction...');
    console.log('📝 Text length:', text.length);
    console.log('👤 User ID:', userId);

    let result;

    if (testChunk) {
      // Test the full chunk processing pipeline
      console.log('🔄 Testing full chunk processing...');
      const testDocId = 'debug_test';
      const testChunkId = 'debug_chunk_1';

      result = await processChunkEntities(testChunkId, text, testDocId, userId);
      console.log('✅ Chunk processing result:', result);
    } else {
      // Test just the OpenAI extraction
      console.log('🧠 Testing OpenAI extraction only...');
      result = await extractEntities(text);
      console.log('✅ OpenAI extraction result:', result);
    }

    // Get current graph data to see if entities were created
    const graphData = await getUserGraphData(userId);

    return NextResponse.json({
      success: true,
      extractedEntities: result,
      totalEntitiesInGraph: graphData.nodes.filter(n => n.type === 'Entity').length,
      graphData: graphData
    });

  } catch (error) {
    console.error('❌ Debug entity extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current graph data
    const graphData = await getUserGraphData(userId);

    return NextResponse.json({
      success: true,
      totalNodes: graphData.nodes.length,
      totalEntities: graphData.nodes.filter(n => n.type === 'Entity').length,
      totalDocuments: graphData.nodes.filter(n => n.type === 'Document').length,
      totalChunks: graphData.nodes.filter(n => n.type === 'Chunk').length,
      entities: graphData.nodes.filter(n => n.type === 'Entity').map(e => ({
        id: e.id,
        name: e.label,
        category: e.category
      }))
    });

  } catch (error) {
    console.error('❌ Debug get entities error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}