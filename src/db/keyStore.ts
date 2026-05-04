const DB_NAME = "whisperbox-db";
const STORE_NAME = "keys";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePrivateKey = async (userId: string, key: CryptoKey) => {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.put(key, userId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getPrivateKey = async (userId: string): Promise<CryptoKey | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get(userId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => reject(request.error);
  });
};

export const deletePrivateKey = async (userId: string) => {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.delete(userId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};