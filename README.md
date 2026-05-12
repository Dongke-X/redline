<div align="center">

<img src="./docs/images/banner.jpg" alt="redline.html — Visual feedback for any HTML" width="100%">

# redline.html

**Visual feedback for any HTML — for the agent era.**

The agent writes HTML. You review it in the browser. Export back as HTML, PDF, or a structured feedback ZIP. Closed loop, no Figma, no Loom.

[![version](https://img.shields.io/github/v/release/Dongke-X/redline?color=c8242c&label=version)](https://github.com/Dongke-X/redline/releases) [![tests](https://img.shields.io/badge/tests-18%20passing-brightgreen)](./tests) [![bundle](https://img.shields.io/badge/bundle-238kb-blue)](./dist) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[![English](https://img.shields.io/badge/lang-English-c8242c?style=flat-square)](./README.md) [![简体中文](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-555555?style=flat-square)](./README.zh.md)

</div>

---

## What is this

A browser-injected HTML editor + a Claude Code skill + a Chrome extension. Three pieces that turn any HTML page into a feedback canvas — capture, transport, close the loop.

<p align="center"><img src="./docs/images/hero.jpg" alt="Agent writes → You review → Three transport formats" width="620"></p>

**One in-browser session, three transport formats:**

| Format | When | Who consumes |
|---|---|---|
| **HTML** (edit / preview) | Hand the review to another human, or keep it interactive | Designers / clients / receivers who keep annotating |
| **PDF** (vector / long-image) | Print, email, archive | Anyone who needs a static doc |
| **ZIP** (`session.json` + `.md` + images) | Feed back to Claude Code via `apply.mjs` | The agent, to patch source HTML |

Only the ZIP loop touches the source HTML again — HTML and PDF exports are one-way to humans.

## What's in the browser

<p align="center"><img src="./docs/images/browser-canvas.jpg" alt="A landing page being marked up with redline" width="720"></p>

- **Edit anything** — text, color, font, size, transform; double-click + ⌘S to save
- **Annotate** — drag region notes, paste screenshots, per-section feedback
- **Inspect** — eyedropper, spacing measurement (Alt+hover), style panel, audit mode
- **Compare** — before / after toggle (O), see the diff against original
- **Multi-select + undo** — Shift+click, marquee, ⌘Z / ⌘⇧Z
- **Keyboard-driven** — `?` opens the full shortcut sheet (modes / selection / feedback / view / pointer / export)

## Install — skill only (recommended for AI-generated HTML)

```bash
git clone https://github.com/Dongke-X/redline.git
cd redline && npm install && npm run build:ext
npm run install:skill          # copies skill/ to ~/.claude/skills/redline/
```

In Claude Code:
```
you:    "prep ./report.html for review"
claude: runs prepare.mjs → injects editor + copies redline.js next to it
        ↓
open report.html in your browser, press F to open feedback panel,
edit, then Save → ZIP downloads to ~/Downloads
        ↓
you:    "apply the redline feedback"
claude: reads ZIP, patches ./report.html
```

## Install — Chrome extension (for live URLs / staging / file://)

1. `npm run build:ext`
2. Chrome → `chrome://extensions/` → toggle Developer mode
3. Load unpacked → select `extension/`
4. Click the toolbar Redline icon on any page → injects the editor

Web Store submission is in progress. See [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md).

## Use redline without Claude Code

Don't have Claude Code access? You can still close the loop with **any LLM** — ChatGPT, Claude (web), DeepSeek, Tongyi, Zhipu, agents inside Coze / Dify, etc.

After exporting a ZIP in the browser:

1. Open the ZIP, grab `session.json` (the machine-readable feedback)
2. Paste both your source HTML and the `session.json` into your LLM
3. Use one of the prompt templates in [`docs/agent-prompts/`](./docs/agent-prompts/) to tell the LLM how to apply changes
4. The LLM returns the patched HTML

| Template | Lang | When |
|---|---|---|
| [Full](./docs/agent-prompts/apply-feedback.en.md) | EN | All edit types + annotations + feedback narrative |
| [完整版](./docs/agent-prompts/apply-feedback.zh.md) | 中 | 全部 edit 类型 + 标注 + 反馈叙事 |
| Lite (in same files) | EN / 中 | Text edits only — shorter paste, smaller LLMs |

The Claude Code skill (`apply.mjs`) is still the smoothest path — it handles selector fallbacks and writes to disk automatically. These templates make the final "apply back" step LLM-agnostic for everyone else.

## HTML transport — hand off the review without Claude or the extension

The HTML export lets you pass review to anyone who has a browser. No skill, no extension required on the receiving end.

<p align="center"><img src="./docs/images/version-chain.jpg" alt="HTML revision chain: v1 → v2 → v3 with parentRevisionId" width="720"></p>

- **Editable HTML** — a single `.html` with the full redline editor embedded. Receiver double-clicks to open and keeps annotating. Every export bumps a `revision` chain (`revisionId` / `parentRevisionId` / `exporter`) so future versions can be diffed
- **Preview HTML** (read-only) — same single-file shape, but editing is locked. A built-in print button in the corner lets the receiver one-click to PDF. Good for client review where you don't want them to modify
- **Auto image optimization** — any image larger than 500 KB is transcoded to WebP @ 80 % during export (SVG / GIF skipped, original kept if WebP comes out larger). Typically 60–80 % smaller files
- **Recipient UX** — editable HTML shows a one-time welcome cue on the edit FAB so the receiver knows where to start; read-only HTML auto-injects the print button

## Three core scenarios

<p align="center"><img src="./docs/images/modes.jpg" alt="redline adapts to decks, docs, and pages" width="720"></p>

| | When | What you mark up | What ships |
|---|---|---|---|
| **HTML decks** | Reveal.js / `<deck-stage>` / plain HTML slides | per-slide text edits, region notes | `section: slide-N` tagged on each edit |
| **HTML docs** | Long-form HTML reports, RFCs, white papers | section annotations, paragraph rewrites | `perSection` feedback grouped by § |
| **HTML pages** | Agent-generated landings, dashboards, prototypes | full mix: edits + annotations + screenshots | unified `edits[]` + `annotations[]` + `attachments[]` |

See [examples/landing.html](./examples/landing.html) for a live walkthrough.

## How the skill resolves selectors

<p align="center"><img src="./docs/images/selector-fallback.jpg" alt="Four-layer selector fallback: id → fbId → cssPath → contentHash" width="620"></p>

When `apply.mjs` writes back, it tries the selector strategies in order:

1. **id** — fastest, most stable
2. **fbId** — Redline-internal data attribute, survives DOM reordering
3. **cssPath** — generated CSS selector path
4. **contentHash** — sample of element's text content + tag name

So even if the agent regenerates the HTML between your review and the patch, redline can still find the right element via content matching.

## Privacy

Zero collection. No servers, no analytics, no third-party SDKs. Everything stays in your browser and on your disk. See [PRIVACY.md](./PRIVACY.md).

## Development

```bash
npm install              # esbuild + vitest + happy-dom
npm run build            # → dist/redline.js (minified, ~238kb)
npm run build:ext        # build + copy bundle to extension/ + skill/
npm run watch            # watch mode for src/
npm test                 # vitest, 18 tests
npm run demo             # opens examples/standalone.html in browser
node tests/e2e-zip.mjs   # ZIP round-trip + selector resolution end-to-end
```

Architecture:
- `src/` — widget source (modular, ESM)
- `dist/redline.js` — bundled IIFE for browser injection
- `extension/` — Chrome MV3 extension shell (popup, options, i18n)
- `skill/` — Claude Code skill (`prepare.mjs`, `apply.mjs`, SKILL.md)
- `docs/` — GitHub Pages output (landing + privacy)
- `examples/` — standalone demos and the marketing landing pages

## Links

- 🌐 Landing page: [examples/landing.html](./examples/landing.html) ([中文](./examples/landing.zh.html))
- 📋 Changelog: [CHANGELOG.md](./CHANGELOG.md)
- 🔒 Privacy: [PRIVACY.md](./PRIVACY.md)
- 🛠 Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 📦 Web Store submission: [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)

## License

[MIT](./LICENSE) © 2026 Dongke-X · 小红书 [@东可 Talk](https://www.xiaohongshu.com/user/profile/5a8e8eb8db2e600ca3d43349)
