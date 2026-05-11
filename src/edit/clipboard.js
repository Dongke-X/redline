// ⌘+C 复制选中元素的描述符到剪贴板。
// 不是"复制元素 DOM"——而是把 Claude 能用来定位这个元素的文字信息给你，
// 方便从浏览器切回聊天框继续讨论"我说的是这个"。
import { state } from '../core/state.js';
import { buildSourcePath } from '../core/sourcePath.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

function sectionFriendlyLabel(sec) {
  if (!sec) return '';
  const screen = sec.getAttribute('data-screen-label') || sec.dataset.fbwSecLabel || sec.getAttribute('aria-label');
  if (screen) return screen.trim();
  const heading = sec.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent) {
    return heading.textContent.trim().replace(/\s+/g, ' ').slice(0, 24);
  }
  return sec.id ? '#' + sec.id : sec.tagName.toLowerCase();
}

export function descriptorText(el) {
  if (!el) return '';
  const sec = el.closest('section, article, [data-fbw-sec-id]');
  const secLabel = sec ? sectionFriendlyLabel(sec) : '';
  const tag = el.tagName.toLowerCase();
  const sample = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const sp = buildSourcePath(el);
  const header = `[${secLabel || 'page'}] ${tag}${sample ? ` · "${sample}${sample.length >= 60 ? '…' : ''}"` : ''}`;
  if (sp && sp.path) return `${header}\nselector: ${sp.path}`;
  return header;
}

export async function copySelectedDescriptor() {
  if (!state.selectedEl) {
    showToast(t('copy.descriptor.empty') || '没有选中元素');
    return;
  }
  const text = descriptorText(state.selectedEl);
  try {
    await navigator.clipboard.writeText(text);
    showToast(t('copy.descriptor.done') || '已复制元素描述符');
  } catch (e) {
    // fallback: textarea trick
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(t('copy.descriptor.done') || '已复制元素描述符'); }
    catch (_) { showToast(t('copy.descriptor.fail') || '复制失败'); }
    document.body.removeChild(ta);
  }
}
