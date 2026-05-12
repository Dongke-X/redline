# redline · CHANGELOG

skill 版本同步源：`package.json` → 由 `scripts/sync-version.mjs` 自动写到 SKILL.md frontmatter / config.js / extension/manifest.json。

格式：[Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/)

---

## 0.1.49 — 2026-05-12  ·  语言切换 badge 化

### Changed
- README 顶部语言切换从文字链 `**Languages:** English · 简体中文` 改成 shields.io badge：
  - 当前语言：项目红 `#c8242c` 高亮
  - 对方语言：灰色 `#555`
- 视觉上像 tab 切换，跟很多 i18n 网站一致；底层仍是跳页（GitHub README 静态 markdown 限制，没法做"真同页切换"）

---

## 0.1.48 — 2026-05-12  ·  README 配图 P1（版本链 + Selector 兜底）

### Added
- `docs/images/version-chain.jpg` — HTML 版本链可视化：deck-v1 → v2 → v3，parentRevisionId 串联，每版 exporter 不同。放在 "HTML transport" / "HTML 转交" 段
- `docs/images/selector-fallback.jpg` — Selector 四层兜底流程图：id → fbId → cssPath → contentHash → skip。放在 "How the skill resolves selectors" / "Skill 怎么定位元素" 段
- 中英两版 README 同步插入（两张图技术术语为主，无需双语版本）

---

## 0.1.47 — 2026-05-12  ·  README 配图（6 张手绘）

### Added
`docs/images/` 加 6 张 Excalidraw 风格手绘配图：

| 文件 | 位置 |
|---|---|
| `banner.jpg` | README 顶部 wordmark（中英共用） |
| `hero.jpg` | "What is this" 闭环图（中英共用） |
| `browser-canvas.en.jpg` / `.zh.jpg` | "What's in the browser" / "浏览器里都能干什么" |
| `modes.en.jpg` / `.zh.jpg` | "Three core scenarios" / "三个核心场景" |

每张 JPEG @ 88% 质量，单图 ~310KB，总计 ~1.9MB（GitHub 加载友好）。

### Changed
- README.md / README.zh.md 在对应段插入图片引用
- ASCII workflow 图删除（Hero 图取代）

---

## 0.1.46 — 2026-05-12  ·  品牌 + 文档同步 · `redline.html`

### Changed
- README 标题统一为 `redline.html`（wordmark 风格），表达"redline 给 HTML 用"。repo 名 / 包名 / 扩展名都保持 `redline` 不动
- README 重写「What is this」段：从"3 件东西打包"改为"捕获 / 传输 / 闭环"三段式，明确 3 种导出格式（HTML / PDF / ZIP）的适用场景
- README + README.zh.md 加新段 `HTML transport / HTML 转交`，介绍 v0.1.36+ 的 HTML 单文件导出能力（版本链 / WebP 压缩 / receiver UX）
- 修 badge：version 0.1.0 → 0.1.46，tests 17 → 18，bundle 153kb → 238kb（README + README.zh）
- skill/SKILL.md 加段「HTML 导出：另一条不经 skill 的路」—— 告诉 agent 何时建议用户走 HTML / PDF / ZIP 三条路
- skill/README.md 快捷键表补全：A / O / M / ⌘C / ⌘M / Del / ? / Space+H / ⇧+H
- skill/CHANGELOG.md 清理旧 2.x 历史（widget 早期内部编号），统一到 0.1.x

### Chore
- 各文件 `153kb` / `153KB` 残留引用全部更新到 `238kb`

---

## 0.1.45 — 2026-05-12  ·  折叠 tooltip 收短

### Fixed
- 折叠 FAB 在最右侧，tooltip 被挤换行成 3 行。ZH 第二行 `点编辑 FAB 可重新展开` 收短为 `点编辑展开`

---

## 0.1.44 — 2026-05-12  ·  所有 FAB tooltip 统一两行排版

