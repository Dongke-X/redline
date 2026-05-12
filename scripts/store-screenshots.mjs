#!/usr/bin/env node
// 给 Chrome Web Store 上架用的截图脚本。
// 7 张图：5 张商店截图 (1280×800) + 2 张宣传图块 (440×280, 1400×560)
// 输出到 ~/Desktop/redline-store-assets/

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __here = dirname(fileURLToPath(import.meta.url));
const root = dirname(__here);
const LANDING_ZH = `file://${root}/examples/landing.html`;  // 改为英文版（Web Store 主语言）

const OUT = join(process.env.HOME, 'Desktop/redline-store-assets');
mkdirSync(OUT, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

console.log('启动 Chrome...');
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: null,
  args: ['--hide-scrollbars'],
});

async function shoot({ name, width, height, url, scrollY = 0, fullPage = false, prepFn = null }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  if (prepFn) await prepFn(page);
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
    await new Promise(r => setTimeout(r, 200));
  }
  const out = join(OUT, name);
  await page.screenshot({ path: out, type: 'png', fullPage, omitBackground: false });
  await page.close();
  console.log(`  ✓ ${name}`);
}

// ─── 商店截图 1280×800 ─────────────────────────────────────
// 1. Hero — 第一印象，立刻看到 mockup
await shoot({
  name: '01-hero.png',
  width: 1280, height: 800, url: LANDING_ZH, scrollY: 0,
});

