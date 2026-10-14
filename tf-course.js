/* Track Ford GRC — مسار الدورة الموحّد + تسجيل المتدربين + مزامنة التقدّم
   - الدورة 5 أيام (7–10 مساءً). يظهر للمتدرب يوم الدورة الحالي فقط (والأيام السابقة للمراجعة)، والأيام القادمة مقفلة.
   - التسجيل حقيقي عبر /api/reg؛ وضع الضيف محلي ولا يُنشئ حسابًا على الخادم.
   - التقدّم يُجمع تلقائيًا من كل الوحدات (محاضرات، أنشطة، ألعاب، أسئلة، ساحة الذكاء، النظام، المقيّم) ويُزامَن مع لوحة المدرب. */
(function () {
  'use strict';
  const LS_U = 'tf_user', LS_C = 'tf_course', LS_CFG = 'tf_course_cfg', LS_OWNER = 'tf_progress_owner_v1', LS_OWNER_CREATED = 'tf_progress_owner_created_v1', LS_UNCLAIMED = 'tf_progress_unclaimed_v1';
  const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '') || 'index';
  const A = 'academy.html', S = 'system.html', N = 'navigator.html';
  const EN = () => { try { if (window.I18N) return window.I18N.lang === 'en'; if (window.I18 && window.I18.lang) return window.I18.lang === 'en'; return (localStorage.getItem('grcpLang') || '').replace(/"/g, '') === 'en'; } catch (e) { return false; } };
  const L = (ar, en) => EN() ? en : ar;

  /* ───── تعريف الدورة ───── */
  /* لا يوجد تاريخ بدء افتراضي — النظام مفتوح لأي تاريخ ما لم يحدّد المدرب تاريخًا */
  const DAYS = [
    { n: 1, ar: 'المقدمة والمبادئ الأساسية والمفاهيم الأساسية (ج1)', en: 'Introduction, Principles & Key Concepts (Part 1)', lectures: [1], col: '#EA580C', items: [
      { k: 'lec1', te: 'Lecture 1 — Introduction, Principled Performance & core principles', t: 'المحاضرة 1 — المقدمة والأداء المنضبط والمبادئ الأساسية', href: A + '#/lecture/1', chk: () => lecRead(1) },
      { k: 'ws1', te: 'Applied workshop: initial diagnosis of your organisation', t: 'النشاط التطبيقي: التشخيص الأولي لمنظمتك', href: A + '#/lecture/1/act', chk: () => { const d = rd('grcpD1v1'); return !!(d && d.org && d.org.name && Object.keys(d.cause || {}).length >= 2); } },
      { k: 'game1', te: "Protector's Decisions game (Lecture 1)", t: 'لعبة قرارات الحامي (المحاضرة 1)', href: A + '#/lecture/1', chk: () => gameDone(1) },
      { k: 'q1', te: 'Lecture 1 practice questions (≥60%)', t: 'أسئلة المحاضرة 1 (60% على الأقل)', href: A + '#/lecture/1/quiz', chk: () => quizPct([1]) >= 60 },
      { k: 'ar1', te: 'AI Arena: element classification race', t: 'ساحة الذكاء: سباق تصنيف العناصر', href: A + '#/arena/classify', chk: () => arenaBest('classify') > 0 },
      { k: 'nav1', te: 'AI Navigator: organisation profile + 20-element assessment', t: 'المقيّم الذكي: ملف مؤسستك + استبيان العناصر العشرين', href: N, chk: () => { const n = rd('tf-grc-navigator-v1'); return !!(n && !n.example && n.p && n.p.name && Object.keys(n.a || {}).length >= 20); } }] },
    { n: 2, ar: 'المفاهيم الأساسية (ج2)', en: 'Key Concepts (Part 2)', lectures: [2], col: '#D97706', items: [
      { k: 'lec2', te: 'Lecture 2 — Governance, Management, Assurance & the capability model', t: 'المحاضرة 2 — الحوكمة والإدارة والضمان ونموذج القدرات', href: A + '#/lecture/2', chk: () => lecRead(2) },
      { k: 'q2', te: 'Lecture 2 practice questions (≥60%)', t: 'أسئلة المحاضرة 2 (60% على الأقل)', href: A + '#/lecture/2/quiz', chk: () => quizPct([2]) >= 60 },
      { k: 'armatch', te: 'AI Arena: term matching + oral examiner', t: 'ساحة الذكاء: مطابقة المصطلحات + الممتحن الشفهي', href: A + '#/arena/match', chk: () => arenaBest('match') > 0 || arenaBest('viva') > 0 },
      { k: 'sys2', te: 'GRC System: organisation profile + baseline assessment', t: 'نظام التطبيق: ملف المنظمة + التقييم المبدئي', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && s.org && s.org.name && s.baseline && s.baseline.tp); } }] },
    { n: 3, ar: 'مكوّن الدراسة والمواءمة', en: 'LEARN + ALIGN', lectures: [3, 4, 5], col: '#0D9488', items: [
      { k: 'lec3', te: 'Lecture 3 — LEARN component', t: 'المحاضرة 3 — مكوّن الدراسة LEARN', href: A + '#/lecture/3', chk: () => lecRead(3) },
      { k: 'lec4', te: 'Lecture 4 — ALIGN (1)', t: 'المحاضرة 4 — المواءمة (1)', href: A + '#/lecture/4', chk: () => lecRead(4) },
      { k: 'lec5', te: 'Lecture 5 — ALIGN (2)', t: 'المحاضرة 5 — المواءمة (2)', href: A + '#/lecture/5', chk: () => lecRead(5) },
      { k: 'ws2', te: 'Applied workshops for lectures 3–5 (at least two)', t: 'الأنشطة التطبيقية للمحاضرات 3–5 (نشاطان على الأقل)', href: A + '#/lecture/3/act', chk: () => [3, 4, 5].filter(wsDone).length >= 2 },
      { k: 'bldobj', te: 'Builder: SMART objective → KPI/KRI/KCI', t: 'المصمّم: هدف SMART ← مؤشرات الأداء والمخاطر والامتثال', href: A + '#/builders/objective', chk: () => !!(st().done || {})['build_objective'] },
      { k: 'game2', te: "Protector's Decisions game (lecture 3 or 4)", t: 'لعبة قرارات الحامي (محاضرة 3 أو 4)', href: A + '#/lecture/3', chk: () => gameDone(3) || gameDone(4) || gameDone(5) },
      { k: 'q3', te: 'Lectures 3–5 practice questions (≥60%)', t: 'أسئلة المحاضرات 3–5 (60% على الأقل)', href: A + '#/lecture/4/quiz', chk: () => quizPct([3, 4, 5]) >= 60 },
      { k: 'ar2', te: 'AI Arena: incident simulator', t: 'ساحة الذكاء: محاكي الحوادث', href: A + '#/arena/incident', chk: () => arenaBest('incident') > 0 },
      { k: 'sys3', te: 'GRC System: two LEARN/ALIGN tools', t: 'نظام التطبيق: أداتان من الدراسة/المواءمة', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && Object.keys(s.tools || {}).length >= 2); } }] },
    { n: 4, ar: 'مكوّن التنفيذ', en: 'PERFORM', lectures: [6, 7], col: '#1E40AF', items: [
      { k: 'lec6', te: 'Lecture 6 — PERFORM (1): controls, policies, communication, education', t: 'المحاضرة 6 — التنفيذ (1): الضوابط والسياسات والتواصل والتعليم', href: A + '#/lecture/6', chk: () => lecRead(6) },
      { k: 'lec7', te: 'Lecture 7 — PERFORM (2): incentives, notification, inquiry, response', t: 'المحاضرة 7 — التنفيذ (2): الحوافز والإخطار والاستقصاء والاستجابة', href: A + '#/lecture/7', chk: () => lecRead(7) },
      { k: 'ws3', te: 'Applied workshops for lectures 6 and 7', t: 'النشاطان التطبيقيان للمحاضرتين 6 و7', href: A + '#/lecture/6/act', chk: () => wsDone(6) && wsDone(7) },
      { k: 'bldiacm', te: 'Builders: IACM bow-tie + lines of accountability', t: 'المصمّمات: نموذج IACM + خطوط المساءلة', href: A + '#/builders/iacm', chk: () => { const dn = (st().done || {}); return !!(dn['build_iacm'] || dn['build_loa'] || dn['build_total']); } },
      { k: 'game3', te: "Protector's Decisions game (lecture 6 or 7)", t: 'لعبة قرارات الحامي (محاضرة 6 أو 7)', href: A + '#/lecture/6', chk: () => gameDone(6) || gameDone(7) },
      { k: 'q4', te: 'Lectures 6–7 practice questions (≥60%)', t: 'أسئلة المحاضرتين 6 و7 (60% على الأقل)', href: A + '#/lecture/6/quiz', chk: () => quizPct([6, 7]) >= 60 },
      { k: 'ar3', te: 'AI Arena: oral examiner + who is accountable?', t: 'ساحة الذكاء: الممتحن الشفهي + من المسؤول؟', href: A + '#/arena/viva', chk: () => arenaBest('viva') > 0 || arenaBest('lines') > 0 },
      { k: 'sys4', te: 'GRC System: 5 tools completed (incl. PERFORM)', t: 'نظام التطبيق: 5 أدوات مكتملة (منها أدوات التنفيذ)', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && Object.keys(s.tools || {}).length >= 5); } }] },
    { n: 5, ar: 'مكوّن المراجعة', en: 'REVIEW', lectures: [8, 9, 10], col: '#059669', items: [
      { k: 'lec8', te: 'Lecture 8 — REVIEW component', t: 'المحاضرة 8 — مكوّن المراجعة REVIEW', href: A + '#/lecture/8', chk: () => lecRead(8) },
      { k: 'lec9', te: 'Lecture 9 — Integration: protectors, disciplines & value', t: 'المحاضرة 9 — التكامل: الحُماة والتخصصات والقيمة', href: A + '#/lecture/9', chk: () => lecRead(9) },
      { k: 'ws4', te: 'Applied workshops for lectures 8 and 9', t: 'النشاطان التطبيقيان للمحاضرتين 8 و9', href: A + '#/lecture/8/act', chk: () => wsDone(8) && wsDone(9) },
      { k: 'q5', te: 'Lectures 8–9 practice questions (≥60%)', t: 'أسئلة المحاضرتين 8 و9 (60% على الأقل)', href: A + '#/lecture/8/quiz', chk: () => quizPct([8, 9]) >= 60 },
      { k: 'ar4', te: 'AI Arena: case analyst + order the steps', t: 'ساحة الذكاء: محلّل الحالة الواقعية + رتّب الخطوات', href: A + '#/arena/case', chk: () => arenaBest('case') > 0 || arenaBest('order') > 0 },
      { k: 'sim5', te: 'Navigator: live interview / assessment simulation video', t: 'المقيّم: المقابلة الحية / فيديو محاكاة التقييم', href: N + '#sim', chk: () => !!(st().done || {}).sim },
      { k: 'sys5', te: 'GRC System: post-assessment + full report', t: 'نظام التطبيق: التقييم البعدي + التقرير الشامل', href: S, chk: () => { const s = rd('alsaeedGRC_v1'); return !!(s && ((s.after && s.after.tp) || Object.keys(s.tools || {}).length >= 8)); } },
      { k: 'ex2', te: 'Mock exam with 75% or more', t: 'اختبار تجريبي بنتيجة 75% فأعلى', href: A + '#/exam', chk: () => examBest() >= 75 },
      { k: 'proj', te: 'Group project discussion (mark manually after presenting)', t: 'مناقشة مشروع المجموعة (يُعلَّم يدويًا بعد العرض)', href: A + '#/course', manual: true, chk: () => !!(st().done || {}).proj }] }];

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
  function cfg() { return Object.assign({ start: '', groups: ['المجموعة 1', 'المجموعة 2', 'المجموعة 3', 'المجموعة 4'] }, rd(LS_CFG, {})); }
  /* النظام يعمل لأي تاريخ: افتراضيًا «مفتوح» بلا جدول زمني. يفعّل المدرب الجدول اليومي بتحديد تاريخ بدء في لوحته. */
  const scheduled = () => !!(cfg().start);
  function dayIndex(d) { if (!scheduled()) return 1; const s = new Date(cfg().start + 'T00:00:00'); const now = d || new Date(); const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - s) / 86400000); return diff + 1; }
  function today() { if (!scheduled()) return 0; const i = dayIndex(); return i < 1 ? 0 : i > 5 ? 6 : i; }
  const unlocked = n => true;   /* كل الأيام متاحة دائمًا — لا قفل حسب التاريخ */
  function dayOfLecture(n) { const d = DAYS.find(d => d.lectures.includes(n)); return d ? d.n : 5; }

  /* ───── المستخدم ───── */
  const user = () => rd(LS_U, null);
  const normalizedPhone = value => String(value || '').replace(/\D/g, '').replace(/^00/, '').replace(/^966/, '0').replace(/^5/, '05');
  const serverIdentity = u => !!(u && !u.local && !u.guest && /^[0-9a-f]{16}$/.test(u.id || '') && /^[0-9a-f]{40}$/.test(u.token || ''));
  const identityKey = u => serverIdentity(u) ? u.id + ':' + u.created + ':' + u.token : '';
  const activeAccount = (value, id, phone) => !!(value && typeof value === 'object' && !Array.isArray(value) && value.id === id && value.status === 'active' && value.blocked === false && value.suspended !== true && !value.local && !value.guest && normalizedPhone(value.phone) === normalizedPhone(phone));
  let ownerUnavailable = false;
  function progressOwner() {
    if (ownerUnavailable) return '!';
    try { const raw = localStorage.getItem(LS_OWNER); if (raw === null) return ''; const id = JSON.parse(raw); return typeof id === 'string' && /^[0-9a-f]{16}$/.test(id) ? id : '!'; }
    catch (error) { return '!'; }
  }
  function progressCreated() {
    try { const raw = localStorage.getItem(LS_OWNER_CREATED); if (raw === null) return null; const value = JSON.parse(raw); return Number.isSafeInteger(value) && value > 0 ? value : '!'; } catch (error) { return '!'; }
  }
  function ownsBrowser(u) { return !!(serverIdentity(u) && progressOwner() === u.id && progressCreated() === u.created); }
  function rememberOwner(u) {
    try { localStorage.setItem(LS_OWNER, JSON.stringify(u.id)); localStorage.setItem(LS_OWNER_CREATED, JSON.stringify(u.created)); if (!ownsBrowser(u)) ownerUnavailable = true; return !ownerUnavailable; }
    catch (error) { ownerUnavailable = true; return false; }
  }
  function preserveKnownOwner(u) {
    if (!serverIdentity(u)) return;
    try { if (localStorage.getItem(LS_UNCLAIMED) !== null) return; } catch (error) { ownerUnavailable = true; return; }
    const owner = progressOwner();
    if (!owner) rememberOwner(u);
    else if (owner === u.id && progressCreated() === null) { try { localStorage.setItem(LS_OWNER_CREATED, JSON.stringify(u.created)); } catch (error) { ownerUnavailable = true; } }
  }
  function browserHasWork() {
    const meaningful = value => Array.isArray(value) ? value.some(meaningful) : value && typeof value === 'object' ? Object.values(value).some(meaningful) : typeof value === 'string' ? !!value.trim() : typeof value === 'number' ? value > 0 : value === true;
    try { for (let i=0;i<localStorage.length;i++) { const key = localStorage.key(i); if (/^(tf_course|tf_time|grcpLQ\d+|grcpD1v1|grcpERP|grcpGame|grcpArena|grcpHist|alsaeedGRC_v1|tf-grc-navigator-v1)$/.test(key || '') && meaningful(rd(key,null))) return true; } return false; }
    catch (error) { return true; }
  }
  function canClaimBrowser(u) { return !!(serverIdentity(u) && (!progressOwner() || (progressOwner() === u.id && progressCreated() === null))); }
  function claimBrowserWork() {
    const u = user(), identity = identityKey(u);
    if (!identity || !canClaimBrowser(u) || serverState.identity !== identity || !serverState.restored) return false;
    if (!confirm(L('هل تؤكد أن عمل هذا المتصفح يخص حساب «' + u.name + '» (' + u.phone + ')؟ سيُرسل ملخصه ورصيده السابق إلى هذا الحساب. ستبقى تفاصيل العمل على هذا الجهاز.', 'Confirm this browser’s work belongs to “' + u.name + '” (' + u.phone + ')? Its summary and earlier points balance will be sent to this account. Activity details will remain on this device.'))) return false;
    if (identityKey(user()) !== identity || !canClaimBrowser(u)) return false;
    if (!rememberOwner(u)) { setSyncState(identity,'storage'); return false; }
    // Keep the unclaimed marker as provenance history; the explicit owner now authorizes the upload.
    ownershipHold = false; sync(true); return true;
  }
  // Existing server-session identity establishes a conservative ownership hold, not authentication.
  preserveKnownOwner(user());
  function setUser(u) { preserveKnownOwner(user()); resetSyncSession(); wr(LS_U, u); try { if (u) localStorage.setItem('grcpUser', JSON.stringify({ name: u.name, email: u.email || '', phone: u.phone || '', org: u.org || '', since: u.created || Date.now(), id: u.id })); } catch (e) {} renderSavedSummary(); }
  async function api(path, opt) {
    opt = opt || {}; const controller = new AbortController(), abort = () => controller.abort();
    if (opt.signal) { if (opt.signal.aborted) abort(); else opt.signal.addEventListener('abort', abort, { once: true }); }
    const timeout = setTimeout(abort, 12000);
    try {
      const r = await fetch((window.TF_API_BASE || '') + path, Object.assign({ headers: { 'content-type': 'text/plain' } }, opt, { signal: controller.signal }));
      const j = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, j };
    } finally { clearTimeout(timeout); if (opt.signal) opt.signal.removeEventListener('abort', abort); }
  }

  /* ───── التقدّم ───── */
  function dayProgress(d) { const items = d.items; const done = items.filter(i => { try { return !!i.chk(); } catch (e) { return false; } }).length; return { done, total: items.length, pct: Math.round(done / items.length * 100) }; }
  /* ───── الوقت المستغرق في الدورة (نشط فقط) ───── */
  const LS_T = 'tf_time';
  const timeState = () => rd(LS_T, { sec: 0 }) || { sec: 0 };
  function addTime(s) { const t = timeState(); t.sec = (t.sec || 0) + s; wr(LS_T, t); }
  let _timeLast = Date.now();
  function tickTime() { const now = Date.now(); if (typeof document !== 'undefined' && document.visibilityState === 'visible') { const dt = Math.min(60, (now - _timeLast) / 1000); if (dt > 0.5) addTime(dt); } _timeLast = now; }
  try { setInterval(tickTime, 15000); document.addEventListener('visibilitychange', () => { _timeLast = Date.now(); }); } catch (e) {}

  /* ───── النقاط (بحسب الأداء) ───── */
  function computePoints(snap) {
    const sc = snap.scores || {}; const c = rd(LS_C, {}) || {}; const done = c.done || {};
    const arenaTotal = Object.values(sc.arena || {}).reduce((a, b) => a + (+b || 0), 0);
    const builders = Object.keys(done).filter(k => /^build_/.test(k)).length;
    let p = 0;
    p += (snap.overall || 0) * 2;         // تقدّم الأيام (≤200)
    p += (sc.examBest || 0) * 1.5;        // أفضل اختبار (≤150)
    p += (sc.quiz || 0) * 1;              // أسئلة المحاضرات (≤100)
    p += arenaTotal * 0.4;                // ساحة الذكاء (مجموع أفضل نتائج الألعاب)
    p += builders * 25;                   // النماذج المبنية (مصمّمات)
    p += (sc.maturity ? 40 : 0);          // إكمال تقييم النضج
    return Math.round(p);
  }

  function nativeSnapshot() {
    const days = {}; DAYS.forEach(d => { days[d.n] = dayProgress(d).pct; });
    const items = {}; DAYS.forEach(d => d.items.forEach(i => { try { items[i.k] = !!i.chk(); } catch (e) { items[i.k] = false; } }));
    const t = today(); const activeDays = DAYS.filter(d => d.n <= Math.max(1, Math.min(5, t || 1)));
    const overall = Math.round(activeDays.reduce((a, d) => a + days[d.n], 0) / activeDays.length);
    const nav = rd('tf-grc-navigator-v1'); const m = nav && !nav.example ? Object.values(nav.a || {}).filter(Boolean) : [];
    const scores = { examBest: examBest(), examAttempts: examAttempts(), arena: (rd('grcpArena', {}) || {}).best || {}, team: (rd('grcpArena', {}) || {}).team || {}, maturity: m.length ? +(m.reduce((a, b) => a + b, 0) / m.length).toFixed(2) : 0, quiz: Math.round([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((a, n) => a + quizPct([n]), 0) / 10) };
    const org = (rd('tf_org_v1') || {}).name || (nav && nav.p && nav.p.name) || '';
    const snap = { days, overall, items, scores, org, at: Date.now(), today: t };
    snap.timeSec = Math.round(timeState().sec || 0);
    const doneC = (rd(LS_C, {}) || {}).done || {};
    snap.builders = Object.keys(doneC).filter(k => /^build_/.test(k)).map(k => k.replace('build_', ''));
    snap.points = computePoints(snap);
    return snap;
  }
  const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const number = (value, max = 100000) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
  // Exact version-1 server catalog: classification never depends on a UI namespace prefix.
  const QUESTION_IDS = new Set(["question:bank:1","question:bank:10","question:bank:100","question:bank:1001","question:bank:1002","question:bank:1003","question:bank:1004","question:bank:1005","question:bank:1006","question:bank:1007","question:bank:1008","question:bank:1009","question:bank:101","question:bank:1010","question:bank:1011","question:bank:1012","question:bank:1013","question:bank:1014","question:bank:1015","question:bank:1016","question:bank:1017","question:bank:1018","question:bank:1019","question:bank:102","question:bank:1020","question:bank:1021","question:bank:1022","question:bank:1023","question:bank:1024","question:bank:1025","question:bank:1026","question:bank:1027","question:bank:1028","question:bank:1029","question:bank:103","question:bank:1030","question:bank:1031","question:bank:1032","question:bank:1033","question:bank:1034","question:bank:1035","question:bank:1036","question:bank:1037","question:bank:1038","question:bank:1039","question:bank:104","question:bank:1040","question:bank:1041","question:bank:1042","question:bank:1043","question:bank:1044","question:bank:1045","question:bank:1046","question:bank:1047","question:bank:1048","question:bank:1049","question:bank:105","question:bank:1050","question:bank:1051","question:bank:1052","question:bank:1053","question:bank:1054","question:bank:1055","question:bank:1056","question:bank:1057","question:bank:1058","question:bank:1059","question:bank:106","question:bank:1060","question:bank:1061","question:bank:1062","question:bank:1063","question:bank:1064","question:bank:1065","question:bank:1067","question:bank:1068","question:bank:1069","question:bank:107","question:bank:1070","question:bank:1071","question:bank:1072","question:bank:1073","question:bank:1074","question:bank:1075","question:bank:1076","question:bank:1077","question:bank:1078","question:bank:1079","question:bank:108","question:bank:1080","question:bank:1081","question:bank:1082","question:bank:1083","question:bank:1084","question:bank:1085","question:bank:1086","question:bank:1087","question:bank:1088","question:bank:1089","question:bank:109","question:bank:1090","question:bank:1091","question:bank:1092","question:bank:1093","question:bank:1094","question:bank:1095","question:bank:1096","question:bank:1097","question:bank:11","question:bank:110","question:bank:111","question:bank:112","question:bank:113","question:bank:114","question:bank:115","question:bank:116","question:bank:117","question:bank:118","question:bank:119","question:bank:12","question:bank:120","question:bank:121","question:bank:122","question:bank:123","question:bank:124","question:bank:125","question:bank:126","question:bank:127","question:bank:128","question:bank:129","question:bank:13","question:bank:130","question:bank:131","question:bank:132","question:bank:133","question:bank:134","question:bank:135","question:bank:137","question:bank:138","question:bank:139","question:bank:14","question:bank:140","question:bank:141","question:bank:142","question:bank:143","question:bank:144","question:bank:145","question:bank:147","question:bank:148","question:bank:15","question:bank:150","question:bank:152","question:bank:154","question:bank:155","question:bank:156","question:bank:158","question:bank:159","question:bank:16","question:bank:160","question:bank:161","question:bank:162","question:bank:163","question:bank:164","question:bank:165","question:bank:166","question:bank:167","question:bank:168","question:bank:169","question:bank:17","question:bank:170","question:bank:171","question:bank:172","question:bank:173","question:bank:174","question:bank:175","question:bank:176","question:bank:177","question:bank:178","question:bank:18","question:bank:180","question:bank:182","question:bank:185","question:bank:186","question:bank:187","question:bank:188","question:bank:189","question:bank:19","question:bank:190","question:bank:191","question:bank:192","question:bank:194","question:bank:195","question:bank:196","question:bank:197","question:bank:198","question:bank:199","question:bank:2","question:bank:20","question:bank:200","question:bank:201","question:bank:203","question:bank:21","question:bank:22","question:bank:23","question:bank:24","question:bank:25","question:bank:26","question:bank:27","question:bank:28","question:bank:29","question:bank:3","question:bank:30","question:bank:31","question:bank:32","question:bank:33","question:bank:34","question:bank:35","question:bank:36","question:bank:37","question:bank:38","question:bank:39","question:bank:4","question:bank:40","question:bank:41","question:bank:42","question:bank:43","question:bank:44","question:bank:45","question:bank:46","question:bank:47","question:bank:48","question:bank:49","question:bank:5","question:bank:50","question:bank:51","question:bank:52","question:bank:53","question:bank:54","question:bank:55","question:bank:56","question:bank:57","question:bank:58","question:bank:59","question:bank:6","question:bank:60","question:bank:61","question:bank:62","question:bank:63","question:bank:64","question:bank:65","question:bank:66","question:bank:67","question:bank:68","question:bank:69","question:bank:72","question:bank:75","question:bank:76","question:bank:77","question:bank:78","question:bank:79","question:bank:8","question:bank:80","question:bank:81","question:bank:82","question:bank:83","question:bank:84","question:bank:85","question:bank:86","question:bank:87","question:bank:88","question:bank:89","question:bank:9","question:bank:90","question:bank:91","question:bank:92","question:bank:93","question:bank:94","question:bank:95","question:bank:96","question:bank:97","question:bank:98","sysq:0","sysq:1","sysq:10","sysq:100","sysq:101","sysq:102","sysq:103","sysq:104","sysq:105","sysq:106","sysq:107","sysq:108","sysq:109","sysq:11","sysq:110","sysq:111","sysq:112","sysq:113","sysq:114","sysq:115","sysq:116","sysq:117","sysq:118","sysq:119","sysq:12","sysq:120","sysq:121","sysq:122","sysq:123","sysq:124","sysq:125","sysq:126","sysq:127","sysq:128","sysq:129","sysq:13","sysq:130","sysq:131","sysq:132","sysq:133","sysq:134","sysq:135","sysq:136","sysq:137","sysq:138","sysq:139","sysq:14","sysq:140","sysq:141","sysq:142","sysq:143","sysq:144","sysq:145","sysq:146","sysq:147","sysq:148","sysq:149","sysq:15","sysq:150","sysq:151","sysq:152","sysq:153","sysq:154","sysq:155","sysq:156","sysq:157","sysq:158","sysq:159","sysq:16","sysq:160","sysq:161","sysq:162","sysq:163","sysq:164","sysq:165","sysq:166","sysq:167","sysq:168","sysq:169","sysq:17","sysq:170","sysq:171","sysq:172","sysq:173","sysq:174","sysq:175","sysq:176","sysq:177","sysq:178","sysq:179","sysq:18","sysq:180","sysq:181","sysq:182","sysq:183","sysq:184","sysq:19","sysq:2","sysq:20","sysq:21","sysq:22","sysq:23","sysq:24","sysq:25","sysq:26","sysq:27","sysq:28","sysq:29","sysq:3","sysq:30","sysq:31","sysq:32","sysq:33","sysq:34","sysq:35","sysq:36","sysq:37","sysq:38","sysq:39","sysq:4","sysq:40","sysq:41","sysq:42","sysq:43","sysq:44","sysq:45","sysq:47","sysq:48","sysq:49","sysq:5","sysq:51","sysq:52","sysq:53","sysq:54","sysq:55","sysq:56","sysq:57","sysq:58","sysq:59","sysq:6","sysq:60","sysq:61","sysq:62","sysq:63","sysq:64","sysq:65","sysq:66","sysq:67","sysq:68","sysq:69","sysq:7","sysq:70","sysq:71","sysq:72","sysq:73","sysq:74","sysq:75","sysq:76","sysq:77","sysq:78","sysq:79","sysq:8","sysq:80","sysq:81","sysq:82","sysq:83","sysq:84","sysq:85","sysq:86","sysq:87","sysq:88","sysq:89","sysq:9","sysq:90","sysq:91","sysq:92","sysq:93","sysq:94","sysq:95","sysq:96","sysq:97","sysq:98","sysq:99"]);
  const ACTIVITY_IDS = new Set(["activity:arena:case","activity:arena:classify","activity:arena:incident","activity:arena:lines","activity:arena:match","activity:arena:order","activity:arena:team","activity:arena:viva","activity:exam:1","activity:exam:2","activity:exam:3","activity:exam:d1","activity:exam:d2","activity:exam:d3","activity:exam:d4","activity:exam:d5","activity:exam:free","plan:1.0","plan:1.1","plan:1.2","plan:1.3","plan:10.0","plan:10.1","plan:10.2","plan:10.3","plan:11.0","plan:11.1","plan:11.2","plan:11.3","plan:12.0","plan:12.1","plan:12.2","plan:12.3","plan:13.0","plan:13.1","plan:13.2","plan:13.3","plan:14.0","plan:14.1","plan:14.2","plan:14.3","plan:2.0","plan:2.1","plan:2.2","plan:2.3","plan:3.0","plan:3.1","plan:3.2","plan:3.3","plan:4.0","plan:4.1","plan:4.2","plan:4.3","plan:5.0","plan:5.1","plan:5.2","plan:5.3","plan:6.0","plan:6.1","plan:6.2","plan:6.3","plan:7.0","plan:7.1","plan:7.2","plan:7.3","plan:8.0","plan:8.1","plan:8.2","plan:8.3","plan:9.0","plan:9.1","plan:9.2","plan:9.3","systool:appetite","systool:assurance","systool:capital","systool:cascade","systool:catalog","systool:channels","systool:commsplan","systool:conflict","systool:culsurvey","systool:dashboard","systool:delphi","systool:exceptions","systool:horizon","systool:iacm","systool:incentive","systool:incidents","systool:irr","systool:lessons","systool:mvv","systool:options","systool:pdca","systool:pestle","systool:policydoc","systool:porter","systool:process","systool:protocol","systool:quant","systool:rca","systool:regwatch","systool:sanction","systool:scenario","systool:sod","systool:speakup","systool:stkreg","systool:swot","systool:tone","systool:training","systool:unified"]);
  const eventKind = id => QUESTION_IDS.has(id) ? 'question' : ACTIVITY_IDS.has(id) ? 'activity' : '';
  const eventIdOK = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(value) && !!eventKind(value);
  const BASELINE_KEY = 'tf_participation_baseline_v1:', INSTANCE_KEY = 'tf_participation_instance_v1:', QUEUE_KEY = 'tf_participation_pending_v1:', QUEUE_LIMIT = 4000;
  // Freeze before boot, route handlers, timers or instrumentation can credit new work.
  const BROWSER_BASELINE_KEY = 'tf_participation_browser_baseline_v1';
  const bootBaseline = (() => {
    try {
      const raw = localStorage.getItem(BROWSER_BASELINE_KEY);
      if (raw !== null) { const saved = JSON.parse(raw); return object(saved) && saved.version === 1 && number(saved.legacyPoints) ? saved.legacyPoints : null; }
      const value = nativeSnapshot().points, encoded = JSON.stringify({version:1,legacyPoints:value});
      localStorage.setItem(BROWSER_BASELINE_KEY,encoded); return localStorage.getItem(BROWSER_BASELINE_KEY) === encoded ? value : null;
    } catch (error) { return null; }
  })();
  let lastSync = 0, syncRun = null, syncEpoch = 0, ownershipHold = false, captureEnabled = false;
  let syncState = { identity: '', phase: 'waiting', at: 0 };
  let captureLoadState = 'loading';
  let serverState = { identity: '', restored: false, snapshot: null, participation: null };
  function resetSyncSession() {
    syncEpoch++; lastSync = 0; ownershipHold = false; captureEnabled = false;
    if (syncRun) syncRun.controller.abort();
    syncRun = null; syncState = { identity: '', phase: 'waiting', at: 0 };
    serverState = { identity: '', restored: false, snapshot: null, participation: null };
    try { window.dispatchEvent(new CustomEvent('tfc:participation-account')); } catch (error) {}
  }
  function baselineFor(u) {
    if (!number(bootBaseline)) return null;
    const key = BASELINE_KEY + u.id + ':' + u.created;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const saved = JSON.parse(raw);
        if (!object(saved) || saved.version !== 1 || !number(saved.legacyPoints) || saved.created !== u.created) return null;
        return saved.legacyPoints;
      }
      const saved = JSON.stringify({ version: 1, created: u.created, legacyPoints: bootBaseline });
      localStorage.setItem(key, saved);
      return localStorage.getItem(key) === saved ? bootBaseline : null;
    } catch (error) { return null; }
  }
  // An unverified remembered identity may reserve its baseline; it cannot send anything.
  if (serverIdentity(user()) && ownsBrowser(user())) baselineFor(user());
  function validSnapshot(value) {
    if (!object(value)) return false;
    const dict = (v, max, key, check) => object(v) && Object.keys(v).length <= max && Object.entries(v).every(([k,x]) => !['__proto__','constructor','prototype'].includes(k) && key(k) && check(x));
    for (const [key, max] of Object.entries({ overall: 100, points: 200000, timeSec: 2000000 })) if (key in value && !number(value[key], max)) return false;
    if ('days' in value && !dict(value.days, 5, k => /^[1-5]$/.test(k), v => number(v,100))) return false;
    if ('items' in value && !dict(value.items, 256, k => /^[A-Za-z0-9_.:-]{1,80}$/.test(k), v => typeof v === 'boolean')) return false;
    if ('scores' in value) {
      if (!object(value.scores)) return false;
      for (const [key,max] of Object.entries({ examBest:100,examAttempts:100000,quiz:100,maturity:5 })) if (key in value.scores && !number(value.scores[key],max)) return false;
      for (const key of ['arena','team']) if (key in value.scores && !dict(value.scores[key],key === 'arena' ? 32 : 100,k => k.length > 0 && k.length <= 80,v => number(v,key === 'arena' ? 100 : 100000))) return false;
    }
    if ('builders' in value && (!Array.isArray(value.builders) || value.builders.length > 20 || !value.builders.every(v => typeof v === 'string' && v.length > 0 && v.length <= 24))) return false;
    if ('at' in value && (!Number.isSafeInteger(value.at) || value.at < 0)) return false;
    if ('revision' in value && (!Number.isSafeInteger(value.revision) || value.revision < 0)) return false;
    return ['days','overall','items','scores','points','timeSec','builders'].some(k => k in value);
  }
  function validParticipation(p) {
    return object(p) && p.version === 1 && /^[0-9a-f]{32}$/.test(p.incarnation || '') &&
      number(p.legacyPoints) && Number.isSafeInteger(p.earnedPoints) && number(p.earnedPoints) && number(p.totalPoints,200000) && p.totalPoints === p.legacyPoints + p.earnedPoints &&
      Number.isSafeInteger(p.questionCount) && number(p.questionCount, QUEUE_LIMIT) && Number.isSafeInteger(p.activityCount) && number(p.activityCount, QUEUE_LIMIT) && p.earnedPoints === p.questionCount + 5 * p.activityCount &&
      Array.isArray(p.completedIds) && p.completedIds.length <= QUEUE_LIMIT && p.completedIds.every(eventIdOK) && new Set(p.completedIds).size === p.completedIds.length && p.completedIds.length === p.questionCount + p.activityCount && p.completedIds.filter(id => eventKind(id) === 'question').length === p.questionCount && p.completedIds.filter(id => eventKind(id) === 'activity').length === p.activityCount &&
      Number.isSafeInteger(p.initializedAt) && p.initializedAt > 0;
  }
  function verifiedResponse(r, u, requireParticipation) {
    const j = r.j, previous = serverState.identity === identityKey(u) && serverState.participation;
    if (previous && object(j.snapshot) && object(serverState.snapshot) && (!Number.isSafeInteger(j.snapshot.revision) || j.snapshot.revision < (serverState.snapshot.revision || 0) || !Number.isSafeInteger(j.snapshot.at) || j.snapshot.at < (serverState.snapshot.at || 0))) return false;
    if (previous && (!validParticipation(j.participation) || j.participation.incarnation !== previous.incarnation || j.participation.legacyPoints !== previous.legacyPoints || j.participation.totalPoints < previous.totalPoints || !previous.completedIds.every(id => j.participation.completedIds.includes(id)))) return false;
    return r.ok && object(j) && j.ok === true && j.authenticated === true && j.learnerId === u.id && activeAccount(j.user,u.id,u.phone) && j.user.created === u.created &&
      (j.snapshot === null ? !requireParticipation && j.participation === null : validSnapshot(j.snapshot)) &&
      (j.participation === null ? !requireParticipation : validParticipation(j.participation) && object(j.snapshot) && j.snapshot.points === j.participation.totalPoints);
  }
  function ownIncarnation(u, p) {
    const key = INSTANCE_KEY + u.id + ':' + u.created;
    try {
      const raw = localStorage.getItem(key);
      const encoded = JSON.stringify({ created:u.created, incarnation:p.incarnation });
      if (raw !== null) { const saved = JSON.parse(raw); return object(saved) && saved.created === u.created && saved.incarnation === p.incarnation; }
      localStorage.setItem(key, encoded); return localStorage.getItem(key) === encoded;
    } catch (error) { return false; }
  }
  function savedSummary() {
    if (serverState.identity !== identityKey(user()) || !serverState.restored) return null;
    return JSON.parse(JSON.stringify({ snapshot: serverState.snapshot, participation: serverState.participation }));
  }
  function snapshot() {
    const local = nativeSnapshot(), saved = savedSummary();
    if (!saved) { if (serverIdentity(user()) && !ownsBrowser(user())) { local.overall = 0; local.points = 0; local.timeSec = 0; for (const day of Object.keys(local.days)) local.days[day] = 0; } return local; }
    const remote = saved.snapshot || {};
    if (!ownsBrowser(user())) { local.overall = 0; local.timeSec = 0; for (const day of Object.keys(local.days)) local.days[day] = 0; }
    // Display monotonic summary values, without hydrating answers, checklists or module stores.
    for (const key of ['overall','timeSec']) if (number(remote[key], key === 'overall' ? 100 : 2000000)) local[key] = Math.max(local[key] || 0, remote[key]);
    for (const [day,pct] of Object.entries(remote.days || {})) local.days[day] = Math.max(local.days[day] || 0,pct);
    local.points = saved.participation ? saved.participation.totalPoints : (number(remote.points,200000) ? remote.points : 0);
    return local;
  }
  function queuePrefix(u, p) { return QUEUE_KEY + u.id + ':' + u.created + ':' + p.incarnation + ':'; }
  function queuedIds(u, p) {
    const prefix = queuePrefix(u,p), ids = [];
    try {
      for (let i=0;i<localStorage.length;i++) { const key = localStorage.key(i); if (!key || !key.startsWith(prefix)) continue; const id = key.slice(prefix.length); if (!eventIdOK(id) || localStorage.getItem(key) !== '1' || ids.length >= QUEUE_LIMIT) return null; ids.push(id); }
      return ids.sort();
    } catch (error) { return null; }
  }
  function activityReady() {
    const u = user();
    return !!(serverIdentity(u) && ownsBrowser(u) && !ownershipHold && captureEnabled && captureLoadState === 'ready' && serverState.identity === identityKey(u) && serverState.restored && serverState.participation && !['signin','blocked','storage'].includes(syncStatus().phase));
  }
  function activityAccount() { const u = user(); return activityReady() ? u.id + ':' + u.created + ':' + serverState.participation.incarnation : ''; }
  function recordActivity(eventId) {
    if (!eventIdOK(eventId) || !activityReady()) return false;
    const u = user(), p = serverState.participation;
    if (p.completedIds.includes(eventId)) return true;
    const ids = queuedIds(u,p), key = queuePrefix(u,p) + eventId;
    if (!ids || (ids.length >= QUEUE_LIMIT && !ids.includes(eventId))) { setSyncState(identityKey(u),'storage'); return false; }
    try { localStorage.setItem(key,'1'); if (localStorage.getItem(key) !== '1') throw Error('queue_not_saved'); }
    catch (error) { setSyncState(identityKey(u),'storage'); return false; }
    setSyncState(identityKey(u),'waiting');
    if (syncRun) syncRun.pending = true; else setTimeout(() => sync(true),0);
    return true;
  }
  function participationSummaryHTML() {
    const saved = savedSummary(), p = saved && saved.participation, snap = saved && saved.snapshot;
    if (!saved) return `<section class="tfc-note" data-tfc-account-summary><b>${L('نقاط المشاركة', 'Participation points')}</b><p>${serverIdentity(user()) ? L('تظهر نقاطك المحفوظة بعد التحقق من الحساب واستعادة ملخصه.', 'Your saved points appear after your account is verified and its summary restored.') : L('سجّل الدخول بحساب الخادم لاحتساب النقاط وحفظها لحسابك.', 'Sign in to a server account to earn and save participation points.')}</p></section>`;
    const pct = snap && number(snap.overall,100) ? snap.overall + '%' : '—';
    return `<section class="tfc-note" data-tfc-account-summary><b>${L('ملخص الحساب المحفوظ على الخادم', 'Saved account summary')} · ${esc((user() || {}).name || '')}</b><p>🏆 ${p ? p.totalPoints : (snap && number(snap.points,200000) ? snap.points : '—')} ${L('نقطة', 'points')} · ${L('التقدّم المحفوظ', 'Saved progress')}: ${pct}</p>${p ? `<p>${L('رصيد سابق محفوظ', 'Preserved earlier balance')}: ${p.legacyPoints} · ${L('نقاط مشاركة مكتسبة', 'Earned participation points')}: ${p.earnedPoints}<br>${L('أسئلة محتسبة', 'Credited questions')}: ${p.questionCount} × 1 · ${L('أنشطة مكتملة', 'Completed activities')}: ${p.activityCount} × 5</p>` : ''}<small>${L('نقطة لكل سؤال مختلف بعد إرساله أو تصحيحه، و5 نقاط لكل نشاط مكتمل، مرة واحدة لكل إنجاز وحساب. درجات الاختبارات منفصلة. تفاصيل الإجابات وقائمة الأنشطة أدناه تخص هذا المتصفح؛ لا يعيد الملخص إجابات الأجهزة الأخرى.', '1 point per unique submitted or checked question and 5 per completed activity, once per achievement and account. Exam grades are separate. Answers and the activity checklist below belong to this browser; the summary does not restore answers from other devices.')}</small><details style="margin-top:6px"><summary>${L('الأنشطة المشمولة', 'Covered activities')}</summary><small>${L('أسئلة محاضرات واختبارات الأكاديمية والتدريب القصير، وأوضاع الساحة عند إكمالها، وأسئلة النظام المصححة وأدواته المحفوظة بعد التحقق، وعلامات إنجاز خطة الدراسة التي يحددها المتدرب. مسودات المصمّمات والحالات والفتح أو كشف الإجابة وحدها لا تضيف نقاطًا.', 'Academy lecture, exam and short-practice questions; completed arena modes; checked System questions and validated saved tools; and learner-reported study-plan check-offs. Builder and case drafts, opening content, or revealing an answer alone do not add points.')}</small></details></section>`;
  }
  function renderSavedSummary() {
    document.querySelectorAll('[data-tfc-account-summary]').forEach(node => { node.outerHTML = participationSummaryHTML(); });
    document.querySelectorAll('[data-tfc-account-overall]').forEach(node => { node.textContent = snapshot().overall + '%'; if (node.parentElement && node.parentElement.classList.contains('tfc-ring')) node.parentElement.style.setProperty('--p', snapshot().overall); });
    render();
  }
  function syncStatus() {
    const u = user(), identity = identityKey(u), owner = progressOwner();
    if (!u || u.local || u.guest) return { phase: 'local', text: L('تقدّمك محفوظ في هذا المتصفح فقط. سجّل الدخول بحساب الخادم لإرسال نتائج هذا المتصفح تلقائيًا إلى المدرب.', 'Progress is saved in this browser only. Sign in to your server account to send this browser’s results to your trainer automatically.') };
    const state = identity && (!ownsBrowser(u) || ownershipHold) ? { phase: 'ownership', at: 0 } : identity && syncState.identity === identity ? syncState : { phase: identity ? 'waiting' : 'signin', at: 0 };
    const text = {
      ownership: L('المزامنة متوقفة: تقدّم هذا المتصفح مرتبط بحساب سابق أو لا يمكن تأكيد صاحبه. ادخل بالحساب الأصلي، أو استخدم ملف متصفح منفصلًا لحساب آخر. لم نحذف تقدّمك أو ننقله.', 'Sync is paused: this browser’s progress belongs to a previous account or its owner cannot be confirmed. Sign in to the original account, or use a separate browser profile for another account. Your progress was not deleted or transferred.'),
      waiting: L('نتائج هذا المتصفح تنتظر تأكيد المزامنة مع المدرب.', 'This browser’s results are waiting for sync confirmation.'),
      restoring: L('جارٍ استعادة ملخص حسابك ونقاطه قبل مزامنة أنشطة هذا المتصفح…', 'Restoring your saved account summary and points before syncing this browser…'),
      saving: L('جارٍ إرسال نتائج هذا المتصفح إلى لوحة المدرب…', 'Sending this browser’s results to the trainer dashboard…'),
      synced: L('تم تأكيد مزامنة النتائج مع لوحة المدرب', 'Results synced with the trainer dashboard') + (state.at ? ' · ' + new Date(state.at).toLocaleTimeString(EN() ? 'en-GB' : 'ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''),
      storage: L('تعذّر تأكيد حفظ قائمة الأنشطة على هذا الجهاز. النقاط غير مؤكدة؛ حرّر مساحة التخزين ثم أعد المحاولة. لم نحذف بياناتك.', 'The activity queue could not be saved safely on this device. Points are not confirmed; free browser storage and retry. Your data was not deleted.'),
      error: L('لم تتأكد المزامنة. تقدّمك محفوظ في هذا المتصفح؛ سنحاول مجددًا تلقائيًا أو اضغط إعادة المحاولة.', 'Sync was not confirmed. Progress is safe in this browser; we’ll retry automatically, or you can retry now.'),
      signin: L('يلزم تسجيل الدخول مجددًا إلى حساب الخادم لإرسال النتائج. تقدّمك في هذا المتصفح محفوظ.', 'Sign in to your server account again to send results. Your progress in this browser is safe.'),
      blocked: L('الحساب موقوف على الخادم ولم تُرسل النتائج. تواصل مع المدرب؛ تقدّمك في هذا المتصفح محفوظ.', 'The server account is blocked, so results were not sent. Contact your trainer; your progress in this browser is safe.')
    };
    return { phase: state.phase, text: text[state.phase] || text.waiting, at: state.at || 0 };
  }
  function syncActions(phase) {
    if (phase === 'local') return `<button type="button" class="tfc-mini" data-tfc="login">${L('لديّ حساب — دخول', 'I have an account — sign in')}</button><button type="button" class="tfc-mini" data-tfc="online">${L('تسجيل حساب على الخادم', 'Register a server account')}</button>`;
    if (phase === 'ownership' && canClaimBrowser(user()) && serverState.restored && serverState.identity === identityKey(user())) return `<button type="button" class="tfc-mini" data-tfc="claim">${L('هذا العمل يخص حسابي — مراجعة الربط', 'This work is mine — review linking')}</button>`;
    if (['signin', 'blocked', 'ownership'].includes(phase)) return `<button type="button" class="tfc-mini" data-tfc="login">${L('تسجيل الدخول', 'Sign in')}</button>`;
    if (['error', 'storage'].includes(phase)) return `<button type="button" class="tfc-mini" data-tfc="sync">${L('إعادة المحاولة', 'Retry sync')}</button>`;
    return '';
  }
  function syncShort(phase) {
    const labels = {
      local: L('محلي — يلزم حساب خادم', 'Local — server sign-in needed'), waiting: L('بانتظار المزامنة', 'Waiting to sync'),
      restoring: L('جارٍ استعادة ملخص حسابك ونقاطه قبل مزامنة أنشطة هذا المتصفح…', 'Restoring your saved account summary and points before syncing this browser…'),
      restoring: L('جارٍ استعادة الحساب…', 'Restoring account…'), storage: L('يلزم إصلاح التخزين', 'Storage needs attention'),
      saving: L('جارٍ الحفظ…', 'Saving…'), synced: L('تمت المزامنة', 'Synced'), error: L('تعذرت المزامنة', 'Sync not confirmed'),
      signin: L('يلزم تسجيل الدخول مجددًا', 'Sign in again'), blocked: L('الحساب موقوف', 'Account blocked'), ownership: L('المزامنة متوقفة — صاحب التقدّم مختلف أو غير مؤكّد', 'Sync paused — progress owner differs or is unconfirmed')
    };
    return labels[phase] || labels.waiting;
  }
  function refreshSyncStatus() {
    const status = syncStatus();
    document.querySelectorAll('[data-tfc-sync]').forEach(node => { node.textContent = status.text; node.dataset.phase = status.phase; });
    document.querySelectorAll('[data-tfc-sync-short]').forEach(node => { node.textContent = syncShort(status.phase); node.title = status.text; node.dataset.phase = status.phase; });
    document.querySelectorAll('[data-tfc-sync-actions]').forEach(node => { node.innerHTML = syncActions(status.phase); });
    document.querySelectorAll('[data-tfc-capture]').forEach(node => { node.textContent = captureNotice(); });
  }
  function setSyncState(identity, phase, at) { syncState = { identity, phase, at: at || 0 }; refreshSyncStatus(); }
  function captureNotice() { return captureLoadState === 'ready' ? (captureEnabled && ownsBrowser(user()) && !ownershipHold && !['blocked','signin','storage'].includes(syncState.phase) ? L('احتساب المشاركة التلقائي جاهز.', 'Automatic participation scoring is ready.') : L('احتساب النقاط غير جاهز بعد. انتظر تأكيد حسابك وربط عمل هذا المتصفح قبل إرسال الإجابات.', 'Points capture is not ready yet. Wait for your account and this browser’s ownership to be confirmed before submitting answers.')) : captureLoadState === 'error' ? L('تعذّر تحميل احتساب الأنشطة. أعد تحميل الصفحة قبل البدء؛ لا يمكن تأكيد احتساب المشاركات الجديدة.', 'Activity scoring could not load. Reload before starting; new participation cannot be confirmed.') : L('جارٍ تحميل احتساب الأنشطة؛ انتظر اكتمال التهيئة قبل البدء.', 'Loading activity scoring; wait for initialization before starting.'); }
  function syncBanner() {
    const status = syncStatus();
    return `<div class="tfc-note"><span data-tfc-sync data-phase="${status.phase}" role="status" aria-live="polite">${esc(status.text)}</span><span data-tfc-sync-actions>${syncActions(status.phase)}</span><small data-tfc-capture role="status" style="display:block;margin-top:4px">${esc(captureNotice())}</small><small style="display:block;margin-top:4px">${L('تُزامَن ملخصات النتائج للمدرب؛ تفاصيل الأنشطة تبقى في هذا المتصفح. سجّل الدخول وانتظر استعادة الحساب لاحتساب نقاط المشاركة تلقائيًا.', 'Result summaries sync to your trainer; activity details remain in this browser. Sign in and wait for account restoration before earning automatic points.')}</small></div>`;
  }
  function receiptCovers(receipt, sent) {
    const coversNumbers = (received, submitted) => object(received) && Object.keys(submitted).every(key => number(received[key],2000000) && received[key] >= submitted[key]);
    // Points are server-owned after initialization; never compare them with the retired weighted formula.
    if (!validSnapshot(receipt) || !coversNumbers(receipt, { overall: sent.overall, timeSec: sent.timeSec }) || !coversNumbers(receipt.days, sent.days)) return false;
    if (!object(receipt.items) || !Object.keys(sent.items).every(key => typeof receipt.items[key] === 'boolean' && (!sent.items[key] || receipt.items[key]))) return false;
    if (!object(receipt.scores) || !coversNumbers(receipt.scores, { examBest: sent.scores.examBest, examAttempts: sent.scores.examAttempts, quiz: sent.scores.quiz, maturity: sent.scores.maturity })) return false;
    if (!coversNumbers(receipt.scores.arena, sent.scores.arena) || !coversNumbers(receipt.scores.team, sent.scores.team)) return false;
    return Array.isArray(receipt.builders) && sent.builders.every(value => receipt.builders.includes(value));
  }
  const snapshotKey = value => JSON.stringify(Object.assign({}, value, { at: 0, points: 0 }));
  async function sync(force, keepalive) {
    const u = user(), identity = identityKey(u);
    if (!identity) { refreshSyncStatus(); return false; }
    if (syncState.identity === identity && ['signin','blocked'].includes(syncState.phase)) return false;
    if (syncRun) { if (force) syncRun.pending = true; return false; }
    if (!force && Date.now() - lastSync < 20000) return false;
    const run = { controller: new AbortController(), epoch: syncEpoch, pending: false }; syncRun = run;
    const current = () => syncEpoch === run.epoch && identityKey(user()) === identity;
    const owned = () => current() && ownsBrowser(u) && !ownershipHold;
    const reject = r => {
      if (r.status === 403 && r.j.error === 'account_blocked') setSyncState(identity,'blocked');
      else if ([401,404].includes(r.status) || ['bad_token','bad_request'].includes(r.j.error)) setSyncState(identity,'signin');
      else { if (r.j.error === 'stale_participation_incarnation') ownershipHold = true; setSyncState(identity,ownershipHold ? 'ownership' : 'error'); }
      return false;
    };
    const accept = r => { serverState = { identity, restored:true, snapshot:r.j.snapshot, participation:r.j.participation }; renderSavedSummary(); };
    try {
      if (!serverState.restored || serverState.identity !== identity) {
        setSyncState(identity,'restoring');
        const restored = await api('/api/progress', { signal:run.controller.signal, headers:{'content-type':'text/plain','x-learner-id':u.id,authorization:'Bearer ' + u.token} });
        if (!current()) return false;
        if (!verifiedResponse(restored,u,false)) return reject(restored);
        accept(restored);
      }
      if (!owned()) { refreshSyncStatus(); return false; }
      if (!serverState.participation) {
        const baseline = baselineFor(u);
        if (baseline === null) { setSyncState(identity,'storage'); return false; }
        const initialized = await api('/api/participation/init',{method:'POST',signal:run.controller.signal,body:JSON.stringify({id:u.id,token:u.token,version:1,legacyPoints:baseline})});
        if (!owned()) return false;
        if (!verifiedResponse(initialized,u,true)) return reject(initialized);
        accept(initialized);
      }
      if (!ownIncarnation(u,serverState.participation)) { ownershipHold = true; setSyncState(identity,'ownership'); return false; }
      captureEnabled = true; setSyncState(identity,'saving');
      try { window.dispatchEvent(new CustomEvent('tfc:participation-ready')); } catch (error) {}
      const p = serverState.participation, pending = queuedIds(u,p);
      if (!pending) { setSyncState(identity,'storage'); return false; }
      // Individual durable keys avoid array read/modify/write races between tabs. Clear only server-acknowledged IDs.
      const batch = pending.slice(0,50);
      if (batch.length) {
        const receipt = await api('/api/participation',{method:'POST',signal:run.controller.signal,keepalive:!!keepalive,body:JSON.stringify({id:u.id,token:u.token,version:1,incarnation:p.incarnation,eventIds:batch})});
        if (!owned()) return false;
        if (!verifiedResponse(receipt,u,true) || receipt.j.participation.incarnation !== p.incarnation || !batch.every(id => receipt.j.participation.completedIds.includes(id))) return reject(receipt);
        accept(receipt);
        try { for (const id of batch) localStorage.removeItem(queuePrefix(u,p) + id); }
        catch (error) { setSyncState(identity,'storage'); return false; }
      }
      const sent = nativeSnapshot(); sent.points = serverState.participation.totalPoints;
      const r = await api('/api/progress',{method:'POST',signal:run.controller.signal,keepalive:!!keepalive,body:JSON.stringify({id:u.id,token:u.token,snapshot:sent})});
      if (!owned()) return false;
      if (!verifiedResponse(r,u,true) || r.j.participation.incarnation !== p.incarnation || !receiptCovers(r.j.snapshot,sent) || !Number.isSafeInteger(r.j.snapshot.at) || r.j.snapshot.at <= 0 || r.j.snapshot.at !== r.j.at || !Number.isSafeInteger(r.j.snapshot.revision) || r.j.snapshot.revision < 1) return reject(r);
      accept(r); lastSync = Date.now(); wr(LS_U,Object.assign({},user(),{lastSync}));
      const remaining = queuedIds(u,serverState.participation);
      if (!remaining) { setSyncState(identity,'storage'); return false; }
      const changed = snapshotKey(nativeSnapshot()) !== snapshotKey(sent) || remaining.length > 0;
      if (changed) run.pending = true;
      setSyncState(identity,changed ? 'waiting' : 'synced',lastSync); return true;
    } catch (error) { if (current()) setSyncState(identity,'error'); return false; }
    finally { if (syncRun === run) { syncRun = null; if (run.pending && owned() && !['signin','blocked','ownership','error','storage'].includes(syncStatus().phase)) setTimeout(() => { if (owned()) sync(true); },0); } }
  }
  window.addEventListener('storage', event => {
    if (event.key && event.key.startsWith(QUEUE_KEY)) { if (activityReady()) sync(true); return; }
    if (event.key !== LS_U && event.key !== LS_OWNER && event.key !== LS_OWNER_CREATED && event.key !== LS_UNCLAIMED && event.key !== null) return;
    if (event.key === LS_U) {
      let previous = null; try { previous = JSON.parse(event.oldValue); } catch (error) {}
      const currentUser = user();
      if (identityKey(previous) === identityKey(currentUser) && (previous && previous.id) === (currentUser && currentUser.id)) return;
    }
    resetSyncSession(); refreshSyncStatus(); renderSavedSummary(); sync(true);
  });
  /* ───── إشعارات المدرب (شبه لحظية) ───── */
  function notifBox() { let b = document.getElementById('tfNotifs'); if (!b) { b = document.createElement('div'); b.id = 'tfNotifs'; b.style.cssText = 'position:fixed;top:14px;inset-inline-end:14px;z-index:2147483600;display:flex;flex-direction:column;gap:8px;max-width:360px'; document.body.appendChild(b); } return b; }
  function showNotif(n) {
    const box = notifBox(); const d = document.createElement('div');
    d.style.cssText = 'background:#0A1B3D;color:#fff;border-inline-start:4px solid #E2B85A;border-radius:12px;padding:12px 14px;box-shadow:0 12px 30px -10px rgba(0,0,0,.5);font-family:Rubik,Tahoma,sans-serif;animation:tfnin .3s';
    d.innerHTML = `<div style="display:flex;gap:8px;align-items:start"><span style="font-size:18px">🔔</span><div style="flex:1"><b style="color:#E2B85A;font-size:13px">${esc(n.title || 'إشعار من المدرب')}</b><div style="font-size:13px;margin-top:3px;line-height:1.6">${esc(n.body || '')}</div><div style="font-size:10px;color:#9fb0c9;margin-top:4px">${new Date(n.ts).toLocaleTimeString(EN() ? 'en-GB' : 'ar-SA', { hour: '2-digit', minute: '2-digit' })}</div></div><button style="background:none;border:0;color:#9fb0c9;cursor:pointer;font-size:16px" aria-label="إغلاق">×</button></div>`;
    d.querySelector('button').onclick = () => d.remove(); box.appendChild(d);
    setTimeout(() => { d.style.transition = '.4s'; d.style.opacity = '0'; setTimeout(() => d.remove(), 400); }, 12000);
  }
  async function pollNotifs() {
    const u = user(), identity = identityKey(u), epoch = syncEpoch; if (!identity || ['signin', 'blocked'].includes(syncStatus().phase)) return;
    try {
      const since = +(localStorage.getItem('tf_notif_seen') || 0);
      const r = await api(`/api/notify?since=${since}`, { headers: { 'content-type': 'text/plain', 'x-learner-id': u.id, authorization: 'Bearer ' + u.token } });
      if (epoch !== syncEpoch || identityKey(user()) !== identity) return;
      if (r.ok && r.j.ok === true && r.j.authenticated === true && r.j.learnerId === u.id && activeAccount(r.j.user, u.id, u.phone) && Array.isArray(r.j.notifs) && r.j.notifs.length) {
        r.j.notifs.slice().sort((a, b) => a.ts - b.ts).forEach(showNotif);
        const maxTs = Math.max(...r.j.notifs.map(n => n.ts));
        localStorage.setItem('tf_notif_seen', String(maxTs));
      }
    } catch (e) {}
  }
  function mark(k, v) { const s = st(); s.done = s.done || {}; if (v === false) delete s.done[k]; else s.done[k] = Date.now(); wr(LS_C, s); render(); sync(true); }
  function seen(k) { const s = st(); s.seen = s.seen || {}; if (!s.seen[k]) { s.seen[k] = Date.now(); wr(LS_C, s); render(); } }

  /* ───── نافذة التسجيل ───── */
  function regModal(opts) {
    opts = opts || {}; if (document.getElementById('tfReg')) return;
    const c = cfg(); const ov = document.createElement('div'); ov.id = 'tfReg';
    ov.innerHTML = `<div class="tfr-box" role="dialog" aria-modal="true">
      <div class="tfr-h"><div class="tfr-k">TRACK FORD · GRCP COURSE</div><h2>${opts.login ? 'تسجيل الدخول' : 'تسجيل المتدرب'}</h2><p>ادخل إلى حساب الخادم أو سجّل حسابًا جديدًا لإرسال نتائج هذا المتصفح إلى المدرب. لن تُرسل بيانات نموذج التسجيل إلا بعد الضغط على دخول أو تسجيل.</p></div>
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
    // A local profile is a draft, never an automatically uploaded account.
    const saved = user();
    if (saved && saved.local && !saved.guest) {
      for (const key of ['name', 'phone', 'email', 'group', 'org', 'role']) {
        const field = form.elements.namedItem(key);
        if (!field || typeof saved[key] !== 'string') continue;
        if (key === 'group' && !Array.from(field.options).some(option => option.value === saved[key])) {
          const option = document.createElement('option'); option.value = saved[key]; option.textContent = saved[key]; field.appendChild(option);
        }
        field.value = saved[key];
      }
    }
    let active = true, submitting = false, revision = 0, pending = null;
    const cancelPending = () => { revision++; submitting = false; if (pending) pending.abort(); pending = null; ov.querySelector('#tfRegGo').disabled = false; };
    const setMode = login => { cancelPending(); msg.textContent = ''; ov.querySelectorAll('.reg-only').forEach(e => e.style.display = login ? 'none' : ''); ov.querySelector('h2').textContent = login ? 'تسجيل الدخول' : 'تسجيل المتدرب'; ov.querySelector('#tfRegGo').textContent = login ? 'دخول' : 'تسجيل والبدء'; ov.querySelector('#tfRegSwitch').textContent = login ? 'ليس لديّ حساب — تسجيل جديد' : 'لديّ حساب — دخول'; form.dataset.login = login ? '1' : ''; form.querySelector('[name=name]').required = !login; };
    setMode(!!opts.login);
    ov.querySelector('#tfRegSwitch').onclick = () => setMode(!form.dataset.login);
    const close = () => { active = false; cancelPending(); ov.remove(); document.body.style.overflow = ''; render(); };
    ov.querySelector('#tfRegGuest').onclick = () => { setUser({ id: 'guest', name: 'ضيف', guest: true, local: true, created: Date.now() }); close(); };
    form.onsubmit = async e => {
      e.preventDefault(); if (!active || submitting) return;
      const fd = Object.fromEntries(new FormData(form).entries()), login = !!form.dataset.login;
      const attempt = ++revision, startingEpoch = syncEpoch, controller = new AbortController(); pending = controller; submitting = true;
      const current = () => active && revision === attempt && syncEpoch === startingEpoch && document.getElementById('tfReg') === ov;
      msg.textContent = 'جارٍ الاتصال…'; ov.querySelector('#tfRegGo').disabled = true;
      try {
        // The explicit form submission always tries the real service; a failed health probe must not create a local account.
        const r = await api('/api/reg', { method: 'POST', signal: controller.signal, body: JSON.stringify(Object.assign({ action: login ? 'login' : 'register' }, fd)) });
        if (!current()) return;
        if (!r.ok || r.j.ok !== true) {
          const E = { account_blocked: 'الحساب موقوف. تواصل مع المدرب؛ تقدّمك في هذا المتصفح محفوظ.', rate_limited: 'محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا؛ تقدّمك محفوظ.', bad_phone: 'رقم الجوال غير صحيح (05xxxxxxxx).', bad_pin: login ? 'الرقم السري غير صحيح.' : 'الرقم السري 4 إلى 6 أرقام.', bad_name: 'اكتب الاسم الكامل.', exists: 'هذا الجوال مسجّل برقم سري مختلف — اختر «لديّ حساب».', not_found: 'لا يوجد حساب بهذا الجوال — سجّل حسابًا جديدًا.' };
          msg.textContent = E[r.j.error] || 'لم يكتمل التسجيل على الخادم. بياناتك وتقدّمك على هذا الجهاز محفوظان؛ حاول مجددًا.'; return;
        }
        if (!r.j.user || typeof r.j.user !== 'object' || Array.isArray(r.j.user) || r.j.local === true || r.j.user.local === true || r.j.user.guest === true || !/^[0-9a-f]{16}$/.test(r.j.user.id || '') || !/^[0-9a-f]{40}$/.test(r.j.token || '') || !activeAccount(r.j.user, r.j.user.id, fd.phone)) {
          msg.textContent = 'لم نتمكّن من تأكيد التسجيل على الخادم. بياناتك وتقدّمك محفوظان؛ حاول مجددًا.'; return;
        }
        const u = Object.assign({}, r.j.user, { token: r.j.token });
        if (progressOwner() === u.id && progressCreated() === null) { try { localStorage.setItem(LS_UNCLAIMED,'1'); } catch (error) { ownerUnavailable = true; } }
        if (!progressOwner()) {
          if (browserHasWork()) { try { localStorage.setItem(LS_UNCLAIMED,'1'); } catch (error) { ownerUnavailable = true; } }
          else rememberOwner(u);
        }
        setUser(u); close(); toast(r.j.created ? `أهلًا ${u.name} — تم تسجيلك في الدورة.` : `أهلًا بعودتك ${u.name}.`); sync(true);
      } catch (error) {
        if (current()) msg.textContent = 'تعذّر الاتصال بالخادم ولم يكتمل التسجيل. بياناتك وتقدّمك على هذا الجهاز محفوظان؛ حاول مجددًا.';
      } finally {
        if (active && revision === attempt && document.getElementById('tfReg') === ov) { submitting = false; pending = null; ov.querySelector('#tfRegGo').disabled = false; if (syncEpoch !== startingEpoch) msg.textContent = 'تغيّر الحساب أثناء الطلب. لم نعتمد الرد السابق؛ راجع الحساب ثم حاول مجددًا.'; }
      }
    };
  }
  function toast(m) { let t = document.getElementById('tfToast'); if (!t) { t = document.createElement('div'); t.id = 'tfToast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3200); }
  function signOut() { preserveKnownOwner(user()); resetSyncSession(); try { localStorage.removeItem(LS_U); localStorage.removeItem('grcpUser'); } catch (e) {} location.reload(); }

  /* ───── شريحة المستخدم (تُعرض في شريط التكامل) ───── */
  function chip() {
    const u = user(), t = today(), snap = snapshot(), status = syncStatus();
    const dayTxt = !scheduled() ? L('النظام مفتوح — كل الأيام متاحة', 'Open — all days available') : t === 0 ? L('قبل بدء الدورة', 'Before the course') : t === 6 ? L('ما بعد الدورة', 'After the course') : L(`اليوم ${t} · ${DAYS[t - 1].ar}`, `Day ${t} · ${DAYS[t - 1].en}`);
    return `<span class="tfc-chip">${u ? `👤 <b>${esc(u.name)}</b>${u.group && u.group !== 'عام' ? ` · ${esc(u.group)}` : ''}${u.local ? ' <small>' + L('(محلي)', '(local)') + '</small>' : ''}` : '👤 ' + L('غير مسجّل', 'Not registered')}</span><span class="tfc-chip day">📅 ${dayTxt}</span><span class="tfc-chip">📈 ${L('تقدّمي', 'My progress')} ${snap.overall}%</span><a class="tfc-link" href="${A}#/course">${L('مسار الدورة', 'Course track')}</a><a class="tfc-link" href="trainer.html">${L('دخول المدرب', 'Trainer')}</a><span class="tfc-chip" data-tfc-sync-short data-phase="${status.phase}" title="${esc(status.text)}" role="status" aria-live="polite">${esc(syncShort(status.phase))}</span><span data-tfc-sync-actions>${syncActions(status.phase)}</span>${u ? `<button type="button" class="tfc-out" data-tfc="out">${L('خروج', 'Sign out')}</button>` : `<button type="button" class="tfc-out" data-tfc="reg">${L('تسجيل', 'Register')}</button>`}`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-tfc]'); if (!b) return; if (b.dataset.tfc === 'out') { if (confirm('تسجيل الخروج من هذا الجهاز؟')) signOut(); } else if (b.dataset.tfc === 'claim') claimBrowserWork(); else if (b.dataset.tfc === 'sync') sync(true); else regModal({ login: b.dataset.tfc === 'login' }); });

  /* ───── مسار الدورة (واجهة) ───── */
  function mountTrack(host, sel) {
    if (!host) return; const u = user(), t = today(), sched = scheduled(), cur = sel || Math.max(1, Math.min(5, t || 1)); const d = DAYS[cur - 1], p = dayProgress(d), snap = snapshot();
    const startD = new Date(cfg().start + 'T00:00:00'); const dateOf = n => { if (!sched || isNaN(startD)) return ''; const x = new Date(startD); x.setDate(x.getDate() + n - 1); return x.toLocaleDateString(EN() ? 'en-GB' : 'ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }); }; const dn = x => EN() ? x.en : x.ar;
    host.innerHTML = `<div class="wrap tfc-wrap">
      <section class="tfc-hero" style="--c:${d.col}"><div><div class="tfc-k">GRCP® COURSE · TRACK FORD · ${sched ? (t ? (t === 6 ? 'AFTER COURSE' : 'DAY ' + t) : 'PRE-COURSE') : 'SELF-PACED'}</div>
        <h2>${u ? L(`أهلًا ${esc(u.name)}`, `Welcome ${esc(u.name)}`) : L('أهلًا بك في مسار الدورة', 'Welcome to the course track')}${u && u.group && u.group !== 'عام' ? ` <small>${esc(u.group)}</small>` : ''}</h2>
        <p>${!sched ? L('النظام مفتوح لأي تاريخ: الأيام الخمسة متاحة بالكامل — تنقّل بينها ونفّذ المحاضرات والأنشطة والألعاب والمصمّمات بأي ترتيب وبأي وقت يناسبك.', 'Open for any date: all five days are fully available — move between them and work through the lectures, activities, games and builders in any order, any time.') : t === 0 ? L(`تبدأ الدورة ${dateOf(1)}. والأيام كلها متاحة للاطّلاع الآن.`, `The course starts ${dateOf(1)}. All days are available to preview now.`) : t === 6 ? L('انتهت أيام الدورة — كل الأيام متاحة للمراجعة، والتركيز الآن على الاختبار الحقيقي.', 'Course days are over — all days are open for review; focus now on the real exam.') : L(`اليوم هو اليوم ${t} من 5: <b>${DAYS[t - 1].ar}</b>. كل الأيام متاحة؛ ركّز على بنود يومك ثم انتقل كما تحب.`, `Today is Day ${t} of 5: <b>${DAYS[t - 1].en}</b>. All days are open; focus on today's items then move freely.`)}</p>
        ${syncBanner()}<div style="margin-top:10px">${participationSummaryHTML()}</div>${u && u.local ? '<button type="button" class="tfc-mini" id="tfcCode">نسخ كود تقدّمي للمدرب</button>' : ''}
        </div><div class="tfc-ring" style="--p:${snap.overall}"><b data-tfc-account-overall>${snap.overall}%</b><span>${L('ملخص التقدّم', 'Progress summary')}</span></div></section>
      <nav class="tfc-days">${DAYS.map(x => { const q = dayProgress(x); const dt = dateOf(x.n); return `<button type="button" data-d="${x.n}" class="${x.n === cur ? 'on' : ''} ${x.n === t ? 'today' : ''}" style="--c:${x.col}"><span class="dn">${x.n === t ? '📍' : q.pct === 100 ? '✅' : x.n}</span><span class="dt">${L('اليوم', 'Day')} ${x.n}</span><span class="dd">${dn(x)}</span><span class="dp"><i style="width:${q.pct}%"></i></span><small>${dt ? dt + ' · ' : ''}${q.pct}%</small></button>`; }).join('')}</nav>
      <section class="tfc-day" style="--c:${d.col}"><div class="tfc-dh"><h3>${L('اليوم', 'Day')} ${d.n} — ${dn(d)} <span class="en">${EN() ? d.ar : d.en}</span></h3><div class="tfc-dp">${p.done} / ${p.total} ${L('مكتمل في هذا المتصفح', 'done in this browser')}</div></div>
        <ol class="tfc-items">${d.items.map((i, k) => { let ok = false; try { ok = !!i.chk(); } catch (e) {} return `<li class="${ok ? 'ok' : ''}"><span class="num">${ok ? '✓' : k + 1}</span><div class="tx"><a href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(EN() && i.te ? i.te : i.t)}</a>${i.manual ? `<button type="button" class="tfc-mini" data-mark="${i.k}" data-v="${ok ? '0' : '1'}">${ok ? L('إلغاء التعليم', 'Unmark') : L('تم ✓', 'Done ✓')}</button>` : ''}</div><a class="go" href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${ok ? L('مراجعة', 'Review') : L('ابدأ', 'Start')} ${L('←', '→')}</a></li>`; }).join('')}</ol>
        <div class="tfc-foot">${d.n === 5 ? L('<b>مشروع المجموعة:</b> كل مجموعة تعرض خريطة GRC لمنظمة مختارة (الملف في النظام + التقييم في المقيّم + فيديو المحاكاة) خلال 10 دقائق.', '<b>Group project:</b> each group presents a GRC map of a chosen organisation (System profile + Navigator assessment + simulation video) in 10 minutes.') : L('<b>نصيحة:</b> أكمل 80% من بنود هذا المحور قبل الانتقال للتالي لأفضل استفادة — المدرب يرى نسبتك. كل المحاور متاحة في أي وقت.', '<b>Tip:</b> complete 80% of this topic before moving on for best results — your trainer sees your percentage. All topics are available any time.')}</div></section>
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
  @keyframes tfnin{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  .tfc-chip{background:#fff;border:1px solid #E7DCC6;border-radius:999px;padding:2px 10px;font-size:12.5px}.tfc-chip.day{background:#0A1B3D;color:#fff;border-color:#0A1B3D}.tfc-link{color:#0A1B3D;font-weight:800;border-bottom:1px dashed #C9973B;text-decoration:none}.tfc-out{border:0;background:transparent;color:#5B6476;font:inherit;font-size:12px;cursor:pointer;text-decoration:underline}
  .tfc-wrap{padding-block:18px;font-family:Rubik,Tahoma,system-ui,sans-serif}.tfc-hero{display:flex;gap:18px;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#0A1B3D,#13295A);color:#fff;border-radius:18px;padding:24px 28px;margin-bottom:14px;border-inline-start:8px solid var(--c)}.tfc-hero h2{margin:4px 0;font-size:26px}.tfc-hero h2 small{font-size:14px;color:#E2B85A}.tfc-hero p{color:#D9C9A4;margin:0 0 10px;max-width:720px}.tfc-k{font-size:11px;letter-spacing:.14em;color:#E2B85A;font-weight:700}.tfc-note{font-size:13px;color:#fff;background:rgba(255,255,255,.1);border-radius:10px;padding:6px 10px;display:inline-block}
  .tfc-ring{width:130px;height:130px;border-radius:50%;background:conic-gradient(#E2B85A calc(var(--p)*1%),rgba(255,255,255,.15) 0);display:grid;place-items:center;flex:0 0 auto}.tfc-ring b{font-size:30px;font-family:Montserrat,Arial}.tfc-ring span{font-size:11px;color:#D9C9A4;text-align:center}
  .tfc-days{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px}@media(max-width:900px){.tfc-days{grid-template-columns:repeat(2,1fr)}}.tfc-days button{text-align:start;border:2px solid #E7DCC6;background:#fff;border-radius:14px;padding:12px;font:inherit;cursor:pointer;display:grid;gap:3px;border-top:5px solid var(--c)}.tfc-days button.on{border-color:var(--c);box-shadow:0 10px 24px -14px rgba(10,27,61,.5)}.tfc-days button.lock{opacity:.55;cursor:not-allowed;background:#F6F6F6}.tfc-days button.today .dt::after{content:' · اليوم';color:#B91C1C;font-size:11px}.tfc-days .dn{font-size:20px;font-weight:800;color:var(--c)}.tfc-days .dt{font-weight:800;color:#0A1B3D}.tfc-days .dd{font-size:12.5px;color:#1B2436;min-height:36px}.tfc-days .dp{height:6px;background:#F3EBDA;border-radius:3px;overflow:hidden}.tfc-days .dp i{display:block;height:100%;background:var(--c)}.tfc-days small{color:#5B6476;font-size:11px}
  .tfc-day{background:#fff;border:1px solid #E7DCC6;border-radius:16px;padding:18px 20px;border-inline-start:6px solid var(--c)}.tfc-dh{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}.tfc-dh h3{margin:0;font-size:20px;color:#0A1B3D}.tfc-dh .en{font-size:12px;color:#5B6476;font-family:Montserrat,Arial}.tfc-dp{background:var(--c);color:#fff;border-radius:999px;padding:3px 12px;font-weight:700;font-size:13px}
  .tfc-items{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:8px}.tfc-items li{display:flex;align-items:center;gap:12px;border:1px solid #E7DCC6;border-radius:12px;padding:10px 12px;background:#FBF8F2}.tfc-items li.ok{background:#ECFDF5;border-color:#A7F3D0}.tfc-items .num{width:30px;height:30px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:800;flex:0 0 auto}.tfc-items li.ok .num{background:#047857}.tfc-items .tx{flex:1}.tfc-items .tx a{color:#0A1B3D;text-decoration:none;font-weight:600}.tfc-items .go{color:#fff;background:#0A1B3D;border-radius:999px;padding:5px 12px;text-decoration:none;font-size:13px;font-weight:700}.tfc-mini{margin-inline-start:8px;border:1px solid #C9973B;background:#fff;border-radius:999px;padding:2px 10px;font:inherit;font-size:12px;cursor:pointer}.tfc-foot{margin-top:14px;font-size:13px;color:#5B6476;background:#F6EEDC;border-radius:10px;padding:10px 12px}`;
  document.head.appendChild(css);

  /* ───── الإقلاع ───── */
  function render() { try { window.TFB && window.TFB.render(); } catch (e) {} refreshSyncStatus(); }
  async function loadServerConfig() {
    try {
      const r = await api('/api/progress'), incoming = r.j && r.j.config;
      if (!r.ok || r.j.ok !== true || !incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return;
      const patch = {};
      if (typeof incoming.start === 'string' && (incoming.start === '' || /^\d{4}-\d{2}-\d{2}$/.test(incoming.start) && !isNaN(new Date(incoming.start + 'T00:00:00').getTime()))) patch.start = incoming.start;
      if (Array.isArray(incoming.groups) && incoming.groups.length > 0 && incoming.groups.length <= 100 && incoming.groups.every(group => typeof group === 'string' && group.trim() === group && group.length > 0 && group.length <= 40)) patch.groups = incoming.groups.slice();
      if (Object.keys(patch).length) { wr(LS_CFG, Object.assign(cfg(), patch)); render(); }
    } catch (error) {}
  }
  function boot() {
    if (page === 'trainer') return;
    if (/[?&]all=1/.test(location.search)) wr('tf_unlock', 1);
    if (/[?&]trainer=1/.test(location.search)) wr('tf_unlock', 1);
    if (!user() && page !== 'index') setTimeout(() => regModal(), 600);
    if (page === 'academy') { window.addEventListener('hashchange', () => setTimeout(guardAcademyRoute, 30)); setTimeout(guardAcademyRoute, 150); if (user() && !user().guest && (location.hash === '' || location.hash === '#/') && !sessionStorage.getItem('tf_home_seen')) { sessionStorage.setItem('tf_home_seen', '1'); location.hash = '#/course'; } }
    if (window.I18N && window.I18N.onChange) window.I18N.onChange(() => { render(); const h = document.getElementById('courseHost'); if (h) mountTrack(h); const ah = document.getElementById('arenaHost'); if (ah && window.TFArena) window.TFArena.mount(ah, (location.hash.split('/')[2] || '')); setTimeout(guardAcademyRoute, 50); });
    loadServerConfig(); sync(true); setInterval(() => { if (!document.hidden) sync(); }, 20000);   // نبضة حضور ومزامنة شبه لحظية
    if (!localStorage.getItem('tf_notif_seen')) { const u = user(); if (u && !u.local) localStorage.setItem('tf_notif_seen', String(u.created || Date.now())); }
    setTimeout(pollNotifs, 6000); setInterval(() => { if (!document.hidden) pollNotifs(); }, 20000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) sync(true); else { sync(); pollNotifs(); } });
    window.addEventListener('beforeunload', () => { sync(true, true); });
  }
  window.TFC = { DAYS, cfg, scheduled, EN, L, today, dayIndex, unlocked, user, setUser, regModal, snapshot, savedSummary, activityReady, activityAccount, recordActivity, dayProgress, sync, syncStatus, mark, seen, chip, mountTrack, signOut, dayOfLecture, toast };
  if (page !== 'trainer') {
    const capture = document.createElement('script'); capture.src = new URL('tf-activity.js', document.currentScript && document.currentScript.src || location.href).href; capture.async = true;
    const captureLoaded = ok => { captureLoadState = ok ? 'ready' : 'error'; document.querySelectorAll('[data-tfc-capture]').forEach(node => { node.textContent = captureNotice(); }); if (!ok) toast(captureNotice()); else if (activityReady()) window.dispatchEvent(new CustomEvent('tfc:participation-ready')); };
    capture.onload = () => captureLoaded(!!(window.TFActivity && window.TFActivity.version === 1 && window.TFActivity.ready === true && typeof window.TFActivity.account === 'function' && typeof window.TFActivity.record === 'function'));
    capture.onerror = () => captureLoaded(false);
    document.head.appendChild(capture);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
