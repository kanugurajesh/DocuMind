import { QdrantClient } from "@qdrant/js-client-rest";

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    const mode = process.env.QDRANT_MODE ?? "cloud";

    if (mode === "local") {
      console.log("🔗 [Qdrant] Mode: LOCAL — connecting to http://localhost:6333");
      client = new QdrantClient({ url: "http://localhost:6333" });
    } else {
      const qdrantUrl = process.env.QDRANT_URL;
      if (!qdrantUrl) {
        throw new Error("QDRANT_URL environment variable is not set (required for cloud mode)");
      }
      console.log(`🔗 [Qdrant] Mode: CLOUD — connecting to ${qdrantUrl}`);
      const config: any = { url: qdrantUrl };
      if (process.env.QDRANT_API_KEY) {
        config.apiKey = process.env.QDRANT_API_KEY;
        console.log("🔑 [Qdrant] API key loaded for authentication");
      }
      client = new QdrantClient(config);
    }

    console.log("✅ [Qdrant] Client initialized successfully");
  }

  return client;
}

// Health check function to test Qdrant connectivity
export async function testQdrantConnection(): Promise<boolean> {
  try {
    console.log("🏥 Testing Qdrant connection...");
    const client = getQdrantClient();

    // Try to get collections (lightweight operation)
    const collections = await client.getCollections();
    console.log("✅ Qdrant connection successful:", collections.collections?.length || 0, "collections");
    return true;
  } catch (error) {
    console.error("❌ Qdrant connection failed:", error);

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.error("🌐 DNS resolution failed - check if Qdrant instance exists");
      } else if (error.message.includes('fetch failed')) {
        console.error("🔌 Network connection failed - check internet connectivity");
      }
    }

    return false;
  }
}

// Collection name for document chunks
export const COLLECTION_NAME = "documind_chunks";

// Initialize collection with proper configuration
export async function initializeQdrantCollection() {
  const client = getQdrantClient();
  const embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;

  try {
    // Check if collection exists
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME,
    );

    if (!collectionExists) {
      // Create collection
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: embeddingDimensions,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for efficient filtering
      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword",
      });

      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: "docId",
        field_schema: "keyword",
      });

      console.log("Qdrant collection initialized");
    }
  } catch (error) {
    console.error("Error initializing Qdrant collection:", error);
    throw error;
  }
}

// Search vectors with user filtering
export async function searchVectors(
  queryVector: number[],
  userId: string,
  limit: number = 10,
  scoreThreshold: number = 0.7,
  docIds?: string[],
) {
  const client = getQdrantClient();

  const filter: any = {
    must: [
      {
        key: "userId",
        match: {
          value: userId,
        },
      },
    ],
  };

  // Add document filtering if specified
  if (docIds && docIds.length > 0) {
    filter.must.push({
      key: "docId",
      match: {
        any: docIds,
      },
    });
  }

  try {
    const response = await client.search(COLLECTION_NAME, {
      vector: queryVector,
      limit,
      score_threshold: scoreThreshold,
      filter,
      with_payload: true,
    });

    return response;
  } catch (error) {
    console.error("Error searching vectors:", error);
    throw error;
  }
}

// Insert vectors with user and document metadata
export async function insertVectors(vectors: any[]) {
  const client = getQdrantClient();

  try {
    // Log vector data structure for debugging
    console.log("Inserting vectors:", {
      count: vectors.length,
      sampleVector: vectors[0]
        ? {
            id: vectors[0].id,
            vectorLength: vectors[0].vector?.length,
            payloadKeys: Object.keys(vectors[0].payload || {}),
          }
        : "No vectors to insert",
    });

    // Validate vector format
    for (const vector of vectors) {
      if (!vector.id) {
        throw new Error("Vector missing required id field");
      }
      if (!vector.vector || !Array.isArray(vector.vector)) {
        throw new Error(`Vector ${vector.id} missing or invalid vector field`);
      }
      if (vector.vector.length === 0) {
        throw new Error(`Vector ${vector.id} has empty vector array`);
      }
    }

    const response = await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: vectors,
    });

    console.log("Successfully inserted vectors:", response);
    return response;
  } catch (error) {
    console.error("Error inserting vectors:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      status: (error as any)?.status,
      data: (error as any)?.data,
    });
    throw error;
  }
}

// Delete vectors by document ID
export async function deleteVectorsByDocId(docId: string, userId: string) {
  try {
    console.log(`🗑️ Attempting to delete vectors for document: ${docId}, user: ${userId}`);

    const client = getQdrantClient();

    const response = await client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "docId",
            match: {
              value: docId,
            },
          },
          {
            key: "userId",
            match: {
              value: userId,
            },
          },
        ],
      },
    });

    console.log("✅ Successfully deleted vectors for document:", docId);
    return response;
  } catch (error) {
    console.error(`❌ Error deleting vectors for document ${docId}:`, error);

    if (error instanceof Error) {
      // Collection doesn't exist yet — nothing to delete, treat as success
      if ((error as any)?.status === 404 || error.message === 'Not Found') {
        console.warn("⚠️ Qdrant collection not found, skipping deletion (no vectors exist yet)");
        return { status: 'skipped', reason: 'collection_not_found' };
      }
      // Connection errors — degrade gracefully
      if (error.message.includes('ENOTFOUND') || error.message.includes('fetch failed')) {
        console.error("🌐 Qdrant connection failed - instance may be unreachable");
        console.warn("⚠️ Skipping vector deletion due to connection issues");
        return { status: 'skipped', reason: 'connection_failed' };
      }
    }

    throw error;
  }
}

export default {
  getQdrantClient,
  initializeQdrantCollection,
  searchVectors,
  insertVectors,
  deleteVectorsByDocId,
};
