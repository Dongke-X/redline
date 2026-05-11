# redline · CHANGELOG

skill 版本同步源：`package.json` → 由 `scripts/sync-version.mjs` 自动写到 SKILL.md frontmatter / config.js / extension/manifest.json。

格式：[Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/)

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
