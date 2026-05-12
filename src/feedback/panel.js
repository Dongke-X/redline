// 反馈面板：toggle / 复制 / 下载备份 / 清空。
import { state } from '../core/state.js';
import { getText, getChanges } from '../core/elements.js';
import { scheduleSave, saveState, clearStoredState } from '../core/persist.js';
import { buildMarkdown } from '../export/markdown.js';
import { renderAttachments } from './attachments.js';
import { deselectElement } from '../edit/selection.js';
import { showToast, updateCounter } from '../utils.js';
import { t, toggleLocale } from '../i18n.js';
import { captureViewport } from './screenshot.js';
import { exportSingleFile } from '../export/singlefile.js';

export function toggleFbPanel() {
  state.panel.classList.toggle('fbw-open');
  const isOpen = state.panel.classList.contains('fbw-open');
  if (state.fbToggleBtn) state.fbToggleBtn.classList.toggle('fbw-active', isOpen);
  state.fbFab.classList.toggle('fbw-active', isOpen);
  if (isOpen) {
    document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
      const id = el.dataset.fbwEditId;
      el.classList.toggle('fbw-changed', state.originals.get(id) !== getText(el));
    });
    updateCounter(getChanges);
    scheduleSave();
    if (state.currentSec) {
      // re-trigger to refresh "已存" tag
      const secId = state.currentSec.dataset.fbwSecId;
      const existing = state.sectionFeedback.get(secId);
      state.panel.querySelector('[data-fbw-saved]').classList.toggle('fbw-on', !!existing);
    }
  }
}

export function attachPanelEvents() {
  // 关闭按钮
  state.panel.querySelector('[data-fbw-close]').addEventListener('click', (e) => {
    e.stopPropagation();
    state.panel.classList.remove('fbw-open');
    if (state.fbToggleBtn) state.fbToggleBtn.classList.remove('fbw-active');
    state.fbFab.classList.remove('fbw-active');
  });
  state.fbFab.addEventListener('click', toggleFbPanel);

  // 语言切换按钮
  const localeBtn = state.panel.querySelector('[data-fbw-locale]');
  if (localeBtn) {
    localeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLocale();
    });
  }

  // 截屏按钮：抓当前视口扔进 attachments
  const shotBtn = state.panel.querySelector('[data-fbw-shot]');
  if (shotBtn) {
    shotBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 截屏前关闭面板，避免 widget 浮窗出现在截图里。html2canvas 还有 fbw-printing 兜底隐藏。
      const wasOpen = state.panel.classList.contains('fbw-open');
      if (wasOpen) state.panel.classList.remove('fbw-open');
      captureViewport().finally(() => {
        if (wasOpen) state.panel.classList.add('fbw-open');
      });
    });
  }

  // 导出 single-file HTML：click = 可编辑模式（默认）；Shift+click = 只读模式
  const exportHtmlBtn = state.panel.querySelector('[data-fbw-export-html]');
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportSingleFile({ mode: e.shiftKey ? 'readonly' : 'editable' });
    });
  }

  // 复制反馈
  state.panel.querySelector('[data-fbw-action="copy"]').addEventListener('click', () => {
    const md = buildMarkdown();
    navigator.clipboard.writeText(md)
      .then(() => showToast(t('panel.copy')))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = md; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        showToast(t('panel.copy.fallback'));
      });
  });

  // 清空所有反馈（带二次确认）
  state.panel.querySelector('[data-fbw-clear-all]').addEventListener('click', (e) => {
    e.stopPropagation();
    state.confirmDialog.classList.add('fbw-on');
  });
  state.confirmDialog.querySelector('[data-fbw-confirm-cancel]').addEventListener('click', () => {
    state.confirmDialog.classList.remove('fbw-on');
  });
  state.confirmDialog.querySelector('[data-fbw-confirm-ok]').addEventListener('click', () => {
    state.sectionFeedback.clear();
    state.attachments.length = 0;
    state.annotations.length = 0;
    document.querySelectorAll('.fbw-anno').forEach(n => n.remove());
    renderAttachments();
    state.panel.querySelector('[data-fbw-global]').value = '';
    state.panel.querySelector('[data-fbw-current-text]').value = '';
    state.panel.querySelector('[data-fbw-saved]').classList.remove('fbw-on');
    document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
      const id = el.dataset.fbwEditId;
      const orig = state.originals.get(id);
      if (orig !== undefined && getText(el) !== orig) {
        el.innerText = orig;
        el.classList.remove('fbw-changed');
      }
    });
    state.elementOps.forEach((_rec, el) => {
      delete el.dataset.fbwOpDeleted;
      delete el.dataset.fbwOpHidden;
      delete el.dataset.fbwTx;
      delete el.dataset.fbwTy;
      delete el.dataset.fbwScale;
      delete el.dataset.fbwRotate;
      delete el.dataset.fbwHighlight;
      el.style.transform = '';
      el.style.backgroundImage = '';
      el.style.backgroundColor = '';
      if (el.tagName === 'IMG' && el.dataset.fbwOriginalSrc) {
        el.src = el.dataset.fbwOriginalSrc;
        delete el.dataset.fbwOriginalSrc;
      }
    });
    state.elementOps.clear();
    deselectElement();
    clearStoredState();
    updateCounter(getChanges);
    state.confirmDialog.classList.remove('fbw-on');
    showToast(t('panel.cleared'));
  });

  // 离开页面前最后保存一次
  window.addEventListener('beforeunload', saveState);
}
