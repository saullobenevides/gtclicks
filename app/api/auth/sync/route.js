import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  try {
    // 1. Security: Authenticate User First
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    // 2. Security: Use Authenticated ID, not body ID
    const id = user.id;

    if (!email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Upsert user in Prisma
    const dbUser = await prisma.user.upsert({
      where: { id: id },
      update: {
        email: email,
        name: name || undefined,
      },
      create: {
        id: id,
        email: email,
        name: name,
        role: "CLIENTE", // Default role
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
