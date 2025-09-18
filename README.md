# Documind

Documind is an end-to-end document intelligence application that allows users to upload documents, automatically extract knowledge, and interact with them using natural language queries. It combines semantic search (Qdrant), graph relationships (Neo4j), and LLM reasoning into a single unified experience.

## Authentication & Privacy

Documind uses **Clerk** for user authentication and ensures complete data privacy:
- **User Authentication**: Secure sign-up/sign-in via Clerk with support for email, social logins, and more.
- **Document Isolation**: Each user can only access, query, and manage their own uploaded documents.
- **Private Knowledge Graphs**: Users see only their own document relationships and entities in the graph visualization.
- **Secure Queries**: Search and Q&A operations are scoped to the authenticated user's documents only.

## Application Workflow – Document Q&A with Graph + Vector Search

### 1. Uploading a Document
- User uploads a document (PDF, DOCX, TXT, etc.) from the Next.js frontend.
- The app backend (API route) does the following:
  1. Verifies user authentication via **Clerk**.
  2. Stores the raw file in **Azure Blob Storage**.
  3. Creates a **document record** in **MongoDB** with:
     - docId
     - filename
     - blobUrl
     - userId (from Clerk authentication)
     - uploadedAt timestamp
  4. Extracts the text from the file.
  5. Splits text into smaller **chunks** (e.g., 500 tokens).
  6. Generates embeddings for each chunk and stores them in **Qdrant**:
     - vector
     - chunk text
     - docId reference
     - userId reference
  7. Runs entity & relationship extraction on text (via LLM or NLP).
  8. Creates nodes and relationships in **Neo4j** with user scoping:
     - `(:Document {userId})-[:CONTAINS]->(:Chunk {userId})`
     - `(:Chunk {userId})-[:MENTIONS]->(:Entity {userId})`

---

### 2. Asking Questions
- User types a natural language question in the UI.
- The backend flow:
  1. Verifies user authentication via **Clerk**.
  2. Embed the query into a vector.
  3. Search **Qdrant** for top-k similar chunks filtered by userId.
  4. Fetch related entities & relationships from **Neo4j** scoped to the user.
  5. Combine results into a **context package** containing only user's data.
  6. Pass context + user query to **LLM**.
  7. Return answer + supporting details from user's documents only.

---

### 3. Viewing the Graph
- User can open a graph visualization page in the app.
- The backend queries **Neo4j** for user-specific data only:
  - All nodes (documents, chunks, entities) where `userId = current_user`.
  - All edges (CONTAINS, MENTIONS, RELATED_TO) for user's nodes only.
- The frontend renders the graph (Cytoscape.js or D3.js) showing only user's documents.
- Clicking on a node shows additional info from user's data:
  - Document node → filename, metadata.
  - Chunk node → original text passage.
  - Entity node → name, relationships within user's documents.

---

### 4. Deleting a Document
- User selects "Delete document" from their personal document list.
- Backend verifies ownership and removes document from all systems:
  1. **Authentication** → verifies user owns the document via Clerk.
  2. **Azure Blob** → deletes raw file.
  3. **MongoDB** → deletes metadata record for the user's document.
  4. **Qdrant** → deletes all vectors where `docId = ...` and `userId = current_user`.
  5. **Neo4j** → deletes document node and all connected relationships for the user.

---

### 5. System Components
- **Next.js Frontend** → UI for upload, Q&A, graph view, delete with user authentication.
- **Clerk** → User authentication and session management.
- **Azure Blob Storage** → Raw file storage.
- **MongoDB** → Metadata management (doc info, user info) with user scoping.
- **Qdrant** → Vector database for semantic similarity search with user filtering.
- **Neo4j** → Knowledge graph for entity/relationship storage + visualization with user isolation.
- **LLM (OpenAI / Gemini / Ollama)** → Embeddings + Q&A reasoning.

---

### 6. Example Flow (User-Specific)
1. **User authenticates** via Clerk and uploads `contract.pdf`.
   - Stored in Blob → docId = `doc_123`, userId = `user_456`.
   - Text chunks embedded → stored in Qdrant with userId.
   - Entities extracted (e.g., `John Doe`, `Company X`) → stored in Neo4j with userId.
2. **User asks**: *"Who is the contract between?"*
   - Query embedding → Qdrant finds relevant chunk from user's documents only.
   - Neo4j shows entities linked to that chunk within user's graph.
   - LLM answers: *"The contract is between John Doe and Company X."*
3. **User views graph**:
   - Shows only user's documents, chunks, and entities.
   - Document node connected to `Chunk1`.
   - `Chunk1` connected to `Entity: John Doe` and `Entity: Company X`.
4. **User deletes document**:
   - Verifies ownership → removes from Blob, MongoDB, Qdrant, Neo4j.

---
