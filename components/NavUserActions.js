"use client";

import Link from "next/link";
import { useUser } from "@stackframe/stack";
import { useState, useEffect } from "react";

export default function NavUserActions() {
  const user = useUser();
  const [isPhotographer, setIsPhotographer] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if user is photographer
    fetch(`/api/fotografos/resolve?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data?.id) {
          setIsPhotographer(true);
        }
      })
      .catch(() => setIsPhotographer(false));
  }, [user]);

  if (!user) {
    return (
      <Link href="/cadastro" className="btn btn-primary btn-sm">
        Seja Fotógrafo
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {isPhotographer ? (
        <>
          <Link href="/dashboard/fotografo/fotos" className="nav-link">
            🖼️ Fotos
          </Link>
          <Link href="/dashboard/fotografo/upload" className="nav-link">
            📤 Upload
          </Link>
          <Link href="/dashboard/fotografo/financeiro" className="nav-link">
            💰 Financeiro
          </Link>
        </>
      ) : (
        <Link href="/cadastro" className="btn btn-outline btn-sm">
          Seja Fotógrafo
        </Link>
      )}
    </div>
  );
}
