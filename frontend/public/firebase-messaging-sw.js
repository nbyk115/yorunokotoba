importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

var CACHE_NAME = 'ynk-offline-v9';
var OFFLINE_URLS = ['/', '/index.html', '/icon-192.png', '/manifest.json'];
var FONT_CACHE = 'ynk-fonts-v1';
var IMAGE_CACHE = 'ynk-images-v1';
var CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(OFFLINE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  var keepCaches = [CACHE_NAME, FONT_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name.startsWith('ynk-') && keepCaches.indexOf(name) === -1;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return clients.claim();
    })
  );
});

// --- Cache strategy helpers ---

// Cache-first with max-age expiration
function cacheFirst(event, cacheName) {
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function(cached) {
        if (cached) {
          var dateHeader = cached.headers.get('sw-cache-date');
          if (dateHeader && (Date.now() - Number(dateHeader)) > CACHE_MAX_AGE) {
            // Expired — fetch fresh copy
            return fetchAndCache(event.request, cache);
          }
          return cached;
        }
        return fetchAndCache(event.request, cache);
      });
    })
  );
}

// Fetch, stamp with date, and store in cache
function fetchAndCache(request, cache) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var headers = new Headers(response.headers);
      headers.set('sw-cache-date', String(Date.now()));
      return response.blob().then(function(body) {
        var stamped = new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
        cache.put(request, stamped.clone());
        return stamped;
      });
    }
    return response;
  });
}

// Stale-while-revalidate
function staleWhileRevalidate(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cached) {
        var fetchPromise = fetch(event.request).then(function(response) {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
        return cached || fetchPromise;
      });
    })
  );
}

// --- Fetch event: route to correct strategy ---
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // 1. Navigation: Network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Skip non-GET requests and chrome-extension / data URIs
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. Google Fonts: Cache-first, 30 days
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    cacheFirst(event, FONT_CACHE);
    return;
  }

  // 3. App images (icon-*.png, ogp.png): Cache-first, 30 days
  if (/\/(icon-[\w-]+\.png|ogp\.png)$/.test(url.pathname)) {
    cacheFirst(event, IMAGE_CACHE);
    return;
  }

  // 4. Other same-origin static assets: Stale-while-revalidate
  if (url.origin === self.location.origin) {
    staleWhileRevalidate(event);
    return;
  }
});

try {
  firebase.initializeApp({
    apiKey: "AIzaSyAMSAW3ez0Hir2Guv4ibbuxUgzRTuS14PI",
    authDomain: "yorunokotoba-5df51.firebaseapp.com",
    projectId: "yorunokotoba-5df51",
    storageBucket: "yorunokotoba-5df51.firebasestorage.app",
    messagingSenderId: "133287391957",
    appId: "1:133287391957:web:aafda69540c7359ba1a85c"
  });

  var messaging = firebase.messaging();

  function getDefaultMessage() {
    var hour = new Date().getHours();
    var messages = hour >= 22 || hour < 5
      ? ['今夜のことば、届いてるよ', 'おやすみ前に、あなたの運勢を覗いてみて', '今夜の夢、きっと意味があるよ']
      : hour >= 17
      ? ['夜が来る前に、今日のメッセージを受け取って', 'キャラクターがあなたを待ってるよ']
      : ['今日の運勢が届いてるよ', 'ふとした時間に、心の声を聴いてみて'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function getDefaultTitle() {
    var hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return '🌙 よるのことば';
    if (hour >= 17) return '🌆 よるのことば';
    return 'よるのことば';
  }

  messaging.onBackgroundMessage(function(payload) {
    var title = (payload.notification && payload.notification.title) || getDefaultTitle();
    var body = (payload.notification && payload.notification.body) || getDefaultMessage();
    var options = {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'yorunokotoba-daily',
      renotify: true,
      actions: [
        { action: 'open', title: '占いを見る' }
      ],
      data: { url: (payload.data && payload.data.url && payload.data.url.startsWith('https://yorunokotoba.vercel.app')) ? payload.data.url : 'https://yorunokotoba.vercel.app' }
    };
    return self.registration.showNotification(title, options);
  });
} catch(e) {
  // Firebase SW init error silenced in production
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var allowedOrigin = 'https://yorunokotoba.vercel.app';
  var url = (event.notification.data && event.notification.data.url) || allowedOrigin;
  if (!url.startsWith(allowedOrigin)) {
    url = allowedOrigin;
  }
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('yorunokotoba') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
