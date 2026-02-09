import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const SORT_FIELDS = ["name", "email", "role", "createdAt", "pedidos"];
const querySchema = z.object({
  role: z.enum(["CLIENTE", "FOTOGRAFO", "ADMIN"]).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
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
      role: searchParams.get("role") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const {
      role,
      search,
      page: pageStr,
      limit: limitStr,
      sort: sortField = "createdAt",
      order: orderDir = "desc",
    } = validationResult.data;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const validSort = SORT_FIELDS.includes(sortField) ? sortField : "createdAt";
    const dir = orderDir === "asc" ? "asc" : "desc";

    const orderBy =
      validSort === "pedidos"
        ? { pedidos: { _count: dir } }
        : { [validSort]: dir };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          fotografo: {
            select: { id: true, username: true },
          },
          _count: { select: { pedidos: true } },
        },
        orderBy: orderBy as {
          name?: "asc" | "desc";
          email?: "asc" | "desc";
          role?: "asc" | "desc";
          createdAt?: "asc" | "desc";
          pedidos?: { _count: "asc" | "desc" };
        },
        take: limit,
        skip,
      }),
    ]);

    return NextResponse.json({
      data: users,
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API /admin/users] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
