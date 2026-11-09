# AGENTS.md

PWA clock: digital clock, pomodoro, countdown, timer, stopwatch, alarms. UI in Spanish.

## Stack

- Astro 7 + Preact (`compat: true`, `react`/`react-dom` aliased to `@preact/compat`)
- shadcn/ui (`radix-nova` style, Radix) + Tailwind CSS 4 (`@tailwindcss/vite`)
- `@preact/signals` for global settings
- `@vite-pwa/astro` (`autoUpdate`, `generateSW`)
- pnpm, TypeScript
- Vitest + Testing Library (jsdom), Oxlint, Prettier

## Commands

```bash
pnpm install
pnpm dev       # localhost:4321
pnpm build     # ./dist + service worker + manifest
pnpm preview   # test installable/offline PWA
pnpm lint      # oxlint
pnpm format    # prettier --write
pnpm test      # vitest run
```

Verify with `pnpm lint && pnpm test && pnpm build`.

## Structure

- `src/pages/index.astro`: Header + `App` island (`client:only`) + Footer.
- `src/components/App.tsx`: tabs synced with URL hash (`#pomodoro`, `#timer`…), global alert banner.
- `src/components/views/`: one view per tool. All stay mounted so they keep running when switching tabs.
- `src/components/ui/`: shadcn components. Add with `pnpm dlx shadcn@latest add <name>`, don't hand-write.
- `src/hooks/useStored.ts`: `localStorage`-persisted state. Timers store `endAt`, so they survive reloads.
- `src/lib/settings.ts`: global settings signal (`h24`, `seconds`, `wakeLock`, `sound`, `volume`), shared across islands.
- `src/lib/i18n.ts`: es/en dictionaries, `t(key, vars)`, `lang` and `locale` signals. Static Astro text uses `data-i18n` / `data-i18n-label`.
- `src/lib/timer.ts`: pure logic (countdown, pomodoro phases, alarms, laps). Unit tested.
- `src/lib/status.ts`: `useStatus(id, {text, progress})` drives tab title, favicon ring and Screen Wake Lock.
- `src/lib/theme.ts`: primary color (`data-color` on `<html>`), CSS in `global.css`.
- `src/hooks/useShortcuts.ts`: per-view keyboard shortcuts, only for the active tab.
- `src/lib/alert.ts`: Web Audio beep + system notification.
- `src/lib/time.ts`: time formatting helpers. Respect `h24`/`seconds` settings.
- `src/styles/global.css`: theme tokens (palette `#333b4b`, Geist / Geist Mono / Geist Pixel).
- `astro.config.mjs`: PWA manifest and shortcuts.

## Conventions

- Import alias `@/` → `src/`.
- Use `preact/hooks`, not `react` hooks.
- New state that must survive reload → `useStored`; store absolute timestamps, not remaining time.
- Use theme tokens from `global.css`, not hardcoded colors.
- All UI text goes through `t()`; add keys to both `es` and `en`. Code and identifiers in English.
- Business logic as pure functions in `src/lib/` with tests next to them (`*.test.ts`).
- Views receive `active` (tab visible) for shortcuts.
- Minimal comments, only when needed.
- Commits: Conventional Commits, English, lowercase (`feat(alarm): ...`, `fix(countdown): ...`).

## Limits

Alarms only ring while the app is open (tab or backgrounded PWA). No push server.
