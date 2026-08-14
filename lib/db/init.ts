// Database initialization script

import { initializeBucket } from "../storage/s3";
import { ensureIndexes } from "./mongodb";
import { initializeNeo4jConstraints } from "./neo4j";
import { initializeQdrantCollection } from "./qdrant";

export async function initializeDatabases() {
  console.log("Initializing databases...");

  try {
    // Initialize MongoDB indexes
    await ensureIndexes();
    console.log("✅ MongoDB indexes created");

    // Initialize Qdrant collection
    await initializeQdrantCollection();
    console.log("✅ Qdrant collection initialized");

    // Initialize Neo4j constraints and indexes
    await initializeNeo4jConstraints();
    console.log("✅ Neo4j constraints and indexes created");

    // Initialize storage bucket (local MinIO or AWS S3, depending on STORAGE_MODE)
    await initializeBucket();
    console.log("✅ Storage bucket ready");

    console.log("🎉 All databases initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing databases:", error);
    throw error;
  }
}

// Health check for all database connections
export async function checkDatabaseHealth() {
  const status = {
    mongodb: false,
    qdrant: false,
    neo4j: false,
    s3: false,
    ai: false,
  };

  try {
    // Check MongoDB
    const { connectToDatabase } = await import("./mongodb");
    await connectToDatabase();
    status.mongodb = true;
  } catch (error) {
    console.error("MongoDB health check failed:", error);
  }

  try {
    // Check Qdrant
    const { getQdrantClient } = await import("./qdrant");
    const qdrantClient = getQdrantClient();
    await qdrantClient.getCollections();
    status.qdrant = true;
  } catch (error) {
    console.error("Qdrant health check failed:", error);
  }

  try {
    // Check Neo4j
    const { getSession } = await import("./neo4j");
    const session = getSession();
    await session.run("RETURN 1");
    await session.close();
    status.neo4j = true;
  } catch (error) {
    console.error("Neo4j health check failed:", error);
  }

  try {
    // Check storage (local MinIO or AWS S3, depending on STORAGE_MODE)
    const { getS3Client, getBucketName } = await import("../storage/s3");
    const { HeadBucketCommand } = await import("@aws-sdk/client-s3");
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    status.s3 = true;
  } catch (error) {
    console.error("Storage health check failed:", error);
  }

  try {
    // Check AI provider (local Ollama or OpenAI, depending on AI_MODE)
    const { getOpenAIClient } = await import("../ai/client");
    await getOpenAIClient().models.list();
    status.ai = true;
  } catch (error) {
    console.error("AI provider health check failed:", error);
  }

  return status;
}

export default { initializeDatabases, checkDatabaseHealth };
