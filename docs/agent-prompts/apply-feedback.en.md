# Apply redline feedback — universal LLM prompts (EN)

Use these prompts when you've exported a redline ZIP and want to apply the feedback to your source HTML using **any LLM** — ChatGPT, Claude (web), DeepSeek, Tongyi, Zhipu, Coze-hosted agents, Dify workflows, anything.

The Claude Code `apply.mjs` skill is still the smoothest path (it handles selector fallbacks and writes to disk automatically), but these templates give you the same closed loop with whatever chat interface you can access.

---

## Full prompt — handles all edit types + annotations + feedback

Paste this into your LLM, then replace `<paste your HTML here>` and `<paste your session.json here>` with the actual contents from your downloaded ZIP.

````
Apply HTML review feedback to source.

INPUTS:
  - Original HTML source (between <HTML> markers)
  - redline session.json (between <SESSION_JSON> markers)

RULES — for each item in `edits[]`:

| op | Action |
|---|---|
| text | Find element, replace textContent with `after`, preserve inner markup where possible |
| hide | Add inline style="visibility: hidden" |
| delete | Remove element from DOM |
| move | Add/merge inline style="transform: translate(Xpx, Ypx)" |
| scale | Add/merge transform: scale(N) |
| rotate | Add/merge transform: rotate(Ndeg) |
| font | Add inline style="font-family: ..." |
| note | Do not change source — list in summary |
| replace-img | Skip — list in summary for manual review |

SELECTOR RESOLUTION (try in order, stop at first match):
1. selector.id — use directly if present
2. selector.fbId — match `[data-fbw-edit-id="..."]`
3. selector.cssPath — use the CSS selector path
4. selector.contentHash.sample — find element whose `textContent.trim().slice(0, 40)` equals this sample

If no match found: skip the edit and warn in summary.

ANNOTATIONS — do not auto-patch. For each item in `annotations[]`, list in summary:
  "In [secLabel] (~W%×H% region of the section): [text] (ref image: [image.filename])"

FEEDBACK — do not auto-patch. List `feedback.global` and `feedback.perSection` items in summary as narrative considerations for me to decide on.

OUTPUT:
1. Complete patched HTML wrapped in ```html ... ```
2. Summary section:
   - ✓ N edits applied
   - ✗ M edits skipped (with reasons)
   - ⚠ K annotations awaiting manual decision
   - ℹ Global / per-section feedback narrative

<HTML>
<paste your HTML here>
</HTML>

<SESSION_JSON>
<paste your session.json here>
</SESSION_JSON>
````

---

## Lite prompt — text edits only

If your feedback is mostly text changes, use this shorter version. Costs fewer tokens and works with smaller-context LLMs.

````
Apply text edits to HTML.

For each item in `edits[]` where `op === "text"`:
  - Find element via selector.id, then [data-fbw-edit-id], then cssPath, then contentHash.sample
  - Replace textContent with the `after` value

Skip all other op types and annotations.

Output the complete patched HTML in ```html ... ``` only — no commentary.

<HTML>
<paste your HTML here>
</HTML>

<SESSION_JSON>
<paste your session.json here>
</SESSION_JSON>
````

---

## Tips

- **Long HTML / context limits.** Some LLMs truncate inputs above ~100K tokens. If your HTML is large, strip whitespace first, or split into sections and apply edits in batches.
- **Output truncation on smaller LLMs.** DeepSeek / Tongyi / domestic LLMs often have shorter output limits. Ask for a structured **change list** instead of the full HTML:
  ```
  Instead of outputting the full patched HTML, list each change as:
    { "id|fbId|cssPath": "...", "before": "...", "after": "..." }
  ```
  Then apply the changes locally with a small script or by hand.
- **Always back up.** LLM-applied changes can drift — verify the diff before overwriting:
  ```bash
  cp source.html source.html.bak.$(date +%s)
  ```
- **Annotations need you, not the LLM.** Image-based annotations and free-text feedback are intentionally not auto-applied — they need your design judgment. The LLM lists them so you can decide.

---

## Why these templates exist

redline's browser editor and Chrome extension work for everyone — no Claude account needed. But the original "apply back to source" path was Claude Code–only. These prompts make that final step LLM-agnostic, so anyone can complete the feedback loop with whatever LLM they have access to.

If you're using Claude Code, the [skill](https://github.com/Dongke-X/redline/tree/main/skill) is still the smoothest path. If not, these templates are your closed loop.
