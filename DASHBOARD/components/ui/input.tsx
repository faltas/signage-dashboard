import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-border/40 bg-background/60 px-3 py-1 text-sm font-medium",
        "placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground",
        "shadow-sm backdrop-blur-sm outline-none transition-colors",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
