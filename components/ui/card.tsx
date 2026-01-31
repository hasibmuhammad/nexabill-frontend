import { clsx } from "clsx";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm theme-transition",
      outlined:
        "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 theme-transition",
      elevated:
        "bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 theme-transition",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "px-6 py-4 border-b border-slate-200 dark:border-slate-700",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx("px-6 py-4", className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "px-6 py-4 border-t border-slate-200 dark:border-slate-700",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx(
      "text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";
