import { getAllDraftsFromDB, deleteDraftById } from '../utils/dafrtDB.js';
import { checkLoginStatus } from '../utils/auth.js';

export async function showDraftStories() {
  const root = document.getElementById('main-content');
  if (!root) return;

  checkLoginStatus();
  const drafts = await getAllDraftsFromDB();

  if (drafts.length === 0) {
    root.innerHTML = '<p>Belum ada draft cerita.</p>';
    return;
  }

  root.innerHTML = `
    <h2>Draft Cerita</h2>
    ${drafts.map(draft => `
      <div style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
        <p><strong>Deskripsi:</strong> ${draft.description}</p>
        ${draft.photo ? `<img src="${draft.photo}" style="max-width: 200px;" />` : ''}
        <p>Lokasi: Lat ${draft.lat ?? '-'}, Lon ${draft.lon ?? '-'}</p>
        <button class="send-draft-btn" data-id="${draft.id}">📤 Kirim</button>
        <button class="delete-draft-btn" data-id="${draft.id}">🗑 Hapus</button>
      </div>
    `).join('')}
    <button id="back-to-home">⬅️ Kembali ke Beranda</button>
  `;

  root.addEventListener('click', async (e) => {
    const sendBtn = e.target.closest('.send-draft-btn');
    const deleteBtn = e.target.closest('.delete-draft-btn');

    if (sendBtn) {
      const id = Number(sendBtn.dataset.id);
      const draft = drafts.find(d => d.id === id);
      if (!draft) return;

      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('description', draft.description);
        if (draft.photoBlob) {
          formData.append('photo', draft.photoBlob, 'photo.jpg');
        } else if (draft.photo) {
          const res = await fetch(draft.photo);
          const blob = await res.blob();
          formData.append('photo', blob, 'photo.jpg');
        }

        if (draft.lat && draft.lon) {
          formData.append('lat', draft.lat);
          formData.append('lon', draft.lon);
        }

        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Gagal mengirim cerita');

        await deleteDraftById(id); 
        alert('Cerita berhasil dikirim!');
        showDraftStories();
      } catch (error) {
        alert('Gagal mengirim cerita: ' + error.message);
      }
    }

    // Hapus draft
    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      await deleteDraftById(id);
      showDraftStories();
    }
  });

  document.getElementById('back-to-home')?.addEventListener('click', () => {
    location.hash = '#home';
  });
}
