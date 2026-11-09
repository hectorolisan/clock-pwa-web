import { useEffect, useState } from "preact/hooks";
import { Pause, Play, RotateCcw, Settings2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { startAlert, unlockAudio, requestNotifications } from "@/lib/alert";
import { formatDuration } from "@/lib/time";
import { baseTitle } from "@/lib/title";
import {
  MINUTE,
  createCountdown,
  nextPhase,
  remaining,
  toggle as toggleCountdown,
  type PomodoroMode,
} from "@/lib/timer";
import { t } from "@/lib/i18n";

const MODES = ["focus", "short", "long"] as const;

const DEFAULT_CFG = { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false };
type Config = typeof DEFAULT_CFG;

const today = () => new Date().toDateString();

function ConfigDialog({
  open,
  onOpenChange,
  cfg,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cfg: Config;
  onSave: (cfg: Config) => void;
}) {
  const [draft, setDraft] = useState(cfg);
  useEffect(() => {
    if (open) setDraft(cfg);
  }, [open]);

  const num = (key: Exclude<keyof Config, "autoStart">, label: string, max: number) => (
    <div class="flex items-center justify-between gap-4">
      <Label htmlFor={`pomo-${key}`}>{label}</Label>
      <Input
        id={`pomo-${key}`}
        type="number"
        min={1}
        max={max}
        value={draft[key]}
        onInput={(e) => setDraft({ ...draft, [key]: Math.min(max, Math.max(1, Number(e.currentTarget.value) || 1)) })}
        className="w-20 text-right font-mono"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl font-normal">{t("pomodoro.config")}</DialogTitle>
        </DialogHeader>
        <form
          class="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            onOpenChange(false);
          }}
        >
          {MODES.map((m) => num(m, t("pomodoro.minutes", { label: t(`pomodoro.${m}`) }), 180))}
          {num("longEvery", t("pomodoro.longEvery"), 12)}
          <Label className="justify-between gap-4">
            {t("pomodoro.autoStart")}
            <Switch checked={draft.autoStart} onCheckedChange={(autoStart) => setDraft({ ...draft, autoStart })} />
          </Label>
          <Button type="submit" className="mt-2 w-full">
            {t("action.accept")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PomodoroView() {
  const [cfg, setCfg] = useStored("pomodoro-config", DEFAULT_CFG);
  const [stats, setStats] = useStored("pomodoro-stats", { day: today(), count: 0 });
  const [st, setSt] = useStored("pomodoro", {
    mode: "focus" as PomodoroMode,
    round: 1,
    ...createCountdown(cfg.focus * MINUTE),
  });
  const [configuring, setConfiguring] = useState(false);

  const now = useNow(250, st.endAt !== null);
  const left = remaining(st, now);
  const completed = stats.day === today() ? stats.count : 0;

  const go = (mode: PomodoroMode, round = st.round, run = false, c = cfg) => {
    const timer = createCountdown(c[mode] * MINUTE);
    setSt({ mode, round, ...timer, endAt: run ? Date.now() + timer.duration : null });
  };

  const next = (auto: boolean) => {
    const p = nextPhase(st.mode, st.round, cfg.longEvery);
    go(p.mode, p.round, auto);
  };

  useEffect(() => {
    if (st.endAt && left <= 0) {
      if (st.mode === "focus") setStats({ day: today(), count: completed + 1 });
      startAlert(st.mode === "focus" ? t("pomodoro.focusDone") : t("pomodoro.breakDone"));
      next(cfg.autoStart);
    }
  }, [left]);

  useEffect(() => {
    if (!st.endAt) return;
    document.title = `${formatDuration(left)} · ${t(`pomodoro.${st.mode}`)}`;
    return () => void (document.title = baseTitle.value);
  });

  const toggle = () => {
    unlockAudio();
    requestNotifications();
    setSt({ ...st, ...toggleCountdown(st, Date.now()) });
  };

  const saveCfg = (c: Config) => {
    setCfg(c);
    if (!st.endAt) go(st.mode, st.round, false, c);
  };

  return (
    <Panel>
      <div class="flex flex-wrap justify-center gap-1">
        {MODES.map((m) => (
          <Button
            key={m}
            size="sm"
            aria-pressed={m === st.mode}
            variant={m === st.mode ? "secondary" : "ghost"}
            onClick={() => go(m)}
          >
            {t(`pomodoro.${m}`)}
          </Button>
        ))}
        <Button size="icon-sm" variant="ghost" aria-label={t("pomodoro.config")} onClick={() => setConfiguring(true)}>
          <Settings2 />
        </Button>
      </div>

      <Display sub={t(`pomodoro.${st.mode}Sub`)}>{formatDuration(left)}</Display>

      <div
        role="progressbar"
        aria-label={t("pomodoro.progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((1 - left / st.duration) * 100)}
        class="h-1 w-full max-w-md overflow-hidden rounded-full bg-border"
      >
        <div
          class="h-full bg-primary transition-[width] dark:bg-brand"
          style={{ width: `${(1 - left / st.duration) * 100}%` }}
        />
      </div>

      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon-lg" aria-label={t("action.reset")} onClick={() => go(st.mode)}>
          <RotateCcw />
        </Button>
        <Button size="lg" className="h-12 w-40 text-base" onClick={toggle}>
          {st.endAt ? <Pause /> : <Play />}
          {st.endAt ? t("action.pause") : t("action.start")}
        </Button>
        <Button variant="ghost" size="icon-lg" aria-label={t("action.skip")} onClick={() => next(false)}>
          <SkipForward />
        </Button>
      </div>

      <div class="flex flex-col items-center gap-2">
        <div class="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: cfg.longEvery }, (_, i) => (
            <span
              key={i}
              class={
                i < ((st.round - 1) % cfg.longEvery) + (st.mode === "focus" ? 0 : 1)
                  ? "size-2 rounded-full bg-primary dark:bg-brand"
                  : "size-2 rounded-full bg-border"
              }
            />
          ))}
        </div>
        <p class="eyebrow text-muted-foreground">
          {t("pomodoro.round", { n: st.round })} · {t("pomodoro.completed", { n: completed })}
        </p>
        {completed > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground"
            onClick={() => setStats({ day: today(), count: 0 })}
          >
            {t("pomodoro.resetCount")}
          </Button>
        )}
      </div>

      <ConfigDialog open={configuring} onOpenChange={setConfiguring} cfg={cfg} onSave={saveCfg} />
    </Panel>
  );
}
