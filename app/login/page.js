import { SignIn } from "@stackframe/stack";
import styles from "../styles/pageShell.module.css";

export default function LoginPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <span className="pill">Login</span>
        <h1>Entre com poucos cliques</h1>
        <p>
          Use e-mail, Google ou Facebook para acessar a GTClicks. Todo o historico de pedidos,
          downloads e favoritos fica sincronizado em todo o painel.
        </p>
      </div>

      <div className={`${styles.contentCard} ${styles.authCard}`}>
        <SignIn fullPage={false} />
      </div>
    </section>
  );
}
