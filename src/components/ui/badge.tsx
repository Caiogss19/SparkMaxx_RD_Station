import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "secondary" | "outline" | "info";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  secondary: "bg-secondary text-secondary-foreground border-border",
  outline: "border-border text-muted-foreground bg-transparent",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
