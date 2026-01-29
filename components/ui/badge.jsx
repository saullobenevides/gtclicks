import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-radius-sm border px-space-2 py-[2px] text-text-xs uppercase tracking-wider font-font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-action-primary text-text-on-brand shadow-shadow-sm hover:bg-action-primary-hover",
        secondary:
          "border-transparent bg-surface-subtle/80 text-text-primary hover:bg-surface-subtle",
        destructive:
          "border-transparent bg-status-error text-white shadow-shadow-sm hover:opacity-90",
        outline:
          "text-text-primary border-border-default hover:bg-surface-subtle",
        success:
          "border-transparent bg-status-success/10 text-status-success hover:bg-status-success/20",
        warning:
          "border-transparent bg-status-warning/10 text-status-warning hover:bg-status-warning/20",
        error:
          "border-transparent bg-status-error/10 text-status-error hover:bg-status-error/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
