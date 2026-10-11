// تقدّم المتدرب. POST {id, token, snapshot} — GET ?id=&token= يعيد لقطة المتدرب + إعدادات الدورة
import { enabled, getJ, setJ, cmd, sha, token, body, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (!enabled()) return res.status(503).json({ error: 'storage_not_configured', local: true });
  try {
    if (req.method === 'GET') {
      const { id, token: t } = req.query || {};
      const cfg = (await getJ('tf:config')) || {};
      if (!id) return res.status(200).json({ ok: true, config: cfg });
      const raw = await cmd('HGET', 'tf:users', id); if (!raw) return res.status(404).json({ error: 'not_found' });
      const u = JSON.parse(raw);
      if (u.tok !== t) return res.status(401).json({ error: 'bad_token' });
      const snap = (await getJ('tf:progress:' + id)) || null;
      return res.status(200).json({ ok: true, snapshot: snap, config: cfg });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    const b = body(req); const id = String(b.id || ''), t = String(b.token || '');
    if (!/^[0-9a-f]{16}$/.test(id) || !/^[0-9a-f]{40}$/.test(t)) return res.status(400).json({ error: 'bad_request' });
    const raw = await cmd('HGET', 'tf:users', id); if (!raw) return res.status(404).json({ error: 'not_found' });
    const u = JSON.parse(raw); if (u.tok !== t) return res.status(401).json({ error: 'bad_token' });
    const s = b.snapshot || {};
    const snap = { at: Date.now(), days: s.days || {}, overall: Math.max(0, Math.min(100, +s.overall || 0)), items: s.items || {}, scores: s.scores || {}, org: String(s.org || '').slice(0, 120), ua: String(req.headers['user-agent'] || '').slice(0, 80) };
    await setJ('tf:progress:' + id, snap);
    await cmd('HSET', 'tf:seen', id, String(Date.now()));
    return res.status(200).json({ ok: true, at: snap.at });
  } catch (e) { return res.status(500).json({ error: 'server_error' }); }
}
