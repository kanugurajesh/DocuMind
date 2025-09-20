import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { createEntityNode, createEntityCooccurrenceRelationship, createEntityResolutionRelationship, createEntitySimilarityRelationship, getUserEntities, getEntityCooccurrences } from '../db/neo4j';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ExtractedEntity {
  id: string;
  name: string;
  category: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'MONEY' | 'OTHER';
  confidence: number;
  context?: string;
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  relationships: EntityRelationship[];
}

export interface EntityRelationship {
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  confidence: number;
  context?: string;
}

// Extract entities from text using OpenAI
export async function extractEntities(text: string): Promise<EntityExtractionResult> {
  try {
    const prompt = `
You are an expert entity extraction system. Analyze the following text and extract named entities and their relationships.

Text: "${text}"

Please extract entities and return them in the following JSON format:
{
  "entities": [
    {
      "name": "entity name",
      "category": "PERSON|ORGANIZATION|LOCATION|DATE|MONEY|OTHER",
      "confidence": 0.0-1.0,
      "context": "surrounding context where entity appears"
    }
  ],
  "relationships": [
    {
      "source": "source entity name",
      "target": "target entity name",
      "relationType": "relationship type (e.g., WORKS_AT, LOCATED_IN, RELATED_TO)",
      "confidence": 0.0-1.0,
      "context": "context describing the relationship"
    }
  ]
}

Guidelines:
- Only extract clearly identifiable entities
- Be conservative with confidence scores
- Focus on meaningful relationships
- Use standardized category names
- Provide brief context for each entity/relationship
- Limit to most significant entities (max 10 per text chunk)

Return only valid JSON, no additional text.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const result = JSON.parse(content);

      // Process and validate extracted entities
      const entities: ExtractedEntity[] = (result.entities || []).map((entity: any) => ({
        id: uuidv4(),
        name: entity.name?.trim() || '',
        category: validateCategory(entity.category),
        confidence: Math.max(0, Math.min(1, Number(entity.confidence) || 0.5)),
        context: entity.context?.trim() || undefined,
      })).filter((entity: ExtractedEntity) => entity.name.length > 0);

      // Process relationships
      const relationships: EntityRelationship[] = (result.relationships || []).map((rel: any) => {
        const sourceEntity = entities.find(e => e.name.toLowerCase() === rel.source?.toLowerCase());
        const targetEntity = entities.find(e => e.name.toLowerCase() === rel.target?.toLowerCase());

        if (!sourceEntity || !targetEntity) return null;

        return {
          sourceEntityId: sourceEntity.id,
          targetEntityId: targetEntity.id,
          relationType: rel.relationType?.trim() || 'RELATED_TO',
          confidence: Math.max(0, Math.min(1, Number(rel.confidence) || 0.5)),
          context: rel.context?.trim() || undefined,
        };
      }).filter(Boolean);

      return { entities, relationships };
    } catch (parseError) {
      console.error('Error parsing entity extraction JSON:', parseError);
      return { entities: [], relationships: [] };
    }
  } catch (error) {
    console.error('Error extracting entities:', error);
    return { entities: [], relationships: [] };
  }
}

// Validate entity category
function validateCategory(category: string): ExtractedEntity['category'] {
  const validCategories: ExtractedEntity['category'][] = [
    'PERSON', 'ORGANIZATION', 'LOCATION', 'DATE', 'MONEY', 'OTHER'
  ];

  const upperCategory = category?.toUpperCase();
  return validCategories.includes(upperCategory as any) ? upperCategory as ExtractedEntity['category'] : 'OTHER';
}

// Process entities for a document chunk
export async function processChunkEntities(
  chunkId: string,
  chunkText: string,
  docId: string,
  userId: string
): Promise<ExtractedEntity[]> {
  try {
    // Skip very short text chunks
    if (chunkText.length < 50) {
      console.log(`⏭️ Skipping short chunk ${chunkId} (${chunkText.length} chars)`);
      return [];
    }

    console.log(`🧠 Extracting entities from chunk ${chunkId} (${chunkText.length} chars)`);
    const result = await extractEntities(chunkText);
    console.log(`📋 LLM extracted ${result.entities.length} entities from chunk ${chunkId}`);

    const processedEntities: ExtractedEntity[] = [];

    // Create entity nodes in Neo4j
    for (const entity of result.entities) {
      try {
        const entityId = `${docId}_${entity.id}`;

        console.log(`🏗️ Creating entity node: ${entity.name} (${entity.category})`);
        await createEntityNode(
          entityId,
          chunkId,
          userId,
          entity.name,
          entity.category,
          entity.confidence
        );

        processedEntities.push({
          ...entity,
          id: entityId,
        });
      } catch (error) {
        console.error(`❌ Error creating entity node for ${entity.name}:`, error);
      }
    }

    // Process co-occurrence relationships between entities in the same chunk
    if (processedEntities.length > 1) {
      console.log(`🔗 Creating co-occurrence relationships for ${processedEntities.length} entities in chunk ${chunkId}`);
      await processEntityCooccurrences(processedEntities, userId, chunkText);
    }

    console.log(`✅ Chunk ${chunkId} processed: ${processedEntities.length} entities created`);
    return processedEntities;
  } catch (error) {
    console.error(`❌ Error processing chunk entities for ${chunkId}:`, error);
    return [];
  }
}

// Process co-occurrence relationships between entities in the same chunk
async function processEntityCooccurrences(
  entities: ExtractedEntity[],
  userId: string,
  chunkText: string
): Promise<void> {
  try {
    // Create co-occurrence relationships between all entity pairs in the chunk
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        // Calculate confidence based on entity confidence and text proximity
        const baseConfidence = Math.min(entity1.confidence, entity2.confidence);

        // Check if entities appear near each other in the text
        const entity1Index = chunkText.toLowerCase().indexOf(entity1.name.toLowerCase());
        const entity2Index = chunkText.toLowerCase().indexOf(entity2.name.toLowerCase());

        if (entity1Index !== -1 && entity2Index !== -1) {
          const distance = Math.abs(entity1Index - entity2Index);
          const proximityBonus = Math.max(0, 1 - (distance / chunkText.length));
          const confidence = Math.min(1, baseConfidence + (proximityBonus * 0.3));

          // Create co-occurrence relationship
          await createEntityCooccurrenceRelationship(
            entity1.id,
            entity2.id,
            userId,
            confidence,
            1, // co-occurrence count
            `Co-occurring in same text chunk`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error processing entity co-occurrences:', error);
  }
}

// Calculate entity similarity based on category and name
function calculateEntitySimilarity(entity1: ExtractedEntity, entity2: ExtractedEntity): number {
  // Same category bonus
  const categoryMatch = entity1.category === entity2.category ? 0.3 : 0;

  // Name similarity using simple string similarity
  const nameSimilarity = calculateStringSimilarity(entity1.name.toLowerCase(), entity2.name.toLowerCase());

  return Math.min(1, categoryMatch + (nameSimilarity * 0.7));
}

// Simple string similarity calculation (Jaccard similarity of words)
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// Batch process entities for multiple chunks
export async function processDocumentEntities(
  docId: string,
  userId: string,
  chunks: Array<{ id: string; text: string }>
): Promise<ExtractedEntity[]> {
  console.log(`🔍 Starting entity extraction for document ${docId} with ${chunks.length} chunks`);
  console.log(`📋 Chunk details:`, chunks.map(c => ({ id: c.id, textLength: c.text.length, textPreview: c.text.substring(0, 100) + '...' })));
  console.log(`👤 Processing for user: ${userId}`);
  console.log(`📄 Document ID: ${docId}`);

  const allEntities: ExtractedEntity[] = [];

  // Process chunks in smaller batches to avoid rate limits
  const batchSize = 3; // Conservative batch size for entity extraction

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(`📦 Processing entity batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)} (chunks ${i}-${Math.min(i + batchSize - 1, chunks.length - 1)})`);

    const batchPromises = batch.map(chunk =>
      processChunkEntities(chunk.id, chunk.text, docId, userId)
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      const batchEntities = batchResults.flat();
      allEntities.push(...batchEntities);

      console.log(`✅ Batch completed: extracted ${batchEntities.length} entities`);

      // Small delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (error) {
      console.error(`❌ Error processing entity batch ${i}-${i + batchSize}:`, error);
    }
  }

  console.log(`🎯 Entity extraction completed: total ${allEntities.length} entities extracted for document ${docId}`);
  return allEntities;
}

// Process cross-document entity resolution
export async function processCrossDocumentEntityResolution(
  docId: string,
  userId: string,
  newEntities: ExtractedEntity[]
): Promise<void> {
  try {
    // Group new entities by category for more efficient processing
    const entitiesByCategory = newEntities.reduce((acc, entity) => {
      if (!acc[entity.category]) {
        acc[entity.category] = [];
      }
      acc[entity.category].push(entity);
      return acc;
    }, {} as Record<string, ExtractedEntity[]>);

    // Process each category separately
    for (const [category, entities] of Object.entries(entitiesByCategory)) {
      // Get existing entities of the same category
      const existingEntities = await getUserEntities(userId, category);

      // Check for potential duplicates
      for (const newEntity of entities) {
        for (const existing of existingEntities) {
          // Skip if it's the same entity
          if (existing.id === newEntity.id) continue;

          const similarity = calculateEntitySimilarity(
            newEntity,
            { ...existing, context: undefined } as ExtractedEntity
          );

          // If similarity is high enough, create SAME_AS relationship
          if (similarity > 0.8) {
            await createEntityResolutionRelationship(
              existing.id, // primary entity (existing)
              newEntity.id, // duplicate entity (new)
              userId,
              similarity
            );
          }
          // If moderately similar, create SIMILAR_TO relationship
          else if (similarity > 0.6) {
            await createEntitySimilarityRelationship(
              newEntity.id,
              existing.id,
              userId,
              similarity
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing cross-document entity resolution:', error);
  }
}

// Enhanced entity similarity calculation for cross-document resolution
function calculateAdvancedEntitySimilarity(entity1: ExtractedEntity, entity2: ExtractedEntity): number {
  // Exact name match
  if (entity1.name.toLowerCase() === entity2.name.toLowerCase()) {
    return 1.0;
  }

  // Category must match for high similarity
  if (entity1.category !== entity2.category) {
    return 0;
  }

  // Calculate various similarity metrics
  const nameSimilarity = calculateStringSimilarity(entity1.name.toLowerCase(), entity2.name.toLowerCase());

  // For person names, check if one is a subset of the other
  if (entity1.category === 'PERSON') {
    const name1Parts = entity1.name.toLowerCase().split(/\s+/);
    const name2Parts = entity2.name.toLowerCase().split(/\s+/);

    // Check if all parts of shorter name are in longer name
    const shorter = name1Parts.length < name2Parts.length ? name1Parts : name2Parts;
    const longer = name1Parts.length >= name2Parts.length ? name1Parts : name2Parts;

    const partMatches = shorter.filter(part => longer.some(longPart => longPart.includes(part) || part.includes(longPart)));

    if (partMatches.length === shorter.length && shorter.length > 0) {
      return 0.9; // Very high similarity for name subsets
    }
  }

  // For organizations, check for common abbreviations or variations
  if (entity1.category === 'ORGANIZATION') {
    const cleanName1 = entity1.name.toLowerCase().replace(/[.,\s]+/g, '');
    const cleanName2 = entity2.name.toLowerCase().replace(/[.,\s]+/g, '');

    if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) {
      return 0.85;
    }
  }

  return nameSimilarity;
}

// Process semantic entity clustering to group related entities
export async function processEntityClustering(userId: string): Promise<void> {
  try {
    console.log('Processing semantic entity clustering...');

    // Get all user entities grouped by category
    const categories = ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE', 'MONEY', 'OTHER'];

    for (const category of categories) {
      const entities = await getUserEntities(userId, category);

      if (entities.length < 2) continue;

      // Create clusters within each category based on semantic similarity
      await createSemanticClusters(userId, entities, category);
    }

    // Create cross-category relationships for related concepts
    await createCrossCategoryRelationships(userId);

  } catch (error) {
    console.error('Error processing entity clustering:', error);
  }
}

// Create semantic clusters within an entity category
async function createSemanticClusters(
  userId: string,
  entities: Array<{id: string, name: string, category: string, confidence: number}>,
  category: string
): Promise<void> {
  try {
    // For each entity, find semantically similar entities
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        const similarity = calculateAdvancedEntitySimilarity(
          { ...entity1, context: undefined } as ExtractedEntity,
          { ...entity2, context: undefined } as ExtractedEntity
        );

        // Create similarity relationships for moderately similar entities
        if (similarity > 0.4 && similarity <= 0.8) {
          await createEntitySimilarityRelationship(
            entity1.id,
            entity2.id,
            userId,
            similarity
          );
        }
      }
    }

    // Create category-specific clustering logic
    if (category === 'PERSON') {
      await createPersonClusters(userId, entities);
    } else if (category === 'ORGANIZATION') {
      await createOrganizationClusters(userId, entities);
    } else if (category === 'LOCATION') {
      await createLocationClusters(userId, entities);
    }

  } catch (error) {
    console.error(`Error creating semantic clusters for ${category}:`, error);
  }
}

// Create person-specific clusters (e.g., same profession, same organization)
async function createPersonClusters(
  userId: string,
  persons: Array<{id: string, name: string, category: string, confidence: number}>
): Promise<void> {
  // Group persons who might work at the same organization or have similar roles
  const professionalTerms = ['ceo', 'cto', 'manager', 'director', 'president', 'founder', 'engineer', 'developer'];

  for (const person1 of persons) {
    for (const person2 of persons) {
      if (person1.id === person2.id) continue;

      const name1Lower = person1.name.toLowerCase();
      const name2Lower = person2.name.toLowerCase();

      // Check if they share professional terms
      const sharedTerms = professionalTerms.filter(term =>
        name1Lower.includes(term) && name2Lower.includes(term)
      );

      if (sharedTerms.length > 0) {
        await createEntitySimilarityRelationship(
          person1.id,
          person2.id,
          userId,
          0.6,
          'PROFESSIONAL_SIMILARITY'
        );
      }
    }
  }
}

// Create organization-specific clusters (e.g., same industry, parent-subsidiary)
async function createOrganizationClusters(
  userId: string,
  organizations: Array<{id: string, name: string, category: string, confidence: number}>
): Promise<void> {
  const industryTerms = ['tech', 'technology', 'software', 'bank', 'financial', 'medical', 'healthcare', 'university', 'college'];

  for (const org1 of organizations) {
    for (const org2 of organizations) {
      if (org1.id === org2.id) continue;

      const name1Lower = org1.name.toLowerCase();
      const name2Lower = org2.name.toLowerCase();

      // Check if they share industry terms
      const sharedIndustryTerms = industryTerms.filter(term =>
        name1Lower.includes(term) && name2Lower.includes(term)
      );

      if (sharedIndustryTerms.length > 0) {
        await createEntitySimilarityRelationship(
          org1.id,
          org2.id,
          userId,
          0.5,
          'INDUSTRY_SIMILARITY'
        );
      }
    }
  }
}

// Create location-specific clusters (e.g., same city, region, country)
async function createLocationClusters(
  userId: string,
  locations: Array<{id: string, name: string, category: string, confidence: number}>
): Promise<void> {
  // Group locations by geographic hierarchy
  for (const loc1 of locations) {
    for (const loc2 of locations) {
      if (loc1.id === loc2.id) continue;

      const name1Lower = loc1.name.toLowerCase();
      const name2Lower = loc2.name.toLowerCase();

      // Check if one location is contained within another
      if (name1Lower.includes(name2Lower) || name2Lower.includes(name1Lower)) {
        await createEntitySimilarityRelationship(
          loc1.id,
          loc2.id,
          userId,
          0.7,
          'GEOGRAPHIC_CONTAINMENT'
        );
      }
    }
  }
}

// Create cross-category relationships between related concepts
async function createCrossCategoryRelationships(userId: string): Promise<void> {
  try {
    // Get entities from different categories that might be related
    const persons = await getUserEntities(userId, 'PERSON');
    const organizations = await getUserEntities(userId, 'ORGANIZATION');
    const locations = await getUserEntities(userId, 'LOCATION');

    // Create person-organization relationships
    for (const person of persons) {
      for (const org of organizations) {
        // Check if person name appears with organization context
        if (await entitiesAppearTogether(userId, person.id, org.id)) {
          await createEntitySimilarityRelationship(
            person.id,
            org.id,
            userId,
            0.6,
            'WORKS_AT'
          );
        }
      }
    }

    // Create organization-location relationships
    for (const org of organizations) {
      for (const location of locations) {
        if (await entitiesAppearTogether(userId, org.id, location.id)) {
          await createEntitySimilarityRelationship(
            org.id,
            location.id,
            userId,
            0.6,
            'LOCATED_IN'
          );
        }
      }
    }

  } catch (error) {
    console.error('Error creating cross-category relationships:', error);
  }
}

// Check if two entities appear together in any chunks
async function entitiesAppearTogether(userId: string, entity1Id: string, entity2Id: string): Promise<boolean> {
  try {
    const cooccurrences = await getEntityCooccurrences(entity1Id, userId, 50);
    return cooccurrences.some(cooccurrence => cooccurrence.entity.entityId === entity2Id);
  } catch (error) {
    console.error('Error checking entity co-occurrence:', error);
    return false;
  }
}

export default {
  extractEntities,
  processChunkEntities,
  processDocumentEntities,
  processCrossDocumentEntityResolution,
  processEntityClustering,
};