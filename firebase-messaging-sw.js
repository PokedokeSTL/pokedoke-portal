// Firebase Messaging Service Worker for PokeDoke Staff Portal
// This file MUST be at the root of your site (next to index.html)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD5CGBbHbCb-nv1qYVzvxQQDKddj7JEsIw",
  authDomain: "pokedoke-staff-app.firebaseapp.com",
  projectId: "pokedoke-staff-app",
  storageBucket: "pokedoke-staff-app.firebasestorage.app",
  messagingSenderId: "25862406122",
  appId: "1:25862406122:web:7e9f1521cd3fe42633fc93"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const type = payload.data?.type || 'general';
  const sender = payload.data?.sender || '';
  const isMessage = type === 'dm' || type === 'channel';

  const notificationTitle = payload.notification?.title || 'PokeDoke';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: isMessage ? ('msg-' + sender) : (payload.data?.tag || 'pokedoke-' + type),
    renotify: true,
    vibrate: isMessage ? [300, 100, 300, 100, 300] : [200, 100, 200],
    requireInteraction: false,
    silent: false,
    data: payload.data || {},
    actions: isMessage ? [
      { action: 'reply', title: 'Open' }
    ] : [
      { action: 'open', title: 'Open App' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  let targetPath = '/';
  if (data.type === 'dm' || data.type === 'channel') {
    targetPath = '/?tab=messages';
  } else if (data.type === 'schedule' || data.type === 'swap' || data.type === 'openshift' || data.type === 'timeoff') {
    targetPath = '/?tab=schedule';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('staff.pokedoke.com') && 'focus' in client) {
          client.postMessage({ type: 'notification-click', data: data });
          return client.focus();
        }
      }
      return clients.openWindow(targetPath);
    })
  );
});
