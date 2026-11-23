import { getStore } from '@netlify/blobs';
import { json, cors } from './_lib.mjs';

/**
 * Purchases credited for a player, so the game can confirm a payment that was
 * completed in a separate tab (no paymentReceivedCallback in that case).
 */
export default async (request) => {
  if (request.method === 'OPTIONS') return cors();

  const uid = new URL(request.url).searchParams.get('uid');
  if (!uid) return json({ purchases: [] }, 400);

  const store = getStore('purchases');
  const { blobs } = await store.list({ prefix: 'tid:' });
  const purchases = [];

  for (const blob of blobs.slice(-200)) {
    const record = await store.get(blob.key, { type: 'json' });
    if (!record || String(record.uid) !== String(uid)) continue;
    let itemId = null;
    try {
      itemId = JSON.parse(record.merchant).item_id || null;
    } catch {
      itemId = null;
    }
    purchases.push({ tid: blob.key.replace('tid:', ''), itemId, at: record.at });
  }

  return json({ purchases });
};