### Changed
全部 `overlay.*` tooltip 用统一模板：第一行 `名称（快捷键）`，第二行简短说明。
中英都改：

| key | 行 1 | 行 2 |
|---|---|---|
| edit | 编辑模式 (E) | 双击元素直接改文字 / 颜色 / 尺寸 |
| feedback | 反馈面板 (F) | 写反馈 · 截图 · 附件 |
| pick | 取色器 | 点页面任意位置取色 · hex 入剪贴板 + 反馈框 |
| undo | 撤销 (⌘Z) | 回滚最近一次操作 |
| redo | 重做 (⌘⇧Z) | 恢复被撤销的操作 |
| save | 保存编辑 | 改动写回源 HTML · 自动备份 · 右键重选目录 |
| marquee | 框选标注 (M) | 拖一个框 → 写文字 / 加图片 |
| help | 快捷键 / 帮助 (?) | 查所有快捷键 |
| fold | 折叠工具条 | 点编辑 FAB 可重新展开 |

`overlay.export` / `overlay.compare` 已在 v0.1.42 / v0.1.43 改完。

---

## 0.1.43 — 2026-05-12  ·  前后对比 tooltip 也改两行

### Changed
- `overlay.compare` 中英都改两行：
  - ZH：`前后对比 (O)` / `切换看原稿 / 看改后`
  - EN：`Before / after (O)` / `Toggle original vs edited`

---

## 0.1.42 — 2026-05-12  ·  导出 tooltip 强制两行

### Changed
- 导出 FAB tooltip 改成两行排版，PDF / HTML 各占一行：
  - ZH：`导出 PDF（矢量 / 长图）` / `导出 HTML（预览 / 编辑）`
  - EN：`Export PDF (vector / long-image)` / `Export HTML (preview / edit)`
- CSS：`white-space: normal` → `pre-line`，i18n 字符串里的 `\n` 渲染成真换行

---

## 0.1.41 — 2026-05-12  ·  tooltip 自适应换行

### Fixed
- 长 tooltip（如英文「Export PDF (vector / long-image) · HTML (preview / edit)」）右侧被屏幕裁掉
- 根因：CSS 里 `white-space: nowrap` 跟 `max-width: 320px` 同时存在，nowrap 赢，max-width 失效
- 改为 `white-space: normal` + `overflow-wrap: anywhere`，长文案自动换行
- `max-width: min(360px, 100vw - 24px)` 视口窄时自动收

---

## 0.1.40 — 2026-05-12  ·  快捷键面板左右平衡

### Changed
- 拆 `操作` 组为两组：`选区`（Esc / Del / ⌘+C 复制描述符）+ `反馈 / 历史`（⌘+S 保存 / ⌘+M 复制 / ⌘+Z 撤销 / ⌘+⇧+Z 重做）
- 左右两列现在都是 3 个组，视觉对齐
- 组间距 10px → 14px，行间距 3px → 4px，整体更呼吸

---

## 0.1.39 — 2026-05-12  ·  .gitignore zip · 导出措辞

### Changed
- 导出 FAB tooltip：`导出 PDF / HTML` → `导出 PDF（矢量 / 长图）· HTML（预览 / 编辑）`
- ZH 菜单项措辞统一：`可编辑 HTML` → `编辑 HTML`，`只读 HTML` → `预览 HTML`（更友好 / 更短）
- EN 保留 `Editable` / `Read-only`（英文不需要改）

### Chore
- `.gitignore` 加 `redline-extension-v*.zip` 排除规则
- 把已 track 的 39 个旧版本 zip 从 git 移除（`git rm --cached`，本地文件保留）

---

## 0.1.38 — 2026-05-12  ·  导出菜单显示快捷键 chip

### Added
- 导出菜单每一项右侧加 monospace 快捷键 chip：`Space+P` / `⇧+P` / `Space+H` / `⇧+H`
- hover 时 chip 强调（背景 + 边框加深）

---

## 0.1.37 — 2026-05-12  ·  HTML 导出快捷键

