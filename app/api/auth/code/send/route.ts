import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";

const MAX_CODES_PER_WINDOW = 3;
const WINDOW_MINUTES = 15;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { type?: string };
    const { type = "PIX_UPDATE" } = body;

    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
    const recentCount = await prisma.verificationCode.count({
      where: {
        email: user.email,
        type,
        createdAt: { gte: since },
      },
    });

    if (recentCount >= MAX_CODES_PER_WINDOW) {
      return NextResponse.json(
        {
          error: `Muitas tentativas. Aguarde ${WINDOW_MINUTES} minutos antes de solicitar outro código.`,
        },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        email: user.email,
        code,
        type,
        expiresAt,
      },
    });

    const result = await sendVerificationEmail(user.email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: "Falha ao enviar email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Código enviado" });
  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
