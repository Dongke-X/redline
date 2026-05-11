// 中央类型定义。运行时无内容（typedef-only），IDE / tsc --checkJs 用来吃这些。
// 引用方式：在文件顶部加：
//   /** @typedef {import('./types.js').Annotation} Annotation */
// 然后函数签名上加 @param / @returns 注解。

/**
 * 应用模式。
 * - deck   : 幻灯片 (有 <deck-stage>)
 * - doc    : HTML 文档 (匹配 SECTION_SELECTORS)
 * - review : 网页预览 (任意线上 webapp，无源 HTML)
 * @typedef {'deck' | 'doc' | 'review'} AppMode
 */

/**
 * 元素操作类型。
 * @typedef {'text'|'move'|'scale'|'rotate'|'hide'|'delete'|'restore'|'font'|'replace-img'|'highlight'|'note'} OpType
 */

/**
 * 单条元素操作记录。args 类型按 op 分。
 * @typedef {Object} Op
 * @property {OpType} op
 * @property {Object} [args]
 * @property {boolean} [proposed] - review 模式下为 true，apply 阶段不自动 patch
 */

/**
 * 标注矩形百分比坐标（相对所在 section）。
 * @typedef {Object} RectPct
 * @property {number} x  0-1
 * @property {number} y  0-1
 * @property {number} w  0-1，floating 标注为 0
 * @property {number} h  0-1，floating 标注为 0
 */

/**
 * 标注图片附件。
 * @typedef {Object} AnnoImage
 * @property {string} name      - 用户上传时原始 filename
 * @property {string} [filename]- session 写盘后的相对路径 (sess-anno-XXX.png)
 * @property {string} [dataURL] - in-memory 时的 base64
 * @property {string} [type]    - mime type
 */

/**
 * 一个标注。type=region 是用户拖框；type=floating 是双击空白处加文字。
 * @typedef {Object} Annotation
 * @property {string} id
 * @property {'region'|'floating'} type
 * @property {string} secId
 * @property {string} secLabel
 * @property {RectPct} rectPct
 * @property {string} content - 要插入页面的文本
 * @property {string} [note]  - 给 agent 的反馈备注（仅 region 用）
 * @property {AnnoImage|null} [image]
 * @property {boolean} [_editing]   - 内部 UI flag
 * @property {boolean} [_autoEdit]  - 创建后自动进入编辑态
 */

/**
 * 元素 selector 三层 fallback 结构。
 * @typedef {Object} ElementSelector
 * @property {string|null} id              - 作者主动写的 id 优先
 * @property {string} [cssPath]            - section + 内部 querySelector 路径
 * @property {Object} [contentHash]        - 内容指纹兜底
 * @property {string} contentHash.sample
 * @property {string} contentHash.hash
 * @property {string} [fbId]               - 会话级 ID
 * @property {string} tag
 */

/**
 * 一条 edit（可能是 text 改写、transform、note、replace-img 等）。
 * @typedef {Object} Edit
 * @property {OpType} op
 * @property {ElementSelector} selector
 * @property {string} descriptor  - 给人看的 "section · tag · 前 28 字"
 * @property {string} [before]    - text op 才有
 * @property {string} [after]
 * @property {Object} [args]
 * @property {boolean} [proposed]
 */

/**
 * 反馈附件（截图 / 用户拖入）。
 * @typedef {Object} Attachment
 * @property {string} id
 * @property {string} name
 * @property {string} type   - mime
 * @property {string} dataURL
 */

/**
 * 单页反馈记录。
 * @typedef {Object} SectionFeedback
 * @property {string} label
 * @property {string} note
 */

/**
 * session.v1.json 顶层结构。schema 见 schema/session.v1.schema.json
 * @typedef {Object} SessionData
 * @property {'1.0'} schemaVersion
 * @property {string} widgetVersion
 * @property {AppMode} appMode
 * @property {string} sessionId
 * @property {string} capturedAt        - ISO 字符串
 * @property {number} capturedAtMs
 * @property {Object} env
 * @property {string} env.userAgent
 * @property {string} env.locale
 * @property {Object} env.viewport
 * @property {string} env.timezone
 * @property {Object} page
 * @property {string} page.url
 * @property {string|null} page.title
 * @property {string} page.pathname
 * @property {Object} source
 * @property {string} source.hint
 * @property {string} source.matchBy
 * @property {Object} feedback
 * @property {string|null} feedback.global
 * @property {Array<{secId:string,secLabel:string,note:string}>} feedback.perSection
 * @property {Edit[]} edits
 * @property {Annotation[]} annotations
 * @property {Attachment[]} attachments
 */

export {}; // 让本文件是 ESM
