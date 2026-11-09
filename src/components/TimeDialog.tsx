import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { settings } from "@/lib/settings";
import { pad } from "@/lib/time";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function Column<T extends string | number>({
  items,
  selected,
  label,
  render = String,
  onSelect,
}: {
  items: T[];
  selected: T;
  label: string;
  render?: (v: T) => string;
  onSelect: (v: T) => void;
}) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.querySelector("[aria-selected=true]")?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div
      ref={list}
      role="listbox"
      aria-label={label}
      class="flex h-56 flex-1 snap-y [scrollbar-width:none] flex-col gap-1 overflow-y-auto rounded-lg border p-1"
    >
      {items.map((v) => (
        <button
          key={v}
          type="button"
          role="option"
          aria-selected={v === selected}
          onClick={() => onSelect(v)}
          class={cn(
            "shrink-0 snap-center rounded-md py-2 font-mono text-sm transition-colors hover:bg-muted",
            v === selected && "bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          {render(v)}
        </button>
      ))}
    </div>
  );
}

/** Selector "HH:MM" que respeta el ajuste global de 24 h / 12 h */
function TimeColumns({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const h24 = settings.value.h24;
  const [h, m] = value.split(":").map(Number);
  const pm = h >= 12;
  const set = (hh: number, mm = m) => onChange(`${pad(hh)}:${pad(mm)}`);

  return (
    <div class="flex gap-2">
      {h24 ? (
        <Column label={t("time.hour")} items={range(24)} selected={h} render={pad} onSelect={(v) => set(v)} />
      ) : (
        <Column
          label={t("time.hour")}
          items={range(12).map((i) => i || 12)}
          selected={h % 12 || 12}
          render={pad}
          onSelect={(v) => set((v % 12) + (pm ? 12 : 0))}
        />
      )}
      <Column label={t("time.minutes")} items={range(60)} selected={m} render={pad} onSelect={(v) => set(h, v)} />
      {!h24 && (
        <Column
          label="AM/PM"
          items={["AM", "PM"]}
          selected={pm ? "PM" : "AM"}
          onSelect={(v) => set((h % 12) + (v === "PM" ? 12 : 0))}
        />
      )}
    </div>
  );
}

/** Diálogo para elegir hora ("HH:MM") o fecha y hora ("YYYY-MM-DDTHH:MM") */
export function TimeDialog({
  open,
  onOpenChange,
  title,
  value,
  withDate = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  withDate?: boolean;
  onConfirm: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open]);

  const [date, time] = withDate ? draft.split("T") : ["", draft];
  const join = (d: string, t: string) => (withDate ? `${d}T${t}` : t);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">{title}</DialogTitle>
        </DialogHeader>
        {withDate && (
          <Input
            type="date"
            required
            value={date}
            onChange={(e) => e.currentTarget.value && setDraft(join(e.currentTarget.value, time))}
            className="font-mono"
          />
        )}
        {open && <TimeColumns value={time} onChange={(t) => setDraft(join(date, t))} />}
        <DialogFooter>
          <Button
            className="w-full"
            onClick={() => {
              onConfirm(draft);
              onOpenChange(false);
            }}
          >
            {t("action.accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
