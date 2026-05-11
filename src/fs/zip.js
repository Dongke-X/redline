// 最小 STORE-mode zip 编码器（无压缩）。
// 输出标准 .zip：用 macOS Finder / Windows Explorer / unzip 都能解。
// 仅依赖标准 Web API（TextEncoder, Uint8Array）。

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosTime(d = new Date()) {
  const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds() / 2)) & 31);
  const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
  return { time, date };
}

function writeUint16(view, off, v) { view.setUint16(off, v, true); }
function writeUint32(view, off, v) { view.setUint32(off, v, true); }

/**
 * Build a STORE-mode zip Blob.
 * @param {Array<{name: string, data: Uint8Array}>} entries
 * @returns {Blob}
 */
export function buildZip(entries) {
  const enc = new TextEncoder();
  const { time, date } = dosTime();

  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const data = e.data;
    const crc = crc32(data);
    const size = data.length;

    // Local file header (30 + name)
    const lh = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(lh);
    writeUint32(lv, 0, 0x04034b50);            // signature
    writeUint16(lv, 4, 20);                    // version needed
    writeUint16(lv, 6, 0x0800);                // flags (UTF-8)
    writeUint16(lv, 8, 0);                     // method = store
    writeUint16(lv, 10, time);
    writeUint16(lv, 12, date);
    writeUint32(lv, 14, crc);
    writeUint32(lv, 18, size);                 // compressed size
    writeUint32(lv, 22, size);                 // uncompressed size
    writeUint16(lv, 26, nameBytes.length);
    writeUint16(lv, 28, 0);                    // extra length
    new Uint8Array(lh, 30).set(nameBytes);
    localChunks.push(new Uint8Array(lh), data);

    // Central directory header (46 + name)
    const ch = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(ch);
    writeUint32(cv, 0, 0x02014b50);
    writeUint16(cv, 4, 20);                    // version made by
    writeUint16(cv, 6, 20);                    // version needed
    writeUint16(cv, 8, 0x0800);
    writeUint16(cv, 10, 0);
    writeUint16(cv, 12, time);
    writeUint16(cv, 14, date);
    writeUint32(cv, 16, crc);
    writeUint32(cv, 20, size);
    writeUint32(cv, 24, size);
    writeUint16(cv, 28, nameBytes.length);
    writeUint16(cv, 30, 0);                    // extra
    writeUint16(cv, 32, 0);                    // comment
    writeUint16(cv, 34, 0);                    // disk #
    writeUint16(cv, 36, 0);                    // internal attrs
    writeUint32(cv, 38, 0);                    // external attrs
    writeUint32(cv, 42, offset);               // local header offset
    new Uint8Array(ch, 46).set(nameBytes);
    centralChunks.push(new Uint8Array(ch));

    offset += 30 + nameBytes.length + size;
  }

  // End of central directory
  const centralSize = centralChunks.reduce((s, c) => s + c.length, 0);
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  writeUint32(ev, 0, 0x06054b50);
  writeUint16(ev, 4, 0);                       // disk #
  writeUint16(ev, 6, 0);                       // disk where central starts
  writeUint16(ev, 8, entries.length);
  writeUint16(ev, 10, entries.length);
  writeUint32(ev, 12, centralSize);
  writeUint32(ev, 16, offset);                 // central dir offset
  writeUint16(ev, 20, 0);                      // comment length

  return new Blob([...localChunks, ...centralChunks, new Uint8Array(eocd)], {
    type: 'application/zip',
  });
}
