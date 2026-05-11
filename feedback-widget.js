/* ═════════════════════════════════════════════════════════════════
   feedback-widget.js
   ─────────────────────────────────────────────────────────────────
   自包含的 HTML 提案/页面反馈插件,质感同 macOS HUD / 视频播放控件,
   不参与任何主题色,跟内容视觉脱钩。

   v2 升级:
   ─ localStorage 持久化(刷新页面后,编辑改动 / 当前页反馈 / 全局反馈 /
     附件清单 全部保留)
   ─ 关闭面板不销毁数据(× 表示折叠,内容继续保留)
   ─ "清空所有反馈" 按钮(垃圾桶,带二次确认)
   ─ placeholder 字号缩小 + 改用中文全角括号

   功能:
   ─ 编辑模式 (E):点任意文字直接改,自动 diff
   ─ 当前页反馈(自动识别 deck-stage 的 slidechange,无 deck 时按可视区域识别)
   ─ 全局反馈
   ─ 截图粘贴/拖入(做附件清单 + 下载备份)
   ─ 复制反馈到剪贴板(markdown 格式)
   ─ 下载备份 = .md + 所有 .png 附件

   工具栏按钮:有 deck-stage 时注入到 overlay;无则在右下角 FAB

   用法: <script src="path/to/feedback-widget.js"></script>

   全局快捷键:
       E       开/关编辑模式
       F       开/关反馈面板
       P       导出 PDF
       Esc     取消元素选中 / 退出文字编辑

   编辑模式下的鼠标行为(Figma 风):
       单击元素   选中 + 弹出元素操作工具栏(编辑文字/换图/微调/隐藏/删除/还原)
       双击元素   直接进入文字编辑(光标进入,选中全部内容直接打字替换)
       工具栏外  click 取消选中
   ════════════════════════════════════════════════════════════════ */

