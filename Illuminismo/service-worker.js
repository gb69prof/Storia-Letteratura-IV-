
const CACHE = 'illuminismo-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/app.css',
  './assets/js/app.js',
  './assets/img/mappa-illuminismo.png',
  './pages/00_indice_modulo.html',
  './pages/01_la_frattura_societa_dei_ceti.html',
  './pages/02_il_metodo_illuminista.html',
  './pages/03_riforme_politiche.html',
  './pages/04_riforme_economiche.html',
  './pages/05_riforme_sociali.html',
  './pages/06_vocabolario_essenziale.html',
  './pages/07_saperi_irrinunciabili.html',
  './pages/08_sintesi_finale.html',
  './pages/09_report_critico_finale.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const clone = resp.clone();
      if (e.request.method === 'GET' && resp.status === 200 && e.request.url.startsWith(self.location.origin)) {
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
