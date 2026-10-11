// تسجيل المتدربين ودخولهم. POST {action:'register'|'login', name, phone, email, group, org, pin}
import { enabled, getJ, setJ, cmd, sha, token, body, normPhone, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'GET') { let n = 0; if (enabled()) { try { n = (await cmd('HLEN', 'tf:users')) || 0; } catch (e) {} } return res.status(200).json({ ok: enabled(), registered: n }); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!enabled()) return res.status(503).json({ error: 'storage_not_configured', local: true });
  const b = body(req);
  try {
    const phone = normPhone(b.phone), pin = String(b.pin || '').trim();
    if (!/^0\d{8,9}$/.test(phone)) return res.status(400).json({ error: 'bad_phone' });
    if (!/^\d{4,6}$/.test(pin)) return res.status(400).json({ error: 'bad_pin' });
    const id = sha(phone).slice(0, 16);
    const raw = await cmd('HGET', 'tf:users', id);
    const cur = raw ? JSON.parse(raw) : null;
    if (b.action === 'login') {
      if (!cur) return res.status(404).json({ error: 'not_found' });
      if (cur.pinHash !== sha(pin + ':' + id)) return res.status(401).json({ error: 'bad_pin' });
      cur.lastLogin = Date.now(); cur.tok = token(id, pin); await cmd('HSET', 'tf:users', id, JSON.stringify(cur));
      const { pinHash, tok, ...pub } = cur;
      return res.status(200).json({ ok: true, user: pub, token: token(id, pin) });
    }
    // register (or update own profile with the same pin)
    const name = String(b.name || '').trim().slice(0, 80);
    if (name.length < 3) return res.status(400).json({ error: 'bad_name' });
    if (cur && cur.pinHash !== sha(pin + ':' + id)) return res.status(409).json({ error: 'exists' });
    const u = Object.assign(cur || { id, created: Date.now() }, {
      name, phone, email: String(b.email || '').trim().slice(0, 120), group: String(b.group || '').trim().slice(0, 40) || 'عام',
      org: String(b.org || '').trim().slice(0, 120), role: String(b.role || '').trim().slice(0, 80), pinHash: sha(pin + ':' + id), tok: token(id, pin), lastLogin: Date.now() });
    await cmd('HSET', 'tf:users', id, JSON.stringify(u));
    const { pinHash, tok, ...pub } = u;
    return res.status(200).json({ ok: true, user: pub, token: token(id, pin), created: !cur });
  } catch (e) { return res.status(500).json({ error: 'server_error' }); }
}
