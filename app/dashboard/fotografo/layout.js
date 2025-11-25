'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '../../../components/DashboardLayout';

export default function PhotographerLayout({ children }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const navItems = [
    { href: '/dashboard/fotografo', label: 'Início' },
    { href: '/dashboard/fotografo/fotos', label: 'Minhas Fotos' },
    { href: '/dashboard/fotografo/upload', label: 'Enviar Fotos' },
    { href: '/dashboard/fotografo/financeiro', label: 'Financeiro' },
  ];

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    }
    if (!user) return;

    const checkProfile = async () => {
      try {
        if (pathname === '/dashboard/fotografo/onboarding') {
          setChecking(false);
          return;
        }

        const res = await fetch(`/api/fotografos/resolve?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.data) {
            router.push('/dashboard/fotografo/onboarding');
          } else {
            setChecking(false);
          }
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setChecking(false);
      }
    };

    checkProfile();
  }, [user, pathname, router]);

  // Onboarding page has a different, simpler layout
  if (pathname === '/dashboard/fotografo/onboarding') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="flex w-full flex-1 items-center justify-center">
          <p>Verificando perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
