import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[0.7rem] tracking-wide font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:bg-primary/85",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/85",
        outline: "border-border text-foreground",
        success: "border-ledger/60 bg-ledger-tint text-success",
        warning: "border-manila/60 bg-manila-tint text-warning",
        processing: "border-processing/40 bg-[#dfe4f0] text-processing",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
