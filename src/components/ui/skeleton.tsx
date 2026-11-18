import { cn } from "@/lib/utils"

/** Shimmering placeholder used while a page loads for the first time. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,#ebe9e6_0%,#f6f5f3_40%,#ebe9e6_80%)] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
