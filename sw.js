// Service worker for the hosted build (build.py writes this into site/ with the version and
// file list filled in). Cache-first: once a contributor has opened the page one time with a connection, it opens
// with no connection at all — the same "works fully offline" promise the local-file taggers make.
// Each build gets a new CACHE_VERSION, so a redeploy replaces the cached files on next visit.
var CACHE_VERSION = "tagger-b916271";
var FILES = ["./", "index.html", "freeform.html", "zones.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(event.request);
    })
  );
});
