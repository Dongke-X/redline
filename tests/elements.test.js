import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/core/state.js';
import { recordOp, getChanges } from '../src/core/elements.js';

beforeEach(() => {
  document.body.innerHTML = '';
  state.elementOps.clear();
  state.originals.clear();
  state.sectionFeedback.clear();
  state.attachments.length = 0;
  state.appMode = 'doc';
  // updateCounter 需要面板里的若干 [data-fbw-counter] 节点
  const panel = document.createElement('div');
  panel.innerHTML = `
    <span data-fbw-counter="edit"></span>
    <span data-fbw-counter="sec"></span>
    <span data-fbw-counter="att"></span>
    <span data-fbw-counter="ops"></span>
    <textarea data-fbw-global></textarea>
  `;
  state.panel = panel;
});

describe('elements / recordOp', () => {
  it('records a single op with descriptor', () => {
    const el = document.createElement('p');
    el.textContent = 'hi';
    el.dataset.fbwEditId = 'id1';
    document.body.appendChild(el);
    recordOp(el, 'hide');
    expect(state.elementOps.size).toBe(1);
    const rec = state.elementOps.get(el);
    expect(rec.ops[0].op).toBe('hide');
  });

  it('replaces existing op of same type', () => {
    const el = document.createElement('p');
    document.body.appendChild(el);
    recordOp(el, 'move', { x: 10, y: 0 });
    recordOp(el, 'move', { x: 20, y: 5 });
    const rec = state.elementOps.get(el);
    expect(rec.ops.length).toBe(1);
    expect(rec.ops[0].args).toEqual({ x: 20, y: 5 });
  });

  it('flags ops with proposed in review mode', () => {
    state.appMode = 'review';
    const el = document.createElement('p');
    document.body.appendChild(el);
    recordOp(el, 'scale', { scale: 1.2 });
    const rec = state.elementOps.get(el);
    expect(rec.ops[0].proposed).toBe(true);
  });

  it('does NOT flag in non-review modes', () => {
    state.appMode = 'doc';
    const el = document.createElement('p');
    document.body.appendChild(el);
    recordOp(el, 'scale', { scale: 1.2 });
    const rec = state.elementOps.get(el);
    expect(rec.ops[0].proposed).toBeUndefined();
  });
});

describe('elements / getChanges', () => {
  it('returns empty when no edits', () => {
    expect(getChanges()).toEqual([]);
  });

  it('detects textContent changes against originals', () => {
    const sec = document.createElement('section');
    sec.dataset.fbwSecId = 's1';
    sec.dataset.fbwSecLabel = 'P1';
    const el = document.createElement('p');
    el.dataset.fbwEditId = 'id1';
    el.dataset.fbwEdited = '1';  // 模拟用户已主动进过文字编辑
    el.textContent = '改后';
    sec.appendChild(el);
    document.body.appendChild(sec);
    state.originals.set('id1', '原始');
    const changes = getChanges();
    expect(changes.length).toBe(1);
    expect(changes[0]).toEqual({ id: 'id1', before: '原始', after: '改后', section: 'P1' });
  });

  it('skips elements without fbwEdited (e.g. JS-updated clocks)', () => {
    const sec = document.createElement('section');
    sec.dataset.fbwSecId = 's1';
    sec.dataset.fbwSecLabel = 'P1';
    const clock = document.createElement('span');
    clock.dataset.fbwEditId = 'clock1';
    // 没有 fbwEdited 标记 — 模拟时钟自动 tick
    clock.textContent = '00:02';
    sec.appendChild(clock);
    document.body.appendChild(sec);
    state.originals.set('clock1', '23:59');
    expect(getChanges()).toEqual([]);
  });
});
