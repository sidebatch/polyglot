// Polyglot service worker — 앱 셸 오프라인 캐시
var CACHE = 'polyglot-8702b0b';
var ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icons/flags/jp.png', './icons/flags/gb.png', './icons/flags/fr.png', './icons/flags/ru.png',
  './icons/flags/es.png', './icons/flags/de.png', './icons/flags/cn.png', './icons/flags/sa.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // 버전 폴링(version.txt)은 항상 네트워크에서 — SW 캐시를 타면 새 버전을 못 감지함
  try {
    if (new URL(e.request.url).pathname.endsWith('/version.txt')) return;
  } catch (err) {}
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
