// 全局常量、调试开关、可编辑选择器
export const VERSION = '0.1.1';

export const STORAGE_KEY = 'fbw-state::' + (location.pathname || '/').slice(0, 200);

if (typeof window !== 'undefined' && window.__fbwDebug === undefined) {
  window.__fbwDebug = true;
}
export const DBG = (...args) => {
  if (typeof window !== 'undefined' && window.__fbwDebug) {
    console.log('%c[fbw]', 'color:#7d8471;font-weight:bold;', ...args);
  }
};

export const EDITABLE_SELECTORS = [
  'h1','h2','h3','h4','h5','h6','p','li','td','th',
  'blockquote','figcaption','dt','dd','img',
  'a',  // 超链接：能选 + 能改可见文字 + (后续) 改 href
  '.scribble','.handwritten','.sub','.pre','.lab','.num','.meta',
  '.who','.who small','.qmark','.big','.label','.marker',
  '.kv-key','.kv-val','.cell','.timeline-event','.timeline-date',
  '.col h3','.stat h3','.card h3','.node h3','.pane h3','.pane h4',
  '.step h4','.step p','.right-card-title','.right-card-judge',
  '.value-card-title','.value-card-text','.skill-card-desc',
  '.drama-meta-sub','.weeks-h-text','.weeks-h-num',
  '.proof-img-cap','.status-pill','.lockup',
].join(', ');

// 视为"页/section"的容器：deck slide、显式 section、顶层 header/nav/footer、main/article。
// 加 nav/footer：landing 的 <nav class="top"> 和 <footer> 里的 a/button 也能被选中，
// 否则 click handler 早 return 不 preventDefault → 链接默认跳走。
export const SECTION_SELECTORS = 'section.slide, section.section, section[data-screen-label], section.cover, section.toc, section.chapter, main > section, main > article, body > section, body > article, body > header, body > nav, body > footer, header[data-screen-label], nav[data-screen-label]';
