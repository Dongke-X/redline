# redline · skill for Claude Code

闭环的两端：

- **`prepare.mjs`** — 给任意 HTML 文件预埋编辑器，浏览器打开后无需 Chrome 扩展就能 review
- **`apply.mjs`** — 读你保存的反馈 ZIP，把改动 patch 回源 HTML

> SKILL.md 是给 Claude 看的工作流；这份是给**人**看的安装与使用指南。

## 安装

```bash
git clone https://github.com/Dongke-X/redline ~/.claude/skills/redline
cd ~/.claude/skills/redline && npm install
```

之后任何 Claude Code 会话里说「应用反馈」「读 sessions」「redline」「prep this html」「给 X 加 redline」都会自动触发。

## prepare.mjs — 注入编辑器

```bash
# 默认：拷 redline.js 到 HTML 同目录 + 加 <script src="redline.js">
node ~/.claude/skills/redline/prepare.mjs path/to/report.html

# 自包含：把 961KB bundle 直接 inline 进 HTML（单文件可分发）
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --inline

# 移除注入（恢复原 HTML）
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --remove

# 整个目录批量
node ~/.claude/skills/redline/prepare.mjs path/to/dist/
```

特性：
- **idempotent**：重复跑不重复注入
- **注释边界**：`<!-- redline-injection-begin -->` / `end` 包裹注入块，方便定位
- **自动备份**：写盘前生成 `xxx.html.bak.<timestamp>`
- **零依赖**：纯 Node，不需要 jsdom

## apply.mjs — 把反馈写回源

浏览器编辑完 Save 下载 ZIP，解压到任意目录后：

```bash
node ~/.claude/skills/redline/apply.mjs <session.json> [<source.html>] [--dry-run]
```

或在 Claude Code 里直接说「应用反馈」/「apply redline feedback」，skill 会找最新 session 自动跑。

依赖 jsdom（`package.json` 里已声明，`npm install` 会装好）。

## 自动检测的三种模式

页面打开时自动识别（写在 session.json 的 `appMode` 字段）：

| 模式 | 触发条件 | 行为 |
|---|---|---|
| **deck** | 页面有 `<deck-stage>` 或多个 `section.slide` | 幻灯片 review，工具按钮塞进 deck overlay |
| **doc** | 匹配 SECTION_SELECTORS（`section.slide` / `section.chapter` 等） | HTML 文档 review，右下 FAB pill |
| **review** | 任意线上 webapp（fallback） | 元素操作记 `proposed: true`，不自动 patch 源 |

## 浏览器内快捷键

| 键 | 动作 |
|---|---|
| `E` | 切换编辑模式 |
| `F` | 切换反馈面板 |
| `M` | 框选标注 |
| `A` / `O` | 审计模式 / 前后对比 |
| `Space + P` / `⇧+P` | 矢量 PDF / 长图 PDF |
| `Space + H` / `⇧+H` | 编辑 HTML / 预览 HTML 导出 |
| `⌘+S` / `Ctrl+S` | 保存反馈 |
| `⌘+M` / `Ctrl+M` | 复制反馈 markdown 到剪贴板 |
| `⌘+Z` / `⌘+⇧+Z` | 撤销 / 重做 |
| `Del` / `Backspace` | 删除选中元素 |
| `?` | 弹完整快捷键表 |
| `Esc` | 取消选中 / 退出当前模式 |

> v0.1.36+ 新加了 HTML 单文件导出 —— 详见仓库 [README HTML transport 段](../README.zh.md#html-转交--不依赖-claude-也不依赖扩展)。

## 三个数据流

| 类型 | 字段 | apply.mjs 自动 patch | Claude 怎么用 |
|---|---|---|---|
| 元素编辑（move/scale/font/text/hide/delete） | `edits[]` | ✓（除 `proposed: true`） | inline style / DOM 改写 |
| 区域标注（含图） | `annotations[]` | ✗ | 列出 → 跟你对齐 → 手工生成 HTML 片段 |
| 留言（全局/页面） | `feedback.{global, perSection}` | ✗ | summary 给你看 → 你决定要不要落实 |

## Selector 多策略容错

`apply.mjs` 按这个优先级解析每个 edit 的目标元素：

1. **id** — 最快、最稳
2. **fbId** — Redline 内部 data 属性，DOM 重排不影响
3. **cssPath** — 生成的 CSS 路径
4. **contentHash** — 元素文本采样 + tag 名

所以即使 agent 重新生成了 HTML，redline 也能靠 contentHash 兜底找到正确的元素。

## 故障排查

| 现象 | 排查 |
|---|---|
| `apply.mjs` 报 jsdom not found | `cd ~/.claude/skills/redline && npm install` |
| widget 不出现 FAB | 看是不是 `chrome://` / `chrome-extension://` 等扩展无法注入的协议 |
| 元素选不上 | 浏览器 console 看 `window.__fbwDebug` 输出，确认 SECTION_SELECTORS 是否匹配 |
| `prepare.mjs` 后浏览器加载不了 redline.js | file:// 协议跨目录可能受限，确认 redline.js 拷到了 HTML 同目录 |
| 反馈应用后部分 fail | apply 报告的 failure 多半是 selector 漂移，看 contentHash 是否还对得上 |

## Bug 反馈

session.json 是结构化 + 可重放的 bug 复现包。出问题时把：

1. `~/.redline/sessions/<stem>.json` 路径
2. 浏览器 console 输出（开 `window.__fbwDebug = true`）
3. `apply.mjs` 的 stderr

一起反馈给维护者，能 1:1 还原现场。

## 版本

当前版本：见 `package.json` / SKILL.md frontmatter。改动历史见 `CHANGELOG.md`。

## License

MIT · © 2026 Dongke-X · 小红书 [@东可 Talk](https://www.xiaohongshu.com/user/profile/5a8e8eb8db2e600ca3d43349)
