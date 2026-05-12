// 从 single-file HTML 的内嵌 state script 恢复 redline 完整状态。
// 跑在 registerEditableElements 之前 —— 把 originals/originalsHTML 等先填好，
// 后续 register 看到元素已有 data-fbw-edit-id 会跳过，不会覆盖。
import { state } from './state.js';
import { ICON_PRINT } from '../assets/icons.js';
import { t } from '../i18n.js';

export function detectRehydrate() {
  const scriptEl = document.querySelector('script[data-fbw-state]');
  const modeMeta = document.querySelector('meta[name="fbw-export-mode"]');
  let mode = null;
  if (modeMeta) mode = modeMeta.getAttribute('content');
  if (mode === 'readonly') {
    state.readOnly = true;
    document.body.classList.add('fbw-readonly');
    state.__rehydrateMode = 'readonly';
  } else if (mode === 'editable') {
    state.__rehydrateMode = 'editable';
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

// rehydrate UX：只读 HTML 注入打印按钮；可编辑 HTML 给 FAB 加一次呼吸光 + tooltip
export function applyRehydrateUX() {
  if (state.__rehydrateMode === 'readonly') injectPrintFab();
  else if (state.__rehydrateMode === 'editable') showWelcomeBreathe();
}

function injectPrintFab() {
  if (document.querySelector('.fbw-print-fab')) return;
  const btn = document.createElement('button');
  btn.className = 'fbw-print-fab';
  btn.type = 'button';
  btn.innerHTML = ICON_PRINT;
  btn.title = t('readonly.print') || '打印 / 另存为 PDF';
  btn.addEventListener('click', () => window.print());
  document.body.appendChild(btn);
}

function showWelcomeBreathe() {
  // FAB 还没建出来，等一帧
  requestAnimationFrame(() => {
    const fab = state.editFab || document.querySelector('.fbw-edit-fab');
    if (!fab) return;
    fab.classList.add('fbw-breathe');
    setTimeout(() => fab.classList.remove('fbw-breathe'), 3500);

    const tip = document.createElement('div');
    tip.className = 'fbw-welcome-tip';
    tip.textContent = t('welcome.editable') || '双击元素继续标 · ⌘Z 撤销';
    document.body.appendChild(tip);
    const r = fab.getBoundingClientRect();
    requestAnimationFrame(() => {
      tip.style.left = Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2) + 'px';
      tip.style.top = (r.top - tip.offsetHeight - 12) + 'px';
      tip.classList.add('fbw-on');
    });
    setTimeout(() => {
      tip.classList.remove('fbw-on');
      setTimeout(() => tip.remove(), 400);
    }, 4200);
  });
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

  // 版本链：把当前文件的 revision 信息 stash 起来，下次导出时作为 parent
  if (data.revisionId || data.revision) {
    state.__rehydrateRevision = {
      id: data.revisionId || null,
      revision: data.revision || 1,
      exporter: data.exporter || null,
      capturedAt: data.capturedAt || null,
    };
  }
}

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return String(s).replace(/[^\w-]/g, c => '\\' + c);
}
