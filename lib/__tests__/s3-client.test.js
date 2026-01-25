import { S3Client } from "@aws-sdk/client-s3";

// Mock the environment variables
const originalEnv = process.env;

describe("S3 Client Singleton", () => {
  beforeEach(() => {
    jest.resetModules(); // Clear cache to properly test singleton init
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return null if config is missing", () => {
    delete process.env.S3_UPLOAD_BUCKET;
    // Dynamic import to pick up new env
    const { getS3Client } = require("../s3-client");
    const client = getS3Client();
    expect(client).toBeNull();
  });

  it("should return S3Client instance if config is present", async () => {
    process.env.S3_UPLOAD_BUCKET = "test-bucket";
    process.env.S3_UPLOAD_REGION = "us-east-1";
    process.env.S3_UPLOAD_ACCESS_KEY_ID = "test-key";
    process.env.S3_UPLOAD_SECRET_ACCESS_KEY = "test-secret";

    console.log("ENV BUCKET:", process.env.S3_UPLOAD_BUCKET);
    const { getS3Client } = require("../s3-client");
    const client = getS3Client();

    expect(client).not.toBeNull();
    // Verify it's an S3 client by checking config
    const region = await client.config.region();
    expect(region).toBe("us-east-1");
  });

  it("should return the SAME instance on subsequent calls (Singleton)", () => {
    process.env.S3_UPLOAD_BUCKET = "test-bucket";
    process.env.S3_UPLOAD_REGION = "us-east-1";
    process.env.S3_UPLOAD_ACCESS_KEY_ID = "test-key";
    process.env.S3_UPLOAD_SECRET_ACCESS_KEY = "test-secret";

    // Must require once to get the same closure
    const { getS3Client } = require("../s3-client");

    const client1 = getS3Client();
    const client2 = getS3Client();

    expect(client1).toBe(client2); // Strict equality check
  });
});
