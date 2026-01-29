"use client";

import { usePathname } from "next/navigation";

// Routes where the navigation should be hidden
const HIDDEN_ROUTES_PATTERNS = [
  /\/editar/, // Collection Editor
  /\/admin/, // Admin Panel
  /\/checkout/, // Checkout Flow
];

export default function NavigationController({ children }) {
  const pathname = usePathname();

  if (!pathname) return null;

  const shouldHide = HIDDEN_ROUTES_PATTERNS.some((pattern) =>
    pattern.test(pathname),
  );

  if (shouldHide) return null;

  return <>{children}</>;
}
