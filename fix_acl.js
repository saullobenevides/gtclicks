import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY,
  },
});

async function makePublic(bucket, key) {
  const bucketName = bucket || process.env.S3_UPLOAD_BUCKET || "gtclicks";
  console.log(`Setting public-read for: ${key} in ${bucketName}`);
  try {
    const command = new PutObjectAclCommand({
      Bucket: bucketName,
      Key: key,
      ACL: "public-read",
    });
    await s3Client.send(command);
    console.log("Success: Object is now public.");
  } catch (error) {
    console.error(`Error setting ACL: ${error.name} - ${error.message}`);
  }
}

const key = "previews/a53cc612-1283-4150-a2dc-8de138528fd2.png";

makePublic(null, key);
