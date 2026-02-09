import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { email?: string; name?: string };
    const { email, name } = body;

    const id = user.id;

    if (!email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || undefined,
      },
      create: {
        id,
        email,
        name: name ?? "",
        role: "CLIENTE",
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
