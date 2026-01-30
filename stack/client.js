import { StackClientApp } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

if (!projectId || !publishableClientKey) {
  throw new Error(
    "Stack Auth environment variables are missing. Set NEXT_PUBLIC_STACK_PROJECT_ID and NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY.",
  );
}

const globalForStack = global;

export const stackClientApp =
  globalForStack.stackClientApp ||
  new StackClientApp({
    projectId,
    publishableClientKey,
    tokenStore: "cookie",
  });

if (process.env.NODE_ENV !== "production") {
  globalForStack.stackClientApp = stackClientApp;
}
