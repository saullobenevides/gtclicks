import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

if (!bucket || !region || !accessKeyId || !secretAccessKey) {
  console.error("❌ Missing S3 environment variables.");
  process.exit(1);
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadFile(key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);
  console.log(`[i] Uploaded test file to: ${key}`);
}

async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(command);
  console.log(`[i] Cleanup: Deleted ${key}`);
}

async function checkPublicAccess(key, expectSuccess) {
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  console.log(`[?] Testing access to: ${url}`);
  try {
    const res = await fetch(url);
    if (expectSuccess) {
      if (res.status === 200) {
        console.log(
          `✅ Success: Public access allowed (200) as expected for ${key}`,
        );
        return true;
      } else {
        console.error(
          `❌ Failure: Expected 200 but got ${res.status} for ${key}`,
        );
        return false;
      }
    } else {
      if (res.status === 403) {
        console.log(
          `✅ Success: Public access denied (403) as expected for ${key}`,
        );
        return true;
      } else {
        console.error(
          `❌ Failure: Expected 403 but got ${res.status} for ${key}`,
        );
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching URL: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  const timestamp = Date.now();
  const secureKey = `originals/verify-test-${timestamp}.txt`;
  const publicKey = `previews/verify-test-${timestamp}.txt`;
  const fileContent = "This is a verification file.";

  console.log("🔒 Starting S3 Security Verification...\n");

  try {
    // 1. Upload to originals (Private)
    await uploadFile(secureKey, fileContent, "text/plain");

    // 2. Upload to previews (Public)
    await uploadFile(publicKey, fileContent, "text/plain");

    // 3. Test Access
    console.log("\n--- Testing Access Control ---");
    const secureTestPassed = await checkPublicAccess(secureKey, false); // Expect Fail (403)
    const publicTestPassed = await checkPublicAccess(publicKey, true); // Expect Success (200)

    console.log("\n--- Results ---");
    if (secureTestPassed && publicTestPassed) {
      console.log("✅ CONFIGURATION IS CORRECT based on tests.");
      console.log("   - 'originals/' is protected.");
      console.log("   - 'previews/' is public.");
      console.log("   This confirms your platform is storing files securely.");
    } else {
      console.warn("⚠️  CONFIGURATION ISSUES DETECTED.");
      if (!secureTestPassed)
        console.warn(
          "   - 'originals/' might be PUBLICLY ACCESSIBLE! (Critical)",
        );
      if (!publicTestPassed)
        console.warn("   - 'previews/' might be BLOCKED! (Images won't load)");
    }
  } catch (error) {
    console.error("Execution failed:", error);
  } finally {
    // Cleanup
    console.log("\n--- Cleanup ---");
    await deleteFile(secureKey);
    await deleteFile(publicKey);
  }
}

runVerification();
