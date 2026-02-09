import { NextResponse } from "next/server";

/**
 * DEPRECATED / SECURITY: This route previously accepted raw S3 keys and returned
 * signed URLs without auth—allowing IDOR access to any bucket object.
 *
 * Previews are now served via full S3 URLs (previewUrl) stored in the DB.
 * Use /api/download/[token] for purchased content.
 *
 * This endpoint returns 404 to prevent exploitation.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;

  if (!key) {
    return NextResponse.json({ error: "Key not provided" }, { status: 400 });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
