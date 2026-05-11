# Security Policy

## 数据隐私

redline 是**纯本地**工具，**不上传任何数据**到任何远程服务器：

- 反馈、标注、截图、文字 → 全部存在用户本地
  - in-memory `state` 对象
  - `localStorage`（metadata，~KB）
  - `IndexedDB`（截图 blob）
  - 文件系统：`~/.redline/sessions/`（用户 FS Access 主动选目录）
- 没有 telemetry / analytics / 远程 logger / cookie

按需联网的部分（明确告知）：
- **CDN 加载第三方库**（首次导出 PDF / 截图时）：
  - `html2canvas@1.4.1` from jsdelivr，带 SRI hash 校验
  - `jspdf@2.5.1` from jsdelivr，带 SRI hash 校验
- 失败可降级：纯打印 / 纯 markdown 复制都不依赖网

Chrome 扩展 `host_permissions: ["<all_urls>"]` 仅用于注入 widget 到当前 tab，**不读取也不发送页面内容**。

## 上报漏洞

如发现安全问题（XSS / 注入 / 数据泄露 / 供应链），请**不要**开 public issue。

- Email: 待补 / 或开 GitHub Private Vulnerability Report
- 我们会在 7 天内 ack，30 天内尝试修复

## 安全设计

- **innerHTML 用户内容隔离**：所有用户输入通过 `escapeHtml` / `escapeFence` / `escapeLeading` 转义后写入 markdown / DOM
- **CDN SRI hash**：第三方脚本带 SHA-384 完整性校验
- **`file://` 协议沙箱**：Local Font Access API 在 `file://` 下不可用是浏览器有意限制，不绕开
- **proposed flag**：review 模式下 element ops 自动标记，apply.mjs 永不写源（避免线上 webapp 被误改）
- **path 白名单**：apply.mjs 应用前会做 `path.resolve()` 防 `../` 穿越
- **localStorage 隔离**：每个 URL pathname 独立 namespace，不串数据

## 已知限制

- 截图存到 IndexedDB：浏览器禁用 storage 时降级到内存（关 tab 即丢）
- session.json 里**没有加密**——同机器下其他进程可读，不要用 redline 收集敏感信息
- CDN 依赖 jsdelivr 可用性：受限网络可能加载失败（但纯 markdown / 标注流程不受影响）

## License

MIT — 本工具按 "as is" 提供，使用风险自负。
