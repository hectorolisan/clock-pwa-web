import { useEffect, useState } from "preact/hooks";

/** Re-render cada `ms` mientras `active`; devuelve Date.now() */
export function useNow(ms = 250, active = true) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms, active]);

  return now;
}
