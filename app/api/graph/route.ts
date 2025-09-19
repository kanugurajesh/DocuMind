import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserGraphData } from '@/lib/db/neo4j';
import { GraphRequest, GraphApiResponse } from '@/types';

// GET /api/graph - Get user's graph data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const docIdsParam = searchParams.get('docIds');
    const entityTypesParam = searchParams.get('entityTypes');
    const maxNodesParam = searchParams.get('maxNodes');

    // Parse query parameters
    const docIds = docIdsParam ? docIdsParam.split(',').filter(Boolean) : undefined;
    const entityTypes = entityTypesParam ? entityTypesParam.split(',').filter(Boolean) : undefined;
    const maxNodes = maxNodesParam ? parseInt(maxNodesParam, 10) : undefined;

    // Get graph data from Neo4j
    const graphData = await getUserGraphData(userId, docIds);

    // Apply filtering and limits
    let filteredNodes = graphData.nodes;
    let filteredEdges = graphData.edges;

    // Filter by entity types if specified
    if (entityTypes && entityTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => {
        if (node.type === 'Entity') {
          return entityTypes.includes((node as any).category);
        }
        return true; // Keep non-entity nodes
      });

      // Update edges to only include those connecting remaining nodes
      const nodeIds = new Set(filteredNodes.map(node => node.id));
      filteredEdges = filteredEdges.filter(edge =>
        nodeIds.has(edge.startNodeId) && nodeIds.has(edge.endNodeId)
      );
    }

    // Apply node limit
    if (maxNodes && filteredNodes.length > maxNodes) {
      // Prioritize document and entity nodes, then chunks
      const prioritized = [
        ...filteredNodes.filter(node => node.type === 'Document'),
        ...filteredNodes.filter(node => node.type === 'Entity'),
        ...filteredNodes.filter(node => node.type === 'Chunk'),
      ].slice(0, maxNodes);

      filteredNodes = prioritized;

      // Update edges again
      const nodeIds = new Set(filteredNodes.map(node => node.id));
      filteredEdges = filteredEdges.filter(edge =>
        nodeIds.has(edge.startNodeId) && nodeIds.has(edge.endNodeId)
      );
    }

    const response: GraphApiResponse = {
      success: true,
      data: {
        nodes: filteredNodes,
        edges: filteredEdges,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Graph API error:', error);

    const errorResponse: GraphApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/graph - Search graph (future implementation)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement graph search functionality
    // This could allow searching for specific entities or relationships

    return NextResponse.json({
      success: false,
      error: 'Graph search not yet implemented',
    }, { status: 501 });
  } catch (error) {
    console.error('Graph search error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}