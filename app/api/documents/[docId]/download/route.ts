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

    // Extract S3 key from blobUrl
    // Format: https://bucket.s3.region.amazonaws.com/userId/docId/filename
    const urlParts = document.blobUrl.split('/');
    const s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com

    // Generate presigned download URL
    const downloadUrl = await getFileDownloadUrl(s3Key, 10); // 10 minutes expiry

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