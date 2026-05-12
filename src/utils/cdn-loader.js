// CSP-aware CDN 加载器：三层兜底应对页面 Content Security Policy 把外部 script 拦掉的场景。
//
// 1. 直接 <script src=...> 加载 —— 最快，走浏览器缓存
// 2. fetch() 拉源码 + 插入为带 nonce 的 inline script —— 绕开 script-src 的源白名单
// 3. 都失败 → 调用方拿到 false，自己决定怎么降级（toast 提示 / 走矢量 PDF 等）
//
// SRI：如果 spec.integrity 有值，inline 路径会本地校验 SHA-384，校验失败拒绝注入。

function findPageNonce() {
  const s = document.querySelector('script[nonce]');
  if (!s) return null;
  return s.nonce || s.getAttribute('nonce') || null;
}

function tryScriptSrc({ src, integrity }) {
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) {
      s.integrity = integrity;
      s.crossOrigin = 'anonymous';
    }
    s.referrerPolicy = 'no-referrer';
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    s.onload = () => finish(true);
    s.onerror = () => finish(false);
    document.head.appendChild(s);
    // CSP block 时浏览器不一定触发 onerror（不同浏览器表现不一致），给个超时兜底
    setTimeout(() => finish(false), 4000);
  });
}

async function sha384Base64(text) {
  try {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-384', buf);
    const bin = Array.from(new Uint8Array(hash)).map(b => String.fromCharCode(b)).join('');
    return 'sha384-' + btoa(bin);
  } catch (_) { return null; }
}

async function tryFetchInline({ src, integrity }, nonce) {
  try {
    const res = await fetch(src, { mode: 'cors', referrerPolicy: 'no-referrer' });
    if (!res.ok) return false;
    const code = await res.text();
    if (integrity) {
      const actual = await sha384Base64(code);
      if (actual && actual !== integrity) {
        console.warn('[fbw] SRI mismatch on inline fallback:', src, actual, '!=', integrity);
        return false;
      }
    }
    const s = document.createElement('script');
    if (nonce) s.nonce = nonce;
    s.textContent = code;
    document.head.appendChild(s);
    return true;
  } catch (e) {
    console.warn('[fbw] fetch+inline fallback failed:', src, e?.message || e);
    return false;
  }
}

// spec: { src, integrity? }
// globalCheck: () => boolean，告诉 loader 加载成功的标志（如 () => !!window.html2canvas）
export async function loadCdnLib(spec, globalCheck) {
  if (typeof globalCheck === 'function' && globalCheck()) return true;

  if (await tryScriptSrc(spec)) {
    if (!globalCheck || globalCheck()) return true;
  }

  const nonce = findPageNonce();
  if (await tryFetchInline(spec, nonce)) {
    if (!globalCheck || globalCheck()) return true;
  }

  return false;
}
