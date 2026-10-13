/* Track Ford GRC — مسار الدورة الموحّد + تسجيل المتدربين + مزامنة التقدّم
   - الدورة 5 أيام (7–10 مساءً). يظهر للمتدرب يوم الدورة الحالي فقط (والأيام السابقة للمراجعة)، والأيام القادمة مقفلة.
   - التسجيل حقيقي عبر /api/reg (Railway). يتطلب التسجيل والمزامنة اتصالًا بالخادم؛ وضع الضيف للتصفح فقط.
   - التقدّم يُجمع تلقائيًا من كل الوحدات (محاضرات، أنشطة، ألعاب، أسئلة، ساحة الذكاء، النظام، المقيّم) ويُزامَن مع لوحة المدرب. */
(function () {
  'use strict';
  const LS_U = 'tf_user', LS_C = 'tf_course', LS_CFG = 'tf_course_cfg';
  let currentUser = null, restored = false, authenticated = false, authEpoch = 0;
  let resolveSessionReady; const sessionReady = new Promise(resolve => { resolveSessionReady = resolve; });
  let restoredSnapshot = {}, workspaceAllowed = false, syncMessage = '', guestMode = false;
  const rawRead = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch (e) { return d; } };
  const scopedKey = k => ['tf_course', 'tf_time'].includes(k) ? k + ':' + encodeURIComponent(currentUser ? currentUser.id : 'guest') : k;
  const artifactKey = k => /^(grcp(LQ|D1|ERP|Game|Arena|Hist)|tf-grc-navigator|alsaeedGRC|tf_org_v1|tf_builders)/.test(k);
  const rd = (k, d) => artifactKey(k) && !workspaceAllowed ? d : rawRead(scopedKey(k), d);
  const wr = (k, v) => { try { localStorage.setItem(scopedKey(k), JSON.stringify(v)); } catch (e) {} };
  function bindWorkspace() {
    const owner = localStorage.getItem('tf_workspace_owner');
    const hasLegacyWork = Object.keys(localStorage).some(k => artifactKey(k) || k === 'tf_course' || k === 'tf_time');
    workspaceAllowed = owner === currentUser.id || (!owner && !hasLegacyWork);
    if (workspaceAllowed) localStorage.setItem('tf_workspace_owner', currentUser.id);
  }
  function canClaimWorkspace() { try { return authenticated && restored && !workspaceAllowed && !localStorage.getItem('tf_workspace_owner'); } catch (e) { return false; } }
  function claimWorkspace() {
    if (!canClaimWorkspace()) return false;
    if (!confirm('هل تؤكد أن جميع أعمال هذا المتصفح تخصك، وتريد ربط ملخص تقدّمها بحساب ' + currentUser.name + ' ومشاركته مع المدرب؟ سيبقى محتوى الملفات على هذا الجهاز.')) return false;
    const old = rawRead(LS_C, {}), current = st();
    wr(LS_C, { ...old, ...current, done: { ...(old.done || {}), ...(current.done || {}) }, seen: { ...(old.seen || {}), ...(current.seen || {}) } });
    wr('tf_time', { sec: Math.max(nonnegative((rawRead('tf_time', {}) || {}).sec), nonnegative(timeState().sec)) });
    localStorage.setItem('tf_workspace_owner', currentUser.id); workspaceAllowed = true; render(); sync(true); return true;
  }
  const nonnegative = v => Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0;
  function mergeSnapshot(a = {}, b = {}) {
    const result = { ...a, ...b };
    for (const key of ['overall', 'points', 'timeSec']) result[key] = Math.max(nonnegative(a[key]), nonnegative(b[key]));
    for (const key of ['days', 'items']) {
      result[key] = { ...(a[key] || {}) };
      for (const [k, v] of Object.entries(b[key] || {})) result[key][k] = key === 'items' ? !!(result[key][k] || v) : Math.max(nonnegative(result[key][k]), nonnegative(v));
    }
    result.scores = { ...(a.scores || {}), ...(b.scores || {}) };
    for (const k of ['examBest', 'examAttempts', 'quiz', 'maturity']) result.scores[k] = Math.max(nonnegative((a.scores || {})[k]), nonnegative((b.scores || {})[k]));
    for (const k of ['arena', 'team']) {
      result.scores[k] = { ...((a.scores || {})[k] || {}) };
      for (const [name, val] of Object.entries((b.scores || {})[k] || {})) result.scores[k][name] = Math.max(nonnegative(result.scores[k][name]), nonnegative(val));
    }
    result.builders = [...new Set([...(Array.isArray(a.builders) ? a.builders : []), ...(Array.isArray(b.builders) ? b.builders : [])])];
    result.org = b.org || a.org || '';
    return result;
  }
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
  const user = () => currentUser;
  function setUser(u) {
    if (!authenticated || !currentUser || !u || u.id !== currentUser.id) return;
    currentUser = { ...currentUser, group: u.group || currentUser.group };
  }
  const validCredential = u => !!(u && !u.local && typeof u.id === 'string' && u.id && typeof u.token === 'string' && /^[a-f0-9]{40}$/i.test(u.token));
  function saveIdentity() {
    if (!validCredential(currentUser)) return;
    try { localStorage.setItem(LS_U, JSON.stringify(currentUser)); localStorage.setItem('grcpUser', JSON.stringify({ name: currentUser.name, id: currentUser.id })); } catch (e) {}
  }
  async function api(path, opt = {}) {
    try {
      const { authUser = currentUser, ...request } = opt;
      const headers = { 'content-type': 'application/json', ...(validCredential(authUser) ? { Authorization: 'Bearer ' + authUser.token, 'X-Learner-Id': authUser.id } : {}), ...(request.headers || {}) };
      const r = await fetch((window.TF_API_BASE || '') + path, { cache: 'no-store', ...request, headers });
      const j = await r.json().catch(() => ({})); return { ok: r.ok && j.ok === true, status: r.status, j };
    } catch (e) { return { ok: false, status: 0, j: {} }; }
  }
  function validIdentity(j, id) { return j && j.authenticated === true && j.learnerId === id && j.user && j.user.id === id; }
  function refreshProfile(j) {
    if (!currentUser || !validIdentity(j, currentUser.id)) return false;
    for (const key of ['name', 'phone', 'email', 'group', 'org', 'role', 'status']) if (typeof j.user[key] === 'string') currentUser[key] = j.user[key];
    saveIdentity(); return true;
  }
  function clearSession(message, preserveSharedIdentity = false) {
    authEpoch++; resetNotifs(); authenticated = false; restored = false; currentUser = null; restoredSnapshot = {}; workspaceAllowed = false; syncMessage = message || '';
    try { if (!preserveSharedIdentity) { localStorage.removeItem(LS_U); localStorage.removeItem('grcpUser'); } } catch (e) {}
    render();
  }
  let restoring = null;
  function restoreProgress(epoch) {
    if (restoring && restoring.epoch === epoch) return restoring.promise;
    const record = { epoch };
    record.promise = loadProgress(epoch).finally(() => { if (restoring === record) restoring = null; });
    restoring = record; return record.promise;
  }
  async function loadProgress(epoch) {
    const r = await api('/api/progress');
    if (epoch !== authEpoch) return false;
    if (r.status === 401 || r.status === 403) { clearSession('انتهت الجلسة أو أُوقف الحساب. سجّل الدخول مجددًا.'); return false; }
    if (r.ok && (!validIdentity(r.j, currentUser.id) || !Object.hasOwn(r.j, 'snapshot'))) { clearSession('انتهت الجلسة. سجّل الدخول مجددًا.'); return false; }
    if (!r.ok) { syncMessage = 'تعذّر استعادة التقدّم من الخادم. المزامنة متوقفة حتى إعادة المحاولة.'; render(); return false; }
    refreshProfile(r.j);
    if (r.j.config) wr(LS_CFG, Object.assign(cfg(), r.j.config));
    restoredSnapshot = mergeSnapshot(rawRead('tf_progress:' + currentUser.id, {}), r.j.snapshot || {});
    wr('tf_progress:' + currentUser.id, restoredSnapshot);
    const c = st(); c.done = c.done || {}; c.seen = c.seen || {};
    for (const [key, value] of Object.entries(restoredSnapshot.items || {})) if (value) { if (/^lec\d+$/.test(key)) c.seen[key] = c.seen[key] || Date.now(); else c.done[key] = c.done[key] || Date.now(); }
    for (const key of restoredSnapshot.builders || []) c.done['build_' + key] = c.done['build_' + key] || Date.now();
    wr(LS_C, c); wr('tf_time', { sec: Math.max(timeState().sec || 0, restoredSnapshot.timeSec || 0) });
    restored = true; syncMessage = ''; render(); return true;
  }
  async function acceptSession(j, savedToken) {
    const token = j.token || savedToken, candidate = j.user && { ...j.user, token };
    if (!validCredential(candidate) || !validIdentity(j, candidate.id)) return false;
    authEpoch++; resetNotifs(); const epoch = authEpoch; authenticated = true; restored = false; currentUser = candidate; restoredSnapshot = {};
    saveIdentity();
    try { bindWorkspace(); } catch (e) { workspaceAllowed = false; }
    return restoreProgress(epoch);
  }
  async function restoreSession() {
    const saved = rawRead(LS_U, null), epoch = authEpoch;
    const r = await api('/api/reg', { authUser: validCredential(saved) ? saved : null });
    if (epoch !== authEpoch) return false;
    if (r.ok && validCredential(saved) && validIdentity(r.j, saved.id)) return acceptSession(r.j, saved.token);
    if (!r.ok && r.status !== 401 && r.status !== 403) { syncMessage = 'تعذّر الاتصال بخادم الحسابات. أعد المحاولة؛ بيانات الدخول المحفوظة لم تُحذف.'; render(); return false; }
    clearSession(r.ok && !validCredential(saved) ? '' : 'انتهت الجلسة أو تغيّر الحساب. سجّل الدخول مجددًا.'); return false;
  }

  /* ───── التقدّم ───── */
  function itemDone(i) { return !!((restoredSnapshot.items || {})[i.k] || (st().done || {})[i.k] || i.chk()); }
  function dayProgress(d) { const items = d.items; const done = items.filter(i => { try { return itemDone(i); } catch (e) { return false; } }).length; return { done, total: items.length, pct: Math.round(done / items.length * 100) }; }
  /* ───── الوقت المستغرق في الدورة (نشط فقط) ───── */
  const LS_T = 'tf_time';
  const timeState = () => rd(LS_T, { sec: 0 }) || { sec: 0 };
  function addTime(s) { const t = timeState(); t.sec = (t.sec || 0) + s; wr(LS_T, t); }
  let _timeLast = Date.now();
  function tickTime() { const now = Date.now(); if (typeof document !== 'undefined' && document.visibilityState === 'visible' && page !== 'trainer' && authenticated && restored) { const dt = Math.min(60, (now - _timeLast) / 1000); if (dt > 0.5) addTime(dt); } _timeLast = now; }
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

  function snapshot() {
    const days = {}; DAYS.forEach(d => { days[d.n] = dayProgress(d).pct; });
    const items = {}; DAYS.forEach(d => d.items.forEach(i => { try { items[i.k] = itemDone(i); } catch (e) { items[i.k] = false; } }));
    const t = today(); const activeDays = DAYS.filter(d => d.n <= Math.max(1, Math.min(5, t || 1)));
    const overall = Math.round(activeDays.reduce((a, d) => a + days[d.n], 0) / activeDays.length);
    const nav = rd('tf-grc-navigator-v1'); const m = nav && !nav.example ? Object.values(nav.a || {}).filter(Boolean) : [];
    const scores = { examBest: examBest(), examAttempts: examAttempts(), arena: (rd('grcpArena', {}) || {}).best || {}, team: (rd('grcpArena', {}) || {}).team || {}, maturity: m.length ? +(m.reduce((a, b) => a + b, 0) / m.length).toFixed(2) : 0, quiz: Math.round([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((a, n) => a + quizPct([n]), 0) / 10) };
    const org = (rd('tf_org_v1') || {}).name || (nav && nav.p && nav.p.name) || '';
    const snap = { days, overall, items, scores, org, at: Date.now(), today: t };
    snap.timeSec = Math.round(timeState().sec || 0);
    const doneC = (rd(LS_C, {}) || {}).done || {};
    snap.builders = Object.keys(doneC).filter(k => /^build_/.test(k)).map(k => k.replace('build_', ''));
    const merged = mergeSnapshot(restoredSnapshot, snap);
    merged.points = Math.max(merged.points, computePoints(merged));
    return merged;
  }
  let lastSync = 0, syncing = false;
  async function sync(force, keepalive = false) {
    if (!authenticated || !currentUser || !validCredential(currentUser) || page === 'trainer') return false;
    if ((!force && (document.hidden || document.visibilityState !== 'visible')) || syncing || (!force && Date.now() - lastSync < 15000)) return false;
    syncing = true; const epoch = authEpoch;
    try {
      if (!restored && !await restoreProgress(epoch)) return false;
      if (epoch !== authEpoch || !restored) return false;
      const outgoing = snapshot();
      const r = await api('/api/progress', { method: 'POST', keepalive, body: JSON.stringify({ snapshot: outgoing }) });
      if (epoch !== authEpoch) return false;
      if (r.status === 401 || r.status === 403) { clearSession('انتهت الجلسة أو أُوقف الحساب. سجّل الدخول مجددًا.'); return false; }
      if (r.ok && !validIdentity(r.j, currentUser.id)) { clearSession('تغيّر الحساب. سجّل الدخول مجددًا.', true); return false; }
      if (r.ok) { refreshProfile(r.j); lastSync = Date.now(); currentUser.lastSync = lastSync; restoredSnapshot = mergeSnapshot(outgoing, r.j.snapshot || {}); wr('tf_progress:' + currentUser.id, restoredSnapshot); syncMessage = ''; }
      else syncMessage = 'تعذّرت المزامنة. سيُعاد إرسال التقدّم عند عودة الاتصال.';
      render(); return r.ok;
    } finally { syncing = false; }
  }
  /* Trainer notices use only the verified Railway learner session. Cursors never cross accounts. */
  let notificationRequest = null, notificationCursor = '', notificationSince = 0, notificationOwner = '', notificationIds = new Set();
  const notificationTimestamp = value => { const n = Number(value); return Number.isSafeInteger(n) && n >= 0 ? n : 0; };
  const notificationKey = id => 'tf_notif_cursor:' + encodeURIComponent(id);
  function resetNotifs() {
    notificationRequest = null; notificationCursor = ''; notificationSince = 0; notificationOwner = ''; notificationIds = new Set();
    const box = document.getElementById('tfNotifs'); if (box) box.remove();
  }
  function notifBox() {
    let box = document.getElementById('tfNotifs');
    if (!box) { box = document.createElement('div'); box.id = 'tfNotifs'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); box.style.cssText = 'position:fixed;top:14px;inset-inline-end:14px;z-index:2147483600;display:flex;flex-direction:column;gap:8px;width:min(360px,calc(100vw - 28px));max-height:80vh;overflow:auto'; document.body.appendChild(box); }
    return box;
  }
  function showNotif(note) {
    const box = notifBox(), card = document.createElement('div');
    card.style.cssText = 'background:#0A1B3D;color:#fff;border-inline-start:4px solid #E2B85A;border-radius:12px;padding:12px 14px;box-shadow:0 12px 30px -10px rgba(0,0,0,.5);font-family:Rubik,Tahoma,sans-serif;overflow-wrap:anywhere';
    card.innerHTML = `<div style="display:flex;gap:8px;align-items:start"><span aria-hidden="true">🔔</span><div style="flex:1"><b style="color:#E2B85A;font-size:13px">${esc(note.title || L('إشعار من المدرب', 'Trainer notice'))}</b><div style="font-size:13px;margin-top:3px;line-height:1.6;white-space:pre-wrap">${esc(note.body || '')}</div><div style="font-size:10px;color:#cbd5e1;margin-top:4px">${new Date(note.ts).toLocaleString(EN() ? 'en-GB' : 'ar-SA')}</div></div><button type="button" style="background:none;border:0;color:#cbd5e1;cursor:pointer;font-size:20px;min-width:32px;min-height:32px" aria-label="${L('إغلاق الإشعار', 'Dismiss notice')}">×</button></div>`;
    card.querySelector('button').onclick = () => { card.remove(); if (!box.children.length) box.remove(); };
    box.appendChild(card);
  }
  async function pollNotifs() {
    if (page === 'trainer' || !authenticated || !restored || !currentUser || document.hidden || document.visibilityState !== 'visible') return false;
    const id = currentUser.id, epoch = authEpoch;
    if (notificationRequest && notificationRequest.epoch === epoch) return false;
    if (notificationOwner !== id) {
      resetNotifs(); notificationOwner = id;
      const saved = rawRead(notificationKey(id), {});
      if (saved && typeof saved.cursor === 'string' && saved.cursor.length <= 2048) { notificationCursor = saved.cursor; notificationSince = notificationTimestamp(saved.since); }
    }
    const cursor = notificationCursor, since = notificationSince, request = { epoch }; notificationRequest = request;
    try {
      const r = await api('/api/notify?' + (cursor ? 'cursor=' + encodeURIComponent(cursor) : 'since=' + since));
      if (epoch !== authEpoch || !authenticated || !restored || !currentUser || currentUser.id !== id) return false;
      if (r.status === 401 || r.status === 403) { clearSession('انتهت الجلسة أو أُوقف الحساب. سجّل الدخول مجددًا.'); return false; }
      if (r.ok && !validIdentity(r.j, id)) { if (typeof r.j.learnerId === 'string' && r.j.learnerId !== id) clearSession('تغيّر الحساب. سجّل الدخول مجددًا.', true); return false; }
      if (!r.ok || !Array.isArray(r.j.notifs) || document.hidden || document.visibilityState !== 'visible') return false;
      const nextSince = notificationTimestamp(r.j.nextSince), nextCursor = r.j.nextCursor;
      // Cursor is opaque: never parse it or substitute a timestamp when pagination is available.
      if (!Number.isSafeInteger(r.j.nextSince) || nextSince < since || (nextCursor !== null && (typeof nextCursor !== 'string' || !nextCursor || nextCursor.length > 2048)) ||
          (r.j.hasMore && (!nextCursor || nextCursor === cursor)) ||
          r.j.notifs.some(n => !n || typeof n.id !== 'string' || !n.id || !Number.isSafeInteger(n.ts) || n.ts < since || n.ts > nextSince || typeof n.title !== 'string' || typeof n.body !== 'string')) return false;
      refreshProfile(r.j);
      r.j.notifs.slice().sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id)).forEach(note => { if (!notificationIds.has(note.id)) { showNotif(note); notificationIds.add(note.id); } });
      notificationCursor = nextCursor || cursor; notificationSince = nextSince;
      try { localStorage.setItem(notificationKey(id), JSON.stringify({ cursor: notificationCursor, since: notificationSince })); } catch (e) {}
      render();
      if (r.j.hasMore) setTimeout(() => { if (epoch === authEpoch) pollNotifs(); }, 100);
      return true;
    } catch (e) { return false; }
    finally { if (notificationRequest === request) notificationRequest = null; }
  }
  function mark(k, v) { const s = st(); s.done = s.done || {}; if (v === false) delete s.done[k]; else s.done[k] = Date.now(); wr(LS_C, s); render(); sync(true); }
  function seen(k) { const s = st(); s.seen = s.seen || {}; if (!s.seen[k]) { s.seen[k] = Date.now(); wr(LS_C, s); render(); } }

  /* ───── نافذة التسجيل ───── */
  function regModal(opts) {
    opts = opts || {}; if (page === 'trainer' || document.getElementById('tfReg')) return;
    let modalVersion = 0;
    const c = cfg(); const ov = document.createElement('div'); ov.id = 'tfReg';
    ov.innerHTML = `<div class="tfr-box" role="dialog" aria-modal="true">
      <div class="tfr-h"><div class="tfr-k">TRACK FORD · GRCP COURSE</div><h2>${opts.login ? 'تسجيل الدخول' : 'تسجيل المتدرب'}</h2><p>سجّل مرة واحدة لتظهر محاضرات اليوم وتُحفظ نتائجك ويتابع المدرب تقدّمك.</p></div>
      <form class="tfr-f" id="tfRegForm">
        <label class="n reg-only">الاسم الكامل<input name="name" required minlength="3" placeholder="مثال: محمد بن عبدالله"></label>
        <label>رقم الجوال<input name="phone" required inputmode="tel" placeholder="05xxxxxxxx" dir="ltr"></label>
        <label><span id="tfPasswordLabel">الرقم السري (4–6 أرقام)</span><input name="pin" required minlength="4" maxlength="6" pattern="[0-9]{4,6}" inputmode="numeric" autocomplete="new-password" dir="ltr" type="password"></label>
        <label class="n reg-only">البريد الإلكتروني (اختياري)<input name="email" type="email" placeholder="name@company.com" dir="ltr"></label>
        <label class="reg-only">المجموعة<select name="group">${(c.groups || []).map(g => `<option>${esc(g)}</option>`).join('')}<option value="عام">بدون مجموعة</option></select></label>
        <label class="reg-only">جهة العمل<input name="org" placeholder="اسم المنظمة"></label>
        <label class="n reg-only">المسمّى الوظيفي (اختياري)<input name="role" placeholder="مثال: مدير الامتثال"></label>
        <div class="tfr-msg" id="tfRegMsg"></div>
        <div class="tfr-act"><button type="submit" class="tfr-btn gold" id="tfRegGo">${opts.login ? 'دخول' : 'تسجيل والبدء'}</button><button type="button" class="tfr-btn" id="tfRegSwitch">${opts.login ? 'ليس لديّ حساب — تسجيل جديد' : 'لديّ حساب — دخول'}</button><button type="button" class="tfr-btn ghost" id="tfRegGuest">متابعة كضيف (بدون متابعة المدرب)</button></div>
      </form></div>`;
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    const form = ov.querySelector('#tfRegForm'), msg = ov.querySelector('#tfRegMsg');
    const setMode = login => { modalVersion++; ov.querySelector('#tfRegGo').disabled = false; ov.querySelectorAll('.reg-only').forEach(e => e.style.display = login ? 'none' : ''); ov.querySelector('h2').textContent = login ? 'تسجيل الدخول' : 'تسجيل المتدرب'; ov.querySelector('#tfRegGo').textContent = login ? 'دخول' : 'تسجيل والبدء'; ov.querySelector('#tfRegSwitch').textContent = login ? 'ليس لديّ حساب — تسجيل جديد' : 'لديّ حساب — دخول'; form.dataset.login = login ? '1' : ''; form.querySelector('[name=name]').required = !login; const password = form.querySelector('[name=pin]'); password.minLength = 4; password.autocomplete = login ? 'current-password' : 'new-password'; ov.querySelector('#tfPasswordLabel').textContent = login ? 'الرقم السري (4–6 أرقام)' : 'الرقم السري (4–6 أرقام)'; };
    setMode(!!opts.login);
    ov.querySelector('#tfRegSwitch').onclick = () => setMode(!form.dataset.login);
    const close = () => { modalVersion++; ov.remove(); document.body.style.overflow = ''; render(); };
    ov.querySelector('#tfRegGuest').onclick = () => { guestMode = true; close(); };
    form.onsubmit = async e => {
      e.preventDefault(); if (ov.querySelector('#tfRegGo').disabled) return; const version = modalVersion, epoch = authEpoch; const fd = Object.fromEntries(new FormData(form).entries()); const login = !!form.dataset.login;
      msg.textContent = 'جارٍ الاتصال…'; ov.querySelector('#tfRegGo').disabled = true;
      const r = await api('/api/reg', { method: 'POST', body: JSON.stringify(Object.assign({ action: login ? 'login' : 'register' }, fd)) });
      if (version !== modalVersion || epoch !== authEpoch || !document.getElementById('tfReg')) return;
      ov.querySelector('#tfRegGo').disabled = false;
      if (!r.ok || !validCredential({ ...r.j.user, token: r.j.token }) || !validIdentity(r.j, r.j.user && r.j.user.id)) { const E = { bad_phone: 'رقم الجوال غير صحيح (05xxxxxxxx).', bad_pin: 'بيانات الدخول غير صحيحة.', bad_password: login ? 'بيانات الدخول غير صحيحة.' : 'اختر رقمًا سريًا من 4 إلى 6 أرقام.', invalid_credentials: 'بيانات الدخول غير صحيحة.', bad_name: 'اكتب الاسم الكامل.', exists: 'هذا الجوال مسجّل — اختر «لديّ حساب».', not_found: 'لا يوجد حساب بهذا الجوال — سجّل حسابًا جديدًا.', account_suspended: 'هذا الحساب موقوف. تواصل مع المدرب.', weak_password: 'اختر رقمًا سريًا من 4 إلى 6 أرقام.', rate_limited: 'محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.' }; msg.textContent = E[r.j.error] || 'تعذّر تسجيل الدخول إلى الخادم. لم يُنشأ حساب محلي. حاول مرة أخرى.'; return; }
      const ready = await acceptSession(r.j); if (version !== modalVersion || !document.getElementById('tfReg')) return; close(); if (ready && typeof (opts.after || opts.onSuccess) === 'function') (opts.after || opts.onSuccess)(currentUser); toast(ready ? (r.j.created ? `أهلًا ${currentUser.name} — تم تسجيلك في الدورة.` : `أهلًا بعودتك ${currentUser.name}.`) : syncMessage); if (ready) sync(true);

    };
  }
  function toast(m) { let t = document.getElementById('tfToast'); if (!t) { t = document.createElement('div'); t.id = 'tfToast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3200); }
  async function signOut() {
    // Railway preserves account tokens across devices. Sign out affects this browser only.
    clearSession(); location.reload(); return true;
  }
  function syncStatus() {
    if (syncMessage) return syncMessage;
    if (!restored) return 'جارٍ استعادة ملخص التقدّم من الخادم؛ لم تبدأ المزامنة بعد.';
    const suffix = currentUser && currentUser.lastSync ? ' · آخر مزامنة ' + new Date(currentUser.lastSync).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';
    return 'ملخص التقدّم متصل بلوحة المدرب' + suffix + ' · ملفات الأنشطة والمصمّمات تبقى على جهازها الأصلي.' + (!workspaceAllowed ? ' بيانات محلية قديمة غير منسوبة لهذا الحساب؛ لن تُرفع تلقائيًا. استخدم ملف متصفح منفصلًا لعمل جديد.' : '');
  }

  /* ───── شريحة المستخدم (تُعرض في شريط التكامل) ───── */
  function chip() {
    const u = user(), t = today(), snap = snapshot();
    const dayTxt = !scheduled() ? L('النظام مفتوح — كل الأيام متاحة', 'Open — all days available') : t === 0 ? L('قبل بدء الدورة', 'Before the course') : t === 6 ? L('ما بعد الدورة', 'After the course') : L(`اليوم ${t} · ${DAYS[t - 1].ar}`, `Day ${t} · ${DAYS[t - 1].en}`);
    return `<span class="tfc-chip">${u ? `👤 <b>${esc(u.name)}</b>${u.group && u.group !== 'عام' ? ` · ${esc(u.group)}` : ''}${u.local ? ' <small>' + L('(محلي)', '(local)') + '</small>' : ''}` : '👤 ' + L('غير مسجّل', 'Not registered')}</span><span class="tfc-chip day">📅 ${dayTxt}</span><span class="tfc-chip">📈 ${L('تقدّمي', 'My progress')} ${snap.overall}%</span><a class="tfc-link" href="${A}#/course">${L('مسار الدورة', 'Course track')}</a><a class="tfc-link" href="trainer.html">${L('دخول المدرب', 'Trainer')}</a>${u ? `<button type="button" class="tfc-out" data-tfc="out">${L('خروج', 'Sign out')}</button>` : `<button type="button" class="tfc-out" data-tfc="reg">${L('تسجيل', 'Register')}</button>`}`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-tfc]'); if (!b) return; if (b.dataset.tfc === 'out') { if (confirm('تسجيل الخروج من هذا الجهاز؟')) signOut(); } else regModal(); });

  /* ───── مسار الدورة (واجهة) ───── */
  function mountTrack(host, sel) {
    if (!host) return; const u = user(), t = today(), sched = scheduled(), cur = sel || Math.max(1, Math.min(5, t || 1)); const d = DAYS[cur - 1], p = dayProgress(d), snap = snapshot();
    const startD = new Date(cfg().start + 'T00:00:00'); const dateOf = n => { if (!sched || isNaN(startD)) return ''; const x = new Date(startD); x.setDate(x.getDate() + n - 1); return x.toLocaleDateString(EN() ? 'en-GB' : 'ar-SA-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' }); }; const dn = x => EN() ? x.en : x.ar;
    host.innerHTML = `<div class="wrap tfc-wrap">
      <section class="tfc-hero" style="--c:${d.col}"><div><div class="tfc-k">GRCP® COURSE · TRACK FORD · ${sched ? (t ? (t === 6 ? 'AFTER COURSE' : 'DAY ' + t) : 'PRE-COURSE') : 'SELF-PACED'}</div>
        <h2>${u ? L(`أهلًا ${esc(u.name)}`, `Welcome ${esc(u.name)}`) : L('أهلًا بك في مسار الدورة', 'Welcome to the course track')}${u && u.group && u.group !== 'عام' ? ` <small>${esc(u.group)}</small>` : ''}</h2>
        <p>${!sched ? L('النظام مفتوح لأي تاريخ: الأيام الخمسة متاحة بالكامل — تنقّل بينها ونفّذ المحاضرات والأنشطة والألعاب والمصمّمات بأي ترتيب وبأي وقت يناسبك.', 'Open for any date: all five days are fully available — move between them and work through the lectures, activities, games and builders in any order, any time.') : t === 0 ? L(`تبدأ الدورة ${dateOf(1)}. والأيام كلها متاحة للاطّلاع الآن.`, `The course starts ${dateOf(1)}. All days are available to preview now.`) : t === 6 ? L('انتهت أيام الدورة — كل الأيام متاحة للمراجعة، والتركيز الآن على الاختبار الحقيقي.', 'Course days are over — all days are open for review; focus now on the real exam.') : L(`اليوم هو اليوم ${t} من 5: <b>${DAYS[t - 1].ar}</b>. كل الأيام متاحة؛ ركّز على بنود يومك ثم انتقل كما تحب.`, `Today is Day ${t} of 5: <b>${DAYS[t - 1].en}</b>. All days are open; focus on today's items then move freely.`)}</p>
        ${!u ? `<button type="button" class="tfc-btn gold" data-tfc="reg">${L('سجّل الآن ليُحفظ تقدّمك', 'Register now to save your progress')}</button>${syncMessage ? `<div class="tfc-note">${esc(syncMessage)}</div>` : ''}` : `<div class="tfc-note">${esc(syncStatus())}${canClaimWorkspace() ? '<button type="button" class="tfc-mini" id="tfcClaimWorkspace">هذه أعمالي — ربط ملخصها بحسابي</button>' : ''}</div>`}
        </div><div class="tfc-ring" style="--p:${snap.overall}"><b>${snap.overall}%</b><span>${L('تقدّمي الإجمالي', 'Overall progress')}</span></div></section>
      <nav class="tfc-days">${DAYS.map(x => { const q = dayProgress(x); const dt = dateOf(x.n); return `<button type="button" data-d="${x.n}" class="${x.n === cur ? 'on' : ''} ${x.n === t ? 'today' : ''}" style="--c:${x.col}"><span class="dn">${x.n === t ? '📍' : q.pct === 100 ? '✅' : x.n}</span><span class="dt">${L('اليوم', 'Day')} ${x.n}</span><span class="dd">${dn(x)}</span><span class="dp"><i style="width:${q.pct}%"></i></span><small>${dt ? dt + ' · ' : ''}${q.pct}%</small></button>`; }).join('')}</nav>
      <section class="tfc-day" style="--c:${d.col}"><div class="tfc-dh"><h3>${L('اليوم', 'Day')} ${d.n} — ${dn(d)} <span class="en">${EN() ? d.ar : d.en}</span></h3><div class="tfc-dp">${p.done} / ${p.total} ${L('بند مكتمل', 'items done')}</div></div>
        <ol class="tfc-items">${d.items.map((i, k) => { let ok = false; try { ok = itemDone(i); } catch (e) {} return `<li class="${ok ? 'ok' : ''}"><span class="num">${ok ? '✓' : k + 1}</span><div class="tx"><a href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${esc(EN() && i.te ? i.te : i.t)}</a>${i.manual ? (ok ? `<span class="tfc-mini">${L('مكتمل ✓ (سجل تراكمي)', 'Completed ✓ (cumulative)')}</span>` : `<button type="button" class="tfc-mini" data-mark="${i.k}" data-v="1">${L('تم ✓', 'Done ✓')}</button>`) : ''}</div><a class="go" href="${i.href}" ${/^https?:/.test(i.href) ? 'target="_blank" rel="noopener"' : ''}>${ok ? L('مراجعة', 'Review') : L('ابدأ', 'Start')} ${L('←', '→')}</a></li>`; }).join('')}</ol>
        <div class="tfc-foot">${d.n === 5 ? L('<b>مشروع المجموعة:</b> كل مجموعة تعرض خريطة GRC لمنظمة مختارة (الملف في النظام + التقييم في المقيّم + فيديو المحاكاة) خلال 10 دقائق.', '<b>Group project:</b> each group presents a GRC map of a chosen organisation (System profile + Navigator assessment + simulation video) in 10 minutes.') : L('<b>نصيحة:</b> أكمل 80% من بنود هذا المحور قبل الانتقال للتالي لأفضل استفادة — المدرب يرى نسبتك. كل المحاور متاحة في أي وقت.', '<b>Tip:</b> complete 80% of this topic before moving on for best results — your trainer sees your percentage. All topics are available any time.')}</div></section>
      ${u && !u.local ? '' : ''}</div>`;
    host.querySelectorAll('.tfc-days button:not([disabled])').forEach(b => b.onclick = () => mountTrack(host, +b.dataset.d));
    const claim = host.querySelector('#tfcClaimWorkspace'); if (claim) claim.onclick = () => { if (claimWorkspace()) mountTrack(host, cur); };
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
  function render() { try { window.TFB && window.TFB.render(); } catch (e) {} try { window.I18N && window.I18N.traineeChip && window.I18N.traineeChip(); } catch (e) {} }
  async function boot() {
    if (page === 'trainer') { resolveSessionReady(false); return; }
    const ready = await restoreSession(); resolveSessionReady(ready);
    if (!ready && !user() && !guestMode && page !== 'index') setTimeout(() => regModal(), 600);
    if (page === 'academy') { window.addEventListener('hashchange', () => setTimeout(guardAcademyRoute, 30)); setTimeout(guardAcademyRoute, 150); if (user() && (location.hash === '' || location.hash === '#/') && !sessionStorage.getItem('tf_home_seen')) { sessionStorage.setItem('tf_home_seen', '1'); location.hash = '#/course'; } }
    if (window.I18N && window.I18N.onChange) window.I18N.onChange(() => { render(); const h = document.getElementById('courseHost'); if (h) mountTrack(h); const ah = document.getElementById('arenaHost'); if (ah && window.TFArena) window.TFArena.mount(ah, (location.hash.split('/')[2] || '')); setTimeout(guardAcademyRoute, 50); });
    if (ready) sync(true);
    setInterval(() => sync(), 15000);
    setTimeout(pollNotifs, 6000); setInterval(pollNotifs, 20000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) sync(true, true); else { if (!authenticated && validCredential(rawRead(LS_U, null))) restoreSession().then(ready => { if (ready) { sync(true); pollNotifs(); } }); else { sync(); pollNotifs(); } } });
    window.addEventListener('pagehide', () => sync(true, true));
    window.addEventListener('storage', e => {
      if (e.key === 'tf_workspace_owner') { workspaceAllowed = !!currentUser && e.newValue === currentUser.id; render(); }
      if ((e.key === 'grcpUser' || e.key === LS_U) && authenticated && currentUser) {
        let other = null; try { other = JSON.parse(e.newValue || 'null'); } catch (err) {}
        if (!other || other.id !== currentUser.id || (e.key === LS_U && other.token !== currentUser.token)) clearSession('تغيّر الحساب في علامة تبويب أخرى. سجّل الدخول مجددًا.', true);
      }
    });
  }
  window.TFC = { DAYS, cfg, scheduled, EN, L, today, dayIndex, unlocked, user, setUser, regModal, snapshot, dayProgress, sync, mark, seen, chip, mountTrack, signOut, dayOfLecture, toast, restoreSession, syncStatus, sessionReady, claimWorkspace };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
