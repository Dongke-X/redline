import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/core/state.js';
import { buildSessionData } from '../src/fs/sessionWriter.js';

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
  state.appMode = 'review';
}

describe('session.v1 builder', () => {
  beforeEach(setupPanel);

  it('emits schemaVersion / appMode / env / page', () => {
    const data = buildSessionData();
    expect(data.schemaVersion).toBe('1.0');
    expect(data.appMode).toBe('review');
    expect(data.env).toBeDefined();
    expect(data.env.viewport).toBeDefined();
    expect(data.page.url).toBeDefined();
  });

  it('flags review-mode element ops with proposed: true', () => {
    const el = document.createElement('p');
    el.dataset.fbwEditId = 'id1';
    el.textContent = '原文';
    document.body.appendChild(el);
    state.originals.set('id1', '原文');
    // 模拟 recordOp 在 review 模式下打 proposed
    state.elementOps.set(el, {
      ops: [{ op: 'move', args: { x: 10, y: 20 }, proposed: true }],
      descriptor: '[Sec] · p',
    });

    const data = buildSessionData();
    const moveEdit = data.edits.find(e => e.op === 'move');
    expect(moveEdit).toBeDefined();
    expect(moveEdit.proposed).toBe(true);
    expect(moveEdit.args).toEqual({ x: 10, y: 20 });
  });

  it('non-review ops do NOT have proposed flag', () => {
    state.appMode = 'doc';
    const el = document.createElement('p');
    el.dataset.fbwEditId = 'id2';
    document.body.appendChild(el);
    state.elementOps.set(el, {
      ops: [{ op: 'hide' }],  // 不带 proposed
      descriptor: '[Sec] · p',
    });
    const data = buildSessionData();
    const hide = data.edits.find(e => e.op === 'hide');
    expect(hide.proposed).toBeUndefined();
  });

  it('serializes annotations content + note + image', () => {
    state.annotations.push({
      id: 'a1', type: 'region', secId: 's1', secLabel: 'P1',
      rectPct: { x: 0.1, y: 0.1, w: 0.2, h: 0.3 },
      content: '插入文字', note: '备注', image: null,
    });
    const data = buildSessionData();
    expect(data.annotations.length).toBe(1);
    expect(data.annotations[0].content).toBe('插入文字');
    expect(data.annotations[0].note).toBe('备注');
  });
});
