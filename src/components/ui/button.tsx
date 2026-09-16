import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[-0.01em] transition-[transform,background-color,color,border-color] duration-150 ease-out disabled:pointer-events-none disabled:bg-fog disabled:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion/50 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary: "bg-vermilion text-paper hover:bg-ember",
        ink: "bg-ink text-paper hover:bg-night",
        ghost: "border border-hair bg-paper text-ink hover:bg-fog",
        soft: "bg-fog text-ink hover:bg-hair",
      },
      size: {
        sm: "h-9 rounded-pill px-4 text-caption",
        md: "h-11 rounded-pill px-6 text-body",
        lg: "h-12 rounded-pill px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
