// 导出菜单：点 FAB 上的上传图标 → 弹一个 4 选项小菜单。
// PDF（矢量 / 长图）跟 HTML（可编辑 / 只读）一起放，都是「给人看」的导出。
// 反馈面板的下载按钮挪掉了 —— 反馈面板专门做跟 agent 的交互。
import { state } from '../core/state.js';
import { exportPDF } from './pdf.js';
import { exportSingleFile } from './singlefile.js';
import { deselectElement } from '../edit/selection.js';
import { t } from '../i18n.js';

let menu = null;

export function createExportMenuNode() {
  menu = document.createElement('div');
  menu.className = 'fbw-export-menu';
  menu.innerHTML = `
    <div class="fbw-export-group">
      <div class="fbw-export-group-label">PDF</div>
      <button class="fbw-export-item" data-export="pdf-vector">
        <span class="fbw-export-name">${t('export.pdf.vector') || '矢量 PDF'}</span>
        <span class="fbw-export-hint">${t('export.pdf.vector.hint') || '可缩放 · 链接保留'}</span>
      </button>
      <button class="fbw-export-item" data-export="pdf-image">
        <span class="fbw-export-name">${t('export.pdf.image') || '长图 PDF'}</span>
        <span class="fbw-export-hint">${t('export.pdf.image.hint') || '整页一张超长图'}</span>
      </button>
    </div>
    <div class="fbw-export-group">
      <div class="fbw-export-group-label">HTML</div>
      <button class="fbw-export-item" data-export="html-editable">
        <span class="fbw-export-name">${t('export.html.editable') || '可编辑 HTML'}</span>
        <span class="fbw-export-hint">${t('export.html.editable.hint') || '接收方可继续标注'}</span>
      </button>
      <button class="fbw-export-item" data-export="html-readonly">
        <span class="fbw-export-name">${t('export.html.readonly') || '只读 HTML'}</span>
        <span class="fbw-export-hint">${t('export.html.readonly.hint') || '给客户演示 · 不能编辑'}</span>
      </button>
    </div>
  `;
  return menu;
}

function positionMenu() {
  if (!menu || !state.exportFab) return;
  const fabRect = state.exportFab.getBoundingClientRect();
  const mw = menu.offsetWidth || 240;
  const mh = menu.offsetHeight || 180;
  let top = fabRect.top - mh - 8;
  let left = fabRect.left + fabRect.width / 2 - mw / 2;
  if (left < 8) left = 8;
  if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
  if (top < 8) top = fabRect.bottom + 8;
  menu.style.top = top + 'px';
  menu.style.left = left + 'px';
}

export function openExportMenu() {
  if (!menu) return;
  menu.classList.add('fbw-on');
  requestAnimationFrame(positionMenu);
}

export function closeExportMenu() {
  if (menu) menu.classList.remove('fbw-on');
}

export function attachExportMenuEvents() {
  if (!menu) return;
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-export]');
    if (!btn) return;
    e.stopPropagation();
    const key = btn.dataset.export;
    closeExportMenu();
    if (key === 'pdf-vector') exportPDF({ image: false }, deselectElement);
    else if (key === 'pdf-image') exportPDF({ image: true }, deselectElement);
    else if (key === 'html-editable') exportSingleFile({ mode: 'editable' });
    else if (key === 'html-readonly') exportSingleFile({ mode: 'readonly' });
  });
  document.addEventListener('mousedown', (e) => {
    if (!menu.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-export-menu, .fbw-export-fab, [data-fbw-btn="export"]')) return;
    closeExportMenu();
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('fbw-on')) closeExportMenu();
  });
}
