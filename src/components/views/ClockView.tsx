import { Display, Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { settings } from "@/lib/settings";
import { pad } from "@/lib/time";
import { locale } from "@/lib/i18n";

export function ClockView() {
  const opts = settings.value;
  const d = new Date(useNow(500));

  const h = opts.h24 ? d.getHours() : d.getHours() % 12 || 12;
  const ampm = opts.h24 ? "" : d.getHours() < 12 ? "AM" : "PM";

  return (
    <Panel>
      <Display
        sub={d.toLocaleDateString(locale.value, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      >
        {pad(h)}
        :
        {pad(d.getMinutes())}
        {opts.seconds && <span class="text-[0.45em] text-muted-foreground">{pad(d.getSeconds())}</span>}
        {ampm && <span class="ml-2 text-[0.25em] text-muted-foreground">{ampm}</span>}
      </Display>
    </Panel>
  );
}
