import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null, // we register manually with iframe/preview guards
        devOptions: { enabled: false },
        includeAssets: ["pwa-192.png", "pwa-512.png", "pwa-maskable-512.png"],
        manifest: {
          name: "ZimFreight",
          short_name: "ZimFreight",
          description: "Zimbabwe's premier truck load board — works offline in rural areas.",
          theme_color: "#0C0F14",
          background_color: "#0C0F14",
          display: "standalone",
          orientation: "portrait",
          start_url: "/board",
          scope: "/",
          icons: [
            { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
            { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
              handler: "CacheFirst",
              options: { cacheName: "google-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/rest/v1/loads") || url.pathname.startsWith("/rest/v1/route_rates") || url.pathname.startsWith("/rest/v1/border_status"),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "zf-public-data", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 } },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/rest/v1/"),
              handler: "NetworkFirst",
              options: { cacheName: "zf-user-data", networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 } },
            },
          ],
        },
      }),
    ],
  },
});
