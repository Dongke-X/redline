// 间距测量（design feedback）：选中元素 + 按住 Alt + hover 目标元素 → 显示 4 边距离。
// 类似 Figma 按住 Option 测距。释放 Alt 自动消失。
import { state } from '../core/state.js';

let overlay = null;

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'fbw-measure-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

function makeLine(axis, x, y, length) {
  const el = document.createElement('div');
  el.className = 'fbw-measure-line fbw-measure-line-' + axis;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  if (axis === 'h') el.style.width = length + 'px';
  else el.style.height = length + 'px';
  return el;
}

function makeLabel(text, x, y, axis) {
  const el = document.createElement('div');
  el.className = 'fbw-measure-label';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  // 横向距离 → 标签贴线上方；纵向 → 贴线右侧
  el.style.transform = axis === 'h' ? 'translate(-50%, -130%)' : 'translate(8px, -50%)';
  return el;
}

export function showMeasurement(targetEl) {
  if (!state.selectedEl || !targetEl) return hideMeasurement();
  if (targetEl === state.selectedEl) return hideMeasurement();
  const a = state.selectedEl.getBoundingClientRect();
  const b = targetEl.getBoundingClientRect();
  if (!a.width || !b.width) return hideMeasurement();

  const ov = ensureOverlay();
  ov.innerHTML = '';
  ov.classList.add('fbw-on');

  // 目标元素的虚线轮廓
  const bOutline = document.createElement('div');
  bOutline.className = 'fbw-measure-target';
  bOutline.style.left = b.left + 'px';
  bOutline.style.top = b.top + 'px';
  bOutline.style.width = b.width + 'px';
  bOutline.style.height = b.height + 'px';
  ov.appendChild(bOutline);

  const cx = a.left + a.width / 2;
  const cy = a.top + a.height / 2;

  // 4 个方向：从 A 的边引一条线到 B 的对应边。距离为正/负数 = 内嵌/外凸
  // top: A.top → B.top   (正值 = A 在 B 内部)
  // bottom: A.bottom → B.bottom
  // left: A.left → B.left
  // right: A.right → B.right
  const dTop = a.top - b.top;
  const dBottom = b.bottom - a.bottom;
  const dLeft = a.left - b.left;
  const dRight = b.right - a.right;

  // top
  if (Math.abs(dTop) > 0.5) {
    const y1 = Math.min(a.top, b.top);
    ov.appendChild(makeLine('v', cx, y1, Math.abs(dTop)));
    ov.appendChild(makeLabel(Math.round(dTop) + 'px', cx, (a.top + b.top) / 2, 'v'));
  }
  // bottom
  if (Math.abs(dBottom) > 0.5) {
    const y1 = Math.min(a.bottom, b.bottom);
    ov.appendChild(makeLine('v', cx, y1, Math.abs(dBottom)));
    ov.appendChild(makeLabel(Math.round(dBottom) + 'px', cx, (a.bottom + b.bottom) / 2, 'v'));
  }
  // left
  if (Math.abs(dLeft) > 0.5) {
    const x1 = Math.min(a.left, b.left);
    ov.appendChild(makeLine('h', x1, cy, Math.abs(dLeft)));
    ov.appendChild(makeLabel(Math.round(dLeft) + 'px', (a.left + b.left) / 2, cy, 'h'));
  }
  // right
  if (Math.abs(dRight) > 0.5) {
    const x1 = Math.min(a.right, b.right);
    ov.appendChild(makeLine('h', x1, cy, Math.abs(dRight)));
    ov.appendChild(makeLabel(Math.round(dRight) + 'px', (a.right + b.right) / 2, cy, 'h'));
  }
}

export function hideMeasurement() {
  if (overlay) {
    overlay.classList.remove('fbw-on');
    overlay.innerHTML = '';
  }
}
