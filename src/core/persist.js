// localStorage 持久化。Phase 1 会扩展这里加 FS Access 写盘。
import { state } from './state.js';
import { STORAGE_KEY } from '../config.js';
import { getText } from './elements.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

let saveTimer = null;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.globalNote && state.panel) {
      state.panel.querySelector('[data-fbw-global]').value = data.globalNote;
    }
    if (data.sectionFeedback) {
      Object.entries(data.sectionFeedback).forEach(([k, v]) => state.sectionFeedback.set(k, v));
    }
    if (Array.isArray(data.attachments)) {
      data.attachments.forEach(a => state.attachments.push(a));
    }
    if (Array.isArray(data.annotations)) {
      data.annotations.forEach(a => state.annotations.push(a));
    }
    // ⚠️ 不再持久化/回填编辑改动到 element 内部 textContent
    // 原因：el.textContent = val 会破坏 element 内的 <br/><em> 等 HTML 结构，
    //      导致富文本元素（如 cover h1）被毁掉。改动当场处理（复制/下载）即可。

    // 恢复提示：第一次回到这个 URL 时给用户一个回执，让 ta 知道之前的反馈还在
    const restored = {
      anno: state.annotations.length,
      sec: state.sectionFeedback.size,
      att: state.attachments.length,
      hasGlobal: !!(data.globalNote || '').trim(),
    };
    const total = restored.anno + restored.sec + restored.att + (restored.hasGlobal ? 1 : 0);
    if (total > 0 && data.savedAt) {
      const ageMs = Date.now() - data.savedAt;
      // 只有跨会话回来才提示（本会话内的 hot reload 不打扰）
      const showHint = ageMs > 60_000;
      if (showHint) {
        const pieces = [];
        if (restored.anno) pieces.push(t('restore.piece.anno', { count: restored.anno }));
        if (restored.sec) pieces.push(t('restore.piece.sec', { count: restored.sec }));
        if (restored.att) pieces.push(t('restore.piece.att', { count: restored.att }));
        if (restored.hasGlobal) pieces.push(t('restore.piece.global'));
        // 延迟一帧，避免被其它 init 阶段的 toast 覆盖
        setTimeout(() => showToast(t('restore.hint', { pieces: pieces.join(' · ') })), 600);
      }
    }
  } catch (e) { /* ignore */ }
}

let quotaToastShown = false;

export function saveState() {
  if (!state.panel) return;
  let payload;
  try {
    const edits = {};
    // 跟 getChanges 保持一致：只查带 fbwEdited 标记的元素，避免 JS 自动更新的
    // 元素（时钟/计数）被误判成 edit 进入 localStorage
    document.querySelectorAll('[data-fbw-edit-id][data-fbw-edited]').forEach((el) => {
      const id = el.dataset.fbwEditId;
      const txt = getText(el);
      if (state.originals.get(id) !== txt) edits[id] = txt;
    });
    const sectionObj = {};
    state.sectionFeedback.forEach((v, k) => { sectionObj[k] = v; });
    const data = {
      globalNote: state.panel.querySelector('[data-fbw-global]').value,
      sectionFeedback: sectionObj,
      // 只持久化 metadata（id/name/type）；dataURL 不进 localStorage（IDB 里有 blob）
      attachments: state.attachments.map(a => ({ id: a.id, name: a.name, type: a.type })),
      annotations: state.annotations,
      edits,
      savedAt: Date.now(),
    };
    payload = JSON.stringify(data);
  } catch (e) {
    console.warn('[fbw] saveState serialize failed:', e);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, payload);
    quotaToastShown = false;
  } catch (e) {
    // QuotaExceededError or similar — 反馈量太大，主要是截图 dataURL
    console.warn('[fbw] saveState quota exceeded, payload size:', payload.length, e?.name);
    if (!quotaToastShown) {
      quotaToastShown = true;
      showToast(t('persist.quota'));
    }
    // 降级：metadata 已经很小（attachments 改 IDB 后通常不会再触发这里），
    // 但若 annotations.image.dataURL 还堆得多，再去掉 image dataURL 重试
    try {
      const minimal = JSON.parse(payload);
      minimal.annotations = (minimal.annotations || []).map(a => ({
        ...a,
        image: a.image ? { ...a.image, dataURL: '' } : a.image,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch (_) { /* 仍写不进就放弃，等用户保存反馈到磁盘 */ }
  }
}

export function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 400);
}

export function clearStoredState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}
