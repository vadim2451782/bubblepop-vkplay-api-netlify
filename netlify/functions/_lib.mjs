/**
 * Shared helpers for the VK Play payment functions.
 */

export const PRODUCTS = {
  coins_100: { coins: 100, price: 49, title: '100 монет' },
  coins_500: { coins: 500, price: 199, title: '500 монет' },
  coins_1200: { coins: 1200, price: 449, title: '1200 монет' },
};

export const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
export const GMRID = process.env.VKPLAY_GMRID || '52062';
export const SECRET = process.env.VKPLAY_SECRET || '';

export function md5(input) {
  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;
  const withPad = new Uint8Array((((len + 8) >> 6) + 1) * 64);
  withPad.set(bytes);
  withPad[len] = 0x80;
  const bits = len * 8;
  const view = new DataView(withPad.buffer);
  view.setUint32(withPad.length - 8, bits >>> 0, true);
  view.setUint32(withPad.length - 4, Math.floor(bits / 0x100000000), true);

  const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i += 1) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < withPad.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let i = 0; i < 16; i += 1) M[i] = view.getUint32(offset + i * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i += 1) {
      let F;
      let g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const hex = (n) => n.toString(16).padStart(8, '0').match(/../g).reverse().join('');
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

export function sign(params) {
  const keys = Object.keys(params).filter((key) => key !== 'sign').sort();
  return md5(keys.map((key) => `${key}=${params[key]}`).join('') + SECRET);
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': ORIGIN,
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'POST, GET, OPTIONS',
    },
  });
}

export function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': ORIGIN,
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'POST, GET, OPTIONS',
    },
  });
}
