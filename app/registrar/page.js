import { SignUp } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="w-full max-w-5xl mx-auto px-8 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Badge>Criar Conta</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Comece agora</h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          Crie sua conta gratuita para comprar fotos dos seus melhores momentos ou vender a cobertura dos seus eventos.
        </p>
      </div>

      <div className="bg-card border text-card-foreground shadow-lg max-w-md mx-auto p-6">
        <SignUp fullPage={false} />
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
