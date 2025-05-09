import './tampilan.css';

const root = document.getElementById('main-content');

// Fungsi routing untuk menangani perubahan hash
function route() {
  const hash = location.hash.substring(1);
  if (hash === 'home') {
    renderHome();
  } else if (hash === 'login') {
    renderLogin();
  } else if (hash === 'register') {
    renderRegister();
  } else {
    location.hash = 'home';
  }
}

window.addEventListener('hashchange', route);
route();

// Fungsi untuk menampilkan halaman Home
function renderHome() {
  root.innerHTML = `
    <h2>Home</h2>
    <button onclick="addNewStory()">Tambah Cerita</button>
    <div id="stories-list"></div>
    <button id="logout-button" onclick="logoutUser()" style="display: none;">Logout</button>
  `;
  loadStories();
  checkLoginStatus();
}

// Fungsi untuk menampilkan halaman Login
function renderLogin() {
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
  
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    fetch('https://story-api.dicoding.dev/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        localStorage.setItem('token', data.loginResult.token);
        location.hash = 'home';
      } else {
        alert('Login gagal: ' + data.message);
      }
    })
    .catch(err => alert('Terjadi kesalahan: ' + err));
  });
}

// Fungsi untuk menampilkan halaman Register
function renderRegister() {
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
  
  document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    fetch('https://story-api.dicoding.dev/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        alert('Registrasi berhasil! Silakan login.');
        location.hash = 'login';
      } else {
        alert('Registrasi gagal: ' + data.message);
      }
    })
    .catch(err => alert('Terjadi kesalahan: ' + err));
  });
}

// Cek status login pengguna
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const logoutButton = document.getElementById('logout-button');
  const loginLink = document.querySelector('nav a[href="#login"]');
  const registerLink = document.querySelector('nav a[href="#register"]');
  
  if (logoutButton) logoutButton.style.display = token ? 'inline-block' : 'none';
  if (loginLink) loginLink.style.display = token ? 'none' : 'inline-block';
  if (registerLink) registerLink.style.display = token ? 'none' : 'inline-block';
}

// Fungsi untuk membuka koneksi ke IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('storyAppDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('stories')) {
        db.createObjectStore('stories', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = (err) => reject(err);
  });
}

// Fungsi untuk menyimpan cerita ke IndexedDB
function saveStoriesToDB(stories) {
  openDB().then((db) => {
    const transaction = db.transaction('stories', 'readwrite');
    const store = transaction.objectStore('stories');
    stories.forEach(story => {
      store.put(story); // Menyimpan atau memperbarui cerita
    });
    transaction.oncomplete = () => console.log('Cerita tersimpan ke DB');
    transaction.onerror = (err) => console.error('Error menyimpan cerita:', err);
  });
}

// Fungsi untuk memuat cerita dari IndexedDB
function loadStoriesFromDB() {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction('stories', 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.getAll(); // Mengambil semua data cerita
      request.onsuccess = () => resolve(request.result);
      request.onerror = (err) => reject(err);
    });
  });
}

// Fungsi untuk memuat cerita dari API dan menampilkannya
function loadStories() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login dulu');
    location.hash = '#login';
    return;
  }

  fetch('https://story-api.dicoding.dev/v1/stories', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        saveStoriesToDB(data.listStory); // Simpan cerita ke IndexedDB
        displayStories(data.listStory);
      } else {
        alert('Gagal mengambil cerita');
      }
    })
    .catch(err => {
      console.log('Error fetching from API, try loading from DB', err);
      loadStoriesFromDB().then(stories => {
        if (stories.length > 0) {
          displayStories(stories);
        } else {
          alert('Tidak ada cerita di cache');
        }
      });
    });
}

// Fungsi untuk menampilkan cerita di halaman
function displayStories(stories) {
  const container = document.getElementById('stories-list');
  container.innerHTML = stories.map(story => `
    <div style="padding:10px; margin-bottom:10px; background:#f9f9f9;">
      <h3>${story.name}</h3>
      <p>${story.description}</p>
      <img src="${story.photoUrl}" style="max-width:200px;" alt="story">
      <p>Lat: ${story.lat ?? '-'}, Lon: ${story.lon ?? '-'}</p>
    </div>
  `).join('');
}

// Fungsi untuk menambahkan cerita baru
function addNewStory() {
  if (document.startViewTransition) {
    document.startViewTransition(() => renderAddStoryForm());
  } else {
    renderAddStoryForm();
  }
}

// Fungsi untuk merender form tambah cerita
function renderAddStoryForm() {
  root.innerHTML = `
    <h2>Tambah Cerita</h2>
    <form id="story-form">
      <label>Deskripsi:</label>
      <textarea id="story-description" required></textarea>

      <label>Foto:</label>
      <button type="button" onclick="triggerFileInput()">Pilih dari Perangkat</button>
      <button type="button" onclick="startCamera()">Ambil dari Kamera</button>

      <div id="camera-container" style="display:none;">
        <video id="video" width="320" height="240" autoplay></video>
        <button type="button" onclick="capturePhoto()">Ambil Foto</button>
        <canvas id="canvas" style="display:none;"></canvas>
      </div>

      <input type="file" id="story-photo" accept="image/*" style="display:none;" />
      <input type="hidden" id="story-photo-base64" />

      <input type="hidden" id="story-lat" name="lat" />
      <input type="hidden" id="story-lon" name="lon" />
      <div id="map" style="height:300px;margin-top:10px;"></div>

      <button type="submit">Kirim Cerita</button>
    </form>
  `;

  setupMapForLatLon();

  document.getElementById('story-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const description = document.getElementById('story-description').value;
    const fileInput = document.getElementById('story-photo');
    const base64 = document.getElementById('story-photo-base64').value;
    const lat = document.getElementById('story-lat').value;
    const lon = document.getElementById('story-lon').value;

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', base64);
    formData.append('lat', lat);
    formData.append('lon', lon);

    fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        alert('Cerita berhasil ditambahkan');
        location.hash = 'home';
      })
      .catch(err => alert('Gagal menambah cerita: ' + err));
  });
}

// Fungsi untuk logout pengguna
function logoutUser() {
  localStorage.removeItem('token');
  location.hash = 'login';
}


if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('service-worker.js')
    .then(async function (registration) {
      console.log('Service Worker terdaftar:', registration);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notifikasi tidak diizinkan.');
        return;
      }

      const existing = await registration.pushManager.getSubscription();
      if (!existing) {
        const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; 
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

        console.log('Berhasil subscribe:', JSON.stringify(subscription));
        // Kirim `subscription` ini ke server jika perlu
      }
    })
    .catch(console.error);
}

// Helper: konversi key base64
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker failed:', err));
  });
}



window.addNewStory = addNewStory;
window.logoutUser = logoutUser;
window.triggerFileInput = triggerFileInput;
window.startCamera = startCamera;
window.capturePhoto = capturePhoto;
