"use client";

import { cn } from "@/lib/utils";

interface PageSectionProps {
  children?: React.ReactNode;
  variant?: "default" | "hero" | "compact";
  containerWide?: boolean;
  className?: string;
}

export default function PageSection({
  children,
  variant = "default",
  containerWide = true,
  className,
}: PageSectionProps) {
  const paddingClasses = {
    hero: "pt-12 pb-32 md:pt-16 md:pb-40",
    default: "pt-8 pb-16 md:pt-12 md:pb-32",
    compact: "py-8 md:py-12",
  };

  const containerClass = containerWide ? "container-wide" : "container";

  return (
    <section
      className={cn(paddingClasses[variant], className)}
      data-testid="page-section"
    >
      <div className={containerClass}>{children}</div>
    </section>
  );
}
