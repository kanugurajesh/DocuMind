import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDocumentsCollection } from '@/lib/db/mongodb';
import { uploadFileBuffer } from '@/lib/storage/s3';
import { Document } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files.',
        },
        { status: 400 }
      );
    }

    // Validate file size (default 10MB limit)
    const maxSizeMB = Number(process.env.MAX_FILE_SIZE_MB) || 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds ${maxSizeMB}MB limit`,
        },
        { status: 400 }
      );
    }

    // Generate unique document ID
    const docId = uuidv4();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to AWS S3
    const { blobUrl } = await uploadFileBuffer(
      file.name,
      fileBuffer,
      file.type,
      userId,
      docId
    );

    // Create document record in MongoDB
    const document: Omit<Document, '_id'> = {
      docId,
      filename: file.name,
      originalName: file.name,
      blobUrl,
      userId,
      uploadedAt: new Date(),
      fileSize: file.size,
      fileType: file.type,
      processingStatus: 'pending',
      metadata: {
        // Will be populated during processing
      },
    };

    const documentsCollection = await getDocumentsCollection();
    const result = await documentsCollection.insertOne(document);

    // Trigger document processing pipeline
    const { queueDocumentProcessing } = await import('@/lib/ai/pipeline');
    queueDocumentProcessing(docId, userId, file.name, file.type);

    return NextResponse.json({
      success: true,
      docId,
      filename: file.name,
      message: 'File uploaded successfully. Processing will begin shortly.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during upload',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}