/* ================================================================
   Nkenkak-Ngiesang Service Worker
   - Caches static assets for offline support
   - Handles push notification display
   ================================================================ */

const CACHE = 'nkenkak-v1'
const PRECACHE = ['/', '/index.html']

// ── Install: pre-cache shell ──────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: network-first, fall back to cache ──────────────────
self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith(self.location.origin)) return
  // Don't cache API calls
  if (e.request.url.includes('/api/')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  )
})

// ── Push: show notification ───────────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'Nkenkak-Ngiesang', body: 'You have a new update', url: '/' }
  try { data = { ...data, ...e.data.json() } } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png',
      badge:   'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png',
      data:    { url: data.url },
      vibrate: [200, 100, 200],
    })
  )
})

// ── Notification click: open app ──────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else           clients.openWindow(url)
    })
  )
})
