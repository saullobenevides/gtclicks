
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { indexFace } from "./rekognition";
import prisma from "./prisma";

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
 * Detects bib numbers in an image using Gemini 1.5 Flash.
 */
async function detectBibNumber(imageBuffer) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Extract only the numeric bib numbers (número de peito) from this photo. Return only the numbers separated by commas, or 'none' if no numbers are found.",
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg"
        }
      }
    ]);

    const text = result.response.text().trim().toLowerCase();
    if (text === 'none') return null;
    
    // Pick the first number if multiple are found (common in bib-OCR)
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : null;
  } catch (error) {
    console.error("[OCR] Gemini detection failed:", error);
    return null;
  }
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
 * 3. Detect Bib Number (OCR)
 * 4. Apply Watermark -> Save as Preview
 * 5. Upload Preview
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
    const MAX_DIMENSION = 1600;
    
    let pipeline = image.rotate(); 
    
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
        pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' });
    }

    const resizedBuffer = await pipeline.toBuffer();

    // 4. Index Face
    console.log(`[Processing] Indexing face in Rekognition...`);
    let indexingResult;
    try {
        indexingResult = await indexFace(resizedBuffer, photoId);
    } catch (err) {
        console.error(`[Processing] Indexing failed:`, err);
        indexingResult = { FaceRecords: [] }; 
    }

    // 5. Detect Bib Number (OCR) - NEW
    console.log(`[Processing] Detecting bib number...`);
    const bibNumber = await detectBibNumber(resizedBuffer);
    if (bibNumber) {
        console.log(`[Processing] Bib number detected: ${bibNumber}`);
        await prisma.foto.update({
            where: { id: photoId },
            data: { numeroSequencial: bibNumber }
        });
    }

    // 6. Apply Tiled Watermark
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

    // 7. Upload Preview
    const originalName = s3Key.split('/').pop();
    const previewKey = `previews/${originalName}`;
    
    console.log(`[Processing] Uploading preview to ${previewKey}...`);
    const previewUrl = await uploadToS3(previewKey, watermarkedBuffer, "image/jpeg");

    return {
      success: true,
      previewUrl,
      previewKey,
      indexingStatus: indexingResult.FaceRecords?.length > 0 ? "INDEXED" : "FAILED",
      facesIndexed: indexingResult.FaceRecords?.length || 0,
      bibNumberDetected: bibNumber
    };

  } catch (error) {
    console.error(`[Processing] Critical Error:`, error);
    throw error;
  }
}
