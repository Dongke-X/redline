// 样式注入面板：font-size / padding / margin，实时预览 + 多选 gang。
// 每个属性行：滑块 + 数字输入双向同步；padding/margin 多一个「链」按钮，
// 解开后展开成 T/R/B/L 四个独立输入。
import { state } from '../core/state.js';
import { recordOp, clearOpsOn } from '../core/elements.js';
import { pushUndoGroup } from '../core/undo.js';
import { getSelectedEls } from './selection.js';
import { t } from '../i18n.js';

const PROPS = [
  { key: 'fontSize', i18n: 'style.fontSize', min: 8,  max: 96,  step: 1, sided: false },
  { key: 'padding',  i18n: 'style.padding',  min: 0,  max: 80,  step: 1, sided: true  },
  { key: 'margin',   i18n: 'style.margin',   min: 0,  max: 120, step: 1, sided: true  },
];

let panel = null;
let sessionPushed = false;
let sideState = { padding: false, margin: false }; // false = linked (uniform), true = unlinked (4-side)

function rowHTML(prop) {
  const sided = prop.sided
    ? `<button class="fbw-style-link" data-link="${prop.key}" tabindex="-1" title="${t('style.unlink')}">⇄</button>`
    : '';
  return `
    <div class="fbw-style-row" data-row="${prop.key}">
      <label class="fbw-style-label">${t(prop.i18n)}</label>
      <div class="fbw-style-linked" data-mode="linked">
        <input class="fbw-style-range" type="range" data-prop="${prop.key}" min="${prop.min}" max="${prop.max}" step="${prop.step}">
        <input class="fbw-style-input" type="number" data-prop="${prop.key}" min="${prop.min}" max="${prop.max}" step="${prop.step}">
        <span class="fbw-style-unit">px</span>
      </div>
      ${prop.sided ? sidedHTML(prop) : ''}
      ${sided}
    </div>
  `;
}

