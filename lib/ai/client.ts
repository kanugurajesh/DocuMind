import { OpenAI } from "openai";

let client: OpenAI | null = null;

function getAiMode(): "local" | "cloud" {
  return process.env.AI_MODE === "local" ? "local" : "cloud";
}

export function getOpenAIClient(): OpenAI {
  if (!client) {
    if (getAiMode() === "local") {
      client = new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey: "ollama", // required by the SDK but ignored by Ollama
      });
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set (required for cloud mode)");
      }
      client = new OpenAI({ apiKey });
    }
  }
  return client;
}

// Chat/completion model name for the active AI mode
export function getChatModel(): string {
  return getAiMode() === "local"
    ? (process.env.OLLAMA_CHAT_MODEL ?? "llama3.1")
    : (process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

// Embedding model name for the active AI mode
export function getEmbeddingModel(): string {
  return getAiMode() === "local"
    ? (process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text")
    : (process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small");
}
