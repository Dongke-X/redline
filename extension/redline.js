(()=>{var r={panel:null,confirmDialog:null,fabBar:null,editFab:null,fbFab:null,marqueeFab:null,pickFab:null,exportFab:null,undoFab:null,redoFab:null,helpFab:null,helpPopover:null,foldFab:null,elemToolbar:null,fontPicker:null,notePopover:null,markerPopover:null,tagPopover:null,resizeHandles:null,onChangeHook:null,selectedEls:new Set,selectedEl:null,editMode:!1,currentSec:null,dragState:null,appMode:"deck",marqueeMode:!1,originals:new Map,elementOps:new Map,sectionFeedback:new Map,attachments:[],annotations:[],editToggleBtn:null,fbToggleBtn:null,saveEditBtn:null,marqueeToggleBtn:null,helpToggleBtn:null};var Le="0.1.21",Ce="fbw-state::"+(location.pathname||"/").slice(0,200);typeof window<"u"&&window.__fbwDebug===void 0&&(window.__fbwDebug=!0);var ae=(...e)=>{typeof window<"u"&&window.__fbwDebug&&console.log("%c[fbw]","color:#7d8471;font-weight:bold;",...e)},jt=["h1","h2","h3","h4","h5","h6","p","li","td","th","blockquote","figcaption","dt","dd","img","a",".scribble",".handwritten",".sub",".pre",".lab",".num",".meta",".who",".who small",".qmark",".big",".label",".marker",".kv-key",".kv-val",".cell",".timeline-event",".timeline-date",".col h3",".stat h3",".card h3",".node h3",".pane h3",".pane h4",".step h4",".step p",".right-card-title",".right-card-judge",".value-card-title",".value-card-text",".skill-card-desc",".drama-meta-sub",".weeks-h-text",".weeks-h-num",".proof-img-cap",".status-pill",".lockup"].join(", "),q="section.slide, section.section, section[data-screen-label], section.cover, section.toc, section.chapter, section[data-provider], main > section, main > article, body > section, body > article, body > header, body > nav, body > footer, header[data-screen-label], nav[data-screen-label]";var Ut=`
    .fbw-panel {
      position: fixed; bottom: 78px; right: 16px;
      /* \u6696\u6DF1\u8272\uFF08\u5E26\u70B9\u68D5\u8C03\uFF09\uFF0C\u547C\u5E94 redline landing \u7684\u7C73\u8272\u57FA\u8C03\uFF0C\u907F\u514D\u51B7\u8C03\u8DDF\u5185\u5BB9\u51B2\u7A81 */
      background: rgba(28, 25, 22, 0.94);
      color: #f5f3ef;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 14px;
      box-shadow:
        0 20px 60px rgba(0,0,0,0.52),
        0 2px 8px rgba(0,0,0,0.30),
        inset 0 1px 0 rgba(255,255,255,0.05);
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
      display: flex; justify-content: space-between;
      align-items: center;
      font-size: 13.5px; font-weight: 600;
      color: #f5f3ef;
      padding-bottom: 11px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      letter-spacing: 0.005em;
      gap: 8px;
    }
    .fbw-head-title {
      display: inline-flex; align-items: center; gap: 8px;
      min-width: 0; flex: 1;
      line-height: 1.4;
    }
    .fbw-head-title > span { word-break: break-word; }
    .fbw-head-title svg { width: 15px; height: 15px; opacity: 0.65; flex-shrink: 0; }
    .fbw-head-actions { flex-shrink: 0; }
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
    /* chip \u8D34\u5DE6\u30014 \u4E2A pill \u7D27\u51D1\u8D34\u53F3\uFF1A\u628A chip \u4E4B\u540E\u7684\u7B2C\u4E00\u4E2A pill \u63A8\u5230\u53F3\u7AEF\uFF0C
       \u540E\u9762\u7684 pill \u8DDF\u7740\u9ED8\u8BA4 6px gap \u7D27\u51D1\u6392\u5217 */
    .fbw-mode-chip + .fbw-pill { margin-left: auto; }
    .fbw-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05);
      color: rgba(245,243,239,0.55);
      padding: 3px 9px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 10.5px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      transition: background 140ms, color 140ms, opacity 140ms;
      /* \u9ED8\u8BA4\uFF08count=0\uFF09\uFF1A\u6DE1\u5316\u6389\uFF0C\u907F\u514D\u4E00\u5806 0 \u5360\u89C6\u89C9\u6743\u91CD */
      opacity: 0.45;
    }
    /* \u6709\u6570\u624D\u70B9\u4EAE \u2014\u2014 JS \u7AEF\u5728 updateCounter \u91CC\u7ED9 pill \u52A0 fbw-has-count */
    .fbw-pill.fbw-has-count {
      opacity: 1;
      background: rgba(220,60,60,0.12);
      color: #ff9d9d;
    }
    .fbw-pill.fbw-has-count [data-fbw-counter] {
      color: #ff8b8b;
      font-weight: 700;
    }
    .fbw-pill svg { width: 11px; height: 11px; }

    .fbw-current {
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      padding: 11px 13px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
    }
    .fbw-current-label {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,243,239,0.42);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .fbw-current-page {
      font-size: 13px;
      color: #f5f3ef;
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
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.28);
      color: #f5f3ef;
      padding: 10px 12px;
      border-radius: 7px;
      font-family: inherit;
      font-size: 12.5px;
      line-height: 1.55;
      resize: vertical;
      box-sizing: border-box;
      display: block;
      transition: border-color 140ms, background 140ms, box-shadow 140ms;
    }
    .fbw-textarea::placeholder {
      color: rgba(245,243,239,0.30);
      font-size: 11.5px;
    }
    .fbw-textarea:focus {
      outline: none;
      border-color: rgba(220,60,60,0.45);
      background: rgba(0,0,0,0.40);
      box-shadow: 0 0 0 3px rgba(220,60,60,0.10);
    }
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
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(245,243,239,0.85);
      padding: 8px 13px;
      border-radius: 7px;
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
    .fbw-btn:hover {
      background: rgba(255,255,255,0.10);
      border-color: rgba(255,255,255,0.16);
      color: #f5f3ef;
    }
    /* primary\uFF1A\u54C1\u724C\u7EA2\u586B\u5145\uFF0C\u4E3B\u64CD\u4F5C\u8FA8\u8BC6\u5EA6\u76F4\u63A5\u62C9\u6EE1 */
    .fbw-btn.fbw-primary {
      background: linear-gradient(180deg, #dc3c3c 0%, #c8302d 100%);
      border-color: rgba(220,60,60,0.5);
      color: #fff;
      font-weight: 600;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.25),
        inset 0 1px 0 rgba(255,255,255,0.18);
    }
    .fbw-btn.fbw-primary:hover {
      background: linear-gradient(180deg, #e54848 0%, #d23533 100%);
      border-color: rgba(220,60,60,0.7);
      box-shadow:
        0 2px 6px rgba(220,60,60,0.30),
        inset 0 1px 0 rgba(255,255,255,0.22);
    }
    .fbw-btn.fbw-primary:active {
      background: linear-gradient(180deg, #c8302d 0%, #b32825 100%);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.25);
    }
    .fbw-btn.fbw-danger { background: rgba(255,107,107,0.10); border-color: rgba(255,107,107,0.24); color: #ff9b9b; }
    .fbw-btn.fbw-danger:hover { background: rgba(255,107,107,0.18); border-color: rgba(255,107,107,0.42); color: #ffb5b5; }

    /* deck-stage overlay \u91CC\u7684"\u4FDD\u5B58\u7F16\u8F91"\u6309\u94AE + \u6539\u52A8\u8BA1\u6570 badge */
    .btn[data-fbw-btn="save-edit"] { display: none; align-items: center; gap: 4px; }
    .btn[data-fbw-btn="save-edit"].fbw-has-changes { display: inline-flex; }
    .btn[data-fbw-btn="save-edit"] .fbw-edit-count {
      background: rgba(220,60,60,0.20);
      color: #dc3c3c;
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
      letter-spacing: 0.04em;
      min-width: 14px;
      text-align: center;
      line-height: 1.4;
    }
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

    body.fbw-edit-mode [data-fbw-edit-id] {
      cursor: text;
      transition: all 140ms;
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    /* \u7528\u9752\u7EFF\u8272 accent\uFF0C\u6DF1\u6D45\u80CC\u666F\u90FD\u80FD\u770B\u89C1 */
    body.fbw-edit-mode [data-fbw-edit-id]:hover { outline: 2px dashed rgba(220,60,60,0.55); outline-offset: 3px; border-radius: 3px; }
    body.fbw-edit-mode [data-fbw-edit-id]:focus { outline: 2px solid rgba(220,60,60,0.85); outline-offset: 3px; background: rgba(220,60,60,0.08); border-radius: 3px; }
    body.fbw-edit-mode [data-fbw-edit-id].fbw-changed { background: rgba(220,60,60,0.14); border-radius: 3px; }

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
    /* toast \u91CC\u7684\u300C\u64A4\u9500\u300D\u6309\u94AE \u2014\u2014 Gmail \u98CE\u683C */
    .fbw-toast .fbw-toast-action {
      margin-left: 12px;
      background: transparent;
      color: #ff8a8a;
      border: 0;
      padding: 2px 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.3px;
      border-radius: 4px;
      transition: background 120ms;
    }
    .fbw-toast .fbw-toast-action:hover { background: rgba(255,138,138,0.12); }

    .fbw-confirm {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(8px) saturate(1.2);
      -webkit-backdrop-filter: blur(8px) saturate(1.2);
      display: none; align-items: center; justify-content: center;
      z-index: 2147483700;
      animation: fbw-fadeIn 0.16s ease-out;
    }
    .fbw-confirm.fbw-on { display: flex; }
    .fbw-confirm.fbw-confirm-leave { animation: fbw-fadeOut 0.14s ease-in forwards; }
    @keyframes fbw-fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fbw-fadeOut { to { opacity: 0; } }
    .fbw-confirm-box {
      background: rgba(28, 30, 36, 0.98);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px;
      padding: 22px 24px 18px;
      width: 380px;
      max-width: calc(100vw - 32px);
      color: #f5f5f7;
      box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.32);
      box-sizing: border-box;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      animation: fbw-confirmIn 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1);
    }
    @keyframes fbw-confirmIn {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .fbw-confirm.fbw-confirm-leave .fbw-confirm-box { animation: fbw-confirmOut 0.14s ease-in forwards; }
    @keyframes fbw-confirmOut {
      to { opacity: 0; transform: translateY(4px) scale(0.98); }
    }
    .fbw-confirm-title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.005em;
      line-height: 1.4;
      margin-bottom: 10px;
      color: #f5f5f7;
    }
    .fbw-confirm-desc {
      font-size: 13px;
      color: rgba(245,245,247,0.72);
      line-height: 1.7;
      margin-bottom: 20px;
      white-space: pre-line;
    }
    .fbw-confirm-actions {
      display: flex; gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .fbw-confirm-actions .fbw-btn {
      flex: 0 1 auto;
      padding: 8px 16px;
      font-size: 12.5px;
      min-width: 72px;
    }
    .fbw-confirm-actions .fbw-btn-cancel {
      background: transparent;
      border-color: transparent;
      color: rgba(245,245,247,0.55);
      margin-right: auto;
      min-width: auto;
      padding: 8px 12px;
    }
    .fbw-confirm-actions .fbw-btn-cancel:hover {
      color: #f5f5f7;
      background: rgba(255,255,255,0.07);
      border-color: transparent;
    }

    body.fbw-edit-mode .fbw-selected {
      outline: 2px solid #dc3c3c !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 1px rgba(220,60,60,0.3) !important;
      cursor: move !important;
    }
    body.fbw-edit-mode .fbw-selected[data-fbw-editing="1"] { cursor: text !important; }
    body.fbw-edit-mode svg.fbw-selected {
      filter: drop-shadow(0 0 0 #dc3c3c) drop-shadow(0 0 4px rgba(220,60,60,0.9)) drop-shadow(0 0 10px rgba(220,60,60,0.5)) !important;
    }
    body.fbw-edit-mode section.slide svg,
    body.fbw-edit-mode section.slide svg * {
      pointer-events: auto !important;
    }
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
    .fbw-elem-toolbar button.fbw-restore:hover { background: rgba(220,60,60,0.18); color: #dc3c3c; }
    .fbw-elem-toolbar button svg { width: 14px; height: 14px; }
    .fbw-elem-toolbar .fbw-tb-divider {
      width: 1px; height: 18px; background: rgba(255,255,255,0.10); margin: 0 2px;
    }
    /* \u591A\u9009 count badge\uFF1A>1 \u4E2A\u9009\u4E2D\u65F6\u663E\u793A\u5728\u5DE5\u5177\u680F\u53F3\u4E0A\u89D2 */
    .fbw-elem-toolbar .fbw-tb-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px; height: 18px;
      padding: 0 5px;
      margin-left: 6px;
      background: rgba(220,60,60,0.22);
      color: #ff9d9d;
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 10.5px; font-weight: 700;
      border-radius: 9px;
      letter-spacing: 0.02em;
    }
    .fbw-elem-toolbar .fbw-tb-label {
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      font-size: 11px; color: rgba(255,255,255,0.55);
      padding: 0 8px; max-width: 220px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      user-select: none; pointer-events: none;
    }
    /* \u5143\u7D20\u53CD\u9988\u6309\u94AE\uFF1A\u6709 note \u65F6\u663E\u793A\u4E00\u4E2A\u9752\u7EFF\u8272\u5C0F\u5706\u70B9 */
    .fbw-elem-toolbar button[data-op="note"] { position: relative; }
    .fbw-elem-toolbar button[data-op="note"].fbw-has-note::after {
      content: '';
      position: absolute;
      top: 4px; right: 4px;
      width: 6px; height: 6px;
      background: #dc3c3c;
      border-radius: 50%;
      box-shadow: 0 0 0 1.5px rgba(20,22,28,0.95);
    }

    /* \u5143\u7D20\u53CD\u9988 popover */
    .fbw-note-popover {
      position: fixed;
      z-index: 2147483580;
      width: 300px;
      background: rgba(20,22,28,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 10px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: none;
      box-sizing: border-box;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
    }
    .fbw-note-popover.fbw-on { display: block; }
    .fbw-note-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px;
    }
    .fbw-note-label {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.55);
      font-weight: 600;
    }
    .fbw-note-close {
      width: 22px; height: 22px;
      border: 0; background: transparent;
      color: rgba(245,245,247,0.55);
      cursor: pointer;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 120ms;
    }
    .fbw-note-close:hover { color: #fff; background: rgba(255,255,255,0.10); }
    .fbw-note-close svg { width: 12px; height: 12px; }
    .fbw-note-textarea {
      width: 100%;
      min-height: 96px;
      max-height: 200px;
      resize: vertical;
      background: rgba(0,0,0,0.32);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 7px;
      padding: 9px 11px;
      color: #f5f5f7;
      font-family: inherit;
      font-size: 12.5px;
      line-height: 1.55;
      box-sizing: border-box;
      transition: border-color 140ms, background 140ms;
    }
    .fbw-note-textarea::placeholder { color: rgba(245,245,247,0.32); font-size: 11.5px; }
    .fbw-note-textarea:focus { outline: none; border-color: rgba(255,255,255,0.4); background: rgba(0,0,0,0.45); }

    /* 4 \u89D2\u7F29\u653E dot\uFF08\u89D2\u4E0A\uFF09+ 4 \u4E2A\u65CB\u8F6C zone\uFF08\u89D2\u5916\u5BF9\u89D2\u65B9\u5411\uFF09\u2014\u2014 Figma/Sketch \u98CE\u683C */
    .fbw-resize-handles {
      position: fixed;
      pointer-events: none;
      z-index: 2147483560;
      display: none;
      box-sizing: border-box;
      transform-origin: center center;
    }
    .fbw-resize-handles.fbw-on { display: block; }

    /* \u7F29\u653E dot \u2014\u2014 \u89D2\u4E0A\u7684\u53EF\u89C1\u7EFF\u70B9 */
    .fbw-resize-handle {
      position: absolute;
      width: 11px; height: 11px;
      background: #dc3c3c;
      border: 2px solid #fff;
      border-radius: 50%;
      pointer-events: auto;
      box-shadow: 0 1px 6px rgba(0,0,0,0.45);
      transition: transform 100ms ease;
      z-index: 2;
    }
    .fbw-resize-handle:hover { transform: scale(1.3); }
    .fbw-resize-handle:active { transform: scale(1.1); }
    .fbw-resize-handle[data-handle="tl"] { top: -6px; left: -6px; cursor: nwse-resize; }
    .fbw-resize-handle[data-handle="tr"] { top: -6px; right: -6px; cursor: nesw-resize; }
    .fbw-resize-handle[data-handle="br"] { bottom: -6px; right: -6px; cursor: nwse-resize; }
    .fbw-resize-handle[data-handle="bl"] { bottom: -6px; left: -6px; cursor: nesw-resize; }

    /* \u65CB\u8F6C zone \u2014\u2014 \u89D2\u5916\u5BF9\u89D2\u65B9\u5411\uFF0Chover \u65F6\u663E\u793A \u21BB */
    .fbw-rotate-zone {
      position: absolute;
      width: 22px; height: 22px;
      pointer-events: auto;
      cursor: grab;
      border-radius: 50%;
      background-color: transparent;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='1 4 1 10 7 10'/><path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10'/></svg>");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 0;
      transition: background-color 140ms, background-size 140ms, box-shadow 140ms;
      z-index: 1;
    }
    .fbw-rotate-zone:hover {
      background-color: rgba(220, 60, 60, 0.95);
      background-size: 13px 13px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.4), 0 0 0 2px #fff;
    }
    .fbw-rotate-zone:active { cursor: grabbing; }
    .fbw-rotate-zone[data-handle="tl"] { top: -28px; left: -28px; }
    .fbw-rotate-zone[data-handle="tr"] { top: -28px; right: -28px; }
    .fbw-rotate-zone[data-handle="br"] { bottom: -28px; right: -28px; }
    .fbw-rotate-zone[data-handle="bl"] { bottom: -28px; left: -28px; }

    @media print { .fbw-resize-handles { display: none !important; } }

    /* \u6846\u9009\u6A21\u5F0F\uFF1Acursor crosshair */
    body.fbw-marquee-mode { cursor: crosshair !important; }
    body.fbw-marquee-mode * { cursor: crosshair !important; }
    body.fbw-marquee-mode .fbw-panel,
    body.fbw-marquee-mode .fbw-panel *,
    body.fbw-marquee-mode .fbw-fab,
    body.fbw-marquee-mode .fbw-toast,
    body.fbw-marquee-mode .fbw-anno,
    body.fbw-marquee-mode .fbw-anno * { cursor: auto !important; }
    body.fbw-marquee-mode .fbw-anno [data-action] { cursor: pointer !important; }

    /* \u62D6\u62FD\u65F6\u7684\u4E34\u65F6\u6846 */
    .fbw-marquee-drawing {
      position: fixed;
      border: 1.5px dashed #dc3c3c;
      background: rgba(220, 60, 60, 0.08);
      pointer-events: none;
      z-index: 2147483520;
      box-sizing: border-box;
      border-radius: 2px;
    }

    /* \u6D6E\u52A8\u6587\u5B57\u6807\u6CE8\uFF08\u53CC\u51FB\u7A7A\u767D\u521B\u5EFA\uFF09\u2014\u2014 \u5B8C\u6210\u6001\u65E0\u8FB9\u6846\uFF0C\u7EAF\u6587\u5B57 */
    .fbw-anno-floating {
      position: fixed;
      z-index: 2147483520;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      padding: 0;
      box-sizing: border-box;
    }
    .fbw-anno-floating-input {
      width: 240px;
      min-height: 40px;
      max-height: 200px;
      background: rgba(255, 255, 255, 0.96);
      border: 1.5px dashed #dc3c3c;
      border-radius: 4px;
      padding: 6px 9px;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: #1a1a1a;
      resize: none;
      box-sizing: border-box;
      outline: none;
      box-shadow: 0 4px 14px rgba(220, 60, 60, 0.18);
    }
    .fbw-anno-floating-input:focus {
      border-color: #dc3c3c;
      box-shadow: 0 4px 14px rgba(220, 60, 60, 0.25);
    }
    .fbw-anno-floating-text {
      display: inline-block;
      max-width: 320px;
      color: #1a1a1a;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
      cursor: text;
    }
    .fbw-anno-floating-x {
      position: absolute;
      top: -10px; right: -10px;
      width: 20px; height: 20px;
      border: 0;
      background: rgba(20, 22, 28, 0.92);
      color: #fff;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0;
      opacity: 0;
      transition: opacity 140ms;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    .fbw-anno-floating:hover .fbw-anno-floating-x { opacity: 1; }
    .fbw-anno-floating-x:hover { background: #ff6b6b; }

    /* \u843D\u5730\u540E\u7684\u6807\u6CE8\u6846\uFF1A\u9ED8\u8BA4\u5B8C\u5168\u878D\u5165\u9875\u9762\uFF08\u65E0\u8FB9\u6846\u65E0\u5E95\u8272\u65E0\u5DE5\u5177\u6761\uFF09
       hover / \u7F16\u8F91\u65F6\u624D\u9732\u51FA\u8FB9\u6846 + pill */
    .fbw-anno {
      position: fixed;
      border: 1.5px dashed transparent;
      background: transparent;
      box-sizing: border-box;
      z-index: 2147483520;
      border-radius: 0 4px 4px 4px;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      transition: border-color 140ms, background 140ms, box-shadow 140ms;
    }
    .fbw-anno:hover,
    .fbw-anno.fbw-anno-editing {
      border-color: rgba(220, 60, 60, 0.85);
      background: rgba(220, 60, 60, 0.06);
      box-shadow: 0 4px 16px rgba(220, 60, 60, 0.15), 0 1px 4px rgba(0, 0, 0, 0.25);
    }
    /* \u9752\u7EFF\u8272 pill \u5DE5\u5177\u6761\uFF0C\u8DDF\u6807\u6CE8\u6846\u540C\u8272\u8C03\u878D\u5408\uFF0C\u9ED8\u8BA4\u9690\u85CF\u3002
       \u9AD8\u5EA6 24px + top:-24px \u8BA9 toolbar \u5E95\u8FB9\u8D34\u4F4F box \u9876\u8FB9\uFF0C\u9F20\u6807\u53EF\u65E0\u7F1D\u4ECE box \u79FB\u5230 X \u800C\u4E0D\u4E22 hover\u3002 */
    .fbw-anno-actions {
      position: absolute;
      top: -24px; left: -1px;
      display: inline-flex; gap: 0;
      background: rgba(220, 60, 60, 0.94);
      border-radius: 6px 6px 0 0;
      padding: 0;
      box-shadow: 0 -1px 4px rgba(0, 90, 70, 0.18);
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      writing-mode: horizontal-tb !important;
      opacity: 0;
      pointer-events: none;
      transition: opacity 140ms;
    }
    /* \u7ED9 box \u9876\u90E8\u52A0\u4E00\u6761\u4E0D\u53EF\u89C1\u7684 hover \u6865\uFF0C\u8FDB\u4E00\u6B65\u907F\u514D\u6296\u52A8\u4E22 hover */
    .fbw-anno::before {
      content: '';
      position: absolute;
      top: -26px; left: 0; right: 0; height: 26px;
      pointer-events: none;
    }
    .fbw-anno:hover::before,
    .fbw-anno.fbw-anno-editing::before {
      pointer-events: auto;
    }
    .fbw-anno:hover .fbw-anno-actions,
    .fbw-anno.fbw-anno-editing .fbw-anno-actions {
      opacity: 1;
      pointer-events: auto;
    }
    /* 4 \u89D2\u7F29\u653E\u624B\u67C4\uFF1A\u9ED8\u8BA4\u9690\u85CF\uFF0Chover/editing \u65F6\u9732\u51FA */
    .fbw-anno-handle {
      position: absolute;
      width: 11px; height: 11px;
      background: #fff;
      border: 1.5px solid #dc3c3c;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      opacity: 0;
      pointer-events: none;
      transition: opacity 140ms;
      z-index: 1;
    }
    .fbw-anno:hover .fbw-anno-handle,
    .fbw-anno.fbw-anno-editing .fbw-anno-handle {
      opacity: 1;
      pointer-events: auto;
    }
    .fbw-anno-handle-nw { top: -6px; left: -6px; cursor: nwse-resize; }
    .fbw-anno-handle-ne { top: -6px; right: -6px; cursor: nesw-resize; }
    .fbw-anno-handle-sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .fbw-anno-handle-se { bottom: -6px; right: -6px; cursor: nwse-resize; }
    /* box body \u7ED9\u4E2A move cursor \u8868\u793A\u53EF\u62D6\uFF08hover \u65F6\uFF09 */
    .fbw-anno:hover { cursor: move; }
    .fbw-anno:hover textarea,
    .fbw-anno:hover [data-action] { cursor: auto; }
    .fbw-anno:hover [data-action] { cursor: pointer; }
    /* \u53EA\u6709\u56FE\u7247\u65F6\u53BB\u6389\u6846/\u5E95\u8272\uFF0C\u8BA9\u56FE\u672C\u8EAB\u5C31\u662F\u89C6\u89C9\u4E3B\u4F53\u3002
       \u6CE8\u610F\uFF1A\u4E0D\u80FD\u7528 overflow: hidden\uFF0C\u5426\u5219\u4F1A\u88C1\u6389\u4F4D\u4E8E box \u5916 -6px \u7684 4 \u89D2\u7F29\u653E\u624B\u67C4\u3002
       \u6539\u6210\u7ED9\u56FE\u7247\u81EA\u5DF1\u52A0 border-radius\u3002 */
    .fbw-anno.fbw-anno-image-only:not(:hover):not(.fbw-anno-editing) {
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .fbw-anno.fbw-anno-image-only .fbw-anno-content {
      padding: 0;
      gap: 0;
    }
    .fbw-anno.fbw-anno-image-only .fbw-anno-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
      background: transparent;
    }
    .fbw-anno-actions button {
      width: 28px; height: 24px;
      border: 0;
      background: transparent;
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      writing-mode: horizontal-tb !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      line-height: 1;
      transition: background 120ms;
    }
    .fbw-anno-actions button:first-child { border-top-left-radius: 6px; }
    .fbw-anno-actions button:last-child { border-top-right-radius: 6px; }
    .fbw-anno-actions button:hover {
      background: rgba(255, 255, 255, 0.18);
    }
    .fbw-anno-actions button.fbw-anno-del:hover {
      background: rgba(220, 30, 30, 0.55);
    }
    .fbw-anno-actions button svg {
      width: 13px; height: 13px;
      stroke-width: 2;
    }
    .fbw-anno-content {
      flex: 1;
      padding: 8px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 0;
    }
    /* \u5185\u5BB9\uFF1A\u7EAF\u6587\u5B57\u586B\u6EE1\u533A\u57DF\uFF0C\u65E0\u5E95\u8272\u65E0\u8FB9\u6846\uFF0C\u50CF\u9875\u9762\u6B63\u6587 */
    .fbw-anno-text-content {
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.65;
      font-weight: 500;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      background: transparent;
      padding: 0;
      border-radius: 0;
      box-shadow: none;
      flex: 1;
      min-height: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    /* \u53CD\u9988\u5907\u6CE8\uFF1A\u5DE6\u7AD6\u7EBF + \u7C73\u767D\u5E95 + \u659C\u4F53\uFF0C\u660E\u663E\u662F meta\u3002
       \u5E95\u8272\u7528\u8FD1\u4E0D\u900F\u660E\u7C73\u767D\uFF0C\u907F\u514D\u5728\u6742\u4E71\u9875\u9762\u4E0A\u53D8\u5F97\u4E0D\u53EF\u8BFB\u3002 */
    .fbw-anno-text-note {
      color: #1a3a32;
      font-size: 11.5px;
      line-height: 1.55;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      font-style: italic;
      background: rgba(250, 246, 241, 0.97);
      border-left: 3px solid rgba(220, 60, 60, 0.55);
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
    }
    /* \u517C\u5BB9\u65E7\u7248\uFF1A\u4FDD\u7559 .fbw-anno-text \u9632\u6B62\u65E7 box \u5931\u6837 */
    .fbw-anno-text {
      color: #1a3a32;
      font-size: 12.5px;
      line-height: 1.55;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      background: rgba(255, 255, 255, 0.85);
      padding: 6px 8px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .fbw-anno-img {
      width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.5);
    }
    .fbw-anno-textarea {
      width: 100%;
      flex: 1;
      min-height: 60px;
      border: 1px solid rgba(220, 60, 60, 0.4);
      background: rgba(255, 255, 255, 0.92);
      color: #1a3a32;
      padding: 6px 8px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 12.5px;
      line-height: 1.55;
      resize: none;
      box-sizing: border-box;
    }
    /* \u8F93\u5165\u6001\uFF1A\u80CC\u666F\u5FC5\u987B\u4E0D\u900F\u660E\uFF0C\u5426\u5219\u5728\u6742\u4E71\u9875\u9762\u4E0A\u8F93\u5165\u4F1A\u8DDF\u80CC\u666F\u6587\u5B57\u6DF7\u53E0\u770B\u4E0D\u6E05\u3002
       \u5916\u6846 .fbw-anno \u4FDD\u6301\u534A\u900F\u660E\u4EE5\u9732\u51FA\u88AB\u6807\u6CE8\u5BF9\u8C61\uFF0C\u4F46\u5177\u4F53\u8F93\u5165\u6846\u5FC5\u987B\u5B9E\u5E95\u3002 */
    .fbw-anno-textarea-content {
      color: #1a1a1a;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.65;
      background: rgba(255, 255, 255, 0.97);
      border: 1px dashed rgba(220, 60, 60, 0.45);
      padding: 4px 6px;
    }
    .fbw-anno-textarea-content:focus {
      border-style: solid;
      border-color: #dc3c3c;
      box-shadow: 0 0 0 2px rgba(220, 60, 60, 0.12);
      background: #fff;
    }
    .fbw-anno-textarea-note {
      color: #1a3a32;
      font-style: italic;
      background: rgba(250, 246, 241, 0.97);
      border-color: rgba(220, 60, 60, 0.55);
      border-left-width: 3px;
    }
    .fbw-anno-textarea-note:focus {
      background: #faf6f1;
    }
    .fbw-anno-textarea:focus {
      outline: none;
      border-color: #dc3c3c;
      box-shadow: 0 0 0 2px rgba(220, 60, 60, 0.18);
    }

    @media print { .fbw-anno, .fbw-marquee-drawing { display: none !important; } }

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
    .fbw-font-picker .fbw-fp-item.fbw-fp-active { background: rgba(220,60,60,0.16); color: #dc3c3c; }
    .fbw-font-picker .fbw-fp-name {
      font-family: ui-monospace, monospace;
      font-size: 9.5px;
      color: rgba(245,245,247,0.45);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .fbw-font-picker .fbw-fp-group {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.40);
      padding: 8px 10px 4px;
      font-weight: 600;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 4px;
    }
    .fbw-font-picker .fbw-fp-group:first-child { border-top: 0; margin-top: 0; padding-top: 4px; }
    .fbw-font-picker .fbw-fp-loading,
    .fbw-font-picker .fbw-fp-hint {
      padding: 10px 12px;
      font-size: 11px;
      color: rgba(245,245,247,0.50);
      line-height: 1.5;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
    }
    .fbw-font-picker .fbw-fp-hint {
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 4px;
    }

    /* \u2500\u2500\u2500 \u7AD6\u7248 FAB pill \u5DE5\u5177\u6761 \u2014\u2014 \u8DDF deck overlay \u4E00\u81F4\u7684"\u5D4C\u5165\u5F0F\u5DE5\u5177\u6761"\u8D28\u611F \u2500\u2500\u2500 */
    .fbw-fab-bar {
      position: fixed;
      bottom: 20px; right: 20px;
      display: none;
      align-items: center;
      gap: 0;
      background: rgba(20, 22, 28, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 4px;
      z-index: 2147483500;
      box-shadow: 0 12px 36px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.24);
      backdrop-filter: blur(16px) saturate(1.3);
      -webkit-backdrop-filter: blur(16px) saturate(1.3);
      transition: opacity 240ms ease, transform 240ms ease;
      transform-origin: bottom right;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      /* \u63D0\u524D\u63D0\u793A GPU \u53EF\u80FD transform / \u900F\u660E\u5EA6\u53D8\u5316\uFF0C\u907F\u514D\u6BCF\u6B21 hover/scroll \u91CD\u65B0\u5408\u6210\u56FE\u5C42 */
      will-change: opacity, transform;
    }
    body.fbw-no-overlay .fbw-fab-bar {
      display: inline-flex;
      opacity: 0.92;
      transform: scale(0.94);
    }
    body.fbw-no-overlay.fbw-mouse-near-fab .fbw-fab-bar {
      opacity: 1;
      transform: scale(1);
    }
    body.fbw-no-overlay.fbw-scrolling .fbw-fab-bar {
      opacity: 0.55;
      transform: scale(0.88);
    }
    .fbw-fab-bar:hover {
      opacity: 1 !important;
      transform: scale(1) !important;
    }
    /* \u6DF1\u8272\u80CC\u666F\uFF1Apill \u63D0\u4EAE + \u56FE\u6807\u5168\u4EAE */
    body.fbw-no-overlay.fbw-dark-bg .fbw-fab-bar {
      background: rgba(48, 51, 60, 0.98);
      border-color: rgba(255, 255, 255, 0.18);
      opacity: 0.94;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.6);
    }
    body.fbw-no-overlay.fbw-dark-bg .fbw-fab {
      color: rgba(255, 255, 255, 0.96);
    }
    body.fbw-no-overlay.fbw-dark-bg.fbw-scrolling .fbw-fab-bar {
      opacity: 0.62;
    }
    /* \u5DE5\u5177\u6761\u5185\u7684\u6309\u94AE\uFF1A\u65B9\u5F62\u5706\u89D2\u5C0F\u6309\u94AE\uFF0C\u4E0D\u518D\u662F\u72EC\u7ACB\u6D6E\u6C14\u7403 */
    .fbw-fab {
      position: relative;
      width: 36px; height: 36px;
      border-radius: 8px;
      background: transparent;
      border: 0;
      box-shadow: none;
      color: rgba(245, 245, 247, 0.95);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0 1px;
      transition: background 140ms, color 140ms;
    }
    .fbw-fab:hover {
      background: rgba(255, 255, 255, 0.10);
      color: #fff;
    }
    /* \u6FC0\u6D3B\u6001\uFF1A\u54C1\u724C\u7EA2\u534A\u900F\u5E95 + \u7EA2\u56FE\u6807\uFF0C\u8DDF hover \u7070\u5E95\u62C9\u5F00\u8DB3\u591F\u5BF9\u6BD4 */
    .fbw-fab.fbw-active {
      background: rgba(220, 60, 60, 0.18);
      color: #ff8a8a;
      box-shadow: inset 0 0 0 1px rgba(220,60,60,0.30);
    }
    .fbw-fab.fbw-active:hover {
      background: rgba(220, 60, 60, 0.26);
      color: #ffb0b0;
    }
    /* \u6291\u5236\u6D4F\u89C8\u5668\u9ED8\u8BA4 focus \u84DD\u6846 */
    .fbw-fab:focus,
    .fbw-fab:focus-visible {
      outline: none;
    }
    .fbw-fab svg { width: 16px; height: 16px; stroke-width: 2; }
    .fbw-fab-divider {
      width: 1px;
      height: 18px;
      background: rgba(255, 255, 255, 0.10);
      margin: 0 4px;
    }
    body.fbw-no-overlay.fbw-dark-bg .fbw-fab-divider {
      background: rgba(255, 255, 255, 0.14);
    }
    /* \u6298\u53E0\u6001\uFF1A\u9690\u85CF\u9664\u7F16\u8F91\u5916\u7684\u6240\u6709\u6309\u94AE + \u5206\u9694\u7EBF */
    body.fbw-fab-collapsed .fbw-fab-bar > .fbw-fab:not(.fbw-edit-fab),
    body.fbw-fab-collapsed .fbw-fab-bar > .fbw-fab-divider {
      display: none !important;
    }
    /* \u6298\u53E0\u6001\uFF1A\u53BB\u6389 pill \u6574\u4F53\u6846\uFF0C\u4F46\u4FDD\u7559\u5355\u4E2A\u6309\u94AE\u7684\u5C0F\u5706\u5E95 + \u9634\u5F71\uFF0C
       \u8BA9\u5728\u4EFB\u4F55\u80CC\u666F\uFF08\u56FE\u8868/\u56FE\u7247/\u6DF1\u6D45\uFF09\u4E0B\u90FD\u770B\u5F97\u6E05\u3002 */
    body.fbw-fab-collapsed .fbw-fab-bar,
    body.fbw-fab-collapsed.fbw-dark-bg .fbw-fab-bar,
    body.fbw-fab-collapsed.fbw-no-overlay.fbw-dark-bg .fbw-fab-bar {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0 !important;
    }
    /* \u6298\u53E0\u6001\u6309\u94AE = \u5C0F\u5706\u5E95 dot \u98CE\u683C\uFF1A\u6D45\u8272\u9875\u6DF1\u5E95\u767D\u56FE\u6807\uFF0C\u6DF1\u8272\u9875\u6DF1\u5E95\u6D45\u56FE\u6807\uFF0C\u90FD\u6709\u9634\u5F71\u63D0\u5206\u79BB */
    body.fbw-fab-collapsed .fbw-fab-bar .fbw-fab {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(20, 22, 28, 0.96) !important;
      color: rgba(255, 255, 255, 0.96) !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.10) !important;
      /* \u6298\u53E0\u540E\u53EA\u662F\u4E2A 36px \u5C0F\u5706\u70B9\uFF0C96% \u4E0D\u900F\u660E\u5EA6\u5DF2\u8DB3\u591F\u5206\u79BB\uFF0C\u7701 backdrop-filter \u7684 GPU \u5F00\u9500 */
    }
    body.fbw-fab-collapsed .fbw-fab-bar .fbw-fab:hover {
      background: rgba(20, 22, 28, 0.98) !important;
      transform: scale(1.06);
    }
    body.fbw-fab-collapsed .fbw-fab-bar .fbw-fab.fbw-active {
      color: #dc3c3c !important;
    }
    body.fbw-fab-collapsed .fbw-fab-bar .fbw-fab.fbw-active:hover {
      color: #ff5252 !important;
    }

    /* \u5E2E\u52A9 popover \u2014\u2014 \u8DDF widget panel \u540C\u8BBE\u8BA1\u8BED\u8A00 */
    .fbw-help-popover {
      position: fixed;
      z-index: 2147483600;
      background: rgba(28, 25, 22, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow:
        0 20px 60px rgba(0,0,0,0.52),
        0 2px 8px rgba(0,0,0,0.30),
        inset 0 1px 0 rgba(255,255,255,0.05);
      backdrop-filter: blur(24px) saturate(1.4);
      -webkit-backdrop-filter: blur(24px) saturate(1.4);
      display: none;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      color: #f5f3ef;
      min-width: 360px;
      box-sizing: border-box;
    }
    .fbw-help-popover.fbw-on { display: block; }
    .fbw-help-title {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.50);
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .fbw-help-rows { display: flex; flex-direction: column; gap: 8px; }
    .fbw-help-groups { display: flex; flex-direction: column; gap: 14px; }
    /* \u53CC\u5217\u5E03\u5C40\uFF1A\u5DE6=\u6A21\u5F0F+\u64CD\u4F5C\uFF08\u9AD8\u9891\uFF09\uFF0C\u53F3=\u5BFC\u51FA+\u5176\u4ED6\uFF08\u4F4E\u9891\uFF09 */
    .fbw-help-cols {
      display: flex;
      gap: 22px;
      align-items: flex-start;
    }
    .fbw-help-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    /* \u5DE6\u53F3\u4E24\u5217\u4E4B\u95F4\u52A0\u4E00\u6761\u6781\u6DE1\u7684\u5206\u9694\u7EBF\uFF0C\u5F3A\u5316\u5206\u680F\u89C6\u89C9 */
    .fbw-help-col + .fbw-help-col {
      padding-left: 22px;
      margin-left: 0;
      border-left: 1px solid rgba(255,255,255,0.06);
    }
    .fbw-help-group { display: flex; flex-direction: column; gap: 6px; }
    .fbw-help-group-label {
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 9px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.38);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .fbw-help-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12.5px;
      color: rgba(245,245,247,0.85);
      white-space: nowrap !important;
      writing-mode: horizontal-tb !important;
      word-break: keep-all !important;
    }
    .fbw-help-row > span { margin-left: 8px; }
    /* \u540C\u884C\u591A\u4E2A kbd \u4E4B\u95F4\u7559\u4E00\u70B9\u547C\u5438\u7A7A\u95F4\uFF0C\u4E0D\u518D\u7528 + \u5206\u9694 */
    .fbw-help-row kbd + kbd { margin-left: 3px; }
    .fbw-help-row kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 7px;
      background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
      border: 1px solid rgba(255,255,255,0.16);
      border-bottom-color: rgba(255,255,255,0.06);
      border-bottom-width: 1.5px;
      border-radius: 5px;
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 10.5px;
      font-weight: 600;
      color: rgba(245,245,247,0.95);
      box-shadow: 0 1px 0 rgba(0,0,0,0.20);
    }

    /* \u81EA\u5B9A\u4E49 tooltip \u2014\u2014 \u8DDF widget panel \u540C\u8BBE\u8BA1\u8BED\u8A00 */
    .fbw-tooltip {
      position: fixed;
      background: rgba(28, 30, 36, 0.96);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 11.5px;
      color: rgba(245,245,247,0.95);
      font-weight: 500;
      pointer-events: none;
      opacity: 0;
      transition: opacity 140ms;
      z-index: 2147483700;
      box-shadow: 0 6px 22px rgba(0,0,0,0.42);
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      white-space: nowrap;
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      letter-spacing: 0.01em;
      max-width: 320px;
      line-height: 1.4;
    }
    .fbw-tooltip.fbw-on { opacity: 1; }
    @media print { .fbw-tooltip { display: none !important; } }

    /* \u2500\u2500\u2500 \u8BC4\u5BA1\u6A21\u5F0F\uFF08review\uFF09\u2014\u2014 \u4EFB\u610F\u7EBF\u4E0A webapp\uFF0C\u6CA1\u6E90 HTML \u53EF\u6539 \u2500\u2500\u2500 */
    /* \u9690\u85CF\u6539\u6E90\u76F8\u5173\uFF1A\u6362\u5B57\u4F53\uFF08\u9875\u9762\u7EA7 CSS \u63A5\u7BA1\uFF09\u3001\u6362\u56FE\u7247\uFF08\u7EBF\u4E0A\u56FE\u65E0\u6CD5\u843D\u76D8\uFF09\u3001\u8FD8\u539F\uFF08\u63D0\u6848\u662F\u4E34\u65F6\u7684\uFF09 */
    body.fbw-mode-review .fbw-elem-toolbar [data-op="font"],
    body.fbw-mode-review .fbw-elem-toolbar [data-op="replace-img"] {
      display: none !important;
    }
    /* \u6A21\u5F0F chip\uFF1A\u8DDF 4 \u4E2A icon \u4E00\u8D77\u8D34\u53F3\uFF08\u5728 head-actions \u91CC\u7B2C\u4E00\u4E2A\u4F4D\u7F6E\uFF09\u3002
       \u9ED8\u8BA4 hidden\uFF0Cbody.fbw-mode-* class \u51FA\u73B0\u624D\u663E\u793A\u3002 */
    .fbw-mode-chip { display: none; }
    body.fbw-mode-deck .fbw-mode-chip,
    body.fbw-mode-doc .fbw-mode-chip,
    body.fbw-mode-review .fbw-mode-chip {
      display: inline-block;
      padding: 2px 8px;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 3px;
      vertical-align: middle;
      font-family: ui-monospace, "SF Mono", monospace;
      white-space: nowrap;
      flex-shrink: 0;
    }
    body.fbw-mode-review .fbw-mode-chip {
      background: rgba(220, 60, 60, 0.18);
      color: #ff8b8b;
    }
    body.fbw-mode-doc .fbw-mode-chip {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
    }
    body.fbw-mode-deck .fbw-mode-chip {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
    }
    /* chip \u6587\u5B57\u7531 JS \u6309 locale \u6CE8\u5165\uFF08templates.js \u6E32\u67D3 panelHTML / syncModeChip\uFF09\uFF0C
       \u4E0D\u518D\u7528 CSS ::before \u786C\u7F16\u7801\u4E2D\u6587 */

    /* Marker / \u8367\u5149\u7B14 popover */
    .fbw-marker-popover {
      position: fixed;
      background: #1a1a1a;
      color: #fff;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      z-index: 2147483645;
      display: none;
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
    }
    .fbw-marker-popover.fbw-on { display: block; }
    .fbw-marker-row {
      display: flex; gap: 8px; margin-bottom: 8px;
    }
    .fbw-marker-swatch {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.25);
      cursor: pointer;
      padding: 0;
      transition: transform 100ms, border-color 100ms;
    }
    .fbw-marker-swatch:hover {
      transform: scale(1.12);
      border-color: rgba(255,255,255,0.7);
    }
    .fbw-marker-clear {
      width: 100%;
      background: transparent;
      color: #ddd;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
    }
    .fbw-marker-clear:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    /* \u5BA1\u8BA1\u6A21\u5F0F\uFF1A\u6309 A \u5207\u6362\uFF0C\u6240\u6709\u6539\u8FC7\u7684\u5143\u7D20\u63CF\u8FB9 + \u89D2\u6807 op \u6570\u91CF\u3002\u989C\u8272\u6309 op \u7C7B\u578B\u533A\u5206 */
    body.fbw-audit-mode .fbw-audit-changed {
      outline: 2px solid rgba(220,60,60,0.75) !important;
      outline-offset: 3px !important;
      position: relative;
    }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="hide"]        { outline-color: rgba(120,120,120,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="tag"]         { outline-color: rgba(139,92,246,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="replace-img"] { outline-color: rgba(6,182,212,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="font"]        { outline-color: rgba(59,130,246,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="highlight"]   { outline-color: rgba(234,179,8,0.90) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="scale"],
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="rotate"],
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="move"]        { outline-color: rgba(34,197,94,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="href"]        { outline-color: rgba(99,102,241,0.80) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="text"]        { outline-color: rgba(245,158,11,0.90) !important; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-count]::after {
      content: attr(data-fbw-audit-count);
      position: absolute;
      top: -10px; right: -10px;
      min-width: 18px; height: 18px;
      padding: 0 5px;
      background: #dc3c3c;
      color: #fff;
      font-family: ui-monospace, "SF Mono", monospace;
      font-size: 11px; font-weight: 600;
      line-height: 18px;
      text-align: center;
      border-radius: 9px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      pointer-events: none;
      z-index: 2147483540;
    }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="hide"]::after        { background: #888; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="tag"]::after         { background: #8b5cf6; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="replace-img"]::after { background: #06b6d4; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="font"]::after        { background: #3b82f6; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="highlight"]::after   { background: #eab308; color: #1a1a1a; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="scale"]::after,
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="rotate"]::after,
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="move"]::after        { background: #22c55e; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="href"]::after        { background: #6366f1; }
    body.fbw-audit-mode .fbw-audit-changed[data-fbw-audit-op="text"]::after        { background: #f59e0b; }

    /* \u6807\u7B7E\u5207\u6362 popover\uFF1AH \u6309\u94AE\u70B9\u5F00\u540E\u663E\u793A P / H1 / H2 / H3 / H4 */
    .fbw-tag-popover {
      position: fixed;
      z-index: 2147483545;
      display: none;
      background: rgba(20,22,28,0.97);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 4px;
      gap: 2px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .fbw-tag-popover.fbw-on { display: inline-flex; }
    .fbw-tag-popover button {
      min-width: 36px; height: 28px;
      padding: 0 10px;
      border: 0; border-radius: 5px;
      background: transparent;
      color: rgba(245,245,247,0.78);
      cursor: pointer;
      font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.5px;
    }
    .fbw-tag-popover button:hover { background: rgba(255,255,255,0.10); color: #fff; }
    .fbw-tag-popover button.fbw-active {
      background: rgba(220,60,60,0.22); color: #ff8a8a;
    }
    /* \u6807\u7B7E\u53D8\u66F4\u7684\u89C6\u89C9\u9884\u89C8\uFF1A\u8BA9\u5143\u7D20\u770B\u8D77\u6765\u50CF\u76EE\u6807 tag\u3002!important \u56E0\u4E3A\u5F88\u591A\u9875\u9762\u5BF9 h/p \u6709\u81EA\u5B9A\u4E49\u6837\u5F0F */
    [data-fbw-tag-as="h1"] { font-size: 1.9em !important; font-weight: 700 !important; line-height: 1.25 !important; }
    [data-fbw-tag-as="h2"] { font-size: 1.5em !important; font-weight: 700 !important; line-height: 1.3 !important; }
    [data-fbw-tag-as="h3"] { font-size: 1.2em !important; font-weight: 700 !important; line-height: 1.35 !important; }
    [data-fbw-tag-as="h4"] { font-size: 1.05em !important; font-weight: 700 !important; }
    [data-fbw-tag-as="h5"] { font-size: 0.95em !important; font-weight: 700 !important; }
    [data-fbw-tag-as="h6"] { font-size: 0.88em !important; font-weight: 700 !important; color: #555 !important; }
    [data-fbw-tag-as="p"] { font-size: 1em !important; font-weight: 400 !important; line-height: 1.6 !important; }

    /* Rubber-band \u6846\u9009\uFF1Aedit \u6A21\u5F0F\u4E0B\u7A7A\u767D\u5904\u62D6\u51FA\u7684\u9009\u62E9\u77E9\u5F62 */
    .fbw-rubber-band {
      position: fixed;
      z-index: 2147483540;
      pointer-events: none;
      display: none;
      border: 1px dashed rgba(220, 60, 60, 0.7);
      background: rgba(220, 60, 60, 0.06);
      box-sizing: border-box;
    }
    .fbw-rubber-band.fbw-on { display: block; }

    /* Design \u5206\u7C7B chip \u884C\uFF1A\u7528\u5728 note popover\u3001marquee \u6807\u6CE8\u7684 note \u8F93\u5165\u6846\u4E0A\u65B9
       \u70B9\u4E00\u4E0B\u5728\u53CD\u9988\u6587\u672C\u524D toggle [\u6807\u7B7E]\uFF0C\u7ED9 agent \u4E00\u4E2A\u660E\u786E\u7684\u8BED\u4E49\u4FE1\u53F7 */
    .fbw-design-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: 8px;
      align-items: center;
    }
    .fbw-design-tag {
      font-family: -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif;
      font-size: 10.5px;
      font-weight: 500;
      padding: 2px 9px;
      background: rgba(255,255,255,0.06);
      color: rgba(245,243,239,0.55);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 999px;
      cursor: pointer;
      transition: background 120ms, color 120ms, border-color 120ms;
      letter-spacing: 0.02em;
      line-height: 1.5;
    }
    .fbw-design-tag:hover {
      background: rgba(255,255,255,0.12);
      color: #f5f3ef;
      border-color: rgba(255,255,255,0.12);
    }
    .fbw-design-tag.fbw-on {
      background: rgba(220,60,60,0.20);
      color: #ff9d9d;
      border-color: rgba(220,60,60,0.32);
    }
    /* marquee \u6807\u6CE8\u7684\u6D45\u8272 box \u91CC\uFF0Cdesign-tag \u8D70\u6696\u767D\u5E95\uFF0C\u8DDF\u7C73\u8272\u5E95\u914D */
    .fbw-anno .fbw-design-tag {
      background: rgba(0,0,0,0.05);
      color: rgba(26,26,26,0.55);
      border-color: rgba(0,0,0,0.08);
    }
    .fbw-anno .fbw-design-tag:hover {
      background: rgba(0,0,0,0.10);
      color: #1a1a1a;
    }
    .fbw-anno .fbw-design-tag.fbw-on {
      background: rgba(220,60,60,0.14);
      color: #c8302d;
      border-color: rgba(220,60,60,0.40);
    }

    /* \u95F4\u8DDD\u6D4B\u91CF\uFF1AAlt + hover \u65F6\u663E\u793A selected \u2192 target \u7684 4 \u8FB9\u8DDD\u79BB\uFF08Figma \u98CE\u683C\uFF09 */
    .fbw-measure-overlay {
      position: fixed; inset: 0;
      z-index: 2147483544;
      pointer-events: none;
      display: none;
    }
    .fbw-measure-overlay.fbw-on { display: block; }
    .fbw-measure-line {
      position: fixed;
      pointer-events: none;
    }
    .fbw-measure-line-h {
      height: 0;
      border-top: 1px dashed rgba(220,60,60,0.85);
    }
    .fbw-measure-line-v {
      width: 0;
      border-left: 1px dashed rgba(220,60,60,0.85);
    }
    .fbw-measure-label {
      position: fixed;
      background: #dc3c3c;
      color: #fff;
      padding: 1px 6px;
      border-radius: 3px;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 10.5px;
      font-weight: 600;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .fbw-measure-target {
      position: fixed;
      border: 1px dashed rgba(220,60,60,0.55);
      background: rgba(220,60,60,0.05);
      pointer-events: none;
      box-sizing: border-box;
    }
    /* \u6D4B\u91CF\u6A21\u5F0F\u4E0B\u9690\u85CF\u9F20\u6807 hover \u7684\u865A\u7EBF\uFF08\u907F\u514D\u8DDF\u6D4B\u91CF\u865A\u7EBF\u6253\u67B6\uFF09 */
    body.fbw-measuring [data-fbw-edit-id]:hover { outline: none !important; }

    /* \u62D6\u52A8 scale / rotate \u65F6\u7684\u5B9E\u65F6\u8BFB\u6570\uFF08\u8DDF\u968F\u5149\u6807\uFF09 */
    .fbw-drag-readout {
      position: fixed; z-index: 2147483646;
      display: none;
      padding: 4px 9px;
      background: rgba(20,22,28,0.94);
      color: #f5f5f7;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 12px; font-weight: 500;
      border-radius: 6px;
      pointer-events: none;
      user-select: none;
      box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    }
    .fbw-drag-readout.fbw-on { display: block; }

    /* \u957F\u622A\u56FE / \u622A\u5C4F\uFF1Ahtml2canvas \u4E0D\u8FDB print \u5A92\u4ECB\uFF0C\u8981\u9760 body.fbw-printing \u6765\u85CF widget UI */
    body.fbw-printing .fbw-panel,
    body.fbw-printing .fbw-fab,
    body.fbw-printing .fbw-fab-bar,
    body.fbw-printing .fbw-fab-divider,
    body.fbw-printing .fbw-toast,
    body.fbw-printing .fbw-confirm,
    body.fbw-printing .fbw-elem-toolbar,
    body.fbw-printing .fbw-font-picker,
    body.fbw-printing .fbw-note-popover,
    body.fbw-printing .fbw-marker-popover,
    body.fbw-printing .fbw-tag-popover,
    body.fbw-printing .fbw-help-popover,
    body.fbw-printing .fbw-tooltip,
    body.fbw-printing .fbw-anno,
    body.fbw-printing .fbw-anno-actions,
    body.fbw-printing .fbw-marquee-drawing,
    body.fbw-printing .fbw-resize-handles,
    body.fbw-printing .fbw-drag-readout,
    body.fbw-printing .fbw-measure-overlay {
      display: none !important;
    }
    /* \u622A\u5C4F / \u6253\u5370\u65F6\u628A audit \u7EA2\u6846\u4E5F\u85CF\u6389\uFF0C\u907F\u514D\u62CD\u8FDB PDF */
    body.fbw-printing .fbw-audit-changed {
      outline: none !important;
    }
    body.fbw-printing .fbw-audit-changed::after { display: none !important; }

    @media print {
      .fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-fab-divider,
      .fbw-toast, .fbw-confirm,
      .fbw-elem-toolbar, .fbw-font-picker,
      .fbw-note-popover, .fbw-marker-popover, .fbw-tag-popover, .fbw-help-popover, .fbw-tooltip,
      .fbw-anno, .fbw-anno-actions,
      .fbw-marquee-drawing, .fbw-resize-handles {
        display: none !important;
      }
      .fbw-selected {
        outline: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
      body.fbw-edit-mode [data-fbw-edit-id],
      body.fbw-edit-mode [data-fbw-edit-id]:hover,
      body.fbw-edit-mode [data-fbw-edit-id]:focus,
      body.fbw-edit-mode [data-fbw-edit-id].fbw-changed {
        outline: none !important;
        background: transparent !important;
      }
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
  `;var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',Ye='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',Yt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';var Wt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',Kt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',Gt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',Xt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',We='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/></svg>',Vt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>',Zt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4l4 4 4-4z"/></svg>',Ke='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1.5"/><path d="M9 21h1.5"/><path d="M14 3h1.5"/><path d="M14 21h1.5"/><path d="M3 9v1.5"/><path d="M21 9v1.5"/><path d="M3 14v1.5"/><path d="M21 14v1.5"/></svg>',Te='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',wt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',Ge='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';var Jt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',Qt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',eo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',to='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',oo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',no='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',ao='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',Me='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',ro='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',io='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';var so='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4v16M18 4v16M6 12h12"/></svg>',lo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z"/></svg>',co='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14l-4-4 4-4"/><path d="M5 10h9a6 6 0 0 1 0 12h-3"/></svg>',fo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14l4-4-4-4"/><path d="M19 10h-9a6 6 0 0 0 0 12h3"/></svg>',po='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="12" y="18.5" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" font-size="18" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="-0.5">Aa</text></svg>';var me={zh:{"edit.on":"\u7F16\u8F91\u6A21\u5F0F\u5F00\u542F \xB7 \u5355\u51FB\u9009\u4E2D \xB7 \u53CC\u51FB\u6539\u5B57 \xB7 Esc \u53D6\u6D88","edit.off":"\u7F16\u8F91\u6A21\u5F0F\u5DF2\u5173\u95ED","edit.off.pending":"\u7F16\u8F91\u6A21\u5F0F\u5DF2\u5173\u95ED \xB7 {count} \u5904\u6539\u52A8\u6682\u5B58\u4E2D","marquee.on":"\u6846\u9009\u6A21\u5F0F\u5F00\u542F \xB7 \u62D6\u52A8\u753B\u6846 \xB7 Esc \u9000\u51FA","marquee.off":"\u6846\u9009\u6A21\u5F0F\u5DF2\u5173\u95ED","op.delete":"\u5DF2\u6807\u8BB0\u5220\u9664","op.hide":"\u5DF2\u6807\u8BB0\u9690\u85CF","op.restore":"\u5DF2\u8FD8\u539F","op.replaceImg":"\u5DF2\u66FF\u6362\u56FE\u7247","op.font":"\u5B57\u4F53: {name}","op.link.prompt":"\u6539\u94FE\u63A5 (href)\uFF1A","op.link.done":"\u94FE\u63A5\u5DF2\u6539","op.link.cleared":"\u94FE\u63A5\u5DF2\u6E05\u7A7A","font.systemDefault":"\u7CFB\u7EDF\u9ED8\u8BA4\uFF08\u6E05\u9664\uFF09","font.group.generic":"\u901A\u7528","font.group.document":"\u9875\u9762\u5B57\u4F53","font.group.local":"\u672C\u5730\u5B57\u4F53","font.loading":"\u52A0\u8F7D\u5B57\u4F53\u4E2D\u2026","font.localUnsupported":"\u8BFB\u4E0D\u5230\u672C\u5730\u5B57\u4F53 \xB7 \u4EC5 Chrome 103+ / Edge \u652F\u6301\uFF0C\u4E14\u9700 https:// \u6216 file:// \u534F\u8BAE","font.localDenied":"\u8BFB\u4E0D\u5230\u672C\u5730\u5B57\u4F53 \xB7 \u6D4F\u89C8\u5668\u62D2\u4E86\u6216\u88AB Permissions-Policy \u5C4F\u853D \xB7 console \u770B\u5177\u4F53\u539F\u56E0","panel.title":"\u53CD\u9988\u7ED9 Agent / \u8BBE\u8BA1\u5E08","panel.copy":"\u53CD\u9988\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F","panel.copy.fallback":"\u53CD\u9988\u5DF2\u590D\u5236\uFF08\u517C\u5BB9\u6A21\u5F0F\uFF09","panel.attachment.added":"\u5DF2\u6DFB\u52A0\u622A\u56FE\uFF08\u5171 {count} \u5F20\uFF09","panel.cleared":"\u5DF2\u6E05\u7A7A\u6240\u6709\u53CD\u9988","panel.current":"\u5F53\u524D\u9875","panel.saved":"\u5DF2\u5B58","panel.pill.edit":"\u7F16\u8F91","panel.pill.section":"\u9875\u9762","panel.pill.element":"\u5143\u7D20","panel.placeholder.current":"\u5BF9\u5F53\u524D\u8FD9\u4E00\u9875\u7684\u53CD\u9988\uFF08\u5220 / \u7F29 / \u52A0\u5185\u5BB9 / \u6362\u5143\u7D20\u2026\uFF09","panel.placeholder.global":"\u5168\u5C40\u53CD\u9988\uFF08\u6574\u4F53\u611F\u53D7 / \u60F3\u52A0\u60F3\u5220\u7684\u9875\u9762\u2026\uFF09","panel.btn.save":"\u4FDD\u5B58\u53CD\u9988","panel.btn.copy":"\u590D\u5236\u53CD\u9988","panel.btn.save.title":"\u6253\u5305\u53CD\u9988 + \u622A\u56FE\u5230\u672C\u5730\uFF08\u7ED9 agent \u5B8C\u6574\u4E0A\u4E0B\u6587\uFF09","panel.btn.copy.title":"\u53EA\u590D\u5236\u53CD\u9988\u6587\u5B57\u5230\u526A\u8D34\u677F\uFF08\u4E0D\u542B\u622A\u56FE\uFF09","panel.btn.shot.title":"\u622A\u5F53\u524D\u89C6\u53E3\u4E3A\u9644\u4EF6\uFF08\u8BC4\u5BA1\u7EBF\u4E0A\u9875\u9762\u5E38\u7528\uFF09","panel.btn.pick.title":"\u53D6\u8272\u5668\uFF1A\u70B9\u51FB\u9875\u9762\u4EFB\u610F\u4F4D\u7F6E\u53D6\u989C\u8272 \xB7 hex \u81EA\u52A8\u590D\u5236\u5230\u526A\u8D34\u677F","eyedropper.unsupported":"\u53D6\u8272\u5668\u4E0D\u652F\u6301\u5F53\u524D\u6D4F\u89C8\u5668 \xB7 \u9700\u8981 Chrome / Edge 95+","eyedropper.copied":"{hex} \xB7 \u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F","eyedropper.inserted":"{hex} \xB7 \u5DF2\u63D2\u5165\u53CD\u9988\u6846 + \u526A\u8D34\u677F","shot.loading":"\u6B63\u5728\u622A\u5C4F\u2026","shot.loadFailed":"\u622A\u5C4F\u5E93\u52A0\u8F7D\u5931\u8D25 \xB7 \u9700\u8054\u7F51","shot.failed":"\u622A\u5C4F\u5931\u8D25","restore.hint":"\u5DF2\u6062\u590D\u4E0A\u6B21\u53CD\u9988\uFF1A{pieces}","restore.piece.anno":"{count} \u6761\u6807\u6CE8","restore.piece.sec":"{count} \u6761\u9875\u9762\u53CD\u9988","restore.piece.att":"{count} \u5F20\u622A\u56FE","restore.piece.global":"\u5168\u5C40\u53CD\u9988","persist.quota":"\u672C\u5730\u5B58\u50A8\u5DF2\u6EE1\uFF0C\u622A\u56FE\u672A\u4FDD\u5B58\u5230\u672C\u5730\u7F13\u5B58\uFF08\u70B9\u4FDD\u5B58\u53CD\u9988\u5199\u5230\u78C1\u76D8\uFF09","panel.btn.clearAll":"\u6E05\u7A7A\u6240\u6709\u53CD\u9988","panel.btn.close":"\u5173\u95ED\u9762\u677F\uFF08\u5185\u5BB9\u4FDD\u7559\uFF0C\u5237\u65B0\u4E5F\u5728\uFF09","panel.btn.locale.title":"\u5207\u6362\u5230 {lang}\uFF08\u70B9\u51FB\u4F1A\u5237\u65B0\u9875\u9762\uFF09","panel.localeName.zh":"\u4E2D\u6587","panel.localeName.en":"\u82F1\u6587","save.first":"\u5DF2\u9009\u76EE\u5F55\u5E76\u4FDD\u5B58: {dir}{suffix}","save.again":"\u5DF2\u4FDD\u5B58: {dir}{suffix}","save.cancelled":"\u5DF2\u53D6\u6D88","save.failed":"\u4FDD\u5B58\u5230\u76EE\u5F55\u5931\u8D25 ({reason})\uFF0C\u5DF2\u4E0B\u8F7D .json","save.unsupported":"\u5DF2\u4E0B\u8F7D {stem}.json \xB7 \u6D4F\u89C8\u5668\u4E0D\u652F\u6301 FS Access","save.dirCleared":"\u5DF2\u6E05\u9664\u76EE\u5F55\u8BB0\u5FC6\uFF0C\u4E0B\u6B21\u4FDD\u5B58\u4F1A\u91CD\u65B0\u9009","patch.unsupported":"\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 FS Access\uFF0C\u65E0\u6CD5\u76F4\u63A5\u6539\u6E90","patch.notFile":"\u975E file:// \u534F\u8BAE\uFF0C\u8BF7\u8D70 skill \u6D41\u7A0B","patch.fileNotFound":"\u627E\u4E0D\u5230\u6E90\u6587\u4EF6","patch.cancelled":"\u5DF2\u53D6\u6D88","patch.noChanges":"\u6CA1\u6709\u6539\u52A8\u53EF\u5E94\u7528","patch.partialFail":"0 \u5E94\u7528 / {failed} \u5931\u8D25","patch.success":"\u5DF2\u6539 {file} \xB7 {applied} \u5E94\u7528{failedSuffix}{backupSuffix}","patch.failed":"\u6539\u6E90\u5931\u8D25: {reason}","patch.dirCleared":"\u5DF2\u6E05\u9664\u6E90\u76EE\u5F55\u8BB0\u5FC6\uFF0C\u4E0B\u6B21\u4FDD\u5B58\u4F1A\u91CD\u65B0\u9009","patch.backupFail.title":"\u5907\u4EFD\u5931\u8D25","patch.backupFail.desc":`{reason}

\u7EE7\u7EED\u5199\u5165\uFF1F\u6CA1\u5907\u4EFD\uFF0Cgit \u515C\u5E95\u3002`,"warn.complex.title":"\u68C0\u6D4B\u5230\u590D\u6742\u573A\u666F","warn.complex.desc":`\xB7 {flags}

\u76F4\u63A5\u6539\u6E90\u53EF\u80FD\u4E22\u683C\u5F0F\u6216\u7834\u574F\u6784\u5EFA\u4EA7\u7269\uFF0C\u5EFA\u8BAE\u8D70 skill \u6D41\u7A0B\u3002`,"warn.complex.continue":"\u5F3A\u884C\u7EE7\u7EED","clearAll.title":"\u6E05\u7A7A\u6240\u6709\u53CD\u9988\uFF1F","clearAll.desc":"\u7F16\u8F91\u6539\u52A8\u3001\u5404\u9875\u53CD\u9988\u3001\u5168\u5C40\u53CD\u9988\u3001\u6240\u6709\u622A\u56FE\u90FD\u4F1A\u88AB\u6E05\u6389\u3002\u672C\u5730\u7F13\u5B58\u4E5F\u4E00\u5E76\u6E05\u9664\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002","clearAll.confirm":"\u786E\u8BA4\u6E05\u7A7A","common.cancel":"\u53D6\u6D88","pdf.vector.hint":"\u77E2\u91CF PDF \xB7 \u6253\u5370\u5BF9\u8BDD\u6846\u9009\u300C\u53E6\u5B58\u4E3A PDF\u300D(Shift+P = \u957F\u56FE)","pdf.loading":"\u6B63\u5728\u52A0\u8F7D\u56FE\u7247\u5E93...","pdf.loadFailed":"\u56FE\u7247\u5E93\u52A0\u8F7D\u5931\u8D25 \xB7 \u9700\u8981\u8054\u7F51","pdf.noSlides":"\u6CA1\u627E\u5230 slide","pdf.progress":"\u622A\u56FE\u4E2D {i} / {total}","pdf.saved":"\u5DF2\u4FDD\u5B58 {file}","pdf.failed":"\u5BFC\u51FA\u5931\u8D25: {reason}","anno.action.note":"\u53CD\u9988\u5907\u6CE8\uFF08\u7ED9 agent \u770B\u7684\uFF09","anno.action.image":"\u52A0\u56FE\u7247","anno.action.delete":"\u5220\u9664\u6807\u6CE8","anno.placeholder.content":"\u63D2\u5165\u9875\u9762\u7684\u6587\u5B57\u2026","anno.placeholder.note":"\u7ED9 agent \u7684\u5907\u6CE8\u2026","note.title":"\u5143\u7D20\u53CD\u9988","note.placeholder":"\u5BF9\u8FD9\u4E2A\u5143\u7D20\u7684\u53CD\u9988\uFF08\u5220 / \u6539 / \u91CD\u753B / \u7ED9 agent \u770B\u7684\u5907\u6CE8\u2026\uFF09","tip.font":"\u5B57\u4F53\uFF08\u53CC\u51FB\u5143\u7D20\u76F4\u63A5\u7F16\u8F91\u6587\u5B57\uFF09","tip.tag":"\u6539\u6807\u7B7E (P / H1-H6)","tip.pick":"\u53D6\u8272\u5668\uFF1A\u53D6\u9875\u9762\u4EFB\u610F\u4F4D\u7F6E\u7684\u989C\u8272\uFF08hex \u590D\u5236\u5230\u526A\u8D34\u677F + \u63D2\u5165\u53CD\u9988\u6846\uFF09","tip.highlight":"\u9AD8\u4EAE\uFF08\u9A6C\u514B\u7B14\uFF09","highlight.clear":"\u6E05\u9664\u9AD8\u4EAE","op.highlight":"\u5DF2\u9AD8\u4EAE","op.tag.done":"\u6807\u7B7E\u53D8\u66F4\u4E3A {tag}","op.tag.cleared":"\u5DF2\u64A4\u9500\u6807\u7B7E\u53D8\u66F4","toast.undo":"\u64A4\u9500","undo.done":"\u5DF2\u64A4\u9500","undo.empty":"\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u64CD\u4F5C","undo.gone":"\u5143\u7D20\u5DF2\u4E0D\u5728\u9875\u9762","redo.done":"\u5DF2\u91CD\u505A","redo.empty":"\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u64CD\u4F5C","redo.gone":"\u5143\u7D20\u5DF2\u4E0D\u5728\u9875\u9762","copy.descriptor.done":"\u5DF2\u590D\u5236\u5143\u7D20\u63CF\u8FF0\u7B26","copy.descriptor.empty":"\u6CA1\u6709\u9009\u4E2D\u5143\u7D20","copy.descriptor.fail":"\u590D\u5236\u5931\u8D25","audit.on":"\u5BA1\u8BA1\u6A21\u5F0F \xB7 {n} \u5904\u6539\u52A8","audit.empty":"\u5BA1\u8BA1\u6A21\u5F0F \xB7 \u6CA1\u6709\u6539\u52A8","audit.off":"\u5BA1\u8BA1\u6A21\u5F0F\u5173\u95ED","mode.chip.deck":"\u5E7B\u706F\u7247","mode.chip.doc":"\u6587\u6863","mode.chip.review":"\u8BC4\u5BA1","design.tag.spacing":"\u95F4\u8DDD","design.tag.color":"\u989C\u8272","design.tag.typography":"\u5B57\u53F7","design.tag.layout":"\u6392\u7248","design.tag.copy":"\u6587\u6848","tip.replaceImg":"\u6362\u56FE\u7247","tip.moveUp":"\u4E0A\u79FB 4px (\u6309\u4F4F Shift = 16px)","tip.moveDown":"\u4E0B\u79FB 4px (\u6309\u4F4F Shift = 16px)","tip.moveLeft":"\u5DE6\u79FB 4px (\u6309\u4F4F Shift = 16px)","tip.moveRight":"\u53F3\u79FB 4px (\u6309\u4F4F Shift = 16px)","tip.zoomIn":"\u653E\u5927 10%","tip.zoomOut":"\u7F29\u5C0F 10%","tip.note":"\u5BF9\u8BE5\u5143\u7D20\u5199\u53CD\u9988\uFF08\u4E0D\u6539\u6E90\uFF09","tip.link":"\u6539\u8D85\u94FE\u63A5 (href)","tip.hide":"\u9690\u85CF\uFF08\u5360\u4F4D\uFF09","tip.delete":"\u5220\u9664\uFF08\u4E0D\u5360\u4F4D\uFF09","tip.restore":"\u8FD8\u539F\u6240\u6709\u53D8\u6362","tip.close":"\u53D6\u6D88\u9009\u4E2D","tip.rotate":"\u62D6\u52A8\u65CB\u8F6C \xB7 \u6309\u4F4F Shift \u5438\u9644 15\xB0","tip.scale":"\u62D6\u52A8\u7F29\u653E","overlay.edit":"\u7F16\u8F91\u6A21\u5F0F (E)","overlay.feedback":"\u53CD\u9988\u9762\u677F (F)","overlay.export":"\u5BFC\u51FA PDF \xB7 Shift+\u70B9\u51FB = \u957F\u56FE","overlay.pick":"\u53D6\u8272\u5668\uFF1A\u70B9\u51FB\u9875\u9762\u4EFB\u610F\u4F4D\u7F6E\u53D6\u989C\u8272 \xB7 hex \u590D\u5236\u5230\u526A\u8D34\u677F + \u63D2\u5165\u53CD\u9988\u6846","overlay.undo":"\u64A4\u9500\u6700\u8FD1\u4E00\u6B21\u64CD\u4F5C (\u2318Z)","overlay.redo":"\u91CD\u505A (\u2318\u21E7Z)","overlay.save":"\u4FDD\u5B58\u7F16\u8F91\uFF1A\u628A\u6240\u6709\u6539\u52A8\u5199\u56DE\u6E90 HTML\uFF08\u81EA\u52A8\u5907\u4EFD\uFF09\xB7 \u53F3\u952E\u91CD\u9009\u76EE\u5F55","overlay.marquee":"\u6846\u9009\u6807\u6CE8\uFF1A\u62D6\u4E00\u4E2A\u6846 \u2192 \u5199\u6587\u5B57 / \u52A0\u56FE\u7247","overlay.help":"\u5FEB\u6377\u952E / \u5E2E\u52A9","overlay.fold":"\u6298\u53E0\u5DE5\u5177\u6761\uFF08\u70B9\u7F16\u8F91\u53EF\u91CD\u65B0\u5C55\u5F00 + \u8FDB\u5165\u7F16\u8F91\uFF09","help.title":"\u5FEB\u6377\u952E","help.group.modes":"\u6A21\u5F0F","help.group.actions":"\u64CD\u4F5C","help.group.export":"\u5BFC\u51FA","help.group.misc":"\u5176\u4ED6","help.shortcut.edit":"\u7F16\u8F91\u6A21\u5F0F","help.shortcut.feedback":"\u53CD\u9988\u9762\u677F","help.shortcut.marquee":"\u6846\u9009\u6807\u6CE8","help.shortcut.cancel":"\u53D6\u6D88\u9009\u4E2D","help.shortcut.delete":"\u5220\u9664\u9009\u4E2D\u5143\u7D20","help.shortcut.save":"\u4FDD\u5B58\u53CD\u9988","help.shortcut.copy":"\u590D\u5236\u53CD\u9988","help.shortcut.undo":"\u64A4\u9500","help.shortcut.redo":"\u91CD\u505A","help.shortcut.copyDescriptor":"\u590D\u5236\u9009\u4E2D\u5143\u7D20\u63CF\u8FF0\u7B26","help.shortcut.multiSelect":"\u52A0\u5165 / \u79FB\u51FA\u591A\u9009","help.shortcut.rubberBand":"\u7A7A\u767D\u62D6\u52A8 \xB7 \u6846\u9009\u53EF\u7F16\u8F91\u5143\u7D20","help.shortcut.audit":"\u5BA1\u8BA1\u6A21\u5F0F \xB7 \u770B\u6240\u6709\u6539\u52A8","help.shortcut.measure":"\u95F4\u8DDD\u6D4B\u91CF \xB7 \u9009\u4E2D + Alt + \u60AC\u6D6E\u76EE\u6807","help.shortcut.pdfVector":"\u77E2\u91CF PDF","help.shortcut.pdfImage":"\u957F\u56FE PDF","help.shortcut.help":"\u663E\u793A / \u9690\u85CF\u5E2E\u52A9"},en:{"edit.on":"Edit mode on \xB7 Click to select \xB7 Double-click to edit text \xB7 Esc to cancel","edit.off":"Edit mode off","edit.off.pending":"Edit mode off \xB7 {count} pending changes saved","marquee.on":"Marquee mode on \xB7 Drag to draw \xB7 Esc to exit","marquee.off":"Marquee mode off","op.delete":"Marked for deletion","op.hide":"Marked as hidden","op.restore":"Restored","op.replaceImg":"Image replaced","op.link.prompt":"Edit link (href):","op.link.done":"Link updated","op.link.cleared":"Link cleared","op.font":"Font: {name}","font.systemDefault":"System default (clear)","font.group.generic":"Generic","font.group.document":"Page fonts","font.group.local":"Local fonts","font.loading":"Loading fonts...","font.localUnsupported":"Local fonts unavailable \xB7 Chrome 103+ / Edge required; may need https:// or file:// origin","font.localDenied":"Local fonts unavailable \xB7 denied by browser or Permissions-Policy \xB7 check console for the reason","panel.title":"Feedback to Agent / Designer","panel.copy":"Feedback copied to clipboard","panel.copy.fallback":"Copied (legacy mode)","panel.attachment.added":"Screenshot added ({count} total)","panel.cleared":"All feedback cleared","panel.current":"Current page","panel.saved":"Saved","panel.pill.edit":"Edits","panel.pill.section":"Pages","panel.pill.element":"Elements","panel.placeholder.current":"Feedback for this page (delete / shrink / add content / swap element...)","panel.placeholder.global":"Global feedback (overall feel / pages to add or remove...)","panel.btn.save":"Save feedback","panel.btn.copy":"Copy feedback","panel.btn.save.title":"Bundle feedback + screenshots locally (full context for agents)","panel.btn.copy.title":"Copy feedback text only (no screenshots)","panel.btn.shot.title":"Capture current viewport as attachment (handy in review mode)","panel.btn.pick.title":"Eyedropper: click anywhere to sample a color \xB7 hex copied to clipboard","eyedropper.unsupported":"Eyedropper not supported in this browser \xB7 Chrome / Edge 95+ required","eyedropper.copied":"{hex} \xB7 copied to clipboard","eyedropper.inserted":"{hex} \xB7 inserted into feedback + clipboard","shot.loading":"Capturing\u2026","shot.loadFailed":"Screenshot library failed to load \xB7 Check your network","shot.failed":"Screenshot failed","restore.hint":"Restored prior feedback: {pieces}","restore.piece.anno":"{count} annotations","restore.piece.sec":"{count} page notes","restore.piece.att":"{count} screenshots","restore.piece.global":"global feedback","persist.quota":"Local storage full \u2014 screenshots not cached (use Save to write to disk)","panel.btn.clearAll":"Clear all feedback","panel.btn.close":"Close panel (content preserved across reload)","panel.btn.locale.title":"Switch to {lang} (page will reload)","panel.localeName.zh":"Chinese","panel.localeName.en":"English","save.first":"Directory selected and saved: {dir}{suffix}","save.again":"Saved: {dir}{suffix}","save.cancelled":"Cancelled","save.failed":"Failed to save to directory ({reason}), downloaded .json instead","save.unsupported":"Downloaded {stem}.json \xB7 Browser does not support FS Access","save.dirCleared":"Directory cache cleared. Next save will pick again.","patch.unsupported":"Browser does not support FS Access; cannot patch source directly","patch.notFile":"Not a file:// URL; use the skill workflow instead","patch.fileNotFound":"Source file not found","patch.cancelled":"Cancelled","patch.noChanges":"No changes to apply","patch.partialFail":"0 applied / {failed} failed","patch.success":"Patched {file} \xB7 {applied} applied{failedSuffix}{backupSuffix}","patch.failed":"Patch failed: {reason}","patch.dirCleared":"Source directory cache cleared. Next patch will pick again.","patch.backupFail.title":"Backup failed","patch.backupFail.desc":`{reason}

Continue writing without backup? (Git is your safety net.)`,"warn.complex.title":"Complex scenario detected","warn.complex.desc":`\xB7 {flags}

Direct source patching may break formatting or build artifacts. The skill workflow is recommended.`,"warn.complex.continue":"Continue anyway","clearAll.title":"Clear all feedback?","clearAll.desc":"All edits, per-page notes, global feedback, and screenshots will be removed. Local cache will also be cleared. This cannot be undone.","clearAll.confirm":"Clear all","common.cancel":"Cancel","pdf.vector.hint":'Vector PDF \xB7 Choose "Save as PDF" in the print dialog (Shift+P = long-image)',"pdf.loading":"Loading image library...","pdf.loadFailed":"Image library failed to load \xB7 Check your network","pdf.noSlides":"No slide elements found","pdf.progress":"Capturing {i} / {total}","pdf.saved":"Saved {file}","pdf.failed":"Export failed: {reason}","anno.action.note":"Feedback note (for agent only)","anno.action.image":"Add image","anno.action.delete":"Remove annotation","anno.placeholder.content":"Text to insert\u2026","anno.placeholder.note":"Note for agent\u2026","note.title":"Element feedback","note.placeholder":"Feedback for this element (delete / change / redraw / note for agent...)","tip.font":"Font (double-click element to edit text directly)","tip.tag":"Change tag (P / H1-H6)","tip.pick":"Eyedropper: sample any pixel on the page (hex to clipboard + feedback box)","tip.highlight":"Highlight (marker)","highlight.clear":"Clear highlight","op.highlight":"Highlighted","op.tag.done":"Tag changed to {tag}","op.tag.cleared":"Tag change cleared","toast.undo":"Undo","undo.done":"Undone","undo.empty":"Nothing to undo","undo.gone":"Element no longer in page","redo.done":"Redone","redo.empty":"Nothing to redo","redo.gone":"Element no longer in page","copy.descriptor.done":"Descriptor copied","copy.descriptor.empty":"No element selected","copy.descriptor.fail":"Copy failed","audit.on":"Audit \xB7 {n} change(s)","audit.empty":"Audit \xB7 nothing changed yet","audit.off":"Audit off","mode.chip.deck":"Deck","mode.chip.doc":"Doc","mode.chip.review":"Review","design.tag.spacing":"Spacing","design.tag.color":"Color","design.tag.typography":"Type","design.tag.layout":"Layout","design.tag.copy":"Copy","tip.replaceImg":"Replace image","tip.moveUp":"Move up 4px (Shift = 16px)","tip.moveDown":"Move down 4px (Shift = 16px)","tip.moveLeft":"Move left 4px (Shift = 16px)","tip.moveRight":"Move right 4px (Shift = 16px)","tip.zoomIn":"Zoom in 10%","tip.zoomOut":"Zoom out 10%","tip.note":"Write feedback for this element (no source change)","tip.link":"Edit hyperlink (href)","tip.hide":"Hide (placeholder kept)","tip.delete":"Delete (no placeholder)","tip.restore":"Restore all transforms","tip.close":"Deselect","tip.rotate":"Drag to rotate \xB7 Hold Shift to snap 15\xB0","tip.scale":"Drag to scale","overlay.edit":"Edit mode (E)","overlay.feedback":"Feedback panel (F)","overlay.export":"Export PDF \xB7 Shift+click = long-image","overlay.pick":"Eyedropper: click anywhere to sample a color \xB7 hex to clipboard + feedback box","overlay.undo":"Undo last action (\u2318Z)","overlay.redo":"Redo (\u2318\u21E7Z)","overlay.save":"Patch source HTML with all edits (auto-backup) \xB7 Right-click to reselect dir","overlay.marquee":"Marquee annotate: drag a box \u2192 text / image","overlay.help":"Shortcuts / Help","overlay.fold":"Collapse toolbar (click edit to expand + enter edit)","help.title":"Shortcuts","help.group.modes":"Modes","help.group.actions":"Actions","help.group.export":"Export","help.group.misc":"More","help.shortcut.edit":"Edit mode","help.shortcut.feedback":"Feedback panel","help.shortcut.marquee":"Marquee annotate","help.shortcut.cancel":"Cancel selection","help.shortcut.delete":"Delete selected element","help.shortcut.save":"Save feedback","help.shortcut.copy":"Copy feedback","help.shortcut.undo":"Undo","help.shortcut.redo":"Redo","help.shortcut.copyDescriptor":"Copy selected descriptor","help.shortcut.multiSelect":"Toggle add to / remove from multi-select","help.shortcut.rubberBand":"Drag on empty area \xB7 rubber-band select","help.shortcut.audit":"Audit \xB7 show all changes","help.shortcut.measure":"Measure \xB7 select + Alt + hover target","help.shortcut.pdfVector":"Vector PDF","help.shortcut.pdfImage":"Long-image PDF","help.shortcut.help":"Toggle help"}},bo="fbw-locale",xt=null;function la(){try{let e=localStorage.getItem(bo);return e&&me[e]?e:null}catch{return null}}function ca(){if(typeof window<"u"&&window.__fbwLocale&&me[window.__fbwLocale])return window.__fbwLocale;let e=la();return e||((typeof navigator<"u"&&navigator.language||"en").toLowerCase().startsWith("zh")?"zh":"en")}function Xe(){return xt||(xt=ca()),xt}function uo(){let o=Xe()==="zh"?"en":"zh";try{localStorage.setItem(bo,o)}catch{}typeof location<"u"&&location.reload()}function l(e,o){let t=Xe(),a=(me[t]||me.en)[e];return a===void 0&&(a=me.en&&me.en[e]||e),o&&Object.keys(o).forEach(i=>{a=a.replace(new RegExp("\\{"+i+"\\}","g"),o[i])}),a}var da={scroll:"window",resize:"window",mousemove:"document",mouseup:"document"},mo=new Map;function fa(e){let o=mo.get(e);if(o||(o={subs:new Set,attached:!1},mo.set(e,o)),!o.attached){let t=da[e]==="window"?window:document,a=e==="mousemove"||e==="mouseup"?{passive:!1,capture:!1}:{passive:!0,capture:!0};t.addEventListener(e,i=>{o.subs.forEach(s=>{try{s(i)}catch(c){console.warn("[fbw] event bus subscriber failed:",e,c)}})},a),o.attached=!0}return o}function Ve(e,o){let t=fa(e);return t.subs.add(o),()=>t.subs.delete(o)}var fe=e=>Ve("scroll",e),re=e=>Ve("resize",e),V=e=>Ve("mousemove",e),Z=e=>Ve("mouseup",e);var ie=null;function b(e,o){ie&&ie.parentNode&&ie.remove();let t=document.createElement("div");if(t.className="fbw-toast",o?.action){let n=document.createElement("span");n.textContent=e,t.appendChild(n);let a=document.createElement("button");a.className="fbw-toast-action",a.type="button",a.textContent=o.action.label,a.addEventListener("click",i=>{i.stopPropagation();try{o.action.onClick()}catch{}t.parentNode&&t.remove(),ie===t&&(ie=null)}),t.appendChild(a)}else t.textContent=e;ie=t,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove(),ie===t&&(ie=null)},o?.duration??2400)}function Fe(e,o){if(!e)return;e.textContent=o;let t=e.closest(".fbw-pill");t&&t.classList.toggle("fbw-has-count",Number(o)>0)}function F(e){if(!r.panel)return;let o=e?e().length:0;Fe(r.panel.querySelector('[data-fbw-counter="edit"]'),o),Fe(r.panel.querySelector('[data-fbw-counter="sec"]'),r.sectionFeedback.size),Fe(r.panel.querySelector('[data-fbw-counter="att"]'),r.attachments.length);let t=r.panel.querySelector('[data-fbw-counter="ops"]');if(t&&Fe(t,r.elementOps.size),r.saveEditBtn){let n=o+r.elementOps.size,a=r.saveEditBtn.querySelector(".fbw-edit-count");a&&(a.textContent=n),r.saveEditBtn.classList.toggle("fbw-has-changes",n>0)}if(r.panel){let n=r.panel.querySelector('[data-fbw-counter="sec"]');n&&Fe(n,r.sectionFeedback.size+r.annotations.length)}if(typeof r.onChangeHook=="function")try{r.onChangeHook()}catch{}}function go(e){return(e?e().length:0)+r.elementOps.size}function yt({title:e,desc:o,choices:t}){return new Promise(n=>{let a=document.createElement("div");a.className="fbw-confirm fbw-on",a.innerHTML=`
      <div class="fbw-confirm-box">
        <div class="fbw-confirm-title" data-fbw-c-title></div>
        <div class="fbw-confirm-desc" data-fbw-c-desc></div>
        <div class="fbw-confirm-actions" data-fbw-c-actions></div>
      </div>
    `,a.querySelector("[data-fbw-c-title]").textContent=e,a.querySelector("[data-fbw-c-desc]").textContent=o;let i=a.querySelector("[data-fbw-c-actions]");t.forEach((f,p)=>{let m=document.createElement("button"),y="fbw-btn";f.primary&&(y+=" fbw-primary"),f.danger&&(y+=" fbw-danger"),(f.cancel||f.value==="cancel")&&(y+=" fbw-btn-cancel"),m.className=y,m.dataset.fbwChoiceIdx=String(p),m.textContent=f.label,i.appendChild(m)}),document.body.appendChild(a);let s=()=>t.find(f=>f.cancel||f.value==="cancel")?.value??null,c=f=>{a.classList.add("fbw-confirm-leave"),document.removeEventListener("keydown",d,!0),setTimeout(()=>{a.remove(),n(f)},140)};a.addEventListener("click",f=>{let p=f.target.closest("[data-fbw-choice-idx]");if(p){c(t[parseInt(p.dataset.fbwChoiceIdx,10)].value);return}f.target===a&&c(s())});let d=f=>{f.key==="Escape"&&(f.stopPropagation(),c(s()))};document.addEventListener("keydown",d,!0)})}var pa=0,ho=0;function ba(e){return!(!e||e.closest(".fbw-panel, .fbw-fab, .fbw-toast, .fbw-confirm, script, style, button, [data-fbw-noedit]")||e.matches("button, br, img, svg, path, use, a[href]")||e.dataset.fbwEditId||!e.textContent.trim())}function z(e){return(e.textContent||"").replace(/^\s+|\s+$/g,"")}function wo(e){if(!ba(e))return;let o="fbw-e-"+pa++;e.dataset.fbwEditId=o,r.originals.set(o,z(e))}function xo(){let e=Array.from(document.querySelectorAll(q));return e.length===0&&(e=[document.querySelector('main, [role="main"], article')||document.body]),e.forEach(t=>{t.dataset.fbwSecId||(t.dataset.fbwSecId="fbw-sec-"+ho++);let n=(t.dataset.screenLabel||t.dataset.fbwLabel||t.querySelector(".label")?.innerText||t.querySelector("h1, h2")?.innerText||(t===document.body||t.tagName==="MAIN"||t.tagName==="ARTICLE"?document.title||"Page":"Section "+ho)).trim();t.dataset.fbwSecLabel=n.slice(0,80)}),document.querySelectorAll(jt).forEach(wo),e.length===1&&e[0]===document.body||e.forEach(t=>{let n=document.createTreeWalker(t,NodeFilter.SHOW_ELEMENT,{acceptNode(i){return i.children.length>0||i.dataset&&i.dataset.fbwEditId?NodeFilter.FILTER_SKIP:NodeFilter.FILTER_ACCEPT}}),a;for(;a=n.nextNode();)wo(a)}),typeof window<"u"&&(window.__fbwOriginals=r.originals),e}function yo(e){let t=e.closest("[data-fbw-sec-id]")?.dataset.fbwSecLabel||"?",n=e.tagName.toLowerCase(),a=[...e.classList].filter(s=>!s.startsWith("fbw-")).slice(0,2).join("."),i=(e.textContent||"").replace(/\s+/g," ").trim().slice(0,28);return`[${t}] \xB7 ${n}${a?"."+a:""}${i?` \xB7 "${i}"`:""}`}function ua(){let e=0;return r.elementOps.forEach((o,t)=>{document.contains(t)||(r.elementOps.delete(t),e++)}),e}function T(e,o,t){r.elementOps.has(e)||r.elementOps.set(e,{ops:[],descriptor:yo(e)});let n=r.elementOps.get(e);n.ops=n.ops.filter(i=>i.op!==o);let a={op:o};t!==void 0&&(a.args=t),r.appMode==="review"&&(a.proposed=!0),n.ops.push(a),F(k)}function Ze(e){r.elementOps.delete(e),F(k)}function vo(e,o){let t=(o||"").trim();if(!r.elementOps.has(e)){if(!t)return;r.elementOps.set(e,{ops:[],descriptor:yo(e)})}let n=r.elementOps.get(e);n.ops=n.ops.filter(a=>a.op!=="note"),t&&n.ops.push({op:"note",args:{text:t}}),n.ops.length===0&&r.elementOps.delete(e),F(k)}function Pe(e){let o=r.elementOps.get(e);return o&&o.ops.find(n=>n.op==="note")?.args?.text||""}function J(e){return{x:parseFloat(e.dataset.fbwTx||"0"),y:parseFloat(e.dataset.fbwTy||"0"),scale:parseFloat(e.dataset.fbwScale||"1"),rotate:parseFloat(e.dataset.fbwRotate||"0")}}function Q(e,o){e.dataset.fbwTx=o.x,e.dataset.fbwTy=o.y,e.dataset.fbwScale=o.scale,e.dataset.fbwRotate=o.rotate||0;let t=[];(o.x!==0||o.y!==0)&&t.push(`translate(${o.x}px, ${o.y}px)`),o.rotate&&t.push(`rotate(${o.rotate}deg)`),o.scale!==1&&t.push(`scale(${o.scale})`),e.style.transform=t.join(" ")}function k(){ua();let e=[];return document.querySelectorAll("[data-fbw-edit-id][data-fbw-edited]").forEach(o=>{let t=o.dataset.fbwEditId,n=r.originals.get(t),a=z(o);if(n!==a){let i=o.closest("[data-fbw-sec-id]");e.push({id:t,before:n,after:a,section:i?.dataset.fbwSecLabel||"?"})}}),e}var vt=null;function ko(){try{let e=localStorage.getItem(Ce);if(!e)return;let o=JSON.parse(e);o.globalNote&&r.panel&&(r.panel.querySelector("[data-fbw-global]").value=o.globalNote),o.sectionFeedback&&Object.entries(o.sectionFeedback).forEach(([a,i])=>r.sectionFeedback.set(a,i)),Array.isArray(o.attachments)&&o.attachments.forEach(a=>r.attachments.push(a)),Array.isArray(o.annotations)&&o.annotations.forEach(a=>r.annotations.push(a));let t={anno:r.annotations.length,sec:r.sectionFeedback.size,att:r.attachments.length,hasGlobal:!!(o.globalNote||"").trim()};if(t.anno+t.sec+t.att+(t.hasGlobal?1:0)>0&&o.savedAt&&Date.now()-o.savedAt>6e4){let s=[];t.anno&&s.push(l("restore.piece.anno",{count:t.anno})),t.sec&&s.push(l("restore.piece.sec",{count:t.sec})),t.att&&s.push(l("restore.piece.att",{count:t.att})),t.hasGlobal&&s.push(l("restore.piece.global")),setTimeout(()=>b(l("restore.hint",{pieces:s.join(" \xB7 ")})),600)}}catch{}}var kt=!1;function Et(){if(!r.panel)return;let e;try{let o={};document.querySelectorAll("[data-fbw-edit-id][data-fbw-edited]").forEach(a=>{let i=a.dataset.fbwEditId,s=z(a);r.originals.get(i)!==s&&(o[i]=s)});let t={};r.sectionFeedback.forEach((a,i)=>{t[i]=a});let n={globalNote:r.panel.querySelector("[data-fbw-global]").value,sectionFeedback:t,attachments:r.attachments.map(a=>({id:a.id,name:a.name,type:a.type})),annotations:r.annotations,edits:o,savedAt:Date.now()};e=JSON.stringify(n)}catch(o){console.warn("[fbw] saveState serialize failed:",o);return}try{localStorage.setItem(Ce,e),kt=!1}catch(o){console.warn("[fbw] saveState quota exceeded, payload size:",e.length,o?.name),kt||(kt=!0,b(l("persist.quota")));try{let t=JSON.parse(e);t.annotations=(t.annotations||[]).map(n=>({...n,image:n.image?{...n.image,dataURL:""}:n.image})),localStorage.setItem(Ce,JSON.stringify(t))}catch{}}}function L(){vt&&clearTimeout(vt),vt=setTimeout(Et,400)}function Eo(){try{localStorage.removeItem(Ce)}catch{}}var Je=[{key:"spacing",i18nKey:"design.tag.spacing"},{key:"color",i18nKey:"design.tag.color"},{key:"typography",i18nKey:"design.tag.typography"},{key:"layout",i18nKey:"design.tag.layout"},{key:"copy",i18nKey:"design.tag.copy"}];function ma(e){let o=Je.map(a=>({key:a.key,label:l(a.i18nKey)})),t=new Set,n=e;for(;;){let a=n.match(/^\s*\[([^\]]+)\]\s*/);if(!a)break;let i=a[1].trim(),s=o.find(c=>c.label===i);if(!s)break;t.add(s.key),n=n.slice(a[0].length)}return t}function pe(e,o){if(!e||!o)return;let t=ma(o.value||"");e.querySelectorAll("[data-fbw-tag]").forEach(n=>{n.classList.toggle("fbw-on",t.has(n.dataset.fbwTag))})}function ga(e,o){if(!e)return;let t=Je.find(c=>c.key===o);if(!t)return;let n=l(t.i18nKey),a=`[${n}] `,i=e.value||"",s=new RegExp(`^\\s*\\[${n.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}\\]\\s*`);s.test(i)?e.value=i.replace(s,""):e.value=a+i,e.dispatchEvent(new Event("input",{bubbles:!0})),e.focus()}function Qe(e,o){e&&e.addEventListener("click",t=>{let n=t.target.closest("[data-fbw-tag]");if(!n)return;t.preventDefault(),t.stopPropagation();let a=o();a&&(ga(a,n.dataset.fbwTag),pe(e,a))})}function ha(){return'<div class="fbw-design-tags" data-fbw-tags>'+Je.map(e=>`<button class="fbw-design-tag" type="button" data-fbw-tag="${e.key}">${l(e.i18nKey)}</button>`).join("")+"</div>"}var R=null,B=null,ge=null,So=!1;function wa(){So||(So=!0,V(e=>{let o=ge;if(!o)return;let t=e.clientX-o.startX,n=e.clientY-o.startY,a=o.box;if(o.type==="move")a.style.left=o.origLeft+t+"px",a.style.top=o.origTop+n+"px";else if(o.type==="resize"){let{origLeft:s,origTop:c,origW:d,origH:f,corner:p}=o,m=s,y=c,h=d,g=f;if(p.includes("e")&&(h=Math.max(24,d+t)),p.includes("s")&&(g=Math.max(24,f+n)),p.includes("w")){let u=Math.max(24,d-t);m=s+(d-u),h=u}if(p.includes("n")){let u=Math.max(24,f-n);y=c+(f-u),g=u}a.style.left=m+"px",a.style.top=y+"px",a.style.width=h+"px",a.style.height=g+"px"}}),Z(()=>{if(!ge)return;let e=ge.persist;if(ge=null,e)try{e()}catch{}}))}function xa(){if(!r.editMode)return;r.editMode=!1,document.body.classList.remove("fbw-edit-mode"),document.querySelectorAll("[data-fbw-edit-id]").forEach(o=>{o.contentEditable="false",o.spellcheck=!1});let e=document.querySelector(".fbw-selected");e&&e.classList.remove("fbw-selected"),r.selectedEl=null,r.elemToolbar?.classList.remove("fbw-toolbar-open"),r.resizeHandles?.classList.remove("fbw-on"),r.fontPicker?.classList.remove("fbw-fp-open"),r.editToggleBtn&&r.editToggleBtn.classList.remove("fbw-active"),r.editFab?.classList.remove("fbw-active")}function he(){r.marqueeMode=!r.marqueeMode,r.marqueeMode&&r.editMode&&xa(),document.body.classList.toggle("fbw-marquee-mode",r.marqueeMode),r.marqueeToggleBtn&&r.marqueeToggleBtn.classList.toggle("fbw-active",r.marqueeMode),r.marqueeFab&&r.marqueeFab.classList.toggle("fbw-active",r.marqueeMode),b(r.marqueeMode?l("marquee.on"):l("marquee.off"))}function Co(){r.marqueeMode&&(r.marqueeMode=!1,document.body.classList.remove("fbw-marquee-mode"),r.marqueeToggleBtn&&r.marqueeToggleBtn.classList.remove("fbw-active"))}function ya(e){return e?!e.closest(".fbw-panel, .fbw-fab, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-resize-handles, .fbw-anno, .fbw-marquee-drawing, .fbw-font-picker"):!1}function To(e,o){let t=null;return document.querySelectorAll("[data-fbw-sec-id]").forEach(n=>{let a=n.getBoundingClientRect();e>=a.left&&e<=a.right&&o>=a.top&&o<=a.bottom&&(t=n)}),t||document.querySelector("[data-fbw-sec-id]")||document.querySelector(q)||document.body}function Lo(e,o){if(!B||!R)return;let t=Math.min(R.startX,e),n=Math.min(R.startY,o),a=Math.abs(e-R.startX),i=Math.abs(o-R.startY);B.style.left=t+"px",B.style.top=n+"px",B.style.width=a+"px",B.style.height=i+"px"}function va(e,o){let t=Math.min(R.startX,e),n=Math.min(R.startY,o),a=Math.abs(e-R.startX),i=Math.abs(o-R.startY);if(a<12||i<12)return;let s=To(t+a/2,n+i/2),c=s?s.getBoundingClientRect():{left:0,top:0,width:1,height:1},d={id:"fbw-anno-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),type:"region",secId:s?.dataset.fbwSecId||null,secLabel:s?.dataset.fbwSecLabel||null,rectPct:{x:(t-c.left)/c.width,y:(n-c.top)/c.height,w:a/c.width,h:i/c.height},content:"",note:"",image:null};d._autoEdit=!0,r.annotations.push(d),St(d),L()}function ka(e,o){let t=To(e,o);if(!t)return null;let n=t.getBoundingClientRect(),a={id:"fbw-anno-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),type:"floating",secId:t.dataset.fbwSecId,secLabel:t.dataset.fbwSecLabel||null,rectPct:{x:(e-n.left)/n.width,y:(o-n.top)/n.height,w:0,h:0},content:"",_editing:!0};return r.annotations.push(a),St(a),a}function Ae(e){return String(e).replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o])}function St(e){e.type||(e.type="region"),e.text&&!e.note&&(e.note=e.text,delete e.text);let o=document.querySelector(`[data-anno-id="${e.id}"]`);return o&&o.remove(),e.type==="floating"?Ea(e):Sa(e)}function Ea(e){let o=e.secId?document.querySelector(`[data-fbw-sec-id="${e.secId}"]`):null;if(!o)return;let t=o.getBoundingClientRect(),n=document.createElement("div");n.className="fbw-anno fbw-anno-floating",n.dataset.annoId=e.id,n.style.position="absolute",n.style.left=t.left+window.scrollX+e.rectPct.x*t.width+"px",n.style.top=t.top+window.scrollY+e.rectPct.y*t.height+"px",n.style.maxWidth=Math.max(180,t.width*.45)+"px";let a=()=>{r.annotations=r.annotations.filter(c=>c.id!==e.id),n.remove(),L()},i=()=>{if(e._editing=!1,!e.content||!e.content.trim()){a();return}n.innerHTML=`<div class="fbw-anno-floating-text">${Ae(e.content).replace(/\n/g,"<br>")}</div><button class="fbw-anno-floating-x" data-action="delete" aria-label="delete">\xD7</button>`},s=()=>{e._editing=!0,n.innerHTML=`<textarea class="fbw-anno-floating-input" placeholder="${l("anno.placeholder.content")}"></textarea><button class="fbw-anno-floating-x" data-action="delete" aria-label="delete">\xD7</button>`;let c=n.querySelector("textarea");c.value=e.content||"",setTimeout(()=>{c.focus(),c.setSelectionRange(c.value.length,c.value.length)},0),["keydown","keyup","keypress","mousedown"].forEach(d=>c.addEventListener(d,f=>f.stopPropagation())),c.addEventListener("input",()=>{e.content=c.value,L()}),c.addEventListener("blur",i),c.addEventListener("keydown",d=>{d.key==="Escape"&&(d.preventDefault(),c.blur())})};n.addEventListener("click",c=>{c.target.closest('[data-action="delete"]')&&(c.stopPropagation(),a())}),n.addEventListener("dblclick",c=>{c.stopPropagation(),e._editing||s()}),document.body.appendChild(n),e._editing?s():i()}function Sa(e){let o=e.secId?document.querySelector(`[data-fbw-sec-id="${e.secId}"]`):null;if(!o)return;let t=o.getBoundingClientRect(),n=document.createElement("div");n.className="fbw-anno",n.dataset.annoId=e.id,n.style.position="absolute",n.style.left=t.left+window.scrollX+e.rectPct.x*t.width+"px",n.style.top=t.top+window.scrollY+e.rectPct.y*t.height+"px",n.style.width=e.rectPct.w*t.width+"px",n.style.height=e.rectPct.h*t.height+"px",n.innerHTML=`
    <div class="fbw-anno-actions">
      <button data-action="note" data-tooltip="${l("anno.action.note")}">${X}</button>
      <button data-action="image" data-tooltip="${l("anno.action.image")}">${Te}</button>
      <button data-action="delete" class="fbw-anno-del" data-tooltip="${l("anno.action.delete")}">${Me}</button>
    </div>
    <div class="fbw-anno-content"></div>
    <span class="fbw-anno-handle fbw-anno-handle-nw" data-handle="nw"></span>
    <span class="fbw-anno-handle fbw-anno-handle-ne" data-handle="ne"></span>
    <span class="fbw-anno-handle fbw-anno-handle-sw" data-handle="sw"></span>
    <span class="fbw-anno-handle fbw-anno-handle-se" data-handle="se"></span>
  `,document.body.appendChild(n);let a=()=>{let d=e.secId?document.querySelector(`[data-fbw-sec-id="${e.secId}"]`):null;if(!d)return;let f=d.getBoundingClientRect(),p=f.left+window.scrollX,m=f.top+window.scrollY;e.rectPct.x=(parseFloat(n.style.left)-p)/f.width,e.rectPct.y=(parseFloat(n.style.top)-m)/f.height,e.rectPct.w=parseFloat(n.style.width)/f.width,e.rectPct.h=parseFloat(n.style.height)/f.height,L()};wa(),n.addEventListener("mousedown",d=>{d.button===0&&(d.target.closest("[data-action], textarea, [data-handle]")||n.classList.contains("fbw-anno-editing")||(d.preventDefault(),ge={type:"move",box:n,persist:a,startX:d.clientX,startY:d.clientY,origLeft:parseFloat(n.style.left),origTop:parseFloat(n.style.top)}))}),n.querySelectorAll("[data-handle]").forEach(d=>{d.addEventListener("mousedown",f=>{f.button===0&&(f.preventDefault(),f.stopPropagation(),ge={type:"resize",box:n,persist:a,corner:d.dataset.handle,startX:f.clientX,startY:f.clientY,origLeft:parseFloat(n.style.left),origTop:parseFloat(n.style.top),origW:parseFloat(n.style.width),origH:parseFloat(n.style.height)})})});let i=()=>{let d=n.querySelector(".fbw-anno-content"),f="";e.image?.dataURL&&(f+=`<img class="fbw-anno-img" src="${e.image.dataURL}" alt="${Ae(e.image.name||"")}">`),e.content&&(f+=`<div class="fbw-anno-text-content">${Ae(e.content).replace(/\n/g,"<br>")}</div>`),e.note&&(f+=`<div class="fbw-anno-text-note">${Ae(e.note).replace(/\n/g,"<br>")}</div>`),d.innerHTML=f;let p=!!e.image&&!e.content?.trim()&&!e.note?.trim();n.classList.toggle("fbw-anno-image-only",p)};i();let s=()=>{r.annotations=r.annotations.filter(d=>d.id!==e.id),n.remove(),L()},c=d=>{let f=d==="content"?"fbw-anno-textarea fbw-anno-textarea-content":"fbw-anno-textarea fbw-anno-textarea-note",p=d==="content"?l("anno.placeholder.content"):l("anno.placeholder.note"),m=n.querySelector(".fbw-anno-content"),y=d==="note"?ha():"";m.innerHTML=`${y}<textarea class="${f}" placeholder="${p}">${Ae(e[d]||"")}</textarea>`;let h=m.querySelector("textarea"),g=m.querySelector("[data-fbw-tags]");setTimeout(()=>{h.focus(),h.setSelectionRange(h.value.length,h.value.length)},0),["keydown","keyup","keypress","mousedown"].forEach(S=>h.addEventListener(S,G=>G.stopPropagation())),h.addEventListener("input",()=>{e[d]=h.value,L(),g&&pe(g,h)}),g&&(pe(g,h),Qe(g,()=>h)),n.classList.add("fbw-anno-editing");let u=!1,w=()=>{u||(u=!0,n.classList.remove("fbw-anno-editing"),i())},C=()=>{document.removeEventListener("mousedown",x,!0),w(),!e.content?.trim()&&!e.note?.trim()&&!e.image&&s()},x=S=>{n.contains(S.target)||C()};h.addEventListener("blur",w),h.addEventListener("keydown",S=>{S.key==="Escape"&&(S.preventDefault(),h.blur(),C())}),document.addEventListener("mousedown",x,!0)};n.addEventListener("dblclick",d=>{d.target.closest("[data-action]")||d.target.closest("textarea")||(d.stopPropagation(),d.preventDefault(),c("content"))}),n.addEventListener("click",d=>{let f=d.target.closest("[data-action]");if(!f)return;d.stopPropagation();let p=f.dataset.action;if(p==="content")c("content");else if(p==="note")c("note");else if(p==="image"){let m=document.createElement("input");m.type="file",m.accept="image/*",m.onchange=y=>{let h=y.target.files[0];if(!h)return;let g=new FileReader;g.onload=()=>{e.image={name:h.name,dataURL:g.result,type:h.type};let u=new Image;u.onload=()=>{let w=u.naturalWidth/u.naturalHeight,C=parseFloat(n.style.width),x=parseFloat(n.style.height),S=C/x,G=C,Se=x;w>S?Se=C/w:G=x*w,n.style.width=G+"px",n.style.height=Se+"px",a(),i()},u.src=g.result,i(),L()},g.readAsDataURL(h)},m.click()}else p==="delete"&&s()}),e._autoEdit&&(delete e._autoEdit,setTimeout(()=>c("content"),0))}function Lt(){document.querySelectorAll(".fbw-anno").forEach(e=>e.remove()),r.annotations.forEach(St)}function Mo(){document.addEventListener("mousedown",e=>{r.marqueeMode&&e.button===0&&ya(e.target)&&(e.preventDefault(),e.stopPropagation(),R={startX:e.clientX,startY:e.clientY},B=document.createElement("div"),B.className="fbw-marquee-drawing",document.body.appendChild(B),Lo(e.clientX,e.clientY))},!0),V(e=>{R&&(e.preventDefault(),Lo(e.clientX,e.clientY))}),Z(e=>{R&&(va(e.clientX,e.clientY),R=null,B&&(B.remove(),B=null))}),document.addEventListener("keydown",e=>{e.key==="Escape"&&r.marqueeMode&&!e.target.matches("textarea, input")&&(e.preventDefault(),he())}),re(()=>{Lt()}),document.addEventListener("dblclick",e=>{r.editMode||r.marqueeMode||e.target.closest(".fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-anno, .fbw-tooltip, .fbw-confirm, .fbw-help-popover, .fbw-note-popover, .fbw-marker-popover, .fbw-font-picker, .fbw-resize-handles, .fbw-marquee-drawing, .fbw-toast")||e.target.dataset?.fbwEditId||!(e.target.closest&&e.target.closest("[data-fbw-sec-id]"))||(e.preventDefault(),e.stopPropagation(),ka(e.clientX,e.clientY),L())})}var O=null,we=null,et=null,La=80;function Ca(){return O||(O=document.createElement("div"),O.className="fbw-tooltip",document.body.appendChild(O),O)}function Ta(e){let o=e.getBoundingClientRect(),t=O.getBoundingClientRect(),n=o.left+o.width/2-t.width/2,a=o.top-t.height-6;n<8&&(n=8),n+t.width>window.innerWidth-8&&(n=window.innerWidth-t.width-8),a<8&&(a=o.bottom+6),O.style.left=n+"px",O.style.top=a+"px"}function Fo(e,o){Ca(),O.textContent=e,O.classList.add("fbw-on"),requestAnimationFrame(()=>Ta(o))}function Ct(){we&&(clearTimeout(we),we=null),et=null,O&&O.classList.remove("fbw-on")}function Po(){document.addEventListener("mouseover",e=>{let o=e.target.closest&&e.target.closest("[data-tooltip]");if(!o||o===et)return;et=o;let t=o.dataset.tooltip;if(!t)return;we&&clearTimeout(we),O&&O.classList.contains("fbw-on")?Fo(t,o):we=setTimeout(()=>Fo(t,o),La)},!0),document.addEventListener("mouseout",e=>{let o=e.target.closest&&e.target.closest("[data-tooltip]");if(o&&o===et){if(e.relatedTarget&&o.contains(e.relatedTarget))return;Ct()}},!0),document.addEventListener("mousedown",Ct,!0),fe(Ct)}function Ma(){return typeof navigator<"u"&&/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl"}function N(e,o){return`<div class="fbw-help-row">${(Array.isArray(e)?e:[e]).map(a=>`<kbd>${a}</kbd>`).join("")} <span>${o}</span></div>`}function Fa(){let e=Ma();return`
    <div class="fbw-help-title">${l("help.title")}</div>
    <div class="fbw-help-cols">
      <div class="fbw-help-col">
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${l("help.group.modes")}</div>
          ${N("E",l("help.shortcut.edit"))}
          ${N("F",l("help.shortcut.feedback"))}
          ${N("M",l("help.shortcut.marquee"))}
        </div>
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${l("help.group.actions")}</div>
          ${N("Esc",l("help.shortcut.cancel"))}
          ${N([e,"S"],l("help.shortcut.save"))}
          ${N([e,"M"],l("help.shortcut.copy"))}
          ${N([e,"Z"],l("help.shortcut.undo"))}
          ${N([e,"Shift","Z"],l("help.shortcut.redo"))}
          ${N([e,"C"],l("help.shortcut.copyDescriptor"))}
          ${N("A",l("help.shortcut.audit"))}
          ${N(["Alt","hover"],l("help.shortcut.measure"))}
          ${N(["Shift","click"],l("help.shortcut.multiSelect"))}
          ${N("drag",l("help.shortcut.rubberBand"))}
        </div>
      </div>
      <div class="fbw-help-col">
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${l("help.group.export")}</div>
          ${N(["Space","P"],l("help.shortcut.pdfVector"))}
          ${N(["Shift","P"],l("help.shortcut.pdfImage"))}
        </div>
        <div class="fbw-help-group">
          <div class="fbw-help-group-label">${l("help.group.misc")}</div>
          ${N("?",l("help.shortcut.help"))}
        </div>
      </div>
    </div>
  `}function No(){if(!r.helpPopover)return;let e=r.helpToggleBtn||r.helpFab;if(!e)return;let o=e.getBoundingClientRect(),t=r.helpPopover,n=window.innerHeight,a=n-24;t.style.maxHeight=a+"px",t.style.overflowY="auto";let i=t.getBoundingClientRect(),s=o.left+o.width/2-i.width/2,c=o.top-i.height-12;s<8&&(s=8),s+i.width>window.innerWidth-8&&(s=window.innerWidth-i.width-8),c<8&&(c=o.bottom+12),c+i.height>n-8&&(c=Math.max(8,n-i.height-8)),t.style.left=s+"px",t.style.top=c+"px"}function Ne(){let e=r.helpPopover;if(e){if(e.classList.contains("fbw-on")){e.classList.remove("fbw-on");return}e.innerHTML=Fa(),e.classList.add("fbw-on"),requestAnimationFrame(()=>No())}}function Ao(){r.helpPopover&&r.helpPopover.classList.remove("fbw-on")}function Oo(){document.addEventListener("mousedown",e=>{let o=r.helpPopover;if(!o||!o.classList.contains("fbw-on")||e.target.closest('.fbw-help-popover, .fbw-help-fab, [data-fbw-btn="help"]'))return;let t=typeof e.composedPath=="function"?e.composedPath():[];t.some(n=>n&&n.dataset&&n.dataset.fbwBtn==="help")||t.some(n=>n&&n.classList&&n.classList.contains("fbw-help-popover"))||Ao()},!0),document.addEventListener("keydown",e=>{e.key==="Escape"&&r.helpPopover?.classList.contains("fbw-on")&&Ao()}),re(()=>{r.helpPopover?.classList.contains("fbw-on")&&No()})}function $o(){let o=Xe()==="zh"?l("panel.localeName.en"):l("panel.localeName.zh");return`
    <div class="fbw-head">
      <span class="fbw-head-title">${X}<span>${l("panel.title")}</span></span>
      <span class="fbw-head-actions">
        <button class="fbw-icon-btn" data-fbw-shot data-tooltip="${l("panel.btn.shot.title")}">${Te}</button>
        <button class="fbw-icon-btn" data-fbw-locale data-tooltip="${l("panel.btn.locale.title",{lang:o})}">${Gt}</button>
        <button class="fbw-icon-btn fbw-danger" data-fbw-clear-all data-tooltip="${l("panel.btn.clearAll")}">${wt}</button>
        <button class="fbw-icon-btn" data-fbw-close data-tooltip="${l("panel.btn.close")}">\u2212</button>
      </span>
    </div>
    <div class="fbw-row">
      <span class="fbw-mode-chip"></span>
      <span class="fbw-pill">${l("panel.pill.edit")} <span data-fbw-counter="edit">0</span></span>
      <span class="fbw-pill">${l("panel.pill.section")} <span data-fbw-counter="sec">0</span></span>
      <span class="fbw-pill">${l("panel.pill.element")} <span data-fbw-counter="ops">0</span></span>
      <span class="fbw-pill">${Te}<span data-fbw-counter="att">0</span></span>
    </div>
    <div class="fbw-current">
      <div class="fbw-current-label">${l("panel.current")} <span class="fbw-saved-tag" data-fbw-saved>${l("panel.saved")}</span></div>
      <div class="fbw-current-page" data-fbw-current-page>\u2014</div>
      <textarea class="fbw-textarea fbw-current-text" data-fbw-current-text placeholder="${l("panel.placeholder.current")}"></textarea>
    </div>
    <textarea class="fbw-textarea fbw-global" data-fbw-global placeholder="${l("panel.placeholder.global")}"></textarea>
    <div class="fbw-attachments" data-fbw-attachments></div>
    <div class="fbw-row">
      <button class="fbw-btn fbw-primary" data-fbw-action="save" data-tooltip="${l("panel.btn.save.title")}">${Wt}<span>${l("panel.btn.save")}</span></button>
      <button class="fbw-btn" data-fbw-action="copy" data-tooltip="${l("panel.btn.copy.title")}">${Yt}<span>${l("panel.btn.copy")}</span></button>
    </div>
  `}function zo(){return`
    <div class="fbw-confirm-box">
      <div class="fbw-confirm-title">${l("clearAll.title")}</div>
      <div class="fbw-confirm-desc">${l("clearAll.desc")}</div>
      <div class="fbw-confirm-actions">
        <button class="fbw-btn fbw-btn-cancel" data-fbw-confirm-cancel>${l("common.cancel")}</button>
        <button class="fbw-btn fbw-primary" data-fbw-confirm-ok>${l("clearAll.confirm")}</button>
      </div>
    </div>
  `}function Ro(){return`
    <span class="fbw-tb-label" data-fbw-path title=""></span>
    <span class="fbw-tb-divider" data-fbw-path-divider></span>
    <button data-op="font" data-tooltip="${l("tip.font")}">${po}</button>
    <button data-op="tag" data-tooltip="${l("tip.tag")}" style="display:none;">${so}</button>
    <button data-op="highlight" data-tooltip="${l("tip.highlight")}">${Zt}</button>
    <button data-op="pick" data-tooltip="${l("tip.pick")}">${lo}</button>
    <button data-op="replace-img" data-tooltip="${l("tip.replaceImg")}" style="display:none;">${Qt}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="move-up" data-tooltip="${l("tip.moveUp")}">${to}</button>
    <button data-op="move-down" data-tooltip="${l("tip.moveDown")}">${oo}</button>
    <button data-op="move-left" data-tooltip="${l("tip.moveLeft")}">${no}</button>
    <button data-op="move-right" data-tooltip="${l("tip.moveRight")}">${ao}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="zoom-in" data-tooltip="${l("tip.zoomIn")}">${ro}</button>
    <button data-op="zoom-out" data-tooltip="${l("tip.zoomOut")}">${io}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="link" data-tooltip="${l("tip.link")}" style="display:none;">${Xt}</button>
    <button data-op="note" data-tooltip="${l("tip.note")}">${X}</button>
    <button data-op="hide" data-tooltip="${l("tip.hide")}" class="fbw-danger">${Jt}</button>
    <button data-op="delete" data-tooltip="${l("tip.delete")}" class="fbw-danger">${wt}</button>
    <button data-op="restore" data-tooltip="${l("tip.restore")}" class="fbw-restore">${eo}</button>
    <span class="fbw-tb-divider"></span>
    <button data-op="close" data-tooltip="${l("tip.close")}">${Me}</button>
  `}function Do(){return`
    <div class="fbw-note-head">
      <span class="fbw-note-label">${l("note.title")}</span>
      <button class="fbw-note-close" data-fbw-note-close>${Me}</button>
    </div>
    ${Pa()}
    <textarea class="fbw-note-textarea" data-fbw-note-text placeholder="${l("note.placeholder")}"></textarea>
  `}function Pa(){return'<div class="fbw-design-tags" data-fbw-tags>'+[["spacing",l("design.tag.spacing")],["color",l("design.tag.color")],["typography",l("design.tag.typography")],["layout",l("design.tag.layout")],["copy",l("design.tag.copy")]].map(([e,o])=>`<button class="fbw-design-tag" type="button" data-fbw-tag="${e}">${o}</button>`).join("")+"</div>"}var U=[],xe=[],_o=50;function tt(e){if(!e)return null;let o=r.elementOps.get(e);return{el:e,style:{transform:e.style.transform||"",fontFamily:e.style.fontFamily||"",backgroundColor:e.style.backgroundColor||"",backgroundImage:e.style.backgroundImage||"",visibility:e.style.visibility||""},dataset:{fbwTx:e.dataset.fbwTx??null,fbwTy:e.dataset.fbwTy??null,fbwScale:e.dataset.fbwScale??null,fbwRotate:e.dataset.fbwRotate??null,fbwOpHidden:e.dataset.fbwOpHidden??null,fbwOpDeleted:e.dataset.fbwOpDeleted??null,fbwHighlight:e.dataset.fbwHighlight??null,fbwOriginalSrc:e.dataset.fbwOriginalSrc??null},attrs:{tagAs:e.getAttribute("data-fbw-tag-as"),href:e.tagName==="A"?e.getAttribute("href"):void 0,src:e.tagName==="IMG"?e.getAttribute("src"):void 0},text:e.textContent,edited:e.dataset.fbwEdited??null,fbwChanged:e.classList.contains("fbw-changed"),opsClone:o?JSON.parse(JSON.stringify(o)):null}}function Io(e){if(!e)return!1;let o=e.el;if(!o||!document.contains(o))return!1;for(let t of Object.keys(e.style))o.style[t]=e.style[t];for(let t of Object.keys(e.dataset))e.dataset[t]===null?delete o.dataset[t]:o.dataset[t]=e.dataset[t];return e.attrs.tagAs===null?o.removeAttribute("data-fbw-tag-as"):o.setAttribute("data-fbw-tag-as",e.attrs.tagAs),o.tagName==="A"&&e.attrs.href!==void 0&&(e.attrs.href===null?o.removeAttribute("href"):o.setAttribute("href",e.attrs.href)),o.tagName==="IMG"&&e.attrs.src!==void 0&&e.attrs.src!==null&&(o.src=e.attrs.src),typeof e.text=="string"&&o.textContent!==e.text&&(o.textContent=e.text),e.edited===null?delete o.dataset.fbwEdited:o.dataset.fbwEdited=e.edited,o.classList.toggle("fbw-changed",!!e.fbwChanged),e.opsClone?r.elementOps.set(o,e.opsClone):r.elementOps.delete(o),!0}function I(e){if(!e)return;let o=tt(e);o&&(U.push(o),U.length>_o&&U.shift(),xe.length=0)}function H(e){if(!e||!e.length)return;let o=[];for(let t of e){let n=tt(t);n&&o.push(n)}o.length&&(U.push({__group:!0,snaps:o}),U.length>_o&&U.shift(),xe.length=0)}function qo(e){if(e&&e.__group){let o=!1;for(let t of e.snaps)Io(t)&&(o=!0);return o}return Io(e)}function Bo(e){if(e&&e.__group){let o=e.snaps.map(t=>tt(t.el)).filter(Boolean);return o.length?{__group:!0,snaps:o}:null}return tt(e.el)}function Oe(){if(U.length===0){b(l("undo.empty")||"\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u64CD\u4F5C");return}let e=U.pop(),o=Bo(e);o&&xe.push(o),qo(e)?(F(k),L(),b(l("undo.done")||"\u5DF2\u64A4\u9500")):b(l("undo.gone")||"\u5143\u7D20\u5DF2\u4E0D\u5728\u9875\u9762")}function Tt(){if(xe.length===0){b(l("redo.empty")||"\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u64CD\u4F5C");return}let e=xe.pop(),o=Bo(e);o&&U.push(o),qo(e)?(F(k),L(),b(l("redo.done")||"\u5DF2\u91CD\u505A")):b(l("redo.gone")||"\u5143\u7D20\u5DF2\u4E0D\u5728\u9875\u9762")}function Ho(){return U.length>0}function jo(){return xe.length>0}function $(e){b(e,{action:{label:l("toast.undo")||"\u64A4\u9500",onClick:Oe},duration:4e3})}var $e=null,be="unknown";async function Aa(){if(be==="denied"||be==="unsupported")return[];if(typeof navigator>"u"||typeof navigator.queryLocalFonts!="function")return be="unsupported",[];try{let e=await navigator.queryLocalFonts();be="granted";let o=new Set,t=[];for(let n of e)o.has(n.family)||(o.add(n.family),t.push({name:n.family,family:`"${n.family.replace(/"/g,'\\"')}"`,source:"local"}));return t.sort((n,a)=>n.name.localeCompare(a.name)),t}catch(e){return be="denied",console.warn("[fbw] queryLocalFonts denied:",e?.name||"?","\xB7",e?.message||e),[]}}async function Na(){if($e)return $e;let e={generic:[],document:[],local:[]};e.generic.push({name:"\u7CFB\u7EDF\u9ED8\u8BA4",family:"__inherit__",source:"inherit"}),e.generic.push({name:"system-ui",family:"system-ui, -apple-system, sans-serif",source:"generic"}),e.generic.push({name:"serif",family:"serif",source:"generic"}),e.generic.push({name:"sans-serif",family:"sans-serif",source:"generic"}),e.generic.push({name:"monospace",family:"ui-monospace, monospace",source:"generic"}),e.generic.push({name:"cursive",family:"cursive",source:"generic"});try{let t=new Set;document.fonts.forEach(n=>{let a=(n.family||"").replace(/^['"]|['"]$/g,"");a&&!t.has(a)&&(t.add(a),e.document.push({name:a,family:`"${a}"`,source:"document"}))})}catch{}e.local=await Aa();let o=new Map;return[...e.generic,...e.document,...e.local].forEach(t=>{o.has(t.name)||o.set(t.name,t)}),$e=[...o.values()],$e}function Uo(e){return(e||"").replace(/^['"]|['"]$/g,"").trim().toLowerCase()}function Oa(e){return e?window.getComputedStyle(e).fontFamily.split(",").map(Uo).filter(Boolean):[]}function $a(e){return e==="document"?l("font.group.document"):e==="local"?l("font.group.local"):l("font.group.generic")}async function za(){let e=await Na(),o={inherit:0,generic:1,document:2,local:3},t=[...e].sort((s,c)=>(o[s.source]||0)-(o[c.source]||0)),n=null,a=t.map(s=>{let c="";return s.source!==n&&s.source!=="inherit"?(n=s.source,c=`<div class="fbw-fp-group">${$a(s.source)}</div>`):s.source==="inherit"&&(n="inherit"),c+`
      <div class="fbw-fp-item" data-fp-family="${s.family.replace(/"/g,"&quot;")}" data-fp-name="${s.name}" style="${s.family==="__inherit__"?"":`font-family:${s.family};`}">
        <span>${s.name==="\u7CFB\u7EDF\u9ED8\u8BA4"?l("font.systemDefault"):s.name+" Aa \u6C38\u548C\u4E5D\u5E74"}</span>
        <span class="fbw-fp-name">${s.name}</span>
      </div>
    `}).join(""),i="";be==="denied"?i=`<div class="fbw-fp-hint">${l("font.localDenied")}</div>`:be==="unsupported"&&(i=`<div class="fbw-fp-hint">${l("font.localUnsupported")}</div>`),r.fontPicker.innerHTML=a+i}function ot(){let e=r.elemToolbar.getBoundingClientRect(),o=e.bottom+6,t=e.left;t+240>window.innerWidth-8&&(t=window.innerWidth-248),t<8&&(t=8),o+360>window.innerHeight-8&&(o=Math.max(8,e.top-366)),r.fontPicker.style.top=o+"px",r.fontPicker.style.left=t+"px"}async function Yo(){r.fontPicker.classList.add("fbw-fp-open"),ot(),!$e&&typeof navigator<"u"&&"queryLocalFonts"in navigator&&(r.fontPicker.innerHTML=`<div class="fbw-fp-loading">${l("font.loading")}</div>`),await za(),ot();let e=Oa(window.__fbwSelEl);r.fontPicker.querySelectorAll(".fbw-fp-item").forEach(o=>{if(o.dataset.fpFamily==="__inherit__")return;let t=Uo(o.dataset.fpName);e.includes(t)&&o.classList.add("fbw-fp-active")})}function ee(){r.fontPicker.classList.remove("fbw-fp-open")}function Wo(){r.fontPicker.addEventListener("click",e=>{let o=e.target.closest(".fbw-fp-item");if(!o||!r.selectedEl)return;e.stopPropagation();let t=o.dataset.fpFamily.replace(/&quot;/g,'"'),n=o.dataset.fpName,a=_();H(a),a.forEach(i=>{t==="__inherit__"?(i.style.fontFamily="",delete i.dataset.fbwFontName,T(i,"font",{family:"\u7CFB\u7EDF\u9ED8\u8BA4"})):(i.style.fontFamily=t,i.dataset.fbwFontName=n,T(i,"font",{family:n}))}),$(a.length>1?`${l("op.font",{name:n})} \xB7 ${a.length}`:l("op.font",{name:n})),ee()}),document.addEventListener("mousedown",e=>{r.fontPicker.classList.contains("fbw-fp-open")&&(e.target.closest(".fbw-font-picker, .fbw-elem-toolbar")||ee())},!0)}var Ko=["tl","tr","br","bl"];function Xo(){let e=document.createElement("div");return e.className="fbw-resize-handles",Ko.forEach(o=>{let t=document.createElement("div");t.className="fbw-rotate-zone",t.dataset.handle=o,t.title="\u62D6\u52A8\u65CB\u8F6C \xB7 \u6309\u4F4F Shift \u5438\u9644 15\xB0",e.appendChild(t)}),Ko.forEach(o=>{let t=document.createElement("div");t.className="fbw-resize-handle",t.dataset.handle=o,t.title="\u62D6\u52A8\u7F29\u653E",e.appendChild(t)}),e}function Mt(e){!r.resizeHandles||!e||(r.resizeHandles.classList.add("fbw-on"),ze(e))}function Vo(){r.resizeHandles&&r.resizeHandles.classList.remove("fbw-on")}function ze(e){if(!r.resizeHandles||!e)return;let o=e.getBoundingClientRect();r.resizeHandles.style.top=o.top+"px",r.resizeHandles.style.left=o.left+"px",r.resizeHandles.style.width=o.width+"px",r.resizeHandles.style.height=o.height+"px"}var v=null,se=null,Zo=[.5,.75,1,1.25,1.5,2],Jo=[0,45,90,135,180,-45,-90,-135];function Ra(){return se||(se=document.createElement("div"),se.className="fbw-drag-readout",document.body.appendChild(se),se)}function Go(e,o,t){let n=Ra();n.textContent=e,n.style.left=o+14+"px",n.style.top=t+14+"px",n.classList.add("fbw-on")}function Da(){se&&se.classList.remove("fbw-on")}function Ia(e){let o=Zo.find(t=>Math.abs(e-t)<.03);return o!==void 0?`${o.toFixed(2)}\xD7 \u2713`:`${e.toFixed(2)}\xD7`}function _a(e){let o=Math.round(e),t=Jo.find(n=>Math.abs(o-n)<=2);return t!==void 0?`${t}\xB0 \u2713`:`${o}\xB0`}function qa(e){if(!r.elemToolbar)return;let o=e.getBoundingClientRect(),t=r.elemToolbar.getBoundingClientRect(),n=o.top-t.height-24,a=o.left;n<8&&(n=o.bottom+24),a+t.width>window.innerWidth-8&&(a=window.innerWidth-t.width-8),a<8&&(a=8),r.elemToolbar.style.top=n+"px",r.elemToolbar.style.left=a+"px"}function Qo(){r.resizeHandles.addEventListener("mousedown",e=>{if(!r.editMode||!r.selectedEl||e.button!==0)return;let o=e.target.closest(".fbw-rotate-zone"),t=e.target.closest(".fbw-resize-handle");if(!o&&!t)return;e.preventDefault(),e.stopPropagation();let n=r.selectedEl,a=n.getBoundingClientRect(),i=a.left+a.width/2,s=a.top+a.height/2,c=J(n);if(I(n),t){let d=Math.hypot(e.clientX-i,e.clientY-s);v={mode:"scale",el:n,cx:i,cy:s,startDist:Math.max(d,1),baseScale:c.scale,baseX:c.x,baseY:c.y,baseRotate:c.rotate||0},document.body.style.cursor=window.getComputedStyle(t).cursor}else v={mode:"rotate",el:n,cx:i,cy:s,baseRotate:c.rotate||0,startAngle:Math.atan2(e.clientY-s,e.clientX-i)*180/Math.PI},document.body.style.cursor="grabbing"}),V(e=>{if(v){if(e.preventDefault(),v.mode==="scale"){let t=Math.hypot(e.clientX-v.cx,e.clientY-v.cy)/v.startDist,n=Math.max(.2,Math.min(3,v.baseScale*t));Q(v.el,{x:v.baseX,y:v.baseY,scale:n,rotate:v.baseRotate}),Go(Ia(n),e.clientX,e.clientY)}else if(v.mode==="rotate"){let o=Math.atan2(e.clientY-v.cy,e.clientX-v.cx)*180/Math.PI,t=v.baseRotate+(o-v.startAngle);for(;t>180;)t-=360;for(;t<=-180;)t+=360;e.shiftKey&&(t=Math.round(t/15)*15);let n=J(v.el);Q(v.el,{...n,rotate:t}),Go(_a(t),e.clientX,e.clientY)}ze(v.el),qa(v.el)}}),Z(()=>{if(!v)return;let e=J(v.el);if(v.mode==="scale"){let o=Zo.find(n=>Math.abs(e.scale-n)<.03),t=o!==void 0?o:e.scale;o!==void 0&&Q(v.el,{...e,scale:t}),T(v.el,"scale",{scale:parseFloat(t.toFixed(3))})}else if(v.mode==="rotate"){let o=Jo.find(n=>Math.abs(e.rotate-n)<=2),t=o!==void 0?o:e.rotate;o!==void 0&&Q(v.el,{...e,rotate:t}),T(v.el,"rotate",{rotate:parseFloat(t.toFixed(2))})}Da(),ze(v.el),v=null,document.body.style.cursor=""})}var Ba=[{name:"yellow",value:"rgba(255, 235, 80, 0.55)",swatch:"#ffeb50",label:"\u9EC4"},{name:"green",value:"rgba(140, 220, 130, 0.55)",swatch:"#8cdc82",label:"\u7EFF"},{name:"blue",value:"rgba(150, 200, 255, 0.55)",swatch:"#96c8ff",label:"\u84DD"},{name:"pink",value:"rgba(255, 170, 200, 0.55)",swatch:"#ffaac8",label:"\u7C89"},{name:"orange",value:"rgba(255, 200, 130, 0.55)",swatch:"#ffc882",label:"\u6A59"}];function Ha(){return`
    <div class="fbw-marker-row">${Ba.map(o=>`
    <button class="fbw-marker-swatch" data-color="${o.value}" data-name="${o.name}" data-tooltip="${o.label}" style="background:${o.swatch};"></button>
  `).join("")}</div>
    <button class="fbw-marker-clear" data-clear>${l("highlight.clear")}</button>
  `}var Re=null,Ft=null;function ja(e){let o=window.getSelection();if(!o||o.rangeCount===0)return null;let t=o.getRangeAt(0);return t.collapsed||!e.contains(t.commonAncestorContainer)?null:t.cloneRange()}function Ua(e,o,t){let n=document.createElement("span");n.className="fbw-hl",n.dataset.fbwHighlight=t||"1",n.style.background=o,n.style.borderRadius="2px",n.style.padding="0 1px";try{return e.surroundContents(n),n}catch{let a=e.extractContents();return n.appendChild(a),e.insertNode(n),n}}function Ya(){let e=r.elemToolbar?.querySelector('[data-op="highlight"]');if(!e||!r.markerPopover)return;let o=r.markerPopover;o.style.visibility="hidden",o.style.top="0px",o.style.left="0px";let t=o.offsetHeight||80,n=o.offsetWidth||200,a=e.getBoundingClientRect(),i=r.elemToolbar.getBoundingClientRect(),s=i.right+8,c=i.top;s+n>window.innerWidth-8&&(s=i.left-n-8),s<8&&(s=Math.max(8,Math.min(a.left,window.innerWidth-n-8)),c=i.top-t-8,c<8&&(c=i.bottom+8)),o.style.top=c+"px",o.style.left=s+"px",o.style.visibility=""}function tn(){r.markerPopover&&(Re=r.selectedEl||null,Ft=Re?ja(Re):null,r.markerPopover.innerHTML=Ha(),r.markerPopover.classList.add("fbw-on"),Ya())}function Y(){r.markerPopover&&r.markerPopover.classList.remove("fbw-on"),Re=null,Ft=null}function Wa(e){e.querySelectorAll(".fbw-hl").forEach(o=>{let t=o.parentNode;for(;o.firstChild;)t.insertBefore(o.firstChild,o);t.removeChild(o),t.normalize?.()})}function en(e,o,t,n){if(!e)return;if(n){I(e),o&&(Ua(n,o,t),window.getSelection()?.removeAllRanges(),T(e,"highlight",{color:o,name:t,scope:"range"}),$(l("op.highlight")+(t?": "+t:"")));return}let a=_();H(a),a.forEach(s=>{o?(s.style.background=o,s.dataset.fbwHighlight=t||"1",T(s,"highlight",{color:o,name:t,scope:"element"})):(Wa(s),s.style.background="",delete s.dataset.fbwHighlight,T(s,"highlight",{color:null}))});let i=o?l("op.highlight")+(t?": "+t:""):l("highlight.clear");$(a.length>1?`${i} \xB7 ${a.length}`:i)}function on(){let e=r.markerPopover;e&&(e.addEventListener("click",o=>{o.stopPropagation();let t=Re||r.selectedEl;if(!t)return;let n=Ft,a=o.target.closest("[data-color]");if(a){en(t,a.dataset.color,a.dataset.name,n),Y();return}o.target.closest("[data-clear]")&&(en(t,"",null,null),Y())}),document.addEventListener("mousedown",o=>{e.classList.contains("fbw-on")&&(o.target.closest('.fbw-marker-popover, [data-op="highlight"], .fbw-elem-toolbar')||Y())},!0))}var nn=["p","h1","h2","h3","h4","h5","h6"],A=null,W=null;function an(){return A=document.createElement("div"),A.className="fbw-tag-popover",A.innerHTML=nn.map(e=>`<button data-fbw-tag="${e}">${e.toUpperCase()}</button>`).join(""),A}function Ka(e){return(e.getAttribute("data-fbw-tag-as")||e.tagName).toLowerCase()}function Pt(e){if(!A)return;let o=Ka(e);A.querySelectorAll("[data-fbw-tag]").forEach(t=>{t.classList.toggle("fbw-active",t.dataset.fbwTag===o)})}function rn(){if(!A||!r.selectedEl)return;let e=r.elemToolbar.getBoundingClientRect();A.style.top=e.bottom+6+"px",A.style.left=e.left+24+"px",A.classList.add("fbw-on"),W=r.selectedEl.getAttribute("data-fbw-tag-as"),Pt(r.selectedEl)}function j(){A&&(A.classList.remove("fbw-on"),r.selectedEl&&W!==void 0&&(W===null?r.selectedEl.removeAttribute("data-fbw-tag-as"):r.selectedEl.setAttribute("data-fbw-tag-as",W),W=null))}function Ga(e){r.selectedEl&&(e===r.selectedEl.tagName.toLowerCase()?r.selectedEl.removeAttribute("data-fbw-tag-as"):r.selectedEl.setAttribute("data-fbw-tag-as",e))}function Xa(e,o){if(!e||!nn.includes(o))return;let t=e.tagName.toLowerCase(),n=W;if(W=null,o===t&&n==null){j();return}if(o===t){I(e),e.removeAttribute("data-fbw-tag-as");let a=r.elementOps.get(e);a&&(a.ops=a.ops.filter(i=>i.op!=="tag"),a.ops.length||Ze(e)),$(l("op.tag.cleared")||"\u5DF2\u64A4\u9500\u6807\u7B7E\u53D8\u66F4"),j();return}I(e),e.setAttribute("data-fbw-tag-as",o),T(e,"tag",{from:t,to:o}),$(l("op.tag.done",{tag:o.toUpperCase()})||`\u6807\u7B7E\u53D8\u66F4\u4E3A ${o.toUpperCase()}`),j()}function sn(){A&&(A.addEventListener("click",e=>{let o=e.target.closest("[data-fbw-tag]");!o||!r.selectedEl||(e.stopPropagation(),Xa(r.selectedEl,o.dataset.fbwTag))}),A.addEventListener("mouseover",e=>{let o=e.target.closest("[data-fbw-tag]");o&&(Ga(o.dataset.fbwTag),Pt(r.selectedEl))}),A.addEventListener("mouseleave",()=>{r.selectedEl&&(W===null?r.selectedEl.removeAttribute("data-fbw-tag-as"):W!==void 0&&r.selectedEl.setAttribute("data-fbw-tag-as",W),Pt(r.selectedEl))}),document.addEventListener("mousedown",e=>{A.classList.contains("fbw-on")&&(e.target.closest('.fbw-tag-popover, [data-op="tag"]')||j())},!0))}function Va(e,o){if(!e)return!1;let t=e.selectionStart??e.value.length,n=e.selectionEnd??e.value.length,a=e.value.slice(0,t),i=e.value.slice(n);e.value=a+o+i;let s=t+o.length;return e.selectionStart=e.selectionEnd=s,e.dispatchEvent(new Event("input",{bubbles:!0})),!0}async function ln(){if(typeof window.EyeDropper!="function"){b(l("eyedropper.unsupported")||"\u53D6\u8272\u5668\u4E0D\u652F\u6301\u5F53\u524D\u6D4F\u89C8\u5668 \xB7 \u9700\u8981 Chrome / Edge 95+");return}let e=r.panel?.classList.contains("fbw-open");e&&r.panel.classList.remove("fbw-open");let o;try{o=await new window.EyeDropper().open()}catch{e&&r.panel?.classList.add("fbw-open");return}e&&r.panel?.classList.add("fbw-open");let t=o.sRGBHex,n=document.activeElement,a=!1;n&&n.tagName==="TEXTAREA"&&n.closest(".fbw-panel, .fbw-anno, .fbw-note-popover")&&(a=Va(n,t));try{await navigator.clipboard.writeText(t)}catch{}b(a?l("eyedropper.inserted",{hex:t})||`${t} \xB7 \u5DF2\u63D2\u5165\u53CD\u9988\u6846 + \u526A\u8D34\u677F`:l("eyedropper.copied",{hex:t})||`${t} \xB7 \u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F`)}var Za="fbw",De="kv",Ie="blobs";var nt=null;function At(){return nt||(nt=new Promise((e,o)=>{let t=indexedDB.open(Za,2);t.onupgradeneeded=n=>{let a=t.result;a.objectStoreNames.contains(De)||a.createObjectStore(De),a.objectStoreNames.contains(Ie)||a.createObjectStore(Ie)},t.onsuccess=()=>e(t.result),t.onerror=()=>o(t.error)}),nt)}function cn(e,o){return At().then(t=>new Promise((n,a)=>{let s=t.transaction(e,"readonly").objectStore(e).get(o);s.onsuccess=()=>n(s.result),s.onerror=()=>a(s.error)}))}function dn(e,o,t){return At().then(n=>new Promise((a,i)=>{let s=n.transaction(e,"readwrite");s.objectStore(e).put(t,o),s.oncomplete=()=>a(),s.onerror=()=>i(s.error)}))}function fn(e,o){return At().then(t=>new Promise((n,a)=>{let i=t.transaction(e,"readwrite");i.objectStore(e).delete(o),i.oncomplete=()=>n(),i.onerror=()=>a(i.error)}))}var at=e=>cn(De,e),rt=(e,o)=>dn(De,e,o),it=e=>fn(De,e),pn=e=>cn(Ie,e),bn=(e,o)=>dn(Ie,e,o),un=e=>fn(Ie,e);function mn(e){return new Promise((o,t)=>{let n=new FileReader;n.onload=()=>o(n.result),n.onerror=t,n.readAsDataURL(e)})}function st(e){if(!e||!e.type?.startsWith("image/"))return;let o="fbw-att-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),t=e.name||"\u622A\u56FE-"+new Date().toISOString().slice(11,19).replace(/:/g,"")+".png";mn(e).then(n=>{r.attachments.push({id:o,name:t,dataURL:n,type:e.type}),te(),L(),b(l("panel.attachment.added",{count:r.attachments.length})),bn(o,e).catch(a=>console.warn("[fbw] idb put blob failed:",a))}).catch(n=>console.warn("[fbw] read blob failed:",n))}async function gn(){let e=0;for(let o of r.attachments)if(!o.dataURL)try{let t=await pn(o.id);t&&(o.dataURL=await mn(t),e++)}catch{}e>0&&te()}function te(){let e=r.panel.querySelector("[data-fbw-attachments]");e.innerHTML="",r.attachments.forEach((o,t)=>{let n=document.createElement("div");n.className="fbw-thumb";let a=document.createElement("img");a.src=o.dataURL;let i=document.createElement("button");i.className="fbw-thumb-x",i.innerHTML="\xD7",i.type="button",i.addEventListener("click",s=>{s.stopPropagation();let c=r.attachments.splice(t,1)[0];te(),F(k),L(),c?.id&&un(c.id).catch(()=>{})}),n.appendChild(a),n.appendChild(i),e.appendChild(n)}),F(k)}function hn(){let e=t=>{let n=t.clipboardData?.items;if(!n)return;let a=!1;for(let i of n)if(i.type.startsWith("image/")){let s=i.getAsFile();s&&(st(s),a=!0)}a&&t.preventDefault()},o=r.panel.querySelector("[data-fbw-global]");["keydown","keyup","keypress"].forEach(t=>o.addEventListener(t,n=>n.stopPropagation())),o.addEventListener("paste",e),r.panel.addEventListener("paste",e),r.panel.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer?.types?.includes("Files")&&r.panel.classList.add("fbw-drag-over")}),r.panel.addEventListener("dragleave",t=>{(t.target===r.panel||!r.panel.contains(t.relatedTarget))&&r.panel.classList.remove("fbw-drag-over")}),r.panel.addEventListener("drop",t=>{t.preventDefault(),r.panel.classList.remove("fbw-drag-over"),Array.from(t.dataTransfer?.files||[]).filter(a=>a.type.startsWith("image/")).forEach(st)})}function Ja(e){let o=r.elemToolbar?.querySelector('[data-op="note"]');o&&o.classList.toggle("fbw-has-note",!!Pe(e))}function Qa(){if(!r.notePopover)return;let e=r.elemToolbar.querySelector('[data-op="note"]');if(!e)return;let o=e.getBoundingClientRect(),t=r.notePopover,n=o.bottom+6,a=o.left;a+300>window.innerWidth-8&&(a=window.innerWidth-308),a<8&&(a=8),n+180>window.innerHeight-8&&(n=Math.max(8,o.top-186)),t.style.top=n+"px",t.style.left=a+"px"}function er(e){let o=r.notePopover;if(!o)return;let t=o.querySelector("[data-fbw-note-text]");t.value=Pe(e),o.classList.add("fbw-on"),Qa(),pe(o.querySelector("[data-fbw-tags]"),t),setTimeout(()=>t.focus(),0)}function ce(){r.notePopover&&r.notePopover.classList.remove("fbw-on")}function wn(){let e=r.notePopover;if(!e)return;let o=e.querySelector("[data-fbw-note-text]");["keydown","keyup","keypress"].forEach(t=>o.addEventListener(t,n=>n.stopPropagation())),o.addEventListener("input",()=>{r.selectedEl&&(vo(r.selectedEl,o.value),Ja(r.selectedEl),pe(e.querySelector("[data-fbw-tags]"),o))}),Qe(e.querySelector("[data-fbw-tags]"),()=>o),e.querySelector("[data-fbw-note-close]").addEventListener("click",t=>{t.stopPropagation(),ce()}),document.addEventListener("mousedown",t=>{e.classList.contains("fbw-on")&&(t.target.closest(".fbw-note-popover, .fbw-elem-toolbar")||ce())},!0)}function xn(){r.elemToolbar.addEventListener("click",e=>{let o=e.target.closest("[data-op]");if(!o||!r.selectedEl)return;e.stopPropagation();let t=o.dataset.op,n=r.selectedEl;if(t==="close"){M();return}if(t==="delete"){let a=_();H(a),a.forEach(i=>{T(i,"delete"),i.dataset.fbwOpDeleted="1"}),$(a.length>1?`${l("op.delete")} \xB7 ${a.length}`:l("op.delete"));return}if(t==="hide"){let a=_();H(a),a.forEach(i=>{T(i,"hide"),i.dataset.fbwOpHidden="1"}),$(a.length>1?`${l("op.hide")} \xB7 ${a.length}`:l("op.hide"));return}if(t==="link"){if(n.tagName!=="A")return;let a=n.getAttribute("href")||"",i=prompt(l("op.link.prompt")||"\u6539\u94FE\u63A5 (href)\uFF1A",a);if(i==null)return;let s=i.trim();if(s===a)return;I(n),n.setAttribute("href",s),T(n,"href",{before:a,after:s}),$(l("op.link.done")||`\u94FE\u63A5\u5DF2\u6539\uFF1A${s.slice(0,40)}${s.length>40?"\u2026":""}`);return}if(t==="restore"){let a=_();H(a),a.forEach(i=>{delete i.dataset.fbwOpDeleted,delete i.dataset.fbwOpHidden,delete i.dataset.fbwTx,delete i.dataset.fbwTy,delete i.dataset.fbwScale,delete i.dataset.fbwRotate,delete i.dataset.fbwHighlight,i.removeAttribute("data-fbw-tag-as"),i.style.transform="",i.style.backgroundImage="",i.style.backgroundColor="",i.tagName==="IMG"&&i.dataset.fbwOriginalSrc&&(i.src=i.dataset.fbwOriginalSrc,delete i.dataset.fbwOriginalSrc),Ze(i)}),$(a.length>1?`${l("op.restore")} \xB7 ${a.length}`:l("op.restore")),ue(n);return}if(t.startsWith("move-")){let a=_();H(a);let i=t.slice(5),s=e.shiftKey?16:4;a.forEach(c=>{let d=J(c);i==="up"&&(d.y-=s),i==="down"&&(d.y+=s),i==="left"&&(d.x-=s),i==="right"&&(d.x+=s),Q(c,d),T(c,"move",{x:d.x,y:d.y})}),ue(n);return}if(t==="zoom-in"||t==="zoom-out"){let a=_();H(a);let i=t==="zoom-in"?1.1:1/1.1;a.forEach(s=>{let c=J(s);c.scale=Math.max(.2,Math.min(3,c.scale*i)),Q(s,c),T(s,"scale",{scale:parseFloat(c.scale.toFixed(3))})}),ue(n);return}if(t==="font"){window.__fbwSelEl=n,r.fontPicker.classList.contains("fbw-fp-open")?ee():(Y(),ce(),j(),Yo());return}if(t==="highlight"){r.markerPopover?.classList.contains("fbw-on")?Y():(ee(),ce(),j(),tn());return}if(t==="tag"){r.tagPopover?.classList.contains("fbw-on")?j():(ee(),ce(),Y(),rn());return}if(t==="pick"){ln();return}if(t==="note"){r.notePopover?.classList.contains("fbw-on")?ce():(ee(),Y(),j(),er(n));return}if(t==="replace-img"){let a=document.createElement("input");a.type="file",a.accept="image/*",a.onchange=i=>{let s=i.target.files[0];if(!s)return;let c=new FileReader;c.onload=()=>{I(n),n.tagName==="IMG"?(n.dataset.fbwOriginalSrc||(n.dataset.fbwOriginalSrc=n.src),n.src=c.result):n.style.backgroundImage=`url(${c.result})`,T(n,"replace-img",{name:s.name}),r.attachments.push({id:"fbw-att-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),name:s.name||"\u66FF\u6362\u56FE-"+Date.now()+".png",dataURL:c.result,type:s.type}),te(),$(l("op.replaceImg"))},c.readAsDataURL(s)},a.click()}})}var tr=10,le=null;function yn(){document.addEventListener("mousedown",e=>{if(!r.editMode||!r.selectedEl||e.button!==0||e.target.closest(".fbw-elem-toolbar, .fbw-panel, .fbw-fab, .fbw-resize-handle"))return;let o=e.target,t=lt(o);if(!_().filter(s=>s===o||s===t||s.contains(o)).length||r.selectedEl.dataset.fbwEditing==="1")return;let a=_(),i=new Map;a.forEach(s=>{let c=J(s);i.set(s,{x:c.x,y:c.y,scale:c.scale})}),le={els:a,bases:i,anchor:r.selectedEl,startX:e.clientX,startY:e.clientY}},!0),V(e=>{if(le&&!r.dragState){let n=e.clientX-le.startX,a=e.clientY-le.startY;if(Math.hypot(n,a)<tr)return;H(le.els),r.dragState={...le,moved:!0},le=null,document.body.style.cursor="move",e.preventDefault()}if(!r.dragState)return;let o=e.clientX-r.dragState.startX,t=e.clientY-r.dragState.startY;r.dragState.els.forEach(n=>{let a=r.dragState.bases.get(n);a&&Q(n,{x:a.x+o,y:a.y+t,scale:a.scale})}),ct()}),Z(()=>{le=null,r.dragState&&(r.dragState.moved&&r.dragState.els.forEach(e=>{let o=J(e);T(e,"move",{x:Math.round(o.x),y:Math.round(o.y)})}),r.dragState=null,document.body.style.cursor="")})}function or(e){if(!e)return"";let o=e.getAttribute("data-screen-label")||e.getAttribute("aria-label");if(o)return o.trim();let t=e.querySelector("h1, h2, h3, h4, h5, h6");if(t&&t.textContent){let a=t.textContent.trim().replace(/\s+/g," ");if(a)return a.length>18?a.slice(0,18)+"\u2026":a}if(e.id)return"#"+e.id;let n=(e.className||"").toString().split(/\s+/).find(a=>a&&!a.startsWith("fbw-"));return n?"."+n:e.tagName.toLowerCase()}function nr(e){if(!e)return"";let o=e.tagName.toLowerCase(),t=e.parentElement?e.parentElement.closest("section, article, [data-fbw-sec-id]"):null;!t&&e.matches("section, article, [data-fbw-sec-id]")&&(t=e);let n=t&&t!==e?or(t):"",a=e.parentElement,i="";if(a){let s=[...a.children].filter(c=>c.tagName===e.tagName);s.length>1&&(i=` (${s.indexOf(e)+1}/${s.length})`)}return[n,o+i].filter(Boolean).join(" \xB7 ")}function Sn(e){if(!r.elemToolbar)return;let o=r.elemToolbar.querySelector("[data-fbw-path]"),t=r.elemToolbar.querySelector("[data-fbw-path-divider]");if(!o||!t)return;let n=nr(e);n?(o.textContent=n,o.title=n,o.style.display="",t.style.display=""):(o.style.display="none",t.style.display="none")}function lt(e){if(!e)return e;let o=e.closest("svg");if(o&&!o.matches(".fbw-icon-btn svg, .fbw-elem-toolbar svg, .fbw-fab svg, .fbw-panel svg"))return o;if(!e.dataset?.fbwEditId&&e.closest){let t=e.closest("[data-fbw-edit-id]");if(t)return t}return e}var vn=24;function ue(e){let o=e.getBoundingClientRect(),t=r.elemToolbar.getBoundingClientRect(),n=o.top-t.height-vn,a=o.left;n<8&&(n=o.bottom+vn),a+t.width>window.innerWidth-8&&(a=window.innerWidth-t.width-8),a<8&&(a=8),r.elemToolbar.style.top=n+"px",r.elemToolbar.style.left=a+"px"}function ar(e){for(let o of e.childNodes)if(o.nodeType===3&&o.textContent.trim())return!0;return!1}function Ot(){if(!r.elemToolbar)return;let e=r.elemToolbar.querySelector(".fbw-tb-count"),o=r.selectedEls.size;if(o<=1){e&&e.remove();return}e||(e=document.createElement("span"),e.className="fbw-tb-count",r.elemToolbar.appendChild(e)),e.textContent=o,e.title=`${o} selected`}function Ln(e){if(!r.elemToolbar||!e)return;let o=r.selectedEls.size>1,t=e.matches("img")||(getComputedStyle(e).backgroundImage||"none")!=="none";r.elemToolbar.querySelector('[data-op="replace-img"]').style.display=!o&&t?"inline-flex":"none";let n=ar(e)&&!e.matches("img, svg, video, iframe"),a=r.elemToolbar.querySelector('[data-op="font"]');a&&(a.style.display=n?"inline-flex":"none");let i=r.elemToolbar.querySelector('[data-op="highlight"]');i&&(i.style.display=n?"inline-flex":"none");let s=/^(p|h[1-6])$/i.test(e.tagName),c=r.elemToolbar.querySelector('[data-op="tag"]');c&&(c.style.display=!o&&s?"inline-flex":"none");let d=e.matches("a[href]"),f=r.elemToolbar.querySelector('[data-op="link"]');f&&(f.style.display=!o&&d?"inline-flex":"none");let p=r.elemToolbar.querySelector('[data-op="note"]');p&&(p.style.display=o?"none":"inline-flex",p.classList.toggle("fbw-has-note",!!Pe(e)))}function dt(e){r.selectedEls.size===1&&r.selectedEl===e||(M(),r.selectedEl=e,r.selectedEls.add(e),e.classList.add("fbw-selected"),Ln(e),Ot(),Sn(e),r.elemToolbar.classList.add("fbw-toolbar-open"),ue(e),Mt(e))}function ft(e){if(r.selectedEls.has(e)){if(r.selectedEls.delete(e),e.classList.remove("fbw-selected"),r.selectedEl===e){let o=r.selectedEls.values().next().value;if(o)r.selectedEl=o;else{M();return}}}else r.selectedEls.add(e),e.classList.add("fbw-selected"),r.selectedEl=e;Ln(r.selectedEl),Ot(),Sn(r.selectedEl),r.elemToolbar.classList.add("fbw-toolbar-open"),ue(r.selectedEl),Mt(r.selectedEl)}function M(){r.selectedEls.forEach(e=>e.classList.remove("fbw-selected")),r.selectedEls.clear(),r.selectedEl=null,typeof window<"u"&&(window.__fbwSelEl=null),ee(),ce(),Y(),j(),r.elemToolbar.classList.remove("fbw-toolbar-open"),Ot(),Vo()}function _(){return[...r.selectedEls].filter(e=>document.contains(e))}function rr(e){I(e),M(),e.contentEditable="true",e.spellcheck=!1,e.dataset.fbwEditing="1",e.dataset.fbwEdited="1",e.focus();try{let o=document.createRange();o.selectNodeContents(e);let t=window.getSelection();t.removeAllRanges(),t.addRange(o)}catch{}}var Nt=null;function ct(){r.selectedEl&&(Nt&&cancelAnimationFrame(Nt),Nt=requestAnimationFrame(()=>{ue(r.selectedEl),ze(r.selectedEl),r.fontPicker.classList.contains("fbw-fp-open")&&ot()}))}function kn(e){let o=e.target.dataset?.fbwEditId;o&&(e.target.classList.toggle("fbw-changed",r.originals.get(o)!==z(e.target)),F(k),L())}function En(){document.body.classList.toggle("fbw-edit-mode",r.editMode),document.querySelectorAll("[data-fbw-edit-id]").forEach(e=>{e.contentEditable="false",e.spellcheck=!1}),r.editMode||M(),r.editToggleBtn&&r.editToggleBtn.classList.toggle("fbw-active",r.editMode),r.editFab&&r.editFab.classList.toggle("fbw-active",r.editMode),r.editMode&&r.marqueeMode&&(r.marqueeMode=!1,document.body.classList.remove("fbw-marquee-mode"),r.marqueeFab&&r.marqueeFab.classList.remove("fbw-active"),r.marqueeToggleBtn&&r.marqueeToggleBtn.classList.remove("fbw-active"))}function ye(){if(!r.editMode){r.marqueeMode&&Co(),r.editMode=!0,En(),b(l("edit.on"));return}let e=go(k);r.editMode=!1,En(),b(e>0?l("edit.off.pending",{count:e}):l("edit.off"))}function Cn(){let e="[data-fbw-sec-id]",o=".fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-marker-popover, .fbw-tag-popover, .fbw-font-picker, .fbw-note-popover, .fbw-help-popover, .fbw-tooltip, .fbw-anno, script, style";document.addEventListener("click",t=>{if(!r.editMode)return;let n=t.target;if(!n||n.closest(o))return;n.closest&&n.closest("a[href]")&&t.preventDefault();let a=n.closest(e);if(!a){r.selectedEl&&M();return}if(n===a){r.selectedEl&&M();return}n=lt(n),!(n.isContentEditable&&n===r.selectedEl)&&(t.preventDefault(),t.stopPropagation(),t.shiftKey||t.metaKey||t.ctrlKey?ft(n):dt(n))},!0),document.addEventListener("dblclick",t=>{if(!r.editMode)return;let n=t.target;if(!n||n.closest(o)||!n.closest(e))return;n=lt(n);let a=n.tagName.toLowerCase();if(!(a==="svg"||a==="img")){if(r.appMode==="review"){t.preventDefault(),t.stopPropagation(),dt(n);return}t.preventDefault(),t.stopPropagation(),rr(n)}},!0),document.addEventListener("blur",t=>{let n=t.target;n&&n.dataset&&n.dataset.fbwEditing==="1"&&(n.contentEditable="false",delete n.dataset.fbwEditing)},!0),document.addEventListener("keydown",t=>{if(t.key==="Escape"){r.selectedEl&&(t.preventDefault(),M());let n=document.activeElement;n&&n.dataset&&n.dataset.fbwEditing==="1"&&(n.contentEditable="false",delete n.dataset.fbwEditing,n.blur())}}),["input","compositionend","paste","cut","drop"].forEach(t=>{document.addEventListener(t,kn,!0)}),document.addEventListener("blur",t=>{t.target.dataset?.fbwEditId&&kn(t)},!0),document.addEventListener("keydown",t=>{(t.target.dataset?.fbwEditId||t.target.closest(".fbw-panel, .fbw-confirm"))&&t.stopPropagation()},!0),fe(ct),re(ct),document.addEventListener("slidechange",()=>M())}function _e(e){let o=e.closest("[data-fbw-sec-id]");if(!o)return null;let n=[...document.querySelectorAll(q)].indexOf(o);if(n<0)return null;let a=[],i=e;for(;i&&i!==o;){let s=i.tagName.toLowerCase(),c=i.parentElement;if(!c)break;let d=[...c.children].filter(f=>f.tagName===i.tagName);d.length>1&&(s+=`:nth-of-type(${d.indexOf(i)+1})`),a.unshift(s),i=c}return{secIndex:n,secLabel:o.dataset.fbwSecLabel||null,path:a.join(" > "),contentSample:(e.textContent||"").replace(/\s+/g," ").trim().slice(0,40),tag:e.tagName.toLowerCase()}}function $t(e,o,t){let a=e.querySelectorAll(t)[o.secIndex];if(!a)return{ok:!1,reason:"section-not-found"};let i=null;try{i=o.path?a.querySelector(o.path):a}catch{return{ok:!1,reason:"invalid-path"}}if(!i)return{ok:!1,reason:"element-not-found"};let s=(i.textContent||"").replace(/\s+/g," ").trim().slice(0,40);return{ok:!0,el:i,contentMismatch:s!==o.contentSample}}function ir(e){if(!e)return"";let o=e.getAttribute("data-screen-label")||e.dataset.fbwSecLabel||e.getAttribute("aria-label");if(o)return o.trim();let t=e.querySelector("h1, h2, h3, h4, h5, h6");return t&&t.textContent?t.textContent.trim().replace(/\s+/g," ").slice(0,24):e.id?"#"+e.id:e.tagName.toLowerCase()}function Tn(e){if(!e)return"";let o=e.closest("section, article, [data-fbw-sec-id]"),t=o?ir(o):"",n=e.tagName.toLowerCase(),a=(e.textContent||"").replace(/\s+/g," ").trim().slice(0,60),i=_e(e),s=`[${t||"page"}] ${n}${a?` \xB7 "${a}${a.length>=60?"\u2026":""}"`:""}`;return i&&i.path?`${s}
selector: ${i.path}`:s}async function Mn(){if(!r.selectedEl){b(l("copy.descriptor.empty")||"\u6CA1\u6709\u9009\u4E2D\u5143\u7D20");return}let e=[...r.selectedEls].filter(n=>document.contains(n)),o=e.length>1?e.map((n,a)=>`[${a+1}] ${Tn(n)}`).join(`

`):Tn(r.selectedEl),t=e.length>1?`${l("copy.descriptor.done")||"\u5DF2\u590D\u5236\u5143\u7D20\u63CF\u8FF0\u7B26"} \xB7 ${e.length}`:l("copy.descriptor.done")||"\u5DF2\u590D\u5236\u5143\u7D20\u63CF\u8FF0\u7B26";try{await navigator.clipboard.writeText(o),b(t)}catch{let a=document.createElement("textarea");a.value=o,a.style.position="fixed",a.style.opacity="0",document.body.appendChild(a),a.select();try{document.execCommand("copy"),b(t)}catch{b(l("copy.descriptor.fail")||"\u590D\u5236\u5931\u8D25")}document.body.removeChild(a)}}var sr=["delete","hide","replace-img","tag","font","highlight","scale","rotate","move","href"];function lr(e,o){for(let t of sr)if(e.some(n=>n.op===t))return t;return o?"text":e[0]?.op||null}function Fn(){let e=new Set;document.querySelectorAll("[data-fbw-edit-id]").forEach(t=>{let n=t.dataset.fbwEditId,a=r.originals.get(n);a!==void 0&&a!==z(t)&&e.add(t)});let o=new Set(e);r.elementOps.forEach((t,n)=>{document.contains(n)&&t.ops?.length&&o.add(n)}),o.forEach(t=>{let a=r.elementOps.get(t)?.ops||[],i=e.has(t),s=lr(a,i);t.classList.add("fbw-audit-changed"),s&&t.setAttribute("data-fbw-audit-op",s);let c=a.length+(i?1:0);c>0&&t.setAttribute("data-fbw-audit-count",String(c))})}function Pn(){document.querySelectorAll(".fbw-audit-changed").forEach(e=>{e.classList.remove("fbw-audit-changed"),e.removeAttribute("data-fbw-audit-count"),e.removeAttribute("data-fbw-audit-op"),e.removeAttribute("data-fbw-audit-kind")})}function An(){if(document.body.classList.toggle("fbw-audit-mode")){Fn();let o=document.querySelectorAll(".fbw-audit-changed").length;b(o?l("audit.on",{n:o})||`\u5BA1\u8BA1\u6A21\u5F0F \xB7 ${o} \u5904\u6539\u52A8`:l("audit.empty")||"\u5BA1\u8BA1\u6A21\u5F0F \xB7 \u6CA1\u6709\u6539\u52A8")}else Pn(),b(l("audit.off")||"\u5BA1\u8BA1\u6A21\u5F0F\u5173\u95ED")}function Nn(){document.body.classList.contains("fbw-audit-mode")&&(Pn(),Fn())}var oe=null;function cr(){return oe||(oe=document.createElement("div"),oe.className="fbw-measure-overlay",document.body.appendChild(oe),oe)}function pt(e,o,t,n){let a=document.createElement("div");return a.className="fbw-measure-line fbw-measure-line-"+e,a.style.left=o+"px",a.style.top=t+"px",e==="h"?a.style.width=n+"px":a.style.height=n+"px",a}function bt(e,o,t,n){let a=document.createElement("div");return a.className="fbw-measure-label",a.textContent=e,a.style.left=o+"px",a.style.top=t+"px",a.style.transform=n==="h"?"translate(-50%, -130%)":"translate(8px, -50%)",a}function On(e){if(!r.selectedEl||!e||e===r.selectedEl)return ne();let o=r.selectedEl.getBoundingClientRect(),t=e.getBoundingClientRect();if(!o.width||!t.width)return ne();let n=cr();n.innerHTML="",n.classList.add("fbw-on");let a=document.createElement("div");a.className="fbw-measure-target",a.style.left=t.left+"px",a.style.top=t.top+"px",a.style.width=t.width+"px",a.style.height=t.height+"px",n.appendChild(a);let i=o.left+o.width/2,s=o.top+o.height/2,c=o.top-t.top,d=t.bottom-o.bottom,f=o.left-t.left,p=t.right-o.right;if(Math.abs(c)>.5){let m=Math.min(o.top,t.top);n.appendChild(pt("v",i,m,Math.abs(c))),n.appendChild(bt(Math.round(c)+"px",i,(o.top+t.top)/2,"v"))}if(Math.abs(d)>.5){let m=Math.min(o.bottom,t.bottom);n.appendChild(pt("v",i,m,Math.abs(d))),n.appendChild(bt(Math.round(d)+"px",i,(o.bottom+t.bottom)/2,"v"))}if(Math.abs(f)>.5){let m=Math.min(o.left,t.left);n.appendChild(pt("h",m,s,Math.abs(f))),n.appendChild(bt(Math.round(f)+"px",(o.left+t.left)/2,s,"h"))}if(Math.abs(p)>.5){let m=Math.min(o.right,t.right);n.appendChild(pt("h",m,s,Math.abs(p))),n.appendChild(bt(Math.round(p)+"px",(o.right+t.right)/2,s,"h"))}}function ne(){oe&&(oe.classList.remove("fbw-on"),oe.innerHTML="")}var dr=6,zn=".fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-marker-popover, .fbw-tag-popover, .fbw-font-picker, .fbw-note-popover, .fbw-help-popover, .fbw-tooltip, .fbw-anno, .fbw-anno-actions, .fbw-marquee-drawing, .fbw-resize-handles, .fbw-measure-overlay, script, style",K=null,P=null,de=null;function fr(){return de||(de=document.createElement("div"),de.className="fbw-rubber-band",document.body.appendChild(de),de)}function pr(e,o,t,n){let a=fr();a.style.left=e+"px",a.style.top=o+"px",a.style.width=t+"px",a.style.height=n+"px",a.classList.add("fbw-on")}function $n(){de&&de.classList.remove("fbw-on")}function br(e,o){return!(e.right<o.left||e.left>o.right||e.bottom<o.top||e.top>o.bottom)}function ur(e,o){let t={left:e.x,top:e.y,right:e.x+e.w,bottom:e.y+e.h},n=document.querySelectorAll("[data-fbw-edit-id], [data-fbw-sec-id] > *"),a=[],i=new Set;n.forEach(c=>{if(i.has(c)||c.closest(zn))return;let d=c.getBoundingClientRect();!d.width||!d.height||br(d,t)&&(i.add(c),a.push(c))});let s=a.filter(c=>!a.some(d=>d!==c&&c.contains(d)));s.length&&(o||M(),r.selectedEls.size===0?(dt(s[0]),s.slice(1).forEach(ft)):s.forEach(c=>{r.selectedEls.has(c)||ft(c)}))}function Rn(){document.addEventListener("mousedown",e=>{!r.editMode||r.marqueeMode||e.button!==0||e.target.closest(zn)||e.target.closest("[data-fbw-edit-id]")||[...r.selectedEls].some(t=>t===e.target||t.contains(e.target))||(K={x:e.clientX,y:e.clientY,additive:e.shiftKey||e.metaKey||e.ctrlKey})},!0),V(e=>{if(K&&!P){let i=e.clientX-K.x,s=e.clientY-K.y;if(Math.hypot(i,s)<dr)return;P={startX:K.x,startY:K.y,additive:K.additive},K=null}if(!P)return;e.preventDefault();let o=Math.min(P.startX,e.clientX),t=Math.min(P.startY,e.clientY),n=Math.abs(e.clientX-P.startX),a=Math.abs(e.clientY-P.startY);P.x=o,P.y=t,P.w=n,P.h=a,pr(o,t,n,a)}),Z(()=>{K&&(K=null),P&&($n(),P.w>4&&P.h>4&&ur(P,P.additive),P=null)}),document.addEventListener("keydown",e=>{e.key==="Escape"&&P&&(e.preventDefault(),P=null,$n())})}function Dn(e){return String(e||"").replace(/```/g,"`\u200B`\u200B`")}function ve(e){return String(e||"").replace(/^(#{1,6}\s|[*\-+]\s|>\s|\d+\.\s)/gm,"\\$1")}function qe(){let e=k(),o=r.panel.querySelector("[data-fbw-global]").value.trim(),t=new Date().toLocaleString("zh-CN",{hour12:!1}),a="# "+(document.title||"\u9875\u9762\u53CD\u9988")+` \xB7 \u53CD\u9988

`;if(a+="\u751F\u6210\u65F6\u95F4: "+t+`
`,a+="\u53CD\u9988\u7EF4\u5EA6: \u5168\u5C40"+(o?" OK":" \u2014")+" / \u9875\u9762 "+r.sectionFeedback.size+" / \u7F16\u8F91 "+e.length+" / \u5143\u7D20 "+r.elementOps.size+" / \u622A\u56FE "+r.attachments.length+`

`,o&&(a+=`## \u5168\u5C40\u53CD\u9988

`+ve(o)+`

`),r.sectionFeedback.size){a+="## \u9875\u9762\u53CD\u9988 ("+r.sectionFeedback.size+` \u6761)

`;let i=0;r.sectionFeedback.forEach(s=>{i++,a+="### "+i+". "+s.label+`

`+ve(s.note)+`

`})}if(e.length&&(a+="## \u7F16\u8F91\u4FEE\u6539 ("+e.length+` \u5904)

`,e.forEach((i,s)=>{a+="### "+(s+1)+". ["+i.section+`]

**\u539F\u6587**:
\`\`\`
`+Dn(i.before)+"\n```\n\n**\u6539\u540E**:\n```\n"+Dn(i.after)+"\n```\n\n"})),r.elementOps.size){a+="## \u5143\u7D20\u64CD\u4F5C / \u53CD\u9988 ("+r.elementOps.size+` \u5904)

`;let i=0;r.elementOps.forEach(s=>{i++;let c=s.ops.find(p=>p.op==="note"),f=s.ops.filter(p=>p.op!=="note").map(p=>p.op==="move"?`move(x=${p.args.x}, y=${p.args.y})`:p.op==="scale"?`scale(${p.args.scale})`:p.op==="rotate"?`rotate(${p.args.rotate}\xB0)`:p.op==="highlight"?p.args?.color?`highlight(${p.args.name||p.args.color})`:"highlight(clear)":p.op==="replace-img"?`replace-img("${p.args.name}")`:p.op).join(" + ");a+="### "+i+". "+s.descriptor+`
`,f&&(a+="- \u64CD\u4F5C\uFF1A"+f+`
`),c&&(a+="- \u53CD\u9988\uFF1A"+ve(c.args.text)+`
`),a+=`
`})}return r.annotations.length&&(a+="## \u533A\u57DF\u6807\u6CE8 ("+r.annotations.length+` \u5904)

`,r.annotations.forEach((i,s)=>{let c=i.rectPct||{},d=i.type||"region",f=i.note||i.text;if(d==="floating"){let p=`(x=${((c.x||0)*100).toFixed(0)}%, y=${((c.y||0)*100).toFixed(0)}%)`;a+=`### ${s+1}. [${i.secLabel||"?"}] \xB7 \u6D6E\u52A8\u6587\u5B57 \xB7 ${p}

`,a+=`${i.content?ve(i.content):"_(\u7A7A)_"}

`}else{let p=`(x=${((c.x||0)*100).toFixed(0)}%, y=${((c.y||0)*100).toFixed(0)}%, w=${((c.w||0)*100).toFixed(0)}%, h=${((c.h||0)*100).toFixed(0)}%)`;if(a+=`### ${s+1}. [${i.secLabel||"?"}] \xB7 \u533A\u57DF\u6807\u6CE8 \xB7 ${p}

`,i.content&&(a+=`**\u5185\u5BB9\uFF08\u8981\u63D2\u5165\u9875\u9762\uFF09**\uFF1A

${ve(i.content)}

`),f&&(a+=`**\u53CD\u9988**\uFF1A

> ${ve(f).replace(/\n/g,`
> `)}

`),i.image){let m=i.image.filename?` (${i.image.filename})`:"";a+=`**\u9644\u56FE**\uFF1A${i.image.name}${m}

`}!i.content&&!f&&!i.image&&(a+=`_(\u7A7A\u6807\u6CE8)_

`)}})),r.attachments.length&&(a+="## \u9644\u4EF6\u622A\u56FE ("+r.attachments.length+` \u5F20)

`,r.attachments.forEach((i,s)=>{a+="- [\u622A\u56FE "+(s+1)+"] "+i.name+`
`}),a+=`
`),!e.length&&!o&&!r.sectionFeedback.size&&!r.attachments.length&&(a+=`_(\u6CA1\u6709\u4EFB\u4F55\u53CD\u9988)_
`),a}function mr(){return new Promise(e=>{if(window.html2canvas)return e(!0);let o=document.createElement("script");o.src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",o.integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H",o.crossOrigin="anonymous",o.referrerPolicy="no-referrer",o.onload=()=>e(!0),o.onerror=()=>e(!1),document.head.appendChild(o)})}async function In(){if(b(l("shot.loading")),!await mr()){b(l("shot.loadFailed"));return}document.body.classList.add("fbw-printing"),await new Promise(t=>requestAnimationFrame(t));let o;try{o=await window.html2canvas(document.body,{useCORS:!0,allowTaint:!0,logging:!1,x:window.scrollX,y:window.scrollY,width:window.innerWidth,height:window.innerHeight,windowWidth:document.documentElement.scrollWidth,windowHeight:document.documentElement.scrollHeight,scale:window.devicePixelRatio||1})}catch(t){console.error("[fbw] screenshot failed",t),b(l("shot.failed")),document.body.classList.remove("fbw-printing");return}document.body.classList.remove("fbw-printing"),o.toBlob(t=>{if(!t){b(l("shot.failed"));return}t.name="screenshot-"+new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")+".jpg",st(t)},"image/jpeg",.85)}function Be(){r.panel.classList.toggle("fbw-open");let e=r.panel.classList.contains("fbw-open");if(r.fbToggleBtn&&r.fbToggleBtn.classList.toggle("fbw-active",e),r.fbFab.classList.toggle("fbw-active",e),e&&(document.querySelectorAll("[data-fbw-edit-id]").forEach(o=>{let t=o.dataset.fbwEditId;o.classList.toggle("fbw-changed",r.originals.get(t)!==z(o))}),F(k),L(),r.currentSec)){let o=r.currentSec.dataset.fbwSecId,t=r.sectionFeedback.get(o);r.panel.querySelector("[data-fbw-saved]").classList.toggle("fbw-on",!!t)}}function _n(){r.panel.querySelector("[data-fbw-close]").addEventListener("click",t=>{t.stopPropagation(),r.panel.classList.remove("fbw-open"),r.fbToggleBtn&&r.fbToggleBtn.classList.remove("fbw-active"),r.fbFab.classList.remove("fbw-active")}),r.fbFab.addEventListener("click",Be);let e=r.panel.querySelector("[data-fbw-locale]");e&&e.addEventListener("click",t=>{t.stopPropagation(),uo()});let o=r.panel.querySelector("[data-fbw-shot]");o&&o.addEventListener("click",t=>{t.stopPropagation();let n=r.panel.classList.contains("fbw-open");n&&r.panel.classList.remove("fbw-open"),In().finally(()=>{n&&r.panel.classList.add("fbw-open")})}),r.panel.querySelector('[data-fbw-action="copy"]').addEventListener("click",()=>{let t=qe();navigator.clipboard.writeText(t).then(()=>b(l("panel.copy"))).catch(()=>{let n=document.createElement("textarea");n.value=t,document.body.appendChild(n),n.select(),document.execCommand("copy"),document.body.removeChild(n),b(l("panel.copy.fallback"))})}),r.panel.querySelector("[data-fbw-clear-all]").addEventListener("click",t=>{t.stopPropagation(),r.confirmDialog.classList.add("fbw-on")}),r.confirmDialog.querySelector("[data-fbw-confirm-cancel]").addEventListener("click",()=>{r.confirmDialog.classList.remove("fbw-on")}),r.confirmDialog.querySelector("[data-fbw-confirm-ok]").addEventListener("click",()=>{r.sectionFeedback.clear(),r.attachments.length=0,r.annotations.length=0,document.querySelectorAll(".fbw-anno").forEach(t=>t.remove()),te(),r.panel.querySelector("[data-fbw-global]").value="",r.panel.querySelector("[data-fbw-current-text]").value="",r.panel.querySelector("[data-fbw-saved]").classList.remove("fbw-on"),document.querySelectorAll("[data-fbw-edit-id]").forEach(t=>{let n=t.dataset.fbwEditId,a=r.originals.get(n);a!==void 0&&z(t)!==a&&(t.innerText=a,t.classList.remove("fbw-changed"))}),r.elementOps.forEach((t,n)=>{delete n.dataset.fbwOpDeleted,delete n.dataset.fbwOpHidden,delete n.dataset.fbwTx,delete n.dataset.fbwTy,delete n.dataset.fbwScale,delete n.dataset.fbwRotate,delete n.dataset.fbwHighlight,n.style.transform="",n.style.backgroundImage="",n.style.backgroundColor="",n.tagName==="IMG"&&n.dataset.fbwOriginalSrc&&(n.src=n.dataset.fbwOriginalSrc,delete n.dataset.fbwOriginalSrc)}),r.elementOps.clear(),M(),Eo(),F(k),r.confirmDialog.classList.remove("fbw-on"),b(l("panel.cleared"))}),window.addEventListener("beforeunload",Et)}function He(e){r.currentSec=e;let o=r.panel.querySelector("[data-fbw-current-page]"),t=r.panel.querySelector("[data-fbw-current-text]"),n=r.panel.querySelector("[data-fbw-saved]");if(!e){o.textContent="\u2014",t.value="",t.disabled=!0,n.classList.remove("fbw-on");return}t.disabled=!1,o.textContent=e.dataset.fbwSecLabel||"Section";let a=e.dataset.fbwSecId,i=r.sectionFeedback.get(a);t.value=i?.note||"",n.classList.toggle("fbw-on",!!i)}function qn(e){let o=r.panel.querySelector("[data-fbw-current-text]");o.addEventListener("input",n=>{if(!r.currentSec)return;let a=r.currentSec.dataset.fbwSecId,i=r.currentSec.dataset.fbwSecLabel,s=n.target.value.trim();s?(r.sectionFeedback.set(a,{label:i,note:s}),r.panel.querySelector("[data-fbw-saved]").classList.add("fbw-on")):(r.sectionFeedback.delete(a),r.panel.querySelector("[data-fbw-saved]").classList.remove("fbw-on")),F(k),L()}),["keydown","keyup","keypress"].forEach(n=>o.addEventListener(n,a=>a.stopPropagation())),r.panel.querySelector("[data-fbw-global]").addEventListener("input",L);let t=document.querySelector("deck-stage");if(t){document.addEventListener("slidechange",a=>He(a.detail?.slide||null));let n=t.querySelector("section.slide")||e[0];n&&He(n)}else{if(document.body.classList.add("fbw-no-overlay"),e.length){let a=new IntersectionObserver(i=>{let s=i.filter(c=>c.isIntersecting).sort((c,d)=>d.intersectionRatio-c.intersectionRatio)[0];s&&He(s.target)},{threshold:[.3,.5,.7]});e.forEach(i=>a.observe(i)),He(e[0])}if(e.length===1&&(e[0]===document.body||e[0].tagName==="MAIN"||e[0].tagName==="ARTICLE")){let a=e[0],i=()=>{let c=(document.title||"Page").slice(0,80);a.dataset.fbwSecLabel!==c&&(a.dataset.fbwSecLabel=c,r.currentSec===a&&He(a))};window.addEventListener("popstate",i),["pushState","replaceState"].forEach(c=>{let d=history[c];history[c]=function(...f){let p=d.apply(this,f);return setTimeout(i,0),p}});let s=document.querySelector("title");s&&new MutationObserver(i).observe(s,{childList:!0,characterData:!0,subtree:!0})}}}function zt(e){return{id:e.id||e.dataset.fbId||null,cssPath:gr(e),contentHash:hr(e),fbId:e.dataset.fbwEditId||null,tag:e.tagName.toLowerCase()}}function Bn(e){return typeof CSS<"u"&&CSS.escape?CSS.escape(e):String(e).replace(/[^\w-]/g,o=>"\\"+o)}function gr(e){let o=e.closest("[data-fbw-sec-id]")||document.body,t=[],n=e;for(;n&&n!==o&&n!==document.body;){let i=n.tagName.toLowerCase();if(n.id){t.unshift("#"+Bn(n.id)),n=null;break}let s=[...n.classList].filter(d=>!d.startsWith("fbw-")).slice(0,2);s.length&&(i+="."+s.map(Bn).join("."));let c=n.parentElement;if(c){let d=[...c.children].filter(f=>f.tagName===n.tagName);if(d.length>1){let f=d.indexOf(n)+1;i+=`:nth-of-type(${f})`}}t.unshift(i),n=c}return[o.dataset?.fbwSecId?`[data-fbw-sec-id="${o.dataset.fbwSecId}"]`:"",t.join(" > ")].filter(Boolean).join(" > ")}function hr(e){let o=(e.textContent||"").replace(/\s+/g," ").trim().slice(0,80),t=0;for(let n=0;n<o.length;n++)t=(t<<5)-t+o.charCodeAt(n),t|=0;return{sample:o.slice(0,40),hash:(t>>>0).toString(16).padStart(8,"0")}}var Rt="sessionsDir";function ke(){return typeof window<"u"&&typeof window.showDirectoryPicker=="function"}async function wr(e,o="readwrite"){if(!e?.queryPermission)return!1;let t={mode:o};try{if(await e.queryPermission(t)==="granted"||await e.requestPermission(t)==="granted")return!0}catch{}return!1}async function Hn(){let e=await at(Rt);return e&&await wr(e)?e:null}async function jn(){let e=await window.showDirectoryPicker({id:"redline-sessions",mode:"readwrite",startIn:"desktop"});return await rt(Rt,e),e}async function Un(){await it(Rt)}var xr=(()=>{let e=new Uint32Array(256);for(let o=0;o<256;o++){let t=o;for(let n=0;n<8;n++)t=t&1?3988292384^t>>>1:t>>>1;e[o]=t>>>0}return e})();function yr(e){let o=4294967295;for(let t=0;t<e.length;t++)o=xr[(o^e[t])&255]^o>>>8;return(o^4294967295)>>>0}function vr(e=new Date){let o=(e.getHours()&31)<<11|(e.getMinutes()&63)<<5|Math.floor(e.getSeconds()/2)&31,t=(e.getFullYear()-1980&127)<<9|(e.getMonth()+1&15)<<5|e.getDate()&31;return{time:o,date:t}}function E(e,o,t){e.setUint16(o,t,!0)}function D(e,o,t){e.setUint32(o,t,!0)}function Yn(e){let o=new TextEncoder,{time:t,date:n}=vr(),a=[],i=[],s=0;for(let p of e){let m=o.encode(p.name),y=p.data,h=yr(y),g=y.length,u=new ArrayBuffer(30+m.length),w=new DataView(u);D(w,0,67324752),E(w,4,20),E(w,6,2048),E(w,8,0),E(w,10,t),E(w,12,n),D(w,14,h),D(w,18,g),D(w,22,g),E(w,26,m.length),E(w,28,0),new Uint8Array(u,30).set(m),a.push(new Uint8Array(u),y);let C=new ArrayBuffer(46+m.length),x=new DataView(C);D(x,0,33639248),E(x,4,20),E(x,6,20),E(x,8,2048),E(x,10,0),E(x,12,t),E(x,14,n),D(x,16,h),D(x,20,g),D(x,24,g),E(x,28,m.length),E(x,30,0),E(x,32,0),E(x,34,0),E(x,36,0),D(x,38,0),D(x,42,s),new Uint8Array(C,46).set(m),i.push(new Uint8Array(C)),s+=30+m.length+g}let c=i.reduce((p,m)=>p+m.length,0),d=new ArrayBuffer(22),f=new DataView(d);return D(f,0,101010256),E(f,4,0),E(f,6,0),E(f,8,e.length),E(f,10,e.length),D(f,12,c),D(f,16,s),E(f,20,0),new Blob([...a,...i,new Uint8Array(d)],{type:"application/zip"})}var kr="1.0";function Wn(){let e=r.panel?.querySelector("[data-fbw-global]")?.value?.trim()||"",o=[];r.sectionFeedback.forEach((a,i)=>{o.push({secId:i,secLabel:a.label,note:a.note})});let t=[];k().forEach(a=>{let i=document.querySelector(`[data-fbw-edit-id="${a.id}"]`);i&&t.push({op:"text",selector:zt(i),section:a.section,before:a.before,after:a.after})}),r.elementOps.forEach((a,i)=>{a.ops.forEach(s=>{t.push({op:s.op,selector:zt(i),descriptor:a.descriptor,...s.args!==void 0?{args:s.args}:{},...s.proposed?{proposed:!0}:{}})})});let n=r.attachments.map(a=>({id:a.id,name:a.name,type:a.type,dataURL:a.dataURL}));return{schemaVersion:kr,widgetVersion:Le,appMode:r.appMode||"deck",sessionId:"fbw-sess-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),capturedAt:new Date().toISOString(),capturedAtMs:Date.now(),env:{userAgent:(navigator.userAgent||"").slice(0,200),locale:navigator.language||"",viewport:{w:window.innerWidth,h:window.innerHeight,dpr:window.devicePixelRatio||1},timezone:Intl.DateTimeFormat().resolvedOptions().timeZone},page:{url:location.href,title:document.title||null,pathname:location.pathname},source:{hint:location.pathname.replace(/^.*\//,""),matchBy:"pathname"},feedback:{global:e||null,perSection:o},edits:t,annotations:r.annotations.map(a=>{let i=a.type||"region",s={id:a.id,type:i,secId:a.secId,secLabel:a.secLabel,rectPct:a.rectPct};return i==="floating"?{...s,content:a.content||""}:{...s,content:a.content||"",note:a.note||a.text||"",image:a.image?{name:a.image.name,type:a.image.type,dataURL:a.image.dataURL}:null}}),attachments:n}}function Er(e){return(e||"session").replace(/[\\/:*?"<>|\s]+/g,"_").replace(/_+/g,"_").slice(0,80)}function Sr(){let e=new Date,o=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${o(e.getMonth()+1)}-${o(e.getDate())}-${o(e.getHours())}${o(e.getMinutes())}${o(e.getSeconds())}`}function Kn(e){return Er(e||document.title)+"-"+Sr()}async function ut(e,o,t){let a=await(await e.getFileHandle(o,{create:!0})).createWritable();await a.write(t),await a.close()}async function mt(e){return(await fetch(e)).blob()}function gt(e){if(!e)return"png";let o=e.split("/")[1]||"png";return o==="jpeg"?"jpg":o.replace(/[^a-z0-9]/gi,"")}async function Gn(e,o){if(!ke())return{ok:!1,fallback:"download",reason:"no-fs-access"};let t=await Hn(),n=!1;if(!t)try{t=await jn(),n=!0}catch(a){return{ok:!1,fallback:"download",reason:"picker-cancelled",error:a?.message}}try{let a=[];if(Array.isArray(e.annotations)){for(let c of e.annotations)if(c.image?.dataURL){let d=(c.id||"").split("-").pop().slice(0,8)||Math.random().toString(36).slice(2,10),f=`${o}-anno-${d}.${gt(c.image.type)}`,p=await mt(c.image.dataURL);await ut(t,f,p),a.push(f),c.image={name:c.image.name,type:c.image.type,filename:f}}}if(Array.isArray(e.attachments))for(let c=0;c<e.attachments.length;c++){let d=e.attachments[c];if(d.dataURL){let f=`${o}-att-${String(c+1).padStart(2,"0")}.${gt(d.type)}`,p=await mt(d.dataURL);await ut(t,f,p),a.push(f),e.attachments[c]={id:d.id,name:d.name,type:d.type,filename:f}}}let i=o+".json",s=o+".md";return await ut(t,i,JSON.stringify(e,null,2)),await ut(t,s,qe()),{ok:!0,dirName:t.name,jsonName:i,mdName:s,firstPick:n,imageFiles:a}}catch(a){return{ok:!1,fallback:"download",reason:"write-failed",error:a?.message}}}function Xn(e,o){let t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"});Vn(t,o+".json")}function Vn(e,o){let t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=o,n.click(),URL.revokeObjectURL(t)}async function Dt(e,o){let t=new TextEncoder,n=[];if(Array.isArray(e.annotations)){for(let i of e.annotations)if(i.image?.dataURL){let s=(i.id||"").split("-").pop().slice(0,8)||Math.random().toString(36).slice(2,10),c=`${o}-anno-${s}.${gt(i.image.type)}`,d=new Uint8Array(await(await mt(i.image.dataURL)).arrayBuffer());n.push({name:c,data:d}),i.image={name:i.image.name,type:i.image.type,filename:c}}}if(Array.isArray(e.attachments))for(let i=0;i<e.attachments.length;i++){let s=e.attachments[i];if(s.dataURL){let c=`${o}-att-${String(i+1).padStart(2,"0")}.${gt(s.type)}`,d=new Uint8Array(await(await mt(s.dataURL)).arrayBuffer());n.push({name:c,data:d}),e.attachments[i]={id:s.id,name:s.name,type:s.type,filename:c}}}n.unshift({name:`${o}.json`,data:t.encode(JSON.stringify(e,null,2))},{name:`${o}.md`,data:t.encode(qe())});let a=Yn(n);return Vn(a,o+".zip"),{ok:!0,fileCount:n.length}}async function Lr(){try{return typeof chrome>"u"||!chrome.storage?.sync?null:(await chrome.storage.sync.get({saveMode:"zip"})).saveMode}catch{return null}}function Zn(){let e=r.panel.querySelector('[data-fbw-action="save"]');e&&(e.addEventListener("click",async()=>{let o=Wn(),t=Kn();if(await Lr()!=="fs"||!ke()){e.disabled=!0;try{await Dt(o,t),b(l("save.unsupported",{stem:t+".zip"}))}catch(i){Xn(o,t),b(l("save.failed",{reason:i?.message||"zip-failed"}))}finally{e.disabled=!1}return}e.disabled=!0;try{let i=await Gn(o,t);if(i.ok){let s=(i.imageFiles||[]).length,c=`/{json, md${s>0?` + ${s} imgs`:""}}`;b(l(i.firstPick?"save.first":"save.again",{dir:i.dirName,suffix:c}))}else i.reason==="picker-cancelled"?b(l("save.cancelled")):(await Dt(o,t),b(l("save.failed",{reason:i.reason||"unknown"})))}finally{e.disabled=!1}}),e.addEventListener("contextmenu",async o=>{o.preventDefault(),await Un(),b(l("save.dirCleared"))}))}var Jn={html2canvas:{src:"https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",integrity:"sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H"},jspdf:{src:"https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",integrity:"sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk"}};function Qn({src:e,integrity:o}){return new Promise(t=>{let n=document.createElement("script");n.src=e,n.integrity=o,n.crossOrigin="anonymous",n.referrerPolicy="no-referrer",n.onload=()=>t(!0),n.onerror=()=>t(!1),document.head.appendChild(n)})}function Cr(){let e=[];return window.html2canvas||e.push(Qn(Jn.html2canvas)),window.jspdf||e.push(Qn(Jn.jspdf)),e.length?Promise.all(e).then(o=>o.every(Boolean)&&!!window.html2canvas&&!!window.jspdf):Promise.resolve(!0)}function Ee(e,o){if(e=e||{},r.panel.classList.remove("fbw-open"),r.fbToggleBtn&&r.fbToggleBtn.classList.remove("fbw-active"),r.fbFab.classList.remove("fbw-active"),o)try{o()}catch{}if(e.image)return Tr();document.body.classList.add("fbw-printing"),b(l("pdf.vector.hint")),setTimeout(()=>{try{window.print()}catch(t){console.error(t)}setTimeout(()=>document.body.classList.remove("fbw-printing"),2e3)},250)}async function Tr(){if(b(l("pdf.loading")),!await Cr()){b(l("pdf.loadFailed"));return}let o=document.querySelector("deck-stage"),t=o&&parseInt(o.getAttribute("width"),10)||1920,n=o&&parseInt(o.getAttribute("height"),10)||1080,a=[...document.querySelectorAll("section.slide")];if(!a.length)return Mr();let i=a.map(g=>g.hasAttribute("data-deck-active"));document.body.classList.add("fbw-printing");let s=null,c="";try{s=o&&o.shadowRoot&&o.shadowRoot.querySelector(".canvas")}catch{}s&&(c=s.style.transform||"",s.style.transform="none");let{jsPDF:d}=window.jspdf,f=t>n?"landscape":"portrait",p=new d({unit:"px",format:[t,n],orientation:f,hotfixes:["px_scaling"]}),m="http://www.w3.org/2000/svg",y=new Map;document.querySelectorAll("symbol[id]").forEach(g=>y.set(g.id,g));let h=[];a.forEach(g=>{g.querySelectorAll("use").forEach(u=>{let C=(u.getAttribute("href")||u.getAttribute("xlink:href")||"").replace(/^#/,""),x=y.get(C);if(!x)return;let S=u.ownerSVGElement,G=x.getAttribute("viewBox"),Se=!1;S&&!S.getAttribute("viewBox")&&G&&(S.setAttribute("viewBox",G),Se=!0);let je=document.createElementNS(m,"g");[...x.childNodes].forEach(Ue=>je.appendChild(Ue.cloneNode(!0))),["transform","fill","stroke","class","opacity","style"].forEach(Ue=>{let Ht=u.getAttribute(Ue);Ht&&je.setAttribute(Ue,Ht)});let sa=u;u.parentNode.insertBefore(je,u),u.parentNode.removeChild(u),h.push({g:je,original:sa,parentSvg:S,vbAdded:Se})})}),b(l("pdf.progress",{i:0,total:a.length}));try{for(let u=0;u<a.length;u++){a.forEach((S,G)=>{G===u?S.setAttribute("data-deck-active",""):S.removeAttribute("data-deck-active")}),await new Promise(S=>requestAnimationFrame(()=>requestAnimationFrame(S)));try{await document.fonts.ready}catch{}b(l("pdf.progress",{i:u+1,total:a.length}));let w={width:t,height:n,windowWidth:t,windowHeight:n,scale:2,useCORS:!0,allowTaint:!0,backgroundColor:"#ffffff",logging:!1},C;try{C=await window.html2canvas(a[u],{...w,foreignObjectRendering:!0})}catch(S){console.warn("foreignObject mode failed, fallback to JS render:",S),C=await window.html2canvas(a[u],w)}let x=C.toDataURL("image/jpeg",.92);u>0&&p.addPage([t,n],f),p.addImage(x,"JPEG",0,0,t,n,void 0,"FAST")}let g=(document.title||"deck").replace(/[\\/:*?"<>|]/g,"_")+"-image.pdf";p.save(g),b(l("pdf.saved",{file:g}))}catch(g){console.error(g),b(l("pdf.failed",{reason:g.message||g}))}finally{h.forEach(g=>{try{g.g.parentNode.insertBefore(g.original,g.g),g.g.parentNode.removeChild(g.g),g.vbAdded&&g.parentSvg&&g.parentSvg.removeAttribute("viewBox")}catch{}}),s&&(s.style.transform=c),a.forEach((g,u)=>{i[u]?g.setAttribute("data-deck-active",""):g.removeAttribute("data-deck-active")}),document.body.classList.remove("fbw-printing")}}async function Mr(){document.body.classList.add("fbw-printing"),await new Promise(a=>requestAnimationFrame(()=>requestAnimationFrame(a)));try{await document.fonts.ready}catch{}let e=document.documentElement,o=Math.max(e.scrollWidth,document.body.scrollWidth),t=Math.max(e.scrollHeight,document.body.scrollHeight);b(l("pdf.progress",{i:0,total:1}));let n;try{n=await window.html2canvas(document.body,{useCORS:!0,allowTaint:!0,logging:!1,backgroundColor:"#ffffff",scale:2,x:0,y:0,width:o,height:t,windowWidth:o,windowHeight:t})}catch(a){console.error(a),b(l("pdf.failed",{reason:a.message||a})),document.body.classList.remove("fbw-printing");return}try{let{jsPDF:a}=window.jspdf,i=14400,s=(document.title||"page").replace(/[\\/:*?"<>|]/g,"_")+"-long.pdf";if(t<=i){let c=new a({unit:"px",format:[o,t],orientation:"portrait",hotfixes:["px_scaling"]}),d=n.toDataURL("image/jpeg",.9);c.addImage(d,"JPEG",0,0,o,t,void 0,"FAST"),c.save(s)}else{let c=i,d=n.width/o,f=Math.floor(c*d),p=Math.ceil(n.height/f),m=new a({unit:"px",format:[o,c],orientation:"portrait",hotfixes:["px_scaling"]});for(let y=0;y<p;y++){b(l("pdf.progress",{i:y+1,total:p}));let h=y*f,g=Math.min(f,n.height-h),u=document.createElement("canvas");u.width=n.width,u.height=g;let w=u.getContext("2d");w.fillStyle="#ffffff",w.fillRect(0,0,u.width,u.height),w.drawImage(n,0,h,n.width,g,0,0,n.width,g);let C=u.toDataURL("image/jpeg",.9);y>0&&m.addPage([o,c],"portrait"),m.addImage(C,"JPEG",0,0,o,g/d,void 0,"FAST"),await new Promise(x=>setTimeout(x,0))}m.save(s)}b(l("pdf.saved",{file:s}))}catch(a){console.error(a),b(l("pdf.failed",{reason:a.message||a}))}finally{document.body.classList.remove("fbw-printing")}}var It="sourceDir";async function Fr(e,o="readwrite"){if(!e?.queryPermission)return!1;let t={mode:o};try{if(await e.queryPermission(t)==="granted"||await e.requestPermission(t)==="granted")return!0}catch{}return!1}async function Pr(){let e=await at(It);return e&&await Fr(e)?e:null}async function Ar(){let e=await window.showDirectoryPicker({id:"redline-source",mode:"readwrite",startIn:"desktop"});return await rt(It,e),e}async function ea(){await it(It)}async function Nr(e){let o=decodeURIComponent(location.pathname.split("/").pop()||"");if(o)try{return await e.getFileHandle(o)}catch{}let t=window.prompt(`\u5728\u9009\u5B9A\u76EE\u5F55\u4E0B\u627E\u4E0D\u5230 "${o}"
\u6E90 HTML \u6587\u4EF6\u540D\uFF08\u542B .html\uFF09`,o);if(!t)return null;try{return await e.getFileHandle(t)}catch{return null}}function Or(e){let o=[];/\{\{[\s\S]+?\}\}|<%[\s\S]+?%>|<\?php|\{%[\s\S]+?%\}/.test(e)&&o.push("\u6A21\u677F\u8BED\u6CD5 (Mustache/EJS/PHP/Jinja)"),/__webpack_|window\.webpackChunk|window\.__NEXT_DATA__|window\.__remixContext/.test(e)&&o.push("build \u4EA7\u7269");let t=(e.match(/<link[^>]+rel=["']stylesheet/gi)||[]).length;return t>2&&o.push(`${t} \u4E2A\u5916\u90E8 stylesheet`),/<script[^>]+type=["']module["'][^>]*src=/i.test(e)&&o.push("JS module \u5F15\u7528"),o}function $r(e){let o=0,t=0,n=[];return document.querySelectorAll("[data-fbw-edit-id]").forEach(a=>{let i=a.dataset.fbwEditId,s=r.originals.get(i),c=z(a);if(s===c)return;let d=_e(a);if(!d){t++,n.push({kind:"text",desc:s.slice(0,30),reason:"no-path"});return}let f=$t(e,d,q);if(!f.ok){t++,n.push({kind:"text",desc:s.slice(0,30),reason:f.reason});return}if(f.contentMismatch){t++,n.push({kind:"text",desc:s.slice(0,30),reason:"content-drift"});return}f.el.textContent=c,o++}),r.elementOps.forEach((a,i)=>{let s=_e(i);if(!s){t+=a.ops.length,n.push({kind:"op",desc:a.descriptor,reason:"no-path"});return}let c=$t(e,s,q);if(!c.ok){t+=a.ops.length,n.push({kind:"op",desc:a.descriptor,reason:c.reason});return}let d=c.el;a.ops.forEach(f=>{try{if(f.op==="note")return;if(f.op==="delete")d.remove();else if(f.op==="hide")d.style.visibility="hidden";else if(f.op==="move"){let p=(d.style.transform||"").replace(/translate\([^)]+\)/g,"").trim();d.style.transform=(p+` translate(${f.args.x}px, ${f.args.y}px)`).trim()}else if(f.op==="scale"){let p=(d.style.transform||"").replace(/scale\([^)]+\)/g,"").trim();d.style.transform=(p+` scale(${f.args.scale})`).trim()}else if(f.op==="rotate"){let p=(d.style.transform||"").replace(/rotate\([^)]+\)/g,"").trim();d.style.transform=(p+` rotate(${f.args.rotate}deg)`).trim()}else if(f.op==="font")d.style.fontFamily=f.args.family==="\u7CFB\u7EDF\u9ED8\u8BA4"?"":f.args.family;else if(f.op==="highlight")d.style.backgroundColor=f.args?.color||"";else{t++,n.push({kind:"op",desc:a.descriptor,op:f.op,reason:"unsupported"});return}o++}catch(p){t++,n.push({kind:"op",desc:a.descriptor,op:f.op,reason:p.message})}})}),["fbwEditId","fbwSecId","fbwSecLabel","fbwTx","fbwTy","fbwScale","fbwRotate","fbwOriginalSrc","fbwFontName","fbwHighlight","fbwOpDeleted","fbwOpHidden"].forEach(a=>{let i="[data-"+a.replace(/[A-Z]/g,s=>"-"+s.toLowerCase())+"]";e.querySelectorAll(i).forEach(s=>delete s.dataset[a])}),e.querySelectorAll(".fbw-changed, .fbw-selected").forEach(a=>{a.classList.remove("fbw-changed"),a.classList.remove("fbw-selected")}),{applied:o,failed:t,failures:n}}function zr(){let e=new Date,o=t=>String(t).padStart(2,"0");return`${e.getFullYear()}${o(e.getMonth()+1)}${o(e.getDate())}-${o(e.getHours())}${o(e.getMinutes())}${o(e.getSeconds())}`}async function Rr(e,o,t){let a=`${o.replace(/\.html?$/i,"")}.bak.${zr()}.html`,s=await(await e.getFileHandle(a,{create:!0})).createWritable();return await s.write(t),await s.close(),a}async function ta(){if(!ke())return b(l("patch.unsupported")),{ok:!1,reason:"no-fs-access"};if(location.protocol!=="file:")return b(l("patch.notFile")),{ok:!1,reason:"not-file-protocol"};let e=await Pr();if(!e)try{e=await Ar()}catch{return b(l("patch.cancelled")),{ok:!1,reason:"picker-cancelled"}}let o=await Nr(e);if(!o)return b(l("patch.fileNotFound")),{ok:!1,reason:"file-not-found"};let t=await o.getFile(),n=await t.text(),a=Or(n);if(a.length&&await yt({title:l("warn.complex.title"),desc:l("warn.complex.desc",{flags:a.join(`
\xB7 `)}),choices:[{label:l("common.cancel"),value:"cancel"},{label:l("warn.complex.continue"),value:"continue",danger:!0}]})!=="continue")return b(l("patch.cancelled")),{ok:!1,reason:"user-cancelled-warning"};let i=new DOMParser().parseFromString(n,"text/html"),{applied:s,failed:c,failures:d}=$r(i);if(s===0)return b(c===0?l("patch.noChanges"):l("patch.partialFail",{failed:c})),d.length&&console.warn("[fbw] failures:",d),{ok:!1,applied:s,failed:c,failures:d};let f="";try{f=await Rr(e,t.name,n)}catch(g){if(await yt({title:l("patch.backupFail.title"),desc:l("patch.backupFail.desc",{reason:g.message}),choices:[{label:l("common.cancel"),value:"cancel"},{label:l("warn.complex.continue"),value:"continue",danger:!0}]})!=="continue")return b(l("patch.cancelled")),{ok:!1,reason:"backup-failed-user-cancelled"}}let p=`<!DOCTYPE html>
`+i.documentElement.outerHTML,m=await o.createWritable();await m.write(p),await m.close();let y=c>0?` / ${c} failed`:"",h=f?` \xB7 backup ${f}`:"";return b(l("patch.success",{file:t.name,applied:s,failedSuffix:y,backupSuffix:h})),d.length&&console.warn("[fbw] failures:",d),{ok:!0,applied:s,failed:c,failures:d,backupName:f,fileName:t.name}}function ht(){let e=document.querySelector("deck-stage");if(!e||!e.shadowRoot){setTimeout(ht,80);return}let o=e.shadowRoot.querySelector(".overlay");if(!o){setTimeout(ht,80);return}if(o.querySelector("[data-fbw-btn]"))return;let t=o.querySelector(".reset"),n=document.createElement("span");n.className="divider";let a=document.createElement("button");a.className="btn",a.dataset.fbwBtn="edit",a.type="button",a.dataset.tooltip=l("overlay.edit"),a.setAttribute("aria-label",l("overlay.edit")),a.innerHTML=Ye.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"'),a.addEventListener("click",u=>{u.stopPropagation(),ye()});let i=document.createElement("button");i.className="btn",i.dataset.fbwBtn="save-edit",i.type="button",i.dataset.tooltip=l("overlay.save"),i.setAttribute("aria-label",l("overlay.save")),i.innerHTML=Kt.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"')+'<span class="fbw-edit-count">0</span>',i.addEventListener("click",u=>{u.stopPropagation(),ta()}),i.addEventListener("contextmenu",async u=>{u.preventDefault(),u.stopPropagation(),await ea(),b(l("patch.dirCleared"))}),r.saveEditBtn=i;let s=document.createElement("span");s.className="divider";let c=document.createElement("button");c.className="btn",c.dataset.fbwBtn="feedback",c.type="button",c.dataset.tooltip=l("overlay.feedback"),c.setAttribute("aria-label",l("overlay.feedback")),c.innerHTML=X.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"'),c.addEventListener("click",u=>{u.stopPropagation(),Be()});let d=document.createElement("span");d.className="divider";let f=document.createElement("button");f.className="btn",f.dataset.fbwBtn="marquee",f.type="button",f.dataset.tooltip=l("overlay.marquee"),f.setAttribute("aria-label",l("overlay.marquee")),f.innerHTML=Ke.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"'),f.addEventListener("click",u=>{u.stopPropagation(),he()}),r.marqueeToggleBtn=f;let p=document.createElement("span");p.className="divider";let m=document.createElement("button");m.className="btn",m.dataset.fbwBtn="export",m.type="button",m.dataset.tooltip=l("overlay.export"),m.setAttribute("aria-label",l("overlay.export")),m.innerHTML=Ge.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"'),m.addEventListener("click",u=>{u.stopPropagation(),Ee({image:u.shiftKey},M)});let y=document.createElement("span");y.className="divider";let h=document.createElement("button");h.className="btn",h.dataset.fbwBtn="help",h.type="button",h.dataset.tooltip=l("overlay.help"),h.setAttribute("aria-label",l("overlay.help")),h.innerHTML=We.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="14" height="14"'),h.addEventListener("click",u=>{u.stopPropagation(),Ne(h)}),r.helpToggleBtn=h,t?t.after(n,a,i,s,c,d,f,p,m,y,h):o.append(n,a,i,s,c,d,f,p,m,y,h),r.editToggleBtn=a,r.fbToggleBtn=c;let g=document.createElement("style");g.textContent=`
    .btn[data-fbw-btn].fbw-active {
      color: #dc3c3c !important;
    }
  `,e.shadowRoot.appendChild(g),document.body.classList.remove("fbw-no-overlay")}function Dr(){let e=document.createElement("style");e.id="fbw-styles",e.dataset.fbwInternal="1",e.textContent=Ut,document.head.appendChild(e)}function Ir(){let e=document.createElement("div");e.className="fbw-panel",e.id="fbwPanel",e.innerHTML=$o(),r.panel=e;let o=document.createElement("div");o.className="fbw-confirm",o.innerHTML=zo(),r.confirmDialog=o;let t=document.createElement("button");t.className="fbw-fab fbw-edit-fab",t.innerHTML=Ye,t.dataset.tooltip=l("overlay.edit"),t.setAttribute("aria-label",l("overlay.edit")),r.editFab=t;let n=document.createElement("button");n.className="fbw-fab fbw-fb-fab",n.innerHTML=X,n.dataset.tooltip=l("overlay.feedback"),n.setAttribute("aria-label",l("overlay.feedback")),r.fbFab=n;let a=document.createElement("button");a.className="fbw-fab fbw-marquee-fab",a.innerHTML=Ke,a.dataset.tooltip=l("overlay.marquee"),a.setAttribute("aria-label",l("overlay.marquee")),r.marqueeFab=a;let i=document.createElement("button");i.className="fbw-fab fbw-undo-fab",i.innerHTML=co,i.dataset.tooltip=l("overlay.undo"),i.setAttribute("aria-label",l("overlay.undo")),i.style.display="none",r.undoFab=i;let s=document.createElement("button");s.className="fbw-fab fbw-redo-fab",s.innerHTML=fo,s.dataset.tooltip=l("overlay.redo"),s.setAttribute("aria-label",l("overlay.redo")),s.style.display="none",r.redoFab=s;let c=document.createElement("button");c.className="fbw-fab fbw-export-fab",c.innerHTML=Ge,c.dataset.tooltip=l("overlay.export"),c.setAttribute("aria-label",l("overlay.export")),r.exportFab=c;let d=document.createElement("button");d.className="fbw-fab fbw-help-fab",d.innerHTML=We,d.dataset.tooltip=l("overlay.help"),d.setAttribute("aria-label",l("overlay.help")),r.helpFab=d;let f=document.createElement("button");f.className="fbw-fab fbw-fold-fab",f.innerHTML=Vt,f.dataset.tooltip=l("overlay.fold"),f.setAttribute("aria-label",l("overlay.fold")),r.foldFab=f;let p=document.createElement("div");p.className="fbw-help-popover",r.helpPopover=p;let m=document.createElement("div");m.className="fbw-elem-toolbar",m.innerHTML=Ro(),r.elemToolbar=m;let y=document.createElement("div");y.className="fbw-font-picker",r.fontPicker=y;let h=document.createElement("div");h.className="fbw-note-popover",h.innerHTML=Do(),r.notePopover=h;let g=document.createElement("div");g.className="fbw-marker-popover",r.markerPopover=g,r.resizeHandles=Xo();let u=an();r.tagPopover=u;let w=document.createElement("div");w.className="fbw-fab-bar",w.appendChild(t),w.appendChild(n),w.appendChild(a),w.appendChild(c),w.appendChild(i),w.appendChild(s);let C=document.createElement("span");C.className="fbw-fab-divider",w.appendChild(C),w.appendChild(d);let x=document.createElement("span");x.className="fbw-fab-divider fbw-fab-divider-2",w.appendChild(x),w.appendChild(f),r.fabBar=w,document.body.appendChild(e),document.body.appendChild(o),document.body.appendChild(w),document.body.appendChild(p),document.body.appendChild(m),document.body.appendChild(y),document.body.appendChild(h),document.body.appendChild(g),document.body.appendChild(u),document.body.appendChild(r.resizeHandles)}function _r(){let e=!1,o=t=>t.target.dataset?.fbwEditId||t.target.matches&&t.target.matches("textarea, input")||t.target.closest&&t.target.closest(".fbw-panel, .fbw-confirm");document.addEventListener("keydown",t=>{if(!o(t)){if(t.key===" "){e=!0;return}if(e&&(t.key==="p"||t.key==="P")&&!t.shiftKey){t.preventDefault(),Ee({image:!1},M);return}if(t.shiftKey&&(t.key==="P"||t.key==="p")){t.preventDefault(),Ee({image:!0},M);return}if((t.metaKey||t.ctrlKey)&&!t.shiftKey&&(t.key==="s"||t.key==="S")){t.preventDefault(),r.panel?.querySelector('[data-fbw-action="save"]')?.click();return}if((t.metaKey||t.ctrlKey)&&!t.shiftKey&&(t.key==="z"||t.key==="Z")){t.preventDefault(),Oe();return}if((t.metaKey||t.ctrlKey)&&t.shiftKey&&(t.key==="z"||t.key==="Z")||(t.metaKey||t.ctrlKey)&&!t.shiftKey&&(t.key==="y"||t.key==="Y")){t.preventDefault(),Tt();return}if((t.metaKey||t.ctrlKey)&&!t.shiftKey&&(t.key==="c"||t.key==="C")){if(window.getSelection?.()?.toString()||!r.selectedEl)return;t.preventDefault(),Mn();return}if((t.metaKey||t.ctrlKey)&&!t.shiftKey&&(t.key==="m"||t.key==="M")){t.preventDefault(),r.panel?.querySelector('[data-fbw-action="copy"]')?.click();return}t.ctrlKey||t.metaKey||t.altKey||e||(t.key==="e"||t.key==="E"?(t.preventDefault(),ye()):t.key==="f"||t.key==="F"?(t.preventDefault(),Be()):t.key==="m"||t.key==="M"?(t.preventDefault(),he()):t.key==="a"||t.key==="A"?(t.preventDefault(),An()):t.key==="?"?(t.preventDefault(),Ne()):(t.key==="Delete"||t.key==="Backspace")&&r.selectedEl&&r.editMode&&(t.preventDefault(),r.elemToolbar?.querySelector('[data-op="delete"]')?.click()))}}),document.addEventListener("keyup",t=>{t.key===" "&&(e=!1),t.key==="Alt"&&(document.body.classList.remove("fbw-measuring"),ne())}),window.addEventListener("blur",()=>{e=!1,document.body.classList.remove("fbw-measuring"),ne()}),document.addEventListener("mousemove",t=>{if(!t.altKey||!r.selectedEl){document.body.classList.contains("fbw-measuring")&&(document.body.classList.remove("fbw-measuring"),ne());return}document.body.classList.add("fbw-measuring");let n=t.target;if(!n||n.closest(".fbw-panel, .fbw-fab, .fbw-fab-bar, .fbw-elem-toolbar, .fbw-confirm, .fbw-toast, .fbw-tooltip, .fbw-anno, .fbw-resize-handles, .fbw-measure-overlay, .fbw-help-popover, .fbw-note-popover, .fbw-marker-popover, .fbw-font-picker, .fbw-tag-popover")){ne();return}if(n===r.selectedEl||r.selectedEl.contains(n)){ne();return}On(n)},!0)}function _t(){r.undoFab&&(r.undoFab.style.display=Ho()?"inline-flex":"none"),r.redoFab&&(r.redoFab.style.display=jo()?"inline-flex":"none")}function qr(){r.editFab.addEventListener("click",()=>{if(document.body.classList.contains("fbw-fab-collapsed")){oa(!1),r.editMode||ye();return}ye()}),r.exportFab.addEventListener("click",e=>Ee({image:e.shiftKey},M)),r.marqueeFab.addEventListener("click",he),r.undoFab.addEventListener("click",e=>{e.stopPropagation(),Oe(),_t()}),r.redoFab.addEventListener("click",e=>{e.stopPropagation(),Tt(),_t()}),r.helpFab.addEventListener("click",e=>{e.stopPropagation(),Ne()}),r.foldFab.addEventListener("click",e=>{e.stopPropagation(),oa(!0)})}var qt="fbw-fab-collapsed::"+(location.pathname||"/").slice(0,200);function oa(e){document.body.classList.toggle("fbw-fab-collapsed",e);try{e?localStorage.setItem(qt,"1"):localStorage.removeItem(qt)}catch{}}function Br(){try{localStorage.getItem(qt)==="1"&&document.body.classList.add("fbw-fab-collapsed")}catch{}}function Hr(){let e=null;fe(()=>{document.body.classList.add("fbw-scrolling"),e&&clearTimeout(e),e=setTimeout(()=>{document.body.classList.remove("fbw-scrolling")},800)});let o=220,t=260,n=-1,a=-1,i=0;window.addEventListener("mousemove",s=>{n=s.clientX,a=s.clientY,!i&&(i=requestAnimationFrame(()=>{i=0;let c=window.innerWidth-n<o&&window.innerHeight-a<t;document.body.classList.toggle("fbw-mouse-near-fab",c)}))},{passive:!0})}var na=null;function aa(){if(!r.fabBar)return;let e=r.fabBar.getBoundingClientRect(),o=e.left+e.width/2,t=e.top+e.height/2,n=r.fabBar.style.pointerEvents;r.fabBar.style.pointerEvents="none";let a=document.elementFromPoint(o,t)||document.body;r.fabBar.style.pointerEvents=n,a.closest&&a.closest(".fbw-panel, .fbw-tooltip, .fbw-toast, .fbw-confirm, .fbw-elem-toolbar, .fbw-resize-handles, .fbw-note-popover, .fbw-font-picker, .fbw-marker-popover, .fbw-help-popover, .fbw-anno")&&(a=document.body);let i=null,s=a;for(;s&&s!==document.documentElement;){let f=window.getComputedStyle(s).backgroundColor,p=f&&f.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(p&&(p[4]!==void 0?parseFloat(p[4]):1)>.5){i={r:+p[1],g:+p[2],b:+p[3]};break}s=s.parentElement}if(!i){let p=window.getComputedStyle(document.documentElement).backgroundColor.match(/\d+/g);i=p?{r:+p[0],g:+p[1],b:+p[2]}:{r:255,g:255,b:255}}let d=.299*i.r+.587*i.g+.114*i.b<140;na!==d&&(na=d,document.body.classList.toggle("fbw-dark-bg",d))}function jr(){let e=null,o=()=>{e&&clearTimeout(e),e=setTimeout(aa,250)};setTimeout(aa,80),fe(o),re(o)}function ra(){return document.querySelector("deck-stage")?"deck":document.querySelectorAll(q).length>0?"doc":"review"}function ia(){let e=r.panel?.querySelector(".fbw-mode-chip");e&&(e.textContent=l("mode.chip."+(r.appMode||"doc")))}function Ur(){let e=()=>{let o=ra();o!==r.appMode&&(document.body.classList.remove("fbw-mode-"+r.appMode),document.body.classList.add("fbw-mode-"+o),ae("appMode changed:",r.appMode,"\u2192",o),r.appMode=o,ia())};window.addEventListener("popstate",e),["pushState","replaceState"].forEach(o=>{let t=history[o];t.__fbwPatched||(history[o]=function(...n){let a=t.apply(this,n);return setTimeout(e,0),a},history[o].__fbwPatched=!0)})}function Bt(){ae("init start"),Dr(),Ir(),r.appMode=ra(),document.body.classList.add("fbw-mode-"+r.appMode),ae("appMode:",r.appMode),ia(),Ur();let e=xo();Cn(),Rn(),xn(),yn(),Qo(),Mo(),Wo(),on(),sn(),wn(),_n(),Zn(),qn(e),hn(),_r(),r.onChangeHook=()=>{Nn(),_t()},qr(),Hr(),jr(),Po(),Oo(),Br(),document.querySelector("deck-stage")?ht():document.body.classList.add("fbw-no-overlay"),ko(),te(),Lt(),F(k),gn().catch(o=>ae("rehydrate failed:",o)),ae("init done")}(function(){typeof window>"u"||window.__feedbackWidgetLoaded||(window.__feedbackWidgetLoaded=!0,window.__feedbackWidgetVersion=Le,ae(`redline v${Le} loaded \xB7 \u5173\u95ED\u65E5\u5FD7: window.__fbwDebug = false`),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Bt):Bt())})();})();
