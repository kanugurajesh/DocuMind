import { v4 as uuidv4 } from "uuid";
import { getDocumentsCollection } from "../db/mongodb";
import { createChunkNode, createDocumentNode } from "../db/neo4j";
import { initializeQdrantCollection, insertVectors } from "../db/qdrant";
import { generateEmbeddings } from "./embeddings";
import {
  processCrossDocumentEntityResolution,
  processDocumentEntities,
} from "./entities";
import { chunkText, extractTextFromFile, preprocessText } from "./processing";

export interface ProcessingResult {
  success: boolean;
  docId: string;
  chunksProcessed: number;
  entitiesExtracted: number;
  error?: string;
}

// Main document processing pipeline
export async function processDocument(
  docId: string,
  userId: string,
  filename: string,
  fileType: string,
): Promise<ProcessingResult> {
  console.log(`Starting processing for document: ${docId}`);

  try {
    // Update status to processing
    await updateDocumentStatus(docId, "processing");

    // Step 1: Extract text from the uploaded file
    console.log("Step 1: Extracting text...");
    const blobName = `${userId}/${docId}/${filename}`;
    const extractedContent = await extractTextFromFile(blobName, fileType);

    // Update document metadata
    await updateDocumentMetadata(docId, extractedContent.metadata);

    // Step 2: Preprocess and chunk the text
    console.log("Step 2: Chunking text...");
    const preprocessedText = preprocessText(extractedContent.text);
    const chunkSize = Number(process.env.MAX_CHUNK_SIZE) || 500;
    const chunks = chunkText(preprocessedText, chunkSize, 50);

    if (chunks.length === 0) {
      throw new Error("No text chunks generated from document");
    }

    // Step 3: Generate embeddings for all chunks
    console.log(`Step 3: Generating embeddings for ${chunks.length} chunks...`);
    const chunkTexts = chunks.map((chunk) => chunk.text);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Step 4: Prepare vector data for Qdrant
    console.log("Step 4: Preparing vector data...");
    const vectorData = chunks.map((chunk, index) => {
      // Generate a proper UUID for Qdrant point ID
      const pointId = uuidv4();

      return {
        id: pointId,
        vector: embeddings[index],
        payload: {
          pointId, // Store the UUID in payload for reference
          docId,
          userId,
          chunkId: chunk.id, // Store original chunk ID in payload
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          startPosition: chunk.startPosition,
          endPosition: chunk.endPosition,
          filename,
          createdAt: new Date().toISOString(),
        },
      };
    });

    // Step 5: Store vectors in Qdrant
    console.log("Step 5: Storing vectors in Qdrant...");
    // Ensure Qdrant collection exists before inserting vectors
    await initializeQdrantCollection();
    await insertVectors(vectorData);

    // Step 6: Create graph nodes in Neo4j
    console.log("Step 6: Creating graph structure in Neo4j...");

    // Create document node
    await createDocumentNode(docId, userId, filename);

    // Create chunk nodes and relationships
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vectorPoint = vectorData[i];

      await createChunkNode(
        vectorPoint.id, // Use the UUID point ID
        docId,
        userId,
        chunk.text,
        chunk.chunkIndex,
      );
    }

    // Step 7: Extract entities and populate knowledge graph
    console.log("Step 7: Extracting entities and relationships...");
    console.log(`📊 Processing ${chunks.length} chunks for entity extraction`);
    const chunkData = chunks.map((chunk, index) => ({
      id: vectorData[index].id, // Use the same UUID as the chunk node
      text: chunk.text,
    }));

    console.log(
      "🔍 Chunk data sample:",
      chunkData
        .slice(0, 2)
        .map((c) => ({ id: c.id, textLength: c.text.length })),
    );
    console.log("👤 User ID for entity processing:", userId);
    console.log("📄 Document ID for entity processing:", docId);

    const extractedEntities = await processDocumentEntities(
      docId,
      userId,
      chunkData,
    );
    console.log(
      `🎯 Entity extraction completed: ${extractedEntities.length} entities extracted`,
    );

    // Step 8: Process cross-document entity resolution
    console.log("Step 8: Processing cross-document entity resolution...");
    await processCrossDocumentEntityResolution(
      docId,
      userId,
      extractedEntities,
    );

    // Step 9: Update document status to completed
    console.log("Step 9: Updating document status...");
    await updateDocumentStatus(docId, "completed");

    console.log(`✅ Document processing completed successfully for ${docId}`);
    console.log(`   - Processed ${chunks.length} chunks`);
    console.log(`   - Extracted ${extractedEntities.length} entities`);

    return {
      success: true,
      docId,
      chunksProcessed: chunks.length,
      entitiesExtracted: extractedEntities.length,
    };
  } catch (error) {
    console.error(`❌ Error processing document ${docId}:`, error);

    // Update document status to failed
    await updateDocumentStatus(
      docId,
      "failed",
      error instanceof Error ? error.message : "Unknown error",
    );

    return {
      success: false,
      docId,
      chunksProcessed: 0,
      entitiesExtracted: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update document processing status
async function updateDocumentStatus(
  docId: string,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string,
) {
  try {
    const documentsCollection = await getDocumentsCollection();
    const updateData: any = {
      processingStatus: status,
      updatedAt: new Date(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    } else if (status === "completed") {
      // Clear any previous error message
      updateData.$unset = { errorMessage: 1 };
    }

    if (status === "completed" && updateData.$unset) {
      // Handle completed status with $unset separately
      const { $unset, ...setData } = updateData;
      await documentsCollection.updateOne({ docId }, { $set: setData, $unset });
    } else {
      await documentsCollection.updateOne({ docId }, { $set: updateData });
    }
  } catch (error) {
    console.error("Error updating document status:", error);
  }
}

// Update document metadata
async function updateDocumentMetadata(docId: string, metadata: any) {
  try {
    const documentsCollection = await getDocumentsCollection();
    await documentsCollection.updateOne(
      { docId },
      {
        $set: {
          metadata,
          updatedAt: new Date(),
        },
      },
    );
  } catch (error) {
    console.error("Error updating document metadata:", error);
  }
}

// Process document with background job (can be called from API)
export async function queueDocumentProcessing(
  docId: string,
  userId: string,
  filename: string,
  fileType: string,
) {
  // In a production environment, you would use a proper job queue like Bull or Agenda
  // For now, we'll process immediately in the background
  setImmediate(async () => {
    try {
      await processDocument(docId, userId, filename, fileType);
    } catch (error) {
      console.error("Background processing error:", error);
    }
  });
}

export default {
  processDocument,
  queueDocumentProcessing,
};
