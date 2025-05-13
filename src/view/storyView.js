import { subscribePushNotification, unsubscribePushNotification } from '../utils/push.js';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

let pushListenerAttached = false;

export function displayStories(stories) {
  const container = document.getElementById('stories-list');
  if (!container) return;

  const storedSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '{}');

  container.innerHTML = stories.map(story => {
    const isSubscribed = storedSubscriptions[story.authorId] === true;
    return `
      <div style="padding:10px; margin-bottom:10px; background:#f9f9f9;">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" style="max-width:200px;" alt="story">
        <p>Lat: ${story.lat ?? '-'}, Lon: ${story.lon ?? '-'}</p>
        <button 
          class="subscribe-user-btn" 
          data-author-id="${story.authorId}">
          ${isSubscribed ? '🔕 Unsubscribe ' : '🔔 Subscribe '}${story.name}
        </button>
      </div>
    `;
  }).join('');

  // 💡 Hindari menambahkan listener ganda
  if (!pushListenerAttached) {
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('.subscribe-user-btn');
      if (!btn) return;

      const authorId = btn.dataset.authorId;
      const subs = JSON.parse(localStorage.getItem('userSubscriptions') || '{}');
      const isSubscribedNow = subs[authorId] === true;

      try {
        if (isSubscribedNow) {
          await unsubscribePushNotification(authorId);
        } else {
          await subscribePushNotification(authorId);
        }

        subs[authorId] = !isSubscribedNow;
        localStorage.setItem('userSubscriptions', JSON.stringify(subs));

        btn.textContent = !isSubscribedNow 
          ? `🔕 Unsubscribe ${btn.textContent.split(' ').slice(1).join(' ')}`
          : `🔔 Subscribe ${btn.textContent.split(' ').slice(1).join(' ')}`;
      } catch (err) {
        console.error('Gagal (un)subscribe:', err);
        alert('Gagal memproses permintaan.');
      }
    });

    pushListenerAttached = true; 
  }
}


