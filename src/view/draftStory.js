import { getAllDraftsFromDB, deleteDraftById } from '../utils/dafrtDB.js';
import { checkLoginStatus } from '../utils/auth.js';

export async function showDraftStories() {
  let root = document.getElementById('main-content');
  if (!root) return;

  // 🔁 Bersihkan event listener lama
  const cleanRoot = root.cloneNode(false);
  root.replaceWith(cleanRoot);
  root = cleanRoot;

  checkLoginStatus();
  const drafts = await getAllDraftsFromDB();

  if (drafts.length === 0) {
    root.innerHTML = '<p>Belum ada draft cerita.</p>';
    return;
  }

  root.innerHTML = `
    <h2>Draft Cerita</h2>
    ${drafts.map(draft => `
      <div class="draft-item" style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
        <p><strong>Deskripsi:</strong> ${draft.description}</p>
        ${draft.base64 ? `<img src="${draft.base64}" style="max-width: 200px;" alt="Preview Foto" />` : ''}
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
      sendBtn.disabled = true;
      const id = Number(sendBtn.dataset.id);
      const draft = drafts.find(d => d.id === id);
      if (!draft) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Sesi login berakhir. Silakan login kembali.');
          location.hash = '#login';
          return;
        }

        const formData = new FormData();
        formData.append('description', draft.description);

        if (draft.base64) {
          const response = await fetch(draft.base64);
          const blob = await response.blob();
          formData.append('photo', blob, 'photo.jpg');
        } else {
          alert('Foto tidak ditemukan di draft.');
          return;
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
        await showDraftStories();
      } catch (error) {
        alert('Gagal mengirim cerita: ' + error.message);
        sendBtn.disabled = false;
      }
    }

    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      await deleteDraftById(id);
      await showDraftStories();
    }
  });

  root.querySelector('#back-to-home')?.addEventListener('click', () => {
    location.hash = '#home';
  });
}
