const DB_NAME = 'storyDrafts';
const STORE_NAME = 'drafts';

export function openDraftDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject('Gagal membuka IndexedDB');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveDraftToDB(draft) {
  const db = await openDraftDB();
  const tx = db.transaction('drafts', 'readwrite');
  const store = tx.objectStore('drafts');
  store.add(draft);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllDraftsFromDB() {
  const db = await openDraftDB();
  const tx = db.transaction('drafts', 'readonly');
  const store = tx.objectStore('drafts');
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDraftById(id) {
  const db = await openDB();
  const tx = db.transaction('drafts', 'readwrite');
  const store = tx.objectStore('drafts');
  store.delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

