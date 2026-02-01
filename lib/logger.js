const isProd = process.env.NODE_ENV === "production";

/**
 * Logger centralizado – usar em vez de console.*
 * Em produção: error/warn são mantidos; info/debug podem ser silenciados.
 */

export function logError(error, context = "") {
  const timestamp = new Date().toISOString();
  const stack = (typeof error === "object" && error?.stack) || "No stack trace";
  const message =
    (typeof error === "object" && error?.message) || String(error);

  // eslint-disable-next-line no-console
  console.error(
    `[${timestamp}] [ERROR] ${
      context ? context + ": " : ""
    }${message}\nStack: ${stack}`
  );
}

export function logWarn(message, context = "") {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  // eslint-disable-next-line no-console
  console.warn(`[${timestamp}] [WARN] ${prefix}${message}`);
}

export function logInfo(message, context = "") {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [INFO] ${prefix}${message}`);
}

export function logDebug(message, context = "") {
  if (isProd) return;
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}] ` : "";
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [DEBUG] ${prefix}${message}`);
}
