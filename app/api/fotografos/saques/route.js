import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, valor, chavePix } = body;

    if (!userId || !valor || !chavePix) {
      return NextResponse.json(
        { error: "userId, valor e chavePix são obrigatórios" },
        { status: 400 }
      );
    }

    const valorDecimal = parseFloat(valor);

    if (valorDecimal < 50) {
      return NextResponse.json(
        { error: "Valor mínimo para saque é R$ 50,00" },
        { status: 400 }
      );
    }

    // Get photographer
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
      include: { saldo: true },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    if (!fotografo.saldo) {
      return NextResponse.json(
        { error: "Você ainda não tem saldo" },
        { status: 400 }
      );
    }

    const saldoDisponivel = parseFloat(fotografo.saldo.disponivel);

    if (valorDecimal > saldoDisponivel) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const saque = await prisma.solicitacaoSaque.create({
      data: {
        fotografoId: fotografo.id,
        valor: valorDecimal,
        chavePix,
        status: "PENDENTE",
      },
    });

    // Move balance from available to blocked
    await prisma.saldo.update({
      where: { fotografoId: fotografo.id },
      data: {
        disponivel: {
          decrement: valorDecimal,
        },
        bloqueado: {
          increment: valorDecimal,
        },
      },
    });

    // Create transaction record
    await prisma.transacao.create({
      data: {
        fotografoId: fotografo.id,
        tipo: "SAQUE",
        valor: -valorDecimal,
        descricao: `Saque solicitado via PIX`,
        saqueId: saque.id,
        status: "PENDENTE",
      },
    });

    return NextResponse.json({ data: saque });
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return NextResponse.json(
      { error: "Erro ao solicitar saque" },
      { status: 500 }
    );
  }
}
