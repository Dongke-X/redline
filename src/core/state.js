// 共享状态 singleton。所有模块通过 import { state } 读写。
// 这是一个有意为之的设计：原 init() 闭包里所有跨函数共享变量都收口到这里。
//
// 类型见 src/types.js。状态字段按职责分组（同组在一起）：
//   1. DOM refs       —— init 阶段填，从来不变
//   2. 模式 + 交互态  —— 用户操作过程中频繁变
//   3. 业务数据       —— 反馈/标注/编辑等持久化对象
//   4. 注入态         —— inject.js 在 deck-stage 场景下填
//
// 重构方向（未来 P3 续）：把 1/2/3 拆成独立 module，分别导出 hook，
// 减少跨模块互相 import state 的耦合。本次只做注释分组，不破 API。

/**
 * @typedef {import('../types.js').AppMode} AppMode
 * @typedef {import('../types.js').Annotation} Annotation
 * @typedef {import('../types.js').Attachment} Attachment
 * @typedef {import('../types.js').SectionFeedback} SectionFeedback
 * @typedef {import('../types.js').Op} Op
 */

export const state = {
  // ════════════════════════ 1. DOM 节点（init 阶段填充） ════════════════════════
  /** @type {HTMLElement|null} */ panel: null,
  /** @type {HTMLElement|null} */ confirmDialog: null,
  /** @type {HTMLElement|null} */ fabBar: null,
  /** @type {HTMLElement|null} */ editFab: null,
  /** @type {HTMLElement|null} */ fbFab: null,
  /** @type {HTMLElement|null} */ marqueeFab: null,
  /** @type {HTMLElement|null} */ pickFab: null,
  /** @type {HTMLElement|null} */ exportFab: null,
  /** @type {HTMLElement|null} */ undoFab: null,
  /** @type {HTMLElement|null} */ redoFab: null,
  /** @type {HTMLElement|null} */ compareFab: null,
  /** @type {HTMLElement|null} */ helpFab: null,
  /** @type {HTMLElement|null} */ helpPopover: null,
  /** @type {HTMLElement|null} */ foldFab: null,
  /** @type {HTMLElement|null} */ elemToolbar: null,
  /** @type {HTMLElement|null} */ fontPicker: null,
  /** @type {HTMLElement|null} */ notePopover: null,
  /** @type {HTMLElement|null} */ markerPopover: null,
  /** @type {HTMLElement|null} */ tagPopover: null,
  /** @type {HTMLElement|null} */ stylePanel: null,
  /** @type {HTMLElement|null} */ resizeHandles: null,
  /** @type {Function|null} */ onChangeHook: null,
  /** 多选支持：state.selectedEl 始终指向 anchor（最近一次点）；selectedEls 是当前完整选区。
   * 单选时两者一致；多选时 selectedEls 含 selectedEl 在内的所有元素 */
  /** @type {Set<HTMLElement>} */ selectedEls: new Set(),

  // ════════════════════════ 2. 模式 + 交互态（频繁变） ════════════════════════
  /** @type {HTMLElement|null} */ selectedEl: null,
  editMode: false,
  /** @type {HTMLElement|null} */ currentSec: null,
  dragState: null,
  /** @type {AppMode} */
  appMode: 'deck',
  marqueeMode: false,

  // ════════════════════════ 3. 业务数据（持久化目标） ════════════════════════
  /** edit-id → 原始 textContent  @type {Map<string, string>} */
  originals: new Map(),
  /** element → { ops: Op[], descriptor: string }  @type {Map<HTMLElement, {ops: Op[], descriptor: string}>} */
  elementOps: new Map(),
  /** secId → { label, note }  @type {Map<string, SectionFeedback>} */
  sectionFeedback: new Map(),
  /** @type {Attachment[]} */ attachments: [],
  /** @type {Annotation[]} */ annotations: [],

  // ════════════════════════ 4. deck-stage overlay 注入态 ════════════════════════
  /** @type {HTMLElement|null} */ editToggleBtn: null,
  /** @type {HTMLElement|null} */ fbToggleBtn: null,
  /** @type {HTMLElement|null} */ saveEditBtn: null,
  /** @type {HTMLElement|null} */ marqueeToggleBtn: null,
  /** @type {HTMLElement|null} */ helpToggleBtn: null,
};
