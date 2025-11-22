import UploadDashboard from "./UploadDashboard";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard do Fotografo | Upload",
};

export default function PhotographerUploadPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <span className="pill">Upload</span>
        <h1>Envie fotos individuais ou crie colecoes completas</h1>
        <p>
          Colete os links assinados via /api/upload, organize as fotos em colecoes existentes ou crie uma nova serie. Se preferir, mantenha-as como itens avulsos e publique em poucos cliques.
        </p>
      </div>
      <UploadDashboard />
    </section>
  );
}
