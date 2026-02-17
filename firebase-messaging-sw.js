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

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'よるのことば';
  const options = {
    body: payload.notification?.body || '今日の運勢が届いてるよ',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: 'https://yorunokotoba.vercel.app' }
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || 'https://yorunokotoba.vercel.app')
  );
});
