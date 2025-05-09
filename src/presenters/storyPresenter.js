import { storyModel } from '../models/storyModel.js';
import { displayStories } from '../view/storyView.js';

export async function loadStories() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login dulu');
    location.hash = '#login';
    return;
  }

  try {
    const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.error) {
      await storyModel.clearStories();
      await storyModel.saveStories(data.listStory);
      displayStories(data.listStory);
    } else if (data.message === 'Token is invalid or expired') {
      alert('Sesi login habis, silakan login ulang.');
      localStorage.removeItem('token');
      location.hash = '#login';
    } else {
      alert('Gagal mengambil cerita');
    }

  } catch (err) {
    console.warn('Gagal ambil data online, mencoba dari cache:', err);
    const cached = await storyModel.loadStories();
    if (cached.length > 0) {
      displayStories(cached);
    } else {
      alert('Tidak ada cerita di cache.');
    }
  }
}
