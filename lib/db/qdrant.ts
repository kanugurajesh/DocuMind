import { QdrantClient } from '@qdrant/js-client-rest';

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    const config: any = {
      url: process.env.QDRANT_URL!,
    };

    if (process.env.QDRANT_API_KEY) {
      config.apiKey = process.env.QDRANT_API_KEY;
    }

    client = new QdrantClient(config);
  }

  return client;
}

// Collection name for document chunks
export const COLLECTION_NAME = 'documind_chunks';

// Initialize collection with proper configuration
export async function initializeQdrantCollection() {
  const client = getQdrantClient();
  const embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS) || 1536;

  try {
    // Check if collection exists
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      // Create collection
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: embeddingDimensions,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for efficient filtering
      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'userId',
        field_schema: 'keyword',
      });

      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'docId',
        field_schema: 'keyword',
      });

      console.log('Qdrant collection initialized');
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error);
    throw error;
  }
}

// Search vectors with user filtering
export async function searchVectors(
  queryVector: number[],
  userId: string,
  limit: number = 10,
  scoreThreshold: number = 0.7,
  docIds?: string[]
) {
  const client = getQdrantClient();

  const filter: any = {
    must: [
      {
        key: 'userId',
        match: {
          value: userId,
        },
      },
    ],
  };

  // Add document filtering if specified
  if (docIds && docIds.length > 0) {
    filter.must.push({
      key: 'docId',
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
    console.error('Error searching vectors:', error);
    throw error;
  }
}

// Insert vectors with user and document metadata
export async function insertVectors(vectors: any[]) {
  const client = getQdrantClient();

  try {
    const response = await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: vectors,
    });

    return response;
  } catch (error) {
    console.error('Error inserting vectors:', error);
    throw error;
  }
}

// Delete vectors by document ID
export async function deleteVectorsByDocId(docId: string, userId: string) {
  const client = getQdrantClient();

  try {
    const response = await client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'docId',
            match: {
              value: docId,
            },
          },
          {
            key: 'userId',
            match: {
              value: userId,
            },
          },
        ],
      },
    });

    return response;
  } catch (error) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
}

export default { getQdrantClient, initializeQdrantCollection, searchVectors, insertVectors, deleteVectorsByDocId };