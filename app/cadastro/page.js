import Link from "next/link";
import { getUser } from "@stackframe/stack";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export default async function CadastroPage() {
  const user = await getUser();
  
  // Check if user already has a photographer profile
  let hasProfile = false;
  if (user) {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });
    hasProfile = !!fotografo;
  }

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <span className="pill">Seja Fotógrafo</span>
          <h1>Comece a vender suas fotos</h1>
          <p>
            Junte-se à comunidade de fotógrafos do GTClicks e transforme sua
            paixão em renda. É rápido, fácil e você define seus próprios preços.
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📸</div>
            <h3>Você no controle</h3>
            <p>Defina seus próprios preços e mantenha 80% de cada venda</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>💰</div>
            <h3>Pagamentos rápidos</h3>
            <p>Receba via Pix ou transferência bancária com saque mínimo de R$ 50</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3>Proteção automática</h3>
            <p>Suas fotos são protegidas com marca d'água e anti-cópia</p>
          </div>
        </div>

        <div className={styles.cta}>
          {user ? (
            hasProfile ? (
              <div className={styles.alreadyMember}>
                <p>✅ Você já tem um perfil de fotógrafo!</p>
                <Link href="/dashboard/fotografo/upload" className="btn btn-primary">
                  Fazer Upload
                </Link>
              </div>
            ) : (
              <div className={styles.createProfile}>
                <h2>Crie seu perfil agora</h2>
                <p>Clique abaixo para começar. Vamos criar seu perfil automaticamente.</p>
                <Link href="/dashboard/fotografo/upload" className="btn btn-primary">
                  Criar Meu Perfil de Fotógrafo
                </Link>
              </div>
            )
          ) : (
            <div className={styles.loginPrompt}>
              <h2>Pronto para começar?</h2>
              <p>Faça login ou crie uma conta para começar a vender suas fotos.</p>
              <Link href="/login" className="btn btn-primary">
                Entrar ou Criar Conta
              </Link>
            </div>
          )}
        </div>

        <div className={styles.howItWorks}>
          <h2>Como funciona</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Crie seu perfil</h3>
              <p>Cadastre-se gratuitamente e crie seu perfil de fotógrafo</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Faça upload</h3>
              <p>Envie suas melhores fotos e defina os preços</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Receba pagamentos</h3>
              <p>Quando alguém comprar, você recebe 80% do valor direto na sua conta</p>
            </div>
          </div>
        </div>

        <div className={styles.faq}>
          <h2>Perguntas frequentes</h2>
          <details>
            <summary>Quanto custa para vender no GTClicks?</summary>
            <p>É totalmente gratuito! Cobramos apenas 20% de comissão sobre cada venda realizada.</p>
          </details>
          <details>
            <summary>Como recebo meus pagamentos?</summary>
            <p>Você pode sacar via Pix ou transferência bancária sempre que tiver um saldo mínimo de R$ 50.</p>
          </details>
          <details>
            <summary>Minhas fotos ficam protegidas?</summary>
            <p>Sim! Aplicamos marca d'água automática e proteção anti-cópia em todas as previews.</p>
          </details>
          <details>
            <summary>Posso definir meus próprios preços?</summary>
            <p>Absolutamente! Você tem total controle sobre os preços de cada licença das suas fotos.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
