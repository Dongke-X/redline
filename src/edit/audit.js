// 审计模式：按 A 键打开/关闭，所有已改动的元素描红+标 op 数量，
// 方便最后一眼"我这次都改了啥"。
// 借鉴 Cmd+A 的"全选"语义，但 redline 没"选所有"概念，改造成"看所有改动"。
import { state } from '../core/state.js';
import { getText } from '../core/elements.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

function markChanged() {
  // 文字改动
  document.querySelectorAll('[data-fbw-edit-id]').forEach(el => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    if (orig !== undefined && orig !== getText(el)) {
      el.classList.add('fbw-audit-changed');
      el.setAttribute('data-fbw-audit-kind', 'text');
    }
  });
  // op 改动
  state.elementOps.forEach((rec, el) => {
    if (!document.contains(el) || !rec.ops?.length) return;
    el.classList.add('fbw-audit-changed');
    el.setAttribute('data-fbw-audit-count', String(rec.ops.length));
    el.setAttribute('data-fbw-audit-kind', el.getAttribute('data-fbw-audit-kind') ? 'mixed' : 'ops');
  });
}

function unmarkChanged() {
  document.querySelectorAll('.fbw-audit-changed').forEach(el => {
    el.classList.remove('fbw-audit-changed');
    el.removeAttribute('data-fbw-audit-count');
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
