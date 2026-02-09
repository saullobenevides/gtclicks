const isProd = process.env.NODE_ENV === "production";

/**
 * Logger centralizado – usar em vez de console.*
 * Em produção: error/warn são mantidos; info/debug podem ser silenciados.
 */

export function logError(error: unknown, context = ""): void {
  const timestamp = new Date().toISOString();
  const stack =
    (typeof error === "object" &&
      error !== null &&
      "stack" in error &&
      (error as Error).stack) ||
    "No stack trace";
  const message =
    (typeof error === "object" &&
      error !== null &&
      "message" in error &&
      (error as Error).message) ||
    String(error);

  console.error(
    `[${timestamp}] [ERROR] ${
      context ? context + ": " : ""
    }${message}\nStack: ${stack}`
  );
}

export function logWarn(message: string, context = ""): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  console.warn(`[${timestamp}] [WARN] ${prefix}${message}`);
}

export function logInfo(message: string, context = ""): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  console.log(`[${timestamp}] [INFO] ${prefix}${message}`);
}

export function logDebug(message: string, context = ""): void {
  if (isProd) return;
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  console.log(`[${timestamp}] [DEBUG] ${prefix}${message}`);
}
