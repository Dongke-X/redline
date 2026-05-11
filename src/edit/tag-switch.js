// 改元素标签（p ↔ h1/h2/h3/h4）—— 借鉴 heyhtml 的 H▼ 下拉。
// 实现策略：不真去 swap live DOM 的 tag（会破坏 selector / elementOps 的元素引用）。
// 用 data-fbw-tag-as 属性 + 一组 CSS 让元素"看起来像"目标 tag，apply.mjs 在源 HTML 上做真正的 tag 替换。
import { state } from '../core/state.js';
import { recordOp, clearOpsOn } from '../core/elements.js';
import { pushUndo } from '../core/undo.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

const TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

let popover = null;

export function createTagPopoverNode() {
  popover = document.createElement('div');
  popover.className = 'fbw-tag-popover';
  popover.innerHTML = TAGS.map(tag => `<button data-fbw-tag="${tag}">${tag.toUpperCase()}</button>`).join('');
  return popover;
}

export function isTagSwitchable(el) {
  if (!el) return false;
  return /^(p|h[1-6])$/i.test(el.tagName);
}

function currentTagOf(el) {
  return (el.getAttribute('data-fbw-tag-as') || el.tagName).toLowerCase();
}

function paintActive(el) {
  if (!popover) return;
  const cur = currentTagOf(el);
  popover.querySelectorAll('[data-fbw-tag]').forEach(b => {
    b.classList.toggle('fbw-active', b.dataset.fbwTag === cur);
  });
}

export function openTagPopover() {
  if (!popover || !state.selectedEl) return;
  const tb = state.elemToolbar.getBoundingClientRect();
  popover.style.top = (tb.bottom + 6) + 'px';
  popover.style.left = (tb.left + 24) + 'px';
  popover.classList.add('fbw-on');
  paintActive(state.selectedEl);
}

export function closeTagPopover() {
  if (popover) popover.classList.remove('fbw-on');
}

export function applyTagSwitch(el, toTag) {
  if (!el || !TAGS.includes(toTag)) return;
  const fromLive = el.tagName.toLowerCase();
  const fromMark = (el.getAttribute('data-fbw-tag-as') || '').toLowerCase();
  // 切回原生 tag → 撤销标记 + 清掉 tag op
  if (toTag === fromLive && !fromMark) {
    closeTagPopover();
    return;
  }
  if (toTag === fromLive) {
    pushUndo(el);
    el.removeAttribute('data-fbw-tag-as');
    // 把 ops 里的 tag op 撤掉
    const rec = state.elementOps.get(el);
    if (rec) {
      rec.ops = rec.ops.filter(o => o.op !== 'tag');
      if (!rec.ops.length) clearOpsOn(el);
    }
    showToast(t('op.tag.cleared') || `已撤销标签变更`);
    closeTagPopover();
    return;
  }
  pushUndo(el);
  el.setAttribute('data-fbw-tag-as', toTag);
  recordOp(el, 'tag', { from: fromLive, to: toTag });
  showToast(t('op.tag.done', { tag: toTag.toUpperCase() }) || `标签变更为 ${toTag.toUpperCase()}`);
  closeTagPopover();
}

export function attachTagPopoverEvents() {
  if (!popover) return;
  popover.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fbw-tag]');
    if (!btn || !state.selectedEl) return;
    e.stopPropagation();
    applyTagSwitch(state.selectedEl, btn.dataset.fbwTag);
  });
  document.addEventListener('mousedown', (e) => {
    if (!popover.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-tag-popover, [data-op="tag"]')) return;
    closeTagPopover();
  }, true);
}
