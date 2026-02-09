export const dynamic = "force-dynamic";

import { SignUp } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";

interface RegisterPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    after_auth_return_to?: string;
  }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  if (callbackUrl) {
    const paramsObj: Record<string, string> = {};
    for (const [k, v] of Object.entries(searchParams || {})) {
      if (v != null && k !== "callbackUrl") paramsObj[k] = String(v);
    }
    paramsObj.after_auth_return_to = callbackUrl;
    redirect(`/registrar?${new URLSearchParams(paramsObj).toString()}`);
  }
  const redirectUrl = searchParams?.after_auth_return_to ?? callbackUrl;

  return (
    <section className="container-wide flex flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-10 md:py-12 lg:py-16">
      <div className="flex max-w-5xl flex-col gap-3">
        <Badge>Criar Conta</Badge>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Comece agora
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          Crie sua conta gratuita para comprar fotos dos seus melhores momentos
          ou vender a cobertura dos seus eventos.
        </p>
      </div>

      <div className="glass-panel border-border/50 w-full max-w-md rounded-radius-xl p-6 shadow-shadow-card">
        {/* @ts-expect-error Stack SignUp accepts redirectUrl at runtime */}
        <SignUp fullPage={false} redirectUrl={redirectUrl} />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </section>
  );
}
