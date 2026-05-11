// 把 widget 当前状态打包成 session.v1.json + 配套 .md，写到用户选的目录。
// 失败 / 不支持时退化为浏览器下载。
import { state } from '../core/state.js';
import { getChanges } from '../core/elements.js';
import { buildSelector } from '../core/selector.js';
import { fsAccessSupported, getStoredDirHandle, pickDirHandle } from './dirHandle.js';
import { buildMarkdown } from '../export/markdown.js';
import { buildZip } from './zip.js';
import { VERSION } from '../config.js';

/**
 * @typedef {import('../types.js').SessionData} SessionData
 * @typedef {import('../types.js').Edit} Edit
 */

export const SCHEMA_VERSION = '1.0';

/**
 * 把 widget 当前 state 序列化成 session.v1 数据对象。
 * 调用方（save.js / sessionWriter）负责落盘 / 下载。
 * @returns {SessionData}
 */
export function buildSessionData() {
  const note = state.panel?.querySelector('[data-fbw-global]')?.value?.trim() || '';
  const perSection = [];
  state.sectionFeedback.forEach((v, secId) => {
    perSection.push({ secId, secLabel: v.label, note: v.note });
  });

  const edits = [];

  // 文字编辑 (op=text)
  getChanges().forEach(c => {
    const el = document.querySelector(`[data-fbw-edit-id="${c.id}"]`);
    if (!el) return;
    edits.push({
      op: 'text',
      selector: buildSelector(el),
      section: c.section,
      before: c.before,
      after: c.after,
    });
  });

  // 元素操作 (move/scale/font/hide/delete/replace-img)
  state.elementOps.forEach((rec, el) => {
    rec.ops.forEach(op => {
      edits.push({
        op: op.op,
        selector: buildSelector(el),
        descriptor: rec.descriptor,
        ...(op.args !== undefined ? { args: op.args } : {}),
        ...(op.proposed ? { proposed: true } : {}),
      });
    });
  });

  const attachments = state.attachments.map(att => ({
    id: att.id,
    name: att.name,
    type: att.type,
    dataURL: att.dataURL,
  }));

  return {
    schemaVersion: SCHEMA_VERSION,
    widgetVersion: VERSION,
    appMode: state.appMode || 'deck',
    sessionId: 'fbw-sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    capturedAt: new Date().toISOString(),
    capturedAtMs: Date.now(),
    env: {
      userAgent: (navigator.userAgent || '').slice(0, 200),
      locale: (navigator.language || ''),
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    page: {
      url: location.href,
      title: document.title || null,
      pathname: location.pathname,
    },
    source: {
      hint: location.pathname.replace(/^.*\//, ''),
      matchBy: 'pathname',
    },
    feedback: {
      global: note || null,
      perSection,
    },
    edits,
    annotations: state.annotations.map(a => {
      const type = a.type || 'region';
      const base = {
        id: a.id,
        type,
        secId: a.secId,
        secLabel: a.secLabel,
        rectPct: a.rectPct,
      };
      if (type === 'floating') {
        return { ...base, content: a.content || '' };  // 浮动文字：要插入页面的内容
      }
      // region：区域 + 内容 + 反馈 + 图片
      return {
        ...base,
        content: a.content || '',                  // 双击输入：要插入页面的文字
        note: a.note || a.text || '',              // 💬 输入：给 agent 的反馈备注
        image: a.image ? { name: a.image.name, type: a.image.type, dataURL: a.image.dataURL } : null,
      };
    }),
    attachments,
  };
}

function sanitizeName(s) {
  return (s || 'session').replace(/[\\/:*?"<>|\s]+/g, '_').replace(/_+/g, '_').slice(0, 80);
}

function timestampSuffix() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function buildFilenameStem(title) {
  return sanitizeName(title || document.title) + '-' + timestampSuffix();
}

async function writeFile(dir, name, content) {
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(content);
  await w.close();
}

async function dataURLToBlob(dataURL) {
  const res = await fetch(dataURL);
  return res.blob();
}

function extFromMime(mime) {
  if (!mime) return 'png';
  const ext = mime.split('/')[1] || 'png';
  return ext === 'jpeg' ? 'jpg' : ext.replace(/[^a-z0-9]/gi, '');
}

// 写 .json + .md + 所有图片到目录。
// 标注 / 截图附件的 dataURL 会落盘成单独文件，JSON 里只存 filename 引用。
// 这样 skill 端拿到的是直接可用的文件路径，不用自己 decode base64。
export async function writeSessionToDir(data, stem) {
  if (!fsAccessSupported()) {
    return { ok: false, fallback: 'download', reason: 'no-fs-access' };
  }
  let dir = await getStoredDirHandle();
  let firstPick = false;
  if (!dir) {
    try {
      dir = await pickDirHandle();
      firstPick = true;
    } catch (e) {
      return { ok: false, fallback: 'download', reason: 'picker-cancelled', error: e?.message };
    }
  }
  try {
    const writtenImages = [];

    // 标注图片落盘
    if (Array.isArray(data.annotations)) {
      for (const a of data.annotations) {
        if (a.image?.dataURL) {
          const idShort = (a.id || '').split('-').pop().slice(0, 8) || Math.random().toString(36).slice(2, 10);
          const fname = `${stem}-anno-${idShort}.${extFromMime(a.image.type)}`;
          const blob = await dataURLToBlob(a.image.dataURL);
          await writeFile(dir, fname, blob);
          writtenImages.push(fname);
          a.image = { name: a.image.name, type: a.image.type, filename: fname };
        }
      }
    }

    // 反馈面板的截图附件落盘
    if (Array.isArray(data.attachments)) {
      for (let i = 0; i < data.attachments.length; i++) {
        const att = data.attachments[i];
        if (att.dataURL) {
          const fname = `${stem}-att-${String(i + 1).padStart(2, '0')}.${extFromMime(att.type)}`;
          const blob = await dataURLToBlob(att.dataURL);
          await writeFile(dir, fname, blob);
          writtenImages.push(fname);
          data.attachments[i] = {
            id: att.id, name: att.name, type: att.type, filename: fname,
          };
        }
      }
    }

    const jsonName = stem + '.json';
    const mdName = stem + '.md';
    await writeFile(dir, jsonName, JSON.stringify(data, null, 2));
    await writeFile(dir, mdName, buildMarkdown());
    return { ok: true, dirName: dir.name, jsonName, mdName, firstPick, imageFiles: writtenImages };
  } catch (e) {
    return { ok: false, fallback: 'download', reason: 'write-failed', error: e?.message };
  }
}

export function downloadSession(data, stem) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, stem + '.json');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 把 session 打包成 zip 下载：session.json（图片改写为文件名引用）+ session.md + 图片文件。
// 解压后跟 FS Access 写盘的目录结构一致，agent 端处理路径相同。
export async function downloadSessionAsZip(data, stem) {
  const enc = new TextEncoder();
  const entries = [];

  // 标注图片转文件
  if (Array.isArray(data.annotations)) {
    for (const a of data.annotations) {
      if (a.image?.dataURL) {
        const idShort = (a.id || '').split('-').pop().slice(0, 8) || Math.random().toString(36).slice(2, 10);
        const fname = `${stem}-anno-${idShort}.${extFromMime(a.image.type)}`;
        const buf = new Uint8Array(await (await dataURLToBlob(a.image.dataURL)).arrayBuffer());
        entries.push({ name: fname, data: buf });
        a.image = { name: a.image.name, type: a.image.type, filename: fname };
      }
    }
  }

  // 截图附件转文件
  if (Array.isArray(data.attachments)) {
    for (let i = 0; i < data.attachments.length; i++) {
      const att = data.attachments[i];
      if (att.dataURL) {
        const fname = `${stem}-att-${String(i + 1).padStart(2, '0')}.${extFromMime(att.type)}`;
        const buf = new Uint8Array(await (await dataURLToBlob(att.dataURL)).arrayBuffer());
        entries.push({ name: fname, data: buf });
        data.attachments[i] = { id: att.id, name: att.name, type: att.type, filename: fname };
      }
    }
  }

  entries.unshift(
    { name: `${stem}.json`, data: enc.encode(JSON.stringify(data, null, 2)) },
    { name: `${stem}.md`, data: enc.encode(buildMarkdown()) },
  );

  const blob = buildZip(entries);
  triggerDownload(blob, stem + '.zip');
  return { ok: true, fileCount: entries.length };
}
