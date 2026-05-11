// 放弃所有元素编辑（文字 / move / scale / font / hide / delete / replace-img），
// 不动 feedback（截图、当前页留言、全局留言保留）。
import { state } from '../core/state.js';
import { getText, getChanges } from '../core/elements.js';
import { scheduleSave } from '../core/persist.js';
import { updateCounter } from '../utils.js';

export function discardEdits() {
  // 1. 还原文字
  document.querySelectorAll('[data-fbw-edit-id]').forEach((el) => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    if (orig !== undefined && getText(el) !== orig) {
      el.innerText = orig;
      el.classList.remove('fbw-changed');
    }
  });

  // 2. 还原所有元素操作
  state.elementOps.forEach((_rec, el) => {
    delete el.dataset.fbwOpDeleted;
    delete el.dataset.fbwOpHidden;
    delete el.dataset.fbwTx;
    delete el.dataset.fbwTy;
    delete el.dataset.fbwScale;
    delete el.dataset.fbwRotate;
    delete el.dataset.fbwFontName;
    delete el.dataset.fbwHighlight;
    el.style.transform = '';
    el.style.backgroundImage = '';
    el.style.backgroundColor = '';
    el.style.fontFamily = '';
    if (el.tagName === 'IMG' && el.dataset.fbwOriginalSrc) {
      el.src = el.dataset.fbwOriginalSrc;
      delete el.dataset.fbwOriginalSrc;
    }
  });
  state.elementOps.clear();

  scheduleSave();
  updateCounter(getChanges);
}
