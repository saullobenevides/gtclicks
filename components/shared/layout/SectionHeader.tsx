"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title?: React.ReactNode;
  description?: string;
  badge?: string;
  align?: "left" | "center";
  size?: "default" | "large";
  isLanding?: boolean;
  uppercase?: boolean;
  className?: string;
}

export default function SectionHeader({
  title,
  description,
  badge,
  align = "center",
  size = "default",
  isLanding = false,
  uppercase = true,
  className,
}: SectionHeaderProps) {
  const alignClass =
    align === "center" ? "text-center items-center" : "text-left items-start";

  const titleSize = isLanding
    ? "text-2xl sm:text-5xl md:text-6xl lg:text-7xl"
    : size === "large"
    ? "text-xl sm:text-4xl lg:text-6xl"
    : "text-lg sm:text-3xl lg:text-5xl";

  const TitleTag = isLanding ? "h1" : "h2";

  return (
    <div
      className={cn(
        "mb-16 md:mb-20 flex flex-col gap-4",
        alignClass,
        className
      )}
      data-testid="section-header"
    >
      {badge && (
        <Badge
          variant="secondary"
          className="px-4 py-1 text-[10px] uppercase font-black tracking-widest bg-surface-subtle text-text-secondary border-border-subtle mb-2"
        >
          {badge}
        </Badge>
      )}

      <TitleTag
        className={cn(
          "font-display font-black text-white tracking-tighter leading-tight sm:leading-[0.85]",
          uppercase && "uppercase",
          titleSize
        )}
      >
        {title}
      </TitleTag>

      {description && (
        <p className="max-w-2xl text-lg md:text-xl text-text-secondary font-medium leading-relaxed mt-2">
          {description}
        </p>
      )}
    </div>
  );
}
