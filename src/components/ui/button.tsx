import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-fun text-sm font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-primary-foreground shadow-pop-sm hover:bg-ink-soft hover:-translate-y-0.5",
        /* Signature CTA — a warm gold "medal" pill (premium + joyful) */
        fun:
          "rounded-full bg-gold font-bold text-ink shadow-gold hover:brightness-[1.04] hover:-translate-y-0.5",
        /* Dark editorial pill */
        candy:
          "rounded-full bg-ink font-bold text-primary-foreground shadow-pop-sm hover:bg-ink-soft hover:-translate-y-0.5",
        destructive: "bg-destructive text-white hover:brightness-110",
        /* Ghost-bordered → fills with ink on hover (editorial) */
        outline:
          "border border-ink/20 bg-transparent text-foreground hover:border-ink hover:bg-ink hover:text-primary-foreground hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-[0.98]",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-gold-deep underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-7 text-[0.95rem]",
        xl: "h-14 rounded-full px-9 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
