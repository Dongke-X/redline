import { describe, it, expect } from 'vitest';
import {
  findLongPageCaptureTarget,
  ignoreRedlineChrome,
  measureLongPageTarget,
  planLongPageSlices,
} from '../src/export/pdf.js';

describe('export/pdf planLongPageSlices', () => {
  it('keeps tall-page captures under the canvas limit while using readable page height', () => {
    const slices = planLongPageSlices(1280, 46373, 2);

    expect(slices.length).toBeGreaterThan(1);
    expect(Math.max(...slices.map(s => s.height * 2))).toBeLessThanOrEqual(16000);
    expect(slices.reduce((sum, s) => sum + s.height, 0)).toBe(46373);
    expect(slices[0]).toEqual({ y: 0, height: 1810 });
  });

  it('keeps short pages as one slice', () => {
    expect(planLongPageSlices(1280, 1200, 2)).toEqual([{ y: 0, height: 1200 }]);
  });

  it('allows an explicit page height override', () => {
    expect(planLongPageSlices(1280, 5000, 2, { pageHeight: 2500 })[0]).toEqual({ y: 0, height: 2500 });
  });
});

describe('export/pdf ignoreRedlineChrome', () => {
  it('excludes visible redline UI from html2canvas captures', () => {
    document.body.innerHTML = `
      <div class="fbw-fab-bar"><button class="fbw-fab">Export</button></div>
      <div class="fbw-toast">Capturing 1 / 4</div>
      <main><p id="content">Real page content</p></main>
    `;

    expect(ignoreRedlineChrome(document.querySelector('.fbw-fab'))).toBe(true);
    expect(ignoreRedlineChrome(document.querySelector('.fbw-toast'))).toBe(true);
    expect(ignoreRedlineChrome(document.querySelector('#content'))).toBe(false);
  });
});

describe('export/pdf long-page target', () => {
  it('prefers the real document container over the preview body', () => {
    document.body.innerHTML = `
      <div class="print-note">Kami HTML preview</div>
      <div class="page">
        <article class="document" id="doc"><section>Proposal</section></article>
      </div>
    `;

    expect(findLongPageCaptureTarget().id).toBe('doc');
  });

  it('measures scroll size when layout bounds are not available', () => {
    const target = document.createElement('article');
    Object.defineProperty(target, 'scrollWidth', { value: 1024, configurable: true });
    Object.defineProperty(target, 'scrollHeight', { value: 46373, configurable: true });
    target.getBoundingClientRect = () => ({ width: 0, height: 0 });

    expect(measureLongPageTarget(target)).toEqual({ width: 1024, height: 46373 });
  });
});
