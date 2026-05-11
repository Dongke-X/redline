// 主初始化函数。负责创建 DOM、注册可编辑元素、装载所有事件监听。
import { state } from './core/state.js';
import { DBG, SECTION_SELECTORS } from './config.js';
import { CSS } from './assets/styles.js';
import { ICON_PENCIL, ICON_CHAT, ICON_SHARE, ICON_MARQUEE, ICON_KEYBOARD, ICON_FOLD, ICON_EYEDROPPER, ICON_UNDO, ICON_REDO } from './assets/icons.js';
import { t } from './i18n.js';
import { toggleMarqueeMode } from './edit/marquee.js';
import { attachTooltipDelegation } from './tooltip.js';
import { toggleHelpPopover, attachHelpEvents } from './feedback/help.js';
import { panelHTML, confirmHTML, toolbarHTML, notePopoverHTML } from './assets/templates.js';
import { registerEditableElements, getChanges } from './core/elements.js';
import { loadState } from './core/persist.js';
import { attachSelectionEvents, toggleEdit, deselectElement } from './edit/selection.js';
import { attachToolbarEvents, attachDragEvents, attachNotePopoverEvents } from './edit/toolbar.js';
import { attachFontPickerEvents } from './edit/fonts.js';
import { attachMarkerEvents } from './edit/marker.js';
import { createResizeHandlesNode, attachResizeEvents } from './edit/resize.js';
import { createTagPopoverNode, attachTagPopoverEvents } from './edit/tag-switch.js';
import { undo, redo, canUndo, canRedo } from './core/undo.js';
import { copySelectedDescriptor } from './edit/clipboard.js';
import { toggleAudit, refreshAuditIfOn } from './edit/audit.js';
import { showMeasurement, hideMeasurement } from './edit/measure.js';
import { pickColor } from './edit/eyedropper.js';
import { attachMarqueeEvents, rerenderAllAnnotations } from './edit/marquee.js';
import { attachPanelEvents, toggleFbPanel } from './feedback/panel.js';
import { attachSlideTracking } from './feedback/slides.js';
import { attachAttachmentEvents, renderAttachments, rehydrateAttachments } from './feedback/attachments.js';
import { attachSaveButton } from './feedback/save.js';
import { exportPDF } from './export/pdf.js';
import { injectIntoOverlay } from './integrations/inject.js';
import { updateCounter } from './utils.js';

function injectStyles() {
  const styleEl = document.createElement('style');
  styleEl.id = 'fbw-styles';
  styleEl.dataset.fbwInternal = '1';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
}

