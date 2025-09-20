import mammoth from "mammoth";
import { downloadFile } from "../storage/s3";

export interface ExtractedContent {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    title?: string;
    author?: string;
    subject?: string;
  };
}

// Extract text content from different file types
export async function extractTextFromFile(
  blobName: string,
  fileType: string,
): Promise<ExtractedContent> {
  try {
    const fileBuffer = await downloadFile(blobName);

    switch (fileType) {
      case "application/pdf":
        return await extractTextFromPDF(fileBuffer);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return await extractTextFromWord(fileBuffer);

      case "text/plain":
        return extractTextFromTxt(fileBuffer);

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw error;
  }
}

// Extract text from PDF using LangChain
async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedContent> {
  try {
    // Ensure buffer is valid
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided to PDF parser");
    }

    console.log(`Processing PDF buffer of size: ${buffer.length} bytes`);

    // Use LangChain's PDF loader
    const { PDFLoader } = await import(
      "@langchain/community/document_loaders/fs/pdf"
    );

    // Create a Blob from the buffer for LangChain
    const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });

    // Create PDF loader instance
    const loader = new PDFLoader(blob, {
      splitPages: false, // We want all text in one document
      parsedItemSeparator: "\n", // Separate items with newlines
    });

    // Load and parse the PDF
    const docs = await loader.load();

    // Combine all document content
    const extractedText = docs.map((doc) => doc.pageContent).join("\n\n");

    // Extract metadata from the first document if available
    const metadata = docs[0]?.metadata || {};

    return {
      text: extractedText,
      metadata: {
        pageCount: docs.length,
        wordCount: extractedText.split(/\s+/).filter((word) => word.length > 0)
          .length,
        title: metadata.title || undefined,
        author: metadata.author || undefined,
        subject: metadata.subject || undefined,
      },
    };
  } catch (error) {
    console.error("Error parsing PDF with LangChain:", error);
    console.error(
      "Buffer info:",
      buffer ? `Buffer length: ${buffer.length}` : "No buffer provided",
    );

    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Extract text from Word documents
async function extractTextFromWord(buffer: Buffer): Promise<ExtractedContent> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value;
    const wordCount = text.split(/\s+/).length;

    return {
      text,
      metadata: {
        wordCount,
      },
    };
  } catch (error) {
    console.error("Error parsing Word document:", error);
    throw new Error("Failed to extract text from Word document");
  }
}

// Extract text from plain text files
function extractTextFromTxt(buffer: Buffer): ExtractedContent {
  const text = buffer.toString("utf-8");
  const wordCount = text.split(/\s+/).length;

  return {
    text,
    metadata: {
      wordCount,
    },
  };
}

// Split text into chunks
export interface TextChunk {
  id: string;
  text: string;
  startPosition: number;
  endPosition: number;
  chunkIndex: number;
  metadata?: Record<string, any>;
}

export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const words = text.split(/\s+/);

  if (words.length <= chunkSize) {
    // If text is smaller than chunk size, return as single chunk
    chunks.push({
      id: `chunk_0`,
      text: text.trim(),
      startPosition: 0,
      endPosition: text.length,
      chunkIndex: 0,
    });
    return chunks;
  }

  let chunkIndex = 0;
  let startIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const chunkText = chunkWords.join(" ");

    // Calculate character positions
    const wordsBeforeChunk = words.slice(0, startIndex);
    const startPosition =
      wordsBeforeChunk.join(" ").length + (wordsBeforeChunk.length > 0 ? 1 : 0);
    const endPosition = startPosition + chunkText.length;

    chunks.push({
      id: `chunk_${chunkIndex}`,
      text: chunkText,
      startPosition,
      endPosition,
      chunkIndex,
    });

    // Move to next chunk with overlap
    startIndex = endIndex - overlap;
    chunkIndex++;

    // Prevent infinite loop
    if (startIndex >= endIndex - overlap) {
      break;
    }
  }

  return chunks;
}

// Clean and preprocess text
export function preprocessText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, " ").trim();

  // Remove common PDF artifacts
  cleaned = cleaned.replace(/\f/g, " "); // Form feed characters
  cleaned = cleaned.replace(/\r\n|\r|\n/g, " "); // Line breaks
  cleaned = cleaned.replace(/\u00A0/g, " "); // Non-breaking spaces

  // Remove excessive punctuation
  cleaned = cleaned.replace(/\.{3,}/g, "...");
  cleaned = cleaned.replace(/-{3,}/g, "---");

  // Normalize quotes
  cleaned = cleaned.replace(/[""]|``|''/g, '"');
  cleaned = cleaned.replace(/['']|`/g, "'");

  return cleaned.trim();
}

export default {
  extractTextFromFile,
  chunkText,
  preprocessText,
};
