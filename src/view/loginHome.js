import { loginUser, registerUser } from '../presenters/authPresenter.js';
import { loadStories } from '../presenters/storyPresenter.js';
import { checkLoginStatus } from '../utils/auth.js';

const root = document.getElementById('main-content');

export function renderHome() {
  if (!root) return;
  root.innerHTML = `
    <h2>Home</h2>
    <button id="add-story-btn" aria-label="Tambah Cerita">Tambah Cerita</button>
    <div id="stories-list"></div>
    <button id="logout-button" style="display: none;">Logout</button>
  `;

  loadStories();
  checkLoginStatus();

  // Menambahkan event listener untuk tombol "Tambah Cerita"
  document.getElementById('add-story-btn')?.addEventListener('click', () => {
    // Mengubah hash menjadi #add untuk menavigasi ke form tambah cerita
    location.hash = '#add';
  });

  document.getElementById('logout-button')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.hash = 'login';
  });
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
    await loginUser(email, password);
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
    await registerUser(name, email, password);
  });
}