### Added
- `Space + H` = 导出可编辑 HTML（跟 `Space + P` 矢量 PDF 对称）
- `Shift + H` = 导出只读 HTML（跟 `Shift + P` 长图 PDF 对称）
- 快捷指令面板「导出」组补上两行

---

## 0.1.36 — 2026-05-12  ·  砍 PPT · 接收方 UX · 体积优化 · 版本链

### Removed
- **PPT (.pptx) 导出**：上版刚加完，这版砍掉。理由：导出是图片不可编辑，"演示场景"用「只读 HTML + F11 全屏」就解决了，PPT 没有独占价值；600KB CDN 依赖 + html2canvas 排版偏差不值得维护。导出矩阵收敛到 PDF（矢量/长图）+ HTML（可编辑/只读）

### Added
- **只读 HTML 加打印按钮**：接收方拿到只读 HTML 想出 PDF 时，右下角小打印按钮一键 `window.print()`；@media print 自动隐藏
- **可编辑 HTML 接收方欢迎提示（不弹模态）**：第一次打开时，编辑 FAB 呼吸光 1.6s × 2 + 浮一条 4 秒 tooltip "双击元素继续标注 · ⌘Z 撤销"；不挡操作不打断
- **HTML 体积优化**：单图 >500KB 自动转 WebP 80%（SVG/GIF 跳过），保底用原图（转出更大时回退）；平均瘦 60-80%
- **HTML 版本链**：导出元数据加 `revisionId` / `revision` / `parentRevisionId` / `exporter`（UA 摘要：Chrome/120 mac 这种），接收方再导出时 revision +1 且 parentRevisionId 指上一版，后续可做 diff
- **快捷指令面板补 Delete 行**：`Del` 删除选中元素（之前快捷键存在但 help 面板没列）

### Changed
- 导出菜单恢复 2 组：PDF（矢量 / 长图）+ HTML（可编辑 / 只读）
- `rehydrate.js` 拆出 `applyRehydrateUX()`，按 mode 分发接收方注入逻辑

---

## 0.1.35 — 2026-05-12  ·  PPT 导出

### Added
- 导出菜单新加「PowerPoint (.pptx)」选项：
  - **deck 模式**（页面有 `section.slide`）：每页 html2canvas → 塞进 pptx 一张 slide，pptx 画布按 designW × designH 设布局
  - **非 deck 模式**：整页一张图当一张 slide
  - **sectionFeedback 写进 speaker notes**：每页的页面反馈作为 PPT 的演讲备注（接收方在 PPT 里直接看到反馈，不用切窗口）
  - **全局反馈** 进单图 slide 的 notes
- pptxgenjs 走 CDN 按需加载（不进 bundle，省 600KB）；html2canvas 复用 PDF 导出已加载的实例

### 设计取舍
- 每页是图片而不是结构化 slide → 拿到 PPT 里不能直接改文字。理由：HTML 流式布局没法 1:1 转 PPT 的「画布贴框」模型，强行转排版必废
- 反馈走 speaker notes 而不是 slide 内 → 演示时听众看不到反馈，但讲者能看；适合「给老板讲，反馈作为脚注」场景

---

## 0.1.34 — 2026-05-12  ·  Single-file 导出再修：直接 stash 源码字符串

### Fixed
- v0.1.33 还是失败：MAIN world 里 fetch `chrome-extension://...` 可能被 CSP / CORS 拦
- 改成在 background 端 fetch bundle 源码（service worker 上下文，权限最全），把**完整字符串** stash 到 `window.__fbwBundleSource`
- singlefile 直接读 `window.__fbwBundleSource`，不再走 fetch；source 字符串就在那，绕掉所有网络层麻烦

### 简化掉的 + tooltip 简化
- 也把 export FAB tooltip 从「导出 · PDF / HTML（Shift+点击 = 直接长图 PDF）」缩成「导出 PDF / HTML」，Shift+click 的提示在菜单内体现就够了

