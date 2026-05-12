// 元素工具栏 click 处理 + 拖拽逻辑。
import { state } from '../core/state.js';
import { onMousemove, onMouseup } from '../utils/events.js';
import {
  recordOp, clearOpsOn, getElTransform, setElTransform,
  recordNote, getElementNote,
} from '../core/elements.js';
import { deselectElement, positionToolbar, followToolbar, liftTarget, getSelectedEls } from './selection.js';
import { openFontPicker, closeFontPicker } from './fonts.js';
import { openMarkerPopover, closeMarkerPopover } from './marker.js';
import { openTagPopover, closeTagPopover } from './tag-switch.js';
import { pushUndo, pushUndoGroup } from '../core/undo.js';
import { showUndoToast } from '../utils/undo-toast.js';
import { attachTagBarEvents, paintTagBar } from './design-tags.js';
import { pickColor } from './eyedropper.js';
import { renderAttachments } from '../feedback/attachments.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

function refreshNoteButtonIndicator(el) {
  const btn = state.elemToolbar?.querySelector('[data-op="note"]');
  if (!btn) return;
  btn.classList.toggle('fbw-has-note', !!getElementNote(el));
}

function positionNotePopover() {
  if (!state.notePopover) return;
  const btn = state.elemToolbar.querySelector('[data-op="note"]');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const popover = state.notePopover;
  let top = r.bottom + 6;
  let left = r.left;
  if (left + 300 > window.innerWidth - 8) left = window.innerWidth - 308;
  if (left < 8) left = 8;
  if (top + 180 > window.innerHeight - 8) top = Math.max(8, r.top - 186);
  popover.style.top = top + 'px';
  popover.style.left = left + 'px';
}

export function openNotePopover(el) {
  const popover = state.notePopover;
  if (!popover) return;
  const ta = popover.querySelector('[data-fbw-note-text]');
  ta.value = getElementNote(el);
  popover.classList.add('fbw-on');
  positionNotePopover();
  paintTagBar(popover.querySelector('[data-fbw-tags]'), ta);
  setTimeout(() => ta.focus(), 0);
}

export function closeNotePopover() {
  if (state.notePopover) state.notePopover.classList.remove('fbw-on');
}

