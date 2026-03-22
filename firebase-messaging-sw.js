importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAMSAW3ez0Hir2Guv4ibbuxUgzRTuS14PI",
  authDomain: "yorunokotoba-5df51.firebaseapp.com",
  projectId: "yorunokotoba-5df51",
  storageBucket: "yorunokotoba-5df51.firebasestorage.app",
  messagingSenderId: "133287391957",
  appId: "1:133287391957:web:aafda69540c7359ba1a85c"
});

const messaging = firebase.messaging();

// Time-aware default messages
function getDefaultMessage() {
  const hour = new Date().getHours();
  const messages = hour >= 22 || hour < 5
    ? ['今夜のことば、届いてるよ 🌙', 'おやすみ前に、あなたの運勢を覗いてみて ✨', '今夜の夢、きっと意味があるよ 🔮']
    : hour >= 17
    ? ['そろそろ夜の時間。今日の運勢チェックした？ 🌙', 'キャラクターがあなたを待ってるよ ✨']
    : ['今日の運勢が届いてるよ 🌟'];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getDefaultTitle() {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) return 'よるのことば 🌙';
  if (hour >= 17) return 'よるのことば ✨';
  return 'よるのことば';
}

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || getDefaultTitle();
  const body = payload.notification?.body || getDefaultMessage();
  const options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'yorunokotoba-daily',
    renotify: true,
    actions: [
      { action: 'open', title: '占いを見る' }
    ],
    data: { url: payload.data?.url || 'https://yorunokotoba.vercel.app' }
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || 'https://yorunokotoba.vercel.app';
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
