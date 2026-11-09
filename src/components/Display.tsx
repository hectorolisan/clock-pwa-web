import { toChildArray, type ComponentChildren } from "preact";
import { cn } from "@/lib/utils";

/** Pinta los ":" de los textos en gris, como los segundos */
const dimColons = (children: ComponentChildren) =>
  toChildArray(children).map((c) =>
    typeof c === "string"
      ? c.split(/(:)/).map((part, i) =>
          part === ":" ? (
            <span key={i} class="text-muted-foreground">
              :
            </span>
          ) : (
            part
          ),
        )
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
        role="timer"
        class={cn(
          "font-pixel leading-none tracking-tight text-primary tabular-nums select-none dark:text-foreground",
          "text-[clamp(3rem,min(16vw,20vh),10rem)]",
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
        "flex min-h-0 flex-1 flex-col items-center justify-center-safe gap-6 overflow-y-auto rounded-xl border bg-muted/50 px-4 py-8 sm:px-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
