import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  try {
    // 1. Security Check
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Body
    const { image, mimeType, imageUrl } = await request.json();

    if (!image && !imageUrl) {
      return NextResponse.json({ error: "Image data or URL is required" }, { status: 400 });
    }

    let base64Data = "";
    let finalMimeType = mimeType || "image/jpeg";

    if (imageUrl) {
      // Fetch image server-side to avoid CORS
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
      
      const arrayBuffer = await imageRes.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
      finalMimeType = imageRes.headers.get("content-type") || finalMimeType;
    } else {
      // image is expected to be base64 string
      base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    }
    
    const analysis = await analyzeImage(base64Data, finalMimeType);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("[AI-ANALYZE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
