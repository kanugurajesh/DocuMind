import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { getDocumentsCollection } from "@/lib/db/mongodb";

// GET /api/documents/[docId] - Get specific document details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { docId } = await params;

    const documentsCollection = await getDocumentsCollection();
    const document = await documentsCollection.findOne({ docId, userId });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}

// PATCH /api/documents/[docId] - Update document metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { docId } = await params;
    const updates = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates = ["filename", "metadata"];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 },
      );
    }

    const documentsCollection = await getDocumentsCollection();
    const result = await documentsCollection.updateOne(
      { docId, userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 },
      );
    }

    // Get updated document
    const updatedDocument = await documentsCollection.findOne({
      docId,
      userId,
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update document" },
      { status: 500 },
    );
  }
}
