// Single-file HTML 导出：
// 整页 + 注解 + 编辑 + redline bundle 全部 inline 进一个 .html，接收方双击就能打开继续标注。
// mode: 'editable'（默认，接收方完整 redline UI）/ 'readonly'（接收方只看 + 切前后对比）
import { state } from '../core/state.js';
import { getText } from '../core/elements.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

export async function exportSingleFile(opts = {}) {
  const mode = opts.mode === 'readonly' ? 'readonly' : 'editable';
  showToast(t('singlefile.preparing') || '正在打包 HTML…');

  try {
    const bundleText = await getBundleText();
    if (!bundleText) throw new Error('redline.js not found');

    // 整树克隆
    const cloneDoc = document.implementation.createHTMLDocument('');
    cloneDoc.replaceChild(document.documentElement.cloneNode(true), cloneDoc.documentElement);

    // 清掉运行时注入的 widget UI（bundle 启动时会重建）
    stripWidgetUI(cloneDoc);
    stripWidgetBodyClasses(cloneDoc);

    // 资源内联
    await inlineResources(cloneDoc);

    // 状态 + 模式 + bundle
    injectModeMeta(cloneDoc, mode);
    injectStateScript(cloneDoc, serializeState());
    injectBundle(cloneDoc, bundleText);

    const html = '<!DOCTYPE html>\n' + cloneDoc.documentElement.outerHTML;
    download(html, suggestFilename(mode));
    showToast(t('singlefile.done', { mode }) || `已导出 HTML · ${mode === 'readonly' ? '只读' : '可编辑'}`);
  } catch (e) {
    console.error('[fbw] singlefile export failed', e);
    showToast(t('singlefile.fail', { reason: e.message }) || '导出失败: ' + e.message);
  }
}

// 拿 bundle 源码：扩展走 chrome.runtime.getURL；skill 注入走 <script src> 或 inline
async function getBundleText() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    try {
      const url = chrome.runtime.getURL('redline.js');
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch (_) {}
  }
  for (const s of document.querySelectorAll('script[src]')) {
    if (/redline\.js(\?|$)/.test(s.src)) {
      try {
        const res = await fetch(s.src);
        if (res.ok) return await res.text();
      } catch (_) {}
    }
  }
  for (const s of document.querySelectorAll('script:not([src])')) {
    if (s.textContent && s.textContent.includes('__feedbackWidgetVersion')) {
      return s.textContent;
    }
  }
  return null;
}

function stripWidgetUI(root) {
  const selectors = [
    '.fbw-panel', '.fbw-fab-bar', '.fbw-elem-toolbar', '.fbw-confirm',
    '.fbw-toast', '.fbw-help-popover', '.fbw-tooltip', '.fbw-font-picker',
    '.fbw-note-popover', '.fbw-marker-popover', '.fbw-tag-popover',
    '.fbw-style-panel', '.fbw-resize-handles', '.fbw-drag-readout',
    '.fbw-measure-overlay', '.fbw-rubber-band', '.fbw-marquee-drawing',
    '.fbw-anno',                         // annotation 重建于 state，不需要静态 DOM
    '#fbw-styles', 'style[data-fbw-internal]',
    'script[data-fbw-state]',            // 旧的 state（如果有）
  ];
  for (const sel of selectors) {
    root.querySelectorAll(sel).forEach(el => el.remove());
  }
  // 旧的 redline.js script tag
  root.querySelectorAll('script').forEach(s => {
    if (s.src && /redline\.js(\?|$)/.test(s.src)) s.remove();
    else if (!s.src && s.textContent && s.textContent.includes('__feedbackWidgetVersion')) s.remove();
  });
}

function stripWidgetBodyClasses(root) {
  const body = root.querySelector('body');
  if (!body) return;
  const remove = [
    'fbw-edit-mode', 'fbw-no-overlay', 'fbw-marquee-mode', 'fbw-fab-collapsed',
    'fbw-dark-bg', 'fbw-scrolling', 'fbw-mouse-near-fab', 'fbw-printing',
    'fbw-compare-before', 'fbw-audit-mode', 'fbw-measuring',
    'fbw-mode-deck', 'fbw-mode-doc', 'fbw-mode-review',
  ];
  remove.forEach(c => body.classList.remove(c));
}

