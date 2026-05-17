import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex items-center justify-center rounded-[12px] font-poppins text-sm font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-clay-primary text-white hover:opacity-90 active:scale-[0.98]",
        outline: "border border-clay-primary/10 bg-clay-canvas text-clay-ink hover:bg-clay-surface-soft active:scale-[0.98]",
        secondary: "bg-clay-surface-soft text-clay-ink hover:bg-clay-surface-strong active:scale-[0.98]",
        ghost: "hover:bg-clay-surface-soft text-clay-ink active:scale-[0.98]",
        link: "text-clay-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] px-[20px]",
        xs: "h-[32px] px-[12px] text-xs",
        sm: "h-[36px] px-[16px] text-xs",
        lg: "h-[52px] px-[32px] text-base",
        icon: "size-[44px]",
        "icon-sm": "size-[32px]",
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
