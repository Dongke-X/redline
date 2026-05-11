<div align="center">

# Redline

**给 AI 时代的 HTML 反馈工具。**

agent 给你写 HTML，你在浏览器里 review，agent 把改动 patch 回源码。闭环，不用 Figma，不用录 Loom。

[![version](https://img.shields.io/badge/version-0.1.0-c8242c)](./CHANGELOG.md) [![tests](https://img.shields.io/badge/tests-17%20passing-brightgreen)](./tests) [![bundle](https://img.shields.io/badge/bundle-153kb-blue)](./dist) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**语言：** [English](./README.md) · **简体中文**

</div>

---

## 是什么

三件东西打包：

1. **浏览器编辑器** — 直接改文字、画区域标注、贴截图，保存成结构化 ZIP
2. **Claude Code skill** — `prepare.mjs` 给任意 HTML 注入编辑器；`apply.mjs` 把反馈 patch 回源码
3. **Chrome 扩展** — review 远程 URL 用（https / file:// 都能注入）

**装 skill 就够**——可以完全不用扩展。扩展的价值是 review 你不能改的页面（线上 staging、第三方网站）。

```
   agent 写出 report.html
            ↓
   ┌─────────────────────────┐
   │ skill: prepare.mjs       │  ← 给 HTML 预埋编辑器
   └─────────────────────────┘
            ↓
   浏览器打开 → 编辑 / 标注 / 截图 → Save
            ↓
   下载 ZIP（含 session.json + .md + 图片）
            ↓
   ┌─────────────────────────┐
   │ skill: apply.mjs         │  ← 把改动写回源 HTML
   └─────────────────────────┘
            ↓
   report.html 反映你的反馈
```

## <a id="install"></a>安装

### 只装 skill（推荐用于 AI 生成的 HTML）

```bash
git clone https://github.com/Dongke-X/redline.git
cd redline && npm install && npm run build:ext
npm run install:skill          # 拷 skill/ 到 ~/.claude/skills/redline/
```

在 Claude Code 里：
```
你:    "给 ./report.html 加 redline 让我 review"
claude: 跑 prepare.mjs → 注入编辑器 + 同目录拷 redline.js
        ↓
浏览器打开 report.html，按 F 开反馈面板，
做改动，Save → ZIP 自动下载到 ~/Downloads
        ↓
你:    "应用 redline 的反馈"
claude: 读 ZIP，把改动写回 ./report.html，标注逐条跟你对齐
```

### Chrome 扩展（review 远程 URL / staging / file://）

1. `npm run build:ext`
2. Chrome 打开 `chrome://extensions/` → 开启"开发者模式"
3. "加载已解压的扩展程序" → 选 `extension/`
4. 工具栏点 Redline 图标 → 注入编辑器

应用商店上架准备中，详见 [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)。

## 三个核心场景

| | 什么时候用 | 你标注什么 | ZIP 里输出什么 |
|---|---|---|---|
| **HTML 幻灯片** | Reveal.js / `<deck-stage>` / 纯 HTML slides | 按页改文字、按页加备注 | 每条 edit 带 `section: slide-N` |
| **HTML 文档** | 长文 HTML 报告 / RFC / 白皮书 | 按章节标注、按段落改写 | `perSection` 反馈按 § 归类 |
| **HTML 网页** | agent 生成的 landing / dashboard / 原型 | 全套：edits + annotations + screenshots | 统一 `edits[]` + `annotations[]` + `attachments[]` |

完整演示见 [examples/landing.zh.html](./examples/landing.zh.html)。

## Skill 怎么定位元素

`apply.mjs` 把反馈写回时按这个优先级匹配 selector：

1. **id** — 最快、最稳
2. **fbId** — Redline 内部用的 data 属性，DOM 重排不影响
3. **cssPath** — 生成的 CSS 路径
4. **contentHash** — 元素文本采样 + 标签名

所以即使 agent 在你 review 完之后又重新生成了 HTML，redline 也能靠 contentHash 兜底找到正确的元素。

## 隐私

零收集。没有服务器、没有埋点、没有第三方 SDK。所有数据都留在你浏览器和硬盘里。详见 [PRIVACY.md](./PRIVACY.md)。

## 开发

```bash
npm install              # esbuild + vitest + happy-dom
npm run build            # → dist/redline.js（minified，~153kb）
npm run build:ext        # build + 同步 bundle 到 extension/ 和 skill/
npm run watch            # src/ watch 模式
npm test                 # vitest，17 个 test
npm run demo             # 浏览器打开 examples/standalone.html
node tests/e2e-zip.mjs   # ZIP 端到端 + selector 解析测试
```

目录结构：
- `src/` — widget 源码（模块化 ESM）
- `dist/redline.js` — 浏览器注入用的 IIFE bundle
- `extension/` — Chrome MV3 扩展骨架（popup / options / i18n）
- `skill/` — Claude Code skill（`prepare.mjs` / `apply.mjs` / SKILL.md）
- `docs/` — GitHub Pages 内容（landing + 隐私）
- `examples/` — 独立 demo + 市场化 landing 页

## 链接

- 🌐 着陆页：[examples/landing.zh.html](./examples/landing.zh.html)（[English](./examples/landing.html)）
- 📋 更新日志：[CHANGELOG.md](./CHANGELOG.md)
- 🔒 隐私政策：[PRIVACY.md](./PRIVACY.md)
- 🛠 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 📦 上架清单：[SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)

## 许可

[MIT](./LICENSE) © 2026 Dongke-X · 小红书 [@东可 Talk](https://www.xiaohongshu.com/user/profile/5a8e8eb8db2e600ca3d43349)
