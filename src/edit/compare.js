// 前后对比：临时把所有编辑过的元素还原到改前状态，方便审视改动效果。
// 不清栈不清 ops —— 只是视觉切换。再按一次切回。
import { state } from '../core/state.js';
import { getText } from '../core/elements.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

// 缓存每个元素切换前的「当前编辑态」，切回时一一恢复
const cache = new Map();

function snapshotEdited(el) {
  return {
    transform: el.style.transform,
    fontFamily: el.style.fontFamily,
    fontSize: el.style.fontSize,
    padding: el.style.padding,
    margin: el.style.margin,
    backgroundColor: el.style.backgroundColor,
    backgroundImage: el.style.backgroundImage,
    background: el.style.background,
    visibility: el.style.visibility,
    src: el.tagName === 'IMG' ? el.getAttribute('src') : null,
    tagAs: el.getAttribute('data-fbw-tag-as'),
    fbwOpDeleted: el.dataset.fbwOpDeleted ?? null,
    fbwOpHidden:  el.dataset.fbwOpHidden  ?? null,
    fbwTx:        el.dataset.fbwTx        ?? null,
    fbwTy:        el.dataset.fbwTy        ?? null,
    fbwScale:     el.dataset.fbwScale     ?? null,
    fbwRotate:    el.dataset.fbwRotate    ?? null,
    fbwHighlight: el.dataset.fbwHighlight ?? null,
    fbwFontName:  el.dataset.fbwFontName  ?? null,
    fbwOriginalSrc: el.dataset.fbwOriginalSrc ?? null,
    // 存 innerHTML 而非 textContent —— 保住内部 markup
    innerHTML: el.innerHTML,
  };
}

function clearVisuals(el) {
  el.style.transform = '';
  el.style.fontFamily = '';
  el.style.fontSize = '';
  el.style.padding = '';
  el.style.margin = '';
  el.style.backgroundColor = '';
  el.style.backgroundImage = '';
  el.style.background = '';
  el.style.visibility = '';
  el.removeAttribute('data-fbw-tag-as');
  delete el.dataset.fbwOpDeleted;
  delete el.dataset.fbwOpHidden;
  delete el.dataset.fbwTx;
  delete el.dataset.fbwTy;
  delete el.dataset.fbwScale;
  delete el.dataset.fbwRotate;
  delete el.dataset.fbwHighlight;
  if (el.tagName === 'IMG' && el.dataset.fbwOriginalSrc) {
    el.src = el.dataset.fbwOriginalSrc;
  }
}

function restoreFromSnap(el, snap) {
  el.style.transform = snap.transform || '';
  el.style.fontFamily = snap.fontFamily || '';
  el.style.fontSize = snap.fontSize || '';
  el.style.padding = snap.padding || '';
  el.style.margin = snap.margin || '';
  el.style.backgroundColor = snap.backgroundColor || '';
  el.style.backgroundImage = snap.backgroundImage || '';
  el.style.background = snap.background || '';
  el.style.visibility = snap.visibility || '';
  if (snap.tagAs == null) el.removeAttribute('data-fbw-tag-as');
  else el.setAttribute('data-fbw-tag-as', snap.tagAs);
  ['fbwOpDeleted','fbwOpHidden','fbwTx','fbwTy','fbwScale','fbwRotate','fbwHighlight','fbwFontName','fbwOriginalSrc'].forEach(k => {
    if (snap[k] == null) delete el.dataset[k];
    else el.dataset[k] = snap[k];
  });
  if (el.tagName === 'IMG' && snap.src != null) el.src = snap.src;
  if (snap.innerHTML != null && el.innerHTML !== snap.innerHTML) {
    el.innerHTML = snap.innerHTML;
  }
}

export function isCompareBefore() {
  return document.body.classList.contains('fbw-compare-before');
}

function updateFab() {
  if (state.compareFab) state.compareFab.classList.toggle('fbw-active', isCompareBefore());
}

export function toggleCompare() {
  if (isCompareBefore()) {
    // 切回改后视图
    cache.forEach((snap, el) => {
      if (document.contains(el)) restoreFromSnap(el, snap);
    });
    cache.clear();
    document.body.classList.remove('fbw-compare-before');
    showToast(t('compare.off') || '回到改后视图');
    updateFab();
    return;
  }
  // 切到改前视图
  // op-touched 元素
  state.elementOps.forEach((rec, el) => {
    if (!document.contains(el) || !rec.ops?.length) return;
    cache.set(el, snapshotEdited(el));
    clearVisuals(el);
  });
  // 文字编辑过的元素
  document.querySelectorAll('[data-fbw-edit-id][data-fbw-edited]').forEach(el => {
    const id = el.dataset.fbwEditId;
    const orig = state.originals.get(id);
    if (orig === undefined || getText(el) === orig) return;
    if (!cache.has(el)) cache.set(el, snapshotEdited(el));
    // 用 innerHTML 还原（保住 <em>/<strong>/<br> 等内部 markup）；没存就退回 textContent
    const origHTML = state.originalsHTML?.get(id);
    if (origHTML !== undefined) {
      el.innerHTML = origHTML;
    } else {
      el.textContent = orig;
    }
  });
  if (cache.size === 0) {
    showToast(t('compare.empty') || '没有改动可比对');
    updateFab();
    return;
  }
  document.body.classList.add('fbw-compare-before');
  showToast(t('compare.on', { n: cache.size }) || `在看原稿 · ${cache.size} 处改动`);
  updateFab();
}

// 切到改前时禁止编辑操作（在各 handler 入口里调用）
export function compareGuard() {
  return isCompareBefore();
}
