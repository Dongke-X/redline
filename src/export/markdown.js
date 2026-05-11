// 反馈打包成 markdown，用于剪贴板复制 / .md 下载。
import { state } from '../core/state.js';
import { getChanges } from '../core/elements.js';

// 用户输入里若含 ``` 会破坏代码块边界，把后续内容都顶出 code 语境；
// 把三反引号替换成等长 zero-width 序列保留可读性又不破语法。
function escapeFence(s) {
  return String(s || '').replace(/```/g, '`​`​`');
}
// 用户文本若以 markdown 元字符开头（# / > / - / 数字+.）会被渲染成异样结构，
// 在标题/列表敏感的位置做行首转义。
function escapeLeading(s) {
  return String(s || '').replace(/^(#{1,6}\s|[*\-+]\s|>\s|\d+\.\s)/gm, '\\$1');
}

export function buildMarkdown() {
  const changes = getChanges();
  const note = state.panel.querySelector('[data-fbw-global]').value.trim();
  const ts = new Date().toLocaleString('zh-CN', { hour12: false });
  const title = document.title || '页面反馈';
  let md = '# ' + title + ' · 反馈\n\n';
  md += '生成时间: ' + ts + '\n';
  md += '反馈维度: 全局' + (note ? ' OK' : ' —') + ' / 页面 ' + state.sectionFeedback.size + ' / 编辑 ' + changes.length + ' / 元素 ' + state.elementOps.size + ' / 截图 ' + state.attachments.length + '\n\n';
  if (note) md += '## 全局反馈\n\n' + escapeLeading(note) + '\n\n';
  if (state.sectionFeedback.size) {
    md += '## 页面反馈 (' + state.sectionFeedback.size + ' 条)\n\n';
    let i = 0;
    state.sectionFeedback.forEach(v => { i++; md += '### ' + i + '. ' + v.label + '\n\n' + escapeLeading(v.note) + '\n\n'; });
  }
  if (changes.length) {
    md += '## 编辑修改 (' + changes.length + ' 处)\n\n';
    changes.forEach((c, i) => {
      md += '### ' + (i + 1) + '. [' + c.section + ']\n\n**原文**:\n```\n' + escapeFence(c.before) + '\n```\n\n**改后**:\n```\n' + escapeFence(c.after) + '\n```\n\n';
    });
  }
  if (state.elementOps.size) {
    md += '## 元素操作 / 反馈 (' + state.elementOps.size + ' 处)\n\n';
    let oi = 0;
    state.elementOps.forEach((rec) => {
      oi++;
      const noteOp = rec.ops.find(o => o.op === 'note');
      const transformOps = rec.ops.filter(o => o.op !== 'note');
      const opsStr = transformOps.map(o => {
        if (o.op === 'move') return `move(x=${o.args.x}, y=${o.args.y})`;
        if (o.op === 'scale') return `scale(${o.args.scale})`;
        if (o.op === 'rotate') return `rotate(${o.args.rotate}°)`;
        if (o.op === 'highlight') return o.args?.color ? `highlight(${o.args.name || o.args.color})` : 'highlight(clear)';
        if (o.op === 'replace-img') return `replace-img("${o.args.name}")`;
        return o.op;
      }).join(' + ');
      md += '### ' + oi + '. ' + rec.descriptor + '\n';
      if (opsStr) md += '- 操作：' + opsStr + '\n';
      if (noteOp) md += '- 反馈：' + escapeLeading(noteOp.args.text) + '\n';
      md += '\n';
    });
  }
  if (state.annotations.length) {
    md += '## 区域标注 (' + state.annotations.length + ' 处)\n\n';
    state.annotations.forEach((a, i) => {
      const pct = a.rectPct || {};
      const type = a.type || 'region';
      const note = a.note || a.text;
      if (type === 'floating') {
        const pos = `(x=${((pct.x||0)*100).toFixed(0)}%, y=${((pct.y||0)*100).toFixed(0)}%)`;
        md += `### ${i + 1}. [${a.secLabel || '?'}] · 浮动文字 · ${pos}\n\n`;
        md += `${a.content ? escapeLeading(a.content) : '_(空)_'}\n\n`;
      } else {
        const region = `(x=${((pct.x||0)*100).toFixed(0)}%, y=${((pct.y||0)*100).toFixed(0)}%, w=${((pct.w||0)*100).toFixed(0)}%, h=${((pct.h||0)*100).toFixed(0)}%)`;
        md += `### ${i + 1}. [${a.secLabel || '?'}] · 区域标注 · ${region}\n\n`;
        if (a.content) md += `**内容（要插入页面）**：\n\n${escapeLeading(a.content)}\n\n`;
        if (note) md += `**反馈**：\n\n> ${escapeLeading(note).replace(/\n/g, '\n> ')}\n\n`;
        if (a.image) {
          const fileRef = a.image.filename ? ` (${a.image.filename})` : '';
          md += `**附图**：${a.image.name}${fileRef}\n\n`;
        }
        if (!a.content && !note && !a.image) md += '_(空标注)_\n\n';
      }
    });
  }
  if (state.attachments.length) {
    md += '## 附件截图 (' + state.attachments.length + ' 张)\n\n';
    state.attachments.forEach((att, i) => { md += '- [截图 ' + (i + 1) + '] ' + att.name + '\n'; });
    md += '\n';
  }
  if (!changes.length && !note && !state.sectionFeedback.size && !state.attachments.length) {
    md += '_(没有任何反馈)_\n';
  }
  return md;
}
