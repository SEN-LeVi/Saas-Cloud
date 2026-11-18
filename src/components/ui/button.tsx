import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-[background-color,box-shadow,color] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Filled action blue
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        // Outline in action blue (inset 1px ring, 2px on hover)
        outline:
          "bg-transparent text-primary shadow-[inset_0_0_0_1px_var(--primary)] hover:bg-primary-soft hover:shadow-[inset_0_0_0_2px_var(--primary)]",
        // Neutral outline (75% black)
        secondary:
          "bg-transparent text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] hover:bg-accent hover:text-foreground hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]",
        // Text-only, used for card actions
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "rounded-sm text-primary hover:underline px-0",
      },
      size: {
        default: "h-8 px-4 text-sm",
        sm: "h-7 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        md: "h-10 px-5 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
