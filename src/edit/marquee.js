// 框选标注（marquee）：在画面上拖一个矩形框 → 写文字 / 上传图片 → 存到 session.annotations
// 不动源 HTML，纯 feedback flow。
import { state } from '../core/state.js';
import { SECTION_SELECTORS } from '../config.js';
import { onResize, onMousemove, onMouseup } from '../utils/events.js';
import { scheduleSave } from '../core/persist.js';
import { ICON_PENCIL, ICON_CHAT, ICON_CAMERA, ICON_X } from '../assets/icons.js';
import { TAGS as DESIGN_TAGS, attachTagBarEvents, paintTagBar } from './design-tags.js';

function annoTagBarHTML() {
  return `<div class="fbw-design-tags" data-fbw-tags>` +
    DESIGN_TAGS.map(tag => `<button class="fbw-design-tag" type="button" data-fbw-tag="${tag.key}">${t(tag.i18nKey)}</button>`).join('') +
    `</div>`;
}
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

/**
 * @typedef {import('../types.js').Annotation} Annotation
 * @typedef {import('../types.js').RectPct} RectPct
 */

let drawing = null;
let drawingNode = null;

// anno 拖动 / 缩放：模块级单例，避免每个 renderRegion 都 attach 全局监听导致泄漏。
// 每个 anno 在 mousedown 时把 dragState 设置成自己的 box + 几何信息。
let annoDragState = null;
let annoDragHandlersAttached = false;
function ensureAnnoDragHandlers() {
  if (annoDragHandlersAttached) return;
  annoDragHandlersAttached = true;
  onMousemove((e) => {
    const s = annoDragState;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const box = s.box;
    if (s.type === 'move') {
      box.style.left = (s.origLeft + dx) + 'px';
      box.style.top = (s.origTop + dy) + 'px';
    } else if (s.type === 'resize') {
      const minSize = 24;
      const { origLeft, origTop, origW, origH, corner } = s;
      let newL = origLeft, newT = origTop, newW = origW, newH = origH;
      if (corner.includes('e')) newW = Math.max(minSize, origW + dx);
      if (corner.includes('s')) newH = Math.max(minSize, origH + dy);
      if (corner.includes('w')) {
        const adjW = Math.max(minSize, origW - dx);
        newL = origLeft + (origW - adjW); newW = adjW;
      }
      if (corner.includes('n')) {
        const adjH = Math.max(minSize, origH - dy);
        newT = origTop + (origH - adjH); newH = adjH;
      }
      box.style.left = newL + 'px';
      box.style.top = newT + 'px';
      box.style.width = newW + 'px';
      box.style.height = newH + 'px';
    }
  });
  onMouseup(() => {
    if (!annoDragState) return;
    const persist = annoDragState.persist;
    annoDragState = null;
    if (persist) try { persist(); } catch (_) {}
  });
}

// 静默退出编辑模式（不走拦截弹窗，编辑改动保留在 localStorage / state.elementOps 里）
function quietExitEditMode() {
  if (!state.editMode) return;
  state.editMode = false;
  document.body.classList.remove('fbw-edit-mode');
  document.querySelectorAll('[data-fbw-edit-id]').forEach(el => {
    el.contentEditable = 'false';
    el.spellcheck = false;
  });
  const sel = document.querySelector('.fbw-selected');
  if (sel) sel.classList.remove('fbw-selected');
  state.selectedEl = null;
  state.elemToolbar?.classList.remove('fbw-toolbar-open');
  state.resizeHandles?.classList.remove('fbw-on');
  state.fontPicker?.classList.remove('fbw-fp-open');
  if (state.editToggleBtn) state.editToggleBtn.classList.remove('fbw-active');
  state.editFab?.classList.remove('fbw-active');
}

export function toggleMarqueeMode() {
  state.marqueeMode = !state.marqueeMode;
  // 进入框选 → 互斥地退出编辑模式（保留改动状态）
  if (state.marqueeMode && state.editMode) quietExitEditMode();

  document.body.classList.toggle('fbw-marquee-mode', state.marqueeMode);
  if (state.marqueeToggleBtn) state.marqueeToggleBtn.classList.toggle('fbw-active', state.marqueeMode);
  if (state.marqueeFab) state.marqueeFab.classList.toggle('fbw-active', state.marqueeMode);
  showToast(state.marqueeMode ? t('marquee.on') : t('marquee.off'));
}

