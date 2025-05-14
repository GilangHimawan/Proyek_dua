import { loginUser, registerUser } from '../presenters/authPresenter.js';
import { loadStories } from '../presenters/storyPresenter.js';
import { checkLoginStatus } from '../utils/auth.js';
import { showLoader, hideLoader} from '../utils/loader.js';
import { subscribePushNotification , unsubscribePushNotification } from '../utils/push.js';

const root = document.getElementById('main-content');

export function renderHome() {
  if (!root) return;

  root.innerHTML = `
    <h2>Home</h2>
    <button id="add-story-btn">Tambah Cerita</button>
    <div>
      <button id="go-to-bookmark">📑 Bookmark</button>
    </div>
    <div>
      <button id="toggle-notif">Aktifkan Notifikasi</button>
    </div>
    <div id="stories-list"></div>
    <button id="logout-button" style="display: none;">Logout</button>
  `;

  showLoader();
  loadStories();
  checkLoginStatus();
  hideLoader();

  document.getElementById('add-story-btn')?.addEventListener('click', () => {
    location.hash = '#add';
  });

  document.getElementById('go-to-bookmark')?.addEventListener('click', () => {
    location.hash = '#draft';
  });

  document.getElementById('logout-button')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.hash = '#login';
  });

  // 🔔 Toggle Notifikasi
  const toggleBtn = document.getElementById('toggle-notif');

  async function updateToggleButtonText() {
    const enabled = localStorage.getItem('pushSubscribed') === 'true';
    toggleBtn.textContent = enabled ? 'Nonaktifkan Notifikasi' : 'Aktifkan Notifikasi';
  }

  toggleBtn?.addEventListener('click', async () => {
    try {
      const enabled = localStorage.getItem('pushSubscribed') === 'true';
      if (enabled) {
        await unsubscribePushNotification();
      } else {
        await subscribePushNotification();
      }
      await updateToggleButtonText();
    } catch (err) {
      alert('Gagal mengatur notifikasi: ' + err.message);
    }
  });

  updateToggleButtonText();
}



export function renderLogin() {
  if (!root) return;
  root.innerHTML = `
    <h2>Login</h2>
    <form id="login-form">
      <label for="email">Email:</label>
      <input type="email" id="email" required />
      <label for="password">Password:</label>
      <input type="password" id="password" required />
      <button type="submit">Login</button>
    </form>
  `;

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;


    showLoader();
    await loginUser(email, password);
    hideLoader();
  });
}

export function renderRegister() {
  if (!root) return;
  root.innerHTML = ` 
    <h2>Register</h2>
    <form id="register-form">
      <label for="name">Nama:</label>
      <input type="text" id="name" required />
      <label for="email">Email:</label>
      <input type="email" id="email" required />
      <label for="password">Password:</label>
      <input type="password" id="password" required />
      <button type="submit">Register</button>
    </form>
  `;

  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    showLoader();
    await registerUser(name, email, password);
    hideLoader();
  });
}
