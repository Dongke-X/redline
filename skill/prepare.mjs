#!/usr/bin/env node
// 把 redline 编辑器注入到任意 HTML 文件，无需 Chrome 扩展。
//
// 用法：
//   prepare.mjs <html-file>            把 redline.js 拷到 HTML 同目录 + 加 <script src="redline.js">
//   prepare.mjs <html-file> --inline   不拷文件，直接把 153KB bundle 内联进 <script>...</script>
//   prepare.mjs <html-file> --remove   移除之前注入的（idempotent，可反复调）
//   prepare.mjs <dir>                  目录批量：找出所有 .html 一起 prep
//
// 注入位置：</body> 前；用 HTML 注释边界包裹方便定位 / 清理：
//   <!-- redline-injection-begin -->
//   <script src="redline.js"></script>
//   <!-- redline-injection-end -->
//
// 重复 prep 不会叠加（自动替换旧的注入块）。
// 自动写 .bak.<timestamp> 备份原文件。

import { readFileSync, writeFileSync, copyFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __here = dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = resolve(__here, 'redline.js');

const BEGIN = '<!-- redline-injection-begin -->';
const END = '<!-- redline-injection-end -->';
const INJECTION_RE = new RegExp(
  `\\s*${BEGIN.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*`,
  'g'
);

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));

if (positional.length === 0) {
  console.error('用法：prepare.mjs <html-file-or-dir> [--inline] [--remove]');
  process.exit(1);
}

if (!existsSync(BUNDLE_PATH)) {
  console.error(`✗ 找不到 bundle：${BUNDLE_PATH}`);
  console.error(`  跑 'npm run build:ext' 先构建`);
  process.exit(1);
}

const targets = collectHtmlFiles(positional[0]);
if (targets.length === 0) {
  console.error(`✗ 没找到 HTML 文件：${positional[0]}`);
  process.exit(1);
}

const inline = flags.has('--inline');
const remove = flags.has('--remove');
const mode = remove ? 'remove' : (inline ? 'inline' : 'sibling');

let count = 0;
for (const target of targets) {
  if (processFile(target, mode)) count++;
}

console.log(`\n✓ ${remove ? '移除' : '注入'} 完成：${count}/${targets.length} 个文件`);
if (!remove) {
  console.log('  浏览器打开 HTML 即可，不需要 Chrome 扩展。');
  console.log('  按 F 开反馈面板，按 E 进编辑模式，Save 下载 ZIP。');
}

// ─── 实现 ──────────────────────────────────────────────────────

function collectHtmlFiles(targetPath) {
  const abs = resolve(targetPath);
  if (!existsSync(abs)) return [];
  const stat = statSync(abs);
  if (stat.isFile()) {
    return /\.html?$/i.test(abs) ? [abs] : [];
  }
  // 目录：递归找 .html，跳 node_modules / .git / .bak.
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.') || name.includes('.bak.')) continue;
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.html?$/i.test(name)) out.push(p);
    }
  };
  walk(abs);
  return out;
}

function processFile(filePath, mode) {
  const html = readFileSync(filePath, 'utf8');
  const hasInjection = INJECTION_RE.test(html);
  INJECTION_RE.lastIndex = 0;

  if (mode === 'remove') {
    if (!hasInjection) {
      console.log(`  ⊘ 跳过（无注入）：${rel(filePath)}`);
      return false;
    }
    backup(filePath, html);
    const next = html.replace(INJECTION_RE, '\n');
    writeFileSync(filePath, next);
    console.log(`  ✓ 移除：${rel(filePath)}`);
    return true;
  }

  // inject 或 re-inject
  let body = html.replace(INJECTION_RE, '\n'); // 先清掉旧的
  let injection;

  if (mode === 'inline') {
    const bundle = readFileSync(BUNDLE_PATH, 'utf8');
    injection = `${BEGIN}\n<script>${bundle}</script>\n${END}`;
  } else {
    // sibling 模式：拷 redline.js 到 HTML 同目录
    const targetBundle = join(dirname(filePath), 'redline.js');
    const needCopy = !existsSync(targetBundle)
      || readFileSync(targetBundle).length !== readFileSync(BUNDLE_PATH).length;
    if (needCopy) copyFileSync(BUNDLE_PATH, targetBundle);
    injection = `${BEGIN}\n<script src="redline.js"></script>\n${END}`;
  }

  // 在 </body> 前插
  let next;
  if (/<\/body>/i.test(body)) {
    next = body.replace(/<\/body>/i, `${injection}\n</body>`);
  } else {
    // 没 </body>：直接追加
    next = body.trimEnd() + '\n' + injection + '\n';
  }

  if (next === html) {
    console.log(`  ⊘ 已是最新：${rel(filePath)}`);
    return false;
  }
  backup(filePath, html);
  writeFileSync(filePath, next);
  const tag = mode === 'inline' ? 'inline · 153KB' : 'sibling · redline.js';
  console.log(`  ✓ ${hasInjection ? '更新' : '注入'} (${tag})：${rel(filePath)}`);
  return true;
}

function backup(filePath, content) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const bak = `${filePath}.bak.${stamp}`;
  if (!existsSync(bak)) writeFileSync(bak, content);
}

function rel(p) {
  return p.replace(process.env.HOME || '', '~');
}
