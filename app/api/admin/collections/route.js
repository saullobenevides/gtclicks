import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["RASCUNHO", "PUBLICADA"]).optional().default("PUBLICADA"),
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
    const rawStatus = searchParams.get("status");

    const validationResult = querySchema.safeParse({
      status: rawStatus || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 },
      );
    }

    const { status } = validationResult.data;

    // 3. Data Fetching
    const collections = await prisma.colecao.findMany({
      where: {
        status: status,
      },
      include: {
        fotografo: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            fotos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("[API /admin/collections] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
