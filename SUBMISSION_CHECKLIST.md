# Chrome Web Store 提交清单 — Redline

按顺序勾掉。带 🧑 的需要东可亲自做（账户、付费、截图、上传）。

---

## A. 代码就绪（已完成）

- [x] MV3 manifest，无远程代码
- [x] popup.html / popup.js（注入控制 + 状态）
- [x] options.html / options.js（保存方式 / 自动注入域名）
- [x] _locales/en + zh_CN（manifest i18n 化）
- [x] 保存通道：ZIP 默认 + FS Access 高级模式（chrome.storage 偏好驱动）
- [x] PRIVACY.md（隐私政策）
- [x] STORE_LISTING.md（上架文案 + 权限说明）
- [x] icons 16/48/128

## B. 打包前最后一遍

- [ ] `npm run build:ext`（确保 dist/redline.js 同步到 extension/）
- [ ] `npm test`（17/17 应通过）
- [ ] 临时禁用 Redline 之外的所有扩展 → 加载 `extension/` → 在 5 个真实站点冒烟：
  - https://example.com
  - https://news.ycombinator.com
  - https://github.com
  - 自家 staging 页（任何内部页）
  - localhost / file:// 任意 HTML
- [ ] 验证 popup 三状态：blocked（chrome:// 页）、idle、injected
- [ ] 验证 ZIP 下载：含 .json + .md + 图片，能用 Finder/Windows 解压
- [ ] 验证 options 保存到 `chrome.storage.sync` 后会跨设备同步
- [ ] 在全新 Chrome profile 装一遍走完整流程（评审会这么做）
- [ ] DevTools console 全程无 error / warning

## C. 视觉素材 🧑

放到 `~/Desktop/开发项目管理/feedback-widget/store-assets/`（自建）

- [ ] **screenshot-01.png** 1280×800 — popup "Active on this tab"
- [ ] **screenshot-02.png** 1280×800 — 编辑文字（before/after 高亮）
- [ ] **screenshot-03.png** 1280×800 — 区域标注 + 反馈面板
- [ ] **screenshot-04.png** 1280×800 — Save 后下载 ZIP，Finder 显示内容
- [ ] **screenshot-05.png** 1280×800 — Skill 端读取 session.json 应用补丁
- [ ] **promo-tile.png** 440×280（推荐）

提示：用 macOS 内置截图 ⌘⇧4 → 框选；保证文字清晰、UI 不太密；
如果 Chrome 缩放 100% 截 1280×800 可能不够大，考虑 1.5x DPR 设备截后缩。

## D. 提交流程 🧑

1. **开发者账号**
   - https://chrome.google.com/webstore/devconsole
   - $5 一次性付费（Google 账号绑信用卡）
   - 验证邮箱 + 填发布者信息

2. **隐私政策 URL**（评审必填）✅ 已就绪
   - 文件已写：`docs/PRIVACY.html`（漂亮排版版本，匹配 landing 风格）
   - 同时 `docs/index.html` = 着陆页（Pages 根 URL 即 marketing 主页）
   - **手动启用 Pages（一次性，2 分钟）**：
     1. 推送 docs/ 到 GitHub
     2. GitHub 仓库 → Settings → Pages
     3. Source: **Deploy from a branch**
     4. Branch: **main**　Folder: **/docs**　→ Save
     5. 等约 1 分钟，访问：
        - 着陆页：`https://dongke-x.github.io/redline/`
        - 隐私政策：`https://dongke-x.github.io/redline/PRIVACY.html` ← Web Store 评审填这个

3. **打包 ZIP 上传**
   ```bash
   cd extension
   zip -r ../redline-extension-v2.7.1.zip . -x "*.bak.*" "*.DS_Store"
   ```
   上传到开发者后台 → 创建新条目

4. **填表**（从 `STORE_LISTING.md` 复制粘贴）
   - Name / Short description / Detailed description
   - 类目：Productivity
   - 语言：English + Simplified Chinese
   - 单一目的（Single purpose）
   - 每个权限的理由
   - 数据使用披露：全选"未收集"
   - Privacy policy URL

5. **上传素材**
   - icon 128（自动从 manifest 取）
   - screenshots 1-5
   - promo tile（可选）

6. **提交评审**
   - 首次评审通常 1-3 个工作日，部分会到 1-2 周
   - 关键被拒原因预防：
     - `<all_urls>` 必须有"用户主动触发"的清晰说明 ✅ 已在文案
     - 隐私政策 URL 必须是公开可访问的 https
     - 不能有混淆代码（minify ✅ 允许 / obfuscate ❌ 禁止）

## E. 上线后

- [ ] 在 README.md 顶部加 Web Store 徽章 / 安装链接
- [ ] CHANGELOG.md 写一条 v0.1.1 release note
- [ ] git tag v0.1.1 + push
- [ ] 在仓库 Releases 页发 release
