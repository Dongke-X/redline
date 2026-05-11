// 4 角的"缩放 dot"（角上）+ 4 个"旋转 zone"（角外对角方向）。
// 缩放：以中心为锚，记录起始光标到中心距 D0，移动后距 D1 → newScale = baseScale * D1/D0
// 旋转：以中心为锚，atan2 算起始角和当前角，差值就是 delta，按住 Shift 吸附 15°
import { state } from '../core/state.js';
import { getElTransform, setElTransform, recordOp } from '../core/elements.js';
import { onMousemove, onMouseup } from '../utils/events.js';

const HANDLES = ['tl', 'tr', 'br', 'bl'];

export function createResizeHandlesNode() {
  const container = document.createElement('div');
  container.className = 'fbw-resize-handles';
  // 旋转 zone（先放在底层）
  HANDLES.forEach(pos => {
    const z = document.createElement('div');
    z.className = 'fbw-rotate-zone';
    z.dataset.handle = pos;
    z.title = '拖动旋转 · 按住 Shift 吸附 15°';
    container.appendChild(z);
  });
  // 缩放 dot（盖在旋转 zone 上）
  HANDLES.forEach(pos => {
    const h = document.createElement('div');
    h.className = 'fbw-resize-handle';
    h.dataset.handle = pos;
    h.title = '拖动缩放';
    container.appendChild(h);
  });
  return container;
}

export function showResizeHandles(el) {
  if (!state.resizeHandles || !el) return;
  state.resizeHandles.classList.add('fbw-on');
  positionResizeHandles(el);
}

export function hideResizeHandles() {
  if (!state.resizeHandles) return;
  state.resizeHandles.classList.remove('fbw-on');
}

export function positionResizeHandles(el) {
  if (!state.resizeHandles || !el) return;
  const rect = el.getBoundingClientRect();
  state.resizeHandles.style.top = rect.top + 'px';
  state.resizeHandles.style.left = rect.left + 'px';
  state.resizeHandles.style.width = rect.width + 'px';
  state.resizeHandles.style.height = rect.height + 'px';
}

let activeDrag = null;
let readoutEl = null;

// 拖动 scale/rotate 时显示当前数值，常见值附近显示对齐提示。
// 借鉴 heyhtml 但缩到最小：只是 readout，不做参考线（redline 不做自由定位）
const SCALE_SNAPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const ROTATE_SNAPS = [0, 45, 90, 135, 180, -45, -90, -135];

function ensureReadout() {
  if (readoutEl) return readoutEl;
  readoutEl = document.createElement('div');
  readoutEl.className = 'fbw-drag-readout';
  document.body.appendChild(readoutEl);
  return readoutEl;
}

function showReadout(text, x, y) {
  const el = ensureReadout();
  el.textContent = text;
  el.style.left = (x + 14) + 'px';
  el.style.top = (y + 14) + 'px';
  el.classList.add('fbw-on');
}

function hideReadout() {
  if (readoutEl) readoutEl.classList.remove('fbw-on');
}

function formatScale(s) {
  const snap = SCALE_SNAPS.find(v => Math.abs(s - v) < 0.03);
  return snap !== undefined ? `${snap.toFixed(2)}× ✓` : `${s.toFixed(2)}×`;
}

function formatRotate(deg) {
  const r = Math.round(deg);
  const snap = ROTATE_SNAPS.find(v => Math.abs(r - v) <= 2);
  return snap !== undefined ? `${snap}° ✓` : `${r}°`;
}

function syncToolbarOnTransform(el) {
  if (!state.elemToolbar) return;
  const r = el.getBoundingClientRect();
  const tbR = state.elemToolbar.getBoundingClientRect();
  let top = r.top - tbR.height - 24;
  let left = r.left;
  if (top < 8) top = r.bottom + 24;
  if (left + tbR.width > window.innerWidth - 8) left = window.innerWidth - tbR.width - 8;
  if (left < 8) left = 8;
  state.elemToolbar.style.top = top + 'px';
  state.elemToolbar.style.left = left + 'px';
}