function createDom() {
  const panel = document.createElement('div');
  panel.className = 'fbw-panel';
  panel.id = 'fbwPanel';
  panel.innerHTML = panelHTML();
  state.panel = panel;

  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'fbw-confirm';
  confirmDialog.innerHTML = confirmHTML();
  state.confirmDialog = confirmDialog;

  const editFab = document.createElement('button');
  editFab.className = 'fbw-fab fbw-edit-fab';
  editFab.innerHTML = ICON_PENCIL;
  editFab.dataset.tooltip = t('overlay.edit');
  editFab.setAttribute('aria-label', t('overlay.edit'));
  state.editFab = editFab;

  const fbFab = document.createElement('button');
  fbFab.className = 'fbw-fab fbw-fb-fab';
  fbFab.innerHTML = ICON_CHAT;
  fbFab.dataset.tooltip = t('overlay.feedback');
  fbFab.setAttribute('aria-label', t('overlay.feedback'));
  state.fbFab = fbFab;

  const marqueeFab = document.createElement('button');
  marqueeFab.className = 'fbw-fab fbw-marquee-fab';
  marqueeFab.innerHTML = ICON_MARQUEE;
  marqueeFab.dataset.tooltip = t('overlay.marquee');
  marqueeFab.setAttribute('aria-label', t('overlay.marquee'));
  state.marqueeFab = marqueeFab;

  const pickFab = document.createElement('button');
  pickFab.className = 'fbw-fab fbw-pick-fab';
  pickFab.innerHTML = ICON_EYEDROPPER;
  pickFab.dataset.tooltip = t('overlay.pick');
  pickFab.setAttribute('aria-label', t('overlay.pick'));
  state.pickFab = pickFab;

  const undoFab = document.createElement('button');
  undoFab.className = 'fbw-fab fbw-undo-fab';
  undoFab.innerHTML = ICON_UNDO;
  undoFab.dataset.tooltip = t('overlay.undo');
  undoFab.setAttribute('aria-label', t('overlay.undo'));
  undoFab.style.display = 'none';
  state.undoFab = undoFab;

  const redoFab = document.createElement('button');
  redoFab.className = 'fbw-fab fbw-redo-fab';
  redoFab.innerHTML = ICON_REDO;
  redoFab.dataset.tooltip = t('overlay.redo');
  redoFab.setAttribute('aria-label', t('overlay.redo'));
  redoFab.style.display = 'none';
  state.redoFab = redoFab;

  const exportFab = document.createElement('button');
  exportFab.className = 'fbw-fab fbw-export-fab';
  exportFab.innerHTML = ICON_SHARE;
  exportFab.dataset.tooltip = t('overlay.export');
  exportFab.setAttribute('aria-label', t('overlay.export'));
  state.exportFab = exportFab;

  const helpFab = document.createElement('button');
  helpFab.className = 'fbw-fab fbw-help-fab';
  helpFab.innerHTML = ICON_KEYBOARD;
  helpFab.dataset.tooltip = t('overlay.help');
  helpFab.setAttribute('aria-label', t('overlay.help'));
  state.helpFab = helpFab;

  const foldFab = document.createElement('button');
  foldFab.className = 'fbw-fab fbw-fold-fab';
  foldFab.innerHTML = ICON_FOLD;
  foldFab.dataset.tooltip = t('overlay.fold');
  foldFab.setAttribute('aria-label', t('overlay.fold'));
  state.foldFab = foldFab;

  const helpPopover = document.createElement('div');
  helpPopover.className = 'fbw-help-popover';
  state.helpPopover = helpPopover;

  const elemToolbar = document.createElement('div');
  elemToolbar.className = 'fbw-elem-toolbar';
  elemToolbar.innerHTML = toolbarHTML();
  state.elemToolbar = elemToolbar;

  const fontPicker = document.createElement('div');
  fontPicker.className = 'fbw-font-picker';
  state.fontPicker = fontPicker;

  const notePopover = document.createElement('div');
  notePopover.className = 'fbw-note-popover';
  notePopover.innerHTML = notePopoverHTML();
  state.notePopover = notePopover;

  const markerPopover = document.createElement('div');
  markerPopover.className = 'fbw-marker-popover';
  state.markerPopover = markerPopover;

  state.resizeHandles = createResizeHandlesNode();

  const tagPopover = createTagPopoverNode();
  state.tagPopover = tagPopover;

  // FAB 工具条：6 个按钮在浮动 pill 里
  // 顺序：编辑 → 反馈 → 框选 → 导出 ｜ 帮助 ｜ 折叠
  const fabBar = document.createElement('div');
  fabBar.className = 'fbw-fab-bar';
  fabBar.appendChild(editFab);
  fabBar.appendChild(fbFab);
  fabBar.appendChild(marqueeFab);
  fabBar.appendChild(pickFab);
  fabBar.appendChild(exportFab);
  // undo / redo 默认隐藏；栈非空才显示，避免空状态占视觉
  fabBar.appendChild(undoFab);
  fabBar.appendChild(redoFab);
  const fabDivider = document.createElement('span');
  fabDivider.className = 'fbw-fab-divider';
  fabBar.appendChild(fabDivider);
  fabBar.appendChild(helpFab);
  const fabDivider2 = document.createElement('span');
  fabDivider2.className = 'fbw-fab-divider fbw-fab-divider-2';
  fabBar.appendChild(fabDivider2);
  fabBar.appendChild(foldFab);
  state.fabBar = fabBar;

  document.body.appendChild(panel);
  document.body.appendChild(confirmDialog);
  document.body.appendChild(fabBar);
  document.body.appendChild(helpPopover);
  document.body.appendChild(elemToolbar);
  document.body.appendChild(fontPicker);
  document.body.appendChild(notePopover);
  document.body.appendChild(markerPopover);
  document.body.appendChild(tagPopover);
  document.body.appendChild(state.resizeHandles);
}

