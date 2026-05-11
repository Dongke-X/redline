// 截图附件：粘贴 / 拖入 / 删除 / 渲染缩略图。
// blob 持久化到 IndexedDB（避免 base64 灌满 localStorage）；
// state.attachments[i].dataURL 仅在内存里，给渲染 / 导出用。
import { state } from '../core/state.js';
import { getChanges } from '../core/elements.js';
import { scheduleSave } from '../core/persist.js';
import { idbPutBlob, idbGetBlob, idbDelBlob } from '../fs/idb.js';
import { showToast, updateCounter } from '../utils.js';
import { t } from '../i18n.js';

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export function addAttachment(blob) {
  if (!blob || !blob.type?.startsWith('image/')) return;
  const id = 'fbw-att-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const name = blob.name || ('截图-' + new Date().toISOString().slice(11, 19).replace(/:/g, '') + '.png');

  blobToDataURL(blob).then(dataURL => {
    state.attachments.push({ id, name, dataURL, type: blob.type });
    renderAttachments();
    scheduleSave(); // 只持久化 metadata（无 dataURL），不会顶满 localStorage
    showToast(t('panel.attachment.added', { count: state.attachments.length }));
    // 同时 blob 写到 IDB（异步，失败不阻塞 UI；下次回到此 URL 能恢复）
    idbPutBlob(id, blob).catch(e => console.warn('[fbw] idb put blob failed:', e));
  }).catch(e => console.warn('[fbw] read blob failed:', e));
}

/**
 * 启动时调用：根据 state.attachments[i].id 从 IDB 把 blob 读回，转 dataURL 填到内存。
 * 在 loadState 之后跑（先有 metadata，再补 dataURL）。
 */
export async function rehydrateAttachments() {
  let restored = 0;
  for (const att of state.attachments) {
    if (att.dataURL) continue; // 已有就跳过
    try {
      const blob = await idbGetBlob(att.id);
      if (blob) {
        att.dataURL = await blobToDataURL(blob);
        restored++;
      }
    } catch (e) { /* 缺图就缺图，不阻断流程 */ }
  }
  if (restored > 0) renderAttachments();
}

export function renderAttachments() {
  const c = state.panel.querySelector('[data-fbw-attachments]');
  c.innerHTML = '';
  state.attachments.forEach((att, i) => {
    const t = document.createElement('div'); t.className = 'fbw-thumb';
    const img = document.createElement('img'); img.src = att.dataURL;
    const x = document.createElement('button'); x.className = 'fbw-thumb-x'; x.innerHTML = '×'; x.type = 'button';
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      const removed = state.attachments.splice(i, 1)[0];
      renderAttachments();
      updateCounter(getChanges);
      scheduleSave();
      // 顺便从 IDB 删除 blob（释放空间）
      if (removed?.id) idbDelBlob(removed.id).catch(() => {});
    });
    t.appendChild(img); t.appendChild(x); c.appendChild(t);
  });
  updateCounter(getChanges);
}

export function attachAttachmentEvents() {
  const handlePaste = (e) => {
    const items = e.clipboardData?.items; if (!items) return;
    let consumed = false;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) { addAttachment(blob); consumed = true; }
      }
    }
    if (consumed) e.preventDefault();
  };

  const globalTa = state.panel.querySelector('[data-fbw-global]');
  ['keydown', 'keyup', 'keypress'].forEach(ev => globalTa.addEventListener(ev, e => e.stopPropagation()));
  globalTa.addEventListener('paste', handlePaste);
  state.panel.addEventListener('paste', handlePaste);
  state.panel.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.types?.includes('Files')) state.panel.classList.add('fbw-drag-over');
  });
  state.panel.addEventListener('dragleave', (e) => {
    if (e.target === state.panel || !state.panel.contains(e.relatedTarget)) {
      state.panel.classList.remove('fbw-drag-over');
    }
  });
  state.panel.addEventListener('drop', (e) => {
    e.preventDefault();
    state.panel.classList.remove('fbw-drag-over');
    const files = Array.from(e.dataTransfer?.files || []);
    files.filter(f => f.type.startsWith('image/')).forEach(addAttachment);
  });
}
