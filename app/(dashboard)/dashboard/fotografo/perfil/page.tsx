import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import PhotographerProfileForm from "@/components/dashboard/PhotographerProfileForm";
import { getFotografoByUserId } from "./_data-access/perfil";

export const dynamic = "force-dynamic";
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

  const photographer = await getFotografoByUserId(user.id);

  if (!photographer) {
    redirect("/dashboard/fotografo");
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-1">
        <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie suas informações públicas e dados de recebimento
        </p>
      </div>

      <PhotographerProfileForm photographer={photographer} />
    </div>
  );
}
