import { signal } from "@preact/signals";

/** Texto para la región aria-live global (lectores de pantalla) */
export const announcement = signal("");

export function announce(msg: string) {
  // Vaciar antes para que se repita el anuncio aunque el texto sea igual
  announcement.value = "";
  requestAnimationFrame(() => (announcement.value = msg));
}
