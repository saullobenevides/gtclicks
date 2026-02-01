import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

export async function POST(request) {
  try {
    const errorData = await request.json();
    const { message, stack, url } = errorData;

    logError(
      {
        message: message || "Unknown Client Error",
        stack: stack || "No stack trace",
        toString: () => message, // Helper for logger
      },
      `Client Error at ${url || "Unknown URL"}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "API Log");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
