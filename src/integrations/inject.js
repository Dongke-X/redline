// deck-stage overlay 注入：检测到 <deck-stage> 后把按钮塞到 shadow DOM 内的 .overlay。
// 没有 deck-stage 时退化为右下角 FAB（CSS 控制，body.fbw-no-overlay 类切换）。
import { state } from '../core/state.js';
import { ICON_PENCIL, ICON_CHAT, ICON_SHARE, ICON_BOLT, ICON_MARQUEE, ICON_KEYBOARD } from '../assets/icons.js';
import { toggleEdit, deselectElement } from '../edit/selection.js';
import { toggleFbPanel } from '../feedback/panel.js';
import { exportPDF } from '../export/pdf.js';
import { runPatchSource, clearSourceDir } from '../feedback/patchSource.js';
import { toggleMarqueeMode } from '../edit/marquee.js';
import { toggleHelpPopover } from '../feedback/help.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

export function injectIntoOverlay() {
  const ds = document.querySelector('deck-stage');
  if (!ds || !ds.shadowRoot) { setTimeout(injectIntoOverlay, 80); return; }
  const overlay = ds.shadowRoot.querySelector('.overlay');
  if (!overlay) { setTimeout(injectIntoOverlay, 80); return; }
  if (overlay.querySelector('[data-fbw-btn]')) return;

  const reset = overlay.querySelector('.reset');
  const div1 = document.createElement('span'); div1.className = 'divider';
  const editBtn = document.createElement('button');
  editBtn.className = 'btn'; editBtn.dataset.fbwBtn = 'edit'; editBtn.type = 'button';
  editBtn.dataset.tooltip = t('overlay.edit');
  editBtn.setAttribute('aria-label', t('overlay.edit'));
  editBtn.innerHTML = ICON_PENCIL.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleEdit(); });

  // 保存编辑（紧挨编辑铅笔）—— 仅在编辑模式 + 有改动时显示
  const saveEditBtn = document.createElement('button');
  saveEditBtn.className = 'btn'; saveEditBtn.dataset.fbwBtn = 'save-edit'; saveEditBtn.type = 'button';
  saveEditBtn.dataset.tooltip = t('overlay.save');
  saveEditBtn.setAttribute('aria-label', t('overlay.save'));
  saveEditBtn.innerHTML = ICON_BOLT.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"')
    + '<span class="fbw-edit-count">0</span>';
  saveEditBtn.addEventListener('click', (e) => { e.stopPropagation(); runPatchSource(); });
  saveEditBtn.addEventListener('contextmenu', async (e) => {
    e.preventDefault(); e.stopPropagation();
    await clearSourceDir();
    showToast(t('patch.dirCleared'));
  });
  state.saveEditBtn = saveEditBtn;

  const div2 = document.createElement('span'); div2.className = 'divider';
  const fbBtn = document.createElement('button');
  fbBtn.className = 'btn'; fbBtn.dataset.fbwBtn = 'feedback'; fbBtn.type = 'button';
  fbBtn.dataset.tooltip = t('overlay.feedback');
  fbBtn.setAttribute('aria-label', t('overlay.feedback'));
  fbBtn.innerHTML = ICON_CHAT.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
  fbBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFbPanel(); });

  const div3 = document.createElement('span'); div3.className = 'divider';

  // 框选标注按钮（导出左边）
  const marqueeBtn = document.createElement('button');
  marqueeBtn.className = 'btn'; marqueeBtn.dataset.fbwBtn = 'marquee'; marqueeBtn.type = 'button';
  marqueeBtn.dataset.tooltip = t('overlay.marquee');
  marqueeBtn.setAttribute('aria-label', t('overlay.marquee'));
  marqueeBtn.innerHTML = ICON_MARQUEE.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
  marqueeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMarqueeMode(); });
  state.marqueeToggleBtn = marqueeBtn;

  const div4 = document.createElement('span'); div4.className = 'divider';
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn'; exportBtn.dataset.fbwBtn = 'export'; exportBtn.type = 'button';
  exportBtn.dataset.tooltip = t('overlay.export');
  exportBtn.setAttribute('aria-label', t('overlay.export'));
  exportBtn.innerHTML = ICON_SHARE.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
  exportBtn.addEventListener('click', (e) => { e.stopPropagation(); exportPDF({ image: e.shiftKey }, deselectElement); });

  const div5 = document.createElement('span'); div5.className = 'divider';
  const helpBtn = document.createElement('button');
  helpBtn.className = 'btn'; helpBtn.dataset.fbwBtn = 'help'; helpBtn.type = 'button';
  helpBtn.dataset.tooltip = t('overlay.help');
  helpBtn.setAttribute('aria-label', t('overlay.help'));
  helpBtn.innerHTML = ICON_KEYBOARD.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
  helpBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleHelpPopover(helpBtn); });
  state.helpToggleBtn = helpBtn;

  if (reset) reset.after(div1, editBtn, saveEditBtn, div2, fbBtn, div3, marqueeBtn, div4, exportBtn, div5, helpBtn);
  else overlay.append(div1, editBtn, saveEditBtn, div2, fbBtn, div3, marqueeBtn, div4, exportBtn, div5, helpBtn);
  state.editToggleBtn = editBtn;
  state.fbToggleBtn = fbBtn;

  const sty = document.createElement('style');
  sty.textContent = `
    .btn[data-fbw-btn].fbw-active {
      color: #dc3c3c !important;
    }
  `;
  ds.shadowRoot.appendChild(sty);

  document.body.classList.remove('fbw-no-overlay');
}