function attachKeyboardShortcuts() {
  let spaceHeld = false;

  const inGuardedContext = (e) =>
    e.target.dataset?.fbwEditId ||
    (e.target.matches && e.target.matches('textarea, input')) ||
    (e.target.closest && e.target.closest('.fbw-panel, .fbw-confirm'));

  document.addEventListener('keydown', (e) => {
    if (inGuardedContext(e)) return;

    // 跟踪空格键状态（不阻止浏览器默认滚动）
    if (e.key === ' ') {
      spaceHeld = true;
      return;
    }

    // Space + P = 矢量 PDF
    if (spaceHeld && (e.key === 'p' || e.key === 'P') && !e.shiftKey) {
      e.preventDefault();
      exportPDF({ image: false }, deselectElement);
      return;
    }

    // Shift + P = 长图 PDF（不需要 Space）
    if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      exportPDF({ image: true }, deselectElement);
      return;
    }

    // ⌘+S / Ctrl+S：保存反馈
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      state.panel?.querySelector('[data-fbw-action="save"]')?.click();
      return;
    }

    // ⌘+Z / Ctrl+Z：撤销最近一次 op
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      undo();
      return;
    }
    // ⌘+Shift+Z / Ctrl+Shift+Z / Ctrl+Y：重做
    if (((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
        || ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'y' || e.key === 'Y'))) {
      e.preventDefault();
      redo();
      return;
    }

    // ⌘+C / Ctrl+C：选中元素时复制描述符（无文字选区才生效，否则让浏览器原生复制）
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      const sel = window.getSelection?.()?.toString();
      if (sel) return;
      if (!state.selectedEl) return;
      e.preventDefault();
      copySelectedDescriptor();
      return;
    }

    // ⌘+M / Ctrl+M：复制反馈 markdown 到剪贴板（用 M 不用 C，避免抢系统 ⌘+C）
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      state.panel?.querySelector('[data-fbw-action="copy"]')?.click();
      return;
    }

    // 单键快捷键：忽略带修饰键的
    if (e.ctrlKey || e.metaKey || e.altKey || spaceHeld) return;

    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); toggleEdit(); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFbPanel(); }
    else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMarqueeMode(); }
    else if (e.key === 'a' || e.key === 'A') { e.preventDefault(); toggleAudit(); }
    else if (e.key === '?') { e.preventDefault(); toggleHelpPopover(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedEl && state.editMode) {
      e.preventDefault();
      state.elemToolbar?.querySelector('[data-op="delete"]')?.click();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ') spaceHeld = false;
    if (e.key === 'Alt') {
      document.body.classList.remove('fbw-measuring');
      hideMeasurement();
    }
  });
  window.addEventListener('blur', () => {
    spaceHeld = false;
    document.body.classList.remove('fbw-measuring');
    hideMeasurement();
  });

  // 间距测量：选中元素 + 按住 Alt + hover 目标 → 显示 4 边距离（Figma 风格）
  document.addEventListener('mousemove', (e) => {
    if (!e.altKey || !state.selectedEl) {
      if (document.body.classList.contains('fbw-measuring')) {
        document.body.classList.remove('fbw-measuring');
        hideMeasurement();
      }
      return;
    }
    document.body.classList.add('fbw-measuring');
    let target = e.target;
    if (!target || target.closest('.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-tooltip, .fbw-anno, .fbw-resize-handles, .fbw-measure-overlay, .fbw-help-popover, .fbw-note-popover, .fbw-marker-popover, .fbw-font-picker, .fbw-tag-popover')) {
      hideMeasurement();
      return;
    }
    if (target === state.selectedEl || state.selectedEl.contains(target)) {
      hideMeasurement();
      return;
    }
    showMeasurement(target);
  }, true);
}

// 撤销 / 重做 FAB 可见性：跟着栈非空状态走。挂到 onChangeHook 上每次 op 后刷新
function refreshUndoFabs() {
  if (state.undoFab) state.undoFab.style.display = canUndo() ? 'inline-flex' : 'none';
  if (state.redoFab) state.redoFab.style.display = canRedo() ? 'inline-flex' : 'none';
}

