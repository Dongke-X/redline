// 从 single-file HTML 的内嵌 state script 恢复 redline 完整状态。
// 跑在 registerEditableElements 之前 —— 把 originals/originalsHTML 等先填好，
// 后续 register 看到元素已有 data-fbw-edit-id 会跳过，不会覆盖。
import { state } from './state.js';

export function detectRehydrate() {
  const scriptEl = document.querySelector('script[data-fbw-state]');
  const modeMeta = document.querySelector('meta[name="fbw-export-mode"]');
  if (modeMeta && modeMeta.getAttribute('content') === 'readonly') {
    state.readOnly = true;
    document.body.classList.add('fbw-readonly');
  }
  if (!scriptEl) return false;
  try {
    const data = JSON.parse(scriptEl.textContent || '{}');
    rehydrateFromData(data);
    return true;
  } catch (e) {
    console.warn('[fbw] inline state parse failed:', e);
    return false;
  }
}

function rehydrateFromData(data) {
  // originals + originalsHTML（textContent / innerHTML 基线）
  (data.originals || []).forEach(([id, val]) => state.originals.set(id, val));
  (data.originalsHTML || []).forEach(([id, val]) => state.originalsHTML.set(id, val));

  // 文字编辑：用 innerHTML 回填（保住 markup）
  Object.entries(data.edits || {}).forEach(([id, innerHTML]) => {
    const el = document.querySelector(`[data-fbw-edit-id="${cssEscape(id)}"]`);
    if (!el) return;
    el.innerHTML = innerHTML;
    el.dataset.fbwEdited = '1';
    el.classList.add('fbw-changed');
  });

  // elementOps：按 fbwEditId 找回元素，挂回 Map
  (data.elementOps || []).forEach(({ id, descriptor, ops }) => {
    if (!id) return;
    const el = document.querySelector(`[data-fbw-edit-id="${cssEscape(id)}"]`);
    if (!el) return;
    state.elementOps.set(el, { ops: ops || [], descriptor: descriptor || '' });
  });

  // sectionFeedback
  Object.entries(data.sectionFeedback || {}).forEach(([k, v]) => {
    state.sectionFeedback.set(k, v);
  });

  // annotations（rerenderAllAnnotations 会从这里重建 DOM）
  if (Array.isArray(data.annotations)) {
    state.annotations.push(...data.annotations);
  }

  // attachments（含 dataURL）
  if (Array.isArray(data.attachments)) {
    state.attachments.push(...data.attachments);
  }

  // 全局反馈：init 阶段还没有 panel，stash 起来，panel 创建后填
  if (data.globalNote) state.__rehydrateGlobalNote = data.globalNote;
}

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return String(s).replace(/[^\w-]/g, c => '\\' + c);
}
