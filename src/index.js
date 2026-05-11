// IIFE 入口：等 DOM ready 后调用 init()，做重复加载防护。
import { init } from './init.js';
import { DBG, VERSION } from './config.js';

(function () {
  if (typeof window === 'undefined') return;
  if (window.__feedbackWidgetLoaded) return;
  window.__feedbackWidgetLoaded = true;
  window.__feedbackWidgetVersion = VERSION;
  DBG(`redline v${VERSION} loaded · 关闭日志: window.__fbwDebug = false`);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
