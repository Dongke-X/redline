// 编辑模式下，在空白处 mousedown + 拖 → 画选择矩形 → 释放后选中所有相交的可编辑元素。
// Shift / Cmd / Ctrl 修饰键：在现有选区上追加；不带修饰：替换选区。
// 跟 marquee 模式（标注）的拖拽手势隔离：marquee 模式开启时禁用此功能。
import { state } from '../core/state.js';
import { selectElement, toggleSelection, deselectElement } from './selection.js';
import { onMousemove, onMouseup } from '../utils/events.js';

const THRESHOLD = 6;
const UI_GUARD = '.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-marker-popover, .fbw-tag-popover, .fbw-font-picker, .fbw-note-popover, .fbw-help-popover, .fbw-tooltip, .fbw-anno, .fbw-anno-actions, .fbw-marquee-drawing, .fbw-resize-handles, .fbw-measure-overlay, script, style';

let pending = null; // {x, y, additive}
let activeRect = null; // {x, y, w, h}
let overlayEl = null;

function ensureOverlay() {
  if (overlayEl) return overlayEl;
  overlayEl = document.createElement('div');
  overlayEl.className = 'fbw-rubber-band';
  document.body.appendChild(overlayEl);
  return overlayEl;
}

function updateOverlay(x, y, w, h) {
  const ov = ensureOverlay();
  ov.style.left = x + 'px';
  ov.style.top = y + 'px';
  ov.style.width = w + 'px';
  ov.style.height = h + 'px';
  ov.classList.add('fbw-on');
}

function hideOverlay() {
  if (overlayEl) overlayEl.classList.remove('fbw-on');
}

function rectsIntersect(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function commitSelection(rect, additive) {
  const selRect = {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.w,
    bottom: rect.y + rect.h,
  };
  // 候选：所有注册过的可编辑元素 + section（让用户能整段选中而非只选子元素）
  const candidates = document.querySelectorAll('[data-fbw-edit-id], [data-fbw-sec-id] > *');
  const hits = [];
  const seen = new Set();
  candidates.forEach(el => {
    if (seen.has(el)) return;
    if (el.closest(UI_GUARD)) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (rectsIntersect(r, selRect)) {
      seen.add(el);
      hits.push(el);
    }
  });
  // 过滤：保留每个独立的"最底层"元素，避免一个 section + 所有子段同时入选
  // 简单规则：如果一个候选 el 完全包含另一个候选 el2，跳过 el（保留 el2）
  const filtered = hits.filter(el => !hits.some(other => other !== el && el.contains(other)));
  if (!filtered.length) return;
  if (!additive) deselectElement();
  // 第一个走 selectElement 设 anchor + 工具栏；其余走 toggle（add）
  if (state.selectedEls.size === 0) {
    selectElement(filtered[0]);
    filtered.slice(1).forEach(toggleSelection);
  } else {
    filtered.forEach(el => { if (!state.selectedEls.has(el)) toggleSelection(el); });
  }
}

export function attachRubberBandEvents() {
  document.addEventListener('mousedown', (e) => {
    if (!state.editMode) return;
    if (state.marqueeMode) return;
    if (e.button !== 0) return;
    if (e.target.closest(UI_GUARD)) return;
    // 落在已注册元素或其子节点上 → 走单选 / 多选 click 流程，不抢
    if (e.target.closest('[data-fbw-edit-id]')) return;
    // 已有选区且 mousedown 命中某个选中元素 → 让 drag 走（toolbar.js attachDragEvents）
    const inSelection = [...state.selectedEls].some(s => s === e.target || s.contains(e.target));
    if (inSelection) return;
    pending = {
      x: e.clientX,
      y: e.clientY,
      additive: e.shiftKey || e.metaKey || e.ctrlKey,
    };
  }, true);

  onMousemove((e) => {
    if (pending && !activeRect) {
      const dx = e.clientX - pending.x;
      const dy = e.clientY - pending.y;
      if (Math.hypot(dx, dy) < THRESHOLD) return;
      activeRect = { startX: pending.x, startY: pending.y, additive: pending.additive };
      pending = null;
    }
    if (!activeRect) return;
    e.preventDefault();
    const x = Math.min(activeRect.startX, e.clientX);
    const y = Math.min(activeRect.startY, e.clientY);
    const w = Math.abs(e.clientX - activeRect.startX);
    const h = Math.abs(e.clientY - activeRect.startY);
    activeRect.x = x; activeRect.y = y; activeRect.w = w; activeRect.h = h;
    updateOverlay(x, y, w, h);
  });

  onMouseup(() => {
    if (pending) pending = null;
    if (!activeRect) return;
    hideOverlay();
    if (activeRect.w > 4 && activeRect.h > 4) {
      commitSelection(activeRect, activeRect.additive);
    }
    activeRect = null;
  });

  // Esc 取消正在画的框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeRect) {
      e.preventDefault();
      activeRect = null;
      hideOverlay();
    }
  });
}
