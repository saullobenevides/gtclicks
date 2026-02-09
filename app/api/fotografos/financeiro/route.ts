import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    if (userId && userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = userId ?? user.id;

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: targetUserId },
      include: {
        saldo: true,
      },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Photographer not found" },
        { status: 404 }
      );
    }

    const [total, transacoes] = await Promise.all([
      prisma.transacao.count({
        where: { fotografoId: fotografo.id },
      }),
      prisma.transacao.findMany({
        where: { fotografoId: fotografo.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
    ]);

    const minSaque = await getConfigNumber(CONFIG_KEYS.MIN_SAQUE);

    const saldoData = fotografo.saldo
      ? {
          disponivel: Number(fotografo.saldo.disponivel),
          bloqueado: Number(fotografo.saldo.bloqueado),
        }
      : { disponivel: 0, bloqueado: 0 };

    return NextResponse.json({
      saldo: saldoData,
      transacoes,
      chavePix: fotografo.chavePix,
      minSaque: Number(minSaque),
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
