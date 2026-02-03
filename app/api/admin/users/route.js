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

export async function GET(request) {
  try {
    // 1. Security Check: Authentication & Authorization
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // 2. Input Validation
    const { searchParams } = new URL(request.url);
    const rawRole = searchParams.get("role");
    const rawSearch = searchParams.get("search");
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");
    const rawSort = searchParams.get("sort");
    const rawOrder = searchParams.get("order");

    const validationResult = querySchema.safeParse({
      role: rawRole || undefined,
      search: rawSearch || undefined,
      page: rawPage || undefined,
      limit: rawLimit || undefined,
      sort: rawSort || undefined,
      order: rawOrder || undefined,
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

    const validSort = SORT_FIELDS.includes(sortField) ? sortField : "createdAt";
    const dir = orderDir === "asc" ? "asc" : "desc";

    let orderBy;
    if (validSort === "pedidos") {
      orderBy = { pedidos: { _count: dir } };
    } else {
      orderBy = { [validSort]: dir };
    }

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
        orderBy,
        take: limit,
        skip: skip,
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
