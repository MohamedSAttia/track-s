// Synthetic-only trainer UI regression tests. No browser, network, or real accounts.
// Run: node --test tests/certificates-ui.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../certificates.html', import.meta.url), 'utf8');
const inline = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const bootstrap = "  (async () => { if (!PIN) login(); else if (await load()) start(); else if (PIN) login('تعذّر الاتصال بالخادم. أعد تسجيل الدخول للمحاولة.'); })();";
assert.ok(inline.includes(bootstrap), 'Test harness must replace the current bootstrap exactly.');
const script = inline.replace(bootstrap, `globalThis.ui = { decide, act, bulk, saveCfg, render, load, names, nameRevision, editAtt, edSave, edPrev, edChanged, closeEditor, pv, closePreview, endSession, login,
  get state() { return { U, C, EDIT, ED, PV, AUTH, BUSY, UNCERTAIN, CONFIG_BUSY, CONFIG_UNCERTAIN }; },
  seed(users, certs) { PIN = 'synthetic-only'; U = users; C = Object.fromEntries(certs.map(c => [c.id, c])); F = 'all'; },
  changeCert(c) { C[c.id] = c; }, setConfig(c) { CFG = c; }, setDraft(id, draft) { EDIT[id] = draft; }
};`);
const copy = x => JSON.parse(JSON.stringify(x));
const user = (id = 'fixture-a') => ({ id, name: id === 'fixture-a' ? 'متدرب تجريبي' : 'متدرب آخر', progress: { overall: 55, scores: { examBest: 70 } } });
const cert = (id = 'fixture-a', status = 'pending', revision = 'r1') => ({ id, status, revision, nameEn: 'Synthetic Trainee', nameAr: 'متدرب تجريبي', rows: [{ ar: 'بند', en: 'Item', v: '55%' }], ...(status === 'approved' ? { no: 'TEST-0001', verify: 'SYNTHETIC', config: { program: 'Issued program' }, progress: { overall: 42 } } : {}) });
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => copy(data) });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));

class Element {
  constructor(tag = 'div', attrs = {}, parent = null) {
    this.tag = tag; this.attrs = attrs; this.parent = parent; this.dataset = {};
    for (const [k, v] of Object.entries(attrs)) if (k.startsWith('data-')) this.dataset[k.slice(5)] = v;
    this.value = attrs.value || ''; this.disabled = 'disabled' in attrs; this.hidden = 'hidden' in attrs; this.textContent = ''; this.children = []; this.nodes = [];
    const classes = new Set((attrs.class || '').split(' ')); this.classList = { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) };
  }
  set innerHTML(value) {
    this._html = value; this.nodes = [];
    for (const m of value.matchAll(/<(input|button|span|div|tbody|b)\b([^>]*)>/g)) {
      const attrs = {}; for (const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] || '';
      this.nodes.push(new Element(m[1], attrs, this));
    }
  }
  get innerHTML() { return this._html || ''; }
  replaceChildren(...children) { this.children = children; }
  focus() {} setSelectionRange() {}
  click() { if (!this.disabled) return this.onclick?.(); }
}
function harness({ users = [user()], certs = [cert()], fetch: fetchImpl, preview } = {}) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const fixed = new Map(ids.map(id => [id, new Element('div', { id })]));
  const all = () => [...fixed.values()].flatMap(el => [el, ...el.nodes]);
  const matches = (el, selector) => {
    selector = selector.trim();
    if (selector.includes(' ')) { const [parent, child] = selector.split(/\s+/); return matches(el, child) && el.parent && matches(el.parent, parent); }
    const id = selector.match(/^#([\w-]+)$/); if (id) return el.attrs.id === id[1];
    const cls = selector.match(/^\.([\w-]+)$/); if (cls) return el.classList.contains(cls[1]);
    const tag = selector.match(/^[a-z]+/); if (tag && el.tag !== tag[0]) return false;
    for (const m of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) if (!(m[1] in el.attrs) || (m[2] !== undefined && el.attrs[m[1]] !== m[2])) return false;
    return true;
  };
  const document = { hidden: false, activeElement: null, querySelectorAll: selector => all().filter(el => selector.split(',').some(s => matches(el, s))), querySelector: selector => document.querySelectorAll(selector)[0] || null };
  const requests = [], confirmations = [], previews = [], timers = new Map(); let timerId = 0;
  const context = {
    document, sessionStorage: { getItem: () => '', setItem() {}, removeItem() {} },
    setTimeout: fn => { const id = ++timerId; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id), setInterval: () => 1, clearInterval() {},
    confirm: text => { confirmations.push(text); return context.confirmResult; }, confirmResult: true, prompt: () => '',
    fetch: async (url, options = {}) => { const body = options.body ? JSON.parse(options.body) : null; requests.push({ url, body }); return fetchImpl ? fetchImpl(url, body) : response(body ? { cert: { ...cert(body.id), ...body, revision: 'r2' } } : url.includes('view=certs') ? { certs, config: {} } : { users }); },
    window: { TF_API_BASE: 'https://synthetic.invalid', TFCert: { DEF: {}, defaultRows: () => [['تقدّم', 'Progress', '55%']], preview: async (kind, doc) => { previews.push({ kind, doc: copy(doc) }); return preview ? preview(kind, doc) : { kind, doc: copy(doc) }; }, pdf: async () => {} } }
  };
  vm.runInNewContext(script, context, { filename: 'certificates.html' }); context.ui.seed(copy(users), copy(certs));
  return { ui: context.ui, context, document, requests, confirmations, previews, el: id => document.querySelector('#' + id), async flushTimers() { const pending = [...timers.entries()]; timers.clear(); for (const [, fn] of pending) fn(); await tick(); } };
}

