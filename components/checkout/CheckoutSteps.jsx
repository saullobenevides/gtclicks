"use client";

import { usePathname } from "next/navigation";
import { Check, ShoppingCart, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "carrinho", label: "Carrinho", href: "/carrinho", icon: ShoppingCart },
  { id: "checkout", label: "Pagamento", href: "/checkout", icon: CreditCard },
  { id: "sucesso", label: "Confirmação", href: null, icon: CheckCircle2 },
];

export default function CheckoutSteps({ className }) {
  const pathname = usePathname();
  const currentIndex = pathname?.includes("sucesso")
    ? 2
    : pathname?.includes("checkout")
    ? 1
    : 0;

  return (
    <nav
      aria-label="Progresso do checkout"
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-4",
        className
      )}
    >
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition-colors",
                isCompleted &&
                  "bg-primary/20 text-primary ring-1 ring-primary/30",
                isCurrent &&
                  "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isCompleted &&
                  !isCurrent &&
                  "bg-white/5 text-muted-foreground ring-1 ring-white/10"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCompleted ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 sm:mx-2 h-0.5 w-4 sm:w-8 rounded-full transition-colors",
                  isCompleted ? "bg-primary/40" : "bg-white/10"
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
