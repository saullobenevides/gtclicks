"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

// Helper for username generation
function generateUniqueUsername(baseName: string) {
  let username = baseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `@${username}_${randomSuffix}`;
}

const photographerSchema = z.object({
  username: z.string().min(3).optional(),
  bio: z.string().optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  instagram: z.string().optional(),
  portfolioUrl: z.string().optional(),
  chavePix: z.string().optional(),
  equipamentos: z.string().optional(),
  especialidades: z.array(z.string()).optional(),
  cpf: z.string().optional(),
});

export async function createPhotographer(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const rawData = {
    username: formData.get("username"),
    bio: formData.get("bio"),
    telefone: formData.get("telefone"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    instagram: formData.get("instagram"),
    chavePix: formData.get("chavePix"),
  };

  try {
    const existing = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return { success: true, data: existing };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name || "Fotógrafo",
          email: user.email,
          role: "FOTOGRAFO",
        },
      });
    } else if (dbUser.role !== "FOTOGRAFO") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "FOTOGRAFO" },
      });
    }

    let finalUsername = rawData.username?.toString();
    if (!finalUsername) {
      const baseName = user.name || user.email?.split("@")[0] || "fotografo";
      finalUsername = generateUniqueUsername(baseName);
      let attempt = 0;
      while (attempt < 10) {
        const exists = await prisma.fotografo.findUnique({
          where: { username: finalUsername },
        });
        if (!exists) break;
        finalUsername = generateUniqueUsername(baseName);
        attempt++;
      }
      if (attempt >= 10) throw new Error("Falha ao gerar username único");
    } else {
      if (finalUsername.startsWith("@"))
        finalUsername = finalUsername.substring(1);
    }

    const newPhotographer = await prisma.fotografo.create({
      data: {
        userId: user.id,
        username: finalUsername,
        bio: rawData.bio?.toString() || "Fotógrafo profissional",
        telefone: rawData.telefone?.toString(),
        cidade: rawData.cidade?.toString(),
        estado: rawData.estado?.toString(),
        instagram: rawData.instagram?.toString(),
        chavePix: rawData.chavePix?.toString(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: newPhotographer };
  } catch (error) {
    console.error("Erro ao criar fotógrafo:", error);
    return { error: "Falha ao criar perfil" };
  }
}

export async function updatePhotographer(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  const rawData = {
    bio: formData.get("bio"),
    telefone: formData.get("telefone"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    instagram: formData.get("instagram"),
    chavePix: formData.get("chavePix"),
    portfolioUrl: formData.get("portfolioUrl"),
    equipamentos: formData.get("equipamentos"),
    cpf: formData.get("cpf"),
  };

  try {
    const updated = await prisma.fotografo.update({
      where: { userId: user.id },
      data: {
        bio: rawData.bio?.toString(),
        telefone: rawData.telefone?.toString(),
        cidade: rawData.cidade?.toString(),
        estado: rawData.estado?.toString(),
        instagram: rawData.instagram?.toString(),
        chavePix: rawData.chavePix?.toString(),
        portfolioUrl: rawData.portfolioUrl?.toString(),
        equipamentos: rawData.equipamentos?.toString(),
        cpf: rawData.cpf?.toString(),
        especialidades: formData.getAll("especialidades") as string[],
      },
    });

    revalidatePath(`/fotografos/${updated.username}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erro ao atualizar fotógrafo:", error);
    return { error: "Falha ao atualizar perfil" };
  }
}

/**
 * Busca dados financeiros do fotógrafo autenticado
 */
export async function getFinancialData() {
  console.log("[Action] getFinancialData: Starting...");
  const user = await getAuthenticatedUser();
  if (!user) {
    console.warn("[Action] getFinancialData: No user authenticated.");
    return { error: "Não autorizado" };
  }
  console.log("[Action] getFinancialData: User authenticated:", user.id);

  try {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      console.warn(
        "[Action] getFinancialData: Photographer profile not found for user:",
        user.id,
      );
      return { error: "Perfil de fotógrafo não encontrado" };
    }
    console.log("[Action] getFinancialData: Photographer found:", fotografo.id);

    const rawSaldo = await prisma.saldo.upsert({
      where: { fotografoId: fotografo.id },
      create: {
        fotografoId: fotografo.id,
        disponivel: 0,
        bloqueado: 0,
      },
      update: {},
    });
    console.log("[Action] getFinancialData: Saldo upserted.");

    const rawTransacoes = await prisma.transacao.findMany({
      where: { fotografoId: fotografo.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    console.log(
      "[Action] getFinancialData: Transactions found:",
      rawTransacoes.length,
    );

    let minSaque = 50;
    try {
      minSaque = await getConfigNumber(CONFIG_KEYS.MIN_SAQUE);
      console.log("[Action] getFinancialData: Config fetched:", minSaque);
    } catch (configError) {
      console.error(
        "[Action] getFinancialData: Error fetching config, using default 50.",
        configError,
      );
    }

    // Converte Decimals para Numbers para evitar erro de serialização
    const saldo = {
      disponivel: Number(rawSaldo.disponivel),
      bloqueado: Number(rawSaldo.bloqueado),
    };

    const transacoes = rawTransacoes.map((t) => ({
      ...t,
      valor: Number(t.valor),
    }));

    console.log("[Action] getFinancialData: Success.");
    return {
      success: true,
      data: {
        saldo,
        transacoes,
        chavePix: fotografo.chavePix,
        minSaque,
      },
    };
  } catch (error: any) {
    console.error("[Action] getFinancialData CRITICAL error:", error);
    return {
      error: `Falha ao buscar dados financeiros: ${error.message || "Erro desconhecido"}`,
    };
  }
}

/**
 * Atualiza a chave PIX do fotógrafo (requer código de verificação 2FA)
 */
export async function updatePixKey(data: { chavePix: string; code: string }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  const { chavePix, code } = data;

  if (!chavePix || !code) {
    return { error: "Chave PIX e código de verificação são obrigatórios" };
  }

  try {
    // Verify 2FA code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: user.email,
        code: code,
        type: "PIX_UPDATE",
        expiresAt: { gt: new Date() },
      },
    });

    if (!validCode) {
      return { error: "Código inválido ou expirado" };
    }

    // Delete used code to prevent replay attacks
    await prisma.verificationCode.delete({ where: { id: validCode.id } });

    // Get photographer
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return { error: "Perfil de fotógrafo não encontrado" };
    }

    // Update with security: PIX key = CPF (enforced)
    const updated = await prisma.fotografo.update({
      where: { userId: user.id },
      data: {
        chavePix,
        cpf: chavePix, // Force sync for security
      },
    });

    revalidatePath("/dashboard/fotografo/financeiro");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("[Action] updatePixKey error:", error);
    return { error: "Erro ao atualizar chave PIX" };
  }
}