function attachFabClicks() {
  // 编辑 FAB：折叠态时先展开 + 进编辑；展开态走原 toggleEdit 逻辑
  state.editFab.addEventListener('click', () => {
    if (document.body.classList.contains('fbw-fab-collapsed')) {
      setFabCollapsed(false);
      if (!state.editMode) toggleEdit();
      return;
    }
    toggleEdit();
  });
  state.exportFab.addEventListener('click', (e) => exportPDF({ image: e.shiftKey }, deselectElement));
  state.marqueeFab.addEventListener('click', toggleMarqueeMode);
  state.pickFab.addEventListener('click', (e) => { e.stopPropagation(); pickColor(); });
  state.undoFab.addEventListener('click', (e) => { e.stopPropagation(); undo(); refreshUndoFabs(); });
  state.redoFab.addEventListener('click', (e) => { e.stopPropagation(); redo(); refreshUndoFabs(); });
  state.helpFab.addEventListener('click', (e) => { e.stopPropagation(); toggleHelpPopover(); });
  state.foldFab.addEventListener('click', (e) => { e.stopPropagation(); setFabCollapsed(true); });
  // fbFab click 由 panel.js 装载
}

// 按 pathname 隔离折叠状态，避免不同页面相互影响
const FOLD_KEY = 'fbw-fab-collapsed::' + (location.pathname || '/').slice(0, 200);

function setFabCollapsed(collapsed) {
  document.body.classList.toggle('fbw-fab-collapsed', collapsed);
  try {
    if (collapsed) localStorage.setItem(FOLD_KEY, '1');
    else localStorage.removeItem(FOLD_KEY);
  } catch (_) {}
}

function restoreFabCollapsed() {
  try {
    if (localStorage.getItem(FOLD_KEY) === '1') {
      document.body.classList.add('fbw-fab-collapsed');
    }
  } catch (_) {}
}

import { onScroll, onResize } from './utils/events.js';

// 滚动 / 鼠标接近 FAB 区时控制可见度
function attachFabVisibility() {
  let scrollTimer = null;
  onScroll(() => {
    document.body.classList.add('fbw-scrolling');
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.body.classList.remove('fbw-scrolling');
    }, 800);
  });

  // 鼠标进入右下 220×260 区域 → 完整显示
  // rAF 节流：mousemove 60fps 触发会浪费，每帧最多检查一次足够
  const ZONE_W = 220, ZONE_H = 260;
  let pendingMoveX = -1, pendingMoveY = -1, rafId = 0;
  window.addEventListener('mousemove', (e) => {
    pendingMoveX = e.clientX; pendingMoveY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const inZone = (window.innerWidth - pendingMoveX) < ZONE_W
                   && (window.innerHeight - pendingMoveY) < ZONE_H;
      document.body.classList.toggle('fbw-mouse-near-fab', inZone);
    });
  }, { passive: true });
}

// 检测 FAB 下方背景色，深色背景时给 body 加 .fbw-dark-bg
// 优化：用 elementFromPoint 单次取顶层元素（替代 elementsFromPoint 整个 z 序列遍历），
// 加结果缓存（同样 luma 不重复 toggle class），加防抖到 250ms（之前 150ms 过密）。
let __lastDarkBg = null;
function detectBgUnderFab() {
  if (!state.fabBar) return;
  const r = state.fabBar.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  // 临时把 fabBar pointer-events 关掉，让 elementFromPoint 穿透到下层
  const orig = state.fabBar.style.pointerEvents;
  state.fabBar.style.pointerEvents = 'none';
  let target = document.elementFromPoint(x, y) || document.body;
  state.fabBar.style.pointerEvents = orig;
  // 仍可能命中 widget 自身浮层（panel/tooltip/popover）→ 退到 body
  if (target.closest && target.closest('.fbw-panel, .fbw-tooltip, .fbw-toast, .fbw-confirm, .fbw-elem-toolbar, .fbw-resize-handles, .fbw-note-popover, .fbw-font-picker, .fbw-marker-popover, .fbw-help-popover, .fbw-anno')) {
    target = document.body;
  }

  let bg = null;
  let cur = target;
  while (cur && cur !== document.documentElement) {
    const c = window.getComputedStyle(cur).backgroundColor;
    const m = c && c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
      if (alpha > 0.5) { bg = { r: +m[1], g: +m[2], b: +m[3] }; break; }
    }
    cur = cur.parentElement;
  }
  if (!bg) {
    const html = window.getComputedStyle(document.documentElement).backgroundColor;
    const m = html.match(/\d+/g);
    bg = m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 255, g: 255, b: 255 };
  }
  const luma = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
  const isDark = luma < 140;
  if (__lastDarkBg !== isDark) {
    __lastDarkBg = isDark;
    document.body.classList.toggle('fbw-dark-bg', isDark);
  }
}

