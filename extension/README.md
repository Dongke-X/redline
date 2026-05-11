# Redline · Chrome MV3 扩展

把 Redline 反馈插件**注入到任意网页**：编辑文字 / 标注 / 截图 / 一键打包反馈给 agent。

> 💡 **不一定需要装这个扩展**——如果你 review 的是 agent 给你写的本地 HTML 文件（landing / deck / report 之类），用 [skill 的 `prepare.mjs`](../skill/README.md#preparemjs--注入编辑器) 直接给 HTML 预埋编辑器更省事，不依赖扩展。
>
> 这个扩展的价值是 review **你不能改源**的页面——线上 staging URL、第三方网站、任何 https 页面。

## 安装

### Chrome Web Store（推荐）
*上架准备中*。请暂用开发者模式安装。

### 开发者模式
1. `npm run build:ext`（在仓库根目录）
2. Chrome 打开 `chrome://extensions/`
3. 右上角开启 "开发者模式 / Developer mode"
4. 点 "加载已解压的扩展程序" → 选 `extension/` 目录
5. 工具栏出现 Redline 图标，点击 → popup 弹出 → 注入到当前页

## 使用

- **第一次点图标**：直接注入 redline 到当前 tab，右下角立刻出 FAB pill
- **再次点图标**：toggle 反馈面板（已注入的 tab 不会重复注入）
- 注入后：按 `E` 进编辑模式 / 按 `F` 开反馈面板 / 双击元素改文字 / 拖矩形画区域标注
- **不可注入页面**（chrome://、Web Store 等）：badge 显示 `✕`
- **注入失败**：badge 显示红色 `!`，详情看 console
- **设置**（默认保存方式、自动注入域名白名单）：右键扩展图标 → 选项

## 保存反馈

- 默认：**下载 ZIP** 到 ~/Downloads（含 `session.json` + `session.md` + 图片附件）
- 高级：在"选项"里切到 **FS Access 模式**直接写到 `~/.redline/sessions/`（首次选目录）

## 文件结构

```
extension/
  manifest.json          MV3 manifest（i18n 化）
  background.js          service worker：监听点图标 → 直接注入 / toggle
  options.html / options.js  设置页（默认保存方式、域名白名单）
  redline.js             由 npm run build:ext 拷入
  _locales/              i18n（en / zh_CN）
  icons/                 16/48/128
```

## 局限

- 不能注入 `chrome://` / Chrome Web Store / extensions 内部页面（CSP 限制）
- iframe 不会自动注入；跨域 iframe 用户得在那个 frame 单独触发
- FS Access 模式仅 Chromium 系（Chrome / Edge / Brave / Arc）支持；Firefox / Safari 走 ZIP 下载
