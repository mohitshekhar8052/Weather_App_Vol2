import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const fabVariants = cva(
  "fixed flex items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        glass: "bg-white/20 backdrop-blur-md border border-white/10 text-foreground hover:bg-white/30",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/70 hover:shadow-xl hover:shadow-primary/20",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-12 w-12",
        lg: "h-16 w-16",
      },
      position: {
        bottomRight: "bottom-4 right-4",
        bottomCenter: "bottom-4 left-1/2 -translate-x-1/2",
        bottomLeft: "bottom-4 left-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottomRight",
    },
  }
)

export interface FabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, size, position, ...props }, ref) => {
    return (
      <button
        className={cn(fabVariants({ variant, size, position, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Fab.displayName = "Fab"

export { Fab, fabVariants }
