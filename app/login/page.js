import { SignIn } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <section className="w-full max-w-5xl mx-auto px-8 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Badge>Login</Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Entre com poucos cliques</h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          Use e-mail, Google ou Facebook para acessar a GTClicks. Todo o historico de pedidos,
          downloads e favoritos fica sincronizado em todo o painel.
        </p>
      </div>

      <div className="bg-card border text-card-foreground shadow-lg max-w-md mx-auto p-6">
        <SignIn fullPage={false} />
      </div>
    </section>
  );
}
