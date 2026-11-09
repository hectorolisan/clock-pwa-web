import type { ComponentChildren } from "preact";
import { cn } from "@/lib/utils";

export function Display({
  children,
  class: className,
  sub,
}: {
  children: ComponentChildren;
  class?: string;
  sub?: ComponentChildren;
}) {
  return (
    <div class="flex flex-col items-center gap-3">
      <p
        class={cn(
          "font-pixel leading-none tracking-tight tabular-nums select-none",
          "text-[clamp(3.5rem,16vw,10rem)]",
          className,
        )}
      >
        {children}
      </p>
      {sub && <p class="eyebrow text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Panel({ children, class: className }: { children: ComponentChildren; class?: string }) {
  return (
    <section
      class={cn(
        "flex flex-col items-center gap-8 rounded-xl border bg-muted/50 px-4 py-12 sm:px-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
