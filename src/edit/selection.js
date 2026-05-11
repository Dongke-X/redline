// 元素选中、工具栏定位、跟随滚动、文字编辑入口、handleEditableChange。
// editMode 切换也在这里（toggleEdit）。
import { state } from '../core/state.js';
import { onScroll, onResize } from '../utils/events.js';
import { getElDescriptor, getText, getChanges } from '../core/elements.js';
import { scheduleSave } from '../core/persist.js';
import { closeFontPicker, positionFontPicker } from './fonts.js';
import { showResizeHandles, hideResizeHandles, positionResizeHandles } from './resize.js';
import { exitMarqueeMode } from './marquee.js';
import { closeNotePopover } from './toolbar.js';
import { closeMarkerPopover } from './marker.js';
import { getElementNote } from '../core/elements.js';
import { showToast, updateCounter, pendingEditCount } from '../utils.js';
import { t } from '../i18n.js';

export function liftTarget(el) {
  if (!el) return el;
  const svg = el.closest('svg');
  if (svg && !svg.matches('.fbw-icon-btn svg, .fbw-elem-toolbar svg, .fbw-fab svg, .fbw-panel svg')) {
    return svg;
  }
  // 如果命中的不是 EDITABLE 本身，但有 EDITABLE 父级（典型：a 里嵌 span / text node）
  // → lift 到那个 EDITABLE 父级，避免选错或漏选
  if (!el.dataset?.fbwEditId && el.closest) {
    const ed = el.closest('[data-fbw-edit-id]');
    if (ed) return ed;
  }
  return el;
}

// 工具栏到元素顶部的间距（px）—— 给 4 角的旋转/缩放手柄留空间
const TOOLBAR_GAP = 24;

export function positionToolbar(el) {
  const rect = el.getBoundingClientRect();
  const tbRect = state.elemToolbar.getBoundingClientRect();
  let top = rect.top - tbRect.height - TOOLBAR_GAP;
  let left = rect.left;
  if (top < 8) top = rect.bottom + TOOLBAR_GAP;
  if (left + tbRect.width > window.innerWidth - 8) left = window.innerWidth - tbRect.width - 8;
  if (left < 8) left = 8;
  state.elemToolbar.style.top = top + 'px';
  state.elemToolbar.style.left = left + 'px';
}

function hasOwnText(el) {
  // 直接子节点里有非空文本节点 = 这个元素自带文字
  for (const node of el.childNodes) {
    if (node.nodeType === 3 && node.textContent.trim()) return true;
  }
  return false;
}

export function selectElement(el) {
  if (state.selectedEl === el) return;
  deselectElement();
  state.selectedEl = el;
  el.classList.add('fbw-selected');

  // 换图按钮：仅对图片元素显示
  const isImg = el.matches('img') || (getComputedStyle(el).backgroundImage || 'none') !== 'none';
  state.elemToolbar.querySelector('[data-op="replace-img"]').style.display = isImg ? 'inline-flex' : 'none';

  // 字体 + 高亮按钮：仅对自带文字的元素显示
  const isTextish = hasOwnText(el) && !el.matches('img, svg, video, iframe');
  const fontBtn = state.elemToolbar.querySelector('[data-op="font"]');
  if (fontBtn) fontBtn.style.display = isTextish ? 'inline-flex' : 'none';
  const hlBtn = state.elemToolbar.querySelector('[data-op="highlight"]');
  if (hlBtn) hlBtn.style.display = isTextish ? 'inline-flex' : 'none';

  // 第一个 divider（位于 font/highlight/replace-img 后）：上面三个都隐藏才同时隐藏
  const firstDivider = state.elemToolbar.querySelector('.fbw-tb-divider');
  if (firstDivider) firstDivider.style.display = (isImg || isTextish) ? '' : 'none';

  // 改链接按钮：仅对 a[href] 元素显示
  const isLink = el.matches('a[href]');
  const linkBtn = state.elemToolbar.querySelector('[data-op="link"]');
  if (linkBtn) linkBtn.style.display = isLink ? 'inline-flex' : 'none';

  // 反馈按钮：如果有 note 显示绿点
  const noteBtn = state.elemToolbar.querySelector('[data-op="note"]');
  if (noteBtn) noteBtn.classList.toggle('fbw-has-note', !!getElementNote(el));

  state.elemToolbar.classList.add('fbw-toolbar-open');
  positionToolbar(el);
  showResizeHandles(el);
}

export function deselectElement() {
  if (state.selectedEl) state.selectedEl.classList.remove('fbw-selected');
  state.selectedEl = null;
  if (typeof window !== 'undefined') window.__fbwSelEl = null;
  closeFontPicker();
  closeNotePopover();
  closeMarkerPopover();
  state.elemToolbar.classList.remove('fbw-toolbar-open');
  hideResizeHandles();
}

export function enterTextEdit(el) {
  deselectElement();
  el.contentEditable = 'true';
  el.spellcheck = false;
  el.dataset.fbwEditing = '1';
  // 持久标记：用户主动进过文字编辑模式。getChanges 只查带这个标记的元素，
  // 避免页面上 JS 自动更新的元素（时钟、计数、轮播文字...）被误报成 edit。
  el.dataset.fbwEdited = '1';
  el.focus();
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (err) {}
}

