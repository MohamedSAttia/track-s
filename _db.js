// طبقة تخزين مشتركة: Vercel KV / Upstash Redis عبر REST (بدون أي حزم خارجية).
// تُضبط تلقائيًا عند ربط قاعدة "Upstash for Redis" من لوحة Vercel → Storage (تُنشئ المتغيرات KV_REST_API_URL وKV_REST_API_TOKEN).
import crypto from 'node:crypto';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const SECRET = process.env.LINK_SECRET || 'trackford-grc-default-secret';
export const TRAINER_PIN = process.env.TRAINER_PIN || '2026';
export const enabled = () => !!(URL_ && TOKEN);

export async function cmd(...args) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'content-type': 'application/json' }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
export const getJ = async k => { const v = await cmd('GET', k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } };
export const setJ = (k, v) => cmd('SET', k, JSON.stringify(v));
export const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
export const token = (id, pin) => sha(id + ':' + pin + ':' + SECRET).slice(0, 40);
export function body(req) { try { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (e) { return {}; } }
export const normPhone = p => String(p || '').replace(/\D/g, '').replace(/^00/, '').replace(/^966/, '0').replace(/^5/, '05');
export function cors(res) { res.setHeader('Cache-Control', 'no-store'); }
