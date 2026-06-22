"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariantsOuter = cva(
  "relative inline-flex transition-all duration-200 ease-out active:scale-[0.97] hover:scale-[1.01] p-px overflow-hidden outline-none focus:outline-none focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-[#346739]",
        accent: "bg-indigo-900/20",
        destructive: "bg-red-600",
        secondary: "bg-[#d9d9dd]",
        minimal: "bg-[#e5e5e5]",
        outline: "bg-neutral-200",
        icon: "rounded-full border dark:border-neutral-950 border-white/10 dark:bg-neutral-600/50 bg-white/50",
        dark: "bg-[#000000]",
      },
      size: {
        sm: "rounded-[8px]",
        default: "rounded-[22px]",
        lg: "rounded-[22px]",
        icon: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const innerBackgroundVariants = cva(
  "absolute inset-[1px]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-b from-[#427d49] to-[#346739] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.25)] hover:from-[#4a8c51] hover:to-[#3b7541] hover:brightness-[1.03]",
        accent: "bg-gradient-to-b from-indigo-400 to-indigo-600 hover:brightness-105",
        destructive: "bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] hover:from-red-600 hover:to-red-700 hover:brightness-[1.05]",
        secondary: "bg-white hover:bg-neutral-50 active:bg-[#eeece7]",
        minimal: "bg-white hover:bg-neutral-50 active:bg-[#e5e5e5]",
        outline: "bg-white hover:bg-[#fafafa] active:bg-neutral-100",
        icon: "bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-700/50 hover:brightness-105",
        dark: "bg-gradient-to-b from-[#2a2a2a] to-[#151515] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.15)] hover:from-[#333333] hover:to-[#1a1a1a] hover:brightness-[1.03]",
      },
      size: {
        sm: "rounded-[7px]",
        default: "rounded-[21px]",
        lg: "rounded-[21px]",
        icon: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const contentVariants = cva(
  "relative z-10 flex items-center justify-center gap-2 w-full h-full",
  {
    variants: {
      variant: {
        primary: "text-white",
        accent: "text-white/90",
        destructive: "text-white/90",
        secondary: "text-[#212121]",
        minimal: "text-[#737373]",
        outline: "text-neutral-600 hover:text-black",
        icon: "",
        dark: "text-white",
      },
      size: {
        sm: "text-xs px-4 py-1.5",
        default: "text-sm px-6 py-2.5",
        lg: "text-base px-8 py-3",
        icon: "p-1.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "destructive" | "minimal" | "icon" | "outline" | "dark"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const TextureButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ children, variant = "primary", size = "default", asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const borderRadiusClass = className?.split(' ').find(c => c.startsWith('rounded-')) || ""

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariantsOuter({ variant, size }),
          borderRadiusClass,
          className
        )}
        {...props}
      >
        {/* Background Layer (Fixed to button dimensions) */}
        <div
          className={cn(
            innerBackgroundVariants({ variant, size }),
            "overflow-hidden",
            borderRadiusClass
          )}
        >
          {/* Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] brightness-125 contrast-150 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>

        {/* Content Layer */}
        <div className={cn(contentVariants({ variant, size }), borderRadiusClass)}>
          {children}
        </div>
      </Comp>
    )
  }
)

TextureButton.displayName = "TextureButton"

export { TextureButton }
