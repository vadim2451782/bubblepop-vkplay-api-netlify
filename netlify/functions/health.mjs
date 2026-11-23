import { json, GMRID, SECRET } from './_lib.mjs';

export default async () =>
  json({ ok: true, gmrid: GMRID, secret: SECRET ? 'set' : 'missing' });
