// لوحة المدرب. الترويسة x-trainer-pin (TRAINER_PIN في Vercel، الافتراضي 2026).
// GET → كل المتدربين وتقدّمهم وإعدادات الدورة · POST {config} يحدّث الإعدادات · POST {del:id} يحذف متدربًا
import { enabled, getJ, setJ, cmd, body, cors, TRAINER_PIN } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  const pin = String(req.headers['x-trainer-pin'] || (req.query || {}).pin || '');
  if (pin !== TRAINER_PIN) return res.status(401).json({ error: 'bad_pin' });
  if (!enabled()) return res.status(200).json({ ok: true, local: true, users: [], config: {} });
  try {
    if (req.method === 'POST') {
      const b = body(req);
      if (b.del) { await cmd('HDEL', 'tf:users', String(b.del)); await cmd('DEL', 'tf:progress:' + String(b.del)); return res.status(200).json({ ok: true }); }
      if (b.config && typeof b.config === 'object') { const cfg = Object.assign((await getJ('tf:config')) || {}, b.config, { updated: Date.now() }); await setJ('tf:config', cfg); return res.status(200).json({ ok: true, config: cfg }); }
      return res.status(400).json({ error: 'bad_request' });
    }
    const all = (await cmd('HGETALL', 'tf:users')) || [];
    const users = [];
    for (let i = 0; i < all.length; i += 2) { try { const u = JSON.parse(all[i + 1]); delete u.pinHash; delete u.tok; users.push(u); } catch (e) {} }
    const snaps = users.length ? await cmd('MGET', ...users.map(u => 'tf:progress:' + u.id)) : [];
    users.forEach((u, i) => { try { u.progress = snaps[i] ? JSON.parse(snaps[i]) : null; } catch (e) { u.progress = null; } });
    const config = (await getJ('tf:config')) || {};
    return res.status(200).json({ ok: true, users, config, count: users.length });
  } catch (e) { return res.status(500).json({ error: 'server_error' }); }
}
