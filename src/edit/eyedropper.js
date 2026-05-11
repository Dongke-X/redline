// 颜色取色器：用浏览器的 EyeDropper API（Chrome / Edge 95+）。
// 取到颜色后：复制 hex 到剪贴板 + 写入剪贴板 + toast；
// 如果反馈面板的 textarea 当前 focus，则也把 hex 插到光标位置（让 design feedback 一键留痕）。
import { state } from '../core/state.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

function insertAtCursor(textarea, text) {
  if (!textarea) return false;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = before + text + after;
  const pos = start + text.length;
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

export async function pickColor() {
  if (typeof window.EyeDropper !== 'function') {
    showToast(t('eyedropper.unsupported') || '取色器不支持当前浏览器 · 需要 Chrome / Edge 95+');
    return;
  }
  // 暂时关掉面板免遮挡画面（用户取色时全屏聚焦）
  const wasOpen = state.panel?.classList.contains('fbw-open');
  if (wasOpen) state.panel.classList.remove('fbw-open');
  let result;
  try {
    const ed = new window.EyeDropper();
    result = await ed.open();
  } catch (e) {
    // 用户按 Esc 取消 —— 静默
    if (wasOpen) state.panel?.classList.add('fbw-open');
    return;
  }
  if (wasOpen) state.panel?.classList.add('fbw-open');
  const hex = result.sRGBHex;
  // 优先：插到刚才 focus 的 textarea；否则只放剪贴板
  const focused = document.activeElement;
  let inserted = false;
  if (focused && focused.tagName === 'TEXTAREA' && focused.closest('.fbw-panel, .fbw-anno, .fbw-note-popover')) {
    inserted = insertAtCursor(focused, hex);
  }
  try { await navigator.clipboard.writeText(hex); } catch (_) {}
  showToast(
    inserted
      ? (t('eyedropper.inserted', { hex }) || `${hex} · 已插入反馈框 + 剪贴板`)
      : (t('eyedropper.copied', { hex }) || `${hex} · 已复制到剪贴板`)
  );
}
