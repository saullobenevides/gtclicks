import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  backgroundImage?: string | null;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "profile";
  overlayOpacity?: "default" | "heavy" | "light";
}

export default function PageHeader({
  backgroundImage,
  title,
  children,
  className,
  variant = "default",
  overlayOpacity = "default",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden flex flex-col",
        variant === "profile" ? "min-h-[450px] md:h-[400px]" : "min-h-[60vh]",
        className
      )}
    >
      <div className="absolute inset-0 z-0">
        {backgroundImage ? (
          <ImageWithFallback
            src={backgroundImage}
            alt={title || "Background"}
            className="h-full w-full object-cover"
            priority={true}
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-surface-page via-surface-section to-background" />
        )}

        <div
          className={cn(
            "absolute inset-0 bg-linear-to-b",
            overlayOpacity === "heavy"
              ? "from-black/80 via-black/80 to-background"
              : overlayOpacity === "light"
              ? "from-black/40 via-black/40 to-black/80"
              : "from-black/60 via-black/70 to-background"
          )}
        />

        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
      </div>

      <div
        className={cn(
          "relative flex-1 container-wide flex flex-col z-10",
          variant === "profile"
            ? "justify-end pb-8 pt-20 md:pb-12"
            : "items-center justify-center text-center pt-32 pb-32"
        )}
      >
        {children}
      </div>
    </div>
  );
}
