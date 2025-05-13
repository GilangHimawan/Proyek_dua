export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

export function updateGlobalPushButton() {
  const btn = document.getElementById('subscribe-push-btn');
  if (!btn) return;

  const isSubscribed = localStorage.getItem('pushSubscribed') === 'true';
  btn.textContent = isSubscribed ? '🔕 Berhenti Langganan' : '🔔 Aktifkan Notifikasi';
}

export async function subscribePushNotification(authorId) {
  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Izin ditolak');

  const existing = await registration.pushManager.getSubscription();
  let subscription = existing;

  if (!subscription) {
    const convertedKey = urlBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk');
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });
  }

  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.getKey('p256dh')
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))))
        : '',
      auth: subscription.getKey('auth')
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        : '',
    }
  };

  const token = localStorage.getItem('token');
  const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Gagal subscribe');

  localStorage.setItem('pushSubscribed', 'true');
  updateGlobalPushButton();
}

export async function unsubscribePushNotification(authorId) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const token = localStorage.getItem('token');

  if (subscription) {
    await subscription.unsubscribe();

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal unsubscribe');
  }

  localStorage.setItem('pushSubscribed', 'false');
  updateGlobalPushButton();
}
