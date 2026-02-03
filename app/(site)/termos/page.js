import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso do marketplace GTClicks.",
};

export default function TermosPage() {
  return (
    <div className="container-wide py-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Termos de Uso
          </h1>
          <p className="text-xl text-muted-foreground">
            Última atualização: {new Date().getFullYear()}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-gray-300">
          <p>
            Bem-vindo ao GTClicks. Ao acessar e usar nossa plataforma, você
            concorda com os termos descritos abaixo.
          </p>

          <h3>1. O Serviço</h3>
          <p>
            O GTClicks é um marketplace que conecta fotógrafos (Vendedores) a
            compradores interessados em adquirir licenças de uso de fotografias
            digitais. Nós atuamos como intermediadores da transação e
            processadores de pagamento.
          </p>

          <h3>2. Para Fotógrafos</h3>
          <p>
            Ao fazer upload de imagens, você declara ser o autor legítimo e
            detentor dos direitos autorais. Você concede ao GTClicks o direito
            de exibir e comercializar essas imagens conforme as licenças
            configuradas por você. O GTClicks retém uma taxa de serviço
            (comissão) sobre cada venda realizada, conforme tabela vigente.
          </p>

          <h3>3. Para Compradores (Licenças)</h3>
          <p>
            Ao adquirir uma foto, você não compra a propriedade intelectual da
            imagem, mas sim uma <strong>licença de uso</strong>.
          </p>
          <ul>
            <li>
              <strong>Uso Pessoal:</strong> Para redes sociais pessoais,
              wallpapers, impressões domésticas.
            </li>
            <li>
              <strong>Uso Comercial:</strong> Para sites, publicidade, materiais
              de marketing, conforme especificado na compra.
            </li>
          </ul>
          <p>
            É proibido revender, sublicenciar ou redistribuir os arquivos
            originais.
          </p>

          <h3>4. Pagamentos e Reembolsos</h3>
          <p>
            Os pagamentos são processados via Mercado Pago. Devido à natureza
            digital do produto (download imediato), não oferecemos reembolsos
            após o download do arquivo ter sido efetuado, exceto em casos de
            falha técnica comprovada do arquivo.
          </p>

          <h3>5. Propriedade Intelectual</h3>
          <p>
            Todo o conteúdo da plataforma (layout, código, marca) pertence ao
            GTClicks. As fotos pertencem aos seus respectivos fotógrafos.
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
