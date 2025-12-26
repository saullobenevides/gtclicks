'use client';

import { Suspense } from 'react';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { CartProvider } from "@/features/cart/context/CartContext";
import UserSync from "@/components/UserSync";

export default function AppProviders({ children }) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme appearance="dark">
        <Suspense fallback={<div />}>
          <UserSync />
          <CartProvider>
            {children}
          </CartProvider>
        </Suspense>
      </StackTheme>
    </StackProvider>
  );
}