---

## 0.1.33 — 2026-05-12  ·  修 single-file 导出"redline.js not found"

### Fixed
- v0.1.31 没考虑扩展用 MAIN world 注入：bundle 在 page 全局跑，`chrome.runtime` 拿不到，导致 `getBundleText` 三条路径全 miss
- background.js 在注入 bundle 之前先 stash `window.__fbwBundleURL = chrome.runtime.getURL('redline.js')` 到 page，bundle 自己 fetch 这个 URL 就能拿到自己源码（web_accessible_resources 已允许）

### 不影响场景
- skill 注入（prepare.mjs --copy）走 `<script src>` 形式，原 fallback 仍然有效
- skill --inline 注入走 inline marker fallback

---

## 0.1.32 — 2026-05-12  ·  导出菜单：PDF + HTML 一处选

### Changed
- **Single-file HTML 入口从反馈面板挪到 FAB 导出按钮**：反馈面板留给「跟 agent 的交互」语义，「发给人看」的导出动作（PDF / HTML）都聚到导出 FAB
- 点导出 FAB → 弹一个 4 选项小菜单：
  - **PDF · 矢量** —— 可缩放、链接保留
  - **PDF · 长图** —— 整页一张超长图
  - **HTML · 可编辑** —— 接收方双击就能继续标
  - **HTML · 只读** —— 给客户演示，编辑入口锁
- 兼容旧 muscle memory：**Shift+点击** 导出 FAB 直接出长图 PDF，不弹菜单
- deck 模式 overlay 的导出按钮同步走菜单逻辑

---

## 0.1.31 — 2026-05-12  ·  Single-file HTML 导出 + readonly 模式

### Added
- **Single-file HTML 导出**：反馈面板 header 多一个下载图标按钮，点一下打包整页：
  - 资源 inline：所有 `<img>` / `<link rel="stylesheet">` / CSS 内 `url()` / `@font-face` 全部 base64 化（跨域 CORS 拒绝的留原 URL）
  - State 序列化：annotations / elementOps / sectionFeedback / attachments / 文字编辑 / originals / originalsHTML / 全局反馈 全部 dump 到 `<script type="application/json" data-fbw-state>`
  - Bundle 内嵌：把 redline.js 整个 inline 进 `<script>`，接收方双击 .html 就完整启动一份 redline
- **接力体验**：接收方打开后 = 完整 redline 工作台，能在你标的基础上继续标、改、再导出一份给下一个人
- **只读模式**：Shift+点击导出按钮 → 接收方拿到的 HTML 里 redline UI 锁定：FAB bar / 元素工具栏 / 编辑相关 popover 全隐藏，但 view 工具（前后对比 / 审计模式 / 帮助）保留 → 适合给客户演示
- **接收方启动流程**：`detectRehydrate` 在 `registerEditableElements` 之前跑，把 state 灌回去；register 看到已有 `data-fbw-edit-id` 跳过，不会重复发 ID

### 实现细节
- 资源 inline 走 `fetchAsDataURL`，递归处理 CSS 里的 `url()` 引用
- redline bundle 来源：扩展走 `chrome.runtime.getURL('redline.js')`；skill 注入走现有 `<script src>`；其他兜底找带 `__feedbackWidgetVersion` marker 的内联 script
- `state.readOnly` 触发 `body.fbw-readonly`，CSS 一键禁用编辑入口

---

## 0.1.30 — 2026-05-12  ·  ? 收到 header 标题旁

### Changed
- 「显示 / 隐藏帮助」缩成「显示帮助」（EN：「Toggle help」→「Show help」），不再折行
- 把 `?` 这个单条目从「其他」分组挪到 header 标题旁边：小 chip 带描边，hover tooltip 显示「显示帮助」
- 「其他」分组整段删掉 —— 一行内容不值得占一个 group。整个面板少一行 + 少一个 group label，视觉重心稳得多

---

