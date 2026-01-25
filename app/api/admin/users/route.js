import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  role: z.enum(["CLIENTE", "FOTOGRAFO", "ADMIN"]).optional(),
  search: z.string().optional(),
});

export async function GET(request) {
  try {
    // 1. Security Check: Authentication & Authorization
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 },
      );
    }

    // 2. Input Validation
    const { searchParams } = new URL(request.url);
    const rawRole = searchParams.get("role");
    const rawSearch = searchParams.get("search");

    const validationResult = querySchema.safeParse({
      role: rawRole || undefined,
      search: rawSearch || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { role, search } = validationResult.data;

    // 3. Data Fetching
    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        fotografo: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[API /admin/users] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
