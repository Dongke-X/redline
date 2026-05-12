// 样式注入面板：选中元素后开一个小面板，调 font-size / padding / margin。
// 输入即时预览（inline style），并把变化以 'style' op 记入 elementOps。
// 多选时一次同步给所有 selectedEls。打开时 pushUndoGroup 一次 —— Cmd+Z 整体回退。
import { state } from '../core/state.js';
import { recordOp, clearOpsOn } from '../core/elements.js';
import { pushUndoGroup } from '../core/undo.js';
import { getSelectedEls } from './selection.js';
import { t } from '../i18n.js';

const PROPS = [
  { key: 'fontSize',  cssProp: 'font-size',     i18n: 'style.fontSize',  defaultUnit: 'px', min: 8,  max: 96 },
  { key: 'padding',   cssProp: 'padding',       i18n: 'style.padding',   defaultUnit: 'px', min: 0,  max: 80 },
  { key: 'margin',    cssProp: 'margin',        i18n: 'style.margin',    defaultUnit: 'px', min: 0,  max: 120 },
];

let panel = null;
let sessionPushed = false; // 这次打开里 pushUndoGroup 是否已经走过

function rowHTML(prop) {
  return `
    <div class="fbw-style-row">
      <label class="fbw-style-label">${t(prop.i18n)}</label>
      <button class="fbw-style-bump" data-bump="-" data-prop="${prop.key}" tabindex="-1">−</button>
      <input class="fbw-style-input" type="number" data-prop="${prop.key}" min="${prop.min}" max="${prop.max}" step="1">
      <button class="fbw-style-bump" data-bump="+" data-prop="${prop.key}" tabindex="-1">+</button>
      <span class="fbw-style-unit">px</span>
    </div>
  `;
}

export function createStylePanelNode() {
  panel = document.createElement('div');
  panel.className = 'fbw-style-panel';
  panel.innerHTML = `
    <div class="fbw-style-head">${t('style.title')}</div>
    ${PROPS.map(rowHTML).join('')}
  `;
  return panel;
}

function readCurrent(el) {
  const cs = getComputedStyle(el);
  return {
    fontSize: parseInt(cs.fontSize, 10) || 0,
    padding:  parseInt(cs.paddingTop, 10) || 0,
    margin:   parseInt(cs.marginTop, 10) || 0,
  };
}

function positionPanel() {
  if (!panel || !state.elemToolbar) return;
  const tb = state.elemToolbar.getBoundingClientRect();
  panel.style.top = (tb.bottom + 6) + 'px';
  panel.style.left = tb.left + 'px';
  // 右侧溢出兜底
  const pw = panel.offsetWidth || 220;
  if (tb.left + pw > window.innerWidth - 8) {
    panel.style.left = Math.max(8, window.innerWidth - pw - 8) + 'px';
  }
}

export function openStylePanel() {
  if (!panel || !state.selectedEl) return;
  const cur = readCurrent(state.selectedEl);
  PROPS.forEach(p => {
    const input = panel.querySelector(`input[data-prop="${p.key}"]`);
    if (input) input.value = String(cur[p.key]);
  });
  sessionPushed = false;
  panel.classList.add('fbw-on');
  positionPanel();
}

export function closeStylePanel() {
  if (panel) panel.classList.remove('fbw-on');
}

// 把当前的 inline style 收集成 op args；空了就把 style op 撤掉
function syncOp(el) {
  const props = {};
  if (el.style.fontSize) props.fontSize = el.style.fontSize;
  if (el.style.padding)  props.padding  = el.style.padding;
  if (el.style.margin)   props.margin   = el.style.margin;
  if (Object.keys(props).length) {
    recordOp(el, 'style', { props });
  } else {
    const rec = state.elementOps.get(el);
    if (rec) {
      rec.ops = rec.ops.filter(o => o.op !== 'style');
      if (!rec.ops.length) clearOpsOn(el);
    }
  }
}

function applyToSelection(propKey, valueStr) {
  const def = PROPS.find(p => p.key === propKey);
  if (!def) return;
  const els = getSelectedEls();
  if (!els.length) return;
  if (!sessionPushed) {
    pushUndoGroup(els);
    sessionPushed = true;
  }
  const numericRaw = parseFloat(valueStr);
  const finalVal = (valueStr === '' || isNaN(numericRaw))
    ? '' // 清掉
    : Math.max(def.min, Math.min(def.max, numericRaw)) + def.defaultUnit;
  els.forEach(el => {
    const cssProp = def.cssProp;
    if (!finalVal) {
      // 清掉对应 inline style
      if (cssProp === 'font-size') el.style.fontSize = '';
      else if (cssProp === 'padding') el.style.padding = '';
      else if (cssProp === 'margin') el.style.margin = '';
    } else {
      if (cssProp === 'font-size') el.style.fontSize = finalVal;
      else if (cssProp === 'padding') el.style.padding = finalVal;
      else if (cssProp === 'margin') el.style.margin = finalVal;
    }
    syncOp(el);
  });
}

export function attachStylePanelEvents() {
  if (!panel) return;
  panel.addEventListener('input', (e) => {
    const inp = e.target.closest('input[data-prop]');
    if (!inp) return;
    applyToSelection(inp.dataset.prop, inp.value);
  });
  panel.addEventListener('click', (e) => {
    const bump = e.target.closest('[data-bump]');
    if (!bump) return;
    const propKey = bump.dataset.prop;
    const input = panel.querySelector(`input[data-prop="${propKey}"]`);
    if (!input) return;
    const def = PROPS.find(p => p.key === propKey);
    const step = e.shiftKey ? 4 : 1;
    const cur = parseFloat(input.value) || 0;
    const next = bump.dataset.bump === '+' ? cur + step : cur - step;
    input.value = String(Math.max(def.min, Math.min(def.max, next)));
    applyToSelection(propKey, input.value);
  });
  // 输入框内键盘不冒泡到全局快捷键
  ['keydown', 'keyup', 'keypress', 'mousedown'].forEach(ev => {
    panel.addEventListener(ev, (e) => {
      if (e.target.tagName === 'INPUT' || e.target.closest('button')) e.stopPropagation();
    }, true);
  });
  // 面板外 mousedown 关闭
  document.addEventListener('mousedown', (e) => {
    if (!panel.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-style-panel, [data-op="style"]')) return;
    closeStylePanel();
  }, true);
}
