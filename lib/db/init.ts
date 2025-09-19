// Database initialization script
import { ensureIndexes } from './mongodb';
import { initializeQdrantCollection } from './qdrant';
import { initializeNeo4jConstraints } from './neo4j';
import { initializeBucket } from '../storage/s3';

export async function initializeDatabases() {
  console.log('Initializing databases...');

  try {
    // Initialize MongoDB indexes
    await ensureIndexes();
    console.log('✅ MongoDB indexes created');

    // Initialize Qdrant collection
    await initializeQdrantCollection();
    console.log('✅ Qdrant collection initialized');

    // Initialize Neo4j constraints and indexes
    await initializeNeo4jConstraints();
    console.log('✅ Neo4j constraints and indexes created');

    // Initialize AWS S3 bucket
    await initializeBucket();
    console.log('✅ AWS S3 bucket ready');

    console.log('🎉 All databases initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing databases:', error);
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
  };

  try {
    // Check MongoDB
    const { connectToDatabase } = await import('./mongodb');
    await connectToDatabase();
    status.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    // Check Qdrant
    const { getQdrantClient } = await import('./qdrant');
    const qdrantClient = getQdrantClient();
    await qdrantClient.getCollections();
    status.qdrant = true;
  } catch (error) {
    console.error('Qdrant health check failed:', error);
  }

  try {
    // Check Neo4j
    const { getSession } = await import('./neo4j');
    const session = getSession();
    await session.run('RETURN 1');
    await session.close();
    status.neo4j = true;
  } catch (error) {
    console.error('Neo4j health check failed:', error);
  }

  try {
    // Check S3
    const { getS3Client, getBucketName } = await import('../storage/s3');
    const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    status.s3 = true;
  } catch (error) {
    console.error('S3 health check failed:', error);
  }

  return status;
}

export default { initializeDatabases, checkDatabaseHealth };