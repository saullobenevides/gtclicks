import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  // Verify admin access
  const user = await stackServerApp.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const isAdmin = user.serverMetadata?.role === "ADMIN" || 
                  user.primaryEmail?.endsWith("@gtclicks.com");

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { action } = body; // "aprovar" or "cancelar"

    if (!["aprovar", "cancelar"].includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      );
    }

    const saque = await prisma.solicitacaoSaque.findUnique({
      where: { id },
    });

    if (!saque) {
      return NextResponse.json(
        { error: "Saque não encontrado" },
        { status: 404 }
      );
    }

    if (saque.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Saque já foi processado" },
        { status: 400 }
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
            decrement: parseFloat(saque.valor),
          },
        },
      });

      console.log(`✅ Saque ${id} aprovado: R$ ${saque.valor} enviado para ${saque.chavePix}`);
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
            decrement: parseFloat(saque.valor),
          },
          disponivel: {
            increment: parseFloat(saque.valor),
          },
        },
      });

      console.log(`❌ Saque ${id} cancelado: R$ ${saque.valor} devolvido ao saldo`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Erro ao processar saque" },
      { status: 500 }
    );
  }
}
