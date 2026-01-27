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
  const checkingRef = useRef(false);

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/colecoes", label: "Coleções" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/saques", label: "Saques" },
    { href: "/admin/configuracoes", label: "Configurações" },
  ];

  useEffect(() => {
    let isCancelled = false;

    async function checkAdminRole() {
      // Don't check if still loading
      if (isLoading) {
        return;
      }

      // If no user after loading, redirect to login
      if (!user) {
        router.push("/login?callbackUrl=/admin");
        return;
      }

      // User is logged in, check admin role (only once)
      if (user.primaryEmail && isAdmin === null && !checkingRef.current) {
        checkingRef.current = true;
        try {
          const response = await fetch("/api/users/me", {
            headers: {
              "x-stack-auth-email": user.primaryEmail,
            },
          });

          if (isCancelled) return;

          const userData = await response.json();

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