## 0.1.29 — 2026-05-12  ·  鼠标手势中文化 + 长 label 不再被截

### Fixed
- 鼠标手势行原来显示 `Alt+hover` / `⇧+click` / `drag`，普通用户看不懂——「hover 是什么键？」。现在中文 locale 下显示 `Alt+悬停` / `⇧+点击` / `拖拽`，跟键盘组合的视觉区分但语义清楚
- 长 label（「框选可编辑元素」「显示 / 隐藏帮助」）被裁掉：之前 `.fbw-help-row` 上有 `white-space: nowrap !important` 强制单行，撑爆 popover 也不让步。现在 nowrap 只锁在 keys 列（`⌘+⇧+Z` 拆开就废了），label 列允许换行 + `overflow-wrap: anywhere`，窄面板下折两行也比被截好
- keys 列宽 78 → 86px，留出空间给「Alt+悬停」「Space+P」这种偏长的 key 组合

---

## 0.1.28 — 2026-05-12  ·  快捷键面板紧凑化 + 关闭按钮

### Changed
- **整体收紧**：popover padding 14/18 → 12/14；组间距 14 → 10；行间距 5 → 3；列间距 18 → 14；列内 keys slot 90 → 78px
- **标题加大**：从 9.5px mono uppercase → 13.5px 普通 sans bold，"SHORTCUTS" 那种装饰感太弱了，现在是清晰的「快捷键」section header
- **加 X 关闭按钮**：标题右侧，hover 灰底，跟反馈面板 close 一致
- **自适应**：popover `max-width: 92vw`，列 `min-width: 160 → 140`，避免在窄视口下被撑出屏幕

---

## 0.1.27 — 2026-05-12  ·  快捷键面板文本化

### Changed
- 之前每个 kbd 画成"按键样"小框，长度参差不齐导致 label 起始 x 跳来跳去，视觉很散
- 现在 kbd 全文本化：monospace 字体，组合用 `+` 连接，比如「⌘+S」「⌘+⇧+Z」「Alt+hover」「⇧+click」
- Shift 自动转 `⇧` 字符，其他特殊键（Esc / Alt / hover / click / drag）保留单词
- 90px keys 列 + 12px gap + label 列，整列对齐，"文档化"产品质感

---

## 0.1.26 — 2026-05-12  ·  快捷键面板分组重排

### Changed
- 之前左列堆 11 项、右列 3 项极度失衡。重新拆成 5 个语义组：
  - 左：模式 (3) + 操作 (6) = 9
  - 右：视图 (A 审计 / O 对比) + 鼠标手势 (Alt hover / Shift click / drag) + 导出 (Space P / Shift P) + 其他 (?) = 8
- 标签全面缩短：「间距测量 · 选中 + Alt + 悬浮目标」→「间距测量」之类，让宽行不再撑列
- 列最小宽度 + 行 gap 缩到 5px，整体面板更紧凑

---

## 0.1.25 — 2026-05-12  ·  保住内部 markup（`<em>` / `<br>` / `<strong>` 不再被吃）

### Fixed
- **bug**：用户编辑标题如 `把<em>任何网页</em><br>变成可标注的画布。` 后，红色 `<em>` 和换行 `<br>` 经常被吃掉，变成纯文字。Compare 模式切到"看原稿"时也只能看纯文字，红色 + 换行全没了
- **根因**：之前 `state.originals` 只存 textContent；undo 和 compare 用 textContent 还原 → 内部 markup 全 trim 掉
- **修法**：注册可编辑元素时**额外存一份 innerHTML**（`state.originalsHTML`）。compare 模式还原文字编辑过的元素时用 innerHTML；undo 的 snapshot 也升级到 innerHTML

### 副作用 & 取舍
- 撤销 / compare 切换时 descendants 会被 innerHTML 替换重建（DOM 节点是新的）。data-fbw-edit-id 仍按 id 工作（getChanges 走 querySelectorAll），影响有限
- 内存：每个可编辑元素多存一份 innerHTML 字符串；典型页面单元素几百字节，总开销可接受