// 给 selection.js 调用的反向 helper
export function exitMarqueeMode() {
  if (!state.marqueeMode) return;
  state.marqueeMode = false;
  document.body.classList.remove('fbw-marquee-mode');
  if (state.marqueeToggleBtn) state.marqueeToggleBtn.classList.remove('fbw-active');
}

function inDrawingZone(target) {
  if (!target) return false;
  return !target.closest('.fbw-panel, .fbw-fab, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-resize-handles, .fbw-anno, .fbw-marquee-drawing, .fbw-font-picker');
}

function findSection(centerX, centerY) {
  let bestSec = null;
  document.querySelectorAll('[data-fbw-sec-id]').forEach(sec => {
    const r = sec.getBoundingClientRect();
    if (centerX >= r.left && centerX <= r.right && centerY >= r.top && centerY <= r.bottom) {
      bestSec = sec;
    }
  });
  // 兜底：第一个 section / SECTION_SELECTORS 匹配 / body（任意网页降级）
  return bestSec || document.querySelector('[data-fbw-sec-id]') || document.querySelector(SECTION_SELECTORS) || document.body;
}

function updateDrawing(x2, y2) {
  if (!drawingNode || !drawing) return;
  const x = Math.min(drawing.startX, x2);
  const y = Math.min(drawing.startY, y2);
  const w = Math.abs(x2 - drawing.startX);
  const h = Math.abs(y2 - drawing.startY);
  drawingNode.style.left = x + 'px';
  drawingNode.style.top = y + 'px';
  drawingNode.style.width = w + 'px';
  drawingNode.style.height = h + 'px';
}

function finalize(x2, y2) {
  const x = Math.min(drawing.startX, x2);
  const y = Math.min(drawing.startY, y2);
  const w = Math.abs(x2 - drawing.startX);
  const h = Math.abs(y2 - drawing.startY);
  if (w < 12 || h < 12) return; // 误点忽略

  const sec = findSection(x + w / 2, y + h / 2);
  const secRect = sec ? sec.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
  const anno = {
    id: 'fbw-anno-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type: 'region',
    secId: sec?.dataset.fbwSecId || null,
    secLabel: sec?.dataset.fbwSecLabel || null,
    rectPct: {
      x: (x - secRect.left) / secRect.width,
      y: (y - secRect.top) / secRect.height,
      w: w / secRect.width,
      h: h / secRect.height,
    },
    content: '',
    note: '',
    image: null,
  };
  anno._autoEdit = true;
  state.annotations.push(anno);
  renderAnnotation(anno);
  scheduleSave();
}

