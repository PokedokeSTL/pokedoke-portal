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

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'PokeDoke';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/manifest.json',
    badge: '/manifest.json',
    tag: payload.data?.tag || 'pokedoke-notification',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('staff.pokedoke.com') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow('/');
    })
  );
});
