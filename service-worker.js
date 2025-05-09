
self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
  
    const title = data.title || 'Notifikasi Baru';
    const options = {
      body: data.body || 'Pesan baru diterima.',
      icon: 'src/asset/icons8.png',
      data: data.url || '/',
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  });
  