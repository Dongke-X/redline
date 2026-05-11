# Contributing to redline

欢迎贡献。在提 PR 前请先看本文件。

## 本地开发

```bash
git clone <repo>
cd redline
npm install
npm run build               # 构建 dist/redline.js (minified)
npm run build:dev           # 带 sourcemap
npm run watch               # 监听重建
npm test                    # 17 个 critical-path test
npm run install:skill       # 把 skill 装到 ~/.claude/skills/redline/
npm run demo                # 打开 examples/standalone.html
```

## 开发循环

1. 改 `src/`
2. `npm test` 跑测试
3. `npm run build` 验证 bundle 不破
4. 用 `npm run demo` 跟 `npm run install:skill` 在浏览器 + Claude Code 里端到端跑一遍
5. 提 PR

## 改动指南

### 加新功能

- 改 `src/` 对应模块
- 加 / 改对应的 `tests/*.test.js`
- 在 `CHANGELOG.md` 加一行（格式参考已有）
- 描述放 PR description 里
- **不要直接动 `dist/`** —— 它是构建产物，CI 会自己产生

### 改 i18n 文案

- 中英要同步加（`src/i18n.js` 的 `zh` 和 `en` 两个 dict）
- key 命名按现有约定 `<domain>.<sub>.<name>`

### 加新模式 / 新 section 选择器

`src/config.js` 的 `EDITABLE_SELECTORS` 和 `SECTION_SELECTORS`。注意 `SLIDE_GUARD`（在 `src/edit/selection.js`）已用 `[data-fbw-sec-id]` 自动跟随注册，无需同步。

### 改 session.v1 schema

向后兼容是硬约束（已发布的 widget 写出来的 session 老 apply.mjs 仍要能读）：
- 加字段：optional + 默认值
- 改字段：bump `schemaVersion` 到 `1.1`，apply.mjs 加分支处理
- 删字段：先 deprecate 一个版本，再删

更新 `schema/session.v1.schema.json` 以及 `src/types.js` 的 `SessionData` typedef。

### 改 skill 行为

- `skill/SKILL.md` 是给 Claude 看的，写清"什么时候做什么"
- `skill/apply.mjs` 是 Node 脚本，零交互应用 edits
- 改完跑一次端到端：浏览器存反馈 → Claude Code 里说"应用反馈"

## 代码风格

- ESM only
- 不引入运行时新依赖（widget 单 bundle 注入，越小越好）
- prefer 小而专的文件，单 file < 500 行最佳
- 注释写"为什么"，不写"在做什么"
- console.warn / console.error 走 `[fbw]` 前缀，方便用户报问题时过滤

## Commit 规范

仿 conventional commits 但不强制：

```
feat: 加 X 功能
fix: 修 Y bug
perf: 优化 Z
docs: 文档改动
test: 测试改动
chore: 构建 / 依赖 / 工具改动
release: bump 版本 + tag
```

## 报问题

[SECURITY.md](./SECURITY.md) 看上报漏洞。普通 bug 用 GitHub issue：

附上：
- redline 版本（`package.json` 或 SKILL.md frontmatter）
- 浏览器 + 操作系统
- session.json 路径（如果 apply 失败）
- 复现步骤

session.json 是结构化复现包，附上后能 1:1 还原。

## License

提交即同意按 MIT 授权。
