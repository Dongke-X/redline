# Redline · Privacy Policy

_Last updated: 2026-05-10_

Redline is a browser extension that lets you annotate, edit, and screenshot any
web page, then download the captured feedback as a ZIP file (or, optionally,
write it to a local folder you pick). It is designed to be **fully local** — no
data ever leaves your device through Redline itself.

## Data we collect

**None.** Redline has no servers, no analytics, no telemetry, and no third-party
SDKs. We do not see, transmit, or store any of your activity.

## Data the extension processes locally

When you use Redline on a page, the extension processes the following data
**inside your browser only**:

- The DOM of the page you injected Redline into (so you can edit text and
  select elements).
- Any annotations, edits, screenshots, and notes you create.
- Page metadata (URL, title, viewport size, locale, timezone, user agent
  string) that gets included in the exported `session.json`. This is captured
  so the AI agent that consumes the file can match feedback to the right
  source. It is never sent anywhere by Redline.

This data lives in:

- `chrome.storage.sync` — your save-mode preference and auto-inject domain
  list (synced across your Chrome profile by Chrome itself).
- `IndexedDB` — temporary storage for in-progress attachments and the local
  folder handle you grant if you use FS Access mode.
- The downloaded ZIP file or the folder you pick — whichever output mode you
  choose.

You can clear all of it at any time by uninstalling the extension or clearing
site/extension data in Chrome.

## Permissions explained

- **`activeTab`** — needed to inject Redline into the page you are currently
  viewing when you click the toolbar icon.
- **`scripting`** — needed to inject the Redline bundle into the page's main
  world so it can edit and annotate the DOM.
- **`storage`** — needed to remember your save-mode preference and auto-inject
  domain list. Uses `chrome.storage.sync`.
- **`<all_urls>` host permission** — Redline is only useful if you can use it
  on any web page you visit. The bundle is **only** injected when you
  explicitly click the toolbar icon (or the page matches a domain you added to
  auto-inject in Settings); we do not run code on pages in the background.

## Data sharing

We do not share any data, because we do not collect any data.

## Changes

If this policy ever changes, the new version will be committed to this same
file in the public repo, with a new "Last updated" date.

## Contact

Source code, issues, and questions: <https://github.com/Dongke-X/redline>
