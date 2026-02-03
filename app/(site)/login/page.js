export const dynamic = "force-dynamic";

import { SignIn } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function LoginPage(props) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  if (callbackUrl) {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("callbackUrl");
    newParams.set("after_auth_return_to", callbackUrl);
    redirect(`/login?${newParams.toString()}`);
  }
  const redirectUrl = searchParams?.after_auth_return_to ?? callbackUrl;

  return (
    <section className="container-wide flex flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-10 md:py-12 lg:py-16">
      <div className="flex max-w-5xl flex-col gap-3">
        <Badge>Login</Badge>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Acesse sua conta
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          <strong>Participante:</strong> acesse e baixe suas fotos compradas.
          <br />
          <strong>Fotógrafo:</strong> gerencie seus eventos, uploads e acompanhe
          suas vendas.
        </p>
      </div>

      <div className="glass-panel border-border/50 w-full max-w-md rounded-radius-xl p-4 shadow-shadow-card sm:p-6">
        <SignIn fullPage={false} redirectUrl={redirectUrl} />
      </div>
    </section>
  );
}