function attachFabBgDetection() {
  let bgTimer = null;
  const schedule = () => {
    if (bgTimer) clearTimeout(bgTimer);
    bgTimer = setTimeout(detectBgUnderFab, 250);
  };
  setTimeout(detectBgUnderFab, 80);
  onScroll(schedule);
  onResize(schedule);
}

// 应用模式探测：deck（有 <deck-stage>）/ doc（结构化 HTML 匹配 SECTION_SELECTORS）/ review（任意网页）
function detectAppMode() {
  if (document.querySelector('deck-stage')) return 'deck';
  if (document.querySelectorAll(SECTION_SELECTORS).length > 0) return 'doc';
  return 'review';
}

// 把 chip 文字按 locale 写进去（之前用 CSS ::before 硬编码中文，EN 状态下出问题）
function syncModeChip() {
  const chip = state.panel?.querySelector('.fbw-mode-chip');
  if (!chip) return;
  chip.textContent = t('mode.chip.' + (state.appMode || 'doc'));
}

// SPA 路由切换 / DOM 大改动后重新评估 appMode + 切换 body class。
// 注意：不重跑 registerEditableElements（避免重复注册），仅修正 mode 标签和 UI 行为分支。
function watchAppModeChanges() {
  const reapply = () => {
    const newMode = detectAppMode();
    if (newMode === state.appMode) return;
    document.body.classList.remove('fbw-mode-' + state.appMode);
    document.body.classList.add('fbw-mode-' + newMode);
    DBG('appMode changed:', state.appMode, '→', newMode);
    state.appMode = newMode;
    syncModeChip();
  };
  window.addEventListener('popstate', reapply);
  ['pushState', 'replaceState'].forEach(name => {
    const orig = history[name];
    if (orig.__fbwPatched) return; // 避免重复 patch（slides.js 也 patch 了）
    history[name] = function (...args) {
      const r = orig.apply(this, args);
      setTimeout(reapply, 0);
      return r;
    };
    history[name].__fbwPatched = true;
  });
}

export function init() {
  DBG('init start');
  injectStyles();
  createDom();

  // 探测应用模式 + 给 body 加类，CSS 按模式区分 UI
  state.appMode = detectAppMode();
  document.body.classList.add('fbw-mode-' + state.appMode);
  DBG('appMode:', state.appMode);
  syncModeChip();
  watchAppModeChanges();

  const sections = registerEditableElements();

  attachSelectionEvents();
  attachToolbarEvents();
  attachDragEvents();
  attachResizeEvents();
  attachMarqueeEvents();
  attachFontPickerEvents();
  attachMarkerEvents();
  attachTagPopoverEvents();
  attachNotePopoverEvents();
  attachPanelEvents();
  attachSaveButton();
  attachSlideTracking(sections);
  attachAttachmentEvents();
  attachKeyboardShortcuts();
  state.onChangeHook = () => { refreshAuditIfOn(); refreshUndoFabs(); };
  attachFabClicks();
  attachFabVisibility();
  attachFabBgDetection();
  attachTooltipDelegation();
  attachHelpEvents();
  restoreFabCollapsed();

  if (document.querySelector('deck-stage')) {
    injectIntoOverlay();
  } else {
    document.body.classList.add('fbw-no-overlay');
  }

  loadState();
  renderAttachments();
  rerenderAllAnnotations();
  updateCounter(getChanges);
  // 异步把 attachments blob 从 IDB 拉回内存（dataURL 由 IDB 重建，不阻塞 init）
  rehydrateAttachments().catch(e => DBG('rehydrate failed:', e));
  DBG('init done');
}
