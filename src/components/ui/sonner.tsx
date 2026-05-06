import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-border/70 group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:font-display group-[.toaster]:font-bold group-[.toaster]:tracking-tight group-[.toaster]:shadow-[0_12px_36px_-12px_color-mix(in_oklab,var(--foreground)_25%,transparent)]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-normal",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-[color:var(--success)]/25",
          error: "group-[.toaster]:border-destructive/25",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
