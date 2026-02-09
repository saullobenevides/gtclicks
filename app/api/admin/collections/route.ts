import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["RASCUNHO", "PUBLICADA"]).optional().default("PUBLICADA"),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const validationResult = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 }
      );
    }

    const { status, page: pageStr, limit: limitStr } = validationResult.data;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    const [total, collections] = await Promise.all([
      prisma.colecao.count({ where: { status } }),
      prisma.colecao.findMany({
        where: { status },
        include: {
          fotografo: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          _count: { select: { fotos: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
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
      { status: 500 }
    );
  }
}
