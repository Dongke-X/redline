// 审计模式：按 A 键打开/关闭，所有已改动的元素描红+标 op 数量，
// 方便最后一眼"我这次都改了啥"。
// 借鉴 Cmd+A 的"全选"语义，但 redline 没"选所有"概念，改造成"看所有改动"。
import { state } from '../core/state.js';
import { getText } from '../core/elements.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

// 元素的「主要 op」—— 用来决定描边颜色。多个 op 同时存在时按破坏性排序取最高优先级。
const OP_PRIORITY = ['delete', 'hide', 'replace-img', 'tag', 'font', 'highlight', 'scale', 'rotate', 'move', 'href'];

function primaryOp(ops, hasTextEdit) {
  for (const p of OP_PRIORITY) {
    if (ops.some(o => o.op === p)) return p;
  }
  return hasTextEdit ? 'text' : (ops[0]?.op || null);
}

function markChanged() {
  // 先标记所有文字改动元素到一个集合，方便和 op 改动合并
  const textChanged = new Set();
  document.querySelectorAll('[data-fbw-edit-id]').forEach(el => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    if (orig !== undefined && orig !== getText(el)) textChanged.add(el);
  });

  // 合并：文字 + op
  const allChanged = new Set(textChanged);
  state.elementOps.forEach((rec, el) => {
    if (document.contains(el) && rec.ops?.length) allChanged.add(el);
  });

  allChanged.forEach(el => {
    const rec = state.elementOps.get(el);
    const ops = rec?.ops || [];
    const hasText = textChanged.has(el);
    const op = primaryOp(ops, hasText);
    el.classList.add('fbw-audit-changed');
    if (op) el.setAttribute('data-fbw-audit-op', op);
    const count = ops.length + (hasText ? 1 : 0);
    if (count > 0) el.setAttribute('data-fbw-audit-count', String(count));
  });
}

function unmarkChanged() {
  document.querySelectorAll('.fbw-audit-changed').forEach(el => {
    el.classList.remove('fbw-audit-changed');
    el.removeAttribute('data-fbw-audit-count');
    el.removeAttribute('data-fbw-audit-op');
    el.removeAttribute('data-fbw-audit-kind');
  });
}

export function toggleAudit() {
  const on = document.body.classList.toggle('fbw-audit-mode');
  if (on) {
    markChanged();
    const count = document.querySelectorAll('.fbw-audit-changed').length;
    showToast(count
      ? (t('audit.on', { n: count }) || `审计模式 · ${count} 处改动`)
      : (t('audit.empty') || '审计模式 · 没有改动')
    );
  } else {
    unmarkChanged();
    showToast(t('audit.off') || '审计模式关闭');
  }
}

export function refreshAuditIfOn() {
  if (!document.body.classList.contains('fbw-audit-mode')) return;
  unmarkChanged();
  markChanged();
}
