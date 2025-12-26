import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 border border-white/10",
        outline:
          "border-2 border-white/20 bg-transparent hover:bg-white/5 hover:border-white/30",
        ghost: 
          "hover:bg-white/10 hover:text-white",
        danger:
          "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/30",
        link: 
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-md",
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-lg",
        xl: "h-14 px-10 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
