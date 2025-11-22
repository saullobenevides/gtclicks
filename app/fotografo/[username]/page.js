import { getPhotographerByUsername } from "@/lib/data/marketplace";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../styles/pageShell.module.css";

export default async function PhotographerProfilePage({ params }) {
  const { username } = params;
  
  const photographer = await getPhotographerByUsername(username);

  if (!photographer) {
    notFound();
  }

  // Fetch photographer photos
  const photosResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fotografos/by-username/${username}/fotos`,
    { cache: 'no-store' }
  );
  
  const { data: photos = [] } = photosResponse.ok ? await photosResponse.json() : { data: [] };

  return (
    <div className="container">
      <section className={styles.page}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {photographer.avatarUrl ? (
              <img src={photographer.avatarUrl} alt={photographer.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {photographer.name?.charAt(0) || photographer.username?.charAt(1)}
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1>{photographer.name || photographer.username}</h1>
            <p className={styles.username}>{photographer.username}</p>
            {photographer.cidade && (
              <p className={styles.location}>📍 {photographer.cidade}</p>
            )}
            {photographer.bio && (
              <p className={styles.bio}>{photographer.bio}</p>
            )}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>{photographer.colecoesPublicadas || 0}</strong>
                <span>Coleções</span>
              </div>
              <div className={styles.stat}>
                <strong>{photos.length}</strong>
                <span>Fotos</span>
              </div>
              <div className={styles.stat}>
                <strong>{photographer.downloads || 0}</strong>
                <span>Downloads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className={styles.photosSection}>
          <h2>Fotos Publicadas</h2>
          {photos.length === 0 ? (
            <p className={styles.empty}>Este fotógrafo ainda não publicou fotos.</p>
          ) : (
            <div className={styles.grid}>
              {photos.map((foto) => (
                <Link
                  key={foto.id}
                  href={`/foto/${foto.id}`}
                  className={styles.photoCard}
                >
                  <div className={styles.photoImage}>
                    {foto.previewUrl ? (
                      <img src={foto.previewUrl} alt={foto.titulo} />
                    ) : (
                      <div className={styles.placeholder}></div>
                    )}
                  </div>
                  <div className={styles.photoInfo}>
                    <h3>{foto.titulo}</h3>
                    {foto.categoria && (
                      <span className={styles.category}>{foto.categoria}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
