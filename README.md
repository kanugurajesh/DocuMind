# Documind

Documind is an end-to-end document intelligence application that allows users to upload documents, automatically extract knowledge, and interact with them using natural language queries. It combines semantic search (Qdrant), graph relationships (Neo4j), and LLM reasoning into a single unified experience.

## Application Workflow – Document Q&A with Graph + Vector Search

### 1. Uploading a Document
- User uploads a document (PDF, DOCX, TXT, etc.) from the Next.js frontend.
- The app backend (API route) does the following:
  1. Stores the raw file in **Azure Blob Storage**.
  2. Creates a **document record** in **MongoDB** with:
     - docId
     - filename
     - blobUrl
     - uploadedAt timestamp
  3. Extracts the text from the file.
  4. Splits text into smaller **chunks** (e.g., 500 tokens).
  5. Generates embeddings for each chunk and stores them in **Qdrant**:
     - vector
     - chunk text
     - docId reference
  6. Runs entity & relationship extraction on text (via LLM or NLP).
  7. Creates nodes and relationships in **Neo4j**:
     - `(:Document)-[:CONTAINS]->(:Chunk)`
     - `(:Chunk)-[:MENTIONS]->(:Entity)`

---

### 2. Asking Questions
- User types a natural language question in the UI.
- The backend flow:
  1. Embed the query into a vector.
  2. Search **Qdrant** for top-k similar chunks.
  3. Fetch related entities & relationships from **Neo4j**.
  4. Combine results into a **context package**.
  5. Pass context + user query to **LLM**.
  6. Return answer + supporting details.

---

### 3. Viewing the Graph
- User can open a graph visualization page in the app.
- The backend queries **Neo4j** for:
  - All nodes (documents, chunks, entities).
  - All edges (CONTAINS, MENTIONS, RELATED_TO).
- The frontend renders the graph (Cytoscape.js or D3.js).
- Clicking on a node shows additional info:
  - Document node → filename, metadata.
  - Chunk node → original text passage.
  - Entity node → name, relationships.

---

### 4. Deleting a Document
- User selects "Delete document".
- Backend removes document from all systems:
  1. **Azure Blob** → deletes raw file.
  2. **MongoDB** → deletes metadata record.
  3. **Qdrant** → deletes all vectors where `docId = ...`.
  4. **Neo4j** → deletes document node and all connected relationships.

---

### 5. System Components
- **Next.js Frontend** → UI for upload, Q&A, graph view, delete.
- **Azure Blob Storage** → Raw file storage.
- **MongoDB** → Metadata management (doc info, user info).
- **Qdrant** → Vector database for semantic similarity search.
- **Neo4j** → Knowledge graph for entity/relationship storage + visualization.
- **LLM (OpenAI / Gemini / Ollama)** → Embeddings + Q&A reasoning.

---

### 6. Example Flow
1. Upload `contract.pdf`.
   - Stored in Blob → docId = `doc_123`.
   - Text chunks embedded → stored in Qdrant.
   - Entities extracted (e.g., `John Doe`, `Company X`) → stored in Neo4j.
2. Ask: *"Who is the contract between?"*
   - Query embedding → Qdrant finds relevant chunk.
   - Neo4j shows entities linked to that chunk.
   - LLM answers: *"The contract is between John Doe and Company X."*
3. View graph:
   - Document node connected to `Chunk1`.
   - `Chunk1` connected to `Entity: John Doe` and `Entity: Company X`.
4. Delete document:
   - Removes from Blob, MongoDB, Qdrant, Neo4j.

---
