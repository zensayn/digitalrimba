import * as React from "react"

import { cn } from "@/lib/utils"

// Cohere input-field: 12px radius, thin hairline border, white surface, Poppins.
// Focus uses brand green (matches the catalog search fields); error uses #b30000.
// Emil: transition only properties that change, custom ease-out, <300ms.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[12px] border border-[#e5e7eb] bg-white px-3.5 py-2 text-[15px] text-[#212121] font-poppins outline-none placeholder:text-[#93939f] transition-[border-color,box-shadow] duration-200 ease-out",
        "focus:border-[#346739] focus:shadow-[0_0_0_3px_rgba(52,103,57,0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[#b30000] aria-invalid:shadow-[0_0_0_3px_rgba(179,0,0,0.12)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
