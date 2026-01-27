import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type = "PIX_UPDATE" } = body;

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save to DB
    await prisma.verificationCode.create({
      data: {
        email: user.email,
        code,
        type,
        expiresAt,
      },
    });

    // Send Email
    const result = await sendVerificationEmail(user.email, code);

    if (!result.success) {
      return NextResponse.json(
        { error: "Falha ao enviar email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Código enviado" });
  } catch (error) {
    console.error("Error sending code:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
