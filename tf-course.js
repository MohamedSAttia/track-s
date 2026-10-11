/* Track Ford GRC — مسار الدورة الموحّد + تسجيل المتدربين + مزامنة التقدّم
   - الدورة 5 أيام (7–10 مساءً). يظهر للمتدرب يوم الدورة الحالي فقط (والأيام السابقة للمراجعة)، والأيام القادمة مقفلة.
   - التسجيل حقيقي عبر /api/reg (Vercel KV). بدون قاعدة بيانات يعمل محليًا ويعرض ذلك بوضوح.
   - التقدّم يُجمع تلقائيًا من كل الوحدات (محاضرات، أنشطة، ألعاب، أسئلة، ساحة الذكاء، النظام، المقيّم) ويُزامَن مع لوحة المدرب. */
(function () {
  'use strict';
  const LS_U = 'tf_user', LS_C = 'tf_course', LS_CFG = 'tf_course_cfg';
  const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '') || 'index';
  const A = 'academy.html', S = 'system.html', N = 'navigator.html';
  const EN = () => { try { if (window.I18N) return window.I18N.lang === 'en'; if (window.I18 && window.I18.lang) return window.I18.lang === 'en'; return (localStorage.getItem('grcpLang') || '').replace(/"/g, '') === 'en'; } catch (e) { return false; } };
  const L = (ar, en) => EN() ? en : ar;

  /* ───── تعريف الدورة ───── */
  const DEFAULT_START = '2026-10-11';
  const DAYS = [
    { n: 1, ar: 'المقدمة والمفاهيم الأساسية', en: 'Introduction & Key Concepts', lectures: [1, 2], col: '#EA580C', items: [
      { k: 'lec1', te: 'Lecture 1 — Introduction to GRC & Principled Performance', t: 'المحاضرة 1 — مقدمة في GRC والأداء المنضبط', href: A + '#/lecture/1', chk: () => lecRead(1) },
      { k: 'ws1', te: 'Applied workshop: initial diagnosis of your organisation', t: 'النشاط التطبيقي: التشخيص الأولي لمنظمتك', href: A + '#/lecture/1/act', chk: () => { const d = rd('grcpD1v1'); return !!(d && d.org && d.org.name && Object.keys(d.cause || {}).length >= 2); } },
      { k: 'game1', te: "Protector's Decisions game (Lecture 1)", t: 'لعبة قرارات الحامي (المحاضرة 1)', href: A + '#/lecture/1', chk: () => gameDone(1) },
      { k: 'lec2', te: 'Lecture 2 — Governance, Management & Assurance', t: 'المحاضرة 2 — الحوكمة والإدارة والضمان', href: A + '#/lecture/2', chk: () => lecRead(2) },
      { k: 'q1', te: 'Lectures 1–2 practice questions (≥60%)', t: 'أسئلة المحاضرتين 1 و2 (60% على الأقل)', href: A + '#/lecture/2/quiz', chk: () => quizPct([1, 2]) >= 60 },
      { k: 'ar1', te: 'AI Arena: element classification race', t: 'ساحة الذكاء: سباق تصنيف العناصر', href: A + '#/arena/classify', chk: () => arenaBest('classify') > 0 },
      { k: 'nav1', te: 'AI Navigator: organisation profile + 20-element assessment', t: 'المقيّم الذكي: ملف مؤسستك + استبيان العناصر العشرين', href: N, chk: () => { const n = rd('tf-grc-navigator-v1'); return !!(n && !n.example && n.p && n.p.name && Object.keys(n.a || {}).length >= 20); } }] },
    { n: 2, ar: 'مكوّن الدراسة + مكوّن المواءمة', en: 'LEARN + ALIGN', lectures: [3, 4, 5], col: '#0D9488', items: [
      { k: 'lec3', te: 'Lecture 3 — LEARN component', t: 'المحاضرة 3 — مكوّن الدراسة LEARN', href: A + '#/lecture/3', chk: () => lecRead(3) },
      { k: 'lec4', te: 'Lecture 4 — ALIGN (1)', t: 'المحاضرة 4 — المواءمة (1)', href: A + '#/lecture/4', chk: () => lecRead(4) },
      { k: 'lec5', te: 'Lecture 5 — ALIGN (2)', t: 'المحاضرة 5 — المواءمة (2)', href: A + '#/lecture/5', chk: () => lecRead(5) },
      { k: 'ws2', te: 'Applied workshops for lectures 3–5 (at least two)', t: 'الأنشطة التطبيقية للمحاضرات 3–5 (نشاطان على الأقل)', href: A + '#/lecture/3/act', chk: () => [3, 4, 5].filter(wsDone).length >= 2 },
      { k: 'game2', te: "Protector's Decisions game (lecture 3 or 4)", t: 'لعبة قرارات الحامي (محاضرة 3 أو 4)', href: A + '#/lecture/3', chk: () => gameDone(3) || gameDone(4) || gameDone(5) },
      { k: 'q2', te: 'Lectures 3–5 practice questions (≥60%)', t: 'أسئلة المحاضرات 3–5 (60% على الأقل)', href: A + '#/lecture/4/quiz', chk: () => quizPct([3, 4, 5]) >= 60 },
      { k: 'ar2', te: 'AI Arena: incident simulator', t: 'ساحة الذكاء: محاكي الحوادث', href: A + '#/arena/incident', chk: () => arenaBest('incident') > 0 },
      { k: 'sys2', te: 'GRC System: profile + baseline + two LEARN/ALIGN tools', t: 'نظام التطبيق: ملف المنظمة + التقييم المبدئي + أداتان من الدراسة/المواءمة', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && s.org && s.org.name && s.baseline && s.baseline.tp && Object.keys(s.tools || {}).length >= 2); } }] },
    { n: 3, ar: 'مكوّن التنفيذ', en: 'PERFORM', lectures: [6, 7], col: '#1E40AF', items: [
      { k: 'lec6', te: 'Lecture 6 — PERFORM (1): controls, policies, communication, education', t: 'المحاضرة 6 — التنفيذ (1): الضوابط والسياسات والتواصل والتعليم', href: A + '#/lecture/6', chk: () => lecRead(6) },
      { k: 'lec7', te: 'Lecture 7 — PERFORM (2): incentives, notification, inquiry, response', t: 'المحاضرة 7 — التنفيذ (2): الحوافز والإخطار والاستقصاء والاستجابة', href: A + '#/lecture/7', chk: () => lecRead(7) },
      { k: 'ws3', te: 'Applied workshops for lectures 6 and 7', t: 'النشاطان التطبيقيان للمحاضرتين 6 و7', href: A + '#/lecture/6/act', chk: () => wsDone(6) && wsDone(7) },
      { k: 'game3', te: "Protector's Decisions game (lecture 6 or 7)", t: 'لعبة قرارات الحامي (محاضرة 6 أو 7)', href: A + '#/lecture/6', chk: () => gameDone(6) || gameDone(7) },
      { k: 'q3', te: 'Lectures 6–7 practice questions (≥60%)', t: 'أسئلة المحاضرتين 6 و7 (60% على الأقل)', href: A + '#/lecture/6/quiz', chk: () => quizPct([6, 7]) >= 60 },
      { k: 'ar3', te: 'AI Arena: oral examiner + who is accountable?', t: 'ساحة الذكاء: الممتحن الشفهي + من المسؤول؟', href: A + '#/arena/viva', chk: () => arenaBest('viva') > 0 || arenaBest('lines') > 0 },
      { k: 'sys3', te: 'GRC System: 5 tools completed (incl. PERFORM)', t: 'نظام التطبيق: 5 أدوات مكتملة (منها أدوات التنفيذ)', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && Object.keys(s.tools || {}).length >= 5); } }] },
    { n: 4, ar: 'مكوّن المراجعة + تطبيق شامل', en: 'REVIEW + integrated application', lectures: [8, 9], col: '#059669', items: [
      { k: 'lec8', te: 'Lecture 8 — REVIEW component', t: 'المحاضرة 8 — مكوّن المراجعة REVIEW', href: A + '#/lecture/8', chk: () => lecRead(8) },
      { k: 'lec9', te: 'Lecture 9 — Integration: protectors, disciplines & value', t: 'المحاضرة 9 — التكامل: الحُماة والتخصصات والقيمة', href: A + '#/lecture/9', chk: () => lecRead(9) },
      { k: 'ws4', te: 'Applied workshops for lectures 8 and 9', t: 'النشاطان التطبيقيان للمحاضرتين 8 و9', href: A + '#/lecture/8/act', chk: () => wsDone(8) && wsDone(9) },
      { k: 'q4', te: 'Lectures 8–9 practice questions (≥60%)', t: 'أسئلة المحاضرتين 8 و9 (60% على الأقل)', href: A + '#/lecture/8/quiz', chk: () => quizPct([8, 9]) >= 60 },
      { k: 'ar4', te: 'AI Arena: case analyst + order the steps', t: 'ساحة الذكاء: محلّل الحالة الواقعية + رتّب الخطوات', href: A + '#/arena/case', chk: () => arenaBest('case') > 0 || arenaBest('order') > 0 },
      { k: 'sim4', te: 'Navigator: live interview / assessment simulation video', t: 'المقيّم: المقابلة الحية / فيديو محاكاة التقييم', href: N + '#sim', chk: () => !!(st().done || {}).sim },
      { k: 'sys4', te: 'GRC System: post-assessment + full report', t: 'نظام التطبيق: التقييم البعدي + التقرير الشامل', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && ((s.after && s.after.tp) || Object.keys(s.tools || {}).length >= 8)); } }] },
    { n: 5, ar: 'مراجعة نهائية + مشاريع المجموعات + الاختبار', en: 'Final review · group projects · exam', lectures: [10], col: '#B01B2E', items: [
      { k: 'lec10', te: 'Lecture 10 — Comprehensive review & exam strategy', t: 'المحاضرة 10 — المراجعة الشاملة واستراتيجية الاختبار', href: A + '#/lecture/10', chk: () => lecRead(10) },
      { k: 'ex1', te: 'First full mock exam (100 questions)', t: 'الاختبار التجريبي الكامل الأول (100 سؤال)', href: A + '#/exam', chk: () => examAttempts() >= 1 },
      { k: 'ex2', te: 'Second mock exam with 75% or more', t: 'اختبار تجريبي ثانٍ بنتيجة 75% فأعلى', href: A + '#/exam', chk: () => examBest() >= 75 },
      { k: 'systest', te: 'System comprehensive test (100 questions)', t: 'اختبار النظام الشامل (100 سؤال)', href: S, chk: () => { const h = rd('alsaeedExam_v1'); return !!(h && Object.keys(h).some(k => k.startsWith('full') && (h[k] || []).length)); } },
      { k: 'ar5', te: 'AI Arena: team challenge', t: 'ساحة الذكاء: تحدي المجموعات', href: A + '#/arena/team', chk: () => arenaBest('team') > 0 },
      { k: 'proj', te: 'Group project discussion (mark manually after presenting)', t: 'مناقشة مشروع المجموعة (يُعلَّم يدويًا بعد العرض)', href: A + '#/course', manual: true, chk: () => !!(st().done || {}).proj },
      { k: 'real', te: 'Book the real GRCP exam (mark manually)', t: 'حجز موعد الاختبار الحقيقي GRCP (يُعلَّم يدويًا)', href: 'https://www.oceg.org/grcp-certification/', manual: true, chk: () => !!(st().done || {}).real }] }];

  /* ───── كواشف التقدّم من مخازن الوحدات ───── */
  const st = () => rd(LS_C, { done: {}, seen: {} });
  const lecRead = n => !!(st().seen || {})['lec' + n];
  const quizPct = lecs => { let t = 0, want = 0; lecs.forEach(n => { const s = rd('grcpLQ' + n, {}); t += Object.values(s).filter(a => a && a.p != null).length; want += ((window.GRCP_LEC_Q || {})[n] || []).length || 25; }); return Math.round(Math.min(100, t / want * 100)); };
  const wsDone = n => { const d = rd('grcpERP', {}); const L = d['L' + n]; return !!(L && Object.values(L).some(v => Array.isArray(v) ? v.some(r => Object.values(r || {}).some(x => String(x || '').trim())) : (v && typeof v === 'object' && Object.values(v).some(x => String(x || '').trim())))); };
  const gameDone = n => { const g = rd('grcpGame', {}); return !!(g && g[n] != null); };
  const arenaBest = k => +(((rd('grcpArena', {}) || {}).best || {})[k] || 0);
  const examAttempts = () => (rd('grcpHist', []) || []).filter(h => h.n >= 90).length;
  const examBest = () => Math.max(0, ...(rd('grcpHist', []) || []).filter(h => h.n >= 90).map(h => +h.pct || 0));

  /* ───── الزمن واليوم الحالي ───── */
  function cfg() { return Object.assign({ start: DEFAULT_START, groups: ['المجموعة 1', 'المجموعة 2', 'المجموعة 3', 'المجموعة 4'] }, rd(LS_CFG, {})); }
  function dayIndex(d) { const s = new Date(cfg().start + 'T00:00:00'); const now = d || new Date(); const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - s) / 86400000); return diff + 1; }
  function today() { const i = dayIndex(); return i < 1 ? 0 : i > 5 ? 6 : i; }
  const unlocked = n => !!(rd('tf_unlock') || (user() && user().trainer)) || n <= Math.max(1, today());
  function dayOfLecture(n) { const d = DAYS.find(d => d.lectures.includes(n)); return d ? d.n : 5; }

  /* ───── المستخدم ───── */
  const user = () => rd(LS_U, null);
  function setUser(u) { wr(LS_U, u); try { if (u) localStorage.setItem('grcpUser', JSON.stringify({ name: u.name, email: u.email || '', phone: u.phone || '', org: u.org || '', since: u.created || Date.now(), id: u.id })); } catch (e) {} }
  async function api(path, opt) { const r = await fetch(path, Object.assign({ headers: { 'content-type': 'application/json' } }, opt)); const j = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, j }; }
  let serverOk = null;
  async function probe() { if (serverOk !== null) return serverOk; try { const r = await api('/api/reg'); serverOk = !!(r.ok && r.j.ok); } catch (e) { serverOk = false; } return serverOk; }

  /* ───── التقدّم ───── */
  function dayProgress(d) { const items = d.items; const done = items.filter(i => { try { return !!i.chk(); } catch (e) { return false; } }).length; return { done, total: items.length, pct: Math.round(done / items.length * 100) }; }
  function snapshot() {
    const days = {}; DAYS.forEach(d => { days[d.n] = dayProgress(d).pct; });
    const items = {}; DAYS.forEach(d => d.items.forEach(i => { try { items[i.k] = !!i.chk(); } catch (e) { items[i.k] = false; } }));
    const t = today(); const activeDays = DAYS.filter(d => d.n <= Math.max(1, Math.min(5, t || 1)));
    const overall = Math.round(activeDays.reduce((a, d) => a + days[d.n], 0) / activeDays.length);
    const nav = rd('tf-grc-navigator-v1'); const m = nav && !nav.example ? Object.values(nav.a || {}).filter(Boolean) : [];
    const scores = { examBest: examBest(), examAttempts: examAttempts(), arena: (rd('grcpArena', {}) || {}).best || {}, team: (rd('grcpArena', {}) || {}).team || {}, maturity: m.length ? +(m.reduce((a, b) => a + b, 0) / m.length).toFixed(2) : 0, quiz: Math.round([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((a, n) => a + quizPct([n]), 0) / 10) };
    const org = (rd('tf_org_v1') || {}).name || (nav && nav.p && nav.p.name) || '';
    return { days, overall, items, scores, org, at: Date.now(), today: t };
  }
  let lastSync = 0, syncing = false;
  async function sync(force) {
    const u = user(); if (!u || !u.token || u.local) return false;
    if (!force && Date.now() - lastSync < 90000) return false;
    if (syncing) return false; syncing = true;
    try { const r = await api('/api/progress', { method: 'POST', body: JSON.stringify({ id: u.id, token: u.token, snapshot: snapshot() }) }); if (r.ok) { lastSync = Date.now(); u.lastSync = lastSync; wr(LS_U, u); } return r.ok; } catch (e) { return false; } finally { syncing = false; }
  }
  function mark(k, v) { const s = st(); s.done = s.done || {}; if (v === false) delete s.done[k]; else s.done[k] = Date.now(); wr(LS_C, s); render(); sync(true); }
  function seen(k) { const s = st(); s.seen = s.seen || {}; if (!s.seen[k]) { s.seen[k] = Date.now(); wr(LS_C, s); render(); } }

  /* ───── نافذة التسجيل ───── */
  function regModal(opts) {
    opts = opts || {}; if (document.getElementById('tfReg')) return;
    const c = cfg(); const ov = document.createElement('div'); ov.id = 'tfReg';
    ov.innerHTML = `<div class="tfr-box" role="dialog" aria-modal="true">
      <div class="tfr-h"><div class="tfr-k">TRACK FORD · GRCP COURSE</div><h2>${opts.login ? 'تسجيل الدخول' : 'تسجيل المتدرب'}</h2><p>سجّل مرة واحدة لتظهر محاضرات اليوم وتُحفظ نتائجك ويتابع المدرب تقدّمك.</p></div>
      <form class="tfr-f" id="tfRegForm">
        <label class="n">الاسم الكامل<input name="name" required minlength="3" placeholder="مثال: محمد بن عبدالله"></label>
        <label>رقم الجوال<input name="phone" required inputmode="tel" placeholder="05xxxxxxxx" dir="ltr"></label>
        <label>الرقم السري (4 أرقام)<input name="pin" required inputmode="numeric" pattern="\\d{4,6}" maxlength="6" placeholder="••••" dir="ltr" type="password"></label>
        <label class="n reg-only">البريد الإلكتروني (اختياري)<input name="email" type="email" placeholder="name@company.com" dir="ltr"></label>
        <label class="reg-only">المجموعة<select name="group">${(c.groups || []).map(g => `<option>${esc(g)}</option>`).join('')}<option value="عام">بدون مجموعة</option></select></label>
        <label class="reg-only">جهة العمل<input name="org" placeholder="اسم المنظمة"></label>
        <label class="n reg-only">المسمّى الوظيفي (اختياري)<input name="role" placeholder="مثال: مدير الامتثال"></label>
        <div class="tfr-msg" id="tfRegMsg"></div>
        <div class="tfr-act"><button type="submit" class="tfr-btn gold" id="tfRegGo">${opts.login ? 'دخول' : 'تسجيل والبدء'}</button><button type="button" class="tfr-btn" id="tfRegSwitch">${opts.login ? 'ليس لديّ حساب — تسجيل جديد' : 'لديّ حساب — دخول'}</button><button type="button" class="tfr-btn ghost" id="tfRegGuest">متابعة كضيف (بدون متابعة المدرب)</button></div>
      </form></div>`;
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    const form = ov.querySelector('#tfRegForm'), msg = ov.querySelector('#tfRegMsg');
    const setMode = login => { ov.querySelectorAll('.reg-only').forEach(e => e.style.display = login ? 'none' : ''); ov.querySelector('h2').textContent = login ? 'تسجيل الدخول' : 'تسجيل المتدرب'; ov.querySelector('#tfRegGo').textContent = login ? 'دخول' : 'تسجيل والبدء'; ov.querySelector('#tfRegSwitch').textContent = login ? 'ليس لديّ حساب — تسجيل جديد' : 'لديّ حساب — دخول'; form.dataset.login = login ? '1' : ''; form.querySelector('[name=name]').required = !login; };
    setMode(!!opts.login);
    ov.querySelector('#tfRegSwitch').onclick = () => setMode(!form.dataset.login);
    const close = () => { ov.remove(); document.body.style.overflow = ''; render(); };
    ov.querySelector('#tfRegGuest').onclick = () => { setUser({ id: 'guest', name: 'ضيف', guest: true, local: true, created: Date.now() }); close(); };
    form.onsubmit = async e => {
      e.preventDefault(); const fd = Object.fromEntries(new FormData(form).entries()); const login = !!form.dataset.login;
      msg.textContent = 'جارٍ الاتصال…'; ov.querySelector('#tfRegGo').disabled = true;
      const ok = await probe();
      if (!ok) {
        const u = { id: 'L' + (fd.phone || '').replace(/\D/g, '').slice(-9), name: fd.name || (user() || {}).name || 'متدرب', phone: fd.phone, email: fd.email || '', group: fd.group || 'عام', org: fd.org || '', role: fd.role || '', local: true, created: Date.now() };
        setUser(u); msg.textContent = ''; close(); toast('تم التسجيل محليًا على هذا الجهاز (لم تُفعَّل قاعدة البيانات بعد).'); return;
      }
      const r = await api('/api/reg', { method: 'POST', body: JSON.stringify(Object.assign({ action: login ? 'login' : 'register' }, fd)) });
      ov.querySelector('#tfRegGo').disabled = false;
      if (!r.ok) { const E = { bad_phone: 'رقم الجوال غير صحيح (05xxxxxxxx).', bad_pin: login ? 'الرقم السري غير صحيح.' : 'الرقم السري 4 إلى 6 أرقام.', bad_name: 'اكتب الاسم الكامل.', exists: 'هذا الجوال مسجّل برقم سري مختلف — اختر «لديّ حساب».', not_found: 'لا يوجد حساب بهذا الجوال — سجّل حسابًا جديدًا.' }; msg.textContent = E[r.j.error] || 'تعذّر الاتصال بالخادم، حاول مرة أخرى.'; return; }
      const u = Object.assign({}, r.j.user, { token: r.j.token }); setUser(u); close(); toast(r.j.created ? `أهلًا ${u.name} — تم تسجيلك في الدورة.` : `أهلًا بعودتك ${u.name}.`); sync(true);
    };
  }
  function toast(m) { let t = document.getElementById('tfToast'); if (!t) { t = document.createElement('div'); t.id = 'tfToast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3200); }
  function signOut() { try { localStorage.removeItem(LS_U); localStorage.removeItem('grcpUser'); } catch (e) {} location.reload(); }

  /* ───── شريحة المستخدم (تُعرض في شريط التكامل) ───── */
  function chip() {
    const u = user(), t = today(), snap = snapshot();
    const dayTxt = t === 0 ? L('قبل بدء الدورة', 'Before the course') : t === 6 ? L('ما بعد الدورة', 'After the course') : L(`اليوم ${t} · ${DAYS[t - 1].ar}`, `Day ${t} · ${DAYS[t - 1].en}`);
    return `<span class="tfc-chip">${u ? `👤 <b>${esc(u.name)}</b>${u.group && u.group !== 'عام' ? ` · ${esc(u.group)}` : ''}${u.local ? ' <small>' + L('(محلي)', '(local)') + '</small>' : ''}` : '👤 ' + L('غير مسجّل', 'Not registered')}</span><span class="tfc-chip day">📅 ${dayTxt}</span><span class="tfc-chip">📈 ${L('تقدّمي', 'My progress')} ${snap.overall}%</span><a class="tfc-link" href="${A}#/course">${L('مسار الدورة', 'Course track')}</a><a class="tfc-link" href="trainer.html">${L('دخول المدرب', 'Trainer')}</a>${u ? `<button type="button" class="tfc-out" data-tfc="out">${L('خروج', 'Sign out')}</button>` : `<button type="button" class="tfc-out" data-tfc="reg">${L('تسجيل', 'Register')}</button>`}`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-tfc]'); if (!b) return; if (b.dataset.tfc === 'out') { if (confirm('تسجيل الخروج من هذا الجهاز؟')) signOut(); } else regModal(); });

  /* ───── مسار الدورة (واجهة) ───── */
  function mountTrack(host, sel) {
    if (!host) return; const u = user(), t = today(), cur = sel || Math.max(1, Math.min(5, t || 1)); const d = DAYS[cur - 1], p = dayProgress(d), snap = snapshot();
    const startD = new Date(cfg().start + 'T00:00:00'); const dateOf = n => { const x = new Date(startD); x.setDate(x.getDate() + n - 1); return x.toLocaleDateString(EN() ? 'en-GB' : 'ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }); }; const dn = x => EN() ? x.en : x.ar;
    host.innerHTML = `<div class="wrap tfc-wrap">
      <section class="tfc-hero" style="--c:${d.col}"><div><div class="tfc-k">GRCP® COURSE · TRACK FORD · ${t ? (t === 6 ? 'AFTER COURSE' : 'DAY ' + t) : 'PRE-COURSE'}</div>
        <h2>${u ? L(`أهلًا ${esc(u.name)}`, `Welcome ${esc(u.name)}`) : L('أهلًا بك في مسار الدورة', 'Welcome to the course track')}${u && u.group && u.group !== 'عام' ? ` <small>${esc(u.group)}</small>` : ''}</h2>
        <p>${t === 0 ? L(`تبدأ الدورة ${dateOf(1)}. يمكنك الاطّلاع على اليوم الأول استعدادًا.`, `The course starts ${dateOf(1)}. You can preview Day 1.`) : t === 6 ? L('انتهت أيام الدورة — كل الأيام متاحة للمراجعة، والتركيز الآن على الاختبار الحقيقي.', 'Course days are over — all days are open for review; focus now on the real exam.') : L(`اليوم هو اليوم ${t} من 5: <b>${DAYS[t - 1].ar}</b> — من 7 إلى 10 مساءً. أكمل بنود اليوم بالترتيب؛ الأيام القادمة تُفتح في موعدها.`, `Today is Day ${t} of 5: <b>${DAYS[t - 1].en}</b> — 7 to 10 pm. Complete today's items in order; coming days unlock on schedule.`)}</p>
        ${!u ? `<button type="button" class="tfc-btn gold" data-tfc="reg">${L('سجّل الآن ليُحفظ تقدّمك', 'Register now to save your progress')}</button>` : (u.local ? '<div class="tfc-note">⚠️ التقدّم محفوظ على هذا الجهاز فقط. <button type="button" class="tfc-mini" id="tfcCode">نسخ كود تقدّمي للمدرب</button></div>' : `<div class="tfc-note">✅ تقدّمك يُزامَن مع لوحة المدرب${u.lastSync ? ' · آخر مزامنة ' + new Date(u.lastSync).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''}</div>`)}
        </div><div class="tfc-ring" style="--p:${snap.overall}"><b>${snap.overall}%</b><span>${L('تقدّمي الإجمالي', 'Overall progress')}</span></div></section>
      <nav class="tfc-days">${DAYS.map(x => { const q = dayProgress(x), lk = !unlocked(x.n); return `<button type="button" data-d="${x.n}" class="${x.n === cur ? 'on' : ''} ${lk ? 'lock' : ''} ${x.n === t ? 'today' : ''}" ${lk ? 'disabled' : ''} style="--c:${x.col}"><span class="dn">${lk ? '🔒' : x.n === t ? '📍' : q.pct === 100 ? '✅' : x.n}</span><span class="dt">${L('اليوم', 'Day')} ${x.n}</span><span class="dd">${dn(x)}</span><span class="dp"><i style="width:${q.pct}%"></i></span><small>${dateOf(x.n)} · ${q.pct}%</small></button>`; }).join('')}</nav>
      <section class="tfc-day" style="--c:${d.col}"><div class="tfc-dh"><h3>${L('اليوم', 'Day')} ${d.n} — ${dn(d)} <span class="en">${EN() ? d.ar : d.en}</span></h3><div class="tfc-dp">${p.done} / ${p.total} ${L('بند مكتمل', 'items done')}</div></div>
        <ol class="tfc-items">${d.items.map((i, k) => { let ok = false; try { ok = !!i.chk(); } catch (e) {} return `<li class="${ok ? 'ok' : ''}"><span class="num">${ok ? '✓' : k + 1}</span><div class="tx"><a href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(EN() && i.te ? i.te : i.t)}</a>${i.manual ? `<button type="button" class="tfc-mini" data-mark="${i.k}" data-v="${ok ? '0' : '1'}">${ok ? L('إلغاء التعليم', 'Unmark') : L('تم ✓', 'Done ✓')}</button>` : ''}</div><a class="go" href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${ok ? L('مراجعة', 'Review') : L('ابدأ', 'Start')} ${L('←', '→')}</a></li>`; }).join('')}</ol>
        <div class="tfc-foot">${d.n === 5 ? L('<b>مشروع المجموعة:</b> كل مجموعة تعرض خريطة GRC لمنظمة مختارة (الملف في النظام + التقييم في المقيّم + فيديو المحاكاة) خلال 10 دقائق.', '<b>Group project:</b> each group presents a GRC map of a chosen organisation (System profile + Navigator assessment + simulation video) in 10 minutes.') : L('<b>قاعدة اليوم:</b> لا تنتقل إلى اليوم التالي قبل إكمال 80% من بنود اليوم — المدرب يرى نسبتك.', '<b>Rule of the day:</b> do not move on before completing 80% of today\'s items — your trainer sees your percentage.')}</div></section>
      ${u && !u.local ? '' : ''}</div>`;
    host.querySelectorAll('.tfc-days button:not([disabled])').forEach(b => b.onclick = () => mountTrack(host, +b.dataset.d));
    const cb = host.querySelector('#tfcCode'); if (cb) cb.onclick = () => { const o = { id: u.id, name: u.name, group: u.group, org: u.org, phone: u.phone, email: u.email, created: u.created, progress: snapshot() }; const code = btoa(unescape(encodeURIComponent(JSON.stringify(o)))); (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast('نُسخ الكود — أرسله للمدرب عبر واتساب.')).catch(() => prompt('انسخ الكود:', code)); };
    host.querySelectorAll('[data-mark]').forEach(b => b.onclick = () => { mark(b.dataset.mark, b.dataset.v === '1'); mountTrack(host, cur); });
  }

  /* ───── القفل الزمني للمحاضرات والاختبارات ───── */
  function lockHtml(n, what) { const d = DAYS[n - 1]; const startD = new Date(cfg().start + 'T00:00:00'); startD.setDate(startD.getDate() + n - 1); const ds = startD.toLocaleDateString(EN() ? 'en-GB' : 'ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }); return `<div class="wrap" style="padding:60px 16px;text-align:center"><div style="font-size:56px">🔒</div><h2 style="margin:8px 0">${L(`${what} ضمن اليوم ${n}: ${esc(d.ar)}`, `${what} belongs to Day ${n}: ${esc(d.en)}`)}</h2><p style="color:#5B6476">${L(`يُفتح ${ds} في تمام الساعة 7 مساءً. ركّز الآن على بنود يومك الحالي.`, `Opens on ${ds} at 7 pm. Focus on today\'s items for now.`)}</p><a href="${A}#/course" class="tfc-btn gold" style="display:inline-block;margin-top:10px">${L('العودة إلى مسار الدورة', 'Back to the course track')}</a></div>`; }
  function guardAcademyRoute() {
    if (page !== 'academy') return;
    const h = location.hash || '#/'; const parts = h.slice(2).split('/'); const app = document.getElementById('app'); if (!app) return;
    if (parts[0] === 'lecture') { const n = parseInt(parts[1], 10) || 1; const dn = dayOfLecture(n); if (!unlocked(dn)) { app.innerHTML = lockHtml(dn, L('المحاضرة ', 'Lecture ') + n); return; } seen('lec' + n); }
    if (parts[0] === 'exam' && !unlocked(5) && today() !== 0) { app.innerHTML = lockHtml(5, L('الاختبارات التجريبية الكاملة', 'Full mock exams')); }
  }

  /* ───── الأنماط ───── */
  const css = document.createElement('style'); css.textContent = `
  #tfReg{position:fixed;inset:0;background:rgba(6,18,43,.72);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Rubik,Tahoma,system-ui,sans-serif}
  .tfr-box{background:#fff;border-radius:20px;max-width:620px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 30px 80px rgba(0,0,0,.4)}
  .tfr-h{background:linear-gradient(135deg,#0A1B3D,#13295A);color:#fff;padding:22px 24px;border-radius:20px 20px 0 0}.tfr-h h2{margin:4px 0;font-size:24px}.tfr-h p{margin:0;color:#D9C9A4;font-size:14px}.tfr-k{font-size:11px;letter-spacing:.14em;color:#E2B85A;font-weight:700}
  .tfr-f{padding:18px 24px 22px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.tfr-f label{display:grid;gap:5px;font-size:13px;font-weight:600;color:#1B2436}.tfr-f label.n{grid-column:1/-1}.tfr-f input,.tfr-f select{font:inherit;padding:10px 12px;border:1px solid #E7DCC6;border-radius:10px;background:#FBF8F2}
  .tfr-msg{grid-column:1/-1;color:#B91C1C;font-size:13px;min-height:18px}.tfr-act{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}
  .tfr-btn,.tfc-btn{border:1px solid #C9973B;background:#0A1B3D;color:#fff;border-radius:999px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}.tfr-btn.gold,.tfc-btn.gold{background:linear-gradient(180deg,#F2D584,#D4A84C);color:#0A1B3D}.tfr-btn.ghost{background:transparent;color:#5B6476;border-color:#E7DCC6}
  #tfToast{position:fixed;bottom:22px;inset-inline-start:22px;background:#0A1B3D;color:#fff;padding:12px 18px;border-radius:12px;z-index:2147483001;opacity:0;transition:.3s;font-family:Rubik,Tahoma,sans-serif;font-size:14px;max-width:360px}#tfToast.on{opacity:1}
  .tfc-chip{background:#fff;border:1px solid #E7DCC6;border-radius:999px;padding:2px 10px;font-size:12.5px}.tfc-chip.day{background:#0A1B3D;color:#fff;border-color:#0A1B3D}.tfc-link{color:#0A1B3D;font-weight:800;border-bottom:1px dashed #C9973B;text-decoration:none}.tfc-out{border:0;background:transparent;color:#5B6476;font:inherit;font-size:12px;cursor:pointer;text-decoration:underline}
  .tfc-wrap{padding-block:18px;font-family:Rubik,Tahoma,system-ui,sans-serif}.tfc-hero{display:flex;gap:18px;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#0A1B3D,#13295A);color:#fff;border-radius:18px;padding:24px 28px;margin-bottom:14px;border-inline-start:8px solid var(--c)}.tfc-hero h2{margin:4px 0;font-size:26px}.tfc-hero h2 small{font-size:14px;color:#E2B85A}.tfc-hero p{color:#D9C9A4;margin:0 0 10px;max-width:720px}.tfc-k{font-size:11px;letter-spacing:.14em;color:#E2B85A;font-weight:700}.tfc-note{font-size:13px;color:#fff;background:rgba(255,255,255,.1);border-radius:10px;padding:6px 10px;display:inline-block}
  .tfc-ring{width:130px;height:130px;border-radius:50%;background:conic-gradient(#E2B85A calc(var(--p)*1%),rgba(255,255,255,.15) 0);display:grid;place-items:center;flex:0 0 auto}.tfc-ring b{font-size:30px;font-family:Montserrat,Arial}.tfc-ring span{font-size:11px;color:#D9C9A4;text-align:center}
  .tfc-days{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px}@media(max-width:900px){.tfc-days{grid-template-columns:repeat(2,1fr)}}.tfc-days button{text-align:start;border:2px solid #E7DCC6;background:#fff;border-radius:14px;padding:12px;font:inherit;cursor:pointer;display:grid;gap:3px;border-top:5px solid var(--c)}.tfc-days button.on{border-color:var(--c);box-shadow:0 10px 24px -14px rgba(10,27,61,.5)}.tfc-days button.lock{opacity:.55;cursor:not-allowed;background:#F6F6F6}.tfc-days button.today .dt::after{content:' · اليوم';color:#B91C1C;font-size:11px}.tfc-days .dn{font-size:20px;font-weight:800;color:var(--c)}.tfc-days .dt{font-weight:800;color:#0A1B3D}.tfc-days .dd{font-size:12.5px;color:#1B2436;min-height:36px}.tfc-days .dp{height:6px;background:#F3EBDA;border-radius:3px;overflow:hidden}.tfc-days .dp i{display:block;height:100%;background:var(--c)}.tfc-days small{color:#5B6476;font-size:11px}
  .tfc-day{background:#fff;border:1px solid #E7DCC6;border-radius:16px;padding:18px 20px;border-inline-start:6px solid var(--c)}.tfc-dh{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}.tfc-dh h3{margin:0;font-size:20px;color:#0A1B3D}.tfc-dh .en{font-size:12px;color:#5B6476;font-family:Montserrat,Arial}.tfc-dp{background:var(--c);color:#fff;border-radius:999px;padding:3px 12px;font-weight:700;font-size:13px}
  .tfc-items{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}.tfc-items li{display:flex;align-items:center;gap:12px;border:1px solid #E7DCC6;border-radius:12px;padding:10px 12px;background:#FBF8F2}.tfc-items li.ok{background:#ECFDF5;border-color:#A7F3D0}.tfc-items .num{width:30px;height:30px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:800;flex:0 0 auto}.tfc-items li.ok .num{background:#047857}.tfc-items .tx{flex:1}.tfc-items .tx a{color:#0A1B3D;text-decoration:none;font-weight:600}.tfc-items .go{color:#fff;background:#0A1B3D;border-radius:999px;padding:5px 12px;text-decoration:none;font-size:13px;font-weight:700}.tfc-mini{margin-inline-start:8px;border:1px solid #C9973B;background:#fff;border-radius:999px;padding:2px 10px;font:inherit;font-size:12px;cursor:pointer}.tfc-foot{margin-top:14px;font-size:13px;color:#5B6476;background:#F6EEDC;border-radius:10px;padding:10px 12px}`;
  document.head.appendChild(css);

  /* ───── الإقلاع ───── */
  function render() { try { window.TFB && window.TFB.render(); } catch (e) {} }
  async function loadServerConfig() { try { const r = await api('/api/progress'); if (r.ok && r.j.config && r.j.config.start) { wr(LS_CFG, Object.assign(cfg(), r.j.config)); render(); } } catch (e) {} }
  function boot() {
    if (page === 'trainer') return;
    if (/[?&]all=1/.test(location.search)) wr('tf_unlock', 1);
    if (/[?&]trainer=1/.test(location.search)) wr('tf_unlock', 1);
    if (!user() && page !== 'index') setTimeout(() => regModal(), 600);
    if (page === 'academy') { window.addEventListener('hashchange', () => setTimeout(guardAcademyRoute, 30)); setTimeout(guardAcademyRoute, 150); if (user() && !user().guest && (location.hash === '' || location.hash === '#/') && !sessionStorage.getItem('tf_home_seen')) { sessionStorage.setItem('tf_home_seen', '1'); location.hash = '#/course'; } }
    if (window.I18N && window.I18N.onChange) window.I18N.onChange(() => { render(); const h = document.getElementById('courseHost'); if (h) mountTrack(h); const ah = document.getElementById('arenaHost'); if (ah && window.TFArena) window.TFArena.mount(ah, (location.hash.split('/')[2] || '')); setTimeout(guardAcademyRoute, 50); });
    loadServerConfig(); setTimeout(() => sync(true), 4000); setInterval(() => sync(), 120000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) sync(true); });
    window.addEventListener('beforeunload', () => { const u = user(); if (u && u.token && !u.local && navigator.sendBeacon) { try { navigator.sendBeacon('/api/progress', new Blob([JSON.stringify({ id: u.id, token: u.token, snapshot: snapshot() })], { type: 'application/json' })); } catch (e) {} } });
  }
  window.TFC = { DAYS, cfg, EN, L, today, dayIndex, unlocked, user, setUser, regModal, snapshot, dayProgress, sync, mark, seen, chip, mountTrack, signOut, dayOfLecture, toast };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
