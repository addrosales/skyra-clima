const CACHE = 'skyra-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Solo cachea el "shell" de la app (HTML/CSS/JS/íconos).
// Los datos del clima siempre se piden en vivo a la red: nunca se sirve
// un pronóstico guardado como si fuera actual.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isWeatherData = url.includes('open-meteo.com') ||
                         url.includes('accuweather.com') ||
                         url.includes('nominatim.openstreetmap.org') ||
                         url.includes('bigdatacloud.net') ||
                         url.includes('geocoding-api');
  if (isWeatherData) return; // siempre red, nunca caché

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
