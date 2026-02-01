/* GTClicks - Service Worker mínimo para PWA
 * Suporta instalação e prepara para cache futuro
 */
const CACHE_NAME = "gtclicks-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
  );
  self.clients.claim();
});
