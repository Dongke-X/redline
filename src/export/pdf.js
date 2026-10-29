// PDF 导出：矢量版 (window.print) + 图片版 (html2canvas + jsPDF)。
// v0.1.53+ 图片库直接 bundle 进 redline.js，100% offline + CSP-proof。
// 代价：bundle 从 ~240KB → ~750KB，可接受。
import { state } from '../core/state.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function ignoreRedlineChrome(el) {
  return !!el.closest?.(
    '.fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-fab-divider, .fbw-toast, .fbw-confirm, ' +
    '.fbw-elem-toolbar, .fbw-font-picker, .fbw-note-popover, .fbw-marker-popover, ' +
    '.fbw-tag-popover, .fbw-style-panel, .fbw-export-menu, .fbw-help-popover, ' +
    '.fbw-tooltip, .fbw-anno, .fbw-anno-actions, .fbw-marquee-drawing, ' +
    '.fbw-resize-handles, .fbw-drag-readout, .fbw-measure-overlay'
  );
}

// 矢量 PDF：deck-stage 内置 print mode，body 加 fbw-printing 类，window.print()
export function exportPDF(opts, deselectFn) {
  opts = opts || {};
  state.panel.classList.remove('fbw-open');
  if (state.fbToggleBtn) state.fbToggleBtn.classList.remove('fbw-active');
  state.fbFab.classList.remove('fbw-active');
  if (deselectFn) try { deselectFn(); } catch (_) {}
  if (opts.image) {
    return exportImagePDF();
  }
  document.body.classList.add('fbw-printing');
  showToast(t('pdf.vector.hint'));
  setTimeout(() => {
    try { window.print(); } catch (e) { console.error(e); }
    setTimeout(() => document.body.classList.remove('fbw-printing'), 2000);
  }, 250);
}

