import { Fragment } from "preact";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

const SHORTCUTS = [
  [["space", "K"], "shortcut.toggle"],
  [["R"], "shortcut.reset"],
  [["L"], "shortcut.lap"],
  [["N"], "shortcut.skip"],
  [["1", "6"], "shortcut.tabs"],
] as const;

export default function Shortcuts() {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={t("settings.shortcuts")}
        className="ml-auto inline-flex h-8 items-center justify-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Info className="size-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">{t("settings.shortcuts")}</DialogTitle>
        </DialogHeader>
        <dl class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">
          {SHORTCUTS.map(([keys, label]) => (
            <Fragment key={label}>
              <dt class="flex gap-1">
                {keys.map((k, i) => (
                  <Fragment key={k}>
                    {i > 0 && <span class="text-muted-foreground">{label === "shortcut.tabs" ? "–" : "/"}</span>}
                    <kbd class="rounded border bg-muted px-1.5 font-mono text-xs">
                      {k === "space" ? t("settings.space") : k}
                    </kbd>
                  </Fragment>
                ))}
              </dt>
              <dd class="text-muted-foreground">{t(label)}</dd>
            </Fragment>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
