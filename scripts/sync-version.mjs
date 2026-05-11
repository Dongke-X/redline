#!/usr/bin/env node
// 把 package.json 的 version 同步到 extension/manifest.json + src/config.js。
// 在 build 之前自动跑（npm prebuild），保证三处永远一致。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version;
if (!version) {
  console.error('[sync-version] package.json 没读到 version');
  process.exit(1);
}

// 1. extension/manifest.json
const manifestPath = resolve(root, 'extension/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.version !== version) {
  manifest.version = version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[sync-version] manifest.json → ${version}`);
}

// 2. src/config.js 的 VERSION 常量
const configPath = resolve(root, 'src/config.js');
let config = readFileSync(configPath, 'utf8');
const updated = config.replace(/(export const VERSION = ['"])[^'"]+(['"])/, `$1${version}$2`);
if (updated !== config) {
  writeFileSync(configPath, updated);
  console.log(`[sync-version] config.js → ${version}`);
}

// 3. 仓库内 skill/SKILL.md + skill/package.json（开源主体）
const repoSkillDir = resolve(root, 'skill');
[
  resolve(repoSkillDir, 'package.json'),
  process.env.HOME ? resolve(process.env.HOME, '.claude/skills/redline/package.json') : null,
].filter(Boolean).forEach(p => {
  try {
    if (!p || !existsSync(p)) return;
    const skillPkg = JSON.parse(readFileSync(p, 'utf8'));
    if (skillPkg.version !== version) {
      skillPkg.version = version;
      writeFileSync(p, JSON.stringify(skillPkg, null, 2) + '\n');
      console.log(`[sync-version] ${p.replace(process.env.HOME || '', '~')} → ${version}`);
    }
  } catch (_) {}
});

[
  resolve(repoSkillDir, 'SKILL.md'),
  process.env.HOME ? resolve(process.env.HOME, '.claude/skills/redline/SKILL.md') : null,
].filter(Boolean).forEach(p => {
  try {
    if (!p || !existsSync(p)) return;
    let md = readFileSync(p, 'utf8');
    const updated = md.replace(/(\nversion:\s*)[^\n]+/, `$1${version}`);
    if (updated !== md) {
      writeFileSync(p, updated);
      console.log(`[sync-version] ${p.replace(process.env.HOME || '', '~')} → ${version}`);
    }
  } catch (_) {}
});

console.log(`[sync-version] ok @ ${version}`);
