// 撤销 / 重做栈。
// 模型：对每次会改 elementOps 或 DOM 视觉态的操作，先 snapshot 元素的相关 state，再 push 到栈。
// Cmd+Z 时 pop → apply 旧 state。Cmd+Shift+Z 时反向。
// 文字编辑不走这里 —— 它由 contentEditable 原生 undo 处理，且 redline 的 keydown 在 contentEditable 内不响应。
import { state } from './state.js';
import { getChanges } from './elements.js';
import { scheduleSave } from './persist.js';
import { showToast, updateCounter } from '../utils.js';
import { t } from '../i18n.js';

const undoStack = [];
const redoStack = [];
const MAX_STACK = 50;

function snapshot(el) {
  if (!el) return null;
  const opsRec = state.elementOps.get(el);
  return {
    el,
    style: {
      transform: el.style.transform || '',
      fontFamily: el.style.fontFamily || '',
      backgroundColor: el.style.backgroundColor || '',
      backgroundImage: el.style.backgroundImage || '',
      visibility: el.style.visibility || '',
    },
    dataset: {
      fbwTx: el.dataset.fbwTx ?? null,
      fbwTy: el.dataset.fbwTy ?? null,
      fbwScale: el.dataset.fbwScale ?? null,
      fbwRotate: el.dataset.fbwRotate ?? null,
      fbwOpHidden: el.dataset.fbwOpHidden ?? null,
      fbwOpDeleted: el.dataset.fbwOpDeleted ?? null,
      fbwHighlight: el.dataset.fbwHighlight ?? null,
      fbwOriginalSrc: el.dataset.fbwOriginalSrc ?? null,
    },
    attrs: {
      tagAs: el.getAttribute('data-fbw-tag-as'),
      href: el.tagName === 'A' ? el.getAttribute('href') : undefined,
      src: el.tagName === 'IMG' ? el.getAttribute('src') : undefined,
    },
    // 文字内容（用于 text-edit undo）。textContent 而非 innerHTML，避免
    // 重置 innerHTML 后子节点上 data-fbw-edit-id 的元素引用失效。
    // 代价：撤销文字编辑时丢失内部 <strong> 等行内格式
    text: el.textContent,
    edited: el.dataset.fbwEdited ?? null,
    fbwChanged: el.classList.contains('fbw-changed'),
    opsClone: opsRec ? JSON.parse(JSON.stringify(opsRec)) : null,
  };
}

function applySnapshot(snap) {
  if (!snap) return false;
  const el = snap.el;
  if (!el || !document.contains(el)) return false;

  for (const k of Object.keys(snap.style)) el.style[k] = snap.style[k];

  for (const k of Object.keys(snap.dataset)) {
    if (snap.dataset[k] === null) delete el.dataset[k];
    else el.dataset[k] = snap.dataset[k];
  }

  if (snap.attrs.tagAs === null) el.removeAttribute('data-fbw-tag-as');
  else el.setAttribute('data-fbw-tag-as', snap.attrs.tagAs);

  if (el.tagName === 'A' && snap.attrs.href !== undefined) {
    if (snap.attrs.href === null) el.removeAttribute('href');
    else el.setAttribute('href', snap.attrs.href);
  }
  if (el.tagName === 'IMG' && snap.attrs.src !== undefined && snap.attrs.src !== null) {
    el.src = snap.attrs.src;
  }

  // 文字内容还原（仅当跟现状不同时才碰 DOM，避免 input 事件多余 fire）
  if (typeof snap.text === 'string' && el.textContent !== snap.text) {
    el.textContent = snap.text;
  }
  if (snap.edited === null) delete el.dataset.fbwEdited;
  else el.dataset.fbwEdited = snap.edited;
  el.classList.toggle('fbw-changed', !!snap.fbwChanged);

  if (snap.opsClone) state.elementOps.set(el, snap.opsClone);
  else state.elementOps.delete(el);

  return true;
}

export function pushUndo(el) {
  if (!el) return;
  const snap = snapshot(el);
  if (!snap) return;
  undoStack.push(snap);
  if (undoStack.length > MAX_STACK) undoStack.shift();
  redoStack.length = 0;
}

export function undo() {
  if (undoStack.length === 0) {
    showToast(t('undo.empty') || '没有可撤销的操作');
    return;
  }
  const snap = undoStack.pop();
  const cur = snapshot(snap.el);
  if (cur) redoStack.push(cur);
  if (applySnapshot(snap)) {
    updateCounter(getChanges);
    scheduleSave();
    showToast(t('undo.done') || '已撤销');
  } else {
    showToast(t('undo.gone') || '元素已不在页面');
  }
}

export function redo() {
  if (redoStack.length === 0) {
    showToast(t('redo.empty') || '没有可重做的操作');
    return;
  }
  const snap = redoStack.pop();
  const cur = snapshot(snap.el);
  if (cur) undoStack.push(cur);
  if (applySnapshot(snap)) {
    updateCounter(getChanges);
    scheduleSave();
    showToast(t('redo.done') || '已重做');
  } else {
    showToast(t('redo.gone') || '元素已不在页面');
  }
}

export function canUndo() { return undoStack.length > 0; }
export function canRedo() { return redoStack.length > 0; }
