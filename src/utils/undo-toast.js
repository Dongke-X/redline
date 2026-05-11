// 带「撤销」按钮的 toast — Gmail 风格。每次 op 后调一次。
// 注意：utils.js 和 core/undo.js 互相依赖，不能在 utils.js 里直接 import undo。
import { showToast } from '../utils.js';
import { undo } from '../core/undo.js';
import { t } from '../i18n.js';

export function showUndoToast(msg) {
  showToast(msg, {
    action: { label: t('toast.undo') || '撤销', onClick: undo },
    duration: 4000,
  });
}
