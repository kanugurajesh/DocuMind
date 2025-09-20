import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

export function getBucketName(): string {
  return process.env.AWS_S3_BUCKET_NAME!;
}

// Initialize bucket (create if doesn't exist)
export async function initializeBucket() {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  try {
    // Check if bucket exists by trying to get its location
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: ".test",
      }),
    );
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      console.log("S3 bucket exists and is accessible");
    } else {
      console.error("Error accessing S3 bucket:", error);
      throw error;
    }
  }
}

// Upload file buffer to S3
export async function uploadFileBuffer(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  userId: string,
  docId: string,
): Promise<{ blobUrl: string; uploadResponse: PutObjectCommandOutput }> {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  // Create a unique key with user and document context
  const key = `${userId}/${docId}/${fileName}`;

  // Sanitize metadata values for HTTP headers - remove control characters and non-ASCII
  const sanitizeHeaderValue = (value: string): string => {
    return value
      .replace(/[\x00-\x1F\x7F-\xFF]/g, "") // Remove control chars and non-ASCII
      .replace(/[\r\n]/g, "") // Remove line breaks
      .trim();
  };

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      userId: sanitizeHeaderValue(userId),
      docId: sanitizeHeaderValue(docId),
      originalName: sanitizeHeaderValue(fileName),
      uploadedAt: new Date().toISOString(),
    },
  });

  try {
    const uploadResponse = await s3.send(command);

    // Construct the S3 URL
    const blobUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      blobUrl,
      uploadResponse,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

// Download file from S3
export async function downloadFile(key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("No body in S3 response");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Calculate total length
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

    // Create buffer and copy data
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error downloading file from S3:", error);
    throw error;
  }
}

// Get file download URL (with presigned URL for temporary access)
export async function getFileDownloadUrl(
  key: string,
  expiresInMinutes: number = 60,
): Promise<string> {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: expiresInMinutes * 60, // Convert minutes to seconds
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await s3.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}

// Get file metadata
export async function getFileMetadata(key: string) {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3.send(command);
    return {
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw error;
  }
}

// List files for a user
export async function listUserFiles(userId: string) {
  const s3 = getS3Client();
  const bucketName = getBucketName();

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: `${userId}/`,
  });

  try {
    const response = await s3.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error("Error listing user files:", error);
    throw error;
  }
}

export default {
  getS3Client,
  getBucketName,
  initializeBucket,
  uploadFileBuffer,
  downloadFile,
  getFileDownloadUrl,
  deleteFile,
  getFileMetadata,
  listUserFiles,
};
