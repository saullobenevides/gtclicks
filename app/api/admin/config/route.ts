import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { setConfig, CONFIG_KEYS } from "@/lib/config";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const configs = await prisma.systemConfig.findMany();
  const configMap = configs.reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return NextResponse.json({ config: configMap });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      minSaque?: number;
      taxaPlataforma?: number;
    };
    const { minSaque, taxaPlataforma } = body;

    if (minSaque !== undefined) {
      await setConfig(CONFIG_KEYS.MIN_SAQUE, minSaque);
    }
    if (taxaPlataforma !== undefined) {
      await setConfig(CONFIG_KEYS.TAXA_PLATAFORMA, taxaPlataforma);
    }

    return NextResponse.json({
      success: true,
      message: "Configurações atualizadas",
    });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
