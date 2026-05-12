---
name: redline
version: 0.1.40
description: Closed-loop HTML feedback for AI-generated outputs. (a) prepare.mjs injects the redline editor into any HTML so the user can review it in their browser without a Chrome extension; (b) apply.mjs reads the feedback session from ~/.redline/sessions/ and patches edits + annotations back into the source HTML. Triggers on Chinese "准备 redline / 给 X 加 redline / 让我 review / 注入编辑器 / 读反馈 / 看反馈 / 应用反馈 / 把反馈应用到源 / 页面 review / 界面 review / 改稿 / 划线反馈 / 标注反馈" and English "prep this html / inject redline / let me review / open for review / apply feedback / read sessions / redline / design review / page review / visual feedback". Trigger proactively after writing any .html file the user might want to review, and after the user has used the in-browser redline UI and asks "what's next / 接下来怎么办".
---

# redline skill

闭环的两端：

1. **`prepare.mjs`** — 给任意 HTML 文件**预埋编辑器**，用户在浏览器打开后无需 Chrome 扩展就能直接做反馈
2. **`apply.mjs`** — 读用户保存到 `~/.redline/sessions/` 的反馈包，把改动 patch 回源 HTML

## 触发条件

### 准备 HTML 让用户 review（prepare.mjs）

- "准备 redline" / "给 report.html 加 redline" / "让我 review 这个"
- "在 X 里加上反馈编辑器" / "注入 redline" / "prep this html"
- "open for review" / "review this html"
- **也要主动触发**：每次你（Claude）刚写完一个 .html 文件，且用户可能要 review 时，**主动建议** `要不要给这个 HTML 加上 redline 让你直接在浏览器里改？`

### 应用用户的反馈（apply.mjs）

- "读反馈" / "看反馈" / "应用反馈" / "把反馈应用到源"
- "redline" / "design review" / "页面 review" / "界面 review"
- "用 redline 改一下" / "patch 源文件"
- "我刚才在 widget 里改了 X，帮我应用回去"
- 用户刚用过浏览器里的 widget，问"接下来怎么办"
- 提到"标注反馈" / "划线反馈" / "改稿" / "review session" 等也算

## 首次使用

`apply.mjs` 依赖 jsdom。已在 `package.json` 的 dependencies 里——`cd ~/.claude/skills/redline && npm install` 一次性装好。

`prepare.mjs` 零依赖，直接跑。

## prepare.mjs 用法

```bash
# 默认：拷 redline.js 到 HTML 同目录 + 加 <script src="redline.js">
node ~/.claude/skills/redline/prepare.mjs path/to/report.html

# 自包含模式：把 153KB bundle 直接 inline 进 HTML，不留 sibling 文件
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --inline

# 移除注入（恢复原 HTML，干净）
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --remove

# 整个目录批量 prep
node ~/.claude/skills/redline/prepare.mjs path/to/dist/
```

特性：
- **idempotent**：重复跑不会重复注入，直接 no-op
- **自动备份**：写盘前生成 `xxx.html.bak.<timestamp>`
- **注释边界**：`<!-- redline-injection-begin -->` / `end` 包裹注入块，方便定位

完成后告诉用户：浏览器打开 HTML（file:// 或 dev server 都行）→ 按 `F` 开反馈面板 / `E` 进编辑模式 / Save 下载 ZIP → 把 ZIP 丢回来调 `apply.mjs`。

## 何时直接跑脚本 vs 手动 patch

- `apply.mjs` 只处理 `edits[]`（text/move/scale/rotate/hide/delete/font/note 标记）。**适合**：用户改动多、纯文本/transform 类型、要快速批处理。
- `annotations[]` + `feedback.global` + `feedback.perSection` —— **不要走脚本**，要你（Claude）做语义判断、跟用户对齐后再 Edit 工具改源。
- 流程：先跑脚本批处理 edits → 然后**主动告诉用户**还有 N 个 annotations / M 条 feedback narrative 待处理 → 逐个跟用户对齐。

## 整体工作流

```
~/.redline/sessions/
  ├─ <stem>.json       ← 机器读：edits / annotations / feedback
  ├─ <stem>.md         ← 人读：summary
  └─ <stem>-anno-*.png ← 标注图片（已落盘）
                ↓
       Claude (this skill)
                ↓
       1. 找最新 session
       2. 读 JSON 拿到所有改动
       3. 定位源 HTML（page.pathname）
       4. dry-run 预览 diff
       5. 用户确认 → 写入（自动备份）
       6. 报告应用 / 失败 / 待人工处理的项目
```

## 步骤

### 1. 找 session 文件

默认目录：`~/.redline/sessions/`