// 双击页面空白处 → 创建一个 floating 文字标注
function createFloatingAt(clientX, clientY) {
  const sec = findSection(clientX, clientY);
  if (!sec) return null;
  const secRect = sec.getBoundingClientRect();
  const anno = {
    id: 'fbw-anno-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type: 'floating',
    secId: sec.dataset.fbwSecId,
    secLabel: sec.dataset.fbwSecLabel || null,
    rectPct: {
      x: (clientX - secRect.left) / secRect.width,
      y: (clientY - secRect.top) / secRect.height,
      w: 0, h: 0,
    },
    content: '',
    _editing: true,
  };
  state.annotations.push(anno);
  renderAnnotation(anno);
  return anno;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/**
 * 渲染（或重建）一个标注盒子到 DOM。会先移除已有同 id 节点，再按 type 分支渲染。
 * @param {Annotation} anno
 */
export function renderAnnotation(anno) {
  // 老数据兼容
  if (!anno.type) anno.type = 'region';
  if (anno.text && !anno.note) { anno.note = anno.text; delete anno.text; }

  const old = document.querySelector(`[data-anno-id="${anno.id}"]`);
  if (old) old.remove();

  if (anno.type === 'floating') return renderFloating(anno);
  return renderRegion(anno);
}

function renderFloating(anno) {
  const sec = anno.secId ? document.querySelector(`[data-fbw-sec-id="${anno.secId}"]`) : null;
  if (!sec) return;
  const secRect = sec.getBoundingClientRect();

  const box = document.createElement('div');
  box.className = 'fbw-anno fbw-anno-floating';
  box.dataset.annoId = anno.id;
  box.style.position = 'absolute';
  box.style.left = (secRect.left + window.scrollX + anno.rectPct.x * secRect.width) + 'px';
  box.style.top = (secRect.top + window.scrollY + anno.rectPct.y * secRect.height) + 'px';
  box.style.maxWidth = Math.max(180, secRect.width * 0.45) + 'px';

  const removeMe = () => {
    state.annotations = state.annotations.filter(a => a.id !== anno.id);
    box.remove();
    scheduleSave();
  };

  const switchToView = () => {
    anno._editing = false;
    if (!anno.content || !anno.content.trim()) {
      removeMe();
      return;
    }
    box.innerHTML = `<div class="fbw-anno-floating-text">${escapeHtml(anno.content).replace(/\n/g, '<br>')}</div><button class="fbw-anno-floating-x" data-action="delete" aria-label="delete">×</button>`;
  };

  const switchToEdit = () => {
    anno._editing = true;
    box.innerHTML = `<textarea class="fbw-anno-floating-input" placeholder="${t('anno.placeholder.content')}"></textarea><button class="fbw-anno-floating-x" data-action="delete" aria-label="delete">×</button>`;
    const ta = box.querySelector('textarea');
    ta.value = anno.content || '';
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 0);
    ['keydown', 'keyup', 'keypress', 'mousedown'].forEach(ev =>
      ta.addEventListener(ev, e => e.stopPropagation()));
    ta.addEventListener('input', () => { anno.content = ta.value; scheduleSave(); });
    ta.addEventListener('blur', switchToView);
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); ta.blur(); }
    });
  };

  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="delete"]')) {
      e.stopPropagation();
      removeMe();
    }
  });
  box.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (!anno._editing) switchToEdit();
  });

  document.body.appendChild(box);
  if (anno._editing) switchToEdit();
  else switchToView();
}

