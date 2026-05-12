// 视口截屏：用 html2canvas 抓当前可视区，扔到 attachments 里。
// review 模式下尤其有用——线上 webapp 状态是动态的，截屏作为 agent 的视觉锚点。
// html2canvas 走 CDN 按需加载，CSP-aware 三层兜底见 utils/cdn-loader.js
import { addAttachment } from './attachments.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';
import { loadCdnLib } from '../utils/cdn-loader.js';

const H2C_SPEC = {
  src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  integrity: 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H',
};

function loadH2C() {
  return loadCdnLib(H2C_SPEC, () => !!window.html2canvas);
}

export async function captureViewport() {
  showToast(t('shot.loading'));
  const ok = await loadH2C();
  if (!ok) { showToast(t('shot.loadFailed')); return; }

  // 截屏前隐藏 widget 自己的 UI（否则截图里会有 FAB / 面板）
  document.body.classList.add('fbw-printing');
  await new Promise(r => requestAnimationFrame(r));

  let canvas;
  try {
    canvas = await window.html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scale: window.devicePixelRatio || 1,
    });
  } catch (e) {
    console.error('[fbw] screenshot failed', e);
    showToast(t('shot.failed'));
    document.body.classList.remove('fbw-printing');
    return;
  }
  document.body.classList.remove('fbw-printing');

  // canvas → blob → 调用现有 addAttachment（统一走 attachments 渲染 / 持久化路径）。
  // 用 jpeg + 0.85 质量压缩 4-8 倍体积，避免单张截图就把 localStorage 顶满。
  canvas.toBlob((blob) => {
    if (!blob) { showToast(t('shot.failed')); return; }
    blob.name = 'screenshot-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.jpg';
    addAttachment(blob);
  }, 'image/jpeg', 0.85);
}
