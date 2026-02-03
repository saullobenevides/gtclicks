import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { getFotosByUserId } from "./_data-access/fotos";
import FotosContent from "./_components/FotosContent";

export const dynamic = "force-dynamic";

export default async function MinhasFotosPage() {
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    redirect("/login?redirect=/dashboard/fotografo/fotos");
  }

  const fotos = await getFotosByUserId(user.id);

  return <FotosContent fotos={fotos} />;
}
