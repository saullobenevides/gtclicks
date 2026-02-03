"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter, usePathname } from "next/navigation";
import { Home, Folder, Images, Wallet, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "./loading";

export default function PhotographerLayout({ children }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const navItems = [
    { href: "/dashboard/fotografo", label: "Início", icon: Home },
    {
      href: "/dashboard/fotografo/colecoes",
      label: "Minhas Coleções",
      icon: Folder,
    },
    { href: "/dashboard/fotografo/fotos", label: "Minhas Fotos", icon: Images },
    {
      href: "/dashboard/fotografo/financeiro",
      label: "Financeiro",
      icon: Wallet,
    },
    { href: "/dashboard/fotografo/perfil", label: "Meu Perfil", icon: User },
  ];

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }
    if (!user) return;

    const checkProfile = async () => {
      try {
        if (
          pathname === "/dashboard/fotografo/onboarding" ||
          pathname === "/dashboard/fotografo/stripe-connect"
        ) {
          setChecking(false);
          return;
        }

        // Validar role: apenas FOTOGRAFO ou ADMIN acedem ao dashboard (Manual v3.0)
        const meRes = await fetch("/api/users/me", {
          headers: {
            "x-stack-auth-email": user.primaryEmail || user.email || "",
          },
        });
        if (!meRes.ok) {
          setChecking(false);
          return;
        }
        const meData = await meRes.json();
        const role = meData?.role;
        if (role !== "FOTOGRAFO" && role !== "ADMIN") {
          router.push("/?error=unauthorized");
          return;
        }

        const res = await fetch(`/api/fotografos/resolve?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.data) {
            router.push("/dashboard/fotografo/onboarding");
          } else {
            setChecking(false);
          }
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setChecking(false);
      }
    };

    checkProfile();
  }, [user, pathname, router]);

  // Onboarding page has a different, simpler layout
  if (pathname === "/dashboard/fotografo/onboarding") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <DashboardLayout navItems={navItems}>
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
