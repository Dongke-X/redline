// 全局事件总线 —— 把多处 addEventListener 合并成单一 native 监听。
// 设计：每个 type 只挂一个 native listener，触发时按订阅顺序调用所有 subscriber。
// scroll/resize 走 window；mousemove/mouseup 走 document。
// subscriber 内部自己做防抖/节流/状态守卫。
//
// 用法：
//   import { onScroll, onMousemove } from '../utils/events.js';
//   const off = onMousemove((e) => { ... });
//   off(); // 取消订阅

const TYPE_TARGET = {
  scroll: 'window',
  resize: 'window',
  mousemove: 'document',
  mouseup: 'document',
};

const buses = new Map();

function ensureBus(type) {
  let bus = buses.get(type);
  if (!bus) {
    bus = { subs: new Set(), attached: false };
    buses.set(type, bus);
  }
  if (!bus.attached) {
    const target = TYPE_TARGET[type] === 'window' ? window : document;
    // mousemove/mouseup: passive false（subscriber 可能 preventDefault，比如 marquee 画框时阻止 native text selection）
    // scroll/resize: passive true，纯监听
    const isMouse = type === 'mousemove' || type === 'mouseup';
    const opts = isMouse ? { passive: false, capture: false } : { passive: true, capture: true };
    target.addEventListener(type, (e) => {
      bus.subs.forEach(fn => {
        try { fn(e); } catch (err) { console.warn('[fbw] event bus subscriber failed:', type, err); }
      });
    }, opts);
    bus.attached = true;
  }
  return bus;
}

/**
 * 订阅事件，返回取消订阅函数。
 * @param {'scroll'|'resize'|'mousemove'|'mouseup'} type
 * @param {(e: Event) => void} fn
 * @returns {() => void}
 */
export function on(type, fn) {
  const bus = ensureBus(type);
  bus.subs.add(fn);
  return () => bus.subs.delete(fn);
}

export const onScroll = (fn) => on('scroll', fn);
export const onResize = (fn) => on('resize', fn);
export const onMousemove = (fn) => on('mousemove', fn);
export const onMouseup = (fn) => on('mouseup', fn);
