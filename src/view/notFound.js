export function renderNotFound() {
  const root = document.getElementById('main-content');
  if (!root) return;
  root.innerHTML = `
    <h2>404 - Halaman Tidak Ditemukan</h2>
    <p>Halaman yang Anda cari tidak tersedia.</p>
    <a href="#home">Kembali ke Beranda</a>
  `;
}
