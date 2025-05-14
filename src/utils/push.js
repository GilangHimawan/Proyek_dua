export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export async function subscribePushNotification() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak.');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
  }

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
    },
  };

  const token = localStorage.getItem('token');
  const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || 'Gagal melakukan subscribe');
  }

  localStorage.setItem('pushSubscribed', 'true');
}

export async function unsubscribePushNotification() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();

    const token = localStorage.getItem('token');
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Gagal melakukan unsubscribe');
    }
  }

  localStorage.setItem('pushSubscribed', 'false');
}

