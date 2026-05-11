// 跨 DOM（live → 源 HTML 文件）的元素定位。
// 不能复用 selector.js 的 cssPath，因为那里包含 [data-fbw-sec-id="..."] 等 widget 注入属性。
// 这里用 "section 第 N 个 + 内部纯结构 path" 的方式，能在原始源文件 DOM 上跑。
import { SECTION_SELECTORS } from '../config.js';

export function buildSourcePath(el) {
  const sec = el.closest('[data-fbw-sec-id]');
  if (!sec) return null;

  const allSections = document.querySelectorAll(SECTION_SELECTORS);
  const secIndex = [...allSections].indexOf(sec);
  if (secIndex < 0) return null;

  const parts = [];
  let cur = el;
  while (cur && cur !== sec) {
    let part = cur.tagName.toLowerCase();
    const parent = cur.parentElement;
    if (!parent) break;
    const sibs = [...parent.children].filter(c => c.tagName === cur.tagName);
    if (sibs.length > 1) {
      part += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    }
    parts.unshift(part);
    cur = parent;
  }

  return {
    secIndex,
    secLabel: sec.dataset.fbwSecLabel || null,
    path: parts.join(' > '),
    contentSample: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    tag: el.tagName.toLowerCase(),
  };
}

export function resolveInSourceDoc(doc, sourcePath, sectionSelector) {
  const sections = doc.querySelectorAll(sectionSelector);
  const sec = sections[sourcePath.secIndex];
  if (!sec) return { ok: false, reason: 'section-not-found' };

  let target = null;
  try {
    target = sourcePath.path ? sec.querySelector(sourcePath.path) : sec;
  } catch (e) {
    return { ok: false, reason: 'invalid-path' };
  }
  if (!target) return { ok: false, reason: 'element-not-found' };

  const sample = (target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  return {
    ok: true,
    el: target,
    contentMismatch: sample !== sourcePath.contentSample,
  };
}
