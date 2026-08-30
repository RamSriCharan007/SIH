// IndexedDB Offline Storage Helper for GraminAarogya

const DB_NAME = 'GraminAarogyaDB';
const DB_VERSION = 2;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('remedies')) {
        db.createObjectStore('remedies', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('complications')) {
        db.createObjectStore('complications', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('hospitals')) {
        db.createObjectStore('hospitals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('asha_queue')) {
        db.createObjectStore('asha_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('travel_tokens')) {
        db.createObjectStore('travel_tokens', { keyPath: 'tokenId' });
      }
      if (!db.objectStoreNames.contains('gps_logs')) {
        db.createObjectStore('gps_logs', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToStore(storeName, items) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(items)) {
      items.forEach(item => store.put(item));
    } else {
      store.put(items);
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllFromStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}
