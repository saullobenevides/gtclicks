"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

export default function AdminLayout({ children }) {
  const user = useUser();
  const isLoading = user === undefined;
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
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

  useEffect(() => {
    // Safety timeout: stop infinite loading after 10s
    const timer = setTimeout(() => {
      if (isLoading || isAdmin === null) {
        console.error("[AdminLayout] Auth check timed out");
        setErrorMsg("Tempo limite de verificação excedido. Tente recarregar.");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading, isAdmin]);

  useEffect(() => {
    let isCancelled = false;

    async function checkAdminRole() {
      console.log(
        "[AdminLayout] Check triggered. Loading:",
        isLoading,
        "User:",
        user ? user.id : "none",
      );

      // Don't check if still loading
      if (isLoading) {
        return;
      }

      // If no user after loading, redirect to login
      if (!user) {
        console.log("[AdminLayout] No user, redirecting...");
        router.push("/login?callbackUrl=/admin");
        return;
      }

      // Critical Fix: Handle case where user exists but has no primaryEmail
      if (!user.primaryEmail) {
        console.error("[Admin Layout] User has no primaryEmail", user);
        router.push("/?error=no_email");
        return;
      }

      // User is logged in, check admin role (only once)
      if (user.primaryEmail && isAdmin === null && !checkingRef.current) {
        console.log(
          "[AdminLayout] Checking admin role for:",
          user.primaryEmail,
        );
        checkingRef.current = true;
        try {
          const response = await fetch("/api/users/me", {
            headers: {
              "x-stack-auth-email": user.primaryEmail,
            },
          });
          console.log("[AdminLayout] API Response status:", response.status);

          if (isCancelled) return;

          const userData = await response.json();
          console.log("[AdminLayout] User Role:", userData.role);

          if (userData.role === "ADMIN") {
            setIsAdmin(true);
          } else {
            router.push("/?error=unauthorized");
          }
        } catch (error) {
          console.error("[Admin Layout] Error checking admin role:", error);
          if (!isCancelled) {
            router.push("/?error=unauthorized");
          }
        } finally {
          if (!isCancelled) {
            checkingRef.current = false;
          }
        }
      }
    }

    checkAdminRole();

    return () => {
      isCancelled = true;
    };
  }, [user, isLoading, router, isAdmin]);

  // While loading or checking permissions
  if (isLoading || isAdmin === null) {
    if (errorMsg) {
      return (
        <DashboardLayout navItems={navItems}>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
            <p className="text-red-500 font-semibold">{errorMsg}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </button>
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
