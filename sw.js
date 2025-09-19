// Service Worker for TaskList PWA with Cache Control
const CACHE_NAME = 'tasklist-v' + Date.now(); // Dynamic cache versioning
const DISABLE_CACHE = true; // Set to false to enable caching

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    if (DISABLE_CACHE) {
        // Skip caching if disabled
        self.skipWaiting();
        return;
    }
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clear old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event with cache bypass option
self.addEventListener('fetch', event => {
    if (DISABLE_CACHE) {
        // Always fetch from network, bypass cache
        event.respondWith(
            fetch(event.request, {
                cache: 'no-store'
            }).catch(() => {
                // Fallback for offline scenarios
                return new Response('Offline - Cache Disabled', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
        );
        return;
    }

    // Normal cache-first strategy when caching is enabled
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});