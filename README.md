# Clock (clock-pwa-web)

Installable clock PWA: digital clock, pomodoro, countdown, timer, stopwatch and alarms in a single page.
Timers keep running across tab switches and reloads, and work offline once installed.

- **Astro 7** — static site with a single Preact island (`client:only`), no backend.
- **Preact** (`compat`) + **@preact/signals** — UI and global settings shared across islands.
- **Tailwind CSS 4** + **shadcn/ui** (Radix) — utility styling and UI components.
- **@vite-pwa/astro** — service worker, manifest, icons and app shortcuts.
- **Fontsource** — self-hosted Geist, Geist Mono and Geist Pixel fonts.
- **pnpm** — package manager.

> Alarms only ring while the app is open (tab or backgrounded PWA): the web cannot wake the device without a push server.

![cover](./public/cover.webp)

## Tools

| Tab          | Hash         | Description                                              |
| :----------- | :----------- | :------------------------------------------------------- |
| Reloj        | `#clock`     | Digital clock with 12/24 h and seconds settings          |
| Pomodoro     | `#pomodoro`  | Work/break cycles                                        |
| Cuenta atrás | `#countdown` | Countdown to a target time                               |
| Temporizador | `#timer`     | Timer with a set duration                                |
| Cronómetro   | `#stopwatch` | Stopwatch                                                |
| Alarma       | `#alarm`     | Alarms with sound and system notification                |

- **Tabs** are synced with the URL hash, so each tool can be bookmarked or opened from the PWA shortcuts.
- **Persistence**: state is saved in `localStorage`; timers store their end timestamp (`endAt`), so they survive reloads.
- **Alerts**: Web Audio beep + system notification, with a global banner in the app.

## Project Structure

```
/
├── public/
│   ├── cover.webp
│   ├── favicon.svg              # Source for the generated PWA icons
│   └── robots.txt
├── src/
│   ├── assets/svg/
│   │   └── Heart.astro
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── views/
│   │   │   ├── AlarmView.tsx
│   │   │   ├── ClockView.tsx
│   │   │   ├── CountdownView.tsx
│   │   │   ├── PomodoroView.tsx
│   │   │   ├── StopwatchView.tsx
│   │   │   └── TimerView.tsx
│   │   ├── App.tsx              # Hash-synced tabs + global alert banner
│   │   ├── Display.tsx          # Time display
│   │   ├── Settings.tsx         # 12/24 h and seconds settings
│   │   └── TimeDialog.tsx       # Time picker dialog
│   ├── hooks/
│   │   ├── useNow.ts            # Current time ticker
│   │   └── useStored.ts         # localStorage-persisted state
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── alert.ts             # Web Audio beep + notification
│   │   ├── settings.ts          # Global settings signal
│   │   ├── time.ts              # Time formatting
│   │   ├── title.ts             # Browser tab title
│   │   └── utils.ts
│   ├── pages/
│   │   └── index.astro          # Header + App island + Footer
│   ├── sections/
│   │   ├── Footer.astro
│   │   └── Header.astro
│   ├── styles/
│   │   └── global.css           # Tailwind + theme tokens
│   ├── env.d.ts
│   └── pwa.ts                   # Service worker registration
├── AGENTS.md
├── astro.config.mjs             # Preact + PWA manifest
├── components.json              # shadcn/ui config
├── LICENSE
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

| Command        | Action                                                  |
| :------------- | :------------------------------------------------------ |
| `pnpm install` | Install all dependencies                                |
| `pnpm dev`     | Start dev server at `localhost:4321`                    |
| `pnpm build`   | Build into `./dist/` with service worker and manifest   |
| `pnpm preview` | Preview the production build (installable/offline PWA)  |

> You can also use `npm` or `bun` if you prefer.