---

## 0.1.24 — 2026-05-12  ·  前后对比模式

### Added
- **FAB bar 多了 ↔ 按钮**：点击或按 **O** 键切换"看原稿 / 看改后"
- 进入「看原稿」时：所有 op 改动 + 文字编辑改动**暂时还原**到改前样子。**栈不清、ops 不清**，只是视觉切换
- 顶部红色提示条「看原稿 · 再按 O 或工具栏图标切回改后」常驻
- **改前模式下编辑被锁**：click / dblclick 都跳过，浮窗（工具栏 / popovers）全部隐藏，避免在原稿态误操作
- 再按一次 / 再点按钮 → 一键切回改后

### 实现要点
- `src/edit/compare.js` 新模块持有一个 Map cache：进改前时 snapshot 每个被编辑元素的当前 inline state，然后清掉；切回时 restore
- 完全不动 `state.elementOps` / `state.originals` —— 编辑栈和反馈数据都原样保留

---

## 0.1.23 — 2026-05-12  ·  样式面板加滑块 + 4 边独立

### Changed
- **滑块**：font-size / padding / margin 三行都加 `<input type="range">`，跟数字输入双向同步。拖滑块 = 实时预览；数字输入还能精准敲值
- **数字输入框宽度变窄**（44px），给滑块腾呼吸空间。`−` / `+` 微调按钮去掉（滑块覆盖了快速调整场景）

### Added
- **padding / margin 4 边独立**：每行右侧多一个「⇄」链接按钮
  - 点开 → 行展开成 4 个小输入框（T / R / B / L 横向排列）
  - 改任一边 → 元素 inline style 用 shorthand `${t}px ${r}px ${b}px ${l}px`
  - 再点 ⇄ 回到统一模式，取 top 值作为新 uniform 值同步给四边
- 打开面板时如果当前 inline 已经是非 uniform（agent 给的源 HTML 就 4 边不一），自动进入 4 边模式

### 没做
- 颜色相关样式（已被取色器 + design chip 覆盖反馈路径，单独再开一个 panel 维度收益不大）

---

## 0.1.22 — 2026-05-12  ·  样式注入面板

### Added
- **元素工具栏新加滑块按钮**（在取色器右边）：点开弹小面板调 **字号 / 内边距 / 外边距** 三个维度
- 三个数字输入 + 各自 `−` / `+` 微调（按住 Shift 跳 4px）
- **实时预览**：输入即时改 inline style，松开还是当前 anchor 的样子
- **多选 gang**：选了多个时调一次值，所有选中元素同步生效
- **新 op 类型 `style`**：`args.props = { fontSize, padding, margin }`。`apply.mjs` 把这些写到源 HTML 的 inline style
- 审计模式 `style` 类型用粉色描边 + 角标（#f472b6），跟 font 蓝色区分

### 撤销栈
- 打开面板时一次 pushUndoGroup 抓所有 selected 的 pre-edit 状态
- session 内连续输入不重复入栈，Cmd+Z 一次还原到打开前
- restore 按钮也清掉 style 写过的 inline font-size / padding / margin

---

## 0.1.21 — 2026-05-12  ·  Rubber-band 框选

### Added
- **空白处拖动 → 画选择矩形**：编辑模式下，在空白区域（非可编辑元素、非 UI）按住鼠标拖 → 出现红色虚线选区。释放后所有相交的可编辑元素一次性进入多选
- 拖动时按住 Shift / Cmd / Ctrl → 追加到现有选区；不带修饰 → 替换选区
- Esc 取消正在画的框
- 智能过滤：当选区同时命中父子两层时，只保留更细粒度的子元素，避免一个 section 把所有段落都连同选进来
- 跟 marquee 模式（标注）互斥：marquee 模式开启时 rubber-band 不响应

---

## 0.1.20 — 2026-05-12  ·  补齐多选两个洞

