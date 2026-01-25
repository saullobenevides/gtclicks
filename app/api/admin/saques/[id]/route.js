import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PATCH(request, { params }) {
  // Verify admin access
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 },
    );
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { action } = body; // "aprovar" or "cancelar"

    if (!["aprovar", "cancelar"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const saque = await prisma.solicitacaoSaque.findUnique({
      where: { id },
    });

    if (!saque) {
      return NextResponse.json(
        { error: "Saque não encontrado" },
        { status: 404 },
      );
    }

    if (saque.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Saque já foi processado" },
        { status: 400 },
      );
    }

    if (action === "aprovar") {
      // Mark as processed
      await prisma.solicitacaoSaque.update({
        where: { id },
        data: {
          status: "PROCESSADO",
          processadoEm: new Date(),
          observacao: "Saque processado via PIX",
        },
      });

      // Update transaction status
      await prisma.transacao.updateMany({
        where: {
          saqueId: id,
          tipo: "SAQUE",
        },
        data: {
          status: "PROCESSADO",
        },
      });

      // Move from blocked to paid (remove from balance)
      await prisma.saldo.update({
        where: { fotografoId: saque.fotografoId },
        data: {
          bloqueado: {
            decrement: Number(saque.valor), // Ensure number
          },
        },
      });

      console.log(`✅ Saque ${id} aprovado: R$ ${saque.valor} processado`);
    } else {
      // Cancel withdrawal - return money to available balance
      await prisma.solicitacaoSaque.update({
        where: { id },
        data: {
          status: "CANCELADO",
          processadoEm: new Date(),
          observacao: "Saque cancelado pelo administrador",
        },
      });

      // Update transaction status
      await prisma.transacao.updateMany({
        where: {
          saqueId: id,
          tipo: "SAQUE",
        },
        data: {
          status: "FALHOU",
        },
      });

      // Move from blocked back to available
      await prisma.saldo.update({
        where: { fotografoId: saque.fotografoId },
        data: {
          bloqueado: {
            decrement: Number(saque.valor),
          },
          disponivel: {
            increment: Number(saque.valor),
          },
        },
      });

      console.log(
        `❌ Saque ${id} cancelado: R$ ${saque.valor} devolvido ao saldo`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Erro ao processar saque" },
      { status: 500 },
    );
  }
}
