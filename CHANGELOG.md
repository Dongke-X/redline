# redline · CHANGELOG

skill 版本同步源：`package.json` → 由 `scripts/sync-version.mjs` 自动写到 SKILL.md frontmatter / config.js / extension/manifest.json。

格式：[Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/)

---

## 0.1.9 — 2026-05-12  ·  面板质感 visual pass

### Changed
- **面板暖深底**：从冷灰 `rgba(20,22,28)` 切到暖深 `rgba(28,25,22)`，跟 redline landing 的米色基调呼应；阴影叠加 inset 顶光，浮起感更强
- **保存反馈 = 真正的 primary**：品牌红线性渐变填充 + 内阴影 + hover 红光晕。和「复制反馈」(ghost) 主次终于看得出来
- **Pill 0 自动淡化**：count=0 时 opacity 0.45 + 灰底；有数才变成红底 + 红字加粗。看一眼就知道哪几项有改动
- **textarea focus 改红环**：从灰边切到品牌红边 + 红色 outer glow（`box-shadow 0 0 0 3px rgba(220,60,60,0.10)`）
- **FAB 激活态加红底**：原来只换图标色，跟 hover 灰底容易混。现在 active 是红半透底 + 红 inset 描边，跟 hover 拉开距离
- **mode chip 走 monospace**：小号大写字母 + 字距加宽，看着像 status tag 而不是装饰

---

## 0.1.8 — 2026-05-12  ·  审计上色 + Tag hover 预览 + 文字编辑入栈

### Changed
- **审计模式按 op 类型上色**：delete 红 / hide 灰 / tag 紫 / replace-img 青 / font 蓝 / highlight 黄 / scale·rotate·move 绿 / href 靛 / text-only 橙。角标背景色一并跟上。优先级排序：破坏性高的 op 优先标色
- **标签切换 hover 预览**：H 按钮打开 popover 后，鼠标 hover P/H1-H6 任一项 → 元素实时变样式（不进 op 栈、不 pushUndo）。点击才提交；鼠标离开 popover 自动还原到打开前的状态

### Added
- **文字编辑也入撤销栈**：双击元素进入文字编辑模式时 pushUndo 一次，捕获编辑前的 textContent。退出编辑后按 ⌘+Z（contentEditable 外）能回到编辑前的文字。代价：仅保留 textContent，撤销会丢失内部行内格式（`<strong>` 等）

---

## 0.1.7 — 2026-05-12  ·  Gmail 风格 Undo toast

### Added
- 每次有 op（delete / hide / restore / link / replace-img / font / highlight / tag）落地后，toast 旁出现「撤销」按钮，4 秒内可点。比记快捷键好用，也让用户知道有撤销栈
- 同时只显示一个 toast：新 toast 一来旧的立刻撤掉，避免老 toast 的撤销按钮残留导致误点

---

## 0.1.6 — 2026-05-11  ·  Cmd+C 描述符 + A 审计模式

### Added
- **⌘+C 复制元素描述符**：选中元素时按 ⌘+C（页面没有真实文字选区为前提）把元素的「区域 · 标签 · 内容样本 + 源 selector」复制到剪贴板，方便回到 Claude 聊天框粘"我说的是这个"。有文字选区时让位给浏览器原生复制
- **A 键审计模式**：按 A 切换 audit mode，所有改过的元素描红框 + 右上角 op 数量小红点；文字编辑改动用橙色描边区分。再按 A 关掉。截屏/打印时自动隐藏

---

## 0.1.5 — 2026-05-11  ·  撤销栈 + H1-H6 全套

### Added
- **撤销 / 重做**：`⌘+Z` 撤销最近一次操作，`⌘+Shift+Z` / `Ctrl+Y` 重做。栈深 50，对 tag / scale / rotate / move / hide / delete / highlight / font / replace-img / href 都生效。文字编辑由 contentEditable 原生 undo 处理（redline 在 contentEditable 内不抢 Cmd+Z）
- 标签切换扩展到 **H5 / H6**（之前只到 H4）

### 已知限制
- 范围高亮（划词后插入 `<span class="fbw-hl">` 的那种）撤销后样式恢复了但 span 节点会残留，需要用马克笔 popover 的「清除」按一下

---

## 0.1.4 — 2026-05-11  ·  标签切换 + 拖动读数

### Added
- **标签切换**：选中 `<p>` / `<h1>-<h6>` 时工具栏出现 H 按钮，弹出 P / H1-H4 选项，点了立刻能看到视觉变化。`tag` op 写进 schema，`apply.mjs` 在源 HTML 真把 tag 替换掉（带 drift 检测）。实现策略：live DOM 加 `data-fbw-tag-as` 属性 + CSS 预览，不动真实 tag，保住 selector / element ref 不破
- **拖动读数**：scale/rotate 拖动时光标旁显示「1.20× / 36°」，常用刻度（0.5/1/1.5/2× · 0/45/90°）显示 ✓ 提示并在松手时自动吸附

---

## 0.1.3 — 2026-05-11  ·  工具栏面包屑

### Added
- 元素工具栏左侧加上下文标签，显示「区域 · 标签 (位置)」，比如「场景 · p (2/3)」—— 在长文档里点段落不再迷路。区域名按 `data-screen-label` → `aria-label` → 第一个 heading → `#id` → `.class` 顺序兜底

---

## 0.1.2 — 2026-05-11  ·  appMode 兼容公众号排版稿

### Fixed
- wenyan / wechat-publisher 生成的 HTML（`<body><div id="preview"><section data-provider="WenYan">`）被识别成 `review` 模式，导致双击不能进入文字编辑。`SECTION_SELECTORS` 增加 `section[data-provider]` 匹配，让这类生成器输出进 `doc` 模式

---

## 0.1.1 — 2026-05-11  ·  PDF 导出修复