### Added
- **gang 自由拖动**：选中多个元素后，拖动任一选中元素 → 整组同步位移。每个元素 mousedown 时各自记 base transform，mousemove 时各加同一个 dx/dy → 相对位置不变。一次 pushUndoGroup 包了所有元素，Cmd+Z 整组回退
- **多选 ⌘+C 复制全部描述符**：原来只复制 anchor 一个；现在选了 N 个就复制 N 段，按 `[1] ...\n\n[2] ...` 编号格式排列，方便回 Claude 粘贴时引用

---

## 0.1.19 — 2026-05-12  ·  多选

### Added
- **Shift / Cmd / Ctrl + click 切换多选**：可选多个元素一起操作。`state.selectedEls` 持有 Set，`state.selectedEl` 始终指向 anchor（最近一次操作的那个）。工具栏右上角出现「N」红色 monospace 徽章
- 撤销栈支持 group entry：批量操作一次 Cmd+Z 还原所有改动

### Gang-able ops（多选时一次操作所有元素）
- delete / hide / restore
- 字体 / 高亮（整元素背景）
- 移动方向键 / 缩放按钮（保持每个元素的独立 transform）

### Single-only ops（多选时按钮自动隐藏）
- link（改 href）/ note（元素反馈）/ tag 切换 / 替换图片 / 划词高亮 / 双击文字编辑

### 已知限制
- ⌘+C 复制描述符目前只复制 anchor 一个，不复制全部选区
- 拖动 / 缩放手柄目前只动 anchor，不 gang（保留给将来）

---

## 0.1.18 — 2026-05-12  ·  取色器换图标 + 回归元素工具栏

### Changed
- 取色器图标从「斜向吸管」改成「水滴」—— 之前那个 path 跟 edit 模式的铅笔图标太像
- 取色器**位置回归元素工具栏**（选中元素后那条 floating bar），跟字体 / 高亮 / 标签换 / 换图同档 design-tools 簇。理由：用户的典型流程是"选中元素 → 想改色 → 取色作参考"，挂在 element 上下文里比挂在全局 FAB 更顺手
- FAB bar 和 deck overlay 移除取色器按钮

---

## 0.1.17 — 2026-05-12  ·  撤销/重做 FAB + help 自适应

### Added
- **撤销 / 重做 FAB 按钮**：FAB bar 上 export 之后多了两个弯曲箭头。**条件可见**：栈非空才显示，避免空状态占视觉。点击 = ⌘Z / ⌘⇧Z，跟键盘 + Gmail toast 三条路径并存
- 折叠状态下隐藏（跟其他非 edit FAB 一致）

### Fixed
- **帮助 popover 自适应**：内容比视口高时加 `max-height: 100vh - 24px` + `overflow-y: auto`，并 clamp top 避免弹出框超出视口底部
- FAB 折叠后再展开，旧的可见性状态被新逻辑 refresh，不再错乱

---

## 0.1.16 — 2026-05-12  ·  取色器迁到工具栏

### Changed
- 取色器从反馈面板 header 挪到 FAB bar（编辑栏），跟 export 同档 —— 始终可用，不需要先打开反馈面板
- deck 模式的 overlay 工具栏也加上取色器按钮，跟 FAB bar 等价
- **原因**：取色器产物是剪贴板 + 焦点反馈框，跟面板没有强绑定（不像 📷 截图，产物进 attachments）。放面板里多一步开面板的摩擦

---

## 0.1.15 — 2026-05-12  ·  Design 分类 chip

### Added
- **元素 note + marquee 标注 note 上方**多了一排 5 个分类 chip：间距 / 颜色 / 字号 / 排版 / 文案
- 点 chip → 在反馈文本前面 toggle 一个 `[标签]` 前缀。可叠加多个（一条反馈可以同时是"间距 + 颜色"）
- 已有的 tag 用 active 红边突出，再点一下移除
- 给 agent 一个明确的语义信号 —— "这条反馈是哪一类的"，能让 agent 不用从文字里推断分类

