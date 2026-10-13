// إشعارات المتدرب. GET ?id=&token=&since=  → الإشعارات الموجّهة لهذا المتدرب (للجميع/لمجموعته/له) الأحدث من since.
import { enabled, cmd, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (!enabled()) return res.status(200).json({ ok: true, local: true, notifs: [] });
  try {
    const { id, token: t, since } = req.query || {};
    if (!id || !t) return res.status(400).json({ error: 'bad_request' });
    const raw = await cmd('HGET', 'tf:users', String(id)); if (!raw) return res.status(404).json({ error: 'not_found' });
    const u = JSON.parse(raw); if (u.tok !== t) return res.status(401).json({ error: 'bad_token' });
    const list = (await cmd('LRANGE', 'tf:notifs', 0, 199)) || [];
    const sinceTs = +since || 0; const grp = 'group:' + (u.group || 'عام'); const usr = 'user:' + String(id);
    const notifs = list.map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean)
      .filter(n => n.ts > sinceTs && (n.to === 'all' || n.to === grp || n.to === usr))
      .sort((a, b) => b.ts - a.ts).slice(0, 20);
    return res.status(200).json({ ok: true, notifs });
  } catch (e) { return res.status(500).json({ error: 'server_error' }); }
}
