import { describe, it, expect, beforeEach } from 'vitest';
import { detectAppMode } from '../src/init.js';

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('init / detectAppMode', () => {
  it('treats plain local HTML as doc so text can be edited', () => {
    document.body.innerHTML = '<article><h1>Title</h1><p>Editable copy</p></article>';

    expect(detectAppMode({ protocol: 'file:' })).toBe('doc');
  });

  it('treats editable single-file exports as doc even without section markup', () => {
    document.head.innerHTML = '<meta name="fbw-export-mode" content="editable">';
    document.body.innerHTML = '<div><h1>Title</h1><p>Editable copy</p></div>';

    expect(detectAppMode({ protocol: 'https:' })).toBe('doc');
  });

  it('keeps unstructured remote pages in review mode', () => {
    document.body.innerHTML = '<div><h1>Remote app</h1><p>Feedback only</p></div>';

    expect(detectAppMode({ protocol: 'https:' })).toBe('review');
  });
});
