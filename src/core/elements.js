// 元素注册、变换状态、操作记录、变更检测。
// 所有函数共享 state.originals / state.elementOps（见 state.js）。
import { state } from './state.js';
import { EDITABLE_SELECTORS, SECTION_SELECTORS } from '../config.js';
import { updateCounter } from '../utils.js';

/**
 * @typedef {import('../types.js').OpType} OpType
 * @typedef {import('../types.js').Op} Op
 */

let idCounter = 0;
let secCounter = 0;

export function isCandidate(el) {
  if (!el) return false;
  if (el.closest('.fbw-panel, .fbw-fab, .fbw-toast, .fbw-confirm, script, style, button, [data-fbw-noedit]')) return false;
  if (el.matches('button, br, img, svg, path, use, a[href]')) return false;
  if (el.dataset.fbwEditId) return false;
  if (!el.textContent.trim()) return false;
  return true;
}

// 用 textContent + 仅 trim 头尾（保留中间换行/空格，这些用户可能有意改动）。
// 不归一化中间 \s 是为了让"加空格"和"加换行"也能被识别为改动。
export function getText(el) {
  return (el.textContent || '').replace(/^\s+|\s+$/g, '');
}

function register(el) {
  if (!isCandidate(el)) return;
  const id = 'fbw-e-' + (idCounter++);
  el.dataset.fbwEditId = id;
  state.originals.set(id, getText(el));
  // 多存一份 innerHTML，给 compare 模式还原内部 markup（em/strong/br/...）
  state.originalsHTML.set(id, el.innerHTML);
}

// 扫描页面：标记所有 section 的 fbw-sec-id/label，注册所有可编辑元素。
// 任意网页降级：SECTION_SELECTORS 不匹配时，优先选 <main> / <article> / [role=main]，
// 都没有再退到 body。这样在大型 SPA 里能聚焦"主内容区"，不被全局菜单干扰。
export function registerEditableElements() {
  let sections = Array.from(document.querySelectorAll(SECTION_SELECTORS));
  if (sections.length === 0) {
    const fallback = document.querySelector('main, [role="main"], article') || document.body;
    sections = [fallback];
  }
  sections.forEach((sec) => {
    if (!sec.dataset.fbwSecId) {
      sec.dataset.fbwSecId = 'fbw-sec-' + (secCounter++);
    }
    const label = (sec.dataset.screenLabel
      || sec.dataset.fbwLabel
      || sec.querySelector('.label')?.innerText
      || sec.querySelector('h1, h2')?.innerText
      || ((sec === document.body || sec.tagName === 'MAIN' || sec.tagName === 'ARTICLE') ? (document.title || 'Page') : ('Section ' + secCounter))).trim();
    sec.dataset.fbwSecLabel = label.slice(0, 80);
  });

  document.querySelectorAll(EDITABLE_SELECTORS).forEach(register);
  // 叶子扫描兜底：仅在「明确匹配到 SECTION_SELECTORS」时跑（deck/proposal 这种结构化场景）。
  // body 降级模式下不跑，避免在任意网页上把菜单/icon/span 全注册成可编辑导致误触。
  // 用 TreeWalker 单趟遍历，比 N 个 querySelectorAll('*') 快一个数量级（DOM 大时 200ms → 20ms）
  const isFallback = sections.length === 1 && sections[0] === document.body;
  if (!isFallback) {
    sections.forEach(sec => {
      const walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
          if (node.children.length > 0) return NodeFilter.FILTER_SKIP;
          if (node.dataset && node.dataset.fbwEditId) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      let n;
      while ((n = walker.nextNode())) register(n);
    });
  }

  // 暴露 originals 到 window 方便 console 调试
  if (typeof window !== 'undefined') window.__fbwOriginals = state.originals;
  return sections;
}

export function getElDescriptor(el) {
  const sec = el.closest('[data-fbw-sec-id]');
  const secLabel = sec?.dataset.fbwSecLabel || '?';
  const tag = el.tagName.toLowerCase();
  const cls = [...el.classList].filter(c => !c.startsWith('fbw-')).slice(0, 2).join('.');
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
  return `[${secLabel}] · ${tag}${cls ? '.' + cls : ''}${text ? ` · "${text}"` : ''}`;
}