export function attachNotePopoverEvents() {
  const popover = state.notePopover;
  if (!popover) return;
  const ta = popover.querySelector('[data-fbw-note-text]');

  // 阻止键盘事件冒泡到全局快捷键 / 编辑模式监听
  ['keydown', 'keyup', 'keypress'].forEach(ev =>
    ta.addEventListener(ev, e => e.stopPropagation()));

  ta.addEventListener('input', () => {
    if (!state.selectedEl) return;
    recordNote(state.selectedEl, ta.value);
    refreshNoteButtonIndicator(state.selectedEl);
    paintTagBar(popover.querySelector('[data-fbw-tags]'), ta);
  });

  // design 分类 chip 行：点一下在反馈文本前 toggle [标签]
  attachTagBarEvents(popover.querySelector('[data-fbw-tags]'), () => ta);

  popover.querySelector('[data-fbw-note-close]').addEventListener('click', (e) => {
    e.stopPropagation();
    closeNotePopover();
  });

  // 点 popover 外面关闭
  document.addEventListener('mousedown', (e) => {
    if (!popover.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-note-popover, .fbw-elem-toolbar')) return;
    closeNotePopover();
  }, true);
}

export function attachToolbarEvents() {
  state.elemToolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-op]');
    if (!btn || !state.selectedEl) return;
    e.stopPropagation();
    const op = btn.dataset.op;
    const el = state.selectedEl;

    if (op === 'close') { deselectElement(); return; }
    if (op === 'delete') {
      const els = getSelectedEls();
      pushUndoGroup(els);
      els.forEach(x => { recordOp(x, 'delete'); x.dataset.fbwOpDeleted = '1'; });
      showUndoToast(els.length > 1 ? `${t('op.delete')} · ${els.length}` : t('op.delete'));
      return;
    }
    if (op === 'hide') {
      const els = getSelectedEls();
      pushUndoGroup(els);
      els.forEach(x => { recordOp(x, 'hide'); x.dataset.fbwOpHidden = '1'; });
      showUndoToast(els.length > 1 ? `${t('op.hide')} · ${els.length}` : t('op.hide'));
      return;
    }
    if (op === 'link') {
      // a[href] 才能改链接。selection.js 已经按元素类型显隐，这里再兜底防御。
      if (el.tagName !== 'A') return;
      const before = el.getAttribute('href') || '';
      // MVP：用 prompt 输入。复杂 popover 后续再做。
      const after = prompt(t('op.link.prompt') || '改链接 (href)：', before);
      if (after == null) return;          // 用户取消
      const trimmed = after.trim();
      if (trimmed === before) return;     // 没变
      pushUndo(el);
      el.setAttribute('href', trimmed);
      recordOp(el, 'href', { before, after: trimmed });
      showUndoToast(t('op.link.done') || `链接已改：${trimmed.slice(0, 40)}${trimmed.length > 40 ? '…' : ''}`);
      return;
    }
    if (op === 'restore') {
      const els = getSelectedEls();
      pushUndoGroup(els);
      els.forEach(x => {
        delete x.dataset.fbwOpDeleted;
        delete x.dataset.fbwOpHidden;
        delete x.dataset.fbwTx; delete x.dataset.fbwTy; delete x.dataset.fbwScale; delete x.dataset.fbwRotate;
        delete x.dataset.fbwHighlight;
        x.removeAttribute('data-fbw-tag-as');
        x.style.transform = ''; x.style.backgroundImage = '';
        x.style.backgroundColor = '';
        if (x.tagName === 'IMG' && x.dataset.fbwOriginalSrc) {
          x.src = x.dataset.fbwOriginalSrc;
          delete x.dataset.fbwOriginalSrc;
        }
        clearOpsOn(x);
      });
      showUndoToast(els.length > 1 ? `${t('op.restore')} · ${els.length}` : t('op.restore'));
      positionToolbar(el);
      return;
    }
    if (op.startsWith('move-')) {
      const els = getSelectedEls();
      pushUndoGroup(els);
      const dir = op.slice(5);
      const step = e.shiftKey ? 16 : 4;
      els.forEach(x => {
        const tr = getElTransform(x);
        if (dir === 'up') tr.y -= step;
        if (dir === 'down') tr.y += step;
        if (dir === 'left') tr.x -= step;
        if (dir === 'right') tr.x += step;
        setElTransform(x, tr);
        recordOp(x, 'move', { x: tr.x, y: tr.y });
      });
      positionToolbar(el);
      return;
    }
    if (op === 'zoom-in' || op === 'zoom-out') {
      const els = getSelectedEls();
      pushUndoGroup(els);
      const factor = op === 'zoom-in' ? 1.1 : (1 / 1.1);
      els.forEach(x => {
        const tr = getElTransform(x);
        tr.scale = Math.max(0.2, Math.min(3, tr.scale * factor));
        setElTransform(x, tr);
        recordOp(x, 'scale', { scale: parseFloat(tr.scale.toFixed(3)) });
      });
      positionToolbar(el);
      return;
    }
    if (op === 'font') {
      window.__fbwSelEl = el;
      if (state.fontPicker.classList.contains('fbw-fp-open')) closeFontPicker();
      else { closeMarkerPopover(); closeNotePopover(); closeTagPopover(); openFontPicker(); }
      return;
    }
    if (op === 'highlight') {
      if (state.markerPopover?.classList.contains('fbw-on')) closeMarkerPopover();
      else { closeFontPicker(); closeNotePopover(); closeTagPopover(); openMarkerPopover(); }
      return;
    }
    if (op === 'tag') {
      if (state.tagPopover?.classList.contains('fbw-on')) closeTagPopover();
      else { closeFontPicker(); closeNotePopover(); closeMarkerPopover(); openTagPopover(); }
      return;
    }
    if (op === 'pick') {
      pickColor();
      return;
    }
    if (op === 'note') {
      if (state.notePopover?.classList.contains('fbw-on')) closeNotePopover();
      else { closeFontPicker(); closeMarkerPopover(); closeTagPopover(); openNotePopover(el); }
      return;
    }
    if (op === 'replace-img') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (ev) => {
        const file = ev.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          pushUndo(el);
          if (el.tagName === 'IMG') {
            if (!el.dataset.fbwOriginalSrc) el.dataset.fbwOriginalSrc = el.src;
            el.src = reader.result;
          } else {
            el.style.backgroundImage = `url(${reader.result})`;
          }
          recordOp(el, 'replace-img', { name: file.name });
          state.attachments.push({
            id: 'fbw-att-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            name: file.name || ('替换图-' + Date.now() + '.png'),
            dataURL: reader.result, type: file.type,
          });
          renderAttachments();
          showUndoToast(t('op.replaceImg'));
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  });
}

