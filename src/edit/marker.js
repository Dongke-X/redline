// 马克笔高亮：给选中元素打 inline background-color，模拟"荧光笔扫一笔"。
// 提供 5 种荧光色 + 清除选项。
import { state } from '../core/state.js';
import { recordOp } from '../core/elements.js';
import { pushUndo, pushUndoGroup } from '../core/undo.js';
import { showUndoToast } from '../utils/undo-toast.js';
import { getSelectedEls } from './selection.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

const COLORS = [
  { name: 'yellow', value: 'rgba(255, 235, 80, 0.55)',  swatch: '#ffeb50', label: '黄' },
  { name: 'green',  value: 'rgba(140, 220, 130, 0.55)', swatch: '#8cdc82', label: '绿' },
  { name: 'blue',   value: 'rgba(150, 200, 255, 0.55)', swatch: '#96c8ff', label: '蓝' },
  { name: 'pink',   value: 'rgba(255, 170, 200, 0.55)', swatch: '#ffaac8', label: '粉' },
  { name: 'orange', value: 'rgba(255, 200, 130, 0.55)', swatch: '#ffc882', label: '橙' },
];

function buildMarkerPopoverHTML() {
  const colors = COLORS.map(c => `
    <button class="fbw-marker-swatch" data-color="${c.value}" data-name="${c.name}" data-tooltip="${c.label}" style="background:${c.swatch};"></button>
  `).join('');
  return `
    <div class="fbw-marker-row">${colors}</div>
    <button class="fbw-marker-clear" data-clear>${t('highlight.clear')}</button>
  `;
}

// 打开 popover 时锁定目标元素 + 文本选区（避免后续被点击清掉）
let pendingTarget = null;
let pendingRange = null;

function captureSelectionRange(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return null;
  // 选区必须落在目标元素内
  if (!el.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function wrapRangeWithHighlight(range, color, name) {
  const span = document.createElement('span');
  span.className = 'fbw-hl';
  span.dataset.fbwHighlight = name || '1';
  span.style.background = color;
  span.style.borderRadius = '2px';
  span.style.padding = '0 1px';
  try {
    range.surroundContents(span);
    return span;
  } catch {
    // 跨节点选区 → 用 extractContents 重组
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
    return span;
  }
}

function positionMarkerPopover() {
  const btn = state.elemToolbar?.querySelector('[data-op="highlight"]');
  if (!btn || !state.markerPopover) return;
  const pop = state.markerPopover;
  // 先显示用真实高度计算
  pop.style.visibility = 'hidden';
  pop.style.top = '0px'; pop.style.left = '0px';
  const popH = pop.offsetHeight || 80;
  const popW = pop.offsetWidth || 200;
  const r = btn.getBoundingClientRect();
  const tb = state.elemToolbar.getBoundingClientRect();

  // 优先放在工具栏左侧，避开被高亮元素的位置
  let left = tb.right + 8;
  let top = tb.top;
  if (left + popW > window.innerWidth - 8) {
    left = tb.left - popW - 8; // fallback：工具栏左侧
  }
  if (left < 8) {
    // 仍放不下，则放在工具栏上方
    left = Math.max(8, Math.min(r.left, window.innerWidth - popW - 8));
    top = tb.top - popH - 8;
    if (top < 8) top = tb.bottom + 8; // 顶部也放不下，放下面
  }
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
  pop.style.visibility = '';
}

export function openMarkerPopover() {
  if (!state.markerPopover) return;
  pendingTarget = state.selectedEl || null;
  pendingRange = pendingTarget ? captureSelectionRange(pendingTarget) : null;
  state.markerPopover.innerHTML = buildMarkerPopoverHTML();
  state.markerPopover.classList.add('fbw-on');
  positionMarkerPopover();
}

export function closeMarkerPopover() {
  if (state.markerPopover) state.markerPopover.classList.remove('fbw-on');
  pendingTarget = null;
  pendingRange = null;
}

// 清掉元素内所有 .fbw-hl 包裹（用于 clear 操作）
function clearInlineHighlights(el) {
  el.querySelectorAll('.fbw-hl').forEach(span => {
    const parent = span.parentNode;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize?.();
  });
}

function applyHighlight(anchorEl, color, name, range) {
  if (!anchorEl) return;
  // range（划词高亮）只对 anchor 生效（其他元素没文字选区）；元素级高亮支持多选 gang
  if (range) {
    pushUndo(anchorEl);
    if (color) {
      wrapRangeWithHighlight(range, color, name);
      window.getSelection()?.removeAllRanges();
      recordOp(anchorEl, 'highlight', { color, name, scope: 'range' });
      showUndoToast(t('op.highlight') + (name ? ': ' + name : ''));
    }
    return;
  }
  const els = getSelectedEls();
  pushUndoGroup(els);
  els.forEach(x => {
    if (color) {
      x.style.background = color;
      x.dataset.fbwHighlight = name || '1';
      recordOp(x, 'highlight', { color, name, scope: 'element' });
    } else {
      clearInlineHighlights(x);
      x.style.background = '';
      delete x.dataset.fbwHighlight;
      recordOp(x, 'highlight', { color: null });
    }
  });
  const base = color ? (t('op.highlight') + (name ? ': ' + name : '')) : t('highlight.clear');
  showUndoToast(els.length > 1 ? `${base} · ${els.length}` : base);
}

export function attachMarkerEvents() {
  const popover = state.markerPopover;
  if (!popover) return;

  popover.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = pendingTarget || state.selectedEl;
    if (!target) return;
    const range = pendingRange;
    const swatch = e.target.closest('[data-color]');
    if (swatch) {
      applyHighlight(target, swatch.dataset.color, swatch.dataset.name, range);
      closeMarkerPopover();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      applyHighlight(target, '', null, null);
      closeMarkerPopover();
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (!popover.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-marker-popover, [data-op="highlight"], .fbw-elem-toolbar')) return;
    closeMarkerPopover();
  }, true);
}
