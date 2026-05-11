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
import { closeTagPopover } from './tag-switch.js';
import { getElementNote } from '../core/elements.js';
import { showToast, updateCounter, pendingEditCount } from '../utils.js';
import { t } from '../i18n.js';

// 面包屑：选中元素时在工具栏左侧显示「区域 · 标签 (位置)」，帮用户判断自己在改哪一段。
// 区域优先级：data-screen-label > aria-label > section/article 里第一个 heading 文字 > id > tag。
function sectionLabel(sec) {
  if (!sec) return '';
  const screen = sec.getAttribute('data-screen-label') || sec.getAttribute('aria-label');
  if (screen) return screen.trim();
  const heading = sec.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent) {
    const txt = heading.textContent.trim().replace(/\s+/g, ' ');
    if (txt) return txt.length > 18 ? txt.slice(0, 18) + '…' : txt;
  }
  if (sec.id) return '#' + sec.id;
  const cls = (sec.className || '').toString().split(/\s+/).find(c => c && !c.startsWith('fbw-'));
  if (cls) return '.' + cls;
  return sec.tagName.toLowerCase();
}

function describePath(el) {
  if (!el) return '';
  const tag = el.tagName.toLowerCase();
  // 区域：找最近的 section / article / [data-fbw-sec-id]，但跳过元素自己（避免 section 选中时显示自己）
  let sec = el.parentElement ? el.parentElement.closest('section, article, [data-fbw-sec-id]') : null;
  if (!sec && el.matches('section, article, [data-fbw-sec-id]')) sec = el;
  const secStr = sec && sec !== el ? sectionLabel(sec) : '';
  // 同标签兄弟里第几个（>1 才显示，单独一个就不啰嗦）
  const parent = el.parentElement;
  let nthStr = '';
  if (parent) {
    const sibs = [...parent.children].filter(c => c.tagName === el.tagName);
    if (sibs.length > 1) nthStr = ` (${sibs.indexOf(el) + 1}/${sibs.length})`;
  }
  return [secStr, tag + nthStr].filter(Boolean).join(' · ');
}

function updateBreadcrumb(el) {
  if (!state.elemToolbar) return;
  const label = state.elemToolbar.querySelector('[data-fbw-path]');
  const divider = state.elemToolbar.querySelector('[data-fbw-path-divider]');
  if (!label || !divider) return;
  const text = describePath(el);
  if (text) {
    label.textContent = text;
    label.title = text;
    label.style.display = '';
    divider.style.display = '';
  } else {
    label.style.display = 'none';
    divider.style.display = 'none';
  }
}

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

  // 标签切换按钮：仅对 p / h1-h6 显示
  const isHeadable = /^(p|h[1-6])$/i.test(el.tagName);
  const tagBtn = state.elemToolbar.querySelector('[data-op="tag"]');
  if (tagBtn) tagBtn.style.display = isHeadable ? 'inline-flex' : 'none';

  // 第一个 divider：font/tag/highlight/replace-img 都隐藏才同时隐藏
  // querySelectorAll 返回所有 divider，取第一个（标签 divider 之后）
  const dividers = state.elemToolbar.querySelectorAll('.fbw-tb-divider:not([data-fbw-path-divider])');
  if (dividers[0]) dividers[0].style.display = (isImg || isTextish || isHeadable) ? '' : 'none';

  // 改链接按钮：仅对 a[href] 元素显示
  const isLink = el.matches('a[href]');
  const linkBtn = state.elemToolbar.querySelector('[data-op="link"]');
  if (linkBtn) linkBtn.style.display = isLink ? 'inline-flex' : 'none';

  // 反馈按钮：如果有 note 显示绿点
  const noteBtn = state.elemToolbar.querySelector('[data-op="note"]');
  if (noteBtn) noteBtn.classList.toggle('fbw-has-note', !!getElementNote(el));

  updateBreadcrumb(el);
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
  closeTagPopover();
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
  const UI_GUARD = '.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-marker-popover, .fbw-tag-popover, .fbw-font-picker, .fbw-note-popover, .fbw-help-popover, .fbw-tooltip, .fbw-anno, script, style';

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
