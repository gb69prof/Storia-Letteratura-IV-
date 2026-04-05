const CACHE='parini-pwa-v1';
const ASSETS=["./", "./index.html", "./styles.css", "./app.js", "./manifest.json", "./assets/Dinamiche aristocratiche del XVIII secolo.png", "./assets/Due modelli di vita a confronto.png", "./assets/Endecasillabi sciolti_ metrica e stile.png", "./assets/Figura retorica_ l'antifrasi in Parini.png", "./assets/Il contrasto del giovin signore.png", "./assets/Il giorno e il paradosso di Parini.png", "./assets/Il lavoro e la natura nella visione di Parini.png", "./assets/Una giornata del terzo stato.png"];
const CACHE = 'parini-pwa-v1';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  ...Array.from({length:0})
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request).then(network => {
    const copy = network.clone();
    caches.open(CACHE).then(cache => cache.put(e.request, copy));
    return network;
  }).catch(() => caches.match('./index.html'))));
});
