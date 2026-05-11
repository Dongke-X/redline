#!/usr/bin/env node
// 命令行工具：把 redline 的 session.json 应用到源 HTML。
// 用法：apply.mjs <session.json> [<source.html>] [--dry-run]
//   - session.json：~/.redline/sessions/ 下的某个文件
//   - source.html：默认从 session.page.pathname 读取，可显式指定覆盖
//   - --dry-run：只打印将做什么，不写盘
//
// 仅处理 edits[]（text / move / scale / rotate / hide / delete / font）。
// annotations / feedback narrative / replace-img 不动，让 SKILL.md 流程让 Claude 跟用户对齐。
//
// 依赖：jsdom（npm i jsdom -g 或在项目里 npx jsdom）。
// 不强依赖时会 fallback 用 cheerio；都没有则 exit 1 让用户安装。

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── skill 自身版本（从 package.json 读，作为 widgetVersion 兼容性比对的基线）
const __here = dirname(fileURLToPath(import.meta.url));
let SKILL_VERSION = '0.0.0';
try {
  SKILL_VERSION = JSON.parse(readFileSync(resolve(__here, 'package.json'), 'utf8')).version || '0.0.0';
} catch {}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
if (args.includes('--version') || args.includes('-v')) {
  console.log(`redline apply ${SKILL_VERSION}`);
  process.exit(0);
}
const positional = args.filter(a => !a.startsWith('--'));
const sessionPath = positional[0];
const sourceOverride = positional[1];

if (!sessionPath) {
  console.error('Usage: apply.mjs <session.json> [<source.html>] [--dry-run] [--version]');
  process.exit(1);
}

if (!existsSync(sessionPath)) {
  console.error(`Session file not found: ${sessionPath}`);
  process.exit(1);
}

let session;
try {
  session = JSON.parse(readFileSync(sessionPath, 'utf8'));
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

// 版本兼容性提示：widget 比 skill 新时，可能有 schema 字段没处理；反之 skill 旧也提醒
const wv = session.widgetVersion;
if (wv) {
  const cmp = (a, b) => {
    const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
    const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
  };
  const diff = cmp(wv, SKILL_VERSION);
  if (diff > 0) {
    console.warn(`⚠ session 是 widget v${wv} 写的，本 skill v${SKILL_VERSION} 较旧，建议升级：`);
    console.warn(`  cd ${__here} && git pull && npm install`);
  } else if (diff < 0) {
    console.warn(`ℹ session 来自较旧 widget v${wv}（skill v${SKILL_VERSION}），向后兼容应用中`);
  }
}
if (session.schemaVersion && session.schemaVersion !== '1.0') {
  console.warn(`⚠ schemaVersion=${session.schemaVersion}，本 apply 仅支持 1.0，可能有字段未处理`);
}

const sourcePath = sourceOverride || session.page?.pathname;
if (!sourcePath || !existsSync(sourcePath)) {
  console.error(`Source HTML not found: ${sourcePath || '(missing page.pathname)'}`);
  process.exit(1);
}

const sourceHtml = readFileSync(sourcePath, 'utf8');

// ─── 加载 jsdom（优先 skill 自带 node_modules → 用户全局 → 用户当前项目）
let dom = null;
let doc = null;

async function loadJsdom() {
  // 1. skill 目录自带（首选）
  const here = dirname(new URL(import.meta.url).pathname);
  const skillNm = resolve(here, 'node_modules/jsdom');
  if (existsSync(skillNm)) {
    return (await import(skillNm + '/lib/api.js')).JSDOM;
  }
  // 2. 直接 import（NODE_PATH / 全局 / 当前项目 都行）
  try {
    return (await import('jsdom')).JSDOM;
  } catch (_) { /* fallthrough */ }
  return null;
}

let JSDOM = await loadJsdom();
if (!JSDOM) {
  // 自动尝试在 skill 目录里 npm install
  const here = dirname(new URL(import.meta.url).pathname);
  console.error(`jsdom not found. Auto-installing in ${here}...`);
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('npm', ['install', '--silent'], { cwd: here, stdio: 'inherit' });
  if (r.status === 0) {
    JSDOM = await loadJsdom();
  }
}
if (!JSDOM) {
  console.error('Failed to load jsdom. Manually run:  cd ' + dirname(new URL(import.meta.url).pathname) + ' && npm install');
  process.exit(1);
}

dom = new JSDOM(sourceHtml);
doc = dom.window.document;
const useJsdom = true;

const SECTION_SELECTORS = 'section.slide, section.section, section[data-screen-label], main > section, main > article, body > header, header[data-screen-label], footer';

// ─── 元素定位：三层 fallback
function resolveElement(selector) {
  if (!selector) return { ok: false, reason: 'no-selector' };

  // 1. id
  if (selector.id) {
    const el = doc.getElementById(selector.id);
    if (el) return { ok: true, el, via: 'id' };
  }

  // 2. cssPath（清掉 data-fbw-sec-id 的引用，因为源里没有这属性，
  //    用 section index + 内部 path 重新构造）
  if (selector.cssPath) {
    const path = selector.cssPath;
    const secMatch = path.match(/\[data-fbw-sec-id="(fbw-sec-(\d+))"\](.*)/);
    if (secMatch) {
      const secIndex = parseInt(secMatch[2], 10);
      const innerPath = (secMatch[3] || '').trim().replace(/^>\s*/, '');
      const sections = doc.querySelectorAll(SECTION_SELECTORS);
      const sec = sections[secIndex];
      if (sec) {
        try {
          const el = innerPath ? sec.querySelector(innerPath) : sec;
          if (el) return { ok: true, el, via: 'cssPath' };
        } catch (_) {}
      }
    } else {
      try {
        const el = doc.querySelector(path);
        if (el) return { ok: true, el, via: 'cssPath' };
      } catch (_) {}
    }
  }

  // 3. contentHash —— 找 textContent 前 40 字一致的同 tag 元素
  if (selector.contentHash?.sample && selector.tag) {
    const sample = selector.contentHash.sample;
    const candidates = doc.querySelectorAll(selector.tag);
    for (const el of candidates) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      if (t === sample) return { ok: true, el, via: 'contentHash' };
    }
  }

  return { ok: false, reason: 'not-found' };
}

