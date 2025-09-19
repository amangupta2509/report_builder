import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        outline:
          "border border-gradient bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:border-transparent relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:to-purple-500 before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300",
        secondary:
          "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
        ghost:
          "bg-gradient-to-r from-transparent to-transparent hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-gray-900",
        link: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent underline-offset-4 hover:underline hover:from-blue-700 hover:to-purple-700",
        success:
          "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        warning:
          "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        info: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
