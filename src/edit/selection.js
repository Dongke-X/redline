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
import { closeStylePanel } from './style-panel.js';
import { isCompareBefore } from './compare.js';
import { pushUndo } from '../core/undo.js';
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

// 工具栏右上角的「N selected」徽章 —— 多选时显示，单选时藏
function syncMultiBadge() {
  if (!state.elemToolbar) return;
  let badge = state.elemToolbar.querySelector('.fbw-tb-count');
  const size = state.selectedEls.size;
  if (size <= 1) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'fbw-tb-count';
    state.elemToolbar.appendChild(badge);
  }
  badge.textContent = size;
  badge.title = `${size} selected`;
}

// 工具栏按钮可见性：多选时隐藏「单元素才有意义」的操作（link / replace-img / note / tag）
function syncToolbarVisibility(anchorEl) {
  if (!state.elemToolbar || !anchorEl) return;
  const multi = state.selectedEls.size > 1;

  const isImg = anchorEl.matches('img') || (getComputedStyle(anchorEl).backgroundImage || 'none') !== 'none';
  state.elemToolbar.querySelector('[data-op="replace-img"]').style.display = (!multi && isImg) ? 'inline-flex' : 'none';

  const isTextish = hasOwnText(anchorEl) && !anchorEl.matches('img, svg, video, iframe');
  const fontBtn = state.elemToolbar.querySelector('[data-op="font"]');
  if (fontBtn) fontBtn.style.display = isTextish ? 'inline-flex' : 'none'; // font 支持多选
  const hlBtn = state.elemToolbar.querySelector('[data-op="highlight"]');
  if (hlBtn) hlBtn.style.display = isTextish ? 'inline-flex' : 'none';     // highlight 支持多选

  const isHeadable = /^(p|h[1-6])$/i.test(anchorEl.tagName);
  const tagBtn = state.elemToolbar.querySelector('[data-op="tag"]');
  if (tagBtn) tagBtn.style.display = (!multi && isHeadable) ? 'inline-flex' : 'none'; // tag 单选

  const isLink = anchorEl.matches('a[href]');
  const linkBtn = state.elemToolbar.querySelector('[data-op="link"]');
  if (linkBtn) linkBtn.style.display = (!multi && isLink) ? 'inline-flex' : 'none'; // link 单选

  const noteBtn = state.elemToolbar.querySelector('[data-op="note"]');
  if (noteBtn) {
    noteBtn.style.display = multi ? 'none' : 'inline-flex';                // note 单选
    noteBtn.classList.toggle('fbw-has-note', !!getElementNote(anchorEl));
  }
}

// 单选模型保留：selectElement 清空旧选区，只选一个
export function selectElement(el) {
  if (state.selectedEls.size === 1 && state.selectedEl === el) return;
  deselectElement();
  state.selectedEl = el;
  state.selectedEls.add(el);
  el.classList.add('fbw-selected');

  syncToolbarVisibility(el);
  syncMultiBadge();
  updateBreadcrumb(el);
  state.elemToolbar.classList.add('fbw-toolbar-open');
  positionToolbar(el);
  showResizeHandles(el);
}

// 多选：Shift+click 切换某个元素的选中态。anchor 始终是「最近一次操作」的元素
export function toggleSelection(el) {
  if (state.selectedEls.has(el)) {
    state.selectedEls.delete(el);
    el.classList.remove('fbw-selected');
    if (state.selectedEl === el) {
      // anchor 从集合里随便挑一个；空了就 deselect
      const next = state.selectedEls.values().next().value;
      if (next) {
        state.selectedEl = next;
      } else {
        deselectElement();
        return;
      }
    }
  } else {
    state.selectedEls.add(el);
    el.classList.add('fbw-selected');
    state.selectedEl = el; // 最近 Shift 点的当 anchor
  }
  syncToolbarVisibility(state.selectedEl);
  syncMultiBadge();
  updateBreadcrumb(state.selectedEl);
  state.elemToolbar.classList.add('fbw-toolbar-open');
  positionToolbar(state.selectedEl);
  showResizeHandles(state.selectedEl);
}

export function deselectElement() {
  state.selectedEls.forEach(el => el.classList.remove('fbw-selected'));
  state.selectedEls.clear();
  state.selectedEl = null;
  if (typeof window !== 'undefined') window.__fbwSelEl = null;
  closeFontPicker();
  closeNotePopover();
  closeMarkerPopover();
  closeTagPopover();
  closeStylePanel();
  state.elemToolbar.classList.remove('fbw-toolbar-open');
  syncMultiBadge();
  hideResizeHandles();
}

// gang-op 辅助：返回当前选区数组，过滤掉已离开 DOM 的
export function getSelectedEls() {
  return [...state.selectedEls].filter(el => document.contains(el));
}

export function enterTextEdit(el) {
  // 进编辑前先 snapshot，撤销时能回到这次编辑之前的文字状态。
  // contentEditable 内的逐字击键由浏览器原生 undo 处理；这一笔抓的是「整次编辑」的起点
  pushUndo(el);
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
    if (isCompareBefore()) return; // 改前模式下禁止选中编辑
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
    // Shift / Cmd / Ctrl + click → 切换多选；普通 click → 单选
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleSelection(target);
    } else {
      selectElement(target);
    }
  }, true);

  document.addEventListener('dblclick', (e) => {
    if (!state.editMode) return;
    if (isCompareBefore()) return;
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
