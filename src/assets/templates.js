// Panel / 确认弹窗 / 元素工具栏 的 HTML 模板。
// 改成函数形式，运行时调用 t() 取 i18n 字符串。
import {
  ICON_CHAT, ICON_TRASH, ICON_CAMERA, ICON_COPY, ICON_SAVE, ICON_GLOBE, ICON_LINK,
  ICON_FONT, ICON_MARKER, ICON_IMAGE, ICON_HEADING,
  ICON_EYEDROPPER, ICON_SLIDERS, ICON_DOWNLOAD,
  ICON_ARROW_UP, ICON_ARROW_DOWN, ICON_ARROW_LEFT, ICON_ARROW_RIGHT,
  ICON_PLUS, ICON_MINUS,
  ICON_EYE_OFF, ICON_RESTORE, ICON_X,
} from './icons.js';
import { t, getLocale } from '../i18n.js';

export function panelHTML() {
  const cur = getLocale();
  const nextLang = cur === 'zh' ? t('panel.localeName.en') : t('panel.localeName.zh');
  return `
    <div class="fbw-head">
      <span class="fbw-head-title">${ICON_CHAT}<span>${t('panel.title')}</span></span>
      <span class="fbw-head-actions">
        <button class="fbw-icon-btn" data-fbw-shot data-tooltip="${t('panel.btn.shot.title')}">${ICON_CAMERA}</button>
        <button class="fbw-icon-btn" data-fbw-export-html data-tooltip="${t('panel.btn.exportHtml.title')}">${ICON_DOWNLOAD}</button>
        <button class="fbw-icon-btn" data-fbw-locale data-tooltip="${t('panel.btn.locale.title', { lang: nextLang })}">${ICON_GLOBE}</button>
        <button class="fbw-icon-btn fbw-danger" data-fbw-clear-all data-tooltip="${t('panel.btn.clearAll')}">${ICON_TRASH}</button>
        <button class="fbw-icon-btn" data-fbw-close data-tooltip="${t('panel.btn.close')}">−</button>
      </span>
    </div>
    <div class="fbw-row">
      <span class="fbw-mode-chip"></span>
      <span class="fbw-pill">${t('panel.pill.edit')} <span data-fbw-counter="edit">0</span></span>
      <span class="fbw-pill">${t('panel.pill.section')} <span data-fbw-counter="sec">0</span></span>
      <span class="fbw-pill">${t('panel.pill.element')} <span data-fbw-counter="ops">0</span></span>
      <span class="fbw-pill">${ICON_CAMERA}<span data-fbw-counter="att">0</span></span>
    </div>
    <div class="fbw-current">
      <div class="fbw-current-label">${t('panel.current')} <span class="fbw-saved-tag" data-fbw-saved>${t('panel.saved')}</span></div>
      <div class="fbw-current-page" data-fbw-current-page>—</div>
      <textarea class="fbw-textarea fbw-current-text" data-fbw-current-text placeholder="${t('panel.placeholder.current')}"></textarea>
    </div>
    <textarea class="fbw-textarea fbw-global" data-fbw-global placeholder="${t('panel.placeholder.global')}"></textarea>
    <div class="fbw-attachments" data-fbw-attachments></div>
    <div class="fbw-row">
      <button class="fbw-btn fbw-primary" data-fbw-action="save" data-tooltip="${t('panel.btn.save.title')}">${ICON_SAVE}<span>${t('panel.btn.save')}</span></button>
      <button class="fbw-btn" data-fbw-action="copy" data-tooltip="${t('panel.btn.copy.title')}">${ICON_COPY}<span>${t('panel.btn.copy')}</span></button>
    </div>
  `;
}

export function confirmHTML() {
  return `
    <div class="fbw-confirm-box">
      <div class="fbw-confirm-title">${t('clearAll.title')}</div>
      <div class="fbw-confirm-desc">${t('clearAll.desc')}</div>
      <div class="fbw-confirm-actions">
        <button class="fbw-btn fbw-btn-cancel" data-fbw-confirm-cancel>${t('common.cancel')}</button>
        <button class="fbw-btn fbw-primary" data-fbw-confirm-ok>${t('clearAll.confirm')}</button>
      </div>
    </div>
  `;
}

export function toolbarHTML() {
  return `
    <span class="fbw-tb-label" data-fbw-path title=""></span>
    <span class="fbw-tb-divider" data-fbw-path-divider></span>
    <button data-op="font" data-tooltip="${t('tip.font')}">${ICON_FONT}</button>
    <button data-op="tag" data-tooltip="${t('tip.tag')}" style="display:none;">${ICON_HEADING}</button>
    <button data-op="highlight" data-tooltip="${t('tip.highlight')}">${ICON_MARKER}</button>
    <button data-op="pick" data-tooltip="${t('tip.pick')}">${ICON_EYEDROPPER}</button>
    <button data-op="style" data-tooltip="${t('tip.style')}">${ICON_SLIDERS}</button>
    <button data-op="replace-img" data-tooltip="${t('tip.replaceImg')}" style="display:none;">${ICON_IMAGE}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="move-up" data-tooltip="${t('tip.moveUp')}">${ICON_ARROW_UP}</button>
    <button data-op="move-down" data-tooltip="${t('tip.moveDown')}">${ICON_ARROW_DOWN}</button>
    <button data-op="move-left" data-tooltip="${t('tip.moveLeft')}">${ICON_ARROW_LEFT}</button>
    <button data-op="move-right" data-tooltip="${t('tip.moveRight')}">${ICON_ARROW_RIGHT}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="zoom-in" data-tooltip="${t('tip.zoomIn')}">${ICON_PLUS}</button>
    <button data-op="zoom-out" data-tooltip="${t('tip.zoomOut')}">${ICON_MINUS}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="link" data-tooltip="${t('tip.link')}" style="display:none;">${ICON_LINK}</button>
    <button data-op="note" data-tooltip="${t('tip.note')}">${ICON_CHAT}</button>
    <button data-op="hide" data-tooltip="${t('tip.hide')}" class="fbw-danger">${ICON_EYE_OFF}</button>
    <button data-op="delete" data-tooltip="${t('tip.delete')}" class="fbw-danger">${ICON_TRASH}</button>
    <button data-op="restore" data-tooltip="${t('tip.restore')}" class="fbw-restore">${ICON_RESTORE}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="close" data-tooltip="${t('tip.close')}">${ICON_X}</button>
  `;
}

export function notePopoverHTML() {
  return `
    <div class="fbw-note-head">
      <span class="fbw-note-label">${t('note.title')}</span>
      <button class="fbw-note-close" data-fbw-note-close>${ICON_X}</button>
    </div>
    ${designTagBar()}
    <textarea class="fbw-note-textarea" data-fbw-note-text placeholder="${t('note.placeholder')}"></textarea>
  `;
}

// design 分类 chip 行（间距/颜色/字号/排版/文案），prepended 到反馈文本前
function designTagBar() {
  // 用动态 import 风格的延迟解析会很麻烦；这里复用 buildTagBarHTML
  return `<div class="fbw-design-tags" data-fbw-tags>` +
    [
      ['spacing', t('design.tag.spacing')],
      ['color', t('design.tag.color')],
      ['typography', t('design.tag.typography')],
      ['layout', t('design.tag.layout')],
      ['copy', t('design.tag.copy')],
    ].map(([key, label]) => `<button class="fbw-design-tag" type="button" data-fbw-tag="${key}">${label}</button>`).join('') +
    `</div>`;
}
