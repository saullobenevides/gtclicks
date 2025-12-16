import { S3Client, GetObjectAclCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const logStream = fs.createWriteStream("check_s3_output.txt");
const log = (msg) => {
    console.log(msg);
    logStream.write(msg + "\n");
};

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY,
  },
});

log("Debug Credentials:");
log(`Region: ${process.env.S3_UPLOAD_REGION}`);
log(`Key ID Present: ${!!process.env.S3_UPLOAD_ACCESS_KEY_ID}`);
log(`Secret Present: ${!!process.env.S3_UPLOAD_SECRET_ACCESS_KEY}`);

async function checkAcl(bucket, key) {
  const bucketName = bucket || process.env.S3_UPLOAD_BUCKET || "gtclicks";
  log(`Checking ACL for: ${key} in ${bucketName}`);
  try {
    const command = new GetObjectAclCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    log(`Grants found: ${response.Grants.length}`);
    response.Grants.forEach((g) => {
      log(` - Grantee: ${g.Grantee.DisplayName || g.Grantee.URI || g.Grantee.ID}`);
      log(`   Permission: ${g.Permission}`);
    });
  } catch (error) {
    log(`Error checking ACL: ${error.name} - ${error.message}`);
  } finally {
      logStream.end();
  }
}

const key = "previews/a53cc612-1283-4150-a2dc-8de138528fd2.png";

checkAcl(null, key);
