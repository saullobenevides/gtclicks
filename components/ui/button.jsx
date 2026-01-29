import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-radius-lg text-text-sm font-font-bold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2",
  {
    variants: {
      variant: {
        default:
          "bg-action-primary border-action-primary text-text-on-brand hover:bg-action-primary-hover hover:border-action-primary-hover shadow-shadow-button-primary",
        secondary:
          "bg-surface-card border-border-default text-text-primary hover:bg-surface-subtle hover:border-border-subtle",
        strong:
          "bg-action-strong border-action-strong text-black hover:bg-action-strong-hover hover:border-action-strong-hover shadow-shadow-lg",
        outline:
          "bg-transparent border-border-default text-text-primary hover:bg-surface-subtle hover:border-border-subtle",
        ghost: "border-transparent text-text-primary hover:bg-surface-subtle",
        danger:
          "bg-status-error border-status-error text-white hover:opacity-90",
        destructive:
          "bg-status-error border-status-error text-white hover:opacity-90",
        link: "text-action-primary underline-offset-4 hover:underline border-transparent shadow-none lowercase tracking-normal font-font-medium",
      },
      size: {
        xs: "h-8 px-space-3 text-text-xs",
        sm: "h-9 px-space-4 text-text-xs",
        default: "h-11 px-space-6 text-text-sm",
        lg: "h-14 px-space-8 text-text-base",
        xl: "h-16 px-space-12 text-text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
