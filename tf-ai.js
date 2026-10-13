/* Track Ford GRC — shared AI client
   كل الصفحات تتحدث مع الذكاء الاصطناعي عبر /api/ai (الخادم يحمل المفتاح). إن لم يُضبط المفتاح على الخادم،
   تعمل المحركات الداخلية في كل صفحة كما هي. لا يُطلب من المستخدم أي مفتاح ولا يُرسل أي مفتاح من المتصفح. */
(function () {
  'use strict';
  const state = { ready: null, ok: false, model: '' };
  async function probe() {
    if (state.ready) return state.ready;
    state.ready = fetch((window.TF_API_BASE||'')+'/api/ai', { method: 'GET', cache: 'no-store' })
      .then(r => r.json().then(j => { state.ok = !!(r.ok && j && j.ok); state.model = (j && j.model) || ''; window.TF_API = state.ok; return state.ok; }))
      .catch(() => { state.ok = false; window.TF_API = false; return false; });
    return state.ready;
  }
  /* chat(messages[, {system,max_tokens,signal}]) → نص. messages: [{role:'user'|'assistant', content}] */
  async function chat(messages, opts) {
    opts = opts || {};
    const ok = await probe();
    if (!ok) { const e = new Error('ai_unavailable'); e.code = 'ai_unavailable'; throw e; }
    const r = await fetch((window.TF_API_BASE||'')+'/api/ai', {
      method: 'POST', headers: { 'content-type': 'text/plain' }, signal: opts.signal,
      body: JSON.stringify({ messages: messages, system: opts.system || '', max_tokens: opts.max_tokens || 2000 })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || ('HTTP ' + r.status)); e.code = r.status === 429 ? 'rate_limited' : 'upstream'; throw e; }
    return j.text || '';
  }
  const ask = (prompt, system, opts) => chat([{ role: 'user', content: prompt }], Object.assign({ system: system }, opts || {}));
  /* json(prompt): يطلب JSON ويستخرجه بأمان */
  async function json(prompt, system, opts) {
    const t = await ask(prompt + '\n\nأعد JSON صالحاً فقط دون أي نص قبله أو بعده.', system, opts);
    const m = t.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(m ? m[0] : t);
  }
  const md = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm, '<b>$1</b>')
    .replace(/^[-•*]\s?(.+)$/gm, '• $1').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  window.TFAI = { probe, chat, ask, json, md, get ok() { return state.ok; } };
  probe();
})();
