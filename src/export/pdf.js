// PDF 导出：矢量版 (window.print) + 图片版 (html2canvas + jsPDF)。
// 图片库走 CDN 按需加载（首次导出时联网拉取）。
// 加载走三层兜底（utils/cdn-loader.js）应对页面 CSP：直接 script → fetch+inline-nonce → fail
import { state } from '../core/state.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';
import { loadCdnLib } from '../utils/cdn-loader.js';

// CDN 资源带 SRI 防供应链篡改。版本升级时同步更新这里的 hash。
const CDN_LIBS = {
  html2canvas: {
    src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    integrity: 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',
  },
  jspdf: {
    src: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    integrity: 'sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk',
  },
};

async function loadExportLibs() {
  const tasks = [];
  if (!window.html2canvas) tasks.push(loadCdnLib(CDN_LIBS.html2canvas, () => !!window.html2canvas));
  if (!window.jspdf)       tasks.push(loadCdnLib(CDN_LIBS.jspdf,       () => !!window.jspdf));
  if (!tasks.length) return true;
  const results = await Promise.all(tasks);
  return results.every(Boolean) && !!window.html2canvas && !!window.jspdf;
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
  const ok = await loadExportLibs();
  if (!ok) { showToast(t('pdf.loadFailed')); return; }

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

  const { jsPDF } = window.jspdf;
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
      };
      let canvas;
      try {
        canvas = await window.html2canvas(slides[i], { ...baseOpts, foreignObjectRendering: true });
      } catch (e) {
        console.warn('foreignObject mode failed, fallback to JS render:', e);
        canvas = await window.html2canvas(slides[i], baseOpts);
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

// 长截图版 PDF：没有 deck-stage / section.slide 时的 fallback。
// 整页一次性截下来，作为单张超长 PDF 页面输出 —— 不分页、不在尴尬位置断开。
// PDF user-space 上限 14400px，遇超长页面会自动 fallback 切片。
async function exportLongPagePDF() {
  document.body.classList.add('fbw-printing');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  try { await document.fonts.ready; } catch (_) {}

  const docEl = document.documentElement;
  const pageW = Math.max(docEl.scrollWidth, document.body.scrollWidth);
  const pageH = Math.max(docEl.scrollHeight, document.body.scrollHeight);

  showToast(t('pdf.progress', { i: 0, total: 1 }));
  let canvas;
  try {
    canvas = await window.html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scale: 2,
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      windowWidth: pageW,
      windowHeight: pageH,
    });
  } catch (err) {
    console.error(err);
    showToast(t('pdf.failed', { reason: err.message || err }));
    document.body.classList.remove('fbw-printing');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const PDF_MAX = 14400; // PDF user-space 单页上限
    const fname = (document.title || 'page').replace(/[\\/:*?"<>|]/g, '_') + '-long.pdf';

    if (pageH <= PDF_MAX) {
      // 主路径：整页一张超长 PDF 单页，阅读体验最佳
      const pdf = new jsPDF({
        unit: 'px', format: [pageW, pageH], orientation: 'portrait',
        hotfixes: ['px_scaling'],
      });
      const img = canvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(img, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      pdf.save(fname);
    } else {
      // 兜底：页面太长超过 PDF 单页上限，按 PDF_MAX 切片
      const sliceH = PDF_MAX;
      const cScale = canvas.width / pageW;
      const cSliceH = Math.floor(sliceH * cScale);
      const total = Math.ceil(canvas.height / cSliceH);
      const pdf = new jsPDF({
        unit: 'px', format: [pageW, sliceH], orientation: 'portrait',
        hotfixes: ['px_scaling'],
      });
      for (let i = 0; i < total; i++) {
        showToast(t('pdf.progress', { i: i + 1, total }));
        const sy = i * cSliceH;
        const sh = Math.min(cSliceH, canvas.height - sy);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sh;
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
        const img = slice.toDataURL('image/jpeg', 0.9);
        if (i > 0) pdf.addPage([pageW, sliceH], 'portrait');
        pdf.addImage(img, 'JPEG', 0, 0, pageW, sh / cScale, undefined, 'FAST');
        await new Promise(r => setTimeout(r, 0));
      }
      pdf.save(fname);
    }
    showToast(t('pdf.saved', { file: fname }));
  } catch (err) {
    console.error(err);
    showToast(t('pdf.failed', { reason: err.message || err }));
  } finally {
    document.body.classList.remove('fbw-printing');
  }
}
