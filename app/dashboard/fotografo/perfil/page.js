import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import PhotographerProfileForm from "@/components/dashboard/PhotographerProfileForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Meu Perfil | Dashboard",
};

export default async function ProfilePage() {
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    redirect("/login?callbackUrl=/dashboard/fotografo/perfil");
  }

  const photographer = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!photographer) {
    // If somehow landed here without profile, redirect to onboarding or dashboard root
    redirect("/dashboard/fotografo");
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações públicas e dados de recebimento.
        </p>
      </div>

      <PhotographerProfileForm photographer={photographer} />
    </div>
  );
}