/**
 * 清理 elementOps 里已脱离 document 的元素引用，防止长期 SPA 场景下内存泄漏。
 * 在每次 recordOp / getChanges 时顺手跑，O(n) where n = entry 数量，通常很小。
 */
export function pruneStaleElementOps() {
  let removed = 0;
  state.elementOps.forEach((_rec, el) => {
    if (!document.contains(el)) {
      state.elementOps.delete(el);
      removed++;
    }
  });
  return removed;
}

/**
 * 给某个元素记录一个操作。同 type 的旧记录会被新的覆盖（一个元素只保留一份 move/scale/...）。
 * 评审模式下自动打 proposed: true 标记，apply-feedback 不会自动 patch。
 * @param {HTMLElement} el
 * @param {OpType} op
 * @param {Object} [args]
 */
export function recordOp(el, op, args) {
  if (!state.elementOps.has(el)) {
    state.elementOps.set(el, { ops: [], descriptor: getElDescriptor(el) });
  }
  const rec = state.elementOps.get(el);
  rec.ops = rec.ops.filter(o => o.op !== op);
  /** @type {Op} */
  const opObj = { op };
  if (args !== undefined) opObj.args = args;
  if (state.appMode === 'review') opObj.proposed = true;
  rec.ops.push(opObj);
  updateCounter(getChanges);
}

export function clearOpsOn(el) {
  state.elementOps.delete(el);
  updateCounter(getChanges);
}

// 元素级反馈：以 op='note' 形式存进 elementOps，patchSource 会跳过它（feedback 不动源）
export function recordNote(el, note) {
  const trimmed = (note || '').trim();
  if (!state.elementOps.has(el)) {
    if (!trimmed) return;
    state.elementOps.set(el, { ops: [], descriptor: getElDescriptor(el) });
  }
  const rec = state.elementOps.get(el);
  rec.ops = rec.ops.filter(o => o.op !== 'note');
  if (trimmed) rec.ops.push({ op: 'note', args: { text: trimmed } });
  if (rec.ops.length === 0) state.elementOps.delete(el);
  updateCounter(getChanges);
}

export function getElementNote(el) {
  const rec = state.elementOps.get(el);
  if (!rec) return '';
  const noteOp = rec.ops.find(o => o.op === 'note');
  return noteOp?.args?.text || '';
}

export function getElTransform(el) {
  return {
    x: parseFloat(el.dataset.fbwTx || '0'),
    y: parseFloat(el.dataset.fbwTy || '0'),
    scale: parseFloat(el.dataset.fbwScale || '1'),
    rotate: parseFloat(el.dataset.fbwRotate || '0'),
  };
}

export function setElTransform(el, t) {
  el.dataset.fbwTx = t.x;
  el.dataset.fbwTy = t.y;
  el.dataset.fbwScale = t.scale;
  el.dataset.fbwRotate = t.rotate || 0;
  const parts = [];
  if (t.x !== 0 || t.y !== 0) parts.push(`translate(${t.x}px, ${t.y}px)`);
  if (t.rotate) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scale !== 1) parts.push(`scale(${t.scale})`);
  el.style.transform = parts.join(' ');
}

export function getChanges() {
  // 顺手清掉离开 DOM 的 elementOps（防 SPA / 虚拟列表内存泄漏）
  pruneStaleElementOps();
  const changes = [];
  // 只查带 fbwEdited 标记的元素（即用户主动进过文字编辑模式的）。
  // 避免 JS 自动更新文本的元素（时钟、tick 计数、轮播 banner...）被误判成 edit。
  document.querySelectorAll('[data-fbw-edit-id][data-fbw-edited]').forEach((el) => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    const now = getText(el);
    if (orig !== now) {
      const sec = el.closest('[data-fbw-sec-id]');
      changes.push({ id, before: orig, after: now, section: sec?.dataset.fbwSecLabel || '?' });
    }
  });
  return changes;
}
