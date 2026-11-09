import { useMemo, useState } from "preact/hooks";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { settings } from "@/lib/settings";
import { pad, zoneCity, zoneOffset } from "@/lib/time";
import { locale, t } from "@/lib/i18n";

const MAX_ZONES = 8;
const ZONES = Intl.supportedValuesOf("timeZone");

function ZoneDialog({
  open,
  onOpenChange,
  exclude,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  exclude: string[];
  onPick: (zone: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, "_");
    return ZONES.filter((z) => !exclude.includes(z) && z.toLowerCase().includes(needle)).slice(0, 50);
  }, [q, exclude]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">{t("clock.addZone")}</DialogTitle>
        </DialogHeader>
        <Input
          type="search"
          autoFocus
          value={q}
          aria-label={t("clock.search")}
          placeholder={t("clock.search")}
          onInput={(e) => setQ(e.currentTarget.value)}
        />
        <ul class="flex h-64 flex-col overflow-y-auto">
          {results.length === 0 && <li class="p-2 text-sm text-muted-foreground">{t("clock.noResults")}</li>}
          {results.map((z) => (
            <li key={z}>
              <button
                type="button"
                class="flex w-full justify-between gap-4 rounded-md px-2 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
                onClick={() => {
                  onPick(z);
                  onOpenChange(false);
                  setQ("");
                }}
              >
                {zoneCity(z)}
                <span class="truncate font-mono text-xs text-muted-foreground">{z}</span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function ClockView() {
  const opts = settings.value;
  const now = useNow(500);
  const d = new Date(now);
  const [zones, setZones] = useStored<string[]>("zones", []);
  const [adding, setAdding] = useState(false);

  const h = opts.h24 ? d.getHours() : d.getHours() % 12 || 12;
  const ampm = opts.h24 ? "" : d.getHours() < 12 ? "AM" : "PM";
  const localOffset = -d.getTimezoneOffset();

  const diff = (zone: string) => {
    const mins = zoneOffset(zone, d) - localOffset;
    if (!mins) return t("clock.sameTime");
    const hours = String(Math.abs(mins) / 60).replace(".", locale.value === "es-ES" ? "," : ".");
    return mins > 0 ? t("clock.ahead", { h: hours }) : t("clock.behind", { h: hours });
  };

  return (
    <Panel>
      <Display
        sub={d.toLocaleDateString(locale.value, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      >
        {pad(h)}:{pad(d.getMinutes())}
        {opts.seconds && <span class="text-[0.45em] text-muted-foreground">{pad(d.getSeconds())}</span>}
        {ampm && <span class="ml-2 text-[0.25em] text-muted-foreground">{ampm}</span>}
      </Display>

      <section aria-labelledby="world-title" class="mt-4 flex w-full max-w-xl flex-col gap-2">
        <div class="flex items-center justify-between">
          <h2 id="world-title" class="eyebrow text-muted-foreground">
            {t("clock.world")}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("clock.addZone")}
            disabled={zones.length >= MAX_ZONES}
            onClick={() => setAdding(true)}
          >
            <Plus />
          </Button>
        </div>
        {zones.length > 0 && (
          <ul class="flex flex-col divide-y border-y">
            {zones.map((z) => (
              <li key={z} class="flex items-center gap-4 py-3">
                <div class="flex-1">
                  <p class="text-sm font-medium">{zoneCity(z)}</p>
                  <p class="font-mono text-xs text-muted-foreground">
                    {d.toLocaleDateString(locale.value, { timeZone: z, weekday: "short" })} · {diff(z)}
                  </p>
                </div>
                <p class="font-pixel text-2xl text-primary tabular-nums dark:text-foreground">
                  {d.toLocaleTimeString(locale.value, {
                    timeZone: z,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: !opts.h24,
                  })}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("clock.removeZone", { zone: zoneCity(z) })}
                  onClick={() => setZones(zones.filter((x) => x !== z))}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ZoneDialog open={adding} onOpenChange={setAdding} exclude={zones} onPick={(z) => setZones([...zones, z])} />
    </Panel>
  );
}