// 2. 三个核心场景
await shoot({
  name: '02-scenarios.png',
  width: 1280, height: 800, url: LANDING_ZH,
  prepFn: async (page) => {
    await page.evaluate(() => {
      const el = document.getElementById('scenarios');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  },
});

// 3. 随改随预览 + PDF 导出
await shoot({
  name: '03-preview-pdf.png',
  width: 1280, height: 800, url: LANDING_ZH,
  prepFn: async (page) => {
    await page.evaluate(() => {
      const el = document.getElementById('preview');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  },
});

// 4. 配套 Skill — 闭环说明 + 安装 + 对话示例
await shoot({
  name: '04-skill.png',
  width: 1280, height: 800, url: LANDING_ZH,
  prepFn: async (page) => {
    await page.evaluate(() => {
      const el = document.getElementById('skill');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  },
});

// 5. Schema — JSON 输出，体现技术深度
await shoot({
  name: '05-schema.png',
  width: 1280, height: 800, url: LANDING_ZH,
  prepFn: async (page) => {
    await page.evaluate(() => {
      const el = document.getElementById('schema');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  },
});

// ─── 宣传图块（独立文件，不从 landing 截）─────────────────
// 6. 小型宣传图块 440×280 — Logo + slogan
const promoSmallHTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin:0; padding:0; width:440px; height:280px;
    background:#faf6f1; color:#1a1815;
    font-family:"Charter","Songti SC",Georgia,serif;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    -webkit-font-smoothing:antialiased; }
  .mark { width:64px; height:64px; margin-bottom:18px; }
  h1 { font-size:30px; font-weight:600; margin:0 0 8px; letter-spacing:-0.01em; }
  p { font-size:13px; color:#4a463f; margin:0; font-style:italic; max-width:340px; text-align:center; line-height:1.5; }
  .red { color:#c8242c; }
</style></head><body>
  <svg class="mark" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#f5f4ed"/>
    <text x="64" y="116" text-anchor="middle" font-family="Georgia, serif" font-size="148" font-weight="700" fill="#141413">R</text>
    <rect x="6" y="64" width="116" height="20" rx="10" fill="#dc3c3c"/>
  </svg>
  <h1>Redline</h1>
  <p>Visual feedback for any HTML — <span class="red">for the agent era.</span></p>
</body></html>`;
const promoSmallPath = join(OUT, '_promo-small.html');
writeFileSync(promoSmallPath, promoSmallHTML);
await shoot({
  name: '06-promo-440x280.png',
  width: 440, height: 280, url: `file://${promoSmallPath}`,
});

// 7. 顶部宣传图块 1400×560 — hero 主视觉横幅
const promoLargeHTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin:0; padding:0; width:1400px; height:560px;
    background:#faf6f1; color:#1a1815;
    font-family:"Charter","Songti SC",Georgia,serif;
    -webkit-font-smoothing:antialiased; overflow:hidden; }
  .wrap { display:flex; height:560px; padding:0 80px; align-items:center; gap:60px; }
  .left { flex:1; }
  .mark { width:54px; height:54px; margin-bottom:24px; }
  .eyebrow { display:inline-block; font-family:-apple-system,system-ui,sans-serif;
    font-size:11px; letter-spacing:0.14em; color:#c8242c; font-weight:600;
    border:1px solid #c8242c; border-radius:999px; padding:4px 12px; margin-bottom:22px; }
  h1 { font-size:54px; line-height:1.05; font-weight:500; margin:0 0 22px; letter-spacing:-0.015em; }
  h1 em { font-style:italic; color:#c8242c; }
  p { font-family:-apple-system,"PingFang SC",system-ui,sans-serif;
    font-size:17px; line-height:1.55; color:#4a463f; margin:0; max-width:520px; }
  .right { flex:1; display:flex; align-items:center; justify-content:center; }
  .mockup { width:100%; max-width:520px; aspect-ratio:16/10;
    background:#fff; border-radius:14px; border:1px solid #d8cdba;
    box-shadow:0 8px 32px rgba(26,24,21,.06); position:relative; overflow:hidden; }
  .bar { display:flex; align-items:center; gap:6px; padding:10px 14px;
    background:#f3ece1; border-bottom:1px solid #d8cdba; }
  .dot { width:9px; height:9px; border-radius:50%; background:#d6cdb8; }
  .url { flex:1; margin:0 10px; padding:3px 10px; background:#fff;
    border-radius:4px; font-family:ui-monospace,monospace; font-size:10px; color:#888; }
  .ext { width:18px; height:18px; }
  .body { padding:30px 28px; }
  .body h2 { font-family:Georgia,serif; font-size:22px; margin:0 0 8px; }
  .body small { color:#888; font-family:-apple-system,sans-serif; font-size:11px; }
  .pill { position:absolute; top:62px; right:36px;
    background:#1a1815; color:#faf6f1; font-family:-apple-system,sans-serif;
    font-size:11px; padding:4px 12px 4px 8px; border-radius:13px; display:flex; align-items:center; gap:6px; }
  .pill::before { content:""; width:7px; height:7px; border-radius:50%; background:#c8242c; }
  .strike { text-decoration:line-through; opacity:0.6; }
</style></head><body>
  <div class="wrap">
    <div class="left">
      <svg class="mark" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="28" fill="#f5f4ed"/>
        <text x="64" y="116" text-anchor="middle" font-family="Georgia, serif" font-size="148" font-weight="700" fill="#141413">R</text>
        <rect x="6" y="64" width="116" height="20" rx="10" fill="#dc3c3c"/>
      </svg>
      <span class="eyebrow">Chrome extension · MIT · v0.1.0</span>
      <h1>Visual feedback<br>for <em>any HTML</em>.</h1>
      <p>Edit text, draw region annotations, paste screenshots — ship a clean structured bundle to your agent. Works on HTML decks, docs, and web apps.</p>
    </div>
    <div class="right">
      <div class="mockup">
        <div class="bar">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          <div class="url">file:///~/agent-out/report.html</div>
          <svg class="ext" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#f5f4ed"/><text x="64" y="116" text-anchor="middle" font-family="Georgia, serif" font-size="148" font-weight="700" fill="#141413">R</text><rect x="6" y="64" width="116" height="20" rx="10" fill="#dc3c3c"/></svg>
        </div>
        <div class="body">
          <h2>从这里开始 · 3 分钟</h2>
          <small>你刚装好的系统的快速上手指南</small>
        </div>
        <div class="pill">已编辑 · <span class="strike">入门指南</span></div>
      </div>
    </div>
  </div>
</body></html>`;
const promoLargePath = join(OUT, '_promo-large.html');
writeFileSync(promoLargePath, promoLargeHTML);
await shoot({
  name: '07-promo-1400x560.png',
  width: 1400, height: 560, url: `file://${promoLargePath}`,
});

await browser.close();
console.log(`\n✓ 输出到：${OUT}`);
