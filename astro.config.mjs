// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { AstroPWAIntegration } from "@vite-pwa/astro";

/** @param {string} name @param {string} id */
const shortcut = (name, id) => ({ name, short_name: name, url: `/#${id}` });

export default defineConfig({
  integrations: [
    preact({ compat: true }),
    AstroPWAIntegration({
      registerType: "autoUpdate",
      pwaAssets: {
        preset: "minimal-2023",
        image: "public/favicon.svg",
        overrideManifestIcons: true,
        injectThemeColor: true,
      },
      manifest: {
        name: "Clock",
        short_name: "Clock",
        description: "Reloj digital, pomodoro, cuenta atrás, temporizador, cronómetro y alarmas.",
        lang: "es",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        shortcuts: [
          shortcut("Pomodoro", "pomodoro"),
          shortcut("Temporizador", "timer"),
          shortcut("Cronómetro", "stopwatch"),
          shortcut("Alarma", "alarm"),
        ],
      },
      generateSW: {
        navigateFallback: "/",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,txt}"],
      },
    }),
  ],
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
