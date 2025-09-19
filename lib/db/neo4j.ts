import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME!,
        process.env.NEO4J_PASSWORD!
      )
    );
  }

  return driver;
}

export function getSession(): Session {
  const driver = getNeo4jDriver();
  return driver.session();
}

// Initialize Neo4j constraints and indexes
export async function initializeNeo4jConstraints() {
  const session = getSession();

  try {
    // Create constraints for unique identifiers
    const constraints = [
      'CREATE CONSTRAINT document_docid_userid IF NOT EXISTS FOR (d:Document) REQUIRE (d.docId, d.userId) IS UNIQUE',
      'CREATE CONSTRAINT chunk_chunkid_userid IF NOT EXISTS FOR (c:Chunk) REQUIRE (c.chunkId, c.userId) IS UNIQUE',
      'CREATE CONSTRAINT entity_entityid_userid IF NOT EXISTS FOR (e:Entity) REQUIRE (e.entityId, e.userId) IS UNIQUE',
    ];

    for (const constraint of constraints) {
      await session.run(constraint);
    }

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX document_userid IF NOT EXISTS FOR (d:Document) ON (d.userId)',
      'CREATE INDEX chunk_userid IF NOT EXISTS FOR (c:Chunk) ON (c.userId)',
      'CREATE INDEX entity_userid IF NOT EXISTS FOR (e:Entity) ON (e.userId)',
      'CREATE INDEX entity_category IF NOT EXISTS FOR (e:Entity) ON (e.category)',
    ];

    for (const index of indexes) {
      await session.run(index);
    }

    console.log('Neo4j constraints and indexes initialized');
  } catch (error) {
    console.error('Error initializing Neo4j constraints:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create document node
export async function createDocumentNode(docId: string, userId: string, filename: string) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MERGE (d:Document {docId: $docId, userId: $userId})
      SET d.filename = $filename, d.createdAt = datetime()
      RETURN d
      `,
      { docId, userId, filename }
    );

    return result.records[0]?.get('d');
  } catch (error) {
    console.error('Error creating document node:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create chunk node and link to document
export async function createChunkNode(
  chunkId: string,
  docId: string,
  userId: string,
  text: string,
  chunkIndex: number
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (d:Document {docId: $docId, userId: $userId})
      CREATE (c:Chunk {chunkId: $chunkId, userId: $userId, text: $text, chunkIndex: $chunkIndex, createdAt: datetime()})
      CREATE (d)-[:CONTAINS]->(c)
      RETURN c
      `,
      { chunkId, docId, userId, text, chunkIndex }
    );

    return result.records[0]?.get('c');
  } catch (error) {
    console.error('Error creating chunk node:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create entity node and link to chunk
export async function createEntityNode(
  entityId: string,
  chunkId: string,
  userId: string,
  name: string,
  category: string,
  confidence: number
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Chunk {chunkId: $chunkId, userId: $userId})
      MERGE (e:Entity {entityId: $entityId, userId: $userId})
      SET e.name = $name, e.category = $category, e.confidence = $confidence, e.updatedAt = datetime()
      MERGE (c)-[:MENTIONS]->(e)
      RETURN e
      `,
      { entityId, chunkId, userId, name, category, confidence }
    );

    return result.records[0]?.get('e');
  } catch (error) {
    console.error('Error creating entity node:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Get user's graph data for visualization
export async function getUserGraphData(userId: string, docIds?: string[]) {
  const session = getSession();

  try {
    let query = `
      MATCH (d:Document {userId: $userId})
      OPTIONAL MATCH (d)-[:CONTAINS]->(c:Chunk {userId: $userId})
      OPTIONAL MATCH (c)-[:MENTIONS]->(e:Entity {userId: $userId})
    `;

    const params: any = { userId };

    if (docIds && docIds.length > 0) {
      query += ` WHERE d.docId IN $docIds`;
      params.docIds = docIds;
    }

    query += `
      RETURN d, c, e,
             [(d)-[:CONTAINS]->(c) | {type: 'CONTAINS', start: d.docId, end: c.chunkId}] as containsRels,
             [(c)-[:MENTIONS]->(e) | {type: 'MENTIONS', start: c.chunkId, end: e.entityId}] as mentionsRels
    `;

    const result = await session.run(query, params);

    const nodes = new Map();
    const edges = new Set();

    result.records.forEach(record => {
      const document = record.get('d');
      const chunk = record.get('c');
      const entity = record.get('e');

      // Add nodes
      if (document) {
        nodes.set(document.properties.docId, {
          id: document.properties.docId,
          type: 'Document',
          ...document.properties,
        });
      }

      if (chunk) {
        nodes.set(chunk.properties.chunkId, {
          id: chunk.properties.chunkId,
          type: 'Chunk',
          ...chunk.properties,
        });
      }

      if (entity) {
        nodes.set(entity.properties.entityId, {
          id: entity.properties.entityId,
          type: 'Entity',
          ...entity.properties,
        });
      }

      // Add edges
      const containsRels = record.get('containsRels') || [];
      const mentionsRels = record.get('mentionsRels') || [];

      containsRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      mentionsRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges).map(edge => JSON.parse(edge as string)),
    };
  } catch (error) {
    console.error('Error getting user graph data:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Delete document and all related nodes
export async function deleteDocumentGraph(docId: string, userId: string) {
  const session = getSession();

  try {
    await session.run(
      `
      MATCH (d:Document {docId: $docId, userId: $userId})
      DETACH DELETE d
      `,
      { docId, userId }
    );

    // Clean up orphaned chunks and entities
    await session.run(
      `
      MATCH (c:Chunk {userId: $userId})
      WHERE NOT ()-[:CONTAINS]->(c)
      DETACH DELETE c
      `,
      { userId }
    );

    await session.run(
      `
      MATCH (e:Entity {userId: $userId})
      WHERE NOT ()-[:MENTIONS]->(e)
      DELETE e
      `,
      { userId }
    );
  } catch (error) {
    console.error('Error deleting document graph:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Close driver connection
export async function closeNeo4jConnection() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export default {
  getNeo4jDriver,
  getSession,
  initializeNeo4jConstraints,
  createDocumentNode,
  createChunkNode,
  createEntityNode,
  getUserGraphData,
  deleteDocumentGraph,
  closeNeo4jConnection,
};