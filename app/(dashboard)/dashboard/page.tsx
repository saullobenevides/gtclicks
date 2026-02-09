import { stackServerApp } from "@/stack/server";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user from Stack Auth:", error);
  }

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { fotografo: true },
  });

  if (dbUser?.role === "FOTOGRAFO" || dbUser?.fotografo) {
    redirect("/dashboard/fotografo");
  }

  return <ClientDashboard user={user} />;
}
