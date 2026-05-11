<div align="center">

# Redline

**Visual feedback for any HTML — for the agent era.**

The agent writes HTML. You review it in the browser. The agent applies your changes back to source. Closed loop, no Figma, no Loom.

[![version](https://img.shields.io/badge/version-0.1.0-c8242c)](./CHANGELOG.md) [![tests](https://img.shields.io/badge/tests-17%20passing-brightgreen)](./tests) [![bundle](https://img.shields.io/badge/bundle-153kb-blue)](./dist) [![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**Languages:** **English** · [简体中文](./README.zh.md)

</div>

---

## What is this

Three things shipped together:

1. **A browser-injected editor** — edit text in place, draw region annotations, paste screenshots, save as a clean ZIP
2. **A Claude Code skill** — `prepare.mjs` injects the editor into any HTML; `apply.mjs` patches your feedback back to source
3. **A Chrome extension** — for reviewing live URLs (https / file://)

The skill alone is enough — you can use Redline without installing the extension. The extension is for the case where the HTML you want to review isn't yours to modify (live staging URLs, third-party pages).

```
   Agent writes report.html
            ↓
   ┌─────────────────────────┐
   │ skill: prepare.mjs       │  ← injects editor into HTML
   └─────────────────────────┘
            ↓
   Open in browser → edit / annotate / screenshot → Save
            ↓
   ZIP downloaded with session.json + .md + images
            ↓
   ┌─────────────────────────┐
   │ skill: apply.mjs         │  ← patches changes to source
   └─────────────────────────┘
            ↓
   report.html reflects your feedback
```

## <a id="install"></a>Install

### Skill only (recommended for AI-generated HTML)

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
make edits, hit Save → ZIP downloads to ~/Downloads
        ↓
you:    "apply the redline feedback"
claude: reads ZIP, applies edits to ./report.html, walks you through annotations
```

### Chrome extension (for live URLs / staging / file://)

1. `npm run build:ext`
2. Chrome → `chrome://extensions/` → toggle Developer mode
3. Load unpacked → select `extension/`
4. Click the toolbar Redline icon on any page → injects the editor

Web Store submission is in progress. See [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md).

## Three core scenarios

| | When | What you mark up | What ships in the ZIP |
|---|---|---|---|
| **HTML decks** | Reveal.js / `<deck-stage>` / plain HTML slides | per-slide text edits, region notes | `section: slide-N` tagged on each edit |
| **HTML docs** | Long-form HTML reports, RFCs, white papers | section annotations, paragraph rewrites | `perSection` feedback grouped by §  |
| **HTML pages** | Agent-generated landings, dashboards, prototypes | full mix: edits + annotations + screenshots | unified `edits[]` + `annotations[]` + `attachments[]` |

See [examples/landing.html](./examples/landing.html) for a live walkthrough.

## How the skill resolves selectors

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
npm run build            # → dist/redline.js (minified, ~153kb)
npm run build:ext        # build + copy bundle to extension/ + skill/
npm run watch            # watch mode for src/
npm test                 # vitest, 17 tests
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
