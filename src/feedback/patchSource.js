// "保存编辑" 写回源 HTML 的核心逻辑。
// 不再有面板按钮，由 deck-stage overlay 的保存按钮 + 退出编辑模式的拦截模态调用。
import { state } from '../core/state.js';
import { SECTION_SELECTORS } from '../config.js';
import { buildSourcePath, resolveInSourceDoc } from '../core/sourcePath.js';
import { getText } from '../core/elements.js';
import { idbGet, idbSet, idbDel } from '../fs/idb.js';
import { fsAccessSupported } from '../fs/dirHandle.js';
import { showToast, fbwConfirm } from '../utils.js';
import { t } from '../i18n.js';

const SOURCE_DIR_KEY = 'sourceDir';

async function verifyPermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission) return false;
  const opts = { mode };
  try {
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
  } catch (_) {}
  return false;
}

async function getSourceDir() {
  const dir = await idbGet(SOURCE_DIR_KEY);
  if (!dir) return null;
  return (await verifyPermission(dir)) ? dir : null;
}

async function pickSourceDir() {
  const dir = await window.showDirectoryPicker({
    id: 'redline-source',
    mode: 'readwrite',
    startIn: 'desktop',
  });
  await idbSet(SOURCE_DIR_KEY, dir);
  return dir;
}

export async function clearSourceDir() {
  await idbDel(SOURCE_DIR_KEY);
}

async function findSourceFileInDir(dir) {
  const filename = decodeURIComponent(location.pathname.split('/').pop() || '');
  if (filename) {
    try { return await dir.getFileHandle(filename); } catch (_) {}
  }
  const fallback = window.prompt(
    `在选定目录下找不到 "${filename}"\n源 HTML 文件名（含 .html）`,
    filename,
  );
  if (!fallback) return null;
  try { return await dir.getFileHandle(fallback); } catch (_) { return null; }
}

