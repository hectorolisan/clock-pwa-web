import { Copy, Download, Flag, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { formatDuration, pad } from "@/lib/time";
import { cn } from "@/lib/utils";
import { lapsToCsv, splits as getSplits } from "@/lib/timer";
import { t } from "@/lib/i18n";
import { announce } from "@/lib/announce";

const fmt = (ms: number) => formatDuration(ms, { hours: true, centis: true });

function download(laps: number[]) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lapsToCsv(laps, fmt)], { type: "text/csv" }));
  a.download = `laps-${new Date().toISOString().slice(0, 19).replace(/:/g, "")}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function StopwatchView() {
  const [st, setSt] = useStored("stopwatch", {
    startAt: null as number | null,
    elapsed: 0,
    laps: [] as number[],
  });

  const now = useNow(31, st.startAt !== null);
  const total = st.elapsed + (st.startAt ? now - st.startAt : 0);

  const toggle = () => setSt(st.startAt ? { ...st, startAt: null, elapsed: total } : { ...st, startAt: Date.now() });

  const lap = () => setSt({ ...st, laps: [...st.laps, total] });

  const splits = getSplits(st.laps);
  const best = splits.length > 1 && new Set(splits).size > 1 ? Math.min(...splits) : -1;
  const worst = best === -1 ? -1 : Math.max(...splits);

  return (
    <Panel>
      <Display>
        {formatDuration(total, { hours: total >= 3_600_000 })}
        <span class="text-[0.45em] text-muted-foreground">.{pad((total % 1000) / 10)}</span>
      </Display>

      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t("action.reset")}
          disabled={!total}
          onClick={() => setSt({ startAt: null, elapsed: 0, laps: [] })}
        >
          <RotateCcw />
        </Button>
        <Button size="lg" className="h-12 w-40 text-base" onClick={toggle}>
          {st.startAt ? <Pause /> : <Play />}
          {st.startAt ? t("action.stop") : total ? t("action.resume") : t("action.start")}
        </Button>
        <Button variant="ghost" size="icon-lg" aria-label={t("action.lap")} disabled={!st.startAt} onClick={lap}>
          <Flag />
        </Button>
      </div>

      {st.laps.length > 0 && (
        <div class="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => download(st.laps)}>
            <Download /> {t("stopwatch.export")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void navigator.clipboard.writeText(lapsToCsv(st.laps, fmt)).then(() => announce(t("stopwatch.copied")))
            }
          >
            <Copy /> {t("stopwatch.copy")}
          </Button>
        </div>
      )}

      {st.laps.length > 0 && (
        <div class="min-h-0 w-full max-w-md overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-muted">
              <tr class="eyebrow border-b text-muted-foreground [&>th]:py-3 [&>th]:font-medium">
                <th class="text-left">{t("stopwatch.lap")}</th>
                <th class="text-right">{t("stopwatch.split")}</th>
                <th class="text-right">{t("stopwatch.total")}</th>
              </tr>
            </thead>
            <tbody class="font-mono text-xs">
              {st.laps
                .map((t, i) => (
                  <tr
                    key={i}
                    class={cn(
                      "border-b text-muted-foreground hover:bg-muted [&>td]:py-2.5",
                      splits[i] === best && "text-emerald-600 dark:text-emerald-400",
                      splits[i] === worst && "text-red-600 dark:text-red-400",
                    )}
                  >
                    <td>#{pad(i + 1)}</td>
                    <td class="text-right">{formatDuration(splits[i], { centis: true })}</td>
                    <td class="text-right text-foreground">{formatDuration(t, { centis: true })}</td>
                  </tr>
                ))
                .reverse()}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