(function() {
  if (window.__feedbackWidgetLoaded) return;
  window.__feedbackWidgetLoaded = true;

  // ───── 调试日志开关 ─────
  // 默认开。要关:在 console 里执行 window.__fbwDebug = false
  if (window.__fbwDebug === undefined) window.__fbwDebug = true;
  const DBG = (...args) => { if (window.__fbwDebug) console.log('%c[fbw]', 'color:#7d8471;font-weight:bold;', ...args); };
  DBG('feedback-widget loaded · 关闭日志: window.__fbwDebug = false');

  // ───── 1. CSS 注入 ─────
  const css = `
    .fbw-panel {
      position: fixed; bottom: 78px; right: 16px;
      background: rgba(20, 22, 28, 0.94);
      color: #f5f5f7;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.48), 0 2px 8px rgba(0,0,0,0.28);
      z-index: 2147483600;
      width: 360px;
      max-height: calc(100vh - 110px);
      display: flex; flex-direction: column; gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Noto Sans SC", sans-serif;
      font-size: 12.5px;
      line-height: 1.5;
      transform: translate(390px, 0);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.22s ease, opacity 0.22s ease;
      backdrop-filter: blur(24px) saturate(1.4);
      -webkit-backdrop-filter: blur(24px) saturate(1.4);
      overflow-y: auto;
      box-sizing: border-box;
    }
    .fbw-panel.fbw-open { transform: translate(0, 0); opacity: 1; pointer-events: auto; }
    .fbw-panel::-webkit-scrollbar { width: 4px; }
    .fbw-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 2px; }
    .fbw-panel * { box-sizing: border-box; }

    .fbw-head {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 13px; font-weight: 600;
      color: #f5f5f7;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      letter-spacing: 0.005em;
    }
    .fbw-head-title { display: inline-flex; align-items: center; gap: 8px; }
    .fbw-head-title svg { width: 15px; height: 15px; opacity: 0.7; }
    .fbw-head-actions { display: inline-flex; align-items: center; gap: 4px; }
    .fbw-icon-btn {
      width: 22px; height: 22px;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; user-select: none;
      color: rgba(245,245,247,0.5);
      border-radius: 5px;
      font-size: 16px; line-height: 1;
      background: transparent; border: 0; padding: 0;
      transition: all 140ms;
    }
    .fbw-icon-btn:hover { color: #f5f5f7; background: rgba(255,255,255,0.08); }
    .fbw-icon-btn.fbw-danger:hover { color: #ff6b6b; background: rgba(255,107,107,0.10); }
    .fbw-icon-btn svg { width: 13px; height: 13px; }

    .fbw-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .fbw-pill {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,0.08);
      color: rgba(245,245,247,0.78);
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 10.5px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .fbw-pill svg { width: 11px; height: 11px; }

    .fbw-current {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .fbw-current-label {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.5);
      font-weight: 600;
      margin-bottom: 3px;
    }
    .fbw-current-page {
      font-size: 13px;
      color: #f5f5f7;
      font-weight: 600;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .fbw-saved-tag {
      display: none;
      background: rgba(255,255,255,0.18);
      color: #f5f5f7;
      font-size: 8.5px;
      font-family: ui-monospace, monospace;
      letter-spacing: 0.08em;
      padding: 1px 5px;
      border-radius: 3px;
      margin-left: 6px;
      vertical-align: middle;
      text-transform: uppercase;
    }
    .fbw-saved-tag.fbw-on { display: inline-block; }

    .fbw-textarea {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(0,0,0,0.32);
      color: #f5f5f7;
      padding: 9px 11px;
      border-radius: 7px;
      font-family: inherit;
      font-size: 12.5px;
      line-height: 1.55;
      resize: vertical;
      box-sizing: border-box;
      display: block;
      transition: border-color 140ms, background 140ms;
    }
    .fbw-textarea::placeholder {
      color: rgba(245,245,247,0.32);
      font-size: 11.5px;
    }
    .fbw-textarea:focus { outline: none; border-color: rgba(255,255,255,0.4); background: rgba(0,0,0,0.45); }
    .fbw-textarea.fbw-current-text { min-height: 48px; max-height: 120px; }
    .fbw-textarea.fbw-global {
      min-height: 80px; max-height: 180px;
      padding-right: 32px;
      background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-opacity='0.4' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/%3E%3Ccircle cx='12' cy='13' r='4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px top 10px;
      background-size: 14px 14px;
    }
    .fbw-textarea.fbw-global:focus {
      background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-opacity='0.55' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/%3E%3Ccircle cx='12' cy='13' r='4'/%3E%3C/svg%3E");
    }

    .fbw-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      color: #f5f5f7;
      padding: 7px 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      flex: 1;
      transition: all 140ms;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 500;
    }
    .fbw-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.24); }
    .fbw-btn.fbw-primary { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.28); }
    .fbw-btn.fbw-primary:hover { background: rgba(255,255,255,0.26); border-color: rgba(255,255,255,0.42); }
    .fbw-btn svg { width: 13px; height: 13px; flex-shrink: 0; }

    .fbw-hint {
      font-size: 10.5px;
      color: rgba(245,245,247,0.45);
      line-height: 1.6;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .fbw-hint b { color: rgba(245,245,247,0.85); font-weight: 600; }

    .fbw-attachments { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 0; }
    .fbw-thumb {
      position: relative;
      width: 50px; height: 50px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
      flex-shrink: 0;
    }
    .fbw-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .fbw-thumb-x {
      position: absolute;
      top: 2px; right: 2px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: rgba(0,0,0,0.85);
      color: white; border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; line-height: 1;
    }
    .fbw-panel.fbw-drag-over { border-color: rgba(255,255,255,0.4); box-shadow: 0 0 0 3px rgba(255,255,255,0.12); }

    /* 编辑模式高亮 + 兜底 pointer-events 让小元素(meta/lockup/cell 等)一定可点 */
    body.fbw-edit-mode [data-fbw-edit-id] {
      cursor: text;
      transition: all 140ms;
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    body.fbw-edit-mode [data-fbw-edit-id]:hover { outline: 2px dashed rgba(255,255,255,0.4); outline-offset: 3px; border-radius: 3px; }
    body.fbw-edit-mode [data-fbw-edit-id]:focus { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 3px; background: rgba(255,255,255,0.06); border-radius: 3px; }
    body.fbw-edit-mode [data-fbw-edit-id].fbw-changed { background: rgba(255,255,255,0.12); border-radius: 3px; }

    /* Toast */
    .fbw-toast {
      position: fixed; bottom: 100px; right: 20px;
      background: rgba(20,22,28,0.96);
      color: #f5f5f7;
      padding: 12px 18px; border-radius: 10px;
      font-size: 12.5px; z-index: 2147483650;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.10);
      animation: fbw-toastIn 0.22s ease-out;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      backdrop-filter: blur(20px);
    }
    @keyframes fbw-toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* Confirm dialog (清空确认) */
    .fbw-confirm {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center;
      z-index: 2147483700;
    }
    .fbw-confirm.fbw-on { display: flex; }
    .fbw-confirm-box {
      background: rgba(20,22,28,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 20px 22px;
      width: 320px;
      color: #f5f5f7;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    }
    .fbw-confirm-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .fbw-confirm-desc { font-size: 12.5px; color: rgba(245,245,247,0.7); line-height: 1.6; margin-bottom: 16px; }
    .fbw-confirm-actions { display: flex; gap: 8px; }

    /* ───── 元素选中工具栏 + selection 高亮 ───── */
    body.fbw-edit-mode .fbw-selected {
      outline: 2px solid #00d4aa !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 1px rgba(0,212,170,0.3) !important;
      cursor: move !important;
    }
    body.fbw-edit-mode .fbw-selected[data-fbw-editing="1"] { cursor: text !important; }
    /* SVG 元素 outline 视觉差,改用 drop-shadow filter 兜底 */
    body.fbw-edit-mode svg.fbw-selected {
      filter: drop-shadow(0 0 0 #00d4aa) drop-shadow(0 0 4px rgba(0,212,170,0.9)) drop-shadow(0 0 10px rgba(0,212,170,0.5)) !important;
    }
    /* 编辑模式下,所有 slide 内的 svg 强制可点(默认 svg 子元素可能被父级 pointer-events 拦) */
    body.fbw-edit-mode section.slide svg,
    body.fbw-edit-mode section.slide svg * {
      pointer-events: auto !important;
    }
    /* 但 svg 内的细节子元素(use/path/circle)避免被点中 → 整体提升到 svg 层 */
    body.fbw-edit-mode section.slide svg use,
    body.fbw-edit-mode section.slide svg path,
    body.fbw-edit-mode section.slide svg circle,
    body.fbw-edit-mode section.slide svg ellipse,
    body.fbw-edit-mode section.slide svg polyline,
    body.fbw-edit-mode section.slide svg line,
    body.fbw-edit-mode section.slide svg rect:not(:only-child) {
      pointer-events: none !important;
    }
    body.fbw-edit-mode [data-fbw-op-deleted] { opacity: 0.25 !important; outline: 2px dashed #ff6b6b !important; outline-offset: 3px !important; pointer-events: none !important; }
    body.fbw-edit-mode svg[data-fbw-op-deleted] { filter: drop-shadow(0 0 4px rgba(255,107,107,0.8)) !important; }
    body.fbw-edit-mode [data-fbw-op-hidden] { opacity: 0.4 !important; outline: 2px dashed #ffa94d !important; outline-offset: 3px !important; }
    body.fbw-edit-mode svg[data-fbw-op-hidden] { filter: drop-shadow(0 0 4px rgba(255,169,77,0.8)) !important; }
    body:not(.fbw-edit-mode) [data-fbw-op-deleted] { display: none !important; }
    body:not(.fbw-edit-mode) [data-fbw-op-hidden] { visibility: hidden !important; }

    .fbw-elem-toolbar {
      position: fixed;
      z-index: 2147483550;
      background: rgba(20,22,28,0.97);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 4px;
      display: none;
      gap: 2px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
    }
    .fbw-elem-toolbar.fbw-toolbar-open { display: inline-flex; align-items: center; }
    .fbw-elem-toolbar button {
      width: 30px; height: 30px;
      border: 0; border-radius: 6px;
      background: transparent;
      color: rgba(245,245,247,0.78);
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all 120ms;
      padding: 0;
      font-family: inherit;
    }
    .fbw-elem-toolbar button:hover { background: rgba(255,255,255,0.10); color: #fff; }
    .fbw-elem-toolbar button.fbw-danger:hover { background: rgba(255,107,107,0.18); color: #ff6b6b; }
    .fbw-elem-toolbar button.fbw-restore:hover { background: rgba(0,212,170,0.18); color: #00d4aa; }
    .fbw-elem-toolbar button svg { width: 14px; height: 14px; }
    .fbw-elem-toolbar .fbw-tb-divider {
      width: 1px; height: 18px; background: rgba(255,255,255,0.10); margin: 0 2px;
    }
    .fbw-elem-toolbar .fbw-tb-label {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 10px; color: rgba(255,255,255,0.5);
      padding: 0 8px; max-width: 200px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* 字体选择面板 */
    .fbw-font-picker {
      position: fixed;
      z-index: 2147483560;
      background: rgba(20,22,28,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 6px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: none;
      max-height: 320px;
      overflow-y: auto;
      width: 220px;
    }
    .fbw-font-picker.fbw-fp-open { display: block; }
    .fbw-font-picker::-webkit-scrollbar { width: 4px; }
    .fbw-font-picker::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 2px; }
    .fbw-font-picker .fbw-fp-item {
      padding: 8px 10px;
      border-radius: 6px;
      color: rgba(245,245,247,0.85);
      cursor: pointer;
      font-size: 14px;
      line-height: 1.3;
      display: flex; flex-direction: column; gap: 2px;
      transition: background 120ms;
    }
    .fbw-font-picker .fbw-fp-item:hover { background: rgba(255,255,255,0.10); color: #fff; }
    .fbw-font-picker .fbw-fp-item.fbw-fp-active { background: rgba(0,212,170,0.16); color: #00d4aa; }
    .fbw-font-picker .fbw-fp-name {
      font-family: ui-monospace, monospace;
      font-size: 9.5px;
      color: rgba(245,245,247,0.45);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* FAB(无 deck-stage 时使用) */
    .fbw-fab {
      position: fixed; bottom: 20px; right: 20px;
      width: 48px; height: 48px;
      border-radius: 50%;
      background: rgba(20,22,28,0.92);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      color: rgba(245,245,247,0.78);
      cursor: pointer;
      display: none;
      align-items: center; justify-content: center;
      z-index: 2147483500;
      backdrop-filter: blur(20px);
      transition: all 140ms;
    }
    .fbw-fab:hover { background: rgba(40,42,48,0.96); color: #f5f5f7; transform: scale(1.04); }
    .fbw-fab.fbw-active { background: rgba(255,255,255,0.18); color: #fff; }
    .fbw-fab svg { width: 20px; height: 20px; }
    body.fbw-no-overlay .fbw-fab { display: flex; }
    body.fbw-no-overlay .fbw-fab.fbw-edit-fab { right: 80px; }
    body.fbw-no-overlay .fbw-fab.fbw-export-fab { right: 140px; }

    /* ───── PRINT · 导出 PDF 时的优化(精准 reset,只动卡顿来源) ───── */
    @media print {
      /* widget 自身 UI 全部隐藏,不污染打印 */
      .fbw-panel, .fbw-fab, .fbw-toast, .fbw-confirm,
      .fbw-elem-toolbar, .fbw-font-picker {
        display: none !important;
      }
      /* 选中态视觉提示也清掉 */
      .fbw-selected {
        outline: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
      /* 编辑高亮全清 */
      body.fbw-edit-mode [data-fbw-edit-id],
      body.fbw-edit-mode [data-fbw-edit-id]:hover,
      body.fbw-edit-mode [data-fbw-edit-id]:focus,
      body.fbw-edit-mode [data-fbw-edit-id].fbw-changed {
        outline: none !important;
        background: transparent !important;
      }
      /* slide 直接每页独占,但不动 slide 内部的 transform/layout */
      section.slide {
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      section.slide:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'fbw-styles';
  styleEl.dataset.fbwInternal = '1';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ───── 2. SVG 图标 ─────
  const ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const ICON_PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  const ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  const ICON_CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
  const ICON_EDIT_TEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>';
  const ICON_EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  const ICON_IMAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  const ICON_RESTORE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
  const ICON_ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  const ICON_ARROW_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  const ICON_ARROW_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  const ICON_ARROW_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const ICON_MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const ICON_DRAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>';
  const ICON_FONT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>';

  // ───── 3. localStorage 持久化 key ─────
  const STORAGE_KEY = 'fbw-state::' + (location.pathname || '/').slice(0, 200);

  // ───── 4. Panel HTML 节点 ─────
  const panel = document.createElement('div');
  panel.className = 'fbw-panel';
  panel.id = 'fbwPanel';
  panel.innerHTML = `
    <div class="fbw-head">
      <span class="fbw-head-title">${ICON_CHAT}<span>反馈给 Agent</span></span>
      <span class="fbw-head-actions">
        <button class="fbw-icon-btn fbw-danger" data-fbw-clear-all title="清空所有反馈">${ICON_TRASH}</button>
        <button class="fbw-icon-btn" data-fbw-close title="关闭面板（内容保留，刷新也在）">−</button>
      </span>
    </div>
    <div class="fbw-row">
      <span class="fbw-pill">编辑 <span data-fbw-counter="edit">0</span></span>
      <span class="fbw-pill">页面 <span data-fbw-counter="sec">0</span></span>
      <span class="fbw-pill">元素 <span data-fbw-counter="ops">0</span></span>
      <span class="fbw-pill">${ICON_CAMERA}<span data-fbw-counter="att">0</span></span>
    </div>
    <div class="fbw-current">
      <div class="fbw-current-label">当前页 <span class="fbw-saved-tag" data-fbw-saved>已存</span></div>
      <div class="fbw-current-page" data-fbw-current-page>—</div>
      <textarea class="fbw-textarea fbw-current-text" data-fbw-current-text placeholder="对当前这一页的反馈（删／缩／加内容／数据问题…）"></textarea>
    </div>
    <textarea class="fbw-textarea fbw-global" data-fbw-global placeholder="全局反馈（整体感受／想加想删的内容…）" title="支持粘贴或拖入截图"></textarea>
    <div class="fbw-attachments" data-fbw-attachments></div>
    <div class="fbw-row">
      <button class="fbw-btn fbw-primary" data-fbw-action="copy">${ICON_COPY}<span>复制反馈</span></button>
      <button class="fbw-btn" data-fbw-action="download">${ICON_DOWNLOAD}<span>下载备份</span></button>
    </div>
  `;

  // 清空确认弹窗
  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'fbw-confirm';
  confirmDialog.innerHTML = `
    <div class="fbw-confirm-box">
      <div class="fbw-confirm-title">清空所有反馈？</div>
      <div class="fbw-confirm-desc">编辑改动、各页反馈、全局反馈、所有截图都会被清掉。本地缓存也一并清除。此操作不可撤销。</div>
      <div class="fbw-confirm-actions">
        <button class="fbw-btn" data-fbw-confirm-cancel>取消</button>
        <button class="fbw-btn fbw-primary" data-fbw-confirm-ok>确认清空</button>
      </div>
    </div>
  `;

  // FAB
  const editFab = document.createElement('button');
  editFab.className = 'fbw-fab fbw-edit-fab';
  editFab.innerHTML = ICON_PENCIL;
  editFab.title = '编辑模式 (E)';
  const fbFab = document.createElement('button');
  fbFab.className = 'fbw-fab fbw-fb-fab';
  fbFab.innerHTML = ICON_CHAT;
  fbFab.title = '反馈面板 (F)';
  const exportFab = document.createElement('button');
  exportFab.className = 'fbw-fab fbw-export-fab';
  exportFab.innerHTML = ICON_SHARE;
  exportFab.title = '导出 PDF (P)';

  // ───── 元素操作浮动工具栏 ─────
  const elemToolbar = document.createElement('div');
  elemToolbar.className = 'fbw-elem-toolbar';
  elemToolbar.innerHTML = `
    <span class="fbw-tb-label" data-tb-label>—</span>
    <span class="fbw-tb-divider"></span>
    <button data-op="edit-text" title="编辑文字">${ICON_EDIT_TEXT}</button>
    <button data-op="font" title="字体">${ICON_FONT}</button>
    <button data-op="replace-img" title="换图片" style="display:none;">${ICON_IMAGE}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="move-up" title="上移 4px (按住 Shift = 16px)">${ICON_ARROW_UP}</button>
    <button data-op="move-down" title="下移 4px (按住 Shift = 16px)">${ICON_ARROW_DOWN}</button>
    <button data-op="move-left" title="左移 4px (按住 Shift = 16px)">${ICON_ARROW_LEFT}</button>
    <button data-op="move-right" title="右移 4px (按住 Shift = 16px)">${ICON_ARROW_RIGHT}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="zoom-in" title="放大 10%">${ICON_PLUS}</button>
    <button data-op="zoom-out" title="缩小 10%">${ICON_MINUS}</button>
    <button data-op="drag" title="拖动(按住元素本身拖)" class="fbw-drag-hint">${ICON_DRAG}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="hide" title="隐藏(占位)" class="fbw-danger">${ICON_EYE_OFF}</button>
    <button data-op="delete" title="删除(不占位)" class="fbw-danger">${ICON_TRASH}</button>
    <button data-op="restore" title="还原所有变换" class="fbw-restore">${ICON_RESTORE}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="close" title="取消选中">${ICON_X}</button>
  `;

  // ───── 字体选择面板 ─────
  const fontPicker = document.createElement('div');
  fontPicker.className = 'fbw-font-picker';

  // 可用字体探测：document.fonts (CSS Font Loading API) + 系统兜底
  function getAvailableFonts() {
    const fonts = new Map(); // name -> { name, family }
    try {
      document.fonts.forEach(f => {
        const name = (f.family || '').replace(/^['"]|['"]$/g, '');
        if (name && !fonts.has(name)) fonts.set(name, { name, family: `"${name}"` });
      });
    } catch (_) {}
    // 系统兜底
    const fallbacks = [
      { name: '系统默认', family: '__inherit__' },
      { name: 'system-ui', family: 'system-ui, -apple-system, sans-serif' },
      { name: 'serif', family: 'serif' },
      { name: 'sans-serif', family: 'sans-serif' },
      { name: 'monospace', family: 'ui-monospace, monospace' },
      { name: 'cursive', family: 'cursive' },
    ];
    fallbacks.forEach(f => { if (!fonts.has(f.name)) fonts.set(f.name, f); });
    return [...fonts.values()];
  }

  function buildFontPicker() {
    const fonts = getAvailableFonts();
    fontPicker.innerHTML = fonts.map(f => `
      <div class="fbw-fp-item" data-fp-family="${f.family.replace(/"/g, '&quot;')}" data-fp-name="${f.name}" style="${f.family === '__inherit__' ? '' : `font-family:${f.family};`}">
        <span>${f.name === '系统默认' ? '系统默认（清除）' : f.name + ' Aa 永和九年'}</span>
        <span class="fbw-fp-name">${f.name}</span>
      </div>
    `).join('');
  }

  function positionFontPicker() {
    const tb = elemToolbar.getBoundingClientRect();
    let top = tb.bottom + 6;
    let left = tb.left;
    if (left + 220 > window.innerWidth - 8) left = window.innerWidth - 228;
    if (left < 8) left = 8;
    if (top + 320 > window.innerHeight - 8) top = Math.max(8, tb.top - 326);
    fontPicker.style.top = top + 'px';
    fontPicker.style.left = left + 'px';
  }

  function openFontPicker() {
    buildFontPicker();
    // 高亮当前 selectedEl 的 font-family
    const current = (window.getComputedStyle && window.__fbwSelEl) ? window.getComputedStyle(window.__fbwSelEl).fontFamily : '';
    fontPicker.querySelectorAll('.fbw-fp-item').forEach(it => {
      const f = it.dataset.fpFamily;
      if (current && f !== '__inherit__' && current.includes(it.dataset.fpName)) it.classList.add('fbw-fp-active');
    });
    fontPicker.classList.add('fbw-fp-open');
    positionFontPicker();
  }

  function closeFontPicker() {
    fontPicker.classList.remove('fbw-fp-open');
  }

  // ───── 5. init ─────
  function init() {
    document.body.appendChild(panel);
    document.body.appendChild(confirmDialog);
    document.body.appendChild(editFab);
    document.body.appendChild(fbFab);
    document.body.appendChild(exportFab);
    document.body.appendChild(elemToolbar);
    document.body.appendChild(fontPicker);

    // sections
    const sections = document.querySelectorAll('section.slide, section.section, section[data-screen-label], main > section, main > article');
    let secCounter = 0;
    sections.forEach((sec) => {
      const secId = 'fbw-sec-' + (secCounter++);
      sec.dataset.fbwSecId = secId;
      const label = (sec.dataset.screenLabel
                  || sec.dataset.fbwLabel
                  || sec.querySelector('.label')?.innerText
                  || sec.querySelector('h1, h2')?.innerText
                  || ('Section ' + secCounter)).trim();
      sec.dataset.fbwSecLabel = label;
    });

    // editable selectors
    const editableSelectors = [
      'h1','h2','h3','h4','h5','h6','p','li','td','th',
      'blockquote','figcaption','dt','dd',
      '.scribble','.handwritten','.sub','.pre','.lab','.num','.meta',
      '.who','.who small','.qmark','.big','.label','.marker',
      '.kv-key','.kv-val','.cell','.timeline-event','.timeline-date',
      '.col h3','.stat h3','.card h3','.node h3','.pane h3','.pane h4',
      '.step h4','.step p','.right-card-title','.right-card-judge',
      '.value-card-title','.value-card-text','.skill-card-desc',
      '.drama-meta-sub','.weeks-h-text','.weeks-h-num',
      '.proof-img-cap','.status-pill','.lockup'
    ].join(', ');
    const originals = new Map();   // id -> 初始文本
    let idCounter = 0;
    function isCandidate(el) {
      if (!el) return false;
      if (el.closest('.fbw-panel, .fbw-fab, .fbw-toast, .fbw-confirm, script, style, button, [data-fbw-noedit]')) return false;
      if (el.matches('button, br, img, svg, path, use, a[href]')) return false;
      if (el.dataset.fbwEditId) return false;
      if (!el.textContent.trim()) return false;
      return true;
    }
    // 用 textContent + 仅 trim 头尾(保留中间换行/空格,这些用户可能有意改动)
    // 不归一化中间 \s 是为了让"加空格"和"加换行"也能被识别为改动
    function getText(el) {
      return (el.textContent || '').replace(/^\s+|\s+$/g, '');
    }
    function register(el) {
      if (!isCandidate(el)) return;
      const id = 'fbw-e-' + (idCounter++);
      el.dataset.fbwEditId = id;
      originals.set(id, getText(el));
    }
    // 暴露 originals 到 window 方便 console 调试
    window.__fbwOriginals = originals;
    document.querySelectorAll(editableSelectors).forEach(register);
    document.querySelectorAll('section *, main *, article *, footer *').forEach((el) => {
      if (el.children.length > 0) return;
      if (el.dataset.fbwEditId) return;
      register(el);
    });

    // ───── 6. 状态 + 持久化 ─────
    const sectionFeedback = new Map();
    const attachments = [];
    let editsFromStorage = {};
    const elementOps = new Map();   // el -> { ops: [...], descriptor }   元素级操作记录

    // ───── 元素选中 / 工具栏 ─────
    let selectedEl = null;

    function getElDescriptor(el) {
      const sec = el.closest('[data-fbw-sec-id]');
      const secLabel = sec?.dataset.fbwSecLabel || '?';
      const tag = el.tagName.toLowerCase();
      const cls = [...el.classList].filter(c => !c.startsWith('fbw-')).slice(0,2).join('.');
      const text = (el.textContent || '').replace(/\\s+/g,' ').trim().slice(0,28);
      return `[${secLabel}] · ${tag}${cls?'.'+cls:''}${text?` · "${text}"`:''}`;
    }
    function recordOp(el, op, args) {
      if (!elementOps.has(el)) {
        elementOps.set(el, { ops: [], descriptor: getElDescriptor(el) });
      }
      const rec = elementOps.get(el);
      rec.ops = rec.ops.filter(o => o.op !== op);
      const opObj = { op };
      if (args !== undefined) opObj.args = args;
      rec.ops.push(opObj);
      updateCounter();
    }
    function clearOpsOn(el) { elementOps.delete(el); updateCounter(); }

    // transform 状态读写(translate + scale 一起)
    function getElTransform(el) {
      return {
        x: parseFloat(el.dataset.fbwTx || '0'),
        y: parseFloat(el.dataset.fbwTy || '0'),
        scale: parseFloat(el.dataset.fbwScale || '1')
      };
    }
    function setElTransform(el, t) {
      el.dataset.fbwTx = t.x;
      el.dataset.fbwTy = t.y;
      el.dataset.fbwScale = t.scale;
      const parts = [];
      if (t.x !== 0 || t.y !== 0) parts.push(`translate(${t.x}px, ${t.y}px)`);
      if (t.scale !== 1) parts.push(`scale(${t.scale})`);
      el.style.transform = parts.join(' ');
    }

    function positionToolbar(el) {
      const rect = el.getBoundingClientRect();
      const tbRect = elemToolbar.getBoundingClientRect();
      let top = rect.top - tbRect.height - 8;
      let left = rect.left;
      if (top < 8) top = rect.bottom + 8;
      if (left + tbRect.width > window.innerWidth - 8) left = window.innerWidth - tbRect.width - 8;
      if (left < 8) left = 8;
      elemToolbar.style.top = top + 'px';
      elemToolbar.style.left = left + 'px';
    }
    function selectElement(el) {
      if (selectedEl === el) return;
      deselectElement();
      selectedEl = el;
      el.classList.add('fbw-selected');
      elemToolbar.querySelector('[data-tb-label]').textContent = getElDescriptor(el);
      const isImg = el.matches('img') || (getComputedStyle(el).backgroundImage || 'none') !== 'none';
      elemToolbar.querySelector('[data-op="replace-img"]').style.display = isImg ? 'inline-flex' : 'none';
      elemToolbar.classList.add('fbw-toolbar-open');
      positionToolbar(el);
    }
    function deselectElement() {
      if (selectedEl) selectedEl.classList.remove('fbw-selected');
      selectedEl = null;
      window.__fbwSelEl = null;
      closeFontPicker();
      elemToolbar.classList.remove('fbw-toolbar-open');
    }
    // 把 click target "语义提升"到一个完整可操作的元素
    // 例如:点 svg 内的 path/use → 提升到 svg 顶层
    function liftTarget(el) {
      if (!el) return el;
      // SVG 子元素 → 选整个 svg
      const svg = el.closest('svg');
      if (svg && !svg.matches('.fbw-icon-btn svg, .fbw-elem-toolbar svg, .fbw-fab svg, .fbw-panel svg')) {
        return svg;
      }
      return el;
    }

    // 单击 = 选中元素 + 显示工具栏
    // 关键:只处理 section.slide 内部 click,避免拦截 deck-stage 的翻页 tap-zones
    document.addEventListener('click', (e) => {
      if (!editMode) return;
      let target = e.target;
      if (!target || target.closest('.fbw-panel, .fbw-fab, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, script, style')) return;
      // 必须落在 slide/section/article/main 内容里
      if (!target.closest('section.slide, section.section, section[data-screen-label], main > section, main > article, footer')) return;
      target = liftTarget(target);
      if (target.isContentEditable && target === selectedEl) return;
      e.preventDefault(); e.stopPropagation();
      selectElement(target);
    }, true);

    // 双击 = 直接进入编辑文字模式
    document.addEventListener('dblclick', (e) => {
      if (!editMode) return;
      let target = e.target;
      if (!target || target.closest('.fbw-panel, .fbw-fab, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, script, style')) return;
      if (!target.closest('section.slide, section.section, section[data-screen-label], main > section, main > article, footer')) return;
      target = liftTarget(target);
      if (target.tagName.toLowerCase() === 'svg') return;
      e.preventDefault(); e.stopPropagation();
      enterTextEdit(target);
    }, true);

    // 失焦时关闭 contenteditable
    document.addEventListener('blur', (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.fbwEditing === '1') {
        t.contentEditable = 'false';
        delete t.dataset.fbwEditing;
      }
    }, true);

    function enterTextEdit(el) {
      deselectElement();
      el.contentEditable = 'true';
      el.spellcheck = false;
      el.dataset.fbwEditing = '1';
      el.focus();
      // 选中其内容,直接打字替换
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
      } catch (err) {}
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (selectedEl) { e.preventDefault(); deselectElement(); }
        // 如果在 contenteditable 里,Esc 也退出编辑
        const t = document.activeElement;
        if (t && t.dataset && t.dataset.fbwEditing === '1') {
          t.contentEditable = 'false';
          delete t.dataset.fbwEditing;
          t.blur();
        }
      }
    });
    elemToolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-op]');
      if (!btn || !selectedEl) return;
      e.stopPropagation();
      const op = btn.dataset.op;
      const el = selectedEl;
      if (op === 'close') { deselectElement(); return; }
      if (op === 'edit-text') {
        enterTextEdit(el);
        return;
      }
      if (op === 'delete') { recordOp(el, 'delete'); el.dataset.fbwOpDeleted = '1'; showToast('已标记 删除'); return; }
      if (op === 'hide')   { recordOp(el, 'hide');   el.dataset.fbwOpHidden  = '1'; showToast('已标记 隐藏'); return; }
      if (op === 'restore') {
        delete el.dataset.fbwOpDeleted;
        delete el.dataset.fbwOpHidden;
        delete el.dataset.fbwTx; delete el.dataset.fbwTy; delete el.dataset.fbwScale;
        el.style.transform = ''; el.style.backgroundImage = '';
        if (el.tagName === 'IMG' && el.dataset.fbwOriginalSrc) { el.src = el.dataset.fbwOriginalSrc; delete el.dataset.fbwOriginalSrc; }
        clearOpsOn(el); showToast('已还原');
        positionToolbar(el);
        return;
      }
      if (op.startsWith('move-')) {
        const dir = op.slice(5);
        const t = getElTransform(el);
        const step = e.shiftKey ? 16 : 4;
        if (dir === 'up') t.y -= step;
        if (dir === 'down') t.y += step;
        if (dir === 'left') t.x -= step;
        if (dir === 'right') t.x += step;
        setElTransform(el, t);
        recordOp(el, 'move', { x: t.x, y: t.y });
        positionToolbar(el);
        return;
      }
      if (op === 'zoom-in' || op === 'zoom-out') {
        const t = getElTransform(el);
        const factor = op === 'zoom-in' ? 1.1 : (1/1.1);
        t.scale = Math.max(0.2, Math.min(3, t.scale * factor));
        setElTransform(el, t);
        recordOp(el, 'scale', { scale: parseFloat(t.scale.toFixed(3)) });
        positionToolbar(el);
        return;
      }
      if (op === 'drag') {
        showToast('按住已选元素直接拖');
        return;
      }
      if (op === 'font') {
        window.__fbwSelEl = el;
        if (fontPicker.classList.contains('fbw-fp-open')) closeFontPicker();
        else openFontPicker();
        return;
      }
      if (op === 'replace-img') {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = (ev) => {
          const file = ev.target.files[0]; if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (el.tagName === 'IMG') {
              if (!el.dataset.fbwOriginalSrc) el.dataset.fbwOriginalSrc = el.src;
              el.src = reader.result;
            } else {
              el.style.backgroundImage = `url(${reader.result})`;
            }
            recordOp(el, 'replace-img', { name: file.name });
            attachments.push({
              id: 'fbw-att-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
              name: file.name || ('替换图-' + Date.now() + '.png'),
              dataURL: reader.result, type: file.type
            });
            renderAttachments();
            showToast('已替换图片');
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    });
    fontPicker.addEventListener('click', (e) => {
      const item = e.target.closest('.fbw-fp-item');
      if (!item || !selectedEl) return;
      e.stopPropagation();
      const family = item.dataset.fpFamily;
      const name = item.dataset.fpName;
      const el = selectedEl;
      if (family === '__inherit__') {
        el.style.fontFamily = '';
        delete el.dataset.fbwFontName;
        recordOp(el, 'font', { family: '系统默认' });
      } else {
        el.style.fontFamily = family;
        el.dataset.fbwFontName = name;
        recordOp(el, 'font', { family: name });
      }
      showToast('字体: ' + name);
      closeFontPicker();
    });
    document.addEventListener('mousedown', (e) => {
      if (!fontPicker.classList.contains('fbw-fp-open')) return;
      if (e.target.closest('.fbw-font-picker, .fbw-elem-toolbar')) return;
      closeFontPicker();
    }, true);

    let _scrollRaf = null;
    function followToolbar() {
      if (!selectedEl) return;
      if (_scrollRaf) cancelAnimationFrame(_scrollRaf);
      _scrollRaf = requestAnimationFrame(() => {
        positionToolbar(selectedEl);
        if (fontPicker.classList.contains('fbw-fp-open')) positionFontPicker();
      });
    }
    window.addEventListener('scroll', followToolbar, true);
    window.addEventListener('resize', followToolbar);
    document.addEventListener('slidechange', () => deselectElement());

    // ───── 拖拽:mousedown 在已选中元素上(且不在工具栏内)→ 进入拖拽
    let dragState = null;
    document.addEventListener('mousedown', (e) => {
      if (!editMode || !selectedEl) return;
      if (e.button !== 0) return;
      if (e.target.closest('.fbw-elem-toolbar, .fbw-panel, .fbw-fab')) return;
      // 必须按在已选中元素上才进入拖拽
      const t = e.target;
      const lifted = liftTarget(t);
      const sameAsSelected = (t === selectedEl) || (lifted === selectedEl) || selectedEl.contains(t);
      if (!sameAsSelected) return;
      // 如果该元素正在 contenteditable,不进入拖拽
      if (selectedEl.dataset.fbwEditing === '1') return;
      e.preventDefault();
      const tr = getElTransform(selectedEl);
      dragState = {
        el: selectedEl,
        startX: e.clientX, startY: e.clientY,
        baseX: tr.x, baseY: tr.y, baseScale: tr.scale,
        moved: false
      };
      document.body.style.cursor = 'move';
    }, true);
    document.addEventListener('mousemove', (e) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      if (!dragState.moved && Math.abs(dx) + Math.abs(dy) < 4) return; // 抖动忽略
      dragState.moved = true;
      const t = { x: dragState.baseX + dx, y: dragState.baseY + dy, scale: dragState.baseScale };
      setElTransform(dragState.el, t);
      followToolbar();
    });
    document.addEventListener('mouseup', () => {
      if (!dragState) return;
      const el = dragState.el;
      if (dragState.moved) {
        const tr = getElTransform(el);
        recordOp(el, 'move', { x: Math.round(tr.x), y: Math.round(tr.y) });
      }
      dragState = null;
      document.body.style.cursor = '';
    });

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        // 全局反馈
        if (data.globalNote) panel.querySelector('[data-fbw-global]').value = data.globalNote;
        // 各页反馈
        if (data.sectionFeedback) {
          Object.entries(data.sectionFeedback).forEach(([k, v]) => sectionFeedback.set(k, v));
        }
        // 附件
        if (Array.isArray(data.attachments)) {
          data.attachments.forEach(a => attachments.push(a));
        }
        // ⚠️ 不再持久化/回填编辑改动到 element
        // 原因: el.textContent = val 会破坏 element 内的 <br/><em> 等 HTML 结构,
        //      导致富文本元素(如 cover h1)被毁掉。改动当场处理(复制/下载)即可。
      } catch (e) { /* ignore */ }
    }
    function saveState() {
      try {
        const edits = {};
        document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
          const id = el.dataset.fbwEditId;
          const txt = getText(el);
          if (originals.get(id) !== txt) edits[id] = txt;
        });
        const sectionObj = {};
        sectionFeedback.forEach((v, k) => { sectionObj[k] = v; });
        const data = {
          globalNote: panel.querySelector('[data-fbw-global]').value,
          sectionFeedback: sectionObj,
          attachments: attachments.map(a => ({ name: a.name, dataURL: a.dataURL, type: a.type })),
          edits,
          savedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) { /* quota / serialize errors ignored */ }
    }
    // 节流保存
    let saveTimer = null;
    function scheduleSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(saveState, 400);
    }

    // 当前页识别
    let currentSec = null;
    function setCurrentSlide(slideEl) {
      currentSec = slideEl;
      const pageEl = panel.querySelector('[data-fbw-current-page]');
      const taEl = panel.querySelector('[data-fbw-current-text]');
      const savedTag = panel.querySelector('[data-fbw-saved]');
      if (!slideEl) {
        pageEl.textContent = '—';
        taEl.value = '';
        taEl.disabled = true;
        savedTag.classList.remove('fbw-on');
        return;
      }
      taEl.disabled = false;
      pageEl.textContent = slideEl.dataset.fbwSecLabel || 'Section';
      const secId = slideEl.dataset.fbwSecId;
      const existing = sectionFeedback.get(secId);
      taEl.value = existing?.note || '';
      savedTag.classList.toggle('fbw-on', !!existing);
    }
    panel.querySelector('[data-fbw-current-text]').addEventListener('input', (e) => {
      if (!currentSec) return;
      const secId = currentSec.dataset.fbwSecId;
      const label = currentSec.dataset.fbwSecLabel;
      const note = e.target.value.trim();
      if (note) {
        sectionFeedback.set(secId, { label, note });
        panel.querySelector('[data-fbw-saved]').classList.add('fbw-on');
      } else {
        sectionFeedback.delete(secId);
        panel.querySelector('[data-fbw-saved]').classList.remove('fbw-on');
      }
      updateCounter();
      scheduleSave();
    });
    ['keydown','keyup','keypress'].forEach(ev =>
      panel.querySelector('[data-fbw-current-text]').addEventListener(ev, e => e.stopPropagation()));

    // 全局反馈输入也要保存
    panel.querySelector('[data-fbw-global]').addEventListener('input', scheduleSave);

    // deck-stage 集成
    const deckStage = document.querySelector('deck-stage');
    if (deckStage) {
      document.addEventListener('slidechange', (e) => setCurrentSlide(e.detail?.slide || null));
      const first = deckStage.querySelector('section.slide') || sections[0];
      if (first) setCurrentSlide(first);
    } else {
      document.body.classList.add('fbw-no-overlay');
      if (sections.length) {
        const io = new IntersectionObserver((entries) => {
          const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setCurrentSlide(visible.target);
        }, { threshold: [0.3, 0.5, 0.7] });
        sections.forEach(s => io.observe(s));
        setCurrentSlide(sections[0]);
      }
    }

    // 编辑模式
    let editMode = false;
    let editToggleBtn = null;
    function toggleEdit() {
      editMode = !editMode;
      document.body.classList.toggle('fbw-edit-mode', editMode);
      // 关编辑模式时把所有 contenteditable 收回 + 取消选中
      if (!editMode) {
        document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
          el.contentEditable = 'false';
          el.spellcheck = false;
        });
        deselectElement();
      } else {
        // 开启时先全部 false,等用户单击才选中(单击=选元素,双击=编辑文字)
        document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
          el.contentEditable = 'false';
          el.spellcheck = false;
        });
      }
      if (editToggleBtn) editToggleBtn.classList.toggle('fbw-active', editMode);
      editFab.classList.toggle('fbw-active', editMode);
      showToast(editMode
        ? '编辑模式 · 单击=选中元素,双击=编辑文字,Esc=取消'
        : '编辑已关闭');
    }
    editFab.addEventListener('click', toggleEdit);

    function handleEditableChange(e) {
      const id = e.target.dataset?.fbwEditId;
      if (!id) return;
      e.target.classList.toggle('fbw-changed', originals.get(id) !== getText(e.target));
      updateCounter();
      scheduleSave();
    }
    // input/paste/cut/drop/compositionend 都监听一遍
    // 中文 IME 输入在某些浏览器不触发 input,要靠 compositionend 兜底
    ['input', 'compositionend', 'paste', 'cut', 'drop'].forEach(ev => {
      document.addEventListener(ev, handleEditableChange, true);
    });
    // 失焦时再扫一次,保证状态一定是最新的
    document.addEventListener('blur', (e) => {
      if (e.target.dataset?.fbwEditId) handleEditableChange(e);
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.target.dataset?.fbwEditId || e.target.closest('.fbw-panel, .fbw-confirm')) {
        e.stopPropagation();
      }
    }, true);

    function getChanges() {
      const changes = [];
      document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
        const id = el.dataset.fbwEditId;
        const orig = originals.get(id);
        const now = getText(el);
        if (orig !== now) {
          const sec = el.closest('[data-fbw-sec-id]');
          changes.push({ id, before: orig, after: now, section: sec?.dataset.fbwSecLabel || '?' });
        }
      });
      return changes;
    }
    function updateCounter() {
      panel.querySelector('[data-fbw-counter="edit"]').textContent = getChanges().length;
      panel.querySelector('[data-fbw-counter="sec"]').textContent = sectionFeedback.size;
      panel.querySelector('[data-fbw-counter="att"]').textContent = attachments.length;
      const opsPill = panel.querySelector('[data-fbw-counter="ops"]');
      if (opsPill) opsPill.textContent = elementOps.size;
    }

    function buildMarkdown() {
      const changes = getChanges();
      const note = panel.querySelector('[data-fbw-global]').value.trim();
      const ts = new Date().toLocaleString('zh-CN', { hour12: false });
      const title = document.title || '页面反馈';
      let md = '# ' + title + ' · 反馈\n\n';
      md += '生成时间: ' + ts + '\n';
      md += '反馈维度: 全局' + (note ? ' OK' : ' —') + ' / 页面 ' + sectionFeedback.size + ' / 编辑 ' + changes.length + ' / 元素 ' + elementOps.size + ' / 截图 ' + attachments.length + '\n\n';
      if (note) md += '## 全局反馈\n\n' + note + '\n\n';
      if (sectionFeedback.size) {
        md += '## 页面反馈 (' + sectionFeedback.size + ' 条)\n\n';
        let i = 0;
        sectionFeedback.forEach(v => { i++; md += '### ' + i + '. ' + v.label + '\n\n' + v.note + '\n\n'; });
      }
      if (changes.length) {
        md += '## 编辑修改 (' + changes.length + ' 处)\n\n';
        changes.forEach((c, i) => {
          md += '### ' + (i + 1) + '. [' + c.section + ']\n\n**原文**:\n```\n' + c.before + '\n```\n\n**改后**:\n```\n' + c.after + '\n```\n\n';
        });
      }
      if (elementOps.size) {
        md += '## 元素操作 (' + elementOps.size + ' 处)\n\n';
        let oi = 0;
        elementOps.forEach((rec) => {
          oi++;
          const opsStr = rec.ops.map(o => {
            if (o.op === 'move') return `move(x=${o.args.x}, y=${o.args.y})`;
            if (o.op === 'replace-img') return `replace-img("${o.args.name}")`;
            return o.op;
          }).join(' + ');
          md += '- ' + rec.descriptor + ' · ' + opsStr + '\n';
        });
        md += '\n';
      }
      if (attachments.length) {
        md += '## 附件截图 (' + attachments.length + ' 张)\n\n> 截图无法通过剪贴板传输。请点【下载备份】获取所有图片，并把它们也拖到 Agent 对话窗。\n\n';
        attachments.forEach((att, i) => { md += '- [截图 ' + (i + 1) + '] ' + att.name + '\n'; });
        md += '\n';
      }
      if (!changes.length && !note && !sectionFeedback.size && !attachments.length) {
        md += '_(没有任何反馈)_\n';
      }
      return md;
    }

    panel.querySelector('[data-fbw-action="copy"]').addEventListener('click', () => {
      const md = buildMarkdown();
      navigator.clipboard.writeText(md)
        .then(() => showToast('已复制到剪贴板'))
        .catch(() => {
          const ta = document.createElement('textarea');
          ta.value = md; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
          showToast('已复制（兼容模式）');
        });
    });
    panel.querySelector('[data-fbw-action="download"]').addEventListener('click', () => {
      const md = buildMarkdown();
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const baseFilename = 'feedback-' + ts;
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = baseFilename + '.md'; a.click(); URL.revokeObjectURL(url);
      attachments.forEach((att, i) => {
        const ext = (att.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const link = document.createElement('a');
        link.href = att.dataURL;
        link.download = baseFilename + '-attach-' + (i + 1) + '.' + ext;
        setTimeout(() => link.click(), (i + 1) * 120);
      });
      showToast(attachments.length ? '已下载 1 个 .md + ' + attachments.length + ' 张截图' : '已下载 .md');
    });

    function showToast(msg) {
      const t = document.createElement('div');
      t.className = 'fbw-toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2400);
    }

    // ───── 导出 PDF(原页面 window.print,复用 deck-stage 内置 print mode) ─────
    function exportPDF(opts) {
      opts = opts || {};
      panel.classList.remove('fbw-open');
      if (fbToggleBtn) fbToggleBtn.classList.remove('fbw-active');
      fbFab.classList.remove('fbw-active');
      try { deselectElement(); } catch (_) {}
      if (opts.image) {
        return exportImagePDF();
      }
      document.body.classList.add('fbw-printing');
      showToast('矢量 PDF · 打印对话框选「另存为 PDF」(Shift+点击 = 图片版)');
      setTimeout(() => {
        try { window.print(); } catch (e) { console.error(e); }
        setTimeout(() => document.body.classList.remove('fbw-printing'), 2000);
      }, 250);
    }

    // ───── 导出图片版 PDF(原页面截图 + jsPDF 拼接) ─────
    function loadExportLibs() {
      return new Promise(resolve => {
        const needs = [];
        if (!window.html2canvas) needs.push('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
        if (!window.jspdf) needs.push('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        if (!needs.length) return resolve(true);
        let done = 0;
        needs.forEach(src => {
          const s = document.createElement('script');
          s.src = src;
          s.onload = s.onerror = () => { if (++done === needs.length) resolve(!!(window.html2canvas && window.jspdf)); };
          document.head.appendChild(s);
        });
      });
    }
    async function exportImagePDF() {
      showToast('正在加载图片库...');
      const ok = await loadExportLibs();
      if (!ok) { showToast('图片库加载失败,需要联网'); return; }

      const ds = document.querySelector('deck-stage');
      const designW = ds ? (parseInt(ds.getAttribute('width'), 10) || 1920) : 1920;
      const designH = ds ? (parseInt(ds.getAttribute('height'), 10) || 1080) : 1080;

      const slides = [...document.querySelectorAll('section.slide')];
      if (!slides.length) { showToast('没找到 slide'); return; }

      // 备份当前 active 状态
      const activeStates = slides.map(s => s.hasAttribute('data-deck-active'));

      // 进入打印态:隐藏 widget UI
      document.body.classList.add('fbw-printing');

      // 临时给 deck-stage 关掉 transform 缩放, 让 slide 渲染回 1:1
      let canvasEl = null, oldTransform = '';
      try { canvasEl = ds && ds.shadowRoot && ds.shadowRoot.querySelector('.canvas'); } catch(_) {}
      if (canvasEl) {
        oldTransform = canvasEl.style.transform || '';
        canvasEl.style.transform = 'none';
      }

      const { jsPDF } = window.jspdf;
      const orientation = designW > designH ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ unit: 'px', format: [designW, designH], orientation, hotfixes: ['px_scaling'] });

      // 把 <use href="#xx"> 展开为 inline <g> (html2canvas 不解析 use 引用)
      // 收集恢复点, 截完后回退
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
          const placeholder = useEl;  // 保留原 use 节点引用
          // 把 use 替换为 g, 但在 g 上挂一个引用让我们能恢复
          useEl.parentNode.insertBefore(g, useEl);
          useEl.parentNode.removeChild(useEl);
          restorePoints.push({ g, original: placeholder, parentSvg, vbAdded });
        });
      });

      showToast('截图中 0 / ' + slides.length);

      try {
        for (let i = 0; i < slides.length; i++) {
          // 让目标 slide active, 其他 inactive
          slides.forEach((s, j) => {
            if (j === i) s.setAttribute('data-deck-active', '');
            else s.removeAttribute('data-deck-active');
          });
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          try { await document.fonts.ready; } catch (_) {}

          showToast('截图中 ' + (i + 1) + ' / ' + slides.length);

          const baseOpts = {
            width: designW, height: designH,
            windowWidth: designW, windowHeight: designH,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          };
          let canvas;
          try {
            // 优先 foreignObject 模式 (浏览器原生渲染, SVG/CSS 支持最好)
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
        showToast('已保存 ' + fname);
      } catch (err) {
        console.error(err);
        showToast('导出失败: ' + (err.message || err));
      } finally {
        // 恢复 use 引用 (反向: 把 g 替换回原 use, 移除我们临时加的 viewBox)
        restorePoints.forEach(r => {
          try {
            r.g.parentNode.insertBefore(r.original, r.g);
            r.g.parentNode.removeChild(r.g);
            if (r.vbAdded && r.parentSvg) r.parentSvg.removeAttribute('viewBox');
          } catch (_) {}
        });
        // 恢复 deck-stage 状态
        if (canvasEl) canvasEl.style.transform = oldTransform;
        slides.forEach((s, j) => {
          if (activeStates[j]) s.setAttribute('data-deck-active', '');
          else s.removeAttribute('data-deck-active');
        });
        document.body.classList.remove('fbw-printing');
      }
    }
    // ───── 旧的"新窗口"导出方案(已废弃,留底以备回滚) ─────
    function exportPDFInNewWindow() {
      panel.classList.remove('fbw-open');
      if (fbToggleBtn) fbToggleBtn.classList.remove('fbw-active');
      fbFab.classList.remove('fbw-active');

      const slides = document.querySelectorAll('section.slide, section.section, section[data-screen-label], main > section, main > article');
      if (!slides.length) {
        showToast('找不到 slide,使用原生打印');
        setTimeout(() => window.print(), 200);
        return;
      }
      showToast('正在准备导出 · 共 ' + slides.length + ' 页');

      // 优先用 deck-stage 的设计稿尺寸(slide CSS 是按这个尺寸写的)
      // 退而求其次:用 slide 视口尺寸(可能被 deck-stage 缩放过,会失真)
      const ds = document.querySelector('deck-stage');
      let designW = 1920, designH = 1080;
      if (ds) {
        const wAttr = parseInt(ds.getAttribute('width'), 10);
        const hAttr = parseInt(ds.getAttribute('height'), 10);
        if (wAttr > 0) designW = wAttr;
        if (hAttr > 0) designH = hAttr;
        // 也尝试读 --deck-design-w 变量(deck-stage.js 会注入)
        const cssW = ds.style.getPropertyValue('--deck-design-w') || (ds._canvas && ds._canvas.style.getPropertyValue('--deck-design-w'));
        const cssH = ds.style.getPropertyValue('--deck-design-h') || (ds._canvas && ds._canvas.style.getPropertyValue('--deck-design-h'));
        const px = (s) => { const n = parseFloat(s); return isFinite(n) && n > 0 ? n : null; };
        const cw = px(cssW); if (cw) designW = cw;
        const ch = px(cssH); if (ch) designH = ch;
      }
      const PX_TO_MM = 25.4 / 96;
      const wpx = designW;
      const hpx = designH;
      const wmm = (designW * PX_TO_MM).toFixed(2);
      const hmm = (designH * PX_TO_MM).toFixed(2);

      // 收集样式:优先尝试读 cssRules 内联(避免 file:// 下 link 重新加载或 CORS 问题)
      // 读不到的(跨域 stylesheet)再回退用 link 引用
      let collectedStyles = '';
      for (const sheet of document.styleSheets) {
        // 跳过 widget 自身注入的 stylesheet
        if (sheet.ownerNode && sheet.ownerNode.dataset && sheet.ownerNode.dataset.fbwInternal) continue;
        let rulesText = null;
        try {
          if (sheet.cssRules) {
            // 逐条过滤掉 .fbw- 选择器(单条排除,不连累整张)
            rulesText = [...sheet.cssRules]
              .filter(r => !(r.selectorText && /^\s*\.fbw-/.test(r.selectorText)))
              .map(r => r.cssText)
              .join('\n');
          }
        } catch (_) { /* CORS blocked */ }
        if (rulesText) {
          collectedStyles += `<style>${rulesText}</style>\n`;
        } else if (sheet.href) {
          collectedStyles += `<link rel="stylesheet" href="${sheet.href}">\n`;
        }
      }

      // 收集页面里的 SVG sprite (含 <symbol>/<defs>),不在 slide 内的全要带过去
      // 否则新窗口里 <use href="#pin"> 全部失效
      const sprites = [...document.querySelectorAll('svg')]
        .filter(s => s.querySelector('symbol, defs'))
        .filter(s => !s.closest('section.slide, section.section, section[data-screen-label]'))
        .map(s => s.outerHTML)
        .join('\n');

      // 解析所有 symbol 定义节点(保留 SVG namespace),后续把 <use> 替换为内联内容
      // 原因: Chrome 矢量 PDF 打印时对跨容器 <use href="#id"> 引用有 bug,会渲染为空
      const symbolMap = new Map();
      document.querySelectorAll('symbol[id]').forEach(sym => {
        symbolMap.set(sym.id, sym);
      });
      const SVG_NS = 'http://www.w3.org/2000/svg';
      function inlineUseRefs(root) {
        root.querySelectorAll('use').forEach(useEl => {
          const href = useEl.getAttribute('href') || useEl.getAttribute('xlink:href') || '';
          const id = href.replace(/^#/, '');
          const sym = symbolMap.get(id);
          if (!sym) return;
          // 父级 svg 没 viewBox 时, 用 symbol 的 viewBox 兜底
          const parentSvg = useEl.ownerSVGElement;
          const symVb = sym.getAttribute('viewBox');
          if (parentSvg && !parentSvg.getAttribute('viewBox') && symVb) {
            parentSvg.setAttribute('viewBox', symVb);
          }
          // 用 createElementNS 保 SVG namespace, cloneNode 复制 symbol 子节点(节点本身已是 SVG ns)
          const g = document.createElementNS(SVG_NS, 'g');
          [...sym.childNodes].forEach(child => {
            g.appendChild(child.cloneNode(true));
          });
          // 保留 use 上的 transform / fill / stroke / class
          ['transform', 'fill', 'stroke', 'class', 'opacity', 'style'].forEach(attr => {
            const v = useEl.getAttribute(attr);
            if (v) g.setAttribute(attr, v);
          });
          useEl.replaceWith(g);
        });
      }

      // 收集 head 里 @font-face / link[rel=preload as=font] 等
      const fontLinks = [...document.querySelectorAll('link[rel="preload"][as="font"], link[as="font"]')]
        .map(l => l.outerHTML).join('\n');

      // 把每个 slide 克隆,并强制激活态(deck-stage 通常只显示 .active 那一张)
      const slidesHTML = [...slides].map(s => {
        const clone = s.cloneNode(true);
        clone.classList.add('active');
        clone.classList.add('is-active');
        clone.classList.add('current');
        clone.removeAttribute('hidden');
        clone.removeAttribute('aria-hidden');
        clone.style.display = '';
        clone.style.visibility = 'visible';
        clone.style.opacity = '1';
        clone.querySelectorAll('[data-fbw-op-deleted]').forEach(el => el.remove());
        clone.querySelectorAll('[data-fbw-op-hidden]').forEach(el => { el.style.visibility = 'hidden'; });
        clone.querySelectorAll('.fbw-selected').forEach(el => el.classList.remove('fbw-selected'));
        // 把 <use href="#xx"> 全部替换为内联 symbol 内容 (Chrome print 对跨容器 use 有 bug)
        inlineUseRefs(clone);
        return `<div class="fbw-print-page-wrap"><div class="fbw-print-page">${clone.outerHTML}</div></div>`;
      }).join('\n');

      const baseHref = document.baseURI;
      const html = `<!DOCTYPE html>
