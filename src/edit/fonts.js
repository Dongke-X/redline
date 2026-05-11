// 字体选择面板：document.fonts（页面 @font-face）+ navigator.queryLocalFonts（本地系统字体）+ 通用兜底。
// 应用到选中元素时按 inline style 写 font-family。
import { state } from '../core/state.js';
import { recordOp } from '../core/elements.js';
import { pushUndo } from '../core/undo.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

let cachedFonts = null;
let localFontsState = 'unknown'; // unknown | granted | denied | unsupported

async function fetchLocalFonts() {
  if (localFontsState === 'denied' || localFontsState === 'unsupported') return [];
  // 不再用 `'queryLocalFonts' in navigator`：Chrome 某些配置下这个检查会假阴。直接 try 调用。
  try {
    if (typeof navigator === 'undefined' || typeof navigator.queryLocalFonts !== 'function') {
      throw new Error('queryLocalFonts not a function');
    }
    const list = await navigator.queryLocalFonts();
    localFontsState = 'granted';
    const seen = new Set();
    const out = [];
    for (const f of list) {
      if (!seen.has(f.family)) {
        seen.add(f.family);
        out.push({ name: f.family, family: `"${f.family.replace(/"/g, '\\"')}"`, source: 'local' });
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  } catch (e) {
    // SecurityError / NotAllowedError / TypeError 都归到 denied，
    // 让用户看到一个统一的提示 + console 里有具体原因
    localFontsState = 'denied';
    console.warn('[fbw] queryLocalFonts unavailable:', e?.name || '?', '·', e?.message || e);
    return [];
  }
}

async function getAvailableFonts() {
  if (cachedFonts) return cachedFonts;
  const groups = { generic: [], document: [], local: [] };

  // 1. 通用兜底（永远有）
  groups.generic.push({ name: '系统默认', family: '__inherit__', source: 'inherit' });
  groups.generic.push({ name: 'system-ui', family: 'system-ui, -apple-system, sans-serif', source: 'generic' });
  groups.generic.push({ name: 'serif', family: 'serif', source: 'generic' });
  groups.generic.push({ name: 'sans-serif', family: 'sans-serif', source: 'generic' });
  groups.generic.push({ name: 'monospace', family: 'ui-monospace, monospace', source: 'generic' });
  groups.generic.push({ name: 'cursive', family: 'cursive', source: 'generic' });

  // 2. 页面 @font-face
  try {
    const seen = new Set();
    document.fonts.forEach(f => {
      const name = (f.family || '').replace(/^['"]|['"]$/g, '');
      if (name && !seen.has(name)) {
        seen.add(name);
        groups.document.push({ name, family: `"${name}"`, source: 'document' });
      }
    });
  } catch (_) {}

  // 3. 本地系统字体
  groups.local = await fetchLocalFonts();

  // 合并去重
  const merged = new Map();
  [...groups.generic, ...groups.document, ...groups.local].forEach(f => {
    if (!merged.has(f.name)) merged.set(f.name, f);
  });

  cachedFonts = [...merged.values()];
  return cachedFonts;
}

function normalizeName(s) {
  return (s || '').replace(/^['"]|['"]$/g, '').trim().toLowerCase();
}

function currentFontTokens(el) {
  if (!el) return [];
  const cs = window.getComputedStyle(el).fontFamily;
  return cs.split(',').map(normalizeName).filter(Boolean);
}

function groupLabel(source) {
  if (source === 'document') return t('font.group.document');
  if (source === 'local') return t('font.group.local');
  return t('font.group.generic');
}

async function buildFontPicker() {
  const fonts = await getAvailableFonts();
  // 按 group 分段渲染：generic → document → local
  const order = { inherit: 0, generic: 1, document: 2, local: 3 };
  const sorted = [...fonts].sort((a, b) => (order[a.source] || 0) - (order[b.source] || 0));

  let lastSource = null;
  const html = sorted.map(f => {
    let header = '';
    if (f.source !== lastSource && f.source !== 'inherit') {
      lastSource = f.source;
      header = `<div class="fbw-fp-group">${groupLabel(f.source)}</div>`;
    } else if (f.source === 'inherit') {
      lastSource = 'inherit';
    }
    return header + `
      <div class="fbw-fp-item" data-fp-family="${f.family.replace(/"/g, '&quot;')}" data-fp-name="${f.name}" style="${f.family === '__inherit__' ? '' : `font-family:${f.family};`}">
        <span>${f.name === '系统默认' ? t('font.systemDefault') : f.name + ' Aa 永和九年'}</span>
        <span class="fbw-fp-name">${f.name}</span>
      </div>
    `;
  }).join('');

  // 如果本地字体不可用，给个温和提示（带 console 里的实际原因方向）
  let footer = '';
  if (localFontsState === 'denied') {
    footer = `<div class="fbw-fp-hint">${t('font.localDenied')}</div>`;
  } else if (localFontsState === 'unsupported') {
    footer = `<div class="fbw-fp-hint">${t('font.localUnsupported')}</div>`;
  }

  state.fontPicker.innerHTML = html + footer;
}

export function positionFontPicker() {
  const tb = state.elemToolbar.getBoundingClientRect();
  let top = tb.bottom + 6;
  let left = tb.left;
  if (left + 240 > window.innerWidth - 8) left = window.innerWidth - 248;
  if (left < 8) left = 8;
  if (top + 360 > window.innerHeight - 8) top = Math.max(8, tb.top - 366);
  state.fontPicker.style.top = top + 'px';
  state.fontPicker.style.left = left + 'px';
}

export async function openFontPicker() {
  state.fontPicker.classList.add('fbw-fp-open');
  positionFontPicker();
  // 先显示一个加载占位（首次拉本地字体可能要 200ms）
  if (!cachedFonts && (typeof navigator !== 'undefined' && 'queryLocalFonts' in navigator)) {
    state.fontPicker.innerHTML = `<div class="fbw-fp-loading">${t('font.loading')}</div>`;
  }
  await buildFontPicker();
  positionFontPicker();
  // 标记当前选中的字体（按 token 精确匹配，不再用 includes 子串）
  const tokens = currentFontTokens(window.__fbwSelEl);
  state.fontPicker.querySelectorAll('.fbw-fp-item').forEach(it => {
    if (it.dataset.fpFamily === '__inherit__') return;
    const itemName = normalizeName(it.dataset.fpName);
    if (tokens.includes(itemName)) it.classList.add('fbw-fp-active');
  });
}

export function closeFontPicker() {
  state.fontPicker.classList.remove('fbw-fp-open');
}

export function attachFontPickerEvents() {
  state.fontPicker.addEventListener('click', (e) => {
    const item = e.target.closest('.fbw-fp-item');
    if (!item || !state.selectedEl) return;
    e.stopPropagation();
    const family = item.dataset.fpFamily.replace(/&quot;/g, '"');
    const name = item.dataset.fpName;
    const el = state.selectedEl;
    pushUndo(el);
    if (family === '__inherit__') {
      el.style.fontFamily = '';
      delete el.dataset.fbwFontName;
      recordOp(el, 'font', { family: '系统默认' });
    } else {
      el.style.fontFamily = family;
      el.dataset.fbwFontName = name;
      recordOp(el, 'font', { family: name });
    }
    showToast(t('op.font', { name }));
    closeFontPicker();
  });

  document.addEventListener('mousedown', (e) => {
    if (!state.fontPicker.classList.contains('fbw-fp-open')) return;
    if (e.target.closest('.fbw-font-picker, .fbw-elem-toolbar')) return;
    closeFontPicker();
  }, true);
}