### Fixed
- 长截图 PDF 在非 deck/slide 页面（普通 landing / 长文档）报「没找到 slide」直接退出 —— 现在 fallback 抓整页生成一张超长单页 PDF（超过 PDF 14400px 单页上限才自动切片）
- 长截图 / 视口截屏把 redline 自身 UI（FAB、toast、面板）拍进图片：补上 `body.fbw-printing` 维度的隐藏规则，原来只在 `@media print` 下生效
- 矢量 PDF 在 A4 portrait 下触发 880px 断点导致多列卡片被强压成单列、整张卡撑满一页留大白：`@media print` 强制恢复多列网格 + 补全 `.preview-card` 等卡片的 `break-inside: avoid`

### Changed
- `docs/zh.html` 打印样式：收紧卡片 padding / 字号，避免 portrait 单卡超页；`.hero-mockup` 打印时 `scale(.85)`

---

## 0.1.0 — 2026-05-10  ·  首次公开发布 (Public release)

> 版本号重置：v2.7.x（私有迭代）→ v0.1.0（公开首发）。
> 早期 0.x 阶段允许 minor bump 包含 breaking change，1.0 后遵守 SemVer。

### Added
- Chrome MV3 扩展上架准备：popup / options / i18n（en + zh_CN）/ 真品牌 logo
- ZIP 下载通道（无依赖 store-mode zip 编码器，含 session.json + .md + 图片附件）
- `chrome.storage` 用户偏好：默认保存方式（zip / fs-access）
- 着陆页 + 隐私政策 HTML（`docs/index.html` / `docs/PRIVACY.html`），中英双版
- 上架文档：`PRIVACY.md` / `STORE_LISTING.md` / `SUBMISSION_CHECKLIST.md`

### Fixed
- 区域标注 note 输入框透明度过高导致的"输入文字跟杂乱背景混叠不可读"

### Changed
- README / extension / skill 全面切换为公开发布定位（agent → HTML feedback 闭环）

---

## 2.6.1 — 2026-05-10

### Performance
- 全局 mousemove / mouseup 监听合并到 `src/utils/events.js` 单一 dispatcher
- document 上 mousemove 4→1，mouseup 4→1
- bundle 150.2kb（持平）

## 2.6.0 — 2026-05-10

### Added
- IndexedDB blobs store（`fs/idb.js` 升 v2）
- attachments blob 走 IDB，localStorage 只存 metadata
- 启动时 `rehydrateAttachments` 异步从 IDB 拉回 dataURL

### Changed
- saveState 不再写 attachment dataURL（base64 膨胀 33% → 0）
- quota 降级路径只剥离 annotations.image.dataURL

## 2.5.2 — 2026-05-10

### Security
- 全仓敏感信息扫描（无 API key / token / 内网 IP）
- schema/session.v1.example.json 路径占位化

### Performance
- 折叠态 FAB 去 backdrop-filter（视觉无变化，省 GPU）
- FAB pill blur 24→16 + will-change: opacity, transform
- FAB 鼠标位置检测 mousemove 加 rAF 节流

## 2.5.1 — 2026-05-10

### Performance
- 新增 `src/utils/events.js` 全局事件总线
- scroll 5→1，resize 4→1（合并到单一 native listener）

## 2.5.0 — 2026-05-10

### Performance
- esbuild `--minify` 默认开启：207.9kb → 149.2kb (-28%)
- registerEditableElements 叶子扫描改 TreeWalker：DOM 大时 200ms → 20ms
- detectBgUnderFab 改 elementFromPoint 单点 + 缓存
- pruneStaleElementOps：getChanges 时清理离开 DOM 的元素引用
- 新增 build:dev / watch 带 sourcemap 模式

## 2.4.4 — 2026-05-10

### Added
- `src/types.js` 中央 JSDoc 类型定义
- `jsconfig.json` checkJs 让 VS Code 走 IDE 类型检查
- state.js 字段加 @type，按职责分组

## 2.4.3 — 2026-05-10

### Added
- vitest + happy-dom 测试工程
- 17 个 critical-path test（markdown / persist / sessionWriter / elements）
- npm test / npm run test:watch

## 2.4.2 — 2026-05-09

### Added
- `scripts/sync-version.mjs`：package.json → manifest.json + config.js 自动同步
- session.json 加 env metadata（userAgent / locale / viewport / timezone）
- SPA 路由切换重评估 appMode（popstate + pushState/replaceState 监听）

### Security
- markdown.js: escapeFence + escapeLeading 防止用户内容注入

## 2.4.1 — 2026-05-09

### Fixed (P0)
- marquee anno 拖动事件监听器内存泄漏（per-anno 改模块单例）
- localStorage quota silent fail → 显式 toast + 降级写
- html2canvas / jspdf CDN script 加 SRI integrity hash

### Performance
- 截图 PNG → JPEG 0.85，体积 4-8x 减小

## 2.4.0 — 2026-05-09

### Added
- 三模式探测：deck / doc / review
- review 模式专属：隐藏换字体/换图，元素操作打 `proposed: true`
- 视口截屏（panel 📷 按钮）
- URL-keyed 反馈恢复 toast

## 2.2.0 — 2026-05-09

### Added
- Chrome MV3 扩展骨架（`extension/`）
- background.js 注入 / toggle 面板
- 红线 R 图标

## 2.1.0 — 2026-05-09

### Changed
- 重命名 feedback-widget → redline（公开面）
- 内部 fbw-* 类前缀保留

## 2.0.6 — 2026-05-09

### Added
- 初始 release：编辑模式 / 框选标注 / 反馈面板 / PDF 导出 / FS Access 写盘 / SKILL.md / apply-feedback.mjs
- session.v1 协议 + JSON schema
- 中英 i18n
