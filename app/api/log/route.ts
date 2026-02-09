import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 2000;
const MAX_URL_LENGTH = 200;

function sanitize(str: string | undefined, maxLen: number): string {
  if (str == null || typeof str !== "string") return "";
  return str
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, maxLen)
    .trim();
}

export async function POST(request: Request) {
  try {
    const errorData = (await request.json()) as {
      message?: string;
      stack?: string;
      url?: string;
    };
    const message = sanitize(errorData.message, MAX_MESSAGE_LENGTH);
    const stack = sanitize(errorData.stack, MAX_STACK_LENGTH);
    const url = sanitize(errorData.url, MAX_URL_LENGTH);

    logError(
      {
        message: message || "Unknown Client Error",
        stack: stack || "No stack trace",
        toString: () => message,
      },
      `Client Error at ${url || "Unknown URL"}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "API Log");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
