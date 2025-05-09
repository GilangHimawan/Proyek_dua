let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
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

  return dbPromise;
}

export async function saveStoriesToDB(stories) {
  try {
    const db = await openDB();
    const tx = db.transaction('stories', 'readwrite');
    const store = tx.objectStore('stories');

    stories.forEach((story) => store.put(story));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log('Cerita berhasil disimpan ke DB.');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Gagal menyimpan cerita ke DB:', err);
  }
}

export async function loadStoriesFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction('stories', 'readonly');
    const store = tx.objectStore('stories');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Gagal memuat cerita dari DB:', err);
    return [];
  }
}

export async function clearStoriesFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction('stories', 'readwrite');
    const store = tx.objectStore('stories');
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Gagal menghapus cerita dari DB:', err);
  }
}
