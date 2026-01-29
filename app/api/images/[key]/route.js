import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Helper to create S3 Client
function getS3Client() {
  return new S3Client({
    region: process.env.S3_UPLOAD_REGION,
    credentials: {
      accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY,
    },
  });
}

export async function GET(request, { params }) {
  const { key } = await params;

  if (!key) {
    return NextResponse.json({ error: "Key not provided" }, { status: 400 });
  }

  try {
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: key,
    });

    // Generate a short-lived signed URL (e.g., 1 hour)
    // This resolves the "7 days" expiration issue by generating a fresh URL on access
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Redirect the browser to the actual S3 URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error(`[Image Proxy] Error generating URL for key: ${key}`, error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 },
    );
  }
}
