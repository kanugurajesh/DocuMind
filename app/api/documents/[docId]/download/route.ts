import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getFileDownloadUrl } from "@/lib/storage/s3";
import type { Document } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = await params;

    // Connect to MongoDB and get document
    const { db } = await connectToDatabase();
    const document = await db
      .collection<Document>("documents")
      .findOne({ docId, userId });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Storage key is always `${userId}/${docId}/${filename}` regardless of
    // storage mode (see uploadFileBuffer) — reconstruct it rather than parsing
    // blobUrl, since local (path-style) and cloud (virtual-hosted-style) URLs differ
    const storageKey = `${userId}/${docId}/${document.filename}`;

    // Generate presigned download URL
    const downloadUrl = await getFileDownloadUrl(storageKey, 10); // 10 minutes expiry

    return NextResponse.json({
      success: true,
      downloadUrl,
      filename: document.originalName,
      fileSize: document.fileSize,
      contentType: document.fileType
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}