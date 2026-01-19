export function logError(error, context = "") {
  const timestamp = new Date().toISOString();
  const stack = error.stack || "No stack trace";
  const message = error.message || error;

  console.error(
    `[${timestamp}] [ERROR] ${context}: ${message}\nStack: ${stack}`
  );
}

export function logInfo(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [INFO] ${message}`);
}
