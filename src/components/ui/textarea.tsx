import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[4px] border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
