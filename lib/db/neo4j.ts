import neo4j, { type Driver, type Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME!,
        process.env.NEO4J_PASSWORD!,
      ),
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
      "CREATE CONSTRAINT document_docid_userid IF NOT EXISTS FOR (d:Document) REQUIRE (d.docId, d.userId) IS UNIQUE",
      "CREATE CONSTRAINT chunk_chunkid_userid IF NOT EXISTS FOR (c:Chunk) REQUIRE (c.chunkId, c.userId) IS UNIQUE",
      "CREATE CONSTRAINT entity_entityid_userid IF NOT EXISTS FOR (e:Entity) REQUIRE (e.entityId, e.userId) IS UNIQUE",
    ];

    for (const constraint of constraints) {
      await session.run(constraint);
    }

    // Create indexes for performance
    const indexes = [
      "CREATE INDEX document_userid IF NOT EXISTS FOR (d:Document) ON (d.userId)",
      "CREATE INDEX chunk_userid IF NOT EXISTS FOR (c:Chunk) ON (c.userId)",
      "CREATE INDEX entity_userid IF NOT EXISTS FOR (e:Entity) ON (e.userId)",
      "CREATE INDEX entity_category IF NOT EXISTS FOR (e:Entity) ON (e.category)",
    ];

    for (const index of indexes) {
      await session.run(index);
    }

    console.log("Neo4j constraints and indexes initialized");
  } catch (error) {
    console.error("Error initializing Neo4j constraints:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create document node
export async function createDocumentNode(
  docId: string,
  userId: string,
  filename: string,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MERGE (d:Document {docId: $docId, userId: $userId})
      SET d.filename = $filename, d.createdAt = datetime()
      RETURN d
      `,
      { docId, userId, filename },
    );

    return result.records[0]?.get("d");
  } catch (error) {
    console.error("Error creating document node:", error);
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
  chunkIndex: number,
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
      { chunkId, docId, userId, text, chunkIndex },
    );

    return result.records[0]?.get("c");
  } catch (error) {
    console.error("Error creating chunk node:", error);
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
  confidence: number,
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
      { entityId, chunkId, userId, name, category, confidence },
    );

    return result.records[0]?.get("e");
  } catch (error) {
    console.error("Error creating entity node:", error);
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
      OPTIONAL MATCH (t:Topic {userId: $userId})-[:CATEGORIZES]->(d)
    `;

    const params: any = { userId };

    if (docIds && docIds.length > 0) {
      query += ` WHERE d.docId IN $docIds`;
      params.docIds = docIds;
    }

    query += `
      RETURN d, c, e, t,
             [(d)-[:CONTAINS]->(c) | {type: 'CONTAINS', startNodeId: d.docId, endNodeId: c.chunkId}] as containsRels,
             [(c)-[:MENTIONS]->(e) | {type: 'MENTIONS', startNodeId: c.chunkId, endNodeId: e.entityId}] as mentionsRels,
             [(e)-[r:COOCCURS_WITH]-(e2:Entity {userId: $userId}) WHERE r.confidence > 0.3 | {type: 'COOCCURS_WITH', startNodeId: e.entityId, endNodeId: e2.entityId, confidence: r.confidence, count: r.count}] as cooccurrenceRels,
             [(e)-[r:SIMILAR_TO]-(e2:Entity {userId: $userId}) WHERE r.similarity > 0.5 | {type: 'SIMILAR_TO', startNodeId: e.entityId, endNodeId: e2.entityId, similarity: r.similarity}] as similarityRels,
             [(e)-[r:SAME_AS]->(e2:Entity {userId: $userId}) | {type: 'SAME_AS', startNodeId: e.entityId, endNodeId: e2.entityId, confidence: r.confidence}] as sameAsRels,
             [(d)-[r:SIMILAR_TO]-(d2:Document {userId: $userId}) | {type: 'DOCUMENT_SIMILAR_TO', startNodeId: d.docId, endNodeId: d2.docId, similarity: r.similarity}] as docSimilarityRels,
             [(t)-[r:CATEGORIZES]->(d) | {type: 'CATEGORIZES', startNodeId: t.topicId, endNodeId: d.docId, relevance: r.relevance}] as topicRels
    `;

    const result = await session.run(query, params);

    const nodes = new Map();
    const edges = new Set();

    result.records.forEach((record) => {
      const document = record.get("d");
      const chunk = record.get("c");
      const entity = record.get("e");
      const topic = record.get("t");

      // Add nodes
      if (document) {
        nodes.set(document.properties.docId, {
          id: document.properties.docId,
          type: "Document",
          ...document.properties,
        });
      }

      if (chunk) {
        nodes.set(chunk.properties.chunkId, {
          id: chunk.properties.chunkId,
          type: "Chunk",
          ...chunk.properties,
        });
      }

      if (entity) {
        nodes.set(entity.properties.entityId, {
          id: entity.properties.entityId,
          type: "Entity",
          ...entity.properties,
        });
      }

      if (topic) {
        nodes.set(topic.properties.topicId, {
          id: topic.properties.topicId,
          type: "Topic",
          ...topic.properties,
        });
      }

      // Add edges
      const containsRels = record.get("containsRels") || [];
      const mentionsRels = record.get("mentionsRels") || [];
      const cooccurrenceRels = record.get("cooccurrenceRels") || [];
      const similarityRels = record.get("similarityRels") || [];
      const sameAsRels = record.get("sameAsRels") || [];
      const docSimilarityRels = record.get("docSimilarityRels") || [];
      const topicRels = record.get("topicRels") || [];

      containsRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      mentionsRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      cooccurrenceRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      similarityRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      sameAsRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      docSimilarityRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });

      topicRels.forEach((rel: any) => {
        edges.add(JSON.stringify(rel));
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges).map((edge) => JSON.parse(edge as string)),
    };
  } catch (error) {
    console.error("Error getting user graph data:", error);
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
      { docId, userId },
    );

    // Clean up orphaned chunks and entities
    await session.run(
      `
      MATCH (c:Chunk {userId: $userId})
      WHERE NOT ()-[:CONTAINS]->(c)
      DETACH DELETE c
      `,
      { userId },
    );

    await session.run(
      `
      MATCH (e:Entity {userId: $userId})
      WHERE NOT ()-[:MENTIONS]->(e)
      DETACH DELETE e
      `,
      { userId },
    );
  } catch (error) {
    console.error("Error deleting document graph:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create entity co-occurrence relationship
export async function createEntityCooccurrenceRelationship(
  sourceEntityId: string,
  targetEntityId: string,
  userId: string,
  confidence: number,
  cooccurrenceCount: number = 1,
  context?: string,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (e1:Entity {entityId: $sourceEntityId, userId: $userId})
      MATCH (e2:Entity {entityId: $targetEntityId, userId: $userId})
      WHERE e1 <> e2
      MERGE (e1)-[r:COOCCURS_WITH]-(e2)
      SET r.confidence = $confidence,
          r.count = COALESCE(r.count, 0) + $cooccurrenceCount,
          r.context = $context,
          r.updatedAt = datetime()
      RETURN r
      `,
      {
        sourceEntityId,
        targetEntityId,
        userId,
        confidence,
        cooccurrenceCount,
        context,
      },
    );

    return result.records[0]?.get("r");
  } catch (error) {
    console.error("Error creating entity co-occurrence relationship:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create semantic similarity relationship between entities
export async function createEntitySimilarityRelationship(
  sourceEntityId: string,
  targetEntityId: string,
  userId: string,
  similarityScore: number,
  relationshipType: string = "SIMILAR_TO",
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (e1:Entity {entityId: $sourceEntityId, userId: $userId})
      MATCH (e2:Entity {entityId: $targetEntityId, userId: $userId})
      WHERE e1 <> e2
      MERGE (e1)-[r:${relationshipType}]-(e2)
      SET r.similarity = $similarityScore,
          r.updatedAt = datetime()
      RETURN r
      `,
      { sourceEntityId, targetEntityId, userId, similarityScore },
    );

    return result.records[0]?.get("r");
  } catch (error) {
    console.error("Error creating entity similarity relationship:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create cross-document entity resolution relationship
export async function createEntityResolutionRelationship(
  primaryEntityId: string,
  duplicateEntityId: string,
  userId: string,
  confidence: number,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (e1:Entity {entityId: $primaryEntityId, userId: $userId})
      MATCH (e2:Entity {entityId: $duplicateEntityId, userId: $userId})
      WHERE e1 <> e2
      MERGE (e2)-[r:SAME_AS]->(e1)
      SET r.confidence = $confidence,
          r.createdAt = datetime()
      RETURN r
      `,
      { primaryEntityId, duplicateEntityId, userId, confidence },
    );

    return result.records[0]?.get("r");
  } catch (error) {
    console.error("Error creating entity resolution relationship:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Get all user's entities for cross-document resolution
export async function getUserEntities(userId: string, category?: string) {
  const session = getSession();

  try {
    let query = `
      MATCH (e:Entity {userId: $userId})
    `;

    const params: any = { userId };

    if (category) {
      query += ` WHERE e.category = $category`;
      params.category = category;
    }

    query += `
      RETURN e.entityId as id, e.name as name, e.category as category, e.confidence as confidence
      ORDER BY e.name
    `;

    const result = await session.run(query, params);

    return result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      category: record.get("category"),
      confidence: record.get("confidence"),
    }));
  } catch (error) {
    console.error("Error getting user entities:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create document similarity relationship
export async function createDocumentSimilarityRelationship(
  sourceDocId: string,
  targetDocId: string,
  userId: string,
  similarityScore: number,
  relationshipType: string = "SIMILAR_TO",
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (d1:Document {docId: $sourceDocId, userId: $userId})
      MATCH (d2:Document {docId: $targetDocId, userId: $userId})
      WHERE d1 <> d2
      MERGE (d1)-[r:${relationshipType}]-(d2)
      SET r.similarity = $similarityScore,
          r.updatedAt = datetime()
      RETURN r
      `,
      { sourceDocId, targetDocId, userId, similarityScore },
    );

    return result.records[0]?.get("r");
  } catch (error) {
    console.error("Error creating document similarity relationship:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Get all user's documents for similarity analysis
export async function getUserDocuments(userId: string) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (d:Document {userId: $userId})
      RETURN d.docId as docId, d.filename as filename
      ORDER BY d.filename
      `,
      { userId },
    );

    return result.records.map((record) => ({
      docId: record.get("docId"),
      filename: record.get("filename"),
    }));
  } catch (error) {
    console.error("Error getting user documents:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create topic node
export async function createTopicNode(
  topicId: string,
  userId: string,
  name: string,
  description: string,
  keywords: string[],
  confidence: number,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MERGE (t:Topic {topicId: $topicId, userId: $userId})
      SET t.name = $name,
          t.description = $description,
          t.keywords = $keywords,
          t.confidence = $confidence,
          t.createdAt = datetime()
      RETURN t
      `,
      { topicId, userId, name, description, keywords, confidence },
    );

    return result.records[0]?.get("t");
  } catch (error) {
    console.error("Error creating topic node:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Create topic-document relationship
export async function createTopicDocumentRelationship(
  topicId: string,
  docId: string,
  userId: string,
  relevance: number,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (t:Topic {topicId: $topicId, userId: $userId})
      MATCH (d:Document {docId: $docId, userId: $userId})
      MERGE (t)-[r:CATEGORIZES]->(d)
      SET r.relevance = $relevance,
          r.updatedAt = datetime()
      RETURN r
      `,
      { topicId, docId, userId, relevance },
    );

    return result.records[0]?.get("r");
  } catch (error) {
    console.error("Error creating topic-document relationship:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Get entities that co-occur with a specific entity
export async function getEntityCooccurrences(
  entityId: string,
  userId: string,
  limit: number = 10,
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (e:Entity {entityId: $entityId, userId: $userId})-[r:COOCCURS_WITH]-(related:Entity {userId: $userId})
      RETURN related, r.confidence as confidence, r.count as count
      ORDER BY r.count DESC, r.confidence DESC
      LIMIT $limit
      `,
      { entityId, userId, limit },
    );

    return result.records.map((record) => ({
      entity: record.get("related").properties,
      confidence: record.get("confidence"),
      count: record.get("count"),
    }));
  } catch (error) {
    console.error("Error getting entity co-occurrences:", error);
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
  createEntityCooccurrenceRelationship,
  createEntitySimilarityRelationship,
  createEntityResolutionRelationship,
  createDocumentSimilarityRelationship,
  createTopicNode,
  createTopicDocumentRelationship,
  getUserEntities,
  getUserDocuments,
  getEntityCooccurrences,
  getUserGraphData,
  deleteDocumentGraph,
  closeNeo4jConnection,
};
