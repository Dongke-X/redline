// IndexedDB key-value 助手。两个 store：
//   kv     —— 通用 key/value（FileSystemDirectoryHandle 等）
//   blobs  —— 附件 Blob（截图/上传图片），避免巨大 dataURL 灌进 localStorage
const DB_NAME = 'fbw';
const STORE_KV = 'kv';
const STORE_BLOBS = 'blobs';
const VERSION = 2;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV);
      if (!db.objectStoreNames.contains(STORE_BLOBS)) db.createObjectStore(STORE_BLOBS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function txGet(store, key) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
function txPut(store, key, value) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
}
function txDel(store, key) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
}

// kv store（旧 API 保持向后兼容）
export const idbGet = (k) => txGet(STORE_KV, k);
export const idbSet = (k, v) => txPut(STORE_KV, k, v);
export const idbDel = (k) => txDel(STORE_KV, k);

// blobs store（v2.6 新增）
export const idbGetBlob = (k) => txGet(STORE_BLOBS, k);
export const idbPutBlob = (k, blob) => txPut(STORE_BLOBS, k, blob);
export const idbDelBlob = (k) => txDel(STORE_BLOBS, k);
