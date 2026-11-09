import { Settings as SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { settings } from "@/lib/settings";
import { COLORS, color } from "@/lib/theme";

const OPTIONS = [
  { key: "h24", label: "Formato 24 h", hint: "Si se desactiva, usa AM/PM." },
  { key: "seconds", label: "Mostrar segundos", hint: "En el reloj y la cuenta atrás." },
] as const;

export default function Settings() {
  return (
    <Dialog>
      <DialogTrigger
        aria-label="Ajustes"
        className="ml-auto inline-flex h-8 items-center justify-center gap-2 rounded-lg px-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <SettingsIcon className="size-4" />
        <span class="hidden sm:inline">Ajustes</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">Ajustes</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col divide-y">
          {OPTIONS.map((o) => (
            <Label key={o.key} className="justify-between gap-4 py-3">
              <span class="flex flex-col gap-1">
                {o.label}
                <span class="text-xs font-normal text-muted-foreground">{o.hint}</span>
              </span>
              <Switch
                checked={settings.value[o.key]}
                onCheckedChange={(v) => (settings.value = { ...settings.value, [o.key]: v })}
              />
            </Label>
          ))}
          <fieldset class="flex flex-col gap-3 py-3">
            <legend class="mb-3 text-sm font-medium">Color principal</legend>
            <div class="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <label
                  key={c}
                  data-color={c}
                  title={c}
                  class="relative size-7 cursor-pointer rounded-full bg-primary ring-offset-2 ring-offset-background has-checked:ring-2 has-checked:ring-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
                >
                  <input
                    type="radio"
                    name="color"
                    value={c}
                    aria-label={c}
                    checked={color.value === c}
                    onChange={() => (color.value = c)}
                    class="sr-only"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </DialogContent>
    </Dialog>
  );
}
