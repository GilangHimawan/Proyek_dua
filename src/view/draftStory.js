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
      <div style="border:1px solid #ccc; margin-bottom:10px; padding:10px;">
        <p><strong>Deskripsi:</strong> ${draft.description}</p>
        ${draft.photo ? `<img src="${draft.photo}" style="max-width:200px;" />` : ''}
        <p>Lokasi: Lat ${draft.lat ?? '-'}, Lon ${draft.lon ?? '-'}</p>
        <button class="delete-draft-btn" data-id="${draft.id}">🗑 Hapus Draft</button>

        <button id="back-to-home" style="display: none;">Kembali Ke Beranda</button>
      </div>
    `).join('')}
    
  `;

  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-draft-btn');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    await deleteDraftById(id);
    showDraftStories();
  });

  document.getElementById('back-to-home').addEventListener('click', () => {
  location.hash = '#home';
  });
}
