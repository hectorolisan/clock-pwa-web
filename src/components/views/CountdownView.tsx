import { useEffect } from "preact/hooks";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/Display";
import { useNow } from "@/hooks/useNow";
import { useStored } from "@/hooks/useStored";
import { requestNotifications, startAlert, unlockAudio } from "@/lib/alert";
import { pad } from "@/lib/time";

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const nextNewYear = () => toLocalInput(new Date(new Date().getFullYear() + 1, 0, 1));

export function CountdownView() {
  const [st, setSt] = useStored("countdown", { target: nextNewYear(), label: "Año nuevo", done: false });
  const now = useNow(250);
  const left = Math.max(0, new Date(st.target).getTime() - now);

  useEffect(() => {
    if (!left && !st.done) {
      setSt({ ...st, done: true });
      startAlert(`¡${st.label || "Cuenta atrás"}!`);
    }
  }, [left]);

  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: "días" },
    { v: Math.floor(s / 3600) % 24, l: "horas" },
    { v: Math.floor(s / 60) % 60, l: "min" },
    { v: s % 60, l: "seg" },
  ];

  return (
    <div class="flex flex-col gap-6">
      <Panel>
        <p class="eyebrow text-muted-foreground">{st.label || "Cuenta atrás"}</p>
        <div class="grid grid-cols-4 gap-3 sm:gap-6">
          {parts.map((p) => (
            <div key={p.l} class="flex flex-col items-center gap-3">
              <span class="font-pixel text-[clamp(2.5rem,12vw,7rem)] leading-none tabular-nums">
                {pad(p.v, p.v > 99 ? 3 : 2)}
              </span>
              <span class="eyebrow text-muted-foreground">{p.l}</span>
            </div>
          ))}
        </div>
        {!left && <p class="font-mono text-sm text-brand">¡Llegó el momento!</p>}
      </Panel>

      <div class="mx-auto grid w-full max-w-md gap-4 sm:grid-cols-2">
        <label class="flex flex-col gap-2">
          <span class="eyebrow text-muted-foreground">Evento</span>
          <Input value={st.label} maxLength={40} onInput={(e) => setSt({ ...st, label: e.currentTarget.value })} />
        </label>
        <label class="flex flex-col gap-2">
          <span class="eyebrow text-muted-foreground">Fecha y hora</span>
          <Input
            type="datetime-local"
            value={st.target}
            onChange={(e) => {
              unlockAudio();
              requestNotifications();
              setSt({ ...st, target: e.currentTarget.value, done: false });
            }}
          />
        </label>
      </div>
    </div>
  );
}
