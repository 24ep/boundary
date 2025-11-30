// Service Worker for Offline Support
const CACHE_NAME = 'bondarys-web-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/auth/login',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/offline')
        }
      })
    })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Background sync logic
  console.log('Background sync triggered')
}

