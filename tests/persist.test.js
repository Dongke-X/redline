import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/state.js';
import { saveState, loadState } from '../src/core/persist.js';
import { STORAGE_KEY } from '../src/config.js';

function setupPanel() {
  document.body.innerHTML = '';
  const panel = document.createElement('div');
  panel.innerHTML = `<textarea data-fbw-global></textarea>`;
  document.body.appendChild(panel);
  state.panel = panel;
  state.sectionFeedback.clear();
  state.elementOps.clear();
  state.attachments.length = 0;
  state.annotations.length = 0;
  state.originals.clear();
  localStorage.removeItem(STORAGE_KEY);
}

describe('persist save/load round-trip', () => {
  beforeEach(setupPanel);

  it('round-trips global note + sectionFeedback + annotations', () => {
    state.panel.querySelector('[data-fbw-global]').value = '全局留言';
    state.sectionFeedback.set('s1', { label: 'P1', note: '这页太密' });
    state.annotations.push({ id: 'a1', type: 'region', secId: 's1', rectPct: {x:0.1,y:0.1,w:0.2,h:0.2}, content: '加图', note: '', image: null });

    saveState();

    // 清理 in-memory state
    state.panel.querySelector('[data-fbw-global]').value = '';
    state.sectionFeedback.clear();
    state.annotations.length = 0;

    loadState();

    expect(state.panel.querySelector('[data-fbw-global]').value).toBe('全局留言');
    expect(state.sectionFeedback.get('s1')).toEqual({ label: 'P1', note: '这页太密' });
    expect(state.annotations.length).toBe(1);
    expect(state.annotations[0].content).toBe('加图');
  });

  it('localStorage quota error falls back to write minimal', () => {
    state.panel.querySelector('[data-fbw-global]').value = 'X';
    state.attachments.push({ id: 'att1', name: 'big.jpg', dataURL: 'data:image/jpeg;base64,AAAA', type: 'image/jpeg' });

    // 用 vi.spyOn 模拟 quota 错误 —— 第一次抛 QuotaExceededError，第二次（降级写入）放过
    // happy-dom 的 localStorage 是 native 不可改 —— 用 Object.defineProperty 替换全局，
    // 让 saveState 走 mock 路径
    const calls = [];
    const fakeStore = {
      setItem(k, v) {
        calls.push([k, v]);
        if (calls.length === 1) {
          const err = new Error('Quota');
          err.name = 'QuotaExceededError';
          throw err;
        }
      },
      getItem() { return null; },
      removeItem() {},
    };
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
      || Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { value: fakeStore, configurable: true });

    try {
      saveState();
    } finally {
      if (desc) Object.defineProperty(globalThis, 'localStorage', desc);
    }

    expect(calls.length).toBeGreaterThanOrEqual(2);
    const payload = JSON.parse(calls[calls.length - 1][1]);
    expect(payload.globalNote).toBe('X');
    // attachments 现在只存 metadata（id/name/type），dataURL 走 IDB
    expect(payload.attachments[0].dataURL).toBeUndefined();
    expect(payload.attachments[0].name).toBe('big.jpg');
  });
});
