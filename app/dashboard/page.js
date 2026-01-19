import { stackServerApp } from "@/stack/server";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | GTClicks",
};

export default async function DashboardPage() {
  // 1. Verificar autenticação
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user from Stack Auth:", error);
    // If error occurs, user remains undefined/null, triggering redirect below
  }

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // 2. Verificar role no nosso banco
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { fotografo: true },
  });

  // 3. Lógica de roteamento
  if (dbUser?.role === "FOTOGRAFO" || dbUser?.fotografo) {
    redirect("/dashboard/fotografo");
  }

  // Se nao for fotografo, mostra dashboard de cliente
  return <ClientDashboard user={user} />;
}
