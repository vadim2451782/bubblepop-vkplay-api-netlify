import { PRODUCTS, sign, json, cors, GMRID } from './_lib.mjs';

export default async (request) => {
  if (request.method === 'OPTIONS') return cors();
  if (request.method !== 'POST') return json({ error: 'method' }, 405);

  const body = await request.json().catch(() => ({}));
  const product = PRODUCTS[body.productId];
  const uid = Number(body.uid);
  if (!product) return json({ error: 'unknown_product' }, 400);
  if (!Number.isFinite(uid) || uid <= 0) return json({ error: 'no_uid' }, 400);

  const merchantParam = {
    uid,
    ip: request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0',
    amount: product.price,
    currency: 'RUB',
    item_id: body.productId,
    description: product.title.slice(0, 50),
  };
  const merchantJson = JSON.stringify(merchantParam);
  const signature = sign({ merchant_param: merchantJson });

  const response = await fetch(`https://vkplay.ru/app/${GMRID}/billing/client?sign=${signature}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ merchant_param: merchantJson }),
  });
  const data = await response.json().catch(() => ({}));
  if (!data.url) return json({ error: data.errmsg || 'billing_error' }, 502);
  return json({ url: data.url, merchantParam });
};
