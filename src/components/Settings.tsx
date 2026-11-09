import { Fragment } from "preact";
import { Settings as SettingsIcon, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SOUNDS, settings, type Sound } from "@/lib/settings";
import { beep, unlockAudio } from "@/lib/alert";
import { COLORS, color } from "@/lib/theme";
import { LANGS, lang, t, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { key: "h24", label: "settings.h24", hint: "settings.h24Hint" },
  { key: "seconds", label: "settings.seconds", hint: "settings.secondsHint" },
  { key: "wakeLock", label: "settings.wakeLock", hint: "settings.wakeLockHint" },
] as const;

const SHORTCUTS = [
  [["Espacio", "K"], "shortcut.toggle"],
  [["R"], "shortcut.reset"],
  [["L"], "shortcut.lap"],
  [["N"], "shortcut.skip"],
  [["1", "6"], "shortcut.tabs"],
] as const;

const set = (patch: Partial<typeof settings.value>) => (settings.value = { ...settings.value, ...patch });

const test = () => {
  unlockAudio();
  beep();
};

export default function Settings() {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={t("header.settings")}
        className="ml-auto inline-flex h-8 items-center justify-center gap-2 rounded-lg px-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <SettingsIcon className="size-4" aria-hidden="true" />
        <span class="hidden sm:inline">{t("header.settings")}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">{t("header.settings")}</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col divide-y">
          {OPTIONS.map((o) => (
            <Label key={o.key} className="justify-between gap-4 py-3">
              <span class="flex flex-col gap-1">
                {t(o.label)}
                <span class="text-xs font-normal text-muted-foreground">{t(o.hint)}</span>
              </span>
              <Switch checked={settings.value[o.key]} onCheckedChange={(v) => set({ [o.key]: v })} />
            </Label>
          ))}
          <div class="flex items-center justify-between gap-4 py-3">
            <span class="text-sm font-medium" id="lang-label">
              {t("settings.language")}
            </span>
            <div role="radiogroup" aria-labelledby="lang-label" class="flex gap-1">
              {(Object.keys(LANGS) as Lang[]).map((l) => (
                <Button
                  key={l}
                  size="sm"
                  role="radio"
                  aria-checked={lang.value === l}
                  variant={lang.value === l ? "secondary" : "ghost"}
                  onClick={() => (lang.value = l)}
                >
                  {LANGS[l]}
                </Button>
              ))}
            </div>
          </div>
          <div class="flex flex-col gap-3 py-3">
            <div class="flex items-center justify-between gap-4">
              <label for="sound" class="text-sm font-medium">
                {t("settings.sound")}
              </label>
              <div class="flex items-center gap-1">
                <select
                  id="sound"
                  value={settings.value.sound}
                  onChange={(e) => set({ sound: e.currentTarget.value as Sound })}
                  class="h-8 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SOUNDS.map((x) => (
                    <option key={x} value={x}>
                      {t(`sound.${x}`)}
                    </option>
                  ))}
                </select>
                <Button variant="ghost" size="icon-sm" aria-label={t("settings.test")} onClick={test}>
                  <Volume2 />
                </Button>
              </div>
            </div>
            <div class="flex items-center justify-between gap-4">
              <label for="volume" class="text-sm font-medium">
                {t("settings.volume")}
              </label>
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.value.volume}
                aria-valuetext={`${Math.round(settings.value.volume * 100)} %`}
                onChange={(e) => {
                  set({ volume: Number(e.currentTarget.value) });
                  test();
                }}
                class="w-40 accent-primary"
              />
            </div>
          </div>
          <fieldset class="flex flex-col gap-3 py-3">
            <legend class="mb-3 text-sm font-medium">{t("settings.color")}</legend>
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
          <section aria-labelledby="shortcuts-title" class="flex flex-col gap-3 py-3">
            <h3 id="shortcuts-title" class="text-sm font-medium">
              {t("settings.shortcuts")}
            </h3>
            <dl class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
              {SHORTCUTS.map(([keys, label]) => (
                <Fragment key={label}>
                  <dt class="flex gap-1">
                    {keys.map((k, i) => (
                      <Fragment key={k}>
                        {i > 0 && <span class="text-muted-foreground">{label === "shortcut.tabs" ? "–" : "/"}</span>}
                        <kbd class="rounded border bg-muted px-1.5 font-mono text-xs">
                          {k === "Espacio" ? t("settings.space") : k}
                        </kbd>
                      </Fragment>
                    ))}
                  </dt>
                  <dd class="text-muted-foreground">{t(label)}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