function detectComplexity(html) {
  const flags = [];
  if (/\{\{[\s\S]+?\}\}|<%[\s\S]+?%>|<\?php|\{%[\s\S]+?%\}/.test(html)) {
    flags.push('模板语法 (Mustache/EJS/PHP/Jinja)');
  }
  if (/__webpack_|window\.webpackChunk|window\.__NEXT_DATA__|window\.__remixContext/.test(html)) {
    flags.push('build 产物');
  }
  const cssLinks = (html.match(/<link[^>]+rel=["']stylesheet/gi) || []).length;
  if (cssLinks > 2) flags.push(`${cssLinks} 个外部 stylesheet`);
  if (/<script[^>]+type=["']module["'][^>]*src=/i.test(html)) {
    flags.push('JS module 引用');
  }
  return flags;
}

function applyEditsToDoc(doc) {
  let applied = 0;
  let failed = 0;
  const failures = [];

  document.querySelectorAll('[data-fbw-edit-id]').forEach(liveEl => {
    const id = liveEl.dataset.fbwEditId;
    const orig = state.originals.get(id);
    const now = getText(liveEl);
    if (orig === now) return;

    const path = buildSourcePath(liveEl);
    if (!path) { failed++; failures.push({ kind: 'text', desc: orig.slice(0, 30), reason: 'no-path' }); return; }
    const result = resolveInSourceDoc(doc, path, SECTION_SELECTORS);
    if (!result.ok) { failed++; failures.push({ kind: 'text', desc: orig.slice(0, 30), reason: result.reason }); return; }
    if (result.contentMismatch) { failed++; failures.push({ kind: 'text', desc: orig.slice(0, 30), reason: 'content-drift' }); return; }
    result.el.textContent = now;
    applied++;
  });

  state.elementOps.forEach((rec, liveEl) => {
    const path = buildSourcePath(liveEl);
    if (!path) { failed += rec.ops.length; failures.push({ kind: 'op', desc: rec.descriptor, reason: 'no-path' }); return; }
    const result = resolveInSourceDoc(doc, path, SECTION_SELECTORS);
    if (!result.ok) { failed += rec.ops.length; failures.push({ kind: 'op', desc: rec.descriptor, reason: result.reason }); return; }
    const target = result.el;
    rec.ops.forEach(op => {
      try {
        // note 是元素级 feedback，不动源（保留在 session.json 给 agent 看）
        if (op.op === 'note') return;
        if (op.op === 'delete') target.remove();
        else if (op.op === 'hide') target.style.visibility = 'hidden';
        else if (op.op === 'move') {
          const t = (target.style.transform || '').replace(/translate\([^)]+\)/g, '').trim();
          target.style.transform = (t + ` translate(${op.args.x}px, ${op.args.y}px)`).trim();
        } else if (op.op === 'scale') {
          const t = (target.style.transform || '').replace(/scale\([^)]+\)/g, '').trim();
          target.style.transform = (t + ` scale(${op.args.scale})`).trim();
        } else if (op.op === 'rotate') {
          const t = (target.style.transform || '').replace(/rotate\([^)]+\)/g, '').trim();
          target.style.transform = (t + ` rotate(${op.args.rotate}deg)`).trim();
        } else if (op.op === 'font') {
          target.style.fontFamily = op.args.family === '系统默认' ? '' : op.args.family;
        } else if (op.op === 'highlight') {
          target.style.backgroundColor = op.args?.color || '';
        } else {
          failed++; failures.push({ kind: 'op', desc: rec.descriptor, op: op.op, reason: 'unsupported' });
          return;
        }
        applied++;
      } catch (e) {
        failed++; failures.push({ kind: 'op', desc: rec.descriptor, op: op.op, reason: e.message });
      }
    });
  });

  // 清掉 widget 内部属性
  ['fbwEditId', 'fbwSecId', 'fbwSecLabel', 'fbwTx', 'fbwTy', 'fbwScale', 'fbwRotate', 'fbwOriginalSrc', 'fbwFontName', 'fbwHighlight', 'fbwOpDeleted', 'fbwOpHidden'].forEach(prop => {
    const sel = '[data-' + prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ']';
    doc.querySelectorAll(sel).forEach(el => delete el.dataset[prop]);
  });
  doc.querySelectorAll('.fbw-changed, .fbw-selected').forEach(el => {
    el.classList.remove('fbw-changed');
    el.classList.remove('fbw-selected');
  });

  return { applied, failed, failures };
}

function timestampSuffix() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function writeBackup(dir, originalName, originalHtml) {
  const base = originalName.replace(/\.html?$/i, '');
  const backupName = `${base}.bak.${timestampSuffix()}.html`;
  const backupHandle = await dir.getFileHandle(backupName, { create: true });
  const writable = await backupHandle.createWritable();
  await writable.write(originalHtml);
  await writable.close();
  return backupName;
}

// 主流程：跑一次"保存编辑"。返回 { ok, applied?, failed?, backupName?, fileName? }。
// 调用方负责显示成功 toast；失败 / 取消会自己 toast。
export async function runPatchSource() {
  if (!fsAccessSupported()) {
    showToast(t('patch.unsupported'));
    return { ok: false, reason: 'no-fs-access' };
  }
  if (location.protocol !== 'file:') {
    showToast(t('patch.notFile'));
    return { ok: false, reason: 'not-file-protocol' };
  }

  let dir = await getSourceDir();
  if (!dir) {
    try { dir = await pickSourceDir(); } catch (_) {
      showToast(t('patch.cancelled'));
      return { ok: false, reason: 'picker-cancelled' };
    }
  }

  const fileHandle = await findSourceFileInDir(dir);
  if (!fileHandle) {
    showToast(t('patch.fileNotFound'));
    return { ok: false, reason: 'file-not-found' };
  }

  const file = await fileHandle.getFile();
  const sourceHtml = await file.text();
  const flags = detectComplexity(sourceHtml);
  if (flags.length) {
    const choice = await fbwConfirm({
      title: t('warn.complex.title'),
      desc: t('warn.complex.desc', { flags: flags.join('\n· ') }),
      choices: [
        { label: t('common.cancel'), value: 'cancel' },
        { label: t('warn.complex.continue'), value: 'continue', danger: true },
      ],
    });
    if (choice !== 'continue') {
      showToast(t('patch.cancelled'));
      return { ok: false, reason: 'user-cancelled-warning' };
    }
  }

  const doc = new DOMParser().parseFromString(sourceHtml, 'text/html');
  const { applied, failed, failures } = applyEditsToDoc(doc);

  if (applied === 0) {
    showToast(failed === 0 ? t('patch.noChanges') : t('patch.partialFail', { failed }));
    if (failures.length) console.warn('[fbw] failures:', failures);
    return { ok: false, applied, failed, failures };
  }

  let backupName = '';
  try {
    backupName = await writeBackup(dir, file.name, sourceHtml);
  } catch (e) {
    const choice = await fbwConfirm({
      title: t('patch.backupFail.title'),
      desc: t('patch.backupFail.desc', { reason: e.message }),
      choices: [
        { label: t('common.cancel'), value: 'cancel' },
        { label: t('warn.complex.continue'), value: 'continue', danger: true },
      ],
    });
    if (choice !== 'continue') {
      showToast(t('patch.cancelled'));
      return { ok: false, reason: 'backup-failed-user-cancelled' };
    }
  }

  const newHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  const writable = await fileHandle.createWritable();
  await writable.write(newHtml);
  await writable.close();

  const failedSuffix = failed > 0 ? ` / ${failed} failed` : '';
  const backupSuffix = backupName ? ` · backup ${backupName}` : '';
  showToast(t('patch.success', { file: file.name, applied, failedSuffix, backupSuffix }));
  if (failures.length) console.warn('[fbw] failures:', failures);
  return { ok: true, applied, failed, failures, backupName, fileName: file.name };
}
