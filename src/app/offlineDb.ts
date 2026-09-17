const DB_NAME = 'PlugInOfflineDB';
const DB_VERSION = 1;
const STORE_DOWNLOADS = 'downloads';

export interface DownloadedSong {
  id: string;
  metadata: any; 
  blob: Blob;
  size: number;
  downloadedAt: number;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOWNLOADS)) {
        db.createObjectStore(STORE_DOWNLOADS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDownload(song: any, blob: Blob): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_DOWNLOADS, 'readwrite');
  const store = tx.objectStore(STORE_DOWNLOADS);
  
  const record: DownloadedSong = {
    id: song.id,
    metadata: song,
    blob,
    size: blob.size,
    downloadedAt: Date.now()
  };
  
  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDownload(id: string): Promise<DownloadedSong | undefined> {
  const db = await getDB();
  const tx = db.transaction(STORE_DOWNLOADS, 'readonly');
  const store = tx.objectStore(STORE_DOWNLOADS);
  
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function removeDownload(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_DOWNLOADS, 'readwrite');
  const store = tx.objectStore(STORE_DOWNLOADS);
  
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDownloads(): Promise<DownloadedSong[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_DOWNLOADS, 'readonly');
  const store = tx.objectStore(STORE_DOWNLOADS);
  
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
