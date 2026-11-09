import { useEffect, useState } from "preact/hooks";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Display, Panel } from "@/components/Display";
import { TimeDialog } from "@/components/TimeDialog";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { settings } from "@/lib/settings";
import { formatHHMM, pad } from "@/lib/time";
import { t, locale } from "@/lib/i18n";

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const nextNewYear = () => toLocalInput(new Date(new Date().getFullYear() + 1, 0, 1));

export function CountdownView() {
  const [st, setSt] = useStored("countdown", { target: nextNewYear(), done: false });
  const [picking, setPicking] = useState(false);
  const now = useNow(250);
  const left = Math.max(0, new Date(st.target).getTime() - now);

  useEffect(() => {
    if (!left && !st.done) {
      setSt({ ...st, done: true });
      startAlert(t("countdown.done"));
    }
  }, [left]);

  const openPicker = () => {
    unlockAudio();
    requestNotifications();
    setPicking(true);
  };

  const s = Math.floor(left / 1000);

  return (
    <Panel>
      <Display
        sub={
          left
            ? `${new Date(st.target).toLocaleDateString(locale.value, { dateStyle: "full" })}, ${formatHHMM(st.target.slice(11), settings.value.h24)}`
            : t("countdown.arrived")
        }
      >
        {pad(s / 86400)}
        <span class="ml-[0.4em]">{pad((s / 3600) % 24)}</span>:{pad((s / 60) % 60)}
        {settings.value.seconds && <span class="text-[0.45em] text-muted-foreground">{pad(s % 60)}</span>}
      </Display>

      <Button variant="outline" onClick={openPicker}>
        <CalendarClock /> {t("countdown.change")}
      </Button>
      <TimeDialog
        open={picking}
        onOpenChange={setPicking}
        title={t("countdown.change")}
        value={st.target}
        withDate
        onConfirm={(target) => setSt({ target, done: false })}
      />
    </Panel>
  );
}