function renderRegion(anno) {
  const sec = anno.secId ? document.querySelector(`[data-fbw-sec-id="${anno.secId}"]`) : null;
  if (!sec) return;

  const secRect = sec.getBoundingClientRect();
  const box = document.createElement('div');
  box.className = 'fbw-anno';
  box.dataset.annoId = anno.id;
  // 用 absolute + 页面坐标（带 scrollX/Y），让 anno 跟着 section 一起滚
  box.style.position = 'absolute';
  box.style.left = (secRect.left + window.scrollX + anno.rectPct.x * secRect.width) + 'px';
  box.style.top = (secRect.top + window.scrollY + anno.rectPct.y * secRect.height) + 'px';
  box.style.width = (anno.rectPct.w * secRect.width) + 'px';
  box.style.height = (anno.rectPct.h * secRect.height) + 'px';

  box.innerHTML = `
    <div class="fbw-anno-actions">
      <button data-action="note" data-tooltip="${t('anno.action.note')}">${ICON_CHAT}</button>
      <button data-action="image" data-tooltip="${t('anno.action.image')}">${ICON_CAMERA}</button>
      <button data-action="delete" class="fbw-anno-del" data-tooltip="${t('anno.action.delete')}">${ICON_X}</button>
    </div>
    <div class="fbw-anno-content"></div>
    <span class="fbw-anno-handle fbw-anno-handle-nw" data-handle="nw"></span>
    <span class="fbw-anno-handle fbw-anno-handle-ne" data-handle="ne"></span>
    <span class="fbw-anno-handle fbw-anno-handle-sw" data-handle="sw"></span>
    <span class="fbw-anno-handle fbw-anno-handle-se" data-handle="se"></span>
  `;
  document.body.appendChild(box);

  // 重新计算并写回 anno.rectPct（基于当前 box style 的页面坐标）
  const persistGeometry = () => {
    const cur = anno.secId ? document.querySelector(`[data-fbw-sec-id="${anno.secId}"]`) : null;
    if (!cur) return;
    const r = cur.getBoundingClientRect();
    const secPageLeft = r.left + window.scrollX;
    const secPageTop = r.top + window.scrollY;
    anno.rectPct.x = (parseFloat(box.style.left) - secPageLeft) / r.width;
    anno.rectPct.y = (parseFloat(box.style.top) - secPageTop) / r.height;
    anno.rectPct.w = parseFloat(box.style.width) / r.width;
    anno.rectPct.h = parseFloat(box.style.height) / r.height;
    scheduleSave();
  };

  // 注册到模块级单例 drag handler（move/up 全局只 attach 一次）
  ensureAnnoDragHandlers();

  box.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-action], textarea, [data-handle]')) return;
    if (box.classList.contains('fbw-anno-editing')) return;
    e.preventDefault();
    annoDragState = {
      type: 'move', box, persist: persistGeometry,
      startX: e.clientX, startY: e.clientY,
      origLeft: parseFloat(box.style.left),
      origTop: parseFloat(box.style.top),
    };
  });

  box.querySelectorAll('[data-handle]').forEach(h => {
    h.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      annoDragState = {
        type: 'resize', box, persist: persistGeometry,
        corner: h.dataset.handle,
        startX: e.clientX, startY: e.clientY,
        origLeft: parseFloat(box.style.left),
        origTop: parseFloat(box.style.top),
        origW: parseFloat(box.style.width),
        origH: parseFloat(box.style.height),
      };
    });
  });

  const refresh = () => {
    const content = box.querySelector('.fbw-anno-content');
    let html = '';
    if (anno.image?.dataURL) {
      html += `<img class="fbw-anno-img" src="${anno.image.dataURL}" alt="${escapeHtml(anno.image.name || '')}">`;
    }
    if (anno.content) {
      html += `<div class="fbw-anno-text-content">${escapeHtml(anno.content).replace(/\n/g, '<br>')}</div>`;
    }
    if (anno.note) {
      html += `<div class="fbw-anno-text-note">${escapeHtml(anno.note).replace(/\n/g, '<br>')}</div>`;
    }
    content.innerHTML = html;
    // 只有图片时切到 image-only 视觉（无框，图本身即主体）
    const imgOnly = !!anno.image && !anno.content?.trim() && !anno.note?.trim();
    box.classList.toggle('fbw-anno-image-only', imgOnly);
  };
  refresh();

  const removeMe = () => {
    state.annotations = state.annotations.filter(a => a.id !== anno.id);
    box.remove();
    scheduleSave();
  };

  const startEdit = (field) => {
    const cls = field === 'content'
      ? 'fbw-anno-textarea fbw-anno-textarea-content'
      : 'fbw-anno-textarea fbw-anno-textarea-note';
    const placeholder = field === 'content' ? t('anno.placeholder.content') : t('anno.placeholder.note');
    const content = box.querySelector('.fbw-anno-content');
    // note 类型加 design 分类 chip 行（间距/颜色/字号/排版/文案）。content 类型纯文字插入，不加
    const tagBar = field === 'note' ? annoTagBarHTML() : '';
    content.innerHTML = `${tagBar}<textarea class="${cls}" placeholder="${placeholder}">${escapeHtml(anno[field] || '')}</textarea>`;
    const ta = content.querySelector('textarea');
    const tagBarEl = content.querySelector('[data-fbw-tags]');
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 0);
    ['keydown', 'keyup', 'keypress', 'mousedown'].forEach(ev =>
      ta.addEventListener(ev, e => e.stopPropagation()));
    ta.addEventListener('input', () => {
      anno[field] = ta.value;
      scheduleSave();
      if (tagBarEl) paintTagBar(tagBarEl, ta);
    });
    if (tagBarEl) {
      paintTagBar(tagBarEl, ta);
      attachTagBarEvents(tagBarEl, () => ta);
    }

    box.classList.add('fbw-anno-editing');

    // blur = 仅退出编辑态（用户可能点的是 box 内的工具栏按钮）
    // 外部 mousedown = 真正退出 + 空内容删除
    let editClosed = false;
    const closeEditOnly = () => {
      if (editClosed) return;
      editClosed = true;
      box.classList.remove('fbw-anno-editing');
      refresh();
    };
    const closeAndMaybeRemove = () => {
      document.removeEventListener('mousedown', onDocMouseDown, true);
      closeEditOnly();
      const empty = !anno.content?.trim() && !anno.note?.trim() && !anno.image;
      if (empty) removeMe();
    };
    const onDocMouseDown = (e) => {
      if (box.contains(e.target)) return; // box 内（含工具栏按钮）继续保留
      closeAndMaybeRemove();
    };
    ta.addEventListener('blur', closeEditOnly);
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); ta.blur(); closeAndMaybeRemove(); }
    });
    document.addEventListener('mousedown', onDocMouseDown, true);
  };

  // 双击框内空白 → 进入"内容"输入（要插入页面的文字，跟 💬 反馈备注区分开）
  box.addEventListener('dblclick', (e) => {
    if (e.target.closest('[data-action]')) return;
    if (e.target.closest('textarea')) return;
    e.stopPropagation();
    e.preventDefault();
    startEdit('content');
  });

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    if (action === 'content') {
      startEdit('content');
    } else if (action === 'note') {
      startEdit('note');
    } else if (action === 'image') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (ev) => {
        const file = ev.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          anno.image = { name: file.name, dataURL: reader.result, type: file.type };
          // 等图片自然尺寸出来 → 把 box 收缩到图片宽高比，确保图片正好填满（不留白也不裁切）
          // 策略：保持用户画的矩形里"较短的一条边"，另一条按图片比例算
          const probe = new Image();
          probe.onload = () => {
            const ar = probe.naturalWidth / probe.naturalHeight;
            const boxW = parseFloat(box.style.width);
            const boxH = parseFloat(box.style.height);
            const boxAr = boxW / boxH;
            let newW = boxW, newH = boxH;
            if (ar > boxAr) {
              // 图片比 box 更宽 → 保留 box 宽度，缩 box 高度
              newH = boxW / ar;
            } else {
              // 图片比 box 更高 → 保留 box 高度，缩 box 宽度
              newW = boxH * ar;
            }
            box.style.width = newW + 'px';
            box.style.height = newH + 'px';
            persistGeometry();
            refresh();
          };
          probe.src = reader.result;
          refresh();
          scheduleSave();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else if (action === 'delete') {
      removeMe();
    }
  });

  // 新建时自动进入编辑态（避免空透明框看不见）
  if (anno._autoEdit) {
    delete anno._autoEdit;
    setTimeout(() => startEdit('content'), 0);
  }
}

