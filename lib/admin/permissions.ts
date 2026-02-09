/**
 * Admin Permission Middleware
 * Verifies if user has ADMIN role and is active
 */

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

type RequireAdminApiResult =
  | { ok: true; admin: { id: string; name: string | null; email: string } }
  | { ok: false; response: NextResponse };

/**
 * Require admin for API routes. Returns 403 JSON instead of redirect.
 * Use when the route is called via fetch/AJAX.
 */
export async function requireAdminApi(): Promise<RequireAdminApiResult> {
  const stackUser = await stackServerApp.getUser();
  const email =
    (stackUser as { primaryEmail?: string; email?: string })?.primaryEmail ??
    (stackUser as { primaryEmail?: string; email?: string })?.email ??
    null;

  if (!email) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Autenticação necessária" },
        { status: 401 }
      ),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      suspendedAt: true,
    },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 }
      ),
    };
  }

  if (!dbUser.isActive || dbUser.suspendedAt) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Conta suspensa ou inativa" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, admin: dbUser };
}

/**
 * Require admin role for server components / API routes
 * When userEmail is not passed, gets current user from Stack Auth
 */
export async function requireAdmin(userEmail?: string | null) {
  let email = userEmail;
  if (!email) {
    const stackUser = await stackServerApp.getUser();
    email =
      (stackUser as { primaryEmail?: string; email?: string })?.primaryEmail ??
      (stackUser as { primaryEmail?: string; email?: string })?.email ??
      null;
  }
  if (!email) {
    redirect("/login?callbackUrl=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      suspendedAt: true,
    },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  if (!dbUser.isActive || dbUser.suspendedAt) {
    redirect("/?error=account_suspended");
  }

  return dbUser;
}

/**
 * Log admin activity to AdminActivityLog table
 * Falls back to console if DB insert fails
 */
export async function logAdminActivity(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> | null = null
): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        resourceType: targetType,
        resourceId: targetId,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
    console.info("[AdminActivity]", {
      adminId,
      action,
      targetType,
      targetId,
      metadata,
    });
  }
}

/**
 * Check if user has admin role (without redirect)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });

  return user?.role === "ADMIN" && user?.isActive === true;
}
