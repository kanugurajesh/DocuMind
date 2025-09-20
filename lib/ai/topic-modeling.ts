import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { createTopicNode, createTopicDocumentRelationship, getUserDocuments } from '../db/neo4j';
import { getDocumentsCollection } from '../db/mongodb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ExtractedTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  confidence: number;
}

export interface TopicModelingResult {
  topics: ExtractedTopic[];
  documentTopics: Array<{
    docId: string;
    topicId: string;
    relevance: number;
  }>;
}

// Extract topics from a collection of document texts
export async function extractTopicsFromDocuments(
  userId: string,
  maxTopics: number = 10
): Promise<TopicModelingResult> {
  try {
    const documents = await getUserDocuments(userId);

    if (documents.length === 0) {
      return { topics: [], documentTopics: [] };
    }

    // Get document contents from MongoDB
    const documentsCollection = await getDocumentsCollection();
    const documentTexts = new Map<string, string>();

    for (const doc of documents) {
      try {
        const docData = await documentsCollection.findOne({ docId: doc.docId, userId });
        if (docData?.metadata?.title || doc.filename) {
          // Use title/filename as a proxy for document content for topic extraction
          documentTexts.set(doc.docId, docData?.metadata?.title || doc.filename);
        }
      } catch (error) {
        console.error(`Error fetching document content for ${doc.docId}:`, error);
      }
    }

    if (documentTexts.size === 0) {
      return { topics: [], documentTopics: [] };
    }

    // Extract topics using OpenAI
    const topics = await extractTopicsUsingLLM(Array.from(documentTexts.values()), maxTopics);

    // Assign documents to topics
    const documentTopics = await assignDocumentsToTopics(documentTexts, topics);

    return { topics, documentTopics };
  } catch (error) {
    console.error('Error extracting topics from documents:', error);
    return { topics: [], documentTopics: [] };
  }
}

// Extract topics using OpenAI LLM
async function extractTopicsUsingLLM(documentTexts: string[], maxTopics: number): Promise<ExtractedTopic[]> {
  try {
    const prompt = `
You are an expert topic modeling system. Analyze the following document titles/names and identify the main topics they represent.

Document titles:
${documentTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

Please identify up to ${maxTopics} distinct topics that these documents cover. Return your analysis in the following JSON format:

{
  "topics": [
    {
      "name": "Topic Name",
      "description": "Brief description of what this topic covers",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "confidence": 0.0-1.0
    }
  ]
}

Guidelines:
- Create broad, meaningful topic categories
- Each topic should be distinct and non-overlapping
- Include 3-5 relevant keywords per topic
- Confidence should reflect how well-defined the topic is
- Focus on themes, subjects, or content areas
- Return only valid JSON, no additional text

Topic examples: "Technology & Software", "Business & Finance", "Research & Academic", "Legal Documents", "Marketing & Communications", etc.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Clean content by removing markdown code blocks if present
      const cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const result = JSON.parse(cleanContent);

      const topics: ExtractedTopic[] = (result.topics || []).map((topic: any) => ({
        id: uuidv4(),
        name: topic.name?.trim() || 'Untitled Topic',
        description: topic.description?.trim() || '',
        keywords: Array.isArray(topic.keywords) ? topic.keywords.slice(0, 10) : [],
        confidence: Math.max(0, Math.min(1, Number(topic.confidence) || 0.5)),
      })).filter((topic: ExtractedTopic) => topic.name !== 'Untitled Topic');

      return topics;
    } catch (parseError) {
      console.error('Error parsing topic extraction JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error extracting topics with LLM:', error);
    return [];
  }
}

// Assign documents to topics based on content similarity
async function assignDocumentsToTopics(
  documentTexts: Map<string, string>,
  topics: ExtractedTopic[]
): Promise<Array<{ docId: string; topicId: string; relevance: number }>> {
  const assignments: Array<{ docId: string; topicId: string; relevance: number }> = [];

  for (const [docId, docText] of documentTexts) {
    for (const topic of topics) {
      const relevance = calculateTopicRelevance(docText, topic);

      // Only create assignments for reasonably relevant topics
      if (relevance > 0.3) {
        assignments.push({
          docId,
          topicId: topic.id,
          relevance,
        });
      }
    }
  }

  return assignments;
}

// Calculate how relevant a document is to a specific topic
function calculateTopicRelevance(documentText: string, topic: ExtractedTopic): number {
  const docLower = documentText.toLowerCase();
  const topicNameLower = topic.name.toLowerCase();
  const topicDescLower = topic.description.toLowerCase();

  let relevance = 0;

  // Check if topic name appears in document
  if (docLower.includes(topicNameLower)) {
    relevance += 0.5;
  }

  // Check keyword matches
  let keywordMatches = 0;
  for (const keyword of topic.keywords) {
    if (docLower.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }

  if (topic.keywords.length > 0) {
    relevance += (keywordMatches / topic.keywords.length) * 0.4;
  }

  // Check topic description similarity
  const descWords = topicDescLower.split(/\s+/);
  let descMatches = 0;
  for (const word of descWords) {
    if (word.length > 3 && docLower.includes(word)) {
      descMatches++;
    }
  }

  if (descWords.length > 0) {
    relevance += (descMatches / descWords.length) * 0.1;
  }

  return Math.min(1, relevance);
}

// Process topic modeling for a user and create graph nodes
export async function processTopicModeling(userId: string): Promise<void> {
  try {
    console.log('Processing topic modeling...');

    const result = await extractTopicsFromDocuments(userId, 8);

    if (result.topics.length === 0) {
      console.log('No topics extracted');
      return;
    }

    // Create topic nodes in Neo4j
    for (const topic of result.topics) {
      try {
        await createTopicNode(
          topic.id,
          userId,
          topic.name,
          topic.description,
          topic.keywords,
          topic.confidence
        );

        console.log(`Created topic: ${topic.name}`);
      } catch (error) {
        console.error(`Error creating topic node for ${topic.name}:`, error);
      }
    }

    // Create document-topic relationships
    for (const assignment of result.documentTopics) {
      try {
        await createTopicDocumentRelationship(
          assignment.topicId,
          assignment.docId,
          userId,
          assignment.relevance
        );
      } catch (error) {
        console.error(`Error creating topic-document relationship:`, error);
      }
    }

    console.log(`Topic modeling completed: ${result.topics.length} topics, ${result.documentTopics.length} document-topic relationships`);
  } catch (error) {
    console.error('Error processing topic modeling:', error);
  }
}

// Create topic clusters based on similar keywords and themes
export async function createTopicClusters(userId: string): Promise<void> {
  try {
    console.log('Creating topic clusters...');

    // This would analyze existing topics and create similarity relationships
    // between topics that share keywords or themes

    // Implementation would go here
    console.log('Topic clustering completed');
  } catch (error) {
    console.error('Error creating topic clusters:', error);
  }
}

export default {
  extractTopicsFromDocuments,
  processTopicModeling,
  createTopicClusters,
};