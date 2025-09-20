import { OpenAI } from 'openai';
import { generateQueryEmbedding } from './embeddings';
import { searchVectors } from '../db/qdrant';
import { getDocumentsCollection } from '../db/mongodb';
import { ChatResponse, SearchResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ChatContext {
  query: string;
  userId: string;
  maxResults?: number;
  minScore?: number;
  docIds?: string[];
}

// Main chat function that combines search and LLM reasoning
export async function generateChatResponse(
  context: ChatContext
): Promise<ChatResponse> {
  try {
    // Step 1: Generate embedding for the user query
    const queryEmbedding = await generateQueryEmbedding(context.query);

    // Step 2: Search for relevant chunks using semantic similarity
    const searchResults = await performSemanticSearch({
      queryEmbedding,
      userId: context.userId,
      maxResults: context.maxResults || 10,
      minScore: context.minScore || 0.2,
      docIds: context.docIds,
    });

    if (searchResults.length === 0) {
      return {
        answer:
          "I couldn't find any relevant information in your documents to answer this question. Try asking about topics covered in your uploaded documents.",
        sources: [],
        confidence: 0,
        relatedEntities: [],
      };
    }

    // Step 3: Generate answer using LLM with retrieved context
    const llmResponse = await generateAnswerWithContext(
      context.query,
      searchResults
    );

    return {
      answer: llmResponse.answer,
      sources: searchResults,
      confidence: llmResponse.confidence,
      relatedEntities: [], // TODO: Extract related entities from answer
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response');
  }
}

// Perform semantic search across user's documents
async function performSemanticSearch({
  queryEmbedding,
  userId,
  maxResults,
  minScore,
  docIds,
}: {
  queryEmbedding: number[];
  userId: string;
  maxResults: number;
  minScore: number;
  docIds?: string[];
}): Promise<SearchResult[]> {
  try {
    // Search vectors in Qdrant
    const qdrantResults = await searchVectors(
      queryEmbedding,
      userId,
      maxResults,
      minScore,
      docIds
    );

    // Get document metadata from MongoDB
    const documentsCollection = await getDocumentsCollection();
    const docMap = new Map();

    // Build document map for quick lookup
    if (qdrantResults.length > 0) {
      const uniqueDocIds = [
        ...new Set(qdrantResults.map((r) => r.payload?.docId).filter(Boolean)),
      ];

      const documents = await documentsCollection
        .find({
          docId: { $in: uniqueDocIds },
          userId,
        })
        .toArray();

      documents.forEach((doc) => {
        docMap.set(doc.docId, {
          filename: doc.filename,
          uploadedAt: doc.uploadedAt,
        });
      });
    }

    // Transform results to SearchResult format
    const searchResults: SearchResult[] = qdrantResults.map((result, index) => {
      const payload = result.payload || {};
      const docInfo = docMap.get(payload.docId) || {
        filename: 'Unknown Document',
        uploadedAt: new Date(),
      };

      return {
        chunkId: result.id?.toString() || `result_${index}`,
        docId: payload.docId || '',
        text: payload.text || '',
        score: result.score || 0,
        document: docInfo,
        entities: [], // TODO: Include related entities
      };
    });

    return searchResults;
  } catch (error) {
    console.error('Error performing semantic search:', error);
    return [];
  }
}

// Generate answer using LLM with retrieved context
async function generateAnswerWithContext(
  query: string,
  searchResults: SearchResult[]
): Promise<{ answer: string; confidence: number }> {
  try {
    // Prepare context from search results
    const contextChunks = searchResults
      .map(
        (result, index) =>
          `[Source ${index + 1} - ${result.document.filename}]:\n${result.text}`
      )
      .join('\n\n');

    const prompt = `
You are an intelligent document assistant. Answer the user's question based on the provided context from their documents.

Context from documents:
${contextChunks}

User Question: ${query}

Instructions:
- Answer the question based ONLY on the provided context
- If the context doesn't contain enough information to answer the question, say so clearly
- Cite specific sources when making claims (e.g., "According to [Source 1]...")
- Be concise but thorough
- If you're uncertain about something, express that uncertainty
- Don't make assumptions beyond what's stated in the context

Answer:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that answers questions based on provided document context. Always cite your sources and be truthful about the limitations of your knowledge.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temperature for factual responses
      max_tokens: 1000,
    });

    const answer =
      response.choices[0]?.message?.content ||
      'I was unable to generate an answer.';

    // Calculate confidence based on search result scores and answer length
    const avgScore =
      searchResults.reduce((sum, result) => sum + result.score, 0) /
      searchResults.length;
    const confidence = Math.min(
      avgScore * 0.8 + (answer.length > 50 ? 0.2 : 0),
      1.0
    );

    return { answer, confidence };
  } catch (error) {
    console.error('Error generating answer with context:', error);
    throw error;
  }
}

// Search documents without generating a chat response
export async function performDocumentSearch({
  query,
  userId,
  maxResults = 20,
  minScore = 0.2,
  docIds,
}: {
  query: string;
  userId: string;
  maxResults?: number;
  minScore?: number;
  docIds?: string[];
}): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateQueryEmbedding(query);

    return await performSemanticSearch({
      queryEmbedding,
      userId,
      maxResults,
      minScore,
      docIds,
    });
  } catch (error) {
    console.error('Error performing document search:', error);
    return [];
  }
}

export default {
  generateChatResponse,
  performDocumentSearch,
};
