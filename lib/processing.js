
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { indexFace } from "./rekognition";

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Generates a tiled watermark SVG string based on image dimensions.
 */
function generateWatermarkSVG(width, height) {
  // Tile encryption: Repeat "GT Clicks" every 300x300 pixels
  const patternWidth = 300;
  const patternHeight = 300;
  
  return `
    <svg width="${width}" height="${height}">
      <defs>
        <pattern id="watermark" x="0" y="0" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">
           <!-- Text rotated diagonally in the center of the tile -->
           <text 
             x="${patternWidth/2}" 
             y="${patternHeight/2}" 
             font-family="Arial, sans-serif" 
             font-weight="bold" 
             font-size="30" 
             fill="rgba(255, 255, 255, 0.4)" 
             text-anchor="middle" 
             dominant-baseline="middle" 
             transform="rotate(-45 ${patternWidth/2} ${patternHeight/2})"
           >
             GT Clicks
           </text>
        </pattern>
      </defs>
      <!-- Fill the entire image with the pattern -->
      <rect x="0" y="0" width="100%" height="100%" fill="url(#watermark)" />
    </svg>
  `;
}

/**
 * Downloads a file from S3 and returns it as a Buffer.
 */
async function downloadFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const response = await s3Client.send(command);
  const stream = response.Body;
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Uploads a buffer to S3.
 */
async function uploadToS3(key, buffer, contentType = "image/jpeg") {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Note: Do NOT set ACL public-read if the bucket blocks ACLs. 
    // We assume the 'previews/' folder policy allows public access or we use CloudFront.
  });
  await s3Client.send(command);
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Main processing function:
 * 1. Download Original
 * 2. Resize (& Optimize) -> Index in Rekognition (Cost effective)
 * 3. Apply Watermark -> Save as Preview
 * 4. Upload Preview
 */
export async function processUploadedImage(s3Key, photoId) {
  console.log(`[Processing] Starting for ${s3Key} (Photo ID: ${photoId})`);
  
  try {
    // 1. Download Original
    const originalBuffer = await downloadFromS3(s3Key);
    console.log(`[Processing] Downloaded original (${originalBuffer.length} bytes)`);

    // 2. Load into Sharp
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();
    
    // 3. Optimize for Rekognition & Preview (Resize if huge)
    // Rekognition max image size is 5MB. 
    // We'll use a resized version (max 1600px) for both indexing and preview to save costs/bandwidth.
    const MAX_DIMENSION = 1600;
    
    // Create a resizing pipeline
    let pipeline = image.rotate(); // Auto-rotate based on EXIF
    
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
        pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' });
    }

    const resizedBuffer = await pipeline.toBuffer();

    // 4. Index Face (Use resized buffer for speed/cost)
    console.log(`[Processing] Indexing face in Rekognition...`);
    let indexingResult;
    try {
        indexingResult = await indexFace(resizedBuffer, photoId);
        console.log(`[Processing] Indexing success:`, indexingResult);
    } catch (err) {
        console.error(`[Processing] Indexing failed:`, err);
        // We continue even if indexing fails, to at least generate the preview
        indexingResult = { FaceRecords: [] }; 
    }

    // 5. Apply Tiled Watermark
    // Get dimensions of the resized image for SVG generation
    const resizedMeta = await sharp(resizedBuffer).metadata();
    const watermarkSvg = generateWatermarkSVG(resizedMeta.width, resizedMeta.height);

    const watermarkedBuffer = await sharp(resizedBuffer)
      .composite([{
        input: Buffer.from(watermarkSvg),
        top: 0,
        left: 0,
      }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    // 6. Upload Preview
    // We'll store it in a 'previews' folder with the same ID structure
    // s3Key is like "originals/uuid.jpg", we want "previews/uuid.jpg"
    const originalName = s3Key.split('/').pop();
    const previewKey = `previews/${originalName}`;
    
    console.log(`[Processing] Uploading preview to ${previewKey}...`);
    const previewUrl = await uploadToS3(previewKey, watermarkedBuffer, "image/jpeg");

    return {
      success: true,
      previewUrl,
      previewKey,
      indexingStatus: indexingResult.FaceRecords?.length > 0 ? "INDEXED" : "FAILED",
      facesIndexed: indexingResult.FaceRecords?.length || 0
    };

  } catch (error) {
    console.error(`[Processing] Critical Error:`, error);
    throw error;
  }
}
