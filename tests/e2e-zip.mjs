// 端到端 ZIP 链路测试：
// 1) 模拟一份 session.json + 假图片 → 调 buildZip
// 2) 用 unzip 解压验文件结构
// 3) 验 session.json 字段、图片 hash 一致

import { writeFileSync, readFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import { buildZip } from '../src/fs/zip.js';

console.log('=== Redline E2E ZIP test ===\n');

// 1) 准备测试数据
const enc = new TextEncoder();
const sessionData = {
  schemaVersion: '1.0',
  appMode: 'deck',
  sessionId: 'fbw-sess-test-' + Date.now(),
  capturedAt: new Date().toISOString(),
  page: { url: 'file:///~/agent-out/q3-deck.html', title: 'Q3 review' },
  edits: [
    {
      op: 'text',
      section: 'slide-3',
      selector: 'section.slide:nth-of-type(3) > h1',
      before: 'Q3 metrics',
      after: 'Q3 results — what worked',
    },
  ],
  annotations: [
    {
      id: 'anno-7f3a',
      type: 'region',
      secId: 'slide-5',
      rectPct: { x: 12, y: 48, w: 35, h: 22 },
      note: 'chart too dense — switch to bar',
      image: { filename: 'session-anno-7f3a.png' },
    },
  ],
  attachments: [
    { id: 'att-1', name: 'ref.png', type: 'image/png', filename: 'session-att-01.png' },
  ],
  feedback: { global: 'deck overall: tighter intro' },
};

// 假 PNG 字节（最小 1x1 红点 PNG）
const fakePng = new Uint8Array([
  0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, 0x00,0x00,0x00,0x0d,
  0x49,0x48,0x44,0x52, 0x00,0x00,0x00,0x01, 0x00,0x00,0x00,0x01,
  0x08,0x02,0x00,0x00,0x00, 0x90,0x77,0x53,0xde, 0x00,0x00,0x00,0x0c,
  0x49,0x44,0x41,0x54, 0x08,0x99,0x63,0xf8,0xcf,0xc0,0x00,0x00,
  0x00,0x03,0x00,0x01, 0x5b,0xa6,0x6f,0x4d, 0x00,0x00,0x00,0x00,
  0x49,0x45,0x4e,0x44, 0xae,0x42,0x60,0x82,
]);
const fakePngHash = createHash('md5').update(fakePng).digest('hex');

const stem = 'q3-deck-2026-05-10-221500';
const entries = [
  { name: `${stem}.json`, data: enc.encode(JSON.stringify(sessionData, null, 2)) },
  { name: `${stem}.md`, data: enc.encode('# Q3 review feedback\n\n1 edit · 1 annotation · 1 attachment\n') },
  { name: `${stem}-anno-7f3a.png`, data: fakePng },
  { name: `${stem}-att-01.png`, data: fakePng },
];

// 2) 调真 buildZip
const blob = buildZip(entries);
const zipBytes = new Uint8Array(await blob.arrayBuffer());
console.log(`✓ buildZip produced ${zipBytes.length} bytes (${entries.length} entries)`);

// 3) 写到 tmp 解压
const tmp = mkdtempSync(join(tmpdir(), 'redline-e2e-'));
const zipPath = join(tmp, 'session.zip');
writeFileSync(zipPath, zipBytes);

const outDir = join(tmp, 'out');
execSync(`unzip -q "${zipPath}" -d "${outDir}"`);
const files = readdirSync(outDir).sort();
console.log(`✓ unzipped to ${outDir}`);
console.log(`  files: ${files.join(', ')}`);

// 4) 验证文件结构
const expected = entries.map(e => e.name).sort();
const ok = JSON.stringify(files) === JSON.stringify(expected);
if (!ok) {
  console.error(`✗ file list mismatch\n  expected: ${expected}\n  got: ${files}`);
  process.exit(1);
}
console.log(`✓ file list matches`);

// 5) 验 JSON 字段
const parsed = JSON.parse(readFileSync(join(outDir, `${stem}.json`), 'utf8'));
const checks = [
  ['schemaVersion', parsed.schemaVersion === '1.0'],
  ['appMode', parsed.appMode === 'deck'],
  ['edits[0].section', parsed.edits[0].section === 'slide-3'],
  ['annotations[0].secId', parsed.annotations[0].secId === 'slide-5'],
  ['annotations[0].image.filename', parsed.annotations[0].image.filename === 'session-anno-7f3a.png'],
];
for (const [k, v] of checks) {
  console.log(`  ${v ? '✓' : '✗'} ${k}`);
  if (!v) process.exit(1);
}

// 6) 验图片 byte 一致（CRC32 / Store 模式无解压损失）
for (const fname of [`${stem}-anno-7f3a.png`, `${stem}-att-01.png`]) {
  const got = readFileSync(join(outDir, fname));
  const gotHash = createHash('md5').update(got).digest('hex');
  if (gotHash !== fakePngHash) {
    console.error(`✗ ${fname} byte mismatch (corrupt zip?)`);
    process.exit(1);
  }
  console.log(`  ✓ ${fname} byte-perfect (md5 ${gotHash.slice(0, 8)}…)`);
}

// 清理
rmSync(tmp, { recursive: true, force: true });
console.log('\n=== ALL PASS ===\nbuildZip → unzip → schema → byte integrity 全链路验证通过');
