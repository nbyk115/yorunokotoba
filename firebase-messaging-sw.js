importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

var CACHE_NAME = 'ynk-offline-v1';
var OFFLINE_URLS = ['/', '/index.html', '/icon-192.png'];

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
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name.startsWith('ynk-') && name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return clients.claim();
    })
  );
});

// Offline fallback: Network-first strategy
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/index.html');
      })
    );
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
