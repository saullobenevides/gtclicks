"use client";

import { usePathname } from "next/navigation";

const HIDDEN_ROUTES_PATTERNS = [
  /\/editar/,
  /\/admin/,
  /\/dashboard/,
  /\/checkout/,
];

interface NavigationControllerProps {
  children: React.ReactNode;
}

export default function NavigationController({
  children,
}: NavigationControllerProps) {
  const pathname = usePathname();

  if (!pathname) return null;

  const shouldHide = HIDDEN_ROUTES_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  );

  if (shouldHide) return null;

  return <>{children}</>;
}
