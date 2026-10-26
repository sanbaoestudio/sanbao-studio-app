// San Bao Studio App: guarda las herramientas para usarlas sin conexión
const CACHE = 'sanbao-v1';
const CORE = ['/', '/index.html', '/sello/', '/sello/index.html', '/manifest.webmanifest', '/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // páginas propias: primero la red (para recibir cambios); sin conexión, la copia guardada
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('/index.html'))));
    return;
  }
  // tipografías y la librería del .zip: se guardan la primera vez
  if (/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); return res; })));
  }
});
