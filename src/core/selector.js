// 元素稳定选择器：三层 fallback。
// id (作者主动 / data-fb-id) → cssPath + contentHash → 会话级 fbId。
// 后两者用来在源文件没改时也能复定位元素。

export function buildSelector(el) {
  return {
    id: el.id || el.dataset.fbId || null,
    cssPath: cssPath(el),
    contentHash: contentHash(el),
    fbId: el.dataset.fbwEditId || null,
    tag: el.tagName.toLowerCase(),
  };
}

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return String(s).replace(/[^\w-]/g, m => '\\' + m);
}

// 从最近的 [data-fbw-sec-id] 出发构建 CSS 路径，遇到 id 就停（保短）。
function cssPath(el) {
  const root = el.closest('[data-fbw-sec-id]') || document.body;
  const parts = [];
  let cur = el;
  while (cur && cur !== root && cur !== document.body) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) {
      parts.unshift('#' + cssEscape(cur.id));
      cur = null;
      break;
    }
    const cls = [...cur.classList].filter(c => !c.startsWith('fbw-')).slice(0, 2);
    if (cls.length) part += '.' + cls.map(cssEscape).join('.');
    const parent = cur.parentElement;
    if (parent) {
      const sibs = [...parent.children].filter(c => c.tagName === cur.tagName);
      if (sibs.length > 1) {
        const idx = sibs.indexOf(cur) + 1;
        part += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(part);
    cur = parent;
  }
  const rootSelector = root.dataset?.fbwSecId
    ? `[data-fbw-sec-id="${root.dataset.fbwSecId}"]`
    : '';
  return [rootSelector, parts.join(' > ')].filter(Boolean).join(' > ');
}

// 内容指纹：normalize 空白 + 截前 40 字 + 8 位 hex hash。
// 不是密码学 hash，只为给 skill 复定位时多一个匹配信号。
function contentHash(el) {
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h) + text.charCodeAt(i);
    h |= 0;
  }
  return {
    sample: text.slice(0, 40),
    hash: (h >>> 0).toString(16).padStart(8, '0'),
  };
}
