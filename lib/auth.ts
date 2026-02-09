import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Obtém o usuário Stack atual (inclui primaryEmailVerified).
 */
export async function getStackUser() {
  return stackServerApp.getUser();
}

/**
 * Verifica se o usuário está autenticado e com email verificado.
 * Retorna null se não autenticado ou se o email não foi verificado.
 * Use para rotas que exigem verificação de email (ex: atividades de fotógrafo).
 */
export async function getAuthenticatedUserWithVerifiedEmail(): Promise<User | null> {
  return getAuthenticatedUser({ requireEmailVerified: true });
}

export async function getAuthenticatedUser(options?: {
  requireEmailVerified?: boolean;
}): Promise<User | null> {
  // 0. Mock Auth REMOVED for Security on Production/Dev
  // Previous mock logic for "mock-photographer-session-token" has been removed to prevent security risks.
  // Use proper test authentication providers or seeding for E2E tests.

  // 1. Get user from Stack Auth (Source of Truth for Identity)
  const stackUser = await stackServerApp.getUser();

  if (!stackUser) {
    return null;
  }

  if (options?.requireEmailVerified) {
    const stackUserAny = stackUser as { primaryEmailVerified?: boolean };
    if (stackUserAny.primaryEmailVerified === false) {
      return null;
    }
  }

  // 2. Map Stack User fields to Prisma User fields
  // Stack user object structure handling (email can be direct or in primaryEmail)
  const stackUserAny = stackUser as {
    primaryEmail?: string | null;
    email?: string;
    displayName?: string | null;
    name?: string;
    profileImageUrl?: string | null;
    image?: string;
  };
  const email =
    stackUserAny.primaryEmail ||
    stackUserAny.email ||
    `user-${stackUser.id}@placeholder.local`;
  const name = (stackUserAny.displayName || stackUserAny.name) ?? undefined;
  const image =
    (stackUserAny.profileImageUrl || stackUserAny.image) ?? undefined;

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