function sidedHTML(prop) {
  // 4 个小输入：T R B L（按视觉位置排）
  const sides = ['top', 'right', 'bottom', 'left'];
  return `
    <div class="fbw-style-sided" data-mode="sided" data-prop="${prop.key}" style="display:none;">
      ${sides.map(side => `
        <span class="fbw-style-side-cell">
          <input class="fbw-style-side-input" type="number"
                 data-prop="${prop.key}" data-side="${side}"
                 min="${prop.min}" max="${prop.max}" step="${prop.step}">
          <span class="fbw-style-side-label">${side[0].toUpperCase()}</span>
        </span>
      `).join('')}
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

function readSides(el, prop) {
  const cs = getComputedStyle(el);
  const map = {
    padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    margin:  ['marginTop',  'marginRight',  'marginBottom',  'marginLeft'],
  };
  if (!map[prop]) return null;
  return {
    top:    parseInt(cs[map[prop][0]], 10) || 0,
    right:  parseInt(cs[map[prop][1]], 10) || 0,
    bottom: parseInt(cs[map[prop][2]], 10) || 0,
    left:   parseInt(cs[map[prop][3]], 10) || 0,
  };
}

function isUniform(sides) {
  return sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
}

function paintRow(prop, anchorEl) {
  const row = panel.querySelector(`[data-row="${prop.key}"]`);
  if (!row) return;
  if (prop.sided) {
    const sides = readSides(anchorEl, prop.key);
    const uniform = isUniform(sides);
    sideState[prop.key] = !uniform;
    row.classList.toggle('fbw-style-row-sided', !uniform);
    row.querySelector('[data-mode="linked"]').style.display = uniform ? '' : 'none';
    row.querySelector('[data-mode="sided"]').style.display = uniform ? 'none' : '';
    if (uniform) {
      const v = sides.top;
      row.querySelector(`input.fbw-style-range[data-prop="${prop.key}"]`).value = String(v);
      row.querySelector(`input.fbw-style-input[data-prop="${prop.key}"]`).value = String(v);
    } else {
      ['top','right','bottom','left'].forEach(side => {
        row.querySelector(`input.fbw-style-side-input[data-prop="${prop.key}"][data-side="${side}"]`).value = String(sides[side]);
      });
    }
  } else {
    const cs = getComputedStyle(anchorEl);
    const v = parseInt(cs.fontSize, 10) || 0;
    row.querySelector(`input.fbw-style-range[data-prop="${prop.key}"]`).value = String(v);
    row.querySelector(`input.fbw-style-input[data-prop="${prop.key}"]`).value = String(v);
  }
}

function positionPanel() {
  if (!panel || !state.elemToolbar) return;
  const tb = state.elemToolbar.getBoundingClientRect();
  panel.style.top = (tb.bottom + 6) + 'px';
  panel.style.left = tb.left + 'px';
  const pw = panel.offsetWidth || 280;
  if (tb.left + pw > window.innerWidth - 8) {
    panel.style.left = Math.max(8, window.innerWidth - pw - 8) + 'px';
  }
}

export function openStylePanel() {
  if (!panel || !state.selectedEl) return;
  PROPS.forEach(p => paintRow(p, state.selectedEl));
  sessionPushed = false;
  panel.classList.add('fbw-on');
  positionPanel();
}

export function closeStylePanel() {
  if (panel) panel.classList.remove('fbw-on');
}

function ensureUndo() {
  if (sessionPushed) return;
  pushUndoGroup(getSelectedEls());
  sessionPushed = true;
}

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

function applyUniform(propKey, valueStr) {
  const def = PROPS.find(p => p.key === propKey);
  if (!def) return;
  const els = getSelectedEls();
  if (!els.length) return;
  ensureUndo();
  const raw = parseFloat(valueStr);
  const final = (valueStr === '' || isNaN(raw)) ? '' : Math.max(def.min, Math.min(def.max, raw)) + 'px';
  const cssProp = propKey === 'fontSize' ? 'fontSize' : propKey;
  els.forEach(el => {
    el.style[cssProp] = final;
    syncOp(el);
  });
}

function applySided(propKey, side, valueStr) {
  const def = PROPS.find(p => p.key === propKey);
  if (!def) return;
  const els = getSelectedEls();
  if (!els.length) return;
  ensureUndo();
  const raw = parseFloat(valueStr);
  const val = (valueStr === '' || isNaN(raw)) ? 0 : Math.max(def.min, Math.min(def.max, raw));
  // 把 panel 上 4 个输入的当前值收集起来作为新 shorthand
  const cells = {
    top:    parseInt(panel.querySelector(`input[data-prop="${propKey}"][data-side="top"]`).value, 10) || 0,
    right:  parseInt(panel.querySelector(`input[data-prop="${propKey}"][data-side="right"]`).value, 10) || 0,
    bottom: parseInt(panel.querySelector(`input[data-prop="${propKey}"][data-side="bottom"]`).value, 10) || 0,
    left:   parseInt(panel.querySelector(`input[data-prop="${propKey}"][data-side="left"]`).value, 10) || 0,
  };
  cells[side] = val;
  const shorthand = `${cells.top}px ${cells.right}px ${cells.bottom}px ${cells.left}px`;
  els.forEach(el => {
    el.style[propKey] = shorthand;
    syncOp(el);
  });
}

function toggleLink(propKey) {
  const def = PROPS.find(p => p.key === propKey);
  if (!def || !def.sided) return;
  const row = panel.querySelector(`[data-row="${propKey}"]`);
  if (!row) return;
  const goingSided = !sideState[propKey];
  sideState[propKey] = goingSided;
  row.classList.toggle('fbw-style-row-sided', goingSided);
  row.querySelector('[data-mode="linked"]').style.display = goingSided ? 'none' : '';
  row.querySelector('[data-mode="sided"]').style.display = goingSided ? '' : 'none';
  // 切换模式时把当前值同步到目标 UI
  const els = getSelectedEls();
  const anchor = state.selectedEl;
  if (!anchor) return;
  if (goingSided) {
    // 进 4 边模式：linked 的值复制到 4 边
    const v = parseInt(row.querySelector(`input.fbw-style-input[data-prop="${propKey}"]`).value, 10) || 0;
    ['top','right','bottom','left'].forEach(side => {
      row.querySelector(`input[data-prop="${propKey}"][data-side="${side}"]`).value = String(v);
    });
  } else {
    // 回 linked：取 top 值作为统一值并写回
    const v = parseInt(row.querySelector(`input[data-prop="${propKey}"][data-side="top"]`).value, 10) || 0;
    row.querySelector(`input.fbw-style-range[data-prop="${propKey}"]`).value = String(v);
    row.querySelector(`input.fbw-style-input[data-prop="${propKey}"]`).value = String(v);
    applyUniform(propKey, String(v));
  }
}

export function attachStylePanelEvents() {
  if (!panel) return;
  panel.addEventListener('input', (e) => {
    const target = e.target;
    if (!target.dataset.prop) return;
    if (target.classList.contains('fbw-style-side-input')) {
      applySided(target.dataset.prop, target.dataset.side, target.value);
      return;
    }
    if (target.classList.contains('fbw-style-range') || target.classList.contains('fbw-style-input')) {
      const row = target.closest('[data-row]');
      if (row) {
        // 双向同步：滑块 ↔ 数字输入
        row.querySelectorAll(`input[data-prop="${target.dataset.prop}"]:not([data-side])`).forEach(inp => {
          if (inp !== target) inp.value = target.value;
        });
      }
      applyUniform(target.dataset.prop, target.value);
    }
  });
  panel.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.stopPropagation();
      toggleLink(link.dataset.link);
      return;
    }
  });
  ['keydown', 'keyup', 'keypress', 'mousedown'].forEach(ev => {
    panel.addEventListener(ev, (e) => {
      if (e.target.tagName === 'INPUT' || e.target.closest('button')) e.stopPropagation();
    }, true);
  });
  document.addEventListener('mousedown', (e) => {
    if (!panel.classList.contains('fbw-on')) return;
    if (e.target.closest('.fbw-style-panel, [data-op="style"]')) return;
    closeStylePanel();
  }, true);
}
