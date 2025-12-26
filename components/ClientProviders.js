'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { StackTheme } from "@stackframe/stack";
import Footer from "@/components/layout/Footer";

// Dynamically import components that rely on browser-only features (like Stack Auth's useUser hook in SSR context)
const CartProvider = dynamic(() => import('../features/cart/context/CartContext').then(mod => mod.CartProvider), { ssr: false });
const UserSync = dynamic(() => import('@/components/UserSync'), { ssr: false });
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });

export default function ClientProviders({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <UserSync />
      </Suspense>
      <Suspense fallback={null}>
        <CartProvider>
          <StackTheme appearance="dark">
            <Header />
            <main className="flex-1 w-full pt-20">{children}</main>
            <Footer />
          </StackTheme>
        </CartProvider>
      </Suspense>
    </>
  );
}
