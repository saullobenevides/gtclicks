"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerificarEmailPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }
    if (user && (user as { primaryEmailVerified?: boolean }).primaryEmailVerified) {
      router.push("/dashboard/fotografo");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const primaryEmail = (user as { primaryEmail?: string }).primaryEmail;

  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-white/10 bg-black/20">
        <CardHeader>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 mx-auto mb-4">
            <Mail className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-center text-xl">
            Verifique seu email
          </CardTitle>
          <CardDescription className="text-center">
            Para criar seu perfil de fotógrafo e receber pagamentos, precisamos
            confirmar que você tem acesso ao seu email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {primaryEmail && (
            <p className="rounded-lg bg-white/5 p-3 text-center text-sm">
              Enviamos um link de verificação para{" "}
              <strong className="text-foreground">{primaryEmail}</strong>
            </p>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Abra seu email</p>
            <p>2. Clique no link de verificação</p>
            <p>3. Volte aqui e recarregue a página</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild variant="default" className="w-full">
              <Link href="/handler/account-settings">
                Configurações da conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Na configuração da conta você pode reenviar o email de verificação
              se não recebeu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
