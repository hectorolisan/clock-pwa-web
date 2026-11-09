import { useEffect } from "preact/hooks";
import { Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { startAlert, unlockAudio, requestNotifications } from "@/lib/alert";
import { formatDuration } from "@/lib/time";
import { t } from "@/lib/i18n";

const PRESETS = [1, 5, 10, 15, 20, 30, 60];

export function TimerView() {
  const [st, setSt] = useStored("timer", {
    duration: 5 * 60_000,
    left: 5 * 60_000,
    endAt: null as number | null,
  });

  const now = useNow(200, st.endAt !== null);
  const left = st.endAt ? st.endAt - now : st.left;
  const idle = !st.endAt && st.left === st.duration;

  useEffect(() => {
    if (st.endAt && left <= 0) {
      setSt({ ...st, endAt: null, left: st.duration });
      startAlert(t("timer.done", { name: formatDuration(st.duration) }));
    }
  }, [left]);

  const set = (duration: number) => setSt({ duration, left: duration, endAt: null });

  const toggle = () => {
    if (left <= 0) return;
    unlockAudio();
    requestNotifications();
    setSt(st.endAt ? { ...st, endAt: null, left } : { ...st, endAt: Date.now() + st.left });
  };

  const add = (ms: number) =>
    setSt(st.endAt ? { ...st, endAt: st.endAt + ms } : { ...st, left: st.left + ms, duration: st.duration + ms });

  return (
    <Panel>
      <Display sub={st.endAt ? t("timer.running") : idle ? t("timer.ready") : t("timer.paused")}>
        {formatDuration(left, { hours: st.duration >= 3_600_000 })}
      </Display>

      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon-lg" aria-label={t("action.reset")} onClick={() => set(st.duration)}>
          <RotateCcw />
        </Button>
        <Button size="lg" className="h-12 w-40 text-base" onClick={toggle}>
          {st.endAt ? <Pause /> : <Play />}
          {st.endAt ? t("action.pause") : idle ? t("action.start") : t("action.resume")}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => add(60_000)}>
          <Plus /> {t("timer.addMinute")}
        </Button>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        {PRESETS.map((m) => (
          <Button
            key={m}
            variant="outline"
            size="sm"
            className="rounded-full font-mono"
            onClick={() => set(m * 60_000)}
          >
            {t("timer.preset", { n: m })}
          </Button>
        ))}
      </div>
    </Panel>
  );
}