export function rerenderAllAnnotations() {
  document.querySelectorAll('.fbw-anno').forEach(n => n.remove());
  state.annotations.forEach(renderAnnotation);
}

export function attachMarqueeEvents() {
  document.addEventListener('mousedown', (e) => {
    if (!state.marqueeMode) return;
    if (e.button !== 0) return;
    if (!inDrawingZone(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    drawing = { startX: e.clientX, startY: e.clientY };
    drawingNode = document.createElement('div');
    drawingNode.className = 'fbw-marquee-drawing';
    document.body.appendChild(drawingNode);
    updateDrawing(e.clientX, e.clientY);
  }, true);

  onMousemove((e) => {
    if (!drawing) return;
    e.preventDefault();
    updateDrawing(e.clientX, e.clientY);
  });

  onMouseup((e) => {
    if (!drawing) return;
    finalize(e.clientX, e.clientY);
    drawing = null;
    if (drawingNode) {
      drawingNode.remove();
      drawingNode = null;
    }
  });

  // Esc 退出框选模式
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.marqueeMode && !e.target.matches('textarea, input')) {
      e.preventDefault();
      toggleMarqueeMode();
    }
  });

  // 跟随窗口缩放重新定位 annotations
  onResize(() => {
    rerenderAllAnnotations();
  });

  // 双击空白页面 → 创建 floating 文字标注
  document.addEventListener('dblclick', (e) => {
    // 不在编辑/框选模式时才生效（避免冲突）
    if (state.editMode || state.marqueeMode) return;
    // 跳过 widget UI / 已有标注 / 可编辑元素
    if (e.target.closest('.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-anno, .fbw-tooltip, .fbw-confirm, .fbw-help-popover, .fbw-note-popover, .fbw-marker-popover, .fbw-font-picker, .fbw-resize-handles, .fbw-marquee-drawing, .fbw-toast')) return;
    if (e.target.dataset?.fbwEditId) return;
    // 必须双击在某个 section / header / footer 内
    const sec = e.target.closest && e.target.closest('[data-fbw-sec-id]');
    if (!sec) return;
    e.preventDefault();
    e.stopPropagation();
    createFloatingAt(e.clientX, e.clientY);
    scheduleSave();
  });
}
