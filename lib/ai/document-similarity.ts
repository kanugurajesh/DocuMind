import {
  createDocumentSimilarityRelationship,
  getUserDocuments,
} from "../db/neo4j";
import { searchVectors } from "../db/qdrant";
import { generateEmbedding, generateEmbeddings } from "./embeddings";

// Calculate cosine similarity between two vectors
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Process document similarity analysis for a user
export async function processDocumentSimilarity(userId: string): Promise<void> {
  try {
    console.log("Processing document similarity analysis...");

    // Get all user documents
    const documents = await getUserDocuments(userId);

    if (documents.length < 2) {
      console.log("Not enough documents for similarity analysis");
      return;
    }

    // Calculate document embeddings by averaging chunk embeddings
    const documentEmbeddings = new Map<string, number[]>();

    for (const doc of documents) {
      try {
        const embedding = await getDocumentEmbedding(doc.docId, userId);
        if (embedding) {
          documentEmbeddings.set(doc.docId, embedding);
        }
      } catch (error) {
        console.error(
          `Error getting embedding for document ${doc.docId}:`,
          error,
        );
      }
    }

    // Calculate similarities between all document pairs
    const processedPairs = new Set<string>();

    for (const [docId1, embedding1] of documentEmbeddings) {
      for (const [docId2, embedding2] of documentEmbeddings) {
        if (docId1 === docId2) continue;

        // Create a unique pair identifier to avoid duplicate processing
        const pairId = [docId1, docId2].sort().join("-");
        if (processedPairs.has(pairId)) continue;
        processedPairs.add(pairId);

        try {
          const similarity = cosineSimilarity(embedding1, embedding2);

          // Only create relationships for significantly similar documents
          if (similarity > 0.3) {
            await createDocumentSimilarityRelationship(
              docId1,
              docId2,
              userId,
              similarity,
            );

            console.log(
              `Created similarity relationship between ${docId1} and ${docId2}: ${similarity.toFixed(3)}`,
            );
          }
        } catch (error) {
          console.error(
            `Error calculating similarity between ${docId1} and ${docId2}:`,
            error,
          );
        }
      }
    }

    console.log(
      `Document similarity analysis completed for ${documents.length} documents`,
    );
  } catch (error) {
    console.error("Error processing document similarity:", error);
  }
}

// Get document embedding by averaging all chunk embeddings
async function getDocumentEmbedding(
  docId: string,
  userId: string,
): Promise<number[] | null> {
  try {
    // Search for document chunks using a dummy query to get all chunks
    const results = await searchVectors(
      new Array(1536).fill(0), // Dummy embedding
      userId,
      1000, // limit
      0, // scoreThreshold
      [docId], // docIds
    );

    if (results.length === 0) {
      return null;
    }

    // Get embeddings from Qdrant for the chunks
    const chunkEmbeddings: number[][] = [];

    // Since we can't directly get embeddings from Qdrant results,
    // we'll generate them from the text chunks
    for (const result of results) {
      try {
        const embedding = await generateEmbedding((result.payload as any)?.text || "");
        chunkEmbeddings.push(embedding);
      } catch (error) {
        console.error(
          `Error generating embedding for chunk ${result.id}:`,
          error,
        );
      }
    }

    if (chunkEmbeddings.length === 0) {
      return null;
    }

    // Calculate average embedding
    const avgEmbedding = new Array(chunkEmbeddings[0].length).fill(0);

    for (const embedding of chunkEmbeddings) {
      for (let i = 0; i < embedding.length; i++) {
        avgEmbedding[i] += embedding[i];
      }
    }

    for (let i = 0; i < avgEmbedding.length; i++) {
      avgEmbedding[i] /= chunkEmbeddings.length;
    }

    return avgEmbedding;
  } catch (error) {
    console.error(`Error getting document embedding for ${docId}:`, error);
    return null;
  }
}

// Calculate document similarity based on shared entities
export async function calculateEntityBasedSimilarity(
  _docId1: string,
  _docId2: string,
  _userId: string,
): Promise<number> {
  try {
    // This is a placeholder for entity-based similarity calculation
    // It would compare the entities extracted from both documents
    // and calculate similarity based on shared entities

    // For now, return a default similarity
    return 0;
  } catch (error) {
    console.error("Error calculating entity-based similarity:", error);
    return 0;
  }
}

// Create thematic document clusters based on similarity
export async function createDocumentClusters(
  userId: string,
  _similarityThreshold: number = 0.7,
): Promise<void> {
  try {
    console.log("Creating document clusters...");

    const documents = await getUserDocuments(userId);
    const clusters: string[][] = [];
    const processed = new Set<string>();

    for (const doc of documents) {
      if (processed.has(doc.docId)) continue;

      const cluster = [doc.docId];
      processed.add(doc.docId);

      // Find similar documents to add to this cluster
      for (const otherDoc of documents) {
        if (processed.has(otherDoc.docId)) continue;

        // Check if documents are similar enough to be in the same cluster
        // This would require querying the similarity relationships created earlier
        // For now, we'll use a simple implementation
      }

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    console.log(`Created ${clusters.length} document clusters`);
  } catch (error) {
    console.error("Error creating document clusters:", error);
  }
}

export default {
  processDocumentSimilarity,
  calculateEntityBasedSimilarity,
  createDocumentClusters,
};
