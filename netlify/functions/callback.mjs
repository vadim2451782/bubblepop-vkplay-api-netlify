import { getStore } from '@netlify/blobs';
import { PRODUCTS, sign, json, cors } from './_lib.mjs';

export default async (request) => {
  if (request.method === 'OPTIONS') return cors();

  const url = new URL(request.url);
  const params = {
    uid: url.searchParams.get('uid') || '',
    sum: url.searchParams.get('sum') || '',
    tid: url.searchParams.get('tid') || '',
    merchant_param: url.searchParams.get('merchant_param') || '{}',
  };

  if (sign(params) !== (url.searchParams.get('sign') || '')) {
    return json({ status: 'error', errcode: 1, errmsg: 'bad sign' });
  }

  let product = null;
  try {
    product = PRODUCTS[JSON.parse(params.merchant_param).item_id] || null;
  } catch {
    product = null;
  }
  if (!product || Number(params.sum) !== product.price) {
    return json({ status: 'error', errcode: 2, errmsg: 'bad sum' });
  }

  const store = getStore('purchases');
  const key = `tid:${params.tid}`;
  if (await store.get(key)) return json({ status: 'ok' });

  await store.setJSON(key, {
    uid: params.uid,
    sum: params.sum,
    merchant: params.merchant_param,
    at: Date.now(),
  });
  return json({ status: 'ok' });
};