// 图片版 PDF：原页面截图 + jsPDF 拼接，100% 保真。
// 处理 deck-stage 缩放、SVG <use> 引用展开、active 状态备份恢复。
export async function exportImagePDF() {
  showToast(t('pdf.loading'));

  const ds = document.querySelector('deck-stage');
  const designW = ds ? (parseInt(ds.getAttribute('width'), 10) || 1920) : 1920;
  const designH = ds ? (parseInt(ds.getAttribute('height'), 10) || 1080) : 1080;

  const slides = [...document.querySelectorAll('section.slide')];
  if (!slides.length) {
    return exportLongPagePDF();
  }

  const activeStates = slides.map(s => s.hasAttribute('data-deck-active'));
  document.body.classList.add('fbw-printing');

  let canvasEl = null, oldTransform = '';
  try { canvasEl = ds && ds.shadowRoot && ds.shadowRoot.querySelector('.canvas'); } catch (_) {}
  if (canvasEl) {
    oldTransform = canvasEl.style.transform || '';
    canvasEl.style.transform = 'none';
  }

  
  const orientation = designW > designH ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ unit: 'px', format: [designW, designH], orientation, hotfixes: ['px_scaling'] });

  // <use href="#xx"> 展开为 inline <g>（html2canvas 不解析 use 引用）
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const symbolMap = new Map();
  document.querySelectorAll('symbol[id]').forEach(sym => symbolMap.set(sym.id, sym));
  const restorePoints = [];
  slides.forEach(slide => {
    slide.querySelectorAll('use').forEach(useEl => {
      const href = useEl.getAttribute('href') || useEl.getAttribute('xlink:href') || '';
      const id = href.replace(/^#/, '');
      const sym = symbolMap.get(id);
      if (!sym) return;
      const parentSvg = useEl.ownerSVGElement;
      const symVb = sym.getAttribute('viewBox');
      let vbAdded = false;
      if (parentSvg && !parentSvg.getAttribute('viewBox') && symVb) {
        parentSvg.setAttribute('viewBox', symVb);
        vbAdded = true;
      }
      const g = document.createElementNS(SVG_NS, 'g');
      [...sym.childNodes].forEach(c => g.appendChild(c.cloneNode(true)));
      ['transform', 'fill', 'stroke', 'class', 'opacity', 'style'].forEach(attr => {
        const v = useEl.getAttribute(attr);
        if (v) g.setAttribute(attr, v);
      });
      const placeholder = useEl;
      useEl.parentNode.insertBefore(g, useEl);
      useEl.parentNode.removeChild(useEl);
      restorePoints.push({ g, original: placeholder, parentSvg, vbAdded });
    });
  });

  showToast(t('pdf.progress', { i: 0, total: slides.length }));

  try {
    for (let i = 0; i < slides.length; i++) {
      slides.forEach((s, j) => {
        if (j === i) s.setAttribute('data-deck-active', '');
        else s.removeAttribute('data-deck-active');
      });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      try { await document.fonts.ready; } catch (_) {}

      showToast(t('pdf.progress', { i: i + 1, total: slides.length }));

      const baseOpts = {
        width: designW, height: designH,
        windowWidth: designW, windowHeight: designH,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: ignoreRedlineChrome,
      };
      let canvas;
      try {
        canvas = await html2canvas(slides[i], { ...baseOpts, foreignObjectRendering: true });
      } catch (e) {
        console.warn('foreignObject mode failed, fallback to JS render:', e);
        canvas = await html2canvas(slides[i], baseOpts);
      }
      const img = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage([designW, designH], orientation);
      pdf.addImage(img, 'JPEG', 0, 0, designW, designH, undefined, 'FAST');
    }
    const fname = (document.title || 'deck').replace(/[\\/:*?"<>|]/g, '_') + '-image.pdf';
    pdf.save(fname);
    showToast(t('pdf.saved', { file: fname }));
  } catch (err) {
    console.error(err);
    showToast(t('pdf.failed', { reason: err.message || err }));
  } finally {
    restorePoints.forEach(r => {
      try {
        r.g.parentNode.insertBefore(r.original, r.g);
        r.g.parentNode.removeChild(r.g);
        if (r.vbAdded && r.parentSvg) r.parentSvg.removeAttribute('viewBox');
      } catch (_) {}
    });
    if (canvasEl) canvasEl.style.transform = oldTransform;
    slides.forEach((s, j) => {
      if (activeStates[j]) s.setAttribute('data-deck-active', '');
      else s.removeAttribute('data-deck-active');
    });
    document.body.classList.remove('fbw-printing');
  }
}

const PDF_MAX_DIMENSION = 14400;
const MAX_CANVAS_DIMENSION = 16000;
const MAX_CANVAS_AREA = 268_000_000;
const LONG_PAGE_TARGET_SELECTORS = [
  'article.document',
  '.document',
  '.page > article',
  '.page > main',
  '.page',
  'main',
  'article',
];
const MAX_INTERNAL_BLANK_CSS_PX = 120;

export function findLongPageCaptureTarget(root = document) {
  for (const selector of LONG_PAGE_TARGET_SELECTORS) {
    const el = root.querySelector?.(selector);
    if (el) return el;
  }
  return root.body || document.body;
}

export function measureLongPageTarget(target) {
  const rect = target.getBoundingClientRect();
  return {
    width: Math.ceil(Math.max(target.scrollWidth || 0, rect.width || 0, 1)),
    height: Math.ceil(Math.max(target.scrollHeight || 0, rect.height || 0, 1)),
  };
}

export function planLongPageSlices(pageW, pageH, scale, limits = {}) {
  const pdfMax = limits.pdfMax || PDF_MAX_DIMENSION;
  const maxCanvasDim = limits.maxCanvasDim || MAX_CANVAS_DIMENSION;
  const maxCanvasArea = limits.maxCanvasArea || MAX_CANVAS_AREA;
  const preferredPageH = limits.pageHeight || Math.round(pageW * (limits.pageRatio || Math.SQRT2));
  const safeByDim = Math.floor(maxCanvasDim / scale);
  const safeByArea = Math.floor(maxCanvasArea / Math.max(1, pageW * scale * scale));
  const sliceH = Math.max(1, Math.min(preferredPageH, pdfMax, safeByDim, safeByArea, pageH));
  const slices = [];
  for (let y = 0; y < pageH; y += sliceH) {
    slices.push({ y, height: Math.min(sliceH, pageH - y) });
  }
  return slices;
}

function getPixelData(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  return { ctx, image: ctx.getImageData(0, 0, canvas.width, canvas.height) };
}

function isInkPixel(data, idx) {
  const alpha = data[idx + 3];
  if (alpha < 16) return false;
  // Treat near-white paper, pale page rules, and off-white preview chrome as blank.
  const darkness = 255 - Math.min(data[idx], data[idx + 1], data[idx + 2]);
  return darkness > 72;
}

export function compactCanvasVerticalWhitespace(canvas, scale, opts = {}) {
  const maxBlankRows = Math.max(1, Math.round((opts.maxBlankCssPx || MAX_INTERNAL_BLANK_CSS_PX) * scale));
  const { image } = getPixelData(canvas);
  const { data, width, height } = image;
  const rowHasInk = new Uint8Array(height);
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4;
    let hasInk = false;
    for (let x = 0; x < width; x++) {
      if (isInkPixel(data, rowStart + x * 4)) {
        hasInk = true;
        break;
      }
    }
    if (!hasInk) continue;
    rowHasInk[y] = 1;
    if (y < top) top = y;
    bottom = y;
  }

  if (bottom < top) return null;

  const ranges = [];
  let y = top;
  while (y <= bottom) {
    const start = y;
    const ink = rowHasInk[y] === 1;
    while (y <= bottom && (rowHasInk[y] === 1) === ink) y++;
    const end = y;
    if (ink || end - start <= maxBlankRows) {
      ranges.push([start, end]);
      continue;
    }
    const keepHead = Math.floor(maxBlankRows / 2);
    const keepTail = maxBlankRows - keepHead;
    ranges.push([start, start + keepHead], [end - keepTail, end]);
  }

  const outHeight = ranges.reduce((sum, [start, end]) => sum + (end - start), 0);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = Math.max(1, outHeight);
  const outCtx = out.getContext('2d');
  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, out.width, out.height);
  let dy = 0;
  ranges.forEach(([start, end]) => {
    const h = end - start;
    if (h <= 0) return;
    outCtx.drawImage(canvas, 0, start, width, h, 0, dy, width, h);
    dy += h;
  });
  return out;
}

