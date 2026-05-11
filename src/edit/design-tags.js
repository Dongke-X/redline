// Design feedback 快捷分类标签。点一下在反馈文本前贴 [标签]，给 agent 一个明确的语义信号。
// 用在两处：元素 note popover、marquee 区域标注的 note 输入。
import { t } from '../i18n.js';

export const TAGS = [
  { key: 'spacing',    i18nKey: 'design.tag.spacing' },
  { key: 'color',      i18nKey: 'design.tag.color' },
  { key: 'typography', i18nKey: 'design.tag.typography' },
  { key: 'layout',     i18nKey: 'design.tag.layout' },
  { key: 'copy',       i18nKey: 'design.tag.copy' },
];

export function buildTagBarHTML() {
  return `<div class="fbw-design-tags" data-fbw-tags>${
    TAGS.map(tag => `<button class="fbw-design-tag" type="button" data-fbw-tag="${tag.key}">${t(tag.i18nKey)}</button>`).join('')
  }</div>`;
}

// 当前 textarea 文本里已存在哪些 tag prefix（按 TAGS 的中文/英文名扫开头）
function detectActiveTags(text) {
  const labels = TAGS.map(tag => ({ key: tag.key, label: t(tag.i18nKey) }));
  const active = new Set();
  // 匹配 [label] 形式（开头连续若干个）
  let cursor = text;
  while (true) {
    const m = cursor.match(/^\s*\[([^\]]+)\]\s*/);
    if (!m) break;
    const inner = m[1].trim();
    const hit = labels.find(l => l.label === inner);
    if (!hit) break;
    active.add(hit.key);
    cursor = cursor.slice(m[0].length);
  }
  return active;
}

export function paintTagBar(tagBarEl, textarea) {
  if (!tagBarEl || !textarea) return;
  const active = detectActiveTags(textarea.value || '');
  tagBarEl.querySelectorAll('[data-fbw-tag]').forEach(btn => {
    btn.classList.toggle('fbw-on', active.has(btn.dataset.fbwTag));
  });
}

// 点 chip：在文本最前面 toggle [label] 前缀
export function toggleTag(textarea, tagKey) {
  if (!textarea) return;
  const tagDef = TAGS.find(t => t.key === tagKey);
  if (!tagDef) return;
  const label = t(tagDef.i18nKey);
  const prefix = `[${label}] `;
  const cur = textarea.value || '';
  // 检查当前文本顶部是否已有相同 tag
  const startRe = new RegExp(`^\\s*\\[${label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\]\\s*`);
  if (startRe.test(cur)) {
    textarea.value = cur.replace(startRe, '');
  } else {
    textarea.value = prefix + cur;
  }
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

// 给 tag-bar 容器装上 click 委托。需要传入定位 textarea 的查找函数
export function attachTagBarEvents(tagBarEl, getTextarea) {
  if (!tagBarEl) return;
  tagBarEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fbw-tag]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const ta = getTextarea();
    if (!ta) return;
    toggleTag(ta, btn.dataset.fbwTag);
    paintTagBar(tagBarEl, ta);
  });
}
