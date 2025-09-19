import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { createEntityNode } from '../db/neo4j';

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
      return [];
    }

    const result = await extractEntities(chunkText);
    const processedEntities: ExtractedEntity[] = [];

    // Create entity nodes in Neo4j
    for (const entity of result.entities) {
      try {
        const entityId = `${docId}_${entity.id}`;

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
        console.error(`Error creating entity node for ${entity.name}:`, error);
      }
    }

    // TODO: Process relationships between entities
    // This would involve creating additional relationship edges in Neo4j

    return processedEntities;
  } catch (error) {
    console.error('Error processing chunk entities:', error);
    return [];
  }
}

// Batch process entities for multiple chunks
export async function processDocumentEntities(
  docId: string,
  userId: string,
  chunks: Array<{ id: string; text: string }>
): Promise<ExtractedEntity[]> {
  const allEntities: ExtractedEntity[] = [];

  // Process chunks in smaller batches to avoid rate limits
  const batchSize = 3; // Conservative batch size for entity extraction

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const batchPromises = batch.map(chunk =>
      processChunkEntities(`${docId}_${chunk.id}`, chunk.text, docId, userId)
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      allEntities.push(...batchResults.flat());

      // Small delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (error) {
      console.error(`Error processing entity batch ${i}-${i + batchSize}:`, error);
    }
  }

  return allEntities;
}

export default {
  extractEntities,
  processChunkEntities,
  processDocumentEntities,
};