import { signal } from "@preact/signals";

/** Título de la pestaña activa; las vistas pueden sobrescribirlo temporalmente */
export const baseTitle = signal("Clock");