```bash
ls -t ~/.redline/sessions/*.json 2>/dev/null | head -5
```

如果有多个，默认选最新；用户明确说"上次那个"或"哪个文件"则按指示挑。

如果目录不存在或为空：告诉用户先到浏览器里用 widget 点「保存反馈」。

### 2. 读 session JSON

关键字段：

```json
{
  "schemaVersion": "1.0",
  "page": {
    "url": "file:///...",
    "title": "...",
    "pathname": "/Users/dk/.../proposal.html"   ← 源 HTML 文件路径
  },
  "source": { "hint": "proposal.html", "matchBy": "pathname" },
  "feedback": {
    "global": "整体...",
    "perSection": [{ "secId", "secLabel", "note" }]
  },
  "edits": [
    /* 文字 / move / scale / rotate / hide / delete / font / note */
  ],
  "annotations": [
    /* 区域标注：rectPct + text + image filename */
  ],
  "attachments": [/* 截图附件 */]
}
```

### 3. 定位源 HTML

用 `page.pathname` 直接打开。如果文件不存在：

- 检查 `source.hint` 跟当前工作目录的同名文件
- 跟用户确认：「源在哪？是 X 吗？」

### 3.5 看 appMode 决定流程

session.json 顶层有 `appMode`：

| appMode | 含义 | 怎么走 |
|---|---|---|
| `deck` | 幻灯片 (有 `<deck-stage>`) | 正常应用 edits[]，annotations 走对齐 |
| `doc` | HTML 文档 (proposal / 长页面) | 同上 |
| `review` | 网页预览（线上 webapp，没源） | **edits[] 都标 `proposed: true`，不要 patch 源**，列给用户看，让对方拿去做实际改动 |

apply.mjs 已经会自动 skip `proposed: true` 的 edits，不会误写源。但你（Claude）要主动告诉用户："这是评审模式收到的 N 条提案，我列出来给你 / 设计师参考"。

### 4. 应用 edits[]

按 `op` 类型分别处理：

| op | 怎么改 |
|---|---|
| `text` | 在源 HTML 找到对应元素，把 textContent 替换为 `after`（保持结构）|
| `move` | 给元素加 inline `style="transform: translate(Xpx, Ypx)"`（merge 已有 transform） |
| `scale` | 同上，inline `transform: scale(N)` |
| `rotate` | 同上，inline `transform: rotate(Ndeg)` |
| `hide` | 给元素加 inline `style="visibility: hidden"` |
| `delete` | 从 DOM 树删掉元素 |
| `font` | 给元素加 inline `style="font-family: ..."` |
| `note` | 元素级反馈，**不改源**。在最后 summary 里告诉用户"P3 第 2 段被备注：...，要不要据此改 X" |
| `replace-img` | 跳过（图像替换比较 invasive，用户应该手动 review） |

#### 元素定位（selector 三层 fallback）

每个 edit 的 `selector` 字段：

```json
{
  "id": "myH1" | null,         ← 优先：作者主动写的 ID
  "cssPath": "[data-fbw-sec-id=\"...\"] > div > h1",
  "contentHash": { "sample": "首 40 字", "hash": "8 位 hex" },
  "fbId": "fbw-e-12",          ← 会话级 ID，可能跨刷新失效
  "tag": "h1"
}
```

- 如果 `id` 存在且源里有 → 直接用
- 否则用 `cssPath`（注意：这里 `data-fbw-sec-id` 是 widget 注入的，源 HTML 没有；用 `section[data-screen-label="..."]` 配合 secLabel 重新定位即可）
- 还不行就遍历 `tag` 元素，找 `textContent.trim().slice(0, 40)` 跟 `contentHash.sample` 一致的（content fingerprint）

### 5. 处理 annotations[]

每个 annotation 是用户在画面上画的反馈框：

```json
{
  "secId": "fbw-sec-2",
  "secLabel": "现状",
  "rectPct": { "x": 0.15, "y": 0.20, "w": 0.30, "h": 0.40 },
  "text": "这里加一个客户证言卡片",
  "image": { "name": "ref.png", "filename": "<stem>-anno-abc12345.png" }
}
```

**不要自动 patch 源**。annotations 是模糊的"在这块区域加点东西"，需要你（Claude）做语义判断 + 跟用户对齐：

1. 把每个 annotation 列给用户看：「在 [secLabel]（占 30%×40% 区域），用户希望加 [text]，参考图 [image.filename]」
2. 用户确认后，你来生成合适的 HTML 片段插入到那个 section 的合适位置
3. 如果有图片，先把图片复制到 proposal 项目的 images/ 目录：`cp ~/.redline/sessions/<stem>-anno-X.png <proj>/images/X.png`
4. 在源 HTML 里插入 `<img src="images/X.png" alt="<text>">` 或对应的封装组件

