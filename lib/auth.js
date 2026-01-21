import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

export async function getAuthenticatedUser() {
  // 0. Mock Auth for E2E Tests (Dev/Test only)
  if (process.env.NODE_ENV !== "production") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("stack-session")?.value;

    if (sessionToken === "mock-photographer-session-token") {
      return {
        id: "test-photographer-1",
        email: "fotografo@test.com",
        name: "Fotógrafo Teste",
        image: null,
        role: "PHOTOGRAPHER", // Pre-configured role for tests
      };
    }
    if (sessionToken === "mock-buyer-session-token") {
      return {
        id: "test-buyer-1",
        email: "comprador@test.com",
        name: "Comprador Teste",
        image: null,
        role: "CLIENTE",
      };
    }
  }

  // 1. Get user from Stack Auth (Source of Truth for Identity)
  const stackUser = await stackServerApp.getUser();

  if (!stackUser) {
    return null;
  }

  // 2. Map Stack User fields to Prisma User fields
  // Stack user object structure handling (email can be direct or in primaryEmail)
  const email = stackUser.primaryEmail || stackUser.email;
  const name = stackUser.displayName || stackUser.name;
  const image = stackUser.profileImageUrl || stackUser.image;

  // 3. Sync with local database (Upsert)
  // We use stackUser.id as the local User.id to guarantee 1:1 mapping
  try {
    const user = await prisma.user.upsert({
      where: { id: stackUser.id },
      update: {
        // Only update profile info, NEVER overwrite roles or critical system flags here
        email,
        name,
        image,
      },
      create: {
        id: stackUser.id, // Enforce same ID
        email,
        name,
        image,
        role: "CLIENTE", // Default role
      },
    });

    return user;
  } catch (error) {
    console.error("Auth Sync Error:", error);
    // Fallback: If upsert fails (e.g. unique email constraint on different ID),
    // we return null to block access rather than allowing inconsistent state.
    // Ideally user sees 500 but for auth helper returning null acts as 401.
    return null;
  }
}
