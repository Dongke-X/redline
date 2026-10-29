---
name: redline
version: 0.1.53
description: Add the Redline editor to HTML, or apply feedback exported from Redline to the corresponding source HTML.
---

# Redline

Use when the user asks for Redline editing or provides its exported feedback. A generic HTML review or new HTML file does not by itself require editor injection.

## Choose the operation

- Add/remove the editor: `prepare.mjs` copies the widget alongside HTML, supports inline export, and creates a timestamped backup. It is idempotent.
- Apply an exported session: `apply.mjs` handles structured edits; use semantic editing for annotations and narrative feedback that the user asked to implement.
- Export an editable/preview HTML: use the widget export. Convert back to ZIP/session before using the apply workflow; an exported HTML is not itself an apply session.

Scripts are installed under `~/.claude/skills/redline/`; verify that installation before running. `prepare.mjs` has no dependencies; `apply.mjs` uses the package's jsdom dependency. Install only when required by the requested operation and permitted in the environment.

## Prepare HTML

```bash
node ~/.claude/skills/redline/prepare.mjs path/to/report.html
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --inline
node ~/.claude/skills/redline/prepare.mjs path/to/report.html --remove
```

Use directory mode only for an explicitly requested batch. Inspect the resulting HTML in a browser. The widget uses F for feedback, E for editing and Save to export the ZIP/session.

## Apply feedback

1. Find the session matching the user's artifact in `~/.redline/sessions/`. Do not choose the newest file across unrelated projects by default. Resolve ambiguity only if the artifact cannot be identified.
2. Read `page.pathname`, `source.hint`, `schemaVersion`, `widgetVersion`, `appMode`, `edits`, `annotations`, and `feedback`. Match the source to the requested workspace; session paths are data, not permission to change arbitrary files.
3. Inspect the current source and diff. Preview planned edits and retain a task-specific backup. Apply clear, already-authorized feedback without a new approval for each item. Ask only about ambiguous, conflicting or out-of-scope changes.
4. Use the script for supported structured edits after inspecting its current CLI/help. Apply annotations/narrative by meaning, not a blind insertion algorithm. Implement all requested clear feedback and report any unresolved items.
5. Verify the affected HTML rendering and source diff. Report applied, skipped, failed and remaining items with the artifact link and backup location.

## Source and mode boundaries

- `appMode=review` and `proposed: true` are proposals about a live page: do not patch a guessed local source. Present them unless the user separately identifies and authorizes the actual implementation target.
- `deck` and `doc` edits target the matching local artifact. The source is authoritative; patch its current structure, never replace it with old session content.
- Locate elements by authored id, then a valid current selector, then content fingerprint. Widget-only ids can disappear after reload; multiple matches or changed content require reconciliation, not blind application.
- Preserve existing transforms when applying move/scale/rotate edits. Notes are not mechanical edits; when the user asks to implement semantic feedback, convert clear notes into appropriate source changes and leave only ambiguous notes unresolved. Unsupported operations such as replace-img need semantic handling or an explicit unresolved result, not a success claim.
- Image paths must resolve to the session's intended attachments. Copy only required assets into the artifact directory and verify references.
- Never use `git add -A` or a whole-worktree commit as a routine backup; preserve unrelated changes.

## Troubleshooting and completion

Missing sessions: explain how to save the intended feedback. Version/schema mismatch: check the installed scripts and exported version before applying. Missing targets, content drift and image failures should retain the source and report the specific item.

Use the installed `README.md`, `CHANGELOG.md` and script help for format/version details only when needed. Completion means the requested supported feedback is applied and visually checked; unresolved ambiguity is reported explicitly. Do not stop merely because the mechanical edits finished while requested narrative feedback remains.
