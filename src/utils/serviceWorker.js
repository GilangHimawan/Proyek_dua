function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }
  
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker berhasil didaftarkan:', registration);
  
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Izin notifikasi tidak diberikan.');
          return;
        }
  
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
          const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
          const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
  
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
  
          console.log('Berhasil subscribe:', JSON.stringify(subscription));
        }
      } catch (err) {
        console.error('Gagal mendaftarkan Service Worker atau Push:', err);
      }
    });
  }
  