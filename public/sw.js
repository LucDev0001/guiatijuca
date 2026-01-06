const CACHE_NAME = "tijuca-guia-v1";
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json"];

// Instalação: Cacheia arquivos estáticos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Estratégia Stale-While-Revalidate para melhor performance
self.addEventListener("fetch", (event) => {
  // Ignora requisições para o Firebase/Google APIs (deixa online only)
  if (
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("firestore")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
