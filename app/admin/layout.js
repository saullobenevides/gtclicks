'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function AdminLayout({ children }) {
  const user = useUser();
  const isLoading = user === undefined;
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/usuarios', label: 'Usuários' },
    { href: '/admin/colecoes', label: 'Coleções' },
    { href: '/admin/pedidos', label: 'Pedidos' },
  ];

  useEffect(() => {
    async function checkAdminRole() {
      
      // Don't check if still loading or already checking
      if (isLoading || checking) {
        return;
      }
      
      // If no user after loading, redirect to login
      if (!user) {
        router.push('/login?callbackUrl=/admin');
        return;
      }
      
      // User is logged in, check admin role
      if (user.primaryEmail) {
        setChecking(true);
        try {
          
          const response = await fetch('/api/users/me', {
            headers: {
              'x-stack-auth-email': user.primaryEmail
            }
          });
          const userData = await response.json();
          
          if (userData.role === 'ADMIN') {
            setIsAdmin(true);
          } else {
            router.push('/?error=unauthorized');
          }
        } catch (error) {
          console.error('[Admin Layout] Error checking admin role:', error);
          router.push('/?error=unauthorized');
        } finally {
          setChecking(false);
        }
      }
    }
    
    checkAdminRole();
  }, [user, isLoading, router, checking]);

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
