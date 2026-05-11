# Chrome Web Store Listing — Redline

Ready-to-paste copy for the Chrome Web Store developer dashboard.

---

## Name (≤45 chars)
`Redline — Design Feedback for Any Web Page`

## Short description (≤132 chars)
`Annotate, edit, and screenshot any web page. Download a clean feedback bundle (JSON + Markdown + images) for your AI agent.`

## Category
`Productivity` (primary), `Developer Tools` (secondary if allowed)

## Language
English (default), Simplified Chinese

---

## Detailed description

> Visual design review, source-aware. Capture in the browser, ship a clean
> bundle to your AI agent.

Redline turns any web page into a markup canvas. Click the toolbar icon to
inject it into the current tab — then edit text inline, drag/resize/hide
elements, draw region annotations, paste screenshots, and leave notes. When
you're done, hit Save and Redline downloads a single ZIP containing:

- `session.json` — structured edits, annotations, and notes (with stable CSS
  selectors so an agent can patch the source HTML)
- `session.md` — a human-readable Markdown summary
- All your screenshot attachments as separate image files

Hand the ZIP to Claude / Cursor / your engineer. They can read the JSON,
apply the edits to source, and ship.

### Use cases

- Designers reviewing in-progress builds without "send me the Figma"
- PMs/founders writing spec changes against a live staging URL
- Engineers self-reviewing their own pages before merging
- Anyone giving feedback on a deck, landing page, or web app

### Why Redline (vs. screenshots + Loom)

- **Edits, not just descriptions.** Change "Subscribe" to "Get started" by
  actually typing it — the JSON records both before and after.
- **Source-mappable.** Every edit ships with a CSS selector, so an agent can
  apply changes to the source repo directly.
- **No account, no backend.** Everything happens in your browser. Output is a
  ZIP you control.
- **AI-native output.** The schema is documented and stable; agents (Claude
  Code, Cursor) have a Skill / prompt to consume it directly.

### Power-user mode

If you're a developer working on local files (file:// or localhost), enable
"Write to local folder" in Settings to write feedback straight into your
project's `~/.redline/sessions/` folder using the FileSystem Access API.

### What it does NOT do

- No telemetry, no analytics, no servers (see privacy policy).
- Cannot inject into chrome:// pages, the Chrome Web Store, or other
  extensions' pages (browser security, not a Redline limitation).
- Cross-origin iframes need to be triggered separately.

### Open source

Source, issues, and roadmap: https://github.com/Dongke-X/redline (MIT)

---

## Privacy practices (developer dashboard form)

**Single purpose**:
> Inject a feedback / annotation widget into web pages so the user can produce
> a structured feedback bundle (JSON + Markdown + screenshots) to hand off to
> an AI coding agent.

**Permission justifications**:

| Permission | Justification |
|---|---|
| `activeTab` | Required to inject the Redline widget into the user's active tab when they click the toolbar icon. |
| `scripting` | Required to execute `chrome.scripting.executeScript` and inject the bundled `redline.js` into the page's MAIN world so it can edit and annotate the DOM. |
| `storage` | Stores the user's save-mode preference (`zip` vs `folder`) and auto-inject domain list in `chrome.storage.sync`. No remote storage. |
| `host_permissions: <all_urls>` | The widget must be available on any page the user wants to review. Code is **only** injected when the user clicks the toolbar icon or the page matches a domain they added to auto-inject. No background page scraping. |

**Data usage disclosures**:

- ❌ Personally identifiable information — not collected
- ❌ Health information — not collected
- ❌ Financial / payment information — not collected
- ❌ Authentication information — not collected
- ❌ Personal communications — not collected
- ❌ Location — not collected
- ❌ Web history — not collected (the page URL is included in the export the
  user actively triggers, but never sent anywhere)
- ❌ User activity — not collected
- ❌ Website content — processed locally on the user's device only, included
  in the user-triggered export, never transmitted by us

**Privacy policy URL**:
> https://github.com/Dongke-X/redline/blob/main/PRIVACY.md

(or, if you set up GitHub Pages: `https://dongke-x.github.io/redline/PRIVACY`)

**Are remote code requests used?** No. The `redline.js` bundle is shipped
inside the extension package; nothing is fetched at runtime.

---

## Visual assets needed (TODO — see SUBMISSION_CHECKLIST.md)

- [ ] Icon 128×128 ✅ (already have)
- [ ] Screenshots 1280×800 — at least 1, up to 5
  1. Toolbar popup showing "Active on this tab"
  2. Editing text inline on a real demo page
  3. Drawing a region annotation
  4. Save panel with attached screenshots
  5. The downloaded ZIP contents in Finder
- [ ] Promotional tile 440×280 (optional but recommended)
- [ ] Marquee tile 1400×560 (optional, only for store featuring)

---

## Distribution

- Public listing
- Pricing: free
- Regions: all
