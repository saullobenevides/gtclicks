"use client";

import { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { CartProvider } from "@/features/cart/context/CartContext";
import { PhotoModalProvider } from "@/components/providers/PhotoModalProvider";
import UserSync from "@/components/UserSync";
import { ptBRTranslations } from "@/lib/stack-translations";

export default function AppProviders({ children }) {
  return (
    <StackProvider app={stackClientApp} translationOverrides={ptBRTranslations}>
      <StackTheme appearance="dark">
        <Suspense fallback={<div />}>
          <UserSync />
          <CartProvider>
            <PhotoModalProvider>{children}</PhotoModalProvider>
          </CartProvider>
        </Suspense>
      </StackTheme>
    </StackProvider>
  );
}
