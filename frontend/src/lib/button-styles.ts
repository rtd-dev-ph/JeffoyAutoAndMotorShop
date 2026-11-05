export const buttonClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg border border-primary/20 active:scale-[0.98] transition-all duration-200",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg border border-border/50 active:scale-[0.98] transition-all duration-200",
  outline: "border border-border bg-background hover:bg-muted hover:text-foreground shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg border border-destructive/20 active:scale-[0.98] transition-all duration-200",
  ghost: "hover:bg-muted hover:text-foreground transition-all duration-200",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg border border-emerald-700/20 active:scale-[0.98] transition-all duration-200",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg border border-amber-600/20 active:scale-[0.98] transition-all duration-200",
} as const;

export const buttonSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-base",
  icon: "h-9 w-9 p-0",
  iconSm: "h-8 w-8 p-0",
} as const;

export function getButtonClass(variant: keyof typeof buttonClasses = "primary", size: keyof typeof buttonSizes = "md") {
  return `${buttonClasses[variant]} ${buttonSizes[size]} inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`;
}