test('approved and revoked records expose reopen; previous version metadata is escaped', () => {
  const h = harness({ users: [user(), user('fixture-b')], certs: [{ ...cert('fixture-a', 'approved'), previousVersions: [{ no: '<old>', status: 'revoked' }] }, cert('fixture-b', 'revoked')] }); h.ui.render();
  assert.equal((h.el('main').innerHTML.match(/data-a="reopen"/g) || []).length, 2);
  assert.ok(h.el('main').innerHTML.includes('&lt;old&gt; (ملغاة)'));
});
test('cancel reopening performs no write; confirmed reopening sends only CAS transition and opens pending editor', async () => {
  const h = harness({ certs: [cert('fixture-a', 'approved')], fetch: (_url, body) => response({ cert: { ...cert(), revision: 'r2', previousVersions: [{ no: 'TEST-0001', status: 'revoked' }] } }) });
  h.context.confirmResult = false; await h.ui.act('reopen', 'fixture-a'); assert.equal(h.requests.length, 0);
  h.context.confirmResult = true; await h.ui.act('reopen', 'fixture-a');
  assert.deepEqual(h.requests[0].body, { action: 'cert_decide', id: 'fixture-a', decision: 'reopen', expectedRevision: 'r1' });
  assert.match(h.confirmations[1], /ستُلغى.*اعتماد مستقل/);
  assert.equal(h.ui.state.ED.revision, 'r2'); assert.equal(h.ui.state.C['fixture-a'].status, 'pending'); assert.equal(h.el('edApprove').disabled, true);
});
test('editing locked records is rejected locally', () => { const h = harness({ certs: [cert('fixture-a', 'approved')] }); h.ui.editAtt(user()); assert.equal(h.ui.state.ED, null); });
test('reissue row approval enters preview editor and bulk excludes reopened records', async () => {
  const h = harness({ certs: [{ ...cert(), previousVersions: [{ no: 'TEST-0001', status: 'revoked' }] }] }); h.ui.render();
  await h.ui.act('approve', 'fixture-a'); assert.ok(h.ui.state.ED); await h.ui.bulk(); assert.equal(h.requests.length, 0);
});
test('editor uses its captured revision, does not retry conflicts, and preserves unsaved work', async () => {
  const h = harness({ fetch: () => response({ error: 'certificate_write_conflict' }, 409) }); h.ui.editAtt(user()); h.ui.changeCert(cert('fixture-a', 'pending', 'r2'));
  h.ui.state.ED.rows[0].v = '61%'; await h.ui.edSave(false); await h.ui.edSave(false);
  assert.equal(h.requests.length, 1); assert.equal(h.requests[0].body.expectedRevision, 'r1'); assert.equal(h.ui.state.ED.rows[0].v, '61%'); assert.equal(h.ui.state.ED.stale, true); assert.equal(h.el('edReload').hidden, false);
});
test('name input retains original draft revision across refresh and hidden rows retain names', async () => {
  const h = harness(); h.ui.render(); const input = h.document.querySelector('input[data-id="fixture-a"][data-f="nameEn"]'); input.value = 'Corrected Trainee'; input.oninput();
  h.ui.changeCert(cert('fixture-a', 'pending', 'r9')); h.ui.render();
  assert.equal(h.ui.nameRevision('fixture-a'), 'r1'); assert.equal(h.ui.names('fixture-a').nameEn, 'Corrected Trainee');
  await h.ui.act('approve', 'fixture-a'); assert.equal(h.requests[0].body.expectedRevision, 'r1'); assert.equal(h.requests[0].body.nameEn, 'Corrected Trainee');
});
test('save captures names and rows; duplicate save dispatches one write', async () => {
  const wait = deferred(); const h = harness({ fetch: () => wait.promise }); h.ui.editAtt(user());
  h.el('edNameEn').value = 'Edited Trainee'; h.el('edNameEn').oninput(); h.ui.state.ED.rows[0].v = '63%';
  const save = h.ui.edSave(false); await h.ui.edSave(false); assert.equal(h.requests.length, 1); assert.equal(h.requests[0].body.nameEn, 'Edited Trainee'); assert.equal(h.requests[0].body.rows[0].v, '63%');
  wait.resolve(response({ cert: cert('fixture-a', 'pending', 'r2') })); await save; assert.equal(h.ui.state.ED, null);
});
test('network error leaves editor recoverable and blocks blind retries', async () => {
  const h = harness({ fetch: async () => { throw Error('synthetic disconnect'); } }); h.ui.editAtt(user()); await h.ui.edSave(false); await h.ui.edSave(false);
  assert.equal(h.requests.length, 1); assert.equal(h.ui.state.ED.saving, false); assert.equal(h.ui.state.ED.stale, true); assert.equal(h.el('edReload').disabled, false);
});
test('reload after conflict requires confirmation and uses latest server revision', async () => {
  const h = harness({ fetch: (_url, body) => body ? response({ error: 'certificate_write_conflict' }, 409) : response(_url.includes('view=certs') ? { certs: [cert('fixture-a', 'pending', 'r8')], config: {} } : { users: [user()] }) });
  h.ui.editAtt(user()); await h.ui.edSave(false); h.context.confirmResult = false; await h.el('edReload').onclick(); assert.equal(h.requests.length, 1);
  h.context.confirmResult = true; await h.el('edReload').onclick(); assert.equal(h.ui.state.ED.revision, 'r8'); assert.equal(h.ui.state.ED.stale, false);
});
test('close while saving then open another editor does not let old response dismiss new editor', async () => {
  const wait = deferred(), h = harness({ users: [user(), user('fixture-b')], certs: [cert(), cert('fixture-b')], fetch: () => wait.promise });
  h.ui.editAtt(user()); const save = h.ui.edSave(false); h.ui.closeEditor(); h.ui.editAtt(user('fixture-b'));
  wait.resolve(response({ cert: cert('fixture-a', 'pending', 'r2') })); await save;
  assert.equal(h.ui.state.ED.u.id, 'fixture-b'); assert.equal(h.el('ed').classList.contains('on'), true);
});
test('out-of-order editor previews cannot replace the newest preview', async () => {
  const waits = []; const h = harness({ preview: () => { const d = deferred(); waits.push(d); return d.promise; } });
  h.ui.editAtt(user()); await h.flushTimers(); const ed = h.ui.state.ED; ed.rows[0].v = '99%'; h.ui.edChanged(); await h.flushTimers();
  waits[1].resolve({ label: 'new' }); await tick(); waits[0].resolve({ label: 'old' }); await tick(); assert.equal(h.el('edPv').children[0].label, 'new');
});
test('closed editor preview cannot populate a new editor', async () => {
  const wait = deferred(), h = harness({ preview: () => wait.promise }); h.ui.editAtt(user()); await h.flushTimers(); h.ui.closeEditor(); wait.resolve({ label: 'old' }); await tick();
  assert.equal(h.ui.state.ED, null); assert.equal(h.el('edPv').children.length, 0);
});
test('approval requires successful latest preview and separate affirmative confirmation', async () => {
  const h = harness(); h.ui.editAtt(user()); await h.ui.edSave(true); assert.equal(h.requests.length, 0);
  await h.flushTimers(); h.context.confirmResult = false; await h.ui.edSave(true); assert.equal(h.requests.length, 0);
  h.context.confirmResult = true; await h.ui.edSave(true); assert.equal(h.requests[0].body.decision, 'approve'); assert.match(h.confirmations.at(-1), /الظاهرة في المعاينة/);
});
test('public preview snapshots approved values and closes safely while rendering', async () => {
  const wait = deferred(); const h = harness({ certs: [cert('fixture-a', 'approved')], preview: () => wait.promise });
  const loading = h.ui.pv(user(), { nameEn: 'Unapproved Name', nameAr: 'آخر' }); assert.equal(h.previews[0].doc.nameEn, 'Synthetic Trainee'); assert.equal(h.previews[0].doc.cfg.program, 'Issued program');
  h.ui.closePreview(); wait.resolve({ label: 'old' }); await loading; assert.equal(h.el('pv').classList.contains('on'), false); assert.equal(h.el('pv1').children.length, 0); assert.equal(h.el('pvC').onclick, null);
});
test('logout clears modals and late writes cannot restore state', async () => {
  const wait = deferred(), h = harness({ fetch: () => wait.promise }); h.ui.editAtt(user()); const save = h.ui.edSave(false); h.ui.endSession();
  wait.resolve(response({ cert: cert('fixture-a', 'approved', 'r2') })); await save;
  assert.equal(Object.keys(h.ui.state.C).length, 0); assert.equal(h.ui.state.ED, null); assert.equal(h.ui.state.PV, null); assert.match(h.el('main').innerHTML, /دخول المدرب/);
});
test('401 on either load request clears auth state and closes editor', async () => {
  const h = harness({ fetch: url => response(url.includes('view=certs') ? { error: 'bad_pin' } : { users: [user()] }, url.includes('view=certs') ? 401 : 200) });
  h.ui.editAtt(user()); assert.equal(await h.ui.load(), false); assert.equal(h.ui.state.ED, null); assert.equal(h.ui.state.U.length, 0); assert.match(h.el('main').innerHTML, /دخول المدرب/);
});
test('load begun before a write cannot overwrite the newer response', async () => {
  const wait = deferred(); const h = harness({ fetch: (_url, body) => body ? response({ cert: cert('fixture-a', 'approved', 'r3') }) : wait.promise });
  const loading = h.ui.load(); await h.ui.decide({ action: 'cert_decide', id: 'fixture-a', decision: 'approve', expectedRevision: 'r1' });
  wait.resolve(response({ users: [user()], certs: [cert('fixture-a', 'pending', 'r1')], config: {} })); assert.equal(await loading, false); assert.equal(h.ui.state.C['fixture-a'].revision, 'r3');
});
test('polling marks open editor stale without adopting newer revision', async () => {
  const h = harness({ fetch: url => response(url.includes('view=certs') ? { certs: [cert('fixture-a', 'pending', 'r5')], config: {} } : { users: [user()] }) }); h.ui.editAtt(user());
  await h.ui.load(); assert.equal(h.ui.state.ED.revision, 'r1'); assert.equal(h.ui.state.ED.stale, true); assert.equal(h.el('edApprove').disabled, true);
});
test('search debounce cannot replace the login screen after logout', async () => {
  const h = harness(); h.ui.render(); h.el('q').value = 'Synthetic'; h.el('q').oninput(); h.ui.endSession(); await h.flushTimers(); assert.match(h.el('main').innerHTML, /دخول المدرب/);
});
test('failed refresh invalidates stale actions and downloads while retaining editor draft', async () => {
  const h = harness({ fetch: () => response({ error: 'server_error' }, 500) }); h.ui.render(); await h.ui.pv(user(), h.ui.names('fixture-a')); h.ui.editAtt(user()); h.ui.state.ED.rows[0].v = '77%';
  assert.equal(await h.ui.load(), false); assert.equal(h.ui.state.PV, null); assert.equal(h.ui.state.ED.rows[0].v, '77%'); assert.equal(h.ui.state.ED.stale, true); assert.equal(h.ui.state.UNCERTAIN.has('fixture-a'), true);
  assert.equal(h.document.querySelector('[data-a="approve"]').disabled, true); assert.equal(h.el('pvC').disabled, true);
  await h.ui.act('approve', 'fixture-a'); assert.equal(h.requests.filter(r => r.body).length, 0);
});
test('reopening moves the table to pending and reissue action is clearly labelled', async () => {
  const h = harness({ certs: [cert('fixture-a', 'approved')], fetch: () => response({ cert: { ...cert(), revision: 'r2', previousVersions: [{ no: 'TEST-0001', status: 'revoked' }] } }) });
  await h.ui.act('reopen', 'fixture-a'); assert.match(h.el('main').innerHTML, /class="chip on" data-f2="pending"/); assert.match(h.el('main').innerHTML, /مراجعة واعتماد نسخة جديدة/);
});
test('server validation errors allow correction without losing the editor', async () => {
  const h = harness({ fetch: () => response({ error: 'bad_name_en' }, 400) }); h.ui.editAtt(user()); await h.ui.edSave(false);
  assert.equal(h.ui.state.ED.stale, false); assert.equal(h.ui.state.ED.saving, false); assert.equal(h.el('edSave').disabled, false);
});
test('stale load response after logout cannot restore users or table', async () => {
  const wait = deferred(), h = harness({ fetch: () => wait.promise }); h.ui.render(); const loading = h.ui.load(); h.ui.endSession();
  wait.resolve(response({ users: [user()], certs: [cert()], config: {} })); assert.equal(await loading, false); assert.equal(h.ui.state.U.length, 0); assert.match(h.el('main').innerHTML, /دخول المدرب/);
});
const validConfig = { hours: '30', prefix: 'TEST-2026', program: 'Synthetic program', programAr: 'برنامج تجريبي', kind: 'Course', kindAr: 'دورة', dates: 'Synthetic dates', datesAr: 'تاريخ تجريبي' };
test('config save blocks certificate decisions, opening and approval until its outcome is known', async () => {
  const wait = deferred(), h = harness({ fetch: () => wait.promise }); h.ui.setConfig(validConfig); h.ui.render(); h.ui.editAtt(user()); await h.flushTimers();
  const saving = h.ui.saveCfg(); assert.equal(h.ui.state.CONFIG_BUSY, true); assert.equal(h.el('edApprove').disabled, true);
  await h.ui.edSave(true); const blocked = await h.ui.decide({ id: 'fixture-a', decision: 'approve', expectedRevision: 'r1' });
  assert.equal(blocked.j.error, 'config_busy'); assert.equal(h.requests.length, 1); assert.equal(h.requests[0].body.action, undefined);
  h.ui.closeEditor(); h.ui.editAtt(user()); assert.equal(h.ui.state.ED, null);
  wait.resolve(response({ config: { cert: validConfig } })); await saving; assert.equal(h.ui.state.CONFIG_BUSY, false);
});
test('uncertain config commit blocks issuance until a successful validated reload', async () => {
  let fail = true; const h = harness({ fetch: (url, body) => { if (body) throw Error('synthetic config disconnect'); return fail ? response({}) : response(url.includes('view=certs') ? { certs: [cert()], config: validConfig } : { users: [user()] }); } });
  h.ui.setConfig(validConfig); h.ui.render(); await h.ui.saveCfg(); assert.equal(h.ui.state.CONFIG_UNCERTAIN, true);
  const blocked = await h.ui.decide({ id: 'fixture-a', decision: 'approve', expectedRevision: 'r1' }); assert.equal(blocked.j.error, 'config_uncertain');
  assert.equal(await h.ui.load(), false); assert.equal(h.ui.state.CONFIG_UNCERTAIN, true);
  fail = false; assert.equal(await h.ui.load(), true); assert.equal(h.ui.state.CONFIG_UNCERTAIN, false); assert.equal(h.ui.state.UNCERTAIN.size, 0);
});
test('malformed HTTP 200 refresh preserves existing records but disables actions', async () => {
  const h = harness({ fetch: () => response({}) }); h.ui.render(); assert.equal(await h.ui.load(), false);
  assert.equal(h.ui.state.U.length, 1); assert.equal(h.ui.state.C['fixture-a'].revision, 'r1'); assert.equal(h.ui.state.UNCERTAIN.has('fixture-a'), true); assert.equal(h.document.querySelector('[data-a="approve"]').disabled, true);
});
test('server-side write failures are uncertain and cannot be blindly retried', async () => {
  const h = harness({ fetch: () => response({ error: 'server_error' }, 500) }); h.ui.editAtt(user()); await h.ui.edSave(false); await h.ui.edSave(false);
  assert.equal(h.requests.length, 1); assert.equal(h.ui.state.ED.stale, true); assert.equal(h.ui.state.ED.saving, false);
});
test('null, primitive, and array JSON HTTP200 reads fail safely without throwing', async () => {
  for (const payload of [null, 'unexpected', 17, true, []]) {
    const h = harness({ fetch: () => response(payload) }); h.ui.render();
    assert.equal(await h.ui.load(), false); assert.equal(h.ui.state.U.length, 1); assert.equal(h.ui.state.UNCERTAIN.has('fixture-a'), true);
  }
});
test('null JSON HTTP200 writes preserve the draft and require verified reload', async () => {
  const h = harness({ fetch: () => response(null) }); h.ui.editAtt(user()); await h.ui.edSave(false);
  assert.equal(h.ui.state.ED.stale, true); assert.equal(h.ui.state.ED.saving, false); assert.equal(h.ui.state.C['fixture-a'].revision, 'r1');
});