### 6. 处理 feedback（留言）

`feedback.global` 和 `feedback.perSection` 是叙事性反馈，不要自动 patch。

最后总结时把它们列给用户看，问"这些建议要不要落实？我帮你做"。如果用户要做，按反馈语义编辑 HTML。

### 7. Dry-run 预览

在真改之前：

1. 列出准备改什么：「准备应用 N 处 edits、M 处 annotations，跳过 K 处 notes/feedback。」
2. 生成 diff（用 git diff 对比 patched 内容）
3. 让用户确认

### 8. 备份 + 写入

确认后：

```bash
# 备份
cp <source.html> <source.html>.bak.$(date +%Y%m%d-%H%M%S)

# 写新内容（用 Edit 工具或 Write 工具）
```

如果项目在 git 里：建议用户先 `git add -A && git commit -m "before feedback patch"` 作为完整快照。

### 9. 报告

```
✓ N 处 edits 应用
✗ M 处失败（原因）
⚠ K 个 annotation 待你 review（已暂不动源）
ℹ 全局/页面留言已 summary，等你决定怎么落实

Backup: <source.html>.bak.20260509-133012
```

## 常见失败模式

| 现象 | 原因 | 处理 |
|---|---|---|
| 元素找不到 | 源 HTML 在 widget 跑过之后被改了 | 跳过这条 edit + 警告 |
| 内容漂移 | 元素在但 textContent 跟 selector.contentHash.sample 不一致 | 用户改过，跳过 + 警告 |
| 多个 cssPath 匹配 | selector 不够精确 | 用 contentHash 二次过滤；还不行就让用户人工指认 |
| 图片复制失败 | sessions 目录或目标目录权限 / 路径错 | 列出 sessions 里的图片，让用户手动 cp |

## 设计要点

- **source 永远是真相源**。session 里的状态可能旧，要以源 HTML 现状为准。
- **patch 不是覆盖**。edits 是局部改动，作用在源现有结构上。
- **annotations 走对齐流程**，不要硬编码插入逻辑——每个 deck/页面的语义结构不一样。
- **figma-style backup**：每次写都备份；不要假定 git 是干净的。
- **不要主动应用 feedback narrative**。这些是用户给 agent 的对话式反馈，让用户做最终决定。

## 配套文件

- `~/.claude/skills/redline/redline.js` —— 浏览器端 widget bundle（写到用户的 HTML 里 `<script src="...">` 引用）
- `~/.claude/skills/redline/apply.mjs` —— 命令行批处理脚本（基于 jsdom，零交互应用 edits；不处理 annotations / feedback）
- `~/.claude/skills/redline/CHANGELOG.md` —— 历版改动列表
- `~/.claude/skills/redline/README.md` —— 给人看的安装与使用说明
- `~/.redline/sessions/` —— 用户保存的 session 文件目录

## 反馈与迭代

apply / widget 出问题时让用户：
1. 把出错的 `~/.redline/sessions/<stem>.json` 路径贴出来
2. 把 widget console (`window.__fbwDebug = true` 后的日志) + apply.mjs stderr 一起贴
3. session.json 里有 `widgetVersion` / `appMode` / `env` 字段，能反推当时环境

session 是结构化数据 + 可重放，等于自带 bug 复现包，把这个反馈给 redline 维护者就能 1:1 还原问题。

## 版本兼容

- 当前 skill 版本见 frontmatter `version` + `~/.claude/skills/redline/package.json`
- session.json 里的 `schemaVersion` 是协议版本，目前 1.0
- 若 widgetVersion ≫ skill version（用户 widget 比 apply.mjs 新），apply.mjs 会打印一条提示，建议升级 skill

## 使用举例

```
用户：我刚在浏览器里给农乐园 proposal 改了 8 处地方，反馈写好了，帮我应用一下

你：
1. 跑 ls 找到最新 session: proposal-2026-05-09-130412.json
2. 读 JSON：8 处 text edits、2 个 annotation、1 条 perSection 留言
3. 源 HTML: /Users/dk/Desktop/Inbox/农乐园/方案/proposal-pin-paper/proposal.html
4. dry-run：列出 8 处具体改动 → 用户确认
5. cp proposal.html proposal.html.bak.20260509-133012
6. 应用 8 处 edits → 6 成功、2 失败（元素 cssPath 改过）
7. 列出 2 个 annotation 给用户看，问怎么处理
8. 列出 perSection 留言：「P3 现状这页的左侧 quote 偏重，建议缩小一档」
9. 用户决定要 / 不要逐个落实
```
