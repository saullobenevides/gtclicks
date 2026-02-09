import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade",
  description: "Como tratamos seus dados no GTClicks.",
};

export default function PrivacidadePage() {
  return (
    <div className="container-wide py-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-xl text-muted-foreground">
            Compromisso com a LGPD e sua segurança.
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300">
          <p>
            No GTClicks, levamos sua privacidade a sério. Esta política descreve
            como coletamos, usamos e protegemos seus dados pessoais.
          </p>

          <h3>1. Dados Coletados</h3>
          <ul>
            <li>
              <strong>Cadastro:</strong> Nome, e-mail e foto de perfil (via
              autenticação).
            </li>
            <li>
              <strong>Fotógrafos:</strong> Dados bancários ou Chave PIX para
              repasse de valores (processados de forma segura).
            </li>
            <li>
              <strong>Transações:</strong> Histórico de compras e vendas. Não
              armazenamos números completos de cartão de crédito; isso é gerido
              integralmente pelo nosso processador de pagamentos (Asaas).
            </li>
          </ul>

          <h3>2. Finalidade do Uso</h3>
          <p>Utilizamos seus dados para:</p>
          <ul>
            <li>Processar pedidos e entregar os downloads digitais.</li>
            <li>Gerenciar pagamentos e comissões de fotógrafos.</li>
            <li>Enviar notificações importantes sobre sua conta ou pedidos.</li>
            <li>Melhorar a experiência de navegação na plataforma.</li>
          </ul>

          <h3>3. Compartilhamento de Dados</h3>
          <p>
            Não vendemos seus dados para terceiros. Compartilhamos informações
            apenas com parceiros essenciais para a operação, como:
          </p>
          <ul>
            <li>
              <strong>Processadores de Pagamento:</strong> Para efetuar
              cobranças e repasses.
            </li>
            <li>
              <strong>Infraestrutura:</strong> Servidores de hospedagem e banco
              de dados seguros.
            </li>
          </ul>

          <h3>4. Seus Direitos</h3>
          <p>
            Você pode solicitar a exclusão da sua conta e de seus dados pessoais
            a qualquer momento através do nosso canal de suporte, ressalvada a
            guarda obrigatória de registros fiscais e de transações financeiras
            exigida por lei.
          </p>
        </div>

        <div className="pt-8 border-t border-white/10">
          <Button asChild>
            <Link href="/">Voltar para o Início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
