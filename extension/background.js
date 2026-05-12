// MV3 service worker。
// 用户点扩展图标 → 在当前 tab 的 MAIN world 注入 redline.js。
// 已注入的 tab 再点一次 → 切换 panel（通过派发到页面里的 toggle 函数）。

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;
  // 排除 chrome:// / chrome-extension:// 等不允许注入的方案
  if (!/^(https?|file):/.test(tab.url)) {
    chrome.action.setBadgeText({ tabId: tab.id, text: '✕' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#666' });
    return;
  }

  // Chrome 扩展商店域名由内核拦截所有扩展注入，提前短路避免误报错误
  if (/^https:\/\/(chrome\.google\.com\/webstore|chromewebstore\.google\.com)/.test(tab.url)) {
    chrome.action.setBadgeText({ tabId: tab.id, text: '✕' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#666' });
    return;
  }

  try {
    const [probe] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      func: () => !!window.__feedbackWidgetLoaded,
    });
    const alreadyLoaded = probe?.result;

    if (alreadyLoaded) {
      // 已注入：切换反馈面板
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: () => {
          // 找到反馈面板并 toggle .fbw-open（保持对内部 fbw- 前缀的兼容）
          const panel = document.querySelector('.fbw-panel');
          if (panel) panel.classList.toggle('fbw-open');
        },
      });
      return;
    }

    // 首次注入：先把 bundle 源码（完整字符串）stash 到页面，
    // 给 single-file export 用（MAIN world 拿不到 chrome.runtime，CSP 也可能拦 fetch）
    let bundleText = null;
    try {
      const res = await fetch(chrome.runtime.getURL('redline.js'));
      bundleText = await res.text();
    } catch (_) {}
    if (bundleText) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: (src) => { window.__fbwBundleSource = src; },
        args: [bundleText],
      });
    }
    // 然后把 bundle 灌进 page MAIN world
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      files: ['redline.js'],
    });
    // 不显示 badge：注入成功是常态，没必要遮图标。错误状态才用 badge 提醒。
    chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  } catch (e) {
    console.error('[redline] inject failed:', e);
    chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#cc3344' });
  }
});

// tab 关闭/切换 → 清掉 badge（避免误导用户当前 tab 注入了，实则是上次的状态）
chrome.tabs.onRemoved.addListener((tabId) => {
  // 不需要做什么，badge 自动随 tab 销毁
});
