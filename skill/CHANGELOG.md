# redline · skill CHANGELOG

> skill 现已跟 widget 统一版本号（0.1.x），由 `scripts/sync-version.mjs` 自动写到 SKILL.md frontmatter / package.json。
>
> 此前 skill 用过的 2.x 编号是 widget 早期内部版本号，已废弃。skill 本身的协议没断 —— `prepare.mjs` / `apply.mjs` 自始至终向后兼容。

格式：[Keep a Changelog](https://keepachangelog.com/) · [SemVer](https://semver.org/)

完整改动历史（widget + skill 共用）见仓库根 [CHANGELOG.md](../CHANGELOG.md)。

---

## 0.1.46 — 2026-05-12  ·  docs 同步

### Changed
- README / skill docs 加 HTML 单文件导出说明（v0.1.36 起新增的能力）
- SKILL.md 加「HTML 导出：另一条不经 skill 的路」段，告知 agent 何时建议用户走 HTML / PDF / ZIP
- skill/README 快捷键表补全：A / O / M / ⌘C / ⌘M / Del / ? / Space+H / ⇧+H
- 历史 2.x 改动从本 CHANGELOG 移除（旧编号体系不再维护）

skill 协议没变，无需重新 `npm install`。

---

## 0.1.36+ ─ HTML 单文件导出（widget 侧能力，skill 不需要改）

agent 视角的关键新事实：

- 用户可以选择把整个 review 状态导出成单个 `.html`（编辑 / 预览两种），跳过 ZIP + apply.mjs 流程
- 导出 HTML 的 receiver 直接用浏览器打开，redline.js 已 inline，无需 skill / 扩展
- `revisionId` / `parentRevisionId` 链式追踪多版传递
- 详细 agent 行为建议见 SKILL.md「HTML 导出」段

---

## 0.1.x — 浏览器侧 widget 大量迭代

skill 协议保持稳定。每个 widget 版本的详细改动见根 [CHANGELOG.md](../CHANGELOG.md)。涉及 skill 行为时会在 SKILL.md 同步更新。

跟 skill 联动相关的几个里程碑：

- **v0.1.31** — Single-file HTML 导出落地（`<script data-fbw-state>` + bundle inline）
- **v0.1.34** — single-file 导出在 Chrome 扩展 MAIN world 下稳定（bundle source stash）
- **v0.1.36** — 砍 PPT，HTML 加版本链 / WebP 压缩 / receiver UX
- **v0.1.37** — HTML 导出加键盘快捷键
- **v0.1.45** — 所有 FAB tooltip 两行排版统一

apply.mjs / prepare.mjs 不需要因为这些 widget 变化做改动。
