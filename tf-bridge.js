/* Track Ford GRC — جسر التكامل بين الأكاديمية والنظام والمقيّم
   الصفحات الثلاث على نفس النطاق، فتتشارك localStorage. هذا الملف يوحّد «ملف المنظمة» ومستويات النضج
   بين التطبيقات: ما يُدخل في المقيّم أو النظام أو نشاط الأكاديمية يصبح متاحًا للبقية بضغطة واحدة. */
(function () {
  'use strict';
  const rd = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '') || 'index';
  const APPS = { academy: ['أكاديمية GRCP', 'academy.html'], system: ['نظام تطبيق GRC', 'system.html'], navigator: ['المقيّم الذكي', 'navigator.html'] };

  function sources() {
    const out = [];
    const n = rd('tf-grc-navigator-v1');
    if (n && n.p && n.p.name && !n.example) out.push({ src: 'navigator', name: n.p.name, sector: n.p.sector || '', emp: n.p.emp || '', rev: n.p.rev || '', country: n.p.countries || '', target: n.p.target || '4', els: n.a || {}, ts: n.ts || 1 });
    const s = rd('alsaeedGRC_v1');
    if (s && s.org && s.org.name) out.push({ src: 'system', name: s.org.name, sector: s.org.sector || '', emp: s.org.emp || '', rev: s.org.rev || '', country: s.org.country || '', mat: (s.baseline && s.baseline.mat && s.baseline.mat[0]) || 0, ts: s.ts || 1 });
    const a = rd('grcpD1v1');
    if (a && a.org && a.org.name) out.push({ src: 'academy', name: a.org.name, sector: a.org.sector || '', emp: a.org.emp || '', rev: a.org.rev || '', country: a.org.country || '', ts: a.ts || 1 });
    return out;
  }
  function profile() {
    const u = rd('tf_org_v1'); const srcs = sources();
    if (u && u.name) return u;
    if (!srcs.length) return null;
    return srcs.sort((x, y) => (y.ts || 0) - (x.ts || 0))[0];
  }
  /* مستويات النضج الموحّدة للعناصر العشرين: المقيّم أولًا ثم تقييم الأكاديمية الذاتي */
  function maturity() {
    const els = {}; const m = rd('grcpMaturity') || {}; Object.keys(m).forEach(k => { if (m[k]) els[k] = +m[k]; });
    const n = rd('tf-grc-navigator-v1'); if (n && n.a && !n.example) Object.keys(n.a).forEach(k => { if (n.a[k]) els[k] = +n.a[k]; });
    const v = Object.values(els); const overall = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    const s = rd('alsaeedGRC_v1'); const sysMat = (s && s.baseline && s.baseline.mat && s.baseline.mat[0]) || 0;
    return { els, rated: v.length, overall, sysMat };
  }
  function setProfile(p, src) { const u = Object.assign({}, p, { src: src || page, ts: Date.now() }); wr('tf_org_v1', u); return u; }
  /* تطبيق الملف الموحّد على التطبيق الحالي (دمج دون مسح ما أدخله المستخدم من تفاصيل أخرى) */
  function applyTo(app, p) {
    p = p || profile(); if (!p) return false;
    if (app === 'navigator') {
      const cur = rd('tf-grc-navigator-v1') || {};
      const base = { example: false, p: { name: '', sector: 'الخدمات المالية والمصرفية', emp: '', rev: '', countries: '', reg: '', chal: '', target: '4' }, a: {}, l: {}, rate: 5, mult: '1, 0.8, 0.6, 0.4, 0.25' };
      const st = Object.assign(base, cur.example ? {} : cur); st.example = false;
      st.p = Object.assign(base.p, (cur.example ? {} : cur.p) || {}, { name: p.name, emp: p.emp || '', rev: p.rev || '', countries: p.country || '', target: p.target || st.p.target || '4' });
      if (p.sector) st.p.sector = p.sector;
      const m = rd('grcpMaturity') || {}; st.a = Object.assign({}, m, st.a || {});
      st.ts = Date.now(); return wr('tf-grc-navigator-v1', st);
    }
    if (app === 'system') {
      const cur = rd('alsaeedGRC_v1') || {}; cur.org = Object.assign({ name: '', desc: '', sectorKey: '', sector: '', group: '', activity: '', city: '', country: 'السعودية', emp: '', scope: 'منشأة', rev: '' }, cur.org || {}, { name: p.name, emp: p.emp || '', rev: p.rev || '' });
      if (p.sector && !cur.org.sector) cur.org.sector = p.sector; if (p.country) cur.org.country = p.country;
      cur.ts = Date.now(); const ok = wr('alsaeedGRC_v1', cur);
      const id = localStorage.getItem('alsaeedGRC_ws_current'); if (id) { const b = rd('alsaeedGRC_ws_' + id) || {}; b.state = cur; wr('alsaeedGRC_ws_' + id, b); }
      return ok;
    }
    if (app === 'academy') {
      const cur = rd('grcpD1v1') || {}; cur.org = Object.assign({ name: '', sector: '', country: '', emp: '', rev: '', note: '' }, cur.org || {}, { name: p.name, emp: p.emp || '', rev: p.rev || '', country: p.country || '' });
      if (p.sector && !cur.org.sector) cur.org.sector = p.sector; cur.ts = Date.now(); return wr('grcpD1v1', cur);
    }
    return false;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function render() {
    if (!APPS[page] && page !== 'index') return;
    const p = profile(), m = maturity(); let bar = document.getElementById('tfBridge');
    if (!bar) { bar = document.createElement('div'); bar.id = 'tfBridge'; const anchor = document.querySelector('.tfbar'); (anchor ? anchor.insertAdjacentElement('afterend', bar) : document.body.prepend(bar)); }
    const ownName = (() => { const s = sources().find(x => x.src === page); return s ? s.name : ''; })();
    const links = Object.keys(APPS).filter(k => k !== page).map(k => `<a href="${APPS[k][1]}">${APPS[k][0]}</a>`).join('');
    const sim = page !== 'navigator' ? `<a href="navigator.html#sim" class="tfb-sim">🎬 فيديو المحاكاة</a>` : '';
    bar.innerHTML = `<div class="tfb-in"><span class="tfb-k">🔗 التكامل</span>${p ? `<span class="tfb-org">ملف المنظمة الموحّد: <b>${esc(p.name)}</b>${p.sector ? ` · ${esc(p.sector)}` : ''} <small>(من ${esc((APPS[p.src] || ['هذه الصفحة'])[0])})</small></span><span class="tfb-m">${m.rated ? `النضج: ${m.overall.toFixed(1)}/5 عبر ${m.rated} عنصرًا` : (m.sysMat ? `نضج النظام: ${m.sysMat}/5` : 'لم يُقيَّم النضج بعد')}</span>${APPS[page] && ownName !== p.name ? `<button type="button" class="tfb-btn" data-apply="${page}">استخدم هذا الملف هنا</button>` : ''}` : `<span class="tfb-org">لم يُنشأ ملف منظمة بعد — أدخل بيانات مؤسستك في أي تطبيق وستظهر هنا للجميع.</span>`}<span class="tfb-links">${links}${sim}</span>${window.TFC ? `<div class="tfb-user">${window.TFC.chip()}</div>` : ''}</div>`;
    bar.querySelector('[data-apply]')?.addEventListener('click', e => { if (applyTo(e.target.dataset.apply, p)) { setProfile(p, p.src); location.reload(); } });
  }
  const css = document.createElement('style'); css.textContent = `#tfBridge{position:relative;z-index:150;background:#F6EEDC;border-bottom:1px solid #E7DCC6;font-family:Rubik,Tahoma,system-ui,sans-serif;font-size:13px;color:#1B2436;direction:rtl}#tfBridge .tfb-in{max-width:1360px;margin:0 auto;padding:6px 16px;display:flex;gap:10px 16px;align-items:center;flex-wrap:wrap}#tfBridge .tfb-k{font-weight:800;color:#0A1B3D}#tfBridge small{color:#5B6476}#tfBridge .tfb-m{background:#fff;border:1px solid #E7DCC6;border-radius:999px;padding:2px 10px}#tfBridge .tfb-btn{border:1px solid #C9973B;background:#0A1B3D;color:#fff;border-radius:999px;padding:3px 12px;font:inherit;cursor:pointer}#tfBridge .tfb-links{margin-inline-start:auto;display:flex;gap:10px;flex-wrap:wrap}#tfBridge .tfb-links a{color:#0A1B3D;text-decoration:none;border-bottom:1px dashed #C9973B}#tfBridge .tfb-sim{font-weight:700}#tfBridge .tfb-user{flex-basis:100%;display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px dashed #E7DCC6;padding-top:5px}@media print{#tfBridge{display:none}}`;
  document.head.appendChild(css);
  /* تحديث الملف الموحّد تلقائيًا عند تغيّر مصدر أحدث */
  function autoSync() { const srcs = sources(); if (!srcs.length) return; const latest = srcs.sort((x, y) => (y.ts || 0) - (x.ts || 0))[0]; const u = rd('tf_org_v1'); if (!u || (latest.ts || 0) > (u.ts || 0) || (u.src === latest.src && u.name !== latest.name)) setProfile(latest, latest.src); }
  window.TFB = { sources, profile, maturity, setProfile, applyTo, render };
  const boot = () => { autoSync(); render(); if (page === 'navigator' && location.hash === '#sim') setTimeout(() => { try { window.go && window.go(6); } catch (e) {} }, 400); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('storage', () => { autoSync(); render(); });
  let _t = null; document.addEventListener('input', () => { clearTimeout(_t); _t = setTimeout(() => { autoSync(); render(); }, 900); }, true);
  document.addEventListener('click', () => { clearTimeout(_t); _t = setTimeout(() => { autoSync(); render(); }, 900); }, true);
  setInterval(() => { autoSync(); render(); }, 15000);
})();
