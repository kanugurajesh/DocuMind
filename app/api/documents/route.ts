import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getDocumentsCollection } from "@/lib/db/mongodb";
import { deleteDocumentGraph } from "@/lib/db/neo4j";
import { deleteVectorsByDocId } from "@/lib/db/qdrant";
import { deleteFile } from "@/lib/storage/s3";

// GET /api/documents - List user's documents
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const documentsCollection = await getDocumentsCollection();

    // Get documents with pagination
    const documents = await documentsCollection
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await documentsCollection.countDocuments({ userId });

    return NextResponse.json({
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// DELETE /api/documents - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "Document ID required" },
        { status: 400 },
      );
    }

    const documentsCollection = await getDocumentsCollection();

    // Find the document to ensure it belongs to the user
    const document = await documentsCollection.findOne({ docId, userId });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found or access denied" },
        { status: 404 },
      );
    }

    try {
      // Delete vectors from Qdrant first (may fail due to connection issues)
      const qdrantResult = await deleteVectorsByDocId(docId, userId);
      const qdrantSkipped = qdrantResult?.status === 'skipped';

      if (qdrantSkipped) {
        console.warn("⚠️ Qdrant vector deletion skipped due to connection issues");
      }

      // Delete from other storage systems in parallel
      await Promise.all([
        // Delete from MongoDB
        documentsCollection.deleteOne({ docId, userId }),

        // Delete from AWS S3
        deleteFile(`${userId}/${docId}/${document.filename}`),

        // Delete from Neo4j graph
        deleteDocumentGraph(docId, userId),
      ]);

      const message = qdrantSkipped
        ? "Document deleted successfully (vector deletion skipped due to Qdrant connection issues)"
        : "Document deleted successfully";

      return NextResponse.json({
        success: true,
        message,
        warnings: qdrantSkipped ? ["Qdrant vector deletion was skipped"] : [],
      });
    } catch (deleteError) {
      console.error("Error during document deletion:", deleteError);

      // If deletion fails, we should log this for manual cleanup
      // In production, you might want to implement a cleanup job
      return NextResponse.json(
        {
          success: false,
          error: "Failed to completely delete document. Please try again.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in delete document:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