let _scrollRaf = null;
export function followToolbar() {
  if (!state.selectedEl) return;
  if (_scrollRaf) cancelAnimationFrame(_scrollRaf);
  _scrollRaf = requestAnimationFrame(() => {
    positionToolbar(state.selectedEl);
    positionResizeHandles(state.selectedEl);
    if (state.fontPicker.classList.contains('fbw-fp-open')) positionFontPicker();
  });
}

function handleEditableChange(e) {
  const id = e.target.dataset?.fbwEditId;
  if (!id) return;
  e.target.classList.toggle('fbw-changed', state.originals.get(id) !== getText(e.target));
  updateCounter(getChanges);
  scheduleSave();
}

function applyEditState() {
  document.body.classList.toggle('fbw-edit-mode', state.editMode);
  document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
    el.contentEditable = 'false';
    el.spellcheck = false;
  });
  if (!state.editMode) deselectElement();
  if (state.editToggleBtn) state.editToggleBtn.classList.toggle('fbw-active', state.editMode);
  if (state.editFab) state.editFab.classList.toggle('fbw-active', state.editMode);
  // 框选互斥：进编辑就关掉框选 FAB 的高亮
  if (state.editMode && state.marqueeMode) {
    state.marqueeMode = false;
    document.body.classList.remove('fbw-marquee-mode');
    if (state.marqueeFab) state.marqueeFab.classList.remove('fbw-active');
    if (state.marqueeToggleBtn) state.marqueeToggleBtn.classList.remove('fbw-active');
  }
}

export function toggleEdit() {
  // 进入编辑模式：互斥地关掉框选，再进
  if (!state.editMode) {
    if (state.marqueeMode) exitMarqueeMode();
    state.editMode = true;
    applyEditState();
    showToast(t('edit.on'));
    return;
  }

  // 退出编辑模式：静默退出，改动暂存在 localStorage 里。
  const pending = pendingEditCount(getChanges);
  state.editMode = false;
  applyEditState();
  showToast(pending > 0 ? t('edit.off.pending', { count: pending }) : t('edit.off'));
}

// 装载所有元素级交互的事件监听
export function attachSelectionEvents() {
  // SLIDE_GUARD 比 SECTION_SELECTORS 更宽松：footer / 任意 header 也允许选中
  // 用 [data-fbw-sec-id] 作为 slide guard：能匹配任何被 registerEditableElements 注册过的 section
  // （包括降级模式下的 body），不再硬编码 section 选择器列表
  const SLIDE_GUARD = '[data-fbw-sec-id]';
  const UI_GUARD = '.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-marker-popover, .fbw-font-picker, .fbw-note-popover, .fbw-help-popover, .fbw-tooltip, .fbw-anno, script, style';

  document.addEventListener('click', (e) => {
    if (!state.editMode) return;
    let target = e.target;
    if (!target || target.closest(UI_GUARD)) return;

    // 编辑模式下任何 a[href] 都先 preventDefault 阻止跳转——不管它在不在 SLIDE_GUARD 里。
    // 这样即使页面布局怪异（比如 a 在 SLIDE_GUARD 之外），点了也不会被浏览器带走。
    if (target.closest && target.closest('a[href]')) {
      e.preventDefault();
    }

    // 点在 slide / 内容区域之外 → 取消选中
    const slide = target.closest(SLIDE_GUARD);
    if (!slide) {
      if (state.selectedEl) deselectElement();
      return;
    }
    // 点在 slide 根节点本身（空白背景区，不是任何子元素）→ 也取消选中
    if (target === slide) {
      if (state.selectedEl) deselectElement();
      return;
    }

    target = liftTarget(target);
    if (target.isContentEditable && target === state.selectedEl) return;
    e.preventDefault(); e.stopPropagation();
    selectElement(target);
  }, true);

  document.addEventListener('dblclick', (e) => {
    if (!state.editMode) return;
    let target = e.target;
    if (!target || target.closest(UI_GUARD)) return;
    if (!target.closest(SLIDE_GUARD)) return;
    target = liftTarget(target);
    const tag = target.tagName.toLowerCase();
    if (tag === 'svg' || tag === 'img') return;
    // 评审模式：双击不进入文字编辑（线上改字没意义且会误导）。改成选中后让用户用 note/highlight。
    if (state.appMode === 'review') {
      e.preventDefault(); e.stopPropagation();
      selectElement(target);
      return;
    }
    e.preventDefault(); e.stopPropagation();
    enterTextEdit(target);
  }, true);

  document.addEventListener('blur', (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.fbwEditing === '1') {
      t.contentEditable = 'false';
      delete t.dataset.fbwEditing;
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.selectedEl) { e.preventDefault(); deselectElement(); }
      const t = document.activeElement;
      if (t && t.dataset && t.dataset.fbwEditing === '1') {
        t.contentEditable = 'false';
        delete t.dataset.fbwEditing;
        t.blur();
      }
    }
  });

  ['input', 'compositionend', 'paste', 'cut', 'drop'].forEach(ev => {
    document.addEventListener(ev, handleEditableChange, true);
  });
  document.addEventListener('blur', (e) => {
    if (e.target.dataset?.fbwEditId) handleEditableChange(e);
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.target.dataset?.fbwEditId || e.target.closest('.fbw-panel, .fbw-confirm')) {
      e.stopPropagation();
    }
  }, true);

  onScroll(followToolbar);
  onResize(followToolbar);
  document.addEventListener('slidechange', () => deselectElement());
}
