'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/DashboardLayout';

export default function AdminLayout({ children }) {
  const user = useUser();
  const isLoading = user === undefined;
  const router = useRouter();

  const navItems = [{ href: '/admin/saques', label: 'Saques' }];

  useEffect(() => {
    // If loading is finished and the user is not an admin, redirect.
    if (!isLoading && user?.serverMetadata?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // While loading or if user is not an admin, show a loading state.
  // This prevents flashing the content before the effect can redirect.
  if (isLoading || user?.serverMetadata?.role !== 'ADMIN') {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="flex w-full flex-1 items-center justify-center">
          <p>Verificando autorização...</p>
        </div>
      </DashboardLayout>
    );
  }

  // If authorized, show the admin content.
  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
