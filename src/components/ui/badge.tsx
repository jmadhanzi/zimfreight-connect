import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "border-border bg-transparent text-foreground",
        success:
          "border-transparent bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-[color:var(--success)] border-[color-mix(in_oklab,var(--success)_20%,transparent)]",
        warning:
          "border-transparent bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] text-[color:var(--warning)] border-[color-mix(in_oklab,var(--warning)_20%,transparent)]",
        info:
          "border-transparent bg-[color-mix(in_oklab,var(--info)_12%,transparent)] text-[color:var(--info)] border-[color-mix(in_oklab,var(--info)_20%,transparent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
