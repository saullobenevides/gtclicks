"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const FETCH_TIMEOUT_MS = 15000;
const ERROR_TIMEOUT_MS = 15000;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const checkingRef = useRef(false);

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/colecoes", label: "Coleções" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/saques", label: "Saques" },
    { href: "/admin/configuracoes", label: "Configurações" },
    { href: "/admin/financeiro", label: "Financeiro" },
  ];

  const checkAdminRole = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setErrorMsg(null);
    setRetrying(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch("/api/admin/check", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login?callbackUrl=/admin");
        return;
      }

      if (data.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/?error=unauthorized");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setErrorMsg(
          "A verificação demorou muito. Verifique sua conexão e tente novamente."
        );
        setRetrying(true);
      } else {
        setIsAdmin(false);
        router.push("/?error=unauthorized");
      }
    } finally {
      checkingRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin === null && !errorMsg) {
        setErrorMsg(
          "Verificação demorou muito. Verifique sua conexão e tente novamente."
        );
        setRetrying(true);
      }
    }, ERROR_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isAdmin, errorMsg]);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  // While checking permissions
  if (isAdmin === null) {
    if (errorMsg) {
      return (
        <DashboardLayout navItems={navItems}>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
            <p className="text-red-500 font-semibold">{errorMsg}</p>
            <div className="flex gap-3">
              {retrying && (
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                  onClick={() => {
                    setIsAdmin(null);
                    checkAdminRole();
                  }}
                >
                  Tentar novamente
                </button>
              )}
              <button
                className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 border border-white/20"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout navItems={navItems}>
        <div className="flex w-full flex-1 items-center justify-center">
          <p>Verificando autorização...</p>
        </div>
      </DashboardLayout>
    );
  }

  // If not admin, show nothing (will redirect)
  if (!isAdmin) {
    return null;
  }

  // If authorized, show the admin content
  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
