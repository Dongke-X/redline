import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/core/state.js';
import { buildMarkdown } from '../src/export/markdown.js';

function setupPanel({ globalNote = '' } = {}) {
  document.body.innerHTML = '';
  const panel = document.createElement('div');
  panel.innerHTML = `
    <textarea data-fbw-global>${globalNote}</textarea>
  `;
  document.body.appendChild(panel);
  state.panel = panel;
  state.sectionFeedback.clear();
  state.elementOps.clear();
  state.attachments.length = 0;
  state.annotations.length = 0;
  state.originals.clear();
}

describe('markdown export', () => {
  beforeEach(() => setupPanel());

  it('empty state shows 没有任何反馈', () => {
    const md = buildMarkdown();
    expect(md).toContain('_(没有任何反馈)_');
  });

  it('escapes triple-backtick in changes before/after to prevent code-fence break', () => {
    // changes 走 escapeFence —— ``` 会被替换成 zero-width 间隔的反引号
    const sec = document.createElement('section');
    sec.dataset.fbwSecId = 's1';
    sec.dataset.fbwSecLabel = 'Sec';
    const el = document.createElement('p');
    el.dataset.fbwEditId = 'id1';
    el.dataset.fbwEdited = '1';  // 用户主动编辑过
    el.textContent = '改 ``` 含 fence';
    sec.appendChild(el);
    document.body.appendChild(sec);
    state.originals.set('id1', '原始');
    const md = buildMarkdown();
    // 应该看到原始 ``` 不再原样存在于 before/after 区段（被 escape）
    // 找到 ```\n...\n``` 之间的 content 区域应不含连续 ``` 序列
    const codeBlocks = md.match(/```\n([\s\S]*?)\n```/g) || [];
    expect(codeBlocks.length).toBeGreaterThan(0);
    codeBlocks.forEach(block => {
      const inner = block.replace(/^```\n|\n```$/g, '');
      expect(inner).not.toMatch(/^```$/m);
    });
  });

  it('escapes leading markdown chars in user content', () => {
    state.annotations.push({
      id: 'a1', type: 'floating', secId: 's', secLabel: 'Sec',
      rectPct: { x: 0.1, y: 0.1, w: 0, h: 0 },
      content: '# 不应该被当成 H1\n## 也不应该\n- 也不该是 bullet',
    });
    const md = buildMarkdown();
    expect(md).toContain('\\# 不应该被当成');
    expect(md).toContain('\\## 也不应该');
    expect(md).toContain('\\- 也不该是');
  });

  it('global note escaped at line starts', () => {
    setupPanel({ globalNote: '# heading injected\n> quote injected' });
    const md = buildMarkdown();
    expect(md).toContain('\\# heading injected');
    expect(md).toContain('\\> quote injected');
  });

  it('region annotation includes content + note + image filename', () => {
    state.annotations.push({
      id: 'a2', type: 'region', secId: 's', secLabel: 'P3',
      rectPct: { x: 0.2, y: 0.1, w: 0.3, h: 0.4 },
      content: '插页文字',
      note: 'agent 看的备注',
      image: { name: 'ref.png', filename: 'sess-anno-abc.png' },
    });
    const md = buildMarkdown();
    expect(md).toContain('插页文字');
    expect(md).toContain('agent 看的备注');
    expect(md).toContain('ref.png');
    expect(md).toContain('sess-anno-abc.png');
    expect(md).toContain('20%, y=10%');
  });
});
