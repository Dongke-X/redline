// 共享小工具：toast、counter 更新、模态确认。
import { state } from './core/state.js';

// 同时只显示一个 toast：新 toast 一来旧的立刻撤掉，避免堆叠 / 旧 toast 的撤销按钮误点
let currentToast = null;

// opts: { action: { label, onClick }, duration }
export function showToast(msg, opts) {
  if (currentToast && currentToast.parentNode) currentToast.remove();
  const t = document.createElement('div');
  t.className = 'fbw-toast';
  if (opts?.action) {
    const span = document.createElement('span');
    span.textContent = msg;
    t.appendChild(span);
    const btn = document.createElement('button');
    btn.className = 'fbw-toast-action';
    btn.type = 'button';
    btn.textContent = opts.action.label;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      try { opts.action.onClick(); } catch (_) {}
      if (t.parentNode) t.remove();
      if (currentToast === t) currentToast = null;
    });
    t.appendChild(btn);
  } else {
    t.textContent = msg;
  }
  currentToast = t;
  document.body.appendChild(t);
  setTimeout(() => {
    if (t.parentNode) t.remove();
    if (currentToast === t) currentToast = null;
  }, opts?.duration ?? 2400);
}

// 更新面板四个数字 pill + overlay 保存编辑按钮的 badge。
// getChanges 由 elements.js 提供，从外部传入避免循环依赖。
function setPillCount(node, n) {
  if (!node) return;
  node.textContent = n;
  const pill = node.closest('.fbw-pill');
  if (pill) pill.classList.toggle('fbw-has-count', Number(n) > 0);
}

export function updateCounter(getChangesFn) {
  if (!state.panel) return;
  const editCount = getChangesFn ? getChangesFn().length : 0;
  setPillCount(state.panel.querySelector('[data-fbw-counter="edit"]'), editCount);
  setPillCount(state.panel.querySelector('[data-fbw-counter="sec"]'), state.sectionFeedback.size);
  setPillCount(state.panel.querySelector('[data-fbw-counter="att"]'), state.attachments.length);
  const opsPill = state.panel.querySelector('[data-fbw-counter="ops"]');
  if (opsPill) setPillCount(opsPill, state.elementOps.size);

  // overlay 保存编辑按钮：有改动才显示，badge 显示总数
  if (state.saveEditBtn) {
    const total = editCount + state.elementOps.size;
    const badge = state.saveEditBtn.querySelector('.fbw-edit-count');
    if (badge) badge.textContent = total;
    state.saveEditBtn.classList.toggle('fbw-has-changes', total > 0);
  }

  // 反馈面板加上 annotations 数（合并到 sec pill 计数中）
  if (state.panel) {
    const secPill = state.panel.querySelector('[data-fbw-counter="sec"]');
    if (secPill) setPillCount(secPill, state.sectionFeedback.size + state.annotations.length);
  }

  // audit 模式开着的话，每次 counter 变都顺便刷新
  if (typeof state.onChangeHook === 'function') {
    try { state.onChangeHook(); } catch (_) {}
  }
}

export function pendingEditCount(getChangesFn) {
  return (getChangesFn ? getChangesFn().length : 0) + state.elementOps.size;
}

// 通用模态确认。choices: [{ label, value, primary?, danger?, cancel? }]
// ESC / 背景点击 = 触发 value === 'cancel' 的选项（或 null）
export function fbwConfirm({ title, desc, choices }) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fbw-confirm fbw-on';
    overlay.innerHTML = `
      <div class="fbw-confirm-box">
        <div class="fbw-confirm-title" data-fbw-c-title></div>
        <div class="fbw-confirm-desc" data-fbw-c-desc></div>
        <div class="fbw-confirm-actions" data-fbw-c-actions></div>
      </div>
    `;
    overlay.querySelector('[data-fbw-c-title]').textContent = title;
    overlay.querySelector('[data-fbw-c-desc]').textContent = desc;

    const actions = overlay.querySelector('[data-fbw-c-actions]');
    choices.forEach((c, i) => {
      const btn = document.createElement('button');
      let cls = 'fbw-btn';
      if (c.primary) cls += ' fbw-primary';
      if (c.danger) cls += ' fbw-danger';
      if (c.cancel || c.value === 'cancel') cls += ' fbw-btn-cancel';
      btn.className = cls;
      btn.dataset.fbwChoiceIdx = String(i);
      btn.textContent = c.label;
      actions.appendChild(btn);
    });

    document.body.appendChild(overlay);

    const cancelValue = () => choices.find(c => c.cancel || c.value === 'cancel')?.value ?? null;

    const cleanup = (val) => {
      overlay.classList.add('fbw-confirm-leave');
      document.removeEventListener('keydown', escHandler, true);
      setTimeout(() => { overlay.remove(); resolve(val); }, 140);
    };

    overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fbw-choice-idx]');
      if (btn) {
        cleanup(choices[parseInt(btn.dataset.fbwChoiceIdx, 10)].value);
        return;
      }
      // 背景点击 = 取消
      if (e.target === overlay) cleanup(cancelValue());
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); cleanup(cancelValue()); }
    };
    document.addEventListener('keydown', escHandler, true);
  });
}
