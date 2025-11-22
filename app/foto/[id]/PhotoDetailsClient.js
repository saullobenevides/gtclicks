"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import styles from "./photodetails.module.css";

export default function PhotoDetailsClient({ photo }) {
  const { addToCart } = useCart();
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/licencas")
      .then((res) => res.json())
      .then((data) => {
        setLicenses(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch licenses:", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = () => {
    if (!selectedLicense) return;

    const license = licenses.find(l => l.id === selectedLicense);
    if (!license) return;

    addToCart({
      fotoId: photo.id,
      licencaId: license.id,
      titulo: photo.titulo,
      preco: Number(license.precoPadrao),
      licenca: license.nome,
      previewUrl: photo.previewUrl,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        <div className="protected-container">
          <img 
            src={photo.previewUrl} 
            alt={photo.titulo}
            className="protected-image"
          />
        </div>
        <div className={styles.imageInfo}>
          <span>{photo.orientacao}</span>
          {photo.categoria && <span>• {photo.categoria}</span>}
        </div>
      </div>

      <div className={styles.detailsSection}>
  <div className={styles.header}>
    <h1>{photo.titulo}</h1>
    {photo.descricao && <p className={styles.description}>{photo.descricao}</p>}
  </div>

  {photo.tags && (
    <div className={styles.tags}>
      {(Array.isArray(photo.tags) ? photo.tags : photo.tags.split(",")).map((tag, i) => (
        <span key={i} className={styles.tag}>{tag.trim()}</span>
      ))}
    </div>
  )}

  <h3>Escolha uma licença</h3>
  {loading ? (
    <p>Carregando licenças...</p>
  ) : licenses.length === 0 ? (
    <p>Nenhuma licença disponível no momento.</p>
  ) : (
    licenses.map((license) => (
      <div
        key={license.id}
        className={`${styles.licenseCard} ${selectedLicense === license.id ? styles.selected : ''}`}
        onClick={() => setSelectedLicense(license.id)}
      >
        <div className={styles.licenseInfo}>
          <h4>{license.nome}</h4>
          <p>{license.descricao}</p>
        </div>
        <div className={styles.licensePrice}>
          R$ {Number(license.precoPadrao).toFixed(2)}
        </div>
      </div>
    ))
  )}
</div>
        <div className={styles.actions}>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={!selectedLicense}
            style={{ width: "100%" }}
          >
            {addedToCart ? "✓ Adicionado!" : "Adicionar ao Carrinho"}
          </button>
          {addedToCart && (
            <Link href="/carrinho" className="btn btn-outline" style={{ width: "100%" }}>
              Ver Carrinho
            </Link>
          )}
        </div>
        {photo.fotografo ? (
          <div className={styles.photographer}>
            <h4>Fotógrafo</h4>
            <Link href={`/fotografo/${photo.fotografo.username}`}>
              <div className={styles.photographerCard}>
                <div className={styles.photographerAvatar}>
                  {photo.fotografo.username?.[0]?.toUpperCase() || 'F'}
                </div>
                <div>
                  <div className={styles.photographerName}>
                    {photo.fotografo.username}
                  </div>
                  {photo.fotografo.bio && (
                    <div className={styles.photographerBio}>
                      {photo.fotografo.bio}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ) : null
      </div>
    </div>
  );
}
