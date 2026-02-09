import { Suspense } from "react";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import FotosDataLoader from "./FotosDataLoader";
import FotosSkeleton from "./FotosSkeleton";

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

  return (
    <Suspense fallback={<FotosSkeleton />}>
      <FotosDataLoader userId={user.id} />
    </Suspense>
  );
}
