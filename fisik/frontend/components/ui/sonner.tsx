"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader,
} from "@tabler/icons-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <IconCircleCheck className="size-4" />,
        info: <IconInfoCircle className="size-4" />,
        warning: <IconAlertTriangle className="size-4" />,
        error: <IconAlertOctagon className="size-4" />,
        loading: <IconLoader className="size-4 animate-spin" />,
      }}
      style={
        {
          // Cohere palette (design-template/cohere/DESIGN.md). The shadcn
          // --popover/--border/--radius vars aren't defined in this project,
          // so we set every Sonner token explicitly. Per-type colors use the
          // restrained "soft tint + accent ink" pattern (see the pale-green
          // badge on the product page) and require richColors to apply.
          "--border-radius": "12px",

          // Neutral / default + loading
          "--normal-bg": "#ffffff",
          "--normal-text": "#212121",
          "--normal-border": "#d9d9dd",

          // Success → primary green on pale-green
          "--success-bg": "#edfce9",
          "--success-border": "#c6e8be",
          "--success-text": "#346739",

          // Info → action-blue on pale-blue
          "--info-bg": "#f1f5ff",
          "--info-border": "#d4e0ff",
          "--info-text": "#1863dc",

          // Warning → coral family
          "--warning-bg": "#fff1ec",
          "--warning-border": "#ffd6c9",
          "--warning-text": "#c2410c",

          // Error → error red on a soft red tint
          "--error-bg": "#fdeceb",
          "--error-border": "#f5cdca",
          "--error-text": "#b30000",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          boxShadow: "0 10px 30px -10px rgba(33, 33, 33, 0.12)",
          fontFamily: "var(--font-poppins)",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
