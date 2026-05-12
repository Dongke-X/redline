// 视口截屏：用 html2canvas 抓当前可视区，扔到 attachments 里。
// review 模式下尤其有用——线上 webapp 状态是动态的，截屏作为 agent 的视觉锚点。
// v0.1.53+ html2canvas 直接 bundle，100% offline + CSP-proof
import { addAttachment } from './attachments.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';
import html2canvas from 'html2canvas';

export async function captureViewport() {
  showToast(t('shot.loading'));

  // 截屏前隐藏 widget 自己的 UI（否则截图里会有 FAB / 面板）
  document.body.classList.add('fbw-printing');
  await new Promise(r => requestAnimationFrame(r));

  let canvas;
  try {
    canvas = await html2canvas(document.body, {
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
