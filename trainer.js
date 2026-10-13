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
      const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
      if (b.del) { await cmd('HDEL', 'tf:users', String(b.del)); await cmd('DEL', 'tf:progress:' + String(b.del)); return res.status(200).json({ ok: true }); }
      // تعديل بيانات متدرب (الاسم، المجموعة، الجهة، الجوال، البريد، المسمى)
      if (b.edit && b.edit.id) {
        const raw = await cmd('HGET', 'tf:users', String(b.edit.id)); if (!raw) return res.status(404).json({ error: 'not_found' });
        const u = JSON.parse(raw); const e = b.edit;
        if (e.name != null) u.name = clip(e.name, 80);
        if (e.group != null) u.group = clip(e.group, 40) || 'عام';
        if (e.org != null) u.org = clip(e.org, 120);
        if (e.phone != null) u.phone = clip(e.phone, 20);
        if (e.email != null) u.email = clip(e.email, 120);
        if (e.role != null) u.role = clip(e.role, 80);
        await cmd('HSET', 'tf:users', String(b.edit.id), JSON.stringify(u));
        const { pinHash, tok, ...pub } = u; return res.status(200).json({ ok: true, user: pub });
      }
      // إعادة تسمية مجموعة (ينقل كل أعضائها + يحدّث الإعدادات)
      if (b.renameGroup && b.renameGroup.from && b.renameGroup.to) {
        const from = clip(b.renameGroup.from, 40), to = clip(b.renameGroup.to, 40) || 'عام';
        const all = (await cmd('HGETALL', 'tf:users')) || []; let n = 0;
        for (let i = 0; i < all.length; i += 2) { try { const u = JSON.parse(all[i + 1]); if ((u.group || 'عام') === from) { u.group = to; await cmd('HSET', 'tf:users', u.id, JSON.stringify(u)); n++; } } catch (e) {} }
        const cfg = (await getJ('tf:config')) || {}; cfg.groups = (cfg.groups || []).map(g => g === from ? to : g); await setJ('tf:config', cfg);
        return res.status(200).json({ ok: true, moved: n, config: cfg });
      }
      // إرسال إشعار/تنبيه (للجميع أو لمجموعة أو لمتدرب)
      if (b.notify && b.notify.to && (b.notify.title || b.notify.body)) {
        const note = { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), to: clip(b.notify.to, 80), title: clip(b.notify.title, 120), body: clip(b.notify.body, 600) };
        await cmd('LPUSH', 'tf:notifs', JSON.stringify(note)); await cmd('LTRIM', 'tf:notifs', 0, 199);
        return res.status(200).json({ ok: true, note });
      }
      if (b.config && typeof b.config === 'object') { const cfg = Object.assign((await getJ('tf:config')) || {}, b.config, { updated: Date.now() }); await setJ('tf:config', cfg); return res.status(200).json({ ok: true, config: cfg }); }
      return res.status(400).json({ error: 'bad_request' });
    }
    const all = (await cmd('HGETALL', 'tf:users')) || [];
    const users = [];
    for (let i = 0; i < all.length; i += 2) { try { const u = JSON.parse(all[i + 1]); delete u.pinHash; delete u.tok; users.push(u); } catch (e) {} }
    const snaps = users.length ? await cmd('MGET', ...users.map(u => 'tf:progress:' + u.id)) : [];
    users.forEach((u, i) => { try { u.progress = snaps[i] ? JSON.parse(snaps[i]) : null; } catch (e) { u.progress = null; } });
    // آخر ظهور لكل متدرب (للحضور اللحظي)
    try { const seen = (await cmd('HGETALL', 'tf:seen')) || []; const sm = {}; for (let i = 0; i < seen.length; i += 2) sm[seen[i]] = +seen[i + 1] || 0; users.forEach(u => { u.lastSeen = sm[u.id] || 0; }); } catch (e) {}
    let notifs = []; try { const raw = (await cmd('LRANGE', 'tf:notifs', 0, 49)) || []; notifs = raw.map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean); } catch (e) {}
    const config = (await getJ('tf:config')) || {};
    return res.status(200).json({ ok: true, users, config, notifs, count: users.length });
  } catch (e) { return res.status(500).json({ error: 'server_error' }); }
}
