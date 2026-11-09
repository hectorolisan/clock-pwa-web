// Tipos mínimos: @unplugin-pwa/core no es dependencia directa con pnpm
declare module "virtual:pwa-register" {
  export function registerSW(options?: { immediate?: boolean }): (reload?: boolean) => Promise<void>;
}

declare module "virtual:pwa-info" {
  export const pwaInfo: { webManifest: { linkTag: string } } | undefined;
}

declare module "virtual:pwa-assets/head" {
  export const pwaAssetsHead: {
    themeColor?: { content: string };
    links: Record<string, string>[];
  };
}
