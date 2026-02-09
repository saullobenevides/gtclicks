"use client";

import { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { CartProvider } from "@/features/cart/context/CartContext";
import { PhotoModalProvider } from "@/components/providers/PhotoModalProvider";
import UserSync from "@/components/UserSync";
import { ptBRTranslations } from "@/lib/stack-translations";

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <StackProvider app={stackClientApp} translationOverrides={ptBRTranslations}>
      {/* @ts-expect-error StackTheme appearance prop exists at runtime */}
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