export function attachResizeEvents() {
  state.resizeHandles.addEventListener('mousedown', (e) => {
    if (!state.editMode || !state.selectedEl) return;
    if (e.button !== 0) return;

    const rotateZone = e.target.closest('.fbw-rotate-zone');
    const scaleHandle = e.target.closest('.fbw-resize-handle');
    if (!rotateZone && !scaleHandle) return;
    e.preventDefault();
    e.stopPropagation();

    const el = state.selectedEl;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const tr = getElTransform(el);

    if (scaleHandle) {
      const startDist = Math.hypot(e.clientX - cx, e.clientY - cy);
      activeDrag = {
        mode: 'scale',
        el, cx, cy,
        startDist: Math.max(startDist, 1),
        baseScale: tr.scale,
        baseX: tr.x, baseY: tr.y, baseRotate: tr.rotate || 0,
      };
      document.body.style.cursor = window.getComputedStyle(scaleHandle).cursor;
    } else {
      activeDrag = {
        mode: 'rotate',
        el, cx, cy,
        baseRotate: tr.rotate || 0,
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI,
      };
      document.body.style.cursor = 'grabbing';
    }
  });

  onMousemove((e) => {
    if (!activeDrag) return;
    e.preventDefault();
    if (activeDrag.mode === 'scale') {
      const d = Math.hypot(e.clientX - activeDrag.cx, e.clientY - activeDrag.cy);
      const ratio = d / activeDrag.startDist;
      const newScale = Math.max(0.2, Math.min(3, activeDrag.baseScale * ratio));
      setElTransform(activeDrag.el, {
        x: activeDrag.baseX,
        y: activeDrag.baseY,
        scale: newScale,
        rotate: activeDrag.baseRotate,
      });
      showReadout(formatScale(newScale), e.clientX, e.clientY);
    } else if (activeDrag.mode === 'rotate') {
      const angle = Math.atan2(e.clientY - activeDrag.cy, e.clientX - activeDrag.cx) * 180 / Math.PI;
      let newRotate = activeDrag.baseRotate + (angle - activeDrag.startAngle);
      while (newRotate > 180) newRotate -= 360;
      while (newRotate <= -180) newRotate += 360;
      if (e.shiftKey) newRotate = Math.round(newRotate / 15) * 15;
      const cur = getElTransform(activeDrag.el);
      setElTransform(activeDrag.el, { ...cur, rotate: newRotate });
      showReadout(formatRotate(newRotate), e.clientX, e.clientY);
    }
    positionResizeHandles(activeDrag.el);
    syncToolbarOnTransform(activeDrag.el);
  });

  onMouseup(() => {
    if (!activeDrag) return;
    const tr = getElTransform(activeDrag.el);
    if (activeDrag.mode === 'scale') {
      // 接近常用整数刻度时自动吸附
      const snap = SCALE_SNAPS.find(v => Math.abs(tr.scale - v) < 0.03);
      const finalScale = snap !== undefined ? snap : tr.scale;
      if (snap !== undefined) setElTransform(activeDrag.el, { ...tr, scale: finalScale });
      recordOp(activeDrag.el, 'scale', { scale: parseFloat(finalScale.toFixed(3)) });
    } else if (activeDrag.mode === 'rotate') {
      const snap = ROTATE_SNAPS.find(v => Math.abs(tr.rotate - v) <= 2);
      const finalRot = snap !== undefined ? snap : tr.rotate;
      if (snap !== undefined) setElTransform(activeDrag.el, { ...tr, rotate: finalRot });
      recordOp(activeDrag.el, 'rotate', { rotate: parseFloat(finalRot.toFixed(2)) });
    }
    hideReadout();
    positionResizeHandles(activeDrag.el);
    activeDrag = null;
    document.body.style.cursor = '';
  });
}
