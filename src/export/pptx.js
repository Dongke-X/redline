// PowerPoint 导出（slide-by-slide）。
// deck 模式：每个 section.slide 单独 html2canvas → 塞进 pptx 一张 slide；sectionFeedback 写进 speaker notes
// 非 deck 模式：整页一张图当一张 slide
// pptxgenjs 走 CDN 按需加载（不进 redline bundle，省 600KB）
import { state } from '../core/state.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

const CDN_LIBS = {
  html2canvas: {
    src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    integrity: 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',
  },
  pptxgenjs: {
    src: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
    // TODO: 锁版本时补 SRI hash。当前先空着，避免错的哈希直接 block
  },
};

function loadCdn({ src, integrity }) {
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) {
      s.integrity = integrity;
      s.crossOrigin = 'anonymous';
    }
    s.referrerPolicy = 'no-referrer';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

async function loadLibs() {
  const tasks = [];
  if (!window.html2canvas) tasks.push(loadCdn(CDN_LIBS.html2canvas));
  if (!window.PptxGenJS) tasks.push(loadCdn(CDN_LIBS.pptxgenjs));
  if (!tasks.length) return true;
  const results = await Promise.all(tasks);
  return results.every(Boolean) && !!window.html2canvas && !!window.PptxGenJS;
}

export async function exportPPTX() {
  showToast(t('pptx.preparing') || '正在加载 PPT 库…');
  const ok = await loadLibs();
  if (!ok) { showToast(t('pptx.loadFailed') || 'PPT 库加载失败 · 需联网'); return; }

  const ds = document.querySelector('deck-stage');
  const designW = ds ? (parseInt(ds.getAttribute('width'), 10) || 1920) : 1920;
  const designH = ds ? (parseInt(ds.getAttribute('height'), 10) || 1080) : 1080;
  const slides = [...document.querySelectorAll('section.slide')];

  document.body.classList.add('fbw-printing');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // deck-stage 缩放兜底（沿用 PDF 导出的处理）
  let canvasEl = null, oldTransform = '';
  try { canvasEl = ds && ds.shadowRoot && ds.shadowRoot.querySelector('.canvas'); } catch (_) {}
  if (canvasEl) { oldTransform = canvasEl.style.transform || ''; canvasEl.style.transform = 'none'; }
  const activeStates = slides.map(s => s.hasAttribute('data-deck-active'));

  const Ppt = window.PptxGenJS;
  const pres = new Ppt();
  // pptxgenjs 用英寸；按 96dpi 换算 →设计稿宽 / 96 inch
  const PT_W = designW / 96, PT_H = designH / 96;
  pres.defineLayout({ name: 'FBW', width: PT_W, height: PT_H });
  pres.layout = 'FBW';

  const total = slides.length || 1;
  showToast(t('pptx.progress', { i: 0, total }));

  try {
    if (slides.length) {
      for (let i = 0; i < slides.length; i++) {
        slides.forEach((s, j) => {
          if (j === i) s.setAttribute('data-deck-active', '');
          else s.removeAttribute('data-deck-active');
        });
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        try { await document.fonts.ready; } catch (_) {}
        showToast(t('pptx.progress', { i: i + 1, total }));

        const baseOpts = {
          width: designW, height: designH,
          windowWidth: designW, windowHeight: designH,
          scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
        };
        let canvas;
        try { canvas = await window.html2canvas(slides[i], { ...baseOpts, foreignObjectRendering: true }); }
        catch (_) { canvas = await window.html2canvas(slides[i], baseOpts); }

        const dataURL = canvas.toDataURL('image/png');
        const slide = pres.addSlide();
        slide.addImage({ data: dataURL, x: 0, y: 0, w: PT_W, h: PT_H });

        // Speaker notes：把 sectionFeedback 写进去（agent / 接收方能在 PPT 里看到反馈）
        const secId = slides[i].dataset?.fbwSecId;
        if (secId) {
          const fb = state.sectionFeedback.get(secId);
          if (fb && fb.note) slide.addNotes(`[redline] ${fb.label}\n${fb.note}`);
        }
      }
    } else {
      // 非 deck 模式：整页一张图当一张 slide
      showToast(t('pptx.progress', { i: 1, total: 1 }));
      const docEl = document.documentElement;
      const pageW = Math.max(docEl.scrollWidth, document.body.scrollWidth);
      const pageH = Math.max(docEl.scrollHeight, document.body.scrollHeight);
      pres.defineLayout({ name: 'FBW1', width: pageW / 96, height: pageH / 96 });
      pres.layout = 'FBW1';
      const canvas = await window.html2canvas(document.body, {
        useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff',
        scale: 2, x: 0, y: 0, width: pageW, height: pageH, windowWidth: pageW, windowHeight: pageH,
      });
      const dataURL = canvas.toDataURL('image/png');
      const slide = pres.addSlide();
      slide.addImage({ data: dataURL, x: 0, y: 0, w: pageW / 96, h: pageH / 96 });
      // 全局反馈写进 notes
      const globalNote = state.panel?.querySelector('[data-fbw-global]')?.value?.trim();
      if (globalNote) slide.addNotes(`[redline] global\n${globalNote}`);
    }

    const fname = (document.title || 'deck').replace(/[\\/:*?"<>|]/g, '_') + '.pptx';
    await pres.writeFile({ fileName: fname });
    showToast(t('pptx.done', { file: fname }) || `已导出 ${fname}`);
  } catch (err) {
    console.error('[fbw] pptx export failed', err);
    showToast(t('pptx.failed', { reason: err.message || err }) || '导出失败: ' + (err.message || err));
  } finally {
    if (canvasEl) canvasEl.style.transform = oldTransform;
    slides.forEach((s, j) => {
      if (activeStates[j]) s.setAttribute('data-deck-active', '');
      else s.removeAttribute('data-deck-active');
    });
    document.body.classList.remove('fbw-printing');
  }
}
