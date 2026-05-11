# redline · examples

跑前先 `npm run build` 产出 `../dist/redline.js`。

## standalone.html

任意 HTML 长页面注入 redline 的最小示例。

```bash
npm run demo
# 或
open examples/standalone.html
```

直接 file:// 打开即可（Local Font Access API 在 file:// 下不可用，本地字体功能会兜底成系统字体；要测本地字体跑 `python3 -m http.server` 后访问 http://localhost:8000/examples/standalone.html）。

## 在自己的 deck / proposal 里接入

1. 拷 `../dist/redline.js` 到你的项目
2. HTML 头部加：
   ```html
   <script src="redline.js"></script>
   ```
3. 打开页面，右下角出现 R 图标 / FAB pill，按 E 进编辑模式

## 配套：Chrome 扩展

任意网页都可注入：
```
chrome://extensions/ → 开发者模式 → 加载已解压 → 选 ../extension/
```

工具栏点 R 图标即可在当前 tab 注入。

## screenshots（待补）

放截图的地方：

```
examples/screenshots/
  ├── 01-edit-mode.png        # 编辑模式 + 元素工具栏
  ├── 02-marquee-region.png   # 框选标注 + 加图
  ├── 03-feedback-panel.png   # 反馈面板（当前页/全局/截图）
  ├── 04-claude-apply.gif     # Claude Code 应用反馈到源 HTML 的全过程
  └── 05-three-modes.png      # deck / doc / review 三模式 chip 对比
```

录屏建议用 macOS QuickTime 或 [LICEcap](https://www.cockos.com/licecap/) 输出 gif。
