import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createEntityNode, createChunkNode, getUserGraphData } from '@/lib/db/neo4j';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    console.log('🔧 Neo4j Debug Test:', action);
    console.log('👤 User ID:', userId);

    let result;

    if (action === 'test_chunk_creation') {
      // Test creating a chunk node
      const testDocId = 'debug_doc_test';
      const testChunkId = 'debug_chunk_test';

      console.log('📝 Creating test chunk...');
      result = await createChunkNode(
        testChunkId,
        testDocId,
        userId,
        'This is a test chunk for debugging.',
        0,
        100,
        1
      );
      console.log('✅ Chunk creation result:', result);

    } else if (action === 'test_entity_creation') {
      // First create a chunk, then try to create an entity
      const testDocId = 'debug_doc_test';
      const testChunkId = 'debug_chunk_test';
      const testEntityId = 'debug_entity_test';

      console.log('📝 Creating test chunk first...');
      await createChunkNode(
        testChunkId,
        testDocId,
        userId,
        'This is a test chunk for entity testing.',
        0,
        100,
        1
      );

      console.log('🏗️ Creating test entity...');
      result = await createEntityNode(
        testEntityId,
        testChunkId,
        userId,
        'Test Entity',
        'ORGANIZATION',
        0.95
      );
      console.log('✅ Entity creation result:', result);

    } else if (action === 'check_existing_chunks') {
      // Check what chunks exist for this user
      const graphData = await getUserGraphData(userId);
      result = {
        totalNodes: graphData.nodes.length,
        chunks: graphData.nodes.filter(n => n.type === 'Chunk'),
        entities: graphData.nodes.filter(n => n.type === 'Entity'),
        documents: graphData.nodes.filter(n => n.type === 'Document')
      };
      console.log('📊 Existing data:', result);
    }

    // Get final graph state
    const finalGraphData = await getUserGraphData(userId);

    return NextResponse.json({
      success: true,
      action,
      result,
      finalGraphData: {
        totalNodes: finalGraphData.nodes.length,
        totalEntities: finalGraphData.nodes.filter(n => n.type === 'Entity').length,
        totalChunks: finalGraphData.nodes.filter(n => n.type === 'Chunk').length,
        totalDocuments: finalGraphData.nodes.filter(n => n.type === 'Document').length,
      }
    });

  } catch (error) {
    console.error('❌ Neo4j debug error:', error);
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