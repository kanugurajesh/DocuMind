import { type Db, MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getMongoUri(): string {
  const mode = process.env.MONGODB_MODE === "local" ? "local" : "cloud";

  if (mode === "local") {
    return process.env.MONGODB_LOCAL_URI ?? "mongodb://localhost:27017/documind";
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set (required for cloud mode)");
  }
  return uri;
}

const mongoUri = getMongoUri();

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the value is preserved across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(mongoUri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(mongoUri);
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