// 拖拽：mousedown 只记录"潜在"拖拽意图；只有 mousemove 越过阈值才真正进入拖拽。
// 这样避免点击元素时因为微小手指抖动被误判为拖动。
const DRAG_THRESHOLD = 10; // 像素，超过才算拖

let pendingDrag = null;

export function attachDragEvents() {
  document.addEventListener('mousedown', (e) => {
    if (!state.editMode || !state.selectedEl) return;
    if (e.button !== 0) return;
    if (e.target.closest('.fbw-elem-toolbar, .fbw-panel, .fbw-fab, .fbw-resize-handle')) return;
    // 多选时：mousedown 必须打在选中集合里的某个元素上（或其子元素），否则不拖
    const target = e.target;
    const lifted = liftTarget(target);
    const hits = getSelectedEls().filter(x => x === target || x === lifted || x.contains(target));
    if (!hits.length) return;
    if (state.selectedEl.dataset.fbwEditing === '1') return;
    const els = getSelectedEls();
    // 每个元素记录自己的初始 transform，mousemove 时各自加同一个 dx/dy
    const bases = new Map();
    els.forEach(x => {
      const tr = getElTransform(x);
      bases.set(x, { x: tr.x, y: tr.y, scale: tr.scale });
    });
    pendingDrag = {
      els, bases,
      anchor: state.selectedEl,
      startX: e.clientX, startY: e.clientY,
    };
  }, true);

  onMousemove((e) => {
    if (pendingDrag && !state.dragState) {
      const dx = e.clientX - pendingDrag.startX;
      const dy = e.clientY - pendingDrag.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // 越阈值 → 正式拖拽。一次 pushUndoGroup 记录所有元素的 pre-drag 状态
      pushUndoGroup(pendingDrag.els);
      state.dragState = { ...pendingDrag, moved: true };
      pendingDrag = null;
      document.body.style.cursor = 'move';
      e.preventDefault();
    }
    if (!state.dragState) return;
    const dx = e.clientX - state.dragState.startX;
    const dy = e.clientY - state.dragState.startY;
    state.dragState.els.forEach(x => {
      const base = state.dragState.bases.get(x);
      if (!base) return;
      setElTransform(x, { x: base.x + dx, y: base.y + dy, scale: base.scale });
    });
    followToolbar();
  });

  onMouseup(() => {
    pendingDrag = null;
    if (!state.dragState) return;
    if (state.dragState.moved) {
      state.dragState.els.forEach(x => {
        const tr = getElTransform(x);
        recordOp(x, 'move', { x: Math.round(tr.x), y: Math.round(tr.y) });
      });
    }
    state.dragState = null;
    document.body.style.cursor = '';
  });
}
