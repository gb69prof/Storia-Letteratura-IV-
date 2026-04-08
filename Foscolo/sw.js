const CACHE = 'foscolo-v2';
const ASSETS = [
  './', './index.html',
  './vita.html', './filosofia.html', './frattura.html', './mondo.html',
  './poetica.html', './opere.html', './conclusione.html',
  './ortis08.html', './ortis09.html', './ortis10.html', './ortis11.html',
  './sepolcri12.html', './sepolcri13.html',
  './grazie14.html',
  './sonetti15.html', './sonetti16.html',
  './assets/css/style.css', './assets/js/app.js',
  './assets/images/ritratto.jpg', './assets/images/neoclassicismo.jpg',
  './assets/images/preromanticismo.jpg', './assets/images/schema_poetica.jpg',
  './assets/images/foscolo_parini.jpg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
