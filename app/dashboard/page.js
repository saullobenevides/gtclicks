import { stackServerApp } from "@/stack/server";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export const metadata = {
  title: "Dashboard | GTClicks",


export default async function DashboardPage() {
  // 1. Verificar autenticação
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  // 2. Verificar role no nosso banco
  const dbUser = await prisma.user.findUnique({
    where: { email: user.primaryEmail },
    include: { fotografo: true },
  });

  // 3. Lógica de roteamento
  if (dbUser?.role === "FOTOGRAFO" || dbUser?.fotografo) {
    redirect("/dashboard/fotografo");
  }

  // Se nao for fotografo, mostra dashboard de cliente
  return <ClientDashboard user={user} />;
}