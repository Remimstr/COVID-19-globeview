const v = "1";
addEventListener("install", e =>
  e.waitUntil(caches.open(v).then(cache => cache.addAll(["/"])))
);

addEventListener("fetch", e => {
  e.respondWith(
    (async () => {
      if (
        e.request.mode === "navigate" &&
        e.request.method === "GET" &&
        registration.waiting &&
        (await clients.matchAll()).length < 2
      ) {
        console.log("forcing service worker update");
        registration.waiting.postMessage("skipWaiting");
        return new Response("", { headers: { Refresh: "0" } });
      }
      const cacheResponse = await caches.match(e.request);
      if (cacheResponse) {
        console.log("retrieving from cache", e.request.url);
        return cacheResponse;
      } else {
        console.log("making request", e.request.url);
        return fetch(e.request);
      }
    })()
  );
});

addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key != v) return caches.delete(key);
        })
      );
    })
  );
});

addEventListener("message", e => {
  if (e.data === "skipWaiting") {
    skipWaiting();
  }
});