// ─── 应用单个 edit
function applyEdit(edit, stats) {
  // 评审模式提案：不自动 patch（线上页面没源能改，且语义是"建议"，让 Claude 跟用户对齐）
  if (edit.proposed) {
    stats.skipped = (stats.skipped || 0) + 1;
    stats.proposals = stats.proposals || [];
    stats.proposals.push(edit);
    return false;
  }

  const r = resolveElement(edit.selector);
  if (!r.ok) {
    stats.failed++;
    stats.failures.push({ edit, reason: r.reason });
    return false;
  }
  const el = r.el;
  const op = edit.op;

  try {
    if (op === 'text') {
      // 验证 before（content drift 检测）
      if (edit.before !== undefined) {
        const cur = (el.textContent || '').replace(/^\s+|\s+$/g, '');
        if (cur !== edit.before && !cur.startsWith(edit.before.slice(0, 20))) {
          stats.failed++;
          stats.failures.push({ edit, reason: 'content-drift', current: cur.slice(0, 40) });
          return false;
        }
      }
      el.textContent = edit.after;
    } else if (op === 'move') {
      const t = (el.style.transform || '').replace(/translate\([^)]+\)/g, '').trim();
      el.style.transform = (t + ` translate(${edit.args.x}px, ${edit.args.y}px)`).trim();
    } else if (op === 'scale') {
      const t = (el.style.transform || '').replace(/scale\([^)]+\)/g, '').trim();
      el.style.transform = (t + ` scale(${edit.args.scale})`).trim();
    } else if (op === 'rotate') {
      const t = (el.style.transform || '').replace(/rotate\([^)]+\)/g, '').trim();
      el.style.transform = (t + ` rotate(${edit.args.rotate}deg)`).trim();
    } else if (op === 'hide') {
      el.style.visibility = 'hidden';
    } else if (op === 'delete') {
      el.remove();
    } else if (op === 'font') {
      el.style.fontFamily = edit.args.family === '系统默认' ? '' : edit.args.family;
    } else if (op === 'href') {
      // 改超链接 href。验 before（漂移检测）
      if (edit.args?.before !== undefined) {
        const cur = el.getAttribute('href') || '';
        if (cur !== edit.args.before) {
          stats.failed++;
          stats.failures.push({ edit, reason: 'href-drift', current: cur });
          return false;
        }
      }
      const after = edit.args?.after ?? '';
      if (after) el.setAttribute('href', after);
      else el.removeAttribute('href');
    } else if (op === 'tag') {
      // 改元素标签：p ↔ h1/h2/h3/h4。漂移检测：当前 tag 必须跟 args.from 一致
      const from = (edit.args?.from || '').toLowerCase();
      const to = (edit.args?.to || '').toLowerCase();
      if (!to || !/^(p|h[1-6])$/.test(to)) {
        stats.failed++;
        stats.failures.push({ edit, reason: `invalid tag: ${to}` });
        return false;
      }
      const curTag = el.tagName.toLowerCase();
      if (from && curTag !== from) {
        stats.failed++;
        stats.failures.push({ edit, reason: 'tag-drift', current: curTag });
        return false;
      }
      const newEl = el.ownerDocument.createElement(to);
      for (const attr of el.attributes) newEl.setAttribute(attr.name, attr.value);
      newEl.innerHTML = el.innerHTML;
      el.parentNode.replaceChild(newEl, el);
    } else if (op === 'note' || op === 'replace-img') {
      stats.skipped++;
      stats.skips.push({ edit, reason: `op=${op} 不自动处理（让 Claude 跟用户对齐）` });
      return false;
    } else {
      stats.failed++;
      stats.failures.push({ edit, reason: `unknown op: ${op}` });
      return false;
    }
    stats.applied++;
    return true;
  } catch (e) {
    stats.failed++;
    stats.failures.push({ edit, reason: e.message });
    return false;
  }
}

