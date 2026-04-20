/// <reference types="vite-plugin-pwa/client" />
// Service worker registration with strict iframe + preview-host guards.
// The SW must NEVER register inside the Lovable preview iframe — it causes
// stale builds and broken navigation.
export function registerPwa() {
  if (typeof window === "undefined") return;

  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app") && host.includes("--") || // preview subdomains
    host === "localhost" ||
    host === "127.0.0.1";

  if (inIframe || isPreviewHost) {
    // Defensively unregister anything that may already be installed.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
    }
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  // Lazy import so the virtual module is only pulled in when we actually register.
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => { /* virtual module unavailable in dev — ignore */ });
}