// ── 资源内联 ──────────────────────────────────────
async function inlineResources(root) {
  // img
  for (const img of root.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:')) continue;
    try {
      img.setAttribute('src', await fetchAsDataURL(absUrl(src)));
    } catch (_) {}
  }
  // <link rel="stylesheet">
  for (const link of [...root.querySelectorAll('link[rel="stylesheet"]')]) {
    const href = link.getAttribute('href');
    if (!href) continue;
    try {
      const abs = absUrl(href);
      const res = await fetch(abs);
      let cssText = await res.text();
      cssText = await inlineCssUrls(cssText, abs);
      const style = link.ownerDocument.createElement('style');
      style.textContent = cssText;
      link.replaceWith(style);
    } catch (_) {}
  }
  // inline <style>：处理里面的 url() / @font-face
  for (const s of root.querySelectorAll('style')) {
    if (!s.textContent) continue;
    s.textContent = await inlineCssUrls(s.textContent, location.href);
  }
}

async function inlineCssUrls(cssText, baseUrl) {
  const tasks = [];
  const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    if (m[2].startsWith('data:')) continue;
    tasks.push({ match: m[0], url: m[2] });
  }
  for (const t of tasks) {
    try {
      const abs = new URL(t.url, baseUrl).href;
      const data = await fetchAsDataURL(abs);
      cssText = cssText.split(t.match).join(`url("${data}")`);
    } catch (_) {}
  }
  return cssText;
}

function absUrl(u) {
  try { return new URL(u, location.href).href; } catch (_) { return u; }
}

async function fetchAsDataURL(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('fetch failed: ' + res.status);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ── 状态序列化 ──────────────────────────────────
function serializeState() {
  // text edits: 抓 innerHTML（保住 markup）
  const edits = {};
  document.querySelectorAll('[data-fbw-edit-id][data-fbw-edited]').forEach(el => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    const cur = getText(el);
    if (orig !== undefined && orig !== cur) {
      edits[id] = el.innerHTML;
    }
  });

  // elementOps: Map → array，按 fbwEditId 锚定（找回元素用）
  const ops = [];
  state.elementOps.forEach((rec, el) => {
    const id = el.dataset?.fbwEditId || null;
    if (!id) return; // 没 id 的元素无法跨刷新还原
    ops.push({ id, descriptor: rec.descriptor, ops: rec.ops });
  });

  const secFeedback = {};
  state.sectionFeedback.forEach((v, k) => { secFeedback[k] = v; });

  return {
    schemaVersion: 'fbw-singlefile-1',
    capturedAt: new Date().toISOString(),
    annotations: state.annotations,
    elementOps: ops,
    sectionFeedback: secFeedback,
    attachments: state.attachments,
    edits,
    originals: Array.from(state.originals.entries()),
    originalsHTML: Array.from(state.originalsHTML.entries()),
    globalNote: state.panel?.querySelector('[data-fbw-global]')?.value || '',
  };
}

function injectModeMeta(root, mode) {
  const head = root.querySelector('head');
  if (!head) return;
  const meta = root.createElement('meta');
  meta.setAttribute('name', 'fbw-export-mode');
  meta.setAttribute('content', mode);
  head.appendChild(meta);
}

function injectStateScript(root, payload) {
  const body = root.querySelector('body') || root;
  const script = root.createElement('script');
  script.type = 'application/json';
  script.setAttribute('data-fbw-state', '1');
  script.textContent = JSON.stringify(payload);
  body.appendChild(script);
}

function injectBundle(root, bundleText) {
  const body = root.querySelector('body') || root;
  const script = root.createElement('script');
  script.textContent = bundleText;
  body.appendChild(script);
}

function download(html, name) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function suggestFilename(mode) {
  const base = (document.title || 'page').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
  const ts = new Date().toISOString().slice(0, 10);
  const suffix = mode === 'readonly' ? '-readonly' : '';
  return `${base}-${ts}-redline${suffix}.html`;
}
