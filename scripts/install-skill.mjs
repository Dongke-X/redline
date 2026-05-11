#!/usr/bin/env node
// 把仓库 skill/ 目录安装到 Claude Code 的 skills 目录（~/.claude/skills/redline/）。
// 用法：npm run install:skill
//
// 做法：拷贝 SKILL.md / apply.mjs / README.md / CHANGELOG.md / package.json / redline.js。
// 不破坏 skill 目录里已有的 node_modules（jsdom 等）。
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = resolve(root, 'skill');
const dst = resolve(homedir(), '.claude/skills/redline');

if (!existsSync(src)) {
  console.error(`[install-skill] skill source not found: ${src}`);
  process.exit(1);
}

mkdirSync(dst, { recursive: true });

const files = ['SKILL.md', 'apply.mjs', 'README.md', 'CHANGELOG.md', 'package.json'];
for (const f of files) {
  const s = resolve(src, f);
  if (existsSync(s)) {
    copyFileSync(s, resolve(dst, f));
    console.log(`[install-skill] ${f} → ${dst}/${f}`);
  }
}

// 同步 widget bundle（如果已 build）
const distBundle = resolve(root, 'dist/redline.js');
if (existsSync(distBundle)) {
  copyFileSync(distBundle, resolve(dst, 'redline.js'));
  console.log(`[install-skill] redline.js (bundled) → ${dst}/redline.js`);
} else {
  console.warn(`[install-skill] dist/redline.js 不存在，先跑 npm run build`);
}

console.log(`\n[install-skill] done. apply.mjs 第一次跑会自动 npm install jsdom 在 ${dst}/`);
console.log(`[install-skill] 触发：在 Claude Code 里说"应用反馈"或"读 sessions"`);