// 长截图版 PDF：没有 deck-stage / section.slide 时的 fallback。
// 超长页面不能先整页截图再切片：Chrome canvas 高度超限后会返回透明图。
// 因此按安全高度逐段 html2canvas，再逐页写入 PDF。
async function exportLongPagePDF() {
  document.body.classList.add('fbw-printing');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  try { await document.fonts.ready; } catch (_) {}

  const target = findLongPageCaptureTarget();
  const targetSize = measureLongPageTarget(target);
  const pageW = targetSize.width;
  const pageH = targetSize.height;

  try {
    const fname = (document.title || 'page').replace(/[\\/:*?"<>|]/g, '_') + '-long.pdf';
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const slices = planLongPageSlices(pageW, pageH, scale);
    let pdf = null;
    let pageCount = 0;

    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      showToast(t('pdf.progress', { i: i + 1, total: slices.length }));
      const rawCanvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scale,
        x: 0,
        y: slice.y,
        width: pageW,
        height: slice.height,
        windowWidth: pageW,
        windowHeight: slice.height,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: ignoreRedlineChrome,
      });
      const canvas = compactCanvasVerticalWhitespace(rawCanvas, scale);
      if (!canvas) continue;
      const pdfW = canvas.width / scale;
      const pdfH = canvas.height / scale;
      const orientation = pdfW > pdfH ? 'landscape' : 'portrait';
      const img = canvas.toDataURL('image/jpeg', 0.9);
      if (!pdf) {
        pdf = new jsPDF({
          unit: 'px', format: [pdfW, pdfH], orientation,
          hotfixes: ['px_scaling'],
        });
      } else {
        pdf.addPage([pdfW, pdfH], orientation);
      }
      pdf.addImage(img, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      pageCount++;
      await new Promise(r => setTimeout(r, 0));
    }
    if (!pdf || pageCount === 0) throw new Error('empty capture');
    pdf.save(fname);
    showToast(t('pdf.saved', { file: fname }));
  } catch (err) {
    console.error(err);
    showToast(t('pdf.failed', { reason: err.message || err }));
  } finally {
    document.body.classList.remove('fbw-printing');
  }
}
