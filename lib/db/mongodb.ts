import { type Db, MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the value is preserved across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI!);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(process.env.MONGODB_URI!);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  return { client, db };
}

export async function getDocumentsCollection() {
  const { db } = await connectToDatabase();
  return db.collection("documents");
}

export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection("users");
}

// Helper function to ensure indexes are created
export async function ensureIndexes() {
  const documentsCollection = await getDocumentsCollection();

  // Create indexes for efficient queries
  await documentsCollection.createIndex({ userId: 1 });
  await documentsCollection.createIndex({ docId: 1 });
  await documentsCollection.createIndex({ userId: 1, uploadedAt: -1 });
  await documentsCollection.createIndex({ processingStatus: 1 });

  console.log("MongoDB indexes ensured");
}

export default clientPromise;
