# 应用 redline 反馈 — 通用 LLM 提示词（中文）

如果你在浏览器里导出了 redline 反馈 ZIP，但**没有 Claude Code**，可以用下面的模板让**任意 LLM** 帮你把反馈应用回源 HTML —— ChatGPT、Claude 网页版、DeepSeek、通义、智谱、扣子里跑的 agent、Dify workflow，统统能用。

Claude Code 的 `apply.mjs` skill 仍然是最丝滑的路径（自动处理 selector 兜底 + 直接写盘），但这些模板让你不依赖任何特定平台都能闭环。

---

## 完整版 —— 处理所有 edit 类型 + 标注 + 反馈

复制下面这一整块到你的 LLM 对话框，然后把 `<把你的 HTML 粘到这里>` 和 `<把 session.json 粘到这里>` 换成 ZIP 里的真实内容。

````
把 HTML review 反馈应用回源码。

输入：
  - 源 HTML（在 <HTML> 标签内）
  - redline 的 session.json（在 <SESSION_JSON> 标签内）

规则 —— `edits[]` 里每条按 op 分别处理：

| op | 怎么做 |
|---|---|
| text | 找元素，把 textContent 换成 `after`，尽量保留内部 markup |
| hide | 加 inline style="visibility: hidden" |
| delete | 从 DOM 删除元素 |
| move | 加/合并 inline style="transform: translate(Xpx, Ypx)" |
| scale | 加/合并 transform: scale(N) |
| rotate | 加/合并 transform: rotate(Ndeg) |
| font | 加 inline style="font-family: ..." |
| note | 不动源码，列在 summary 里 |
| replace-img | 跳过，列在 summary 里让我人工 review |

元素定位（按顺序尝试，第一个命中就停）：
1. selector.id —— 优先用
2. selector.fbId —— 匹配 `[data-fbw-edit-id="..."]`
3. selector.cssPath —— 用 CSS selector 路径
4. selector.contentHash.sample —— 找 `textContent.trim().slice(0, 40)` 跟这个采样一致的元素

都找不到：跳过，在 summary 里警告。

标注 —— 不要自动 patch。`annotations[]` 每条在 summary 列出来：
  "在 [secLabel]（约占 W%×H% 区域）：[text]（参考图：[image.filename]）"

留言反馈 —— 不要自动 patch。`feedback.global` 和 `feedback.perSection` 在 summary 作为叙事建议列出，让我自己决定怎么落实。

输出：
1. 完整 patched HTML，包在 ```html ... ``` 里
2. summary 段：
   - ✓ N 条 edits 应用成功
   - ✗ M 条 edits 跳过（原因）
   - ⚠ K 条 annotations 待人工决定
   - ℹ 全局 / 每节反馈叙事

<HTML>
<把你的 HTML 粘到这里>
</HTML>

<SESSION_JSON>
<把 session.json 粘到这里>
</SESSION_JSON>
````

---

## 精简版 —— 只改文字

只有文字编辑的反馈用这个，token 占用少，能在上下文窗口小的 LLM 里跑。

````
把文字编辑应用到 HTML。

`edits[]` 里 op === "text" 的：
  - 按 selector.id → [data-fbw-edit-id] → cssPath → contentHash.sample 顺序找元素
  - 把 textContent 换成 `after` 的值

其它 op 类型和 annotations 全部跳过。

只输出完整 patched HTML，包在 ```html ... ``` 里，不要任何其它说明文字。

<HTML>
<把你的 HTML 粘到这里>
</HTML>

<SESSION_JSON>
<把 session.json 粘到这里>
</SESSION_JSON>
````

---

## 小贴士

- **HTML 太长 / 上下文限制**：部分 LLM 上下文上限 ~100K token，HTML 超长就被截断。先去除空白字符压一压，或按 section 切分后分批改
- **国产 LLM 输出截断**：DeepSeek / 通义 / 智谱 等模型输出长度有限制，整页 HTML 可能输不完。让它返回**改动列表**而不是完整 HTML：
  ```
  不要输出完整 patched HTML，而是列出每条改动：
    { "id|fbId|cssPath": "...", "before": "...", "after": "..." }
  ```
  然后用小脚本或手工应用
- **永远备份**：LLM 应用改动可能漂移，覆盖前先比对：
  ```bash
  cp source.html source.html.bak.$(date +%s)
  ```
- **标注要靠你不是 LLM**：图片标注 + 叙事反馈我们故意不自动应用 —— 这些需要设计判断。LLM 列给你，你来决定

---

## 为什么有这些模板

redline 的浏览器编辑器 + Chrome 扩展对所有人都可用 —— 不需要 Claude 账号。但「把反馈应用回源 HTML」这一步原本只支持 Claude Code。这些提示词让最后一步**跟平台无关**，任何能跑 LLM 的人都能完成闭环。

如果你在用 Claude Code，[skill](https://github.com/Dongke-X/redline/tree/main/skill) 仍然是最丝滑的路。如果不在，这些模板就是你的闭环。
