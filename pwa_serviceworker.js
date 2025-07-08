const CACHE_NAME = 'flag-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// All country flag codes for caching
const flagCodes = [
  'af', 'al', 'dz', 'ad', 'ao', 'ag', 'ar', 'am', 'au', 'at',
  'az', 'bs', 'bh', 'bd', 'bb', 'by', 'be', 'bz', 'bj', 'bt',
  'bo', 'ba', 'bw', 'br', 'bn', 'bg', 'bf', 'bi', 'ci', 'cv',
  'kh', 'cm', 'ca', 'cf', 'td', 'cl', 'cn', 'co', 'km', 'cg',
  'cr', 'hr', 'cu', 'cy', 'cz', 'cd', 'dk', 'dj', 'dm', 'do',
  'ec', 'eg', 'sv', 'gq', 'er', 'ee', 'sz', 'et', 'fj', 'fi',
  'fr', 'ga', 'gm', 'ge', 'de', 'gh', 'gr', 'gd', 'gt', 'gn',
  'gw', 'gy', 'ht', 'va', 'hn', 'hu', 'is', 'in', 'id', 'ir',
  'iq', 'ie', 'il', 'it', 'jm', 'jp', 'jo', 'kz', 'ke', 'ki',
  'kw', 'kg', 'la', 'lv', 'lb', 'ls', 'lr', 'ly', 'li', 'lt',
  'lu', 'mg', 'mw', 'my', 'mv', 'ml', 'mt', 'mh', 'mr', 'mu',
  'mx', 'fm', 'md', 'mc', 'mn', 'me', 'ma', 'mz', 'mm', 'na',
  'nr', 'np', 'nl', 'nz', 'ni', 'ne', 'ng', 'kp', 'mk', 'no',
  'om', 'pk', 'pw', 'pa', 'pg', 'py', 'pe', 'ph', 'pl', 'pt',
  'qa', 'ro', 'ru', 'rw', 'kn', 'lc', 'vc', 'ws', 'sm', 'st',
  'sa', 'sn', 'rs', 'sc', 'sl', 'sg', 'sk', 'si', 'sb', 'so',
  'za', 'kr', 'ss', 'es', 'lk', 'sd', 'sr', 'se', 'ch', 'sy',
  'tw', 'tj', 'tz', 'th', 'tl', 'tg', 'to', 'tt', 'tn', 'tr',
  'tm', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'uy', 'uz', 'vu',
  'va', 've', 'vn', 'ye', 'zm', 'zw'
];

// Add flag URLs to cache list
flagCodes.forEach(code => {
  urlsToCache.push(`https://flagcdn.com/w320/${code}.png`);
});

// Install event - cache all resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and flags...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Error caching resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Cache the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'image') {
          // Return a placeholder for images when offline
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240"><rect width="320" height="240" fill="#f0f0f0"/><text x="160" y="120" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">Flag unavailable offline</text></svg>',
            {
              headers: {
                'Content-Type': 'image/svg+xml'
              }
            }
          );
        }
        
        // For HTML requests, return the cached index page
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for future features
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add any background sync logic here
      console.log('Background sync triggered')
    );
  }
});

// Push notifications for future features
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text() || 'Ready for another flag challenge?',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Play Now',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Flag Game', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});