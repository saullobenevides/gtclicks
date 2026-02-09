"use client";

import { Suspense, useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter, usePathname } from "next/navigation";
import { Home, Folder, Images, Wallet, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "./loading";

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

    const primaryEmailVerified = (user as { primaryEmailVerified?: boolean }).primaryEmailVerified;
    if (primaryEmailVerified === false) {
      router.push("/dashboard/fotografo/verificar-email");
      return;
    }

    const checkProfile = async () => {
      try {
        if (pathname === "/dashboard/fotografo/onboarding" || pathname === "/dashboard/fotografo/verificar-email") {
          setChecking(false);
          return;
        }

        const meRes = await fetch("/api/users/me", {
          headers: {
            "x-stack-auth-email":
              (user as { primaryEmail?: string; email?: string })
                .primaryEmail ??
              (user as { email?: string }).email ??
              "",
          },
        });
        if (!meRes.ok) {
          setChecking(false);
          return;
        }
        const meData = (await meRes.json()) as { role?: string };
        const role = meData?.role;
        if (role !== "FOTOGRAFO" && role !== "ADMIN") {
          router.push("/?error=unauthorized");
          return;
        }

        const res = await fetch(`/api/fotografos/resolve?userId=${user.id}`);
        if (res.ok) {
          const data = (await res.json()) as { data?: unknown };
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

  if (pathname === "/dashboard/fotografo/onboarding" || pathname === "/dashboard/fotografo/verificar-email") {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    );
  }

  if (checking) {
    return (
      <DashboardLayout navItems={navItems}>
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    </DashboardLayout>
  );
}
