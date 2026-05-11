// "保存反馈" 按钮：
// - FS Access 支持 + 用户偏好"folder"  → 写 .json + .md + 图片到选定目录
// - 否则 / 用户偏好"zip" / FS 不支持   → 下载 zip（含 .json + .md + 图片文件）
import { state } from '../core/state.js';
import {
  buildSessionData, buildFilenameStem, writeSessionToDir,
  downloadSession, downloadSessionAsZip,
} from '../fs/sessionWriter.js';
import { fsAccessSupported, clearDirHandle } from '../fs/dirHandle.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

// 读 chrome.storage.sync 的偏好；非扩展环境（file:// 注入版）返回 null。
async function readSavePreference() {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.sync) return null;
    const cfg = await chrome.storage.sync.get({ saveMode: 'zip' });
    return cfg.saveMode;
  } catch {
    return null;
  }
}

export function attachSaveButton() {
  const btn = state.panel.querySelector('[data-fbw-action="save"]');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const data = buildSessionData();
    const stem = buildFilenameStem();
    const pref = await readSavePreference();

    // ZIP 路径默认。只有 chrome.storage 可用 + 用户明确选了 'fs' 才走 FS Access picker。
    // 这样 file:// 直接注入（无扩展）的场景永远走 zip 下载，避免 Chrome 系统目录拒绝。
    const wantZip = pref !== 'fs' || !fsAccessSupported();
    if (wantZip) {
      btn.disabled = true;
      try {
        await downloadSessionAsZip(data, stem);
        showToast(t('save.unsupported', { stem: stem + '.zip' }));
      } catch (e) {
        // 极端兜底：单 JSON 下载
        downloadSession(data, stem);
        showToast(t('save.failed', { reason: e?.message || 'zip-failed' }));
      } finally {
        btn.disabled = false;
      }
      return;
    }

    btn.disabled = true;
    try {
      const result = await writeSessionToDir(data, stem);
      if (result.ok) {
        const imgCount = (result.imageFiles || []).length;
        const suffix = `/{json, md${imgCount > 0 ? ` + ${imgCount} imgs` : ''}}`;
        showToast(t(result.firstPick ? 'save.first' : 'save.again', { dir: result.dirName, suffix }));
      } else if (result.reason === 'picker-cancelled') {
        showToast(t('save.cancelled'));
      } else {
        // 写盘失败 → zip 兜底
        await downloadSessionAsZip(data, stem);
        showToast(t('save.failed', { reason: result.reason || 'unknown' }));
      }
    } finally {
      btn.disabled = false;
    }
  });

  // 右键：重置目录选择
  btn.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    await clearDirHandle();
    showToast(t('save.dirCleared'));
  });
}
