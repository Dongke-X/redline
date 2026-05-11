// FileSystemDirectoryHandle 持久化管理。
// 首次保存时弹 showDirectoryPicker 让用户选目录（建议 ~/.redline/sessions/），
// 选完后 handle 存到 IndexedDB，之后保存只在 permission 失效时才再 prompt。
import { idbGet, idbSet, idbDel } from './idb.js';

const HANDLE_KEY = 'sessionsDir';

export function fsAccessSupported() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

async function verifyPermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission) return false;
  const opts = { mode };
  try {
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
  } catch (_) {}
  return false;
}

export async function getStoredDirHandle() {
  const handle = await idbGet(HANDLE_KEY);
  if (!handle) return null;
  return (await verifyPermission(handle)) ? handle : null;
}

export async function pickDirHandle() {
  const handle = await window.showDirectoryPicker({
    id: 'redline-sessions',
    mode: 'readwrite',
    startIn: 'desktop',
  });
  await idbSet(HANDLE_KEY, handle);
  return handle;
}

export async function clearDirHandle() {
  await idbDel(HANDLE_KEY);
}
