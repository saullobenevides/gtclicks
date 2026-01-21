export const dynamic = "force-dynamic";

import { SignIn } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function LoginPage(props) {
  const searchParams = await props.searchParams;
  let redirectUrl = searchParams?.callbackUrl;

  if (searchParams?.callbackUrl) {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("callbackUrl");
    newParams.set("after_auth_return_to", searchParams.callbackUrl);
    redirect(`/login?${newParams.toString()}`);
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-8 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Badge>Login</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Acesse sua conta
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          <strong>Participante:</strong> acesse e baixe suas fotos compradas.
          <br />
          <strong>Fotógrafo:</strong> gerencie seus eventos, uploads e acompanhe
          suas vendas.
        </p>
      </div>

      <div className="bg-card border text-card-foreground shadow-lg max-w-md mx-auto p-6">
        <SignIn fullPage={false} redirectUrl={redirectUrl} />
      </div>
    </section>
  );
}
