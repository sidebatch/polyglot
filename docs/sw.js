// Polyglot service worker — 네트워크 우선, 오프라인 폴백 (Still과 동일 전략)
// 온라인이면 항상 최신 셸을 가져오므로 일반 새로고침만으로 업데이트가 반영됨.
var CACHE = 'polyglot-b679838';
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
  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  // 내비게이션(페이지 이동/새로고침): 네트워크 우선, 오프라인일 때만 캐시
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        }
        return res;
      }).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  // 나머지 애셋도 네트워크 우선, 실패 시 캐시 폴백
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
