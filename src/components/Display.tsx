import { toChildArray, type ComponentChildren } from "preact";
import { cn } from "@/lib/utils";

/** Pinta los ":" de los textos en gris, como los segundos */
const dimColons = (children: ComponentChildren) =>
  toChildArray(children).map((c) =>
    typeof c === "string"
      ? c.split(/(:)/).map((part) => (part === ":" ? <span class="text-muted-foreground">:</span> : part))
      : c,
  );

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
          "font-pixel leading-none tracking-tight text-primary tabular-nums select-none dark:text-foreground",
          "text-[clamp(3.5rem,16vw,10rem)]",
          className,
        )}
      >
        {dimColons(children)}
      </p>
      {sub && <p class="eyebrow text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Panel({ children, class: className }: { children: ComponentChildren; class?: string }) {
  return (
    <section
      class={cn(
        "flex min-h-80 flex-1 flex-col items-center justify-center gap-8 rounded-xl border bg-muted/50 px-4 py-12 sm:px-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