// ─── 跑一遍
const edits = Array.isArray(session.edits) ? session.edits : [];
const stats = { applied: 0, failed: 0, skipped: 0, failures: [], skips: [] };

console.log(`\n📂 Session: ${sessionPath}`);
console.log(`📄 Source:  ${sourcePath}`);
console.log(`✏  Edits:   ${edits.length}\n`);

for (const edit of edits) {
  applyEdit(edit, stats);
}

// 清理 widget 内部 attrs
['fbwEditId', 'fbwSecId', 'fbwSecLabel', 'fbwTx', 'fbwTy', 'fbwScale', 'fbwRotate', 'fbwOriginalSrc', 'fbwFontName', 'fbwOpDeleted', 'fbwOpHidden'].forEach(prop => {
  const sel = '[data-' + prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ']';
  doc.querySelectorAll(sel).forEach(el => delete el.dataset[prop]);
});
doc.querySelectorAll('.fbw-changed, .fbw-selected').forEach(el => {
  el.classList.remove('fbw-changed');
  el.classList.remove('fbw-selected');
});

// ─── 报告
console.log(`✓ ${stats.applied} 应用`);
if (stats.failed > 0) {
  console.log(`✗ ${stats.failed} 失败：`);
  for (const f of stats.failures.slice(0, 10)) {
    const desc = f.edit.descriptor || f.edit.selector?.contentHash?.sample || '?';
    console.log(`    · ${f.edit.op} on "${desc}" → ${f.reason}`);
  }
  if (stats.failures.length > 10) console.log(`    ... +${stats.failures.length - 10} more`);
}
if (stats.skipped > 0) {
  console.log(`⚠ ${stats.skipped} 跳过（note/replace-img/proposed 让 Claude 处理）`);
}
if (stats.proposals?.length) {
  console.log(`\n💡 ${stats.proposals.length} 条评审模式"提案"待人工对齐（review 模式专属，不动源）：`);
  stats.proposals.slice(0, 10).forEach((p, i) => {
    const desc = p.descriptor || p.selector?.contentHash?.sample || '?';
    console.log(`  ${i + 1}. ${p.op}${p.args ? '(' + JSON.stringify(p.args) + ')' : ''} on "${desc}"`);
  });
  if (stats.proposals.length > 10) console.log(`    ... +${stats.proposals.length - 10} more`);
}

// annotations / feedback summary
if (session.annotations?.length) {
  console.log(`\n📍 ${session.annotations.length} 区域标注 待人工对齐（不自动写）：`);
  session.annotations.forEach((a, i) => {
    const pct = a.rectPct || {};
    const region = `(x=${(pct.x * 100 || 0).toFixed(0)}%, y=${(pct.y * 100 || 0).toFixed(0)}%, ${(pct.w * 100 || 0).toFixed(0)}×${(pct.h * 100 || 0).toFixed(0)}%)`;
    console.log(`    ${i + 1}. [${a.secLabel || '?'}] ${region} ${a.text || ''} ${a.image?.filename ? '· 图: ' + a.image.filename : ''}`);
  });
}
if (session.feedback?.global) {
  console.log(`\n💬 全局留言：${session.feedback.global}`);
}
if (session.feedback?.perSection?.length) {
  console.log(`\n💬 页面留言（${session.feedback.perSection.length} 条）：`);
  session.feedback.perSection.forEach(f => {
    console.log(`    · [${f.secLabel}] ${f.note}`);
  });
}

// ─── 写盘
if (dryRun) {
  console.log(`\n🔍 --dry-run，未写入。`);
  process.exit(0);
}

if (stats.applied === 0) {
  console.log(`\n0 处可应用，未写入。`);
  process.exit(0);
}

// 备份
const backupPath = sourcePath.replace(/\.html?$/i, '') + '.bak.' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.html';
copyFileSync(sourcePath, backupPath);

// 写入
const outHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
writeFileSync(sourcePath, outHtml);

console.log(`\n💾 已写入 ${sourcePath}`);
console.log(`📦 备份 ${backupPath}`);
