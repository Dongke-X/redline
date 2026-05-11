// 自定义 tooltip：跟 widget panel 同视觉风格（深色玻璃 + backdrop blur）。
// 任何元素加 data-tooltip="..." 属性。首次悬浮 80ms 后显示，
// 若已有 tooltip 显示，则切换目标时立刻显示（避免来回挪动有延迟感）。
import { onScroll } from './utils/events.js';
let tooltipEl = null;
let showTimer = null;
let currentTarget = null;
const FIRST_DELAY = 80;

function ensureEl() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'fbw-tooltip';
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function position(target) {
  const r = target.getBoundingClientRect();
  const tt = tooltipEl.getBoundingClientRect();
  // 默认在元素正上方居中。空间不够再放下方。
  let left = r.left + r.width / 2 - tt.width / 2;
  let top = r.top - tt.height - 6;
  if (left < 8) left = 8;
  if (left + tt.width > window.innerWidth - 8) left = window.innerWidth - tt.width - 8;
  if (top < 8) top = r.bottom + 6;
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = top + 'px';
}

function show(text, target) {
  ensureEl();
  tooltipEl.textContent = text;
  tooltipEl.classList.add('fbw-on');
  // 等下一帧位置才准
  requestAnimationFrame(() => position(target));
}

function hide() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  currentTarget = null;
  if (tooltipEl) tooltipEl.classList.remove('fbw-on');
}

export function attachTooltipDelegation() {
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest && e.target.closest('[data-tooltip]');
    if (!target) return;
    if (target === currentTarget) return;
    currentTarget = target;
    const text = target.dataset.tooltip;
    if (!text) return;
    if (showTimer) clearTimeout(showTimer);
    // 已有 tooltip 显示 → 立即切换；首次显示用短延迟，避免误触
    const alreadyShowing = tooltipEl && tooltipEl.classList.contains('fbw-on');
    if (alreadyShowing) show(text, target);
    else showTimer = setTimeout(() => show(text, target), FIRST_DELAY);
  }, true);

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest && e.target.closest('[data-tooltip]');
    if (!target) return;
    // 离开当前 target → 隐藏
    if (target === currentTarget) {
      // 检查 relatedTarget 是不是仍在 target 内
      if (e.relatedTarget && target.contains(e.relatedTarget)) return;
      hide();
    }
  }, true);

  // 点击 / 滚动时立即藏掉（避免拖拽 / 移动后 tooltip 残留）
  document.addEventListener('mousedown', hide, true);
  onScroll(hide);
}
