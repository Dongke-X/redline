// 快捷键 / 帮助弹窗：点 ⌨ FAB 显示，再点关闭。内容跟着 i18n 走。
import { state } from '../core/state.js';
import { t } from '../i18n.js';
import { onResize } from '../utils/events.js';

function platformCmdLabel() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return isMac ? '⌘' : 'Ctrl';
}

function row(keys, label) {
  // keys 可以是数组 ['Shift', 'P'] 表示组合键，单键直接传字符串
  const arr = Array.isArray(keys) ? keys : [keys];
  const kbds = arr.map(k => `<kbd>${k}</kbd>`).join('');
  return `<div class="fbw-help-row">${kbds} <span>${label}</span></div>`;
}

export function buildHelpPopoverHTML() {
  const cmd = platformCmdLabel();
  return `
    <div class="fbw-help-title">${t('help.title')}</div>
    <div class="fbw-help-cols">
      <div class="fbw-help-col">
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${t('help.group.modes')}</div>
          ${row('E', t('help.shortcut.edit'))}
          ${row('F', t('help.shortcut.feedback'))}
          ${row('M', t('help.shortcut.marquee'))}
        </div>
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${t('help.group.actions')}</div>
          ${row('Esc', t('help.shortcut.cancel'))}
          ${row([cmd, 'S'], t('help.shortcut.save'))}
          ${row([cmd, 'M'], t('help.shortcut.copy'))}
          ${row([cmd, 'Z'], t('help.shortcut.undo'))}
          ${row([cmd, 'Shift', 'Z'], t('help.shortcut.redo'))}
          ${row([cmd, 'C'], t('help.shortcut.copyDescriptor'))}
          ${row('A', t('help.shortcut.audit'))}
          ${row('O', t('help.shortcut.compare'))}
          ${row(['Alt', 'hover'], t('help.shortcut.measure'))}
          ${row(['Shift', 'click'], t('help.shortcut.multiSelect'))}
          ${row('drag', t('help.shortcut.rubberBand'))}
        </div>
      </div>
      <div class="fbw-help-col">
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${t('help.group.export')}</div>
          ${row(['Space', 'P'], t('help.shortcut.pdfVector'))}
          ${row(['Shift', 'P'], t('help.shortcut.pdfImage'))}
        </div>
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${t('help.group.misc')}</div>
          ${row('?', t('help.shortcut.help'))}
        </div>
      </div>
    </div>
  `;
}

function positionHelpPopover() {
  if (!state.helpPopover) return;
  const anchor = state.helpToggleBtn || state.helpFab;
  if (!anchor) return;
  const fabRect = anchor.getBoundingClientRect();
  const popover = state.helpPopover;
  // 内容超出视口高度时给 popover 加滚动条 + 限高，避免单列把整个屏幕吃掉
  const vh = window.innerHeight;
  const maxH = vh - 24;
  popover.style.maxHeight = maxH + 'px';
  popover.style.overflowY = 'auto';
  const ttRect = popover.getBoundingClientRect();
  let left = fabRect.left + fabRect.width / 2 - ttRect.width / 2;
  let top = fabRect.top - ttRect.height - 12;
  if (left < 8) left = 8;
  if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
  // 顶上放不下 → 改放下面；下面也放不下 → 贴顶部 + 在视口内滚动
  if (top < 8) top = fabRect.bottom + 12;
  if (top + ttRect.height > vh - 8) {
    top = Math.max(8, vh - ttRect.height - 8);
  }
  popover.style.left = left + 'px';
  popover.style.top = top + 'px';
}

export function toggleHelpPopover() {
  const popover = state.helpPopover;
  if (!popover) return;
  if (popover.classList.contains('fbw-on')) {
    popover.classList.remove('fbw-on');
    return;
  }
  popover.innerHTML = buildHelpPopoverHTML();
  popover.classList.add('fbw-on');
  // 等下一帧再 position（让 popover 渲染出尺寸）
  requestAnimationFrame(() => positionHelpPopover());
}

export function closeHelpPopover() {
  if (state.helpPopover) state.helpPopover.classList.remove('fbw-on');
}

export function attachHelpEvents() {
  // 点 popover 外面关闭。deck-stage 的按钮在 shadow DOM 里，e.target 会被重定向到
  // deck-stage host，所以也要走 composedPath() 检查。
  document.addEventListener('mousedown', (e) => {
    const popover = state.helpPopover;
    if (!popover || !popover.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-help-popover, .fbw-help-fab, [data-fbw-btn="help"]')) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (path.some(n => n && n.dataset && n.dataset.fbwBtn === 'help')) return;
    if (path.some(n => n && n.classList && n.classList.contains('fbw-help-popover'))) return;
    closeHelpPopover();
  }, true);

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.helpPopover?.classList.contains('fbw-on')) {
      closeHelpPopover();
    }
  });

  // 滚动 / resize 时重新定位（保持在 FAB 上方）
  onResize(() => {
    if (state.helpPopover?.classList.contains('fbw-on')) positionHelpPopover();
  });
}
