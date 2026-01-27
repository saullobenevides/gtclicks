import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["RASCUNHO", "PUBLICADA"]).optional().default("PUBLICADA"),
  page: z.string().optional(),
  limit: z.string().optional(),
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
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");

    const validationResult = querySchema.safeParse({
      status: rawStatus || undefined,
      page: rawPage || undefined,
      limit: rawLimit || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 },
      );
    }

    const { status, page: pageStr, limit: limitStr } = validationResult.data;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    // 3. Data Fetching
    const [total, collections] = await Promise.all([
      prisma.colecao.count({
        where: {
          status: status,
        },
      }),
      prisma.colecao.findMany({
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
        take: limit,
        skip: skip,
      }),
    ]);

    return NextResponse.json({
      data: collections,
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API /admin/collections] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