<html lang="${document.documentElement.lang || 'zh'}">
<head>
<meta charset="utf-8">
<title>导出 · ${document.title}</title>
<base href="${baseHref}">
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"><\/script>
${fontLinks}
${collectedStyles}
<style>
  @page { size: ${wpx}px ${hpx}px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  /* 强制颜色和背景输出,Chrome 默认会丢背景 */
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  .fbw-print-page {
    width: ${wpx}px !important;
    height: ${hpx}px !important;
    page-break-after: always;
    break-after: page;
    position: relative !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    background: #fff;
  }
  .fbw-print-page:last-child { page-break-after: auto; break-after: auto; }
  /* 强制 slide 铺满 + 激活态 + 显示 */
  .fbw-print-page > section,
  .fbw-print-page > section.slide,
  .fbw-print-page > .slide {
    position: absolute !important;
    top: 0 !important; left: 0 !important;
    right: 0 !important; bottom: 0 !important;
    width: 100% !important; height: 100% !important;
    max-width: none !important; max-height: none !important;
    min-width: 0 !important; min-height: 0 !important;
    transform: none !important;
    translate: none !important;
    margin: 0 !important;
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: auto !important;
    pointer-events: auto !important;
  }
  /* 屏幕预览态:让用户在新窗口先看到效果 */
  @media screen {
    body {
      padding: 32px 0;
      background: #d9d9d9;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }
    .fbw-print-page-wrap {
      /* 占位盒子, 跟随缩放后的视觉尺寸 */
      width: calc(${wpx}px * var(--fbw-zoom, 1));
      height: calc(${hpx}px * var(--fbw-zoom, 1));
      position: relative;
      box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    }
    .fbw-print-page-wrap .fbw-print-page {
      transform-origin: top left;
      transform: scale(var(--fbw-zoom, 1));
      margin: 0 !important;
      position: absolute !important;
      top: 0; left: 0;
    }
    .fbw-print-bar {
      position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
      z-index: 99999;
      display: flex; gap: 12px; align-items: center;
      background: #1a1a1a; color: #fff; padding: 10px 16px;
      border-radius: 999px; font: 13px/1 -apple-system, sans-serif;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .fbw-print-bar button {
      background: #00d4aa; color: #000; border: 0;
      padding: 7px 16px; border-radius: 999px;
      font-weight: 600; cursor: pointer; font-size: 13px;
    }
    .fbw-print-bar button:hover { background: #00b894; }
    .fbw-print-bar .fbw-print-status { color: rgba(255,255,255,0.6); font-size: 12px; }
  }
  @media print {
    body { padding: 0 !important; background: #fff !important; display: block !important; gap: 0 !important; }
    .fbw-print-bar { display: none !important; }
    .fbw-print-page-wrap {
      width: ${wpx}px !important;
      height: ${hpx}px !important;
      box-shadow: none !important;
      page-break-after: always;
      break-after: page;
    }
    .fbw-print-page-wrap:last-child { page-break-after: auto; break-after: auto; }
    .fbw-print-page-wrap .fbw-print-page {
      transform: none !important;
      width: ${wpx}px !important;
      height: ${hpx}px !important;
      position: relative !important;
    }
  }
</style>
</head>
<body>
<!-- SVG sprite (symbol/defs) for <use href="#..."> references -->
<div style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">${sprites}</div>
<div class="fbw-print-bar">
  <span class="fbw-print-status" id="fbw-status">共 ${slides.length} 页 · 资源加载中...</span>
  <button onclick="window.print()" title="矢量 PDF · 文件小, 文字可选">打印 / 矢量 PDF</button>
  <button onclick="exportImagePDF()" id="fbw-img-btn" title="每页转图片再拼 PDF · 100% 保真, 字体不会替换" style="background:#ffd166;">图片版 PDF</button>
</div>
${slidesHTML}
<script>
  function fitZoom() {
    const w = window.innerWidth;
    const target = w - 64;  // 留边
    const zoom = Math.min(1, target / ${wpx});
    document.documentElement.style.setProperty('--fbw-zoom', zoom.toFixed(4));
  }
  fitZoom();
  window.addEventListener('resize', fitZoom);

  async function exportImagePDF() {
    const status = document.getElementById('fbw-status');
    const btn = document.getElementById('fbw-img-btn');
    if (!window.html2canvas || !window.jspdf) {
      status.textContent = '图片库未加载完成,请稍后重试或检查网络';
      return;
    }
    btn.disabled = true; btn.style.opacity = '0.6';

    // 截图前临时还原缩放,让 html2canvas 拿到 1:1 渲染
    const root = document.documentElement;
    const oldZoom = root.style.getPropertyValue('--fbw-zoom');
    root.style.setProperty('--fbw-zoom', '1');
    await new Promise(r => requestAnimationFrame(r));

    const pages = document.querySelectorAll('.fbw-print-page');
    const W = ${wpx}, H = ${hpx};
    const orientation = W > H ? 'landscape' : 'portrait';
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'px', format: [W, H], orientation, hotfixes: ['px_scaling'] });

    try {
      for (let i = 0; i < pages.length; i++) {
        status.textContent = '截图中 ' + (i + 1) + ' / ' + pages.length;
        const canvas = await html2canvas(pages[i], {
          width: W, height: H,
          windowWidth: W, windowHeight: H,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        const img = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage([W, H], orientation);
        pdf.addImage(img, 'JPEG', 0, 0, W, H, undefined, 'FAST');
      }
      status.textContent = '保存 PDF...';
      const fname = (document.title || 'deck').replace(/[\\\\\\/:*?"<>|]/g, '_') + '-image.pdf';
      pdf.save(fname);
      status.textContent = '已保存 ' + fname;
    } catch (err) {
      status.textContent = '导出失败: ' + (err.message || err);
      console.error(err);
    } finally {
      // 恢复缩放
      root.style.setProperty('--fbw-zoom', oldZoom || '1');
      fitZoom();
      btn.disabled = false; btn.style.opacity = '1';
    }
  }
  window.exportImagePDF = exportImagePDF;
  (async () => {
    const status = document.getElementById('fbw-status');
    try { await document.fonts.ready; status && (status.textContent = '共 ${slides.length} 页 · 字体已加载,等图片...'); } catch(_) {}
    const imgs = [...document.images].filter(i => !i.complete);
    if (imgs.length) {
      await Promise.all(imgs.map(i => new Promise(res => {
        i.onload = i.onerror = res;
        setTimeout(res, 5000);
      })));
    }
    if (status) status.textContent = '共 ${slides.length} 页 · 已就绪,点右侧按钮打印';
  })();
<\/script>
</body>
</html>`;

      const win = window.open('', '_blank');
      if (!win) {
        showToast('请允许弹出窗口');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
    exportFab.addEventListener('click', (e) => exportPDF({ image: e.shiftKey }));

    // 反馈面板 toggle
    let fbToggleBtn = null;
    function toggleFbPanel() {
      panel.classList.toggle('fbw-open');
      const isOpen = panel.classList.contains('fbw-open');
      if (fbToggleBtn) fbToggleBtn.classList.toggle('fbw-active', isOpen);
      fbFab.classList.toggle('fbw-active', isOpen);
      if (isOpen) {
        document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
          const id = el.dataset.fbwEditId;
          el.classList.toggle('fbw-changed', originals.get(id) !== getText(el));
        });
        updateCounter();
        scheduleSave();
        if (currentSec) setCurrentSlide(currentSec);
      }
    }
    panel.querySelector('[data-fbw-close]').addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.remove('fbw-open');
      if (fbToggleBtn) fbToggleBtn.classList.remove('fbw-active');
      fbFab.classList.remove('fbw-active');
    });
    fbFab.addEventListener('click', toggleFbPanel);

    // ───── 7. 清空所有反馈 ─────
    panel.querySelector('[data-fbw-clear-all]').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDialog.classList.add('fbw-on');
    });
    confirmDialog.querySelector('[data-fbw-confirm-cancel]').addEventListener('click', () => {
      confirmDialog.classList.remove('fbw-on');
    });
    confirmDialog.querySelector('[data-fbw-confirm-ok]').addEventListener('click', () => {
      // 清 sectionFeedback
      sectionFeedback.clear();
      // 清 attachments
      attachments.length = 0;
      renderAttachments();
      // 清全局
      panel.querySelector('[data-fbw-global]').value = '';
      // 清当前页 textarea
      panel.querySelector('[data-fbw-current-text]').value = '';
      panel.querySelector('[data-fbw-saved]').classList.remove('fbw-on');
      // 还原所有编辑改动
      document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
        const id = el.dataset.fbwEditId;
        const orig = originals.get(id);
        if (orig !== undefined && getText(el) !== orig) {
          el.innerText = orig;
          el.classList.remove('fbw-changed');
        }
      });
      // 还原元素操作
      elementOps.forEach((_rec, el) => {
        delete el.dataset.fbwOpDeleted;
        delete el.dataset.fbwOpHidden;
        el.style.transform = '';
        el.style.backgroundImage = '';
        if (el.tagName === 'IMG' && el.dataset.fbwOriginalSrc) { el.src = el.dataset.fbwOriginalSrc; delete el.dataset.fbwOriginalSrc; }
      });
      elementOps.clear();
      deselectElement();
      // 清 localStorage
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      updateCounter();
      confirmDialog.classList.remove('fbw-on');
      showToast('已清空所有反馈');
    });

    // 截图
    function addAttachment(blob) {
      if (!blob || !blob.type?.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        attachments.push({
          id: 'fbw-att-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          name: blob.name || ('截图-' + new Date().toISOString().slice(11, 19).replace(/:/g, '') + '.png'),
          dataURL: reader.result,
          type: blob.type
        });
        renderAttachments();
        scheduleSave();
        showToast('已添加截图 (' + attachments.length + ')');
      };
      reader.readAsDataURL(blob);
    }
    function renderAttachments() {
      const c = panel.querySelector('[data-fbw-attachments]');
      c.innerHTML = '';
      attachments.forEach((att, i) => {
        const t = document.createElement('div'); t.className = 'fbw-thumb';
        const img = document.createElement('img'); img.src = att.dataURL;
        const x = document.createElement('button'); x.className = 'fbw-thumb-x'; x.innerHTML = '×'; x.type = 'button';
        x.addEventListener('click', (e) => { e.stopPropagation(); attachments.splice(i, 1); renderAttachments(); updateCounter(); scheduleSave(); });
        t.appendChild(img); t.appendChild(x); c.appendChild(t);
      });
      updateCounter();
    }
    const globalTa = panel.querySelector('[data-fbw-global]');
    ['keydown','keyup','keypress'].forEach(ev =>
      globalTa.addEventListener(ev, e => e.stopPropagation()));
    function handlePaste(e) {
      const items = e.clipboardData?.items; if (!items) return;
      let consumed = false;
      for (const item of items) {
        if (item.type.startsWith('image/')) { const blob = item.getAsFile(); if (blob) { addAttachment(blob); consumed = true; } }
      }
      if (consumed) e.preventDefault();
    }
    globalTa.addEventListener('paste', handlePaste);
    panel.addEventListener('paste', handlePaste);
    panel.addEventListener('dragover', (e) => { e.preventDefault(); if (e.dataTransfer?.types?.includes('Files')) panel.classList.add('fbw-drag-over'); });
    panel.addEventListener('dragleave', (e) => { if (e.target === panel || !panel.contains(e.relatedTarget)) panel.classList.remove('fbw-drag-over'); });
    panel.addEventListener('drop', (e) => { e.preventDefault(); panel.classList.remove('fbw-drag-over'); const files = Array.from(e.dataTransfer?.files || []); files.filter(f => f.type.startsWith('image/')).forEach(addAttachment); });

    // 全局快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.dataset?.fbwEditId) return;
      if (e.target.matches?.('textarea, input')) return;
      if (e.target.closest?.('.fbw-panel, .fbw-confirm')) return;
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); toggleEdit(); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFbPanel(); }
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); exportPDF({ image: e.shiftKey }); }
    });

    // 注入到 deck-stage overlay
    function injectIntoOverlay() {
      const ds = document.querySelector('deck-stage');
      if (!ds || !ds.shadowRoot) { setTimeout(injectIntoOverlay, 80); return; }
      const overlay = ds.shadowRoot.querySelector('.overlay');
      if (!overlay) { setTimeout(injectIntoOverlay, 80); return; }
      if (overlay.querySelector('[data-fbw-btn]')) return;

      const reset = overlay.querySelector('.reset');
      const div1 = document.createElement('span'); div1.className = 'divider';
      const editBtn = document.createElement('button');
      editBtn.className = 'btn'; editBtn.dataset.fbwBtn = 'edit'; editBtn.type = 'button';
      editBtn.title = '编辑模式 (E)';
      editBtn.setAttribute('aria-label', '编辑模式');
      editBtn.innerHTML = ICON_PENCIL.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleEdit(); });

      const div2 = document.createElement('span'); div2.className = 'divider';
      const fbBtn = document.createElement('button');
      fbBtn.className = 'btn'; fbBtn.dataset.fbwBtn = 'feedback'; fbBtn.type = 'button';
      fbBtn.title = '反馈面板 (F)';
      fbBtn.setAttribute('aria-label', '反馈面板');
      fbBtn.innerHTML = ICON_CHAT.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
      fbBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFbPanel(); });

      const div3 = document.createElement('span'); div3.className = 'divider';
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn'; exportBtn.dataset.fbwBtn = 'export'; exportBtn.type = 'button';
      exportBtn.title = '导出 PDF (P) · Shift+点击 = 图片版(保真)';
      exportBtn.setAttribute('aria-label', '导出 PDF');
      exportBtn.innerHTML = ICON_SHARE.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"');
      exportBtn.addEventListener('click', (e) => { e.stopPropagation(); exportPDF({ image: e.shiftKey }); });

      if (reset) reset.after(div1, editBtn, div2, fbBtn, div3, exportBtn);
      else overlay.append(div1, editBtn, div2, fbBtn, div3, exportBtn);
      editToggleBtn = editBtn;
      fbToggleBtn = fbBtn;

      const sty = document.createElement('style');
      sty.textContent = `
        .btn[data-fbw-btn].fbw-active {
          background: rgba(255,255,255,0.20) !important;
          color: #fff !important;
        }
      `;
      ds.shadowRoot.appendChild(sty);

      document.body.classList.remove('fbw-no-overlay');
    }
    if (deckStage) injectIntoOverlay();
    else document.body.classList.add('fbw-no-overlay');

    // ───── 8. 加载已保存状态 ─────
    loadState();
    renderAttachments();
    updateCounter();

    // 离开页面前最后保存一次
    window.addEventListener('beforeunload', saveState);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
