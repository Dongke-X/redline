// 当前页识别：deck-stage 用 slidechange 事件，普通页面用 IntersectionObserver。
import { state } from '../core/state.js';
import { getChanges } from '../core/elements.js';
import { scheduleSave } from '../core/persist.js';
import { updateCounter } from '../utils.js';

export function setCurrentSlide(slideEl) {
  state.currentSec = slideEl;
  const pageEl = state.panel.querySelector('[data-fbw-current-page]');
  const taEl = state.panel.querySelector('[data-fbw-current-text]');
  const savedTag = state.panel.querySelector('[data-fbw-saved]');
  if (!slideEl) {
    pageEl.textContent = '—';
    taEl.value = '';
    taEl.disabled = true;
    savedTag.classList.remove('fbw-on');
    return;
  }
  taEl.disabled = false;
  pageEl.textContent = slideEl.dataset.fbwSecLabel || 'Section';
  const secId = slideEl.dataset.fbwSecId;
  const existing = state.sectionFeedback.get(secId);
  taEl.value = existing?.note || '';
  savedTag.classList.toggle('fbw-on', !!existing);
}

export function attachSlideTracking(sections) {
  const taEl = state.panel.querySelector('[data-fbw-current-text]');
  taEl.addEventListener('input', (e) => {
    if (!state.currentSec) return;
    const secId = state.currentSec.dataset.fbwSecId;
    const label = state.currentSec.dataset.fbwSecLabel;
    const note = e.target.value.trim();
    if (note) {
      state.sectionFeedback.set(secId, { label, note });
      state.panel.querySelector('[data-fbw-saved]').classList.add('fbw-on');
    } else {
      state.sectionFeedback.delete(secId);
      state.panel.querySelector('[data-fbw-saved]').classList.remove('fbw-on');
    }
    updateCounter(getChanges);
    scheduleSave();
  });
  ['keydown', 'keyup', 'keypress'].forEach(ev =>
    taEl.addEventListener(ev, e => e.stopPropagation()));

  state.panel.querySelector('[data-fbw-global]').addEventListener('input', scheduleSave);

  const deckStage = document.querySelector('deck-stage');
  if (deckStage) {
    document.addEventListener('slidechange', (e) => setCurrentSlide(e.detail?.slide || null));
    const first = deckStage.querySelector('section.slide') || sections[0];
    if (first) setCurrentSlide(first);
  } else {
    document.body.classList.add('fbw-no-overlay');
    if (sections.length) {
      const io = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrentSlide(visible.target);
      }, { threshold: [0.3, 0.5, 0.7] });
      sections.forEach(s => io.observe(s));
      setCurrentSlide(sections[0]);
    }

    // SPA / 任意网页：监听 popstate + pushState/replaceState + document.title 变化，
    // 实时更新当前 section 的 label，避免 SPA 路由切换后 label 还停留在初始 title
    const isFallback = sections.length === 1
      && (sections[0] === document.body || sections[0].tagName === 'MAIN' || sections[0].tagName === 'ARTICLE');
    if (isFallback) {
      const sec = sections[0];
      const refreshLabel = () => {
        const newLabel = (document.title || 'Page').slice(0, 80);
        if (sec.dataset.fbwSecLabel !== newLabel) {
          sec.dataset.fbwSecLabel = newLabel;
          if (state.currentSec === sec) setCurrentSlide(sec);
        }
      };
      window.addEventListener('popstate', refreshLabel);
      // monkey-patch pushState/replaceState 派发自定义事件
      ['pushState', 'replaceState'].forEach(name => {
        const orig = history[name];
        history[name] = function (...args) {
          const r = orig.apply(this, args);
          setTimeout(refreshLabel, 0); // 等 SPA 更新 title
          return r;
        };
      });
      // 兜底：监听 <title> 变化
      const titleEl = document.querySelector('title');
      if (titleEl) {
        new MutationObserver(refreshLabel).observe(titleEl, { childList: true, characterData: true, subtree: true });
      }
    }
  }
}