### Design 三件套全齐
| 工具 | 触发 | 输出 |
|---|---|---|
| 间距测量 | 选中 + Alt + hover | 4 边 px 距离虚线 |
| 颜色取色器 | header 水滴 icon | hex 到剪贴板 / 反馈框 |
| 分类 chip | note 输入时 | `[标签]` 前缀打到反馈文本 |

---

## 0.1.14 — 2026-05-12  ·  颜色取色器

### Added
- **取色器按钮**（反馈面板 header 加一个水滴 icon）：点击 → 调起浏览器原生 EyeDropper（Chrome / Edge 95+）→ 在页面任意位置取一个像素 → hex 自动复制到剪贴板
- 智能插入：如果取色时刚才有一个 textarea（反馈框 / 标注框 / note popover）处于 focus，hex 也会插到光标位置，省一次粘贴
- 取色期间面板自动隐藏（避免遮挡），取完恢复
- 不支持 EyeDropper API 的浏览器（Firefox / Safari）给一条明确 toast 提示

---

## 0.1.13 — 2026-05-12  ·  间距测量（design feedback）

### Added
- **间距测量**：选中元素 + 按住 Alt + 鼠标 hover 任意目标元素 → 实时显示 selected → target 的 4 边距离（top / right / bottom / left）。Figma 风格的虚线 + 红色 monospace 像素徽章。释放 Alt 自动收起
- 不加 mode，作为跨 doc / review 都生效的工具型功能。打印 / 截屏时自动隐藏

### 用法
1. 进编辑模式（E），点中一个元素
2. 按住 ⌥ Alt，鼠标移到要量距的另一个元素上
3. 弹出 4 条虚线 + 4 个像素读数；负值表示 selected 在 target 外侧

---

## 0.1.12 — 2026-05-12  ·  布局与排版微调

### Changed
- **快捷键面板改双列**：左列「模式 + 操作」（高频），右列「导出 + 其他」（低频），中间细分隔线。从 12+ 行单列竖条变成 ~7 行双列，扫视成本降一半。`min-width` 从 220 → 360 撑开双列
- **mode chip 改贴左**：从 header-actions 挪到 pill row，再去掉 `margin-left: auto`，按 DOM 顺序坐左端。pill row 加 `justify-content: space-between`，文档 chip + 4 个 pill 均匀分布占满整行
- **header 对齐回 center**：之前为 EN 折行加的 `align-items: flex-start` 让 ZH 单行标题视觉偏低。chip 搬走后 header-actions 只剩 4 个 icon，居中最稳
- **Aa 字体图标放大**：toolbar 上的「Aa」字体按钮从 font-size 14 → 18，跟周围 stroke icon 视觉等重

---

## 0.1.11 — 2026-05-12  ·  EN locale 适配

### Fixed
- mode chip 之前用 CSS `::before` 硬编码"文档/幻灯片/评审"，EN locale 下仍然显示中文。改用 i18n key + JS 注入：`Deck / Doc / Review`（EN）/ `幻灯片 / 文档 / 评审`（ZH）。appMode 变化时同步刷新
- chip 加 `white-space: nowrap` + `flex-shrink: 0`：防止窄字符宽度下被挤压成竖排
- 面板标题在 EN locale 下会折两行（"Feedback to Agent / Designer"）：head 从 `align-items: center` 改成 `flex-start`，让 chip + 右侧 icon 跟标题首行对齐，不再"漂"在两行正中

---

## 0.1.10 — 2026-05-12  ·  queryLocalFonts 不再误报

### Fixed
- `navigator.queryLocalFonts` 在 Firefox / Safari / http://localhost 等非安全 origin 上根本不存在，原代码统一当成 `denied` 还打 console.warn —— 误导用户以为是权限被拒了。现在分两层处理：API 不存在 = `unsupported`，静默；真正调用失败（SecurityError / NotAllowedError）才标 `denied` 并 warn

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
