/* Track Ford · استوديو GRC الذكي — المحرك (تصميم وبرمجة وإعداد: د. محمد عطية)
   من البيانات والأحداث ← تصنيف ← مخاطر وفرص ← التزامات ← ضوابط (IACM) ← سياسات كاملة ← خطة لكل عنصر من عناصر نموذج GRC 3.5 ← خارطة طريق */
(function () {
  'use strict';
  const KB = window.TFS_KB, EL = window.TFS_EL;
  const TYPE_THEME = { 'تغيير تنظيمي': 'REG', 'طرف ثالث': 'TPR', 'فرصة': 'OPP', 'بلاغ': 'WB' };
  const TN = { P: 'استباقي', D: 'استقصائي', R: 'استجابي' };
  const TNE = { P: 'Proactive', D: 'Detective', R: 'Responsive' };
  const pad = (n, w) => String(n).padStart(w || 2, '0');
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const theme = id => KB.THEMES.find(t => t.id === id);
  const level = s => s >= 15 ? ['حرج', 'Critical', '#B42318'] : s >= 10 ? ['عالٍ', 'High', '#D9622B'] : s >= 5 ? ['متوسط', 'Medium', '#C9973B'] : ['منخفض', 'Low', '#15803D'];

  function classify(ev) {
    const txt = (ev.title + ' ' + (ev.desc || '')).toLowerCase();
    const out = new Set();
    KB.THEMES.forEach(t => { if (t.kw.some(k => txt.includes(k.toLowerCase()))) out.add(t.id); });
    if (TYPE_THEME[ev.type]) out.add(TYPE_THEME[ev.type]);
    if (ev.type === 'مؤشر' && /شكاو|شكوى|عملاء/.test(txt)) out.add('CX');
    if (!out.size) out.add(ev.type === 'فرصة' || ev.type === 'قرار' ? 'OPP' : 'REG');
    return [...out];
  }

  function regSelected(org, ref) {
    const map = { 'ECC': 'ECC', 'PDPL': 'PDPL', 'SAMA CSF': 'SAMACSF', 'SAMA BCM': 'SAMABCM', 'SAMA GOV': 'SAMAGOV', 'SAMA Fraud': 'SAMAFRD', 'CMA CG': 'CMAGOV', 'Nazaha': 'NAZAHA', 'ISO 27001': 'ISO27001', 'ISO 22301': 'ISO22301', 'ISO 31000': 'ISO31000', 'ISO 37301': 'ISO37301', 'GRC 3.5': 'GRC35' };
    const key = Object.keys(map).find(k => ref.startsWith(k));
    return key ? (org.regs || []).includes(map[key]) || /^ISO|GRC/.test(key) : true;
  }

  function generate(S) {
    const org = S.org, evs = S.events.map((e, i) => Object.assign({ id: e.id || ('EV-' + pad(i + 1)), desc: '' }, e, { desc: e.desc || '' }));
    evs.forEach(e => { e.themes = classify(e); });
    /* 1) المخاطر والفرص */
    const hits = {};
    evs.forEach(e => e.themes.forEach(t => { (hits[t] = hits[t] || []).push(e); }));
    const order = Object.keys(hits).sort((a, b) => Math.max(...hits[b].map(e => +e.sev)) * hits[b].length - Math.max(...hits[a].map(e => +e.sev)) * hits[a].length);
    const risks = order.map((tid, i) => {
      const t = theme(tid), es = hits[tid], ms = Math.max(...es.map(e => +e.sev || 3));
      const L = Math.min(5, 1 + es.length + (ms >= 5 ? 1 : 0)), I = Math.min(5, ms);
      const rL = Math.max(1, L - 2), rI = Math.max(1, I - (t.ctl.some(c => c.t === 'R') ? 1 : 0));
      const opp = tid === 'OPP';
      return { id: (opp ? 'OP-' : 'R-') + pad(i + 1), theme: tid, kind: opp ? 'فرصة' : 'خطر', title: t.risk.ar, cat: t.ar, cause: t.risk.cause, cons: t.risk.cons,
        owner: t.dept, L, I, inh: L * I, rL, rI, res: rL * rI, treat: opp ? 'اقتناص وتعزيز' : (L * I >= 15 ? 'معالجة عاجلة' : 'معالجة'), events: es.map(e => e.id), kri: t.kri,
        status: 'مفتوح', due: addDays(today(), L * I >= 15 ? 30 : 90) };
    });
    const riskOf = tid => risks.find(r => r.theme === tid);
    /* 2) الضوابط وفق IACM */
    const controls = [];
    order.forEach(tid => {
      const t = theme(tid), r = riskOf(tid);
      t.ctl.forEach((c, j) => controls.push({ id: 'CTL-' + tid + '-' + pad(j + 1), theme: tid, ar: c.ar, t: c.t, cat: c.cat, orient: 'إداري', owner: t.dept, freq: c.freq, ev: c.ev, kci: c.kci,
        refs: t.regs.filter(x => regSelected(org, x)), risks: [r.id], events: r.events, status: 'مقترح', eff: '—' }));
      if (r.inh >= 15) controls.push({ id: 'CTL-' + tid + '-G', theme: tid, ar: 'رفع تقرير شهري عن «' + t.ar + '» إلى لجنة المخاطر حتى عودة الخطر إلى مستوى التحمل', t: 'D', cat: 'سياسي', orient: 'حوكمي', owner: 'إدارة المخاطر', freq: 'شهري', ev: 'محاضر لجنة المخاطر', kci: 'انتظام التقارير', refs: ['GRC 3.5 A5.4'], risks: [r.id], events: r.events, status: 'مقترح', eff: '—' },
        { id: 'CTL-' + tid + '-A', theme: tid, ar: 'اختبار مستقل لفعالية تصميم وتشغيل ضوابط «' + t.ar + '» من التدقيق الداخلي', t: 'D', cat: 'إجرائي', orient: 'ضمان', owner: 'التدقيق الداخلي', freq: 'سنوي', ev: 'تقرير التدقيق', kci: 'نسبة الملاحظات المغلقة', refs: ['GRC 3.5 A5.5 · R2'], risks: [r.id], events: r.events, status: 'مقترح', eff: '—' });
    });
    /* 3) الالتزامات */
    const obligations = []; let oi = 0;
    (org.regs || []).forEach(rk => {
      const R = KB.REGS[rk]; if (!R) return;
      const rel = order.filter(tid => theme(tid).regs.some(x => x.startsWith(R.tag)));
      obligations.push({ id: 'OB-' + pad(++oi), reg: R.ar, tag: R.tag, req: rel.length ? 'متطلبات ' + R.tag + ' المتعلقة بـ: ' + rel.map(x => theme(x).ar).join('، ') : 'الامتثال العام لمتطلبات ' + R.tag + ' وتحديث سجل الالتزامات',
        kind: /^ISO|GRC/.test(R.tag) ? 'اختياري' : 'إجباري', owner: rel.length ? theme(rel[0]).dept : 'الامتثال',
        controls: controls.filter(c => c.refs.some(x => x.startsWith(R.tag))).map(c => c.id), status: rel.length ? 'فجوة قيد المعالجة' : 'قيد التقييم', due: addDays(today(), 90) });
    });
    /* 4) السياسات */
    const polIds = [...new Set(order.map(t => theme(t).pol).concat(['POL-RM', 'POL-CM', 'POL-COC']))];
    const policies = polIds.map((pid, i) => buildPolicy(pid, i, { org, order, risks, controls, evs }));
    /* 5) عناصر النموذج */
    const ctx = { org, evs, risks, controls, policies, obligations, order, hits };
    const elements = EL.map(e => guide(e, ctx));
    /* 6) خارطة الطريق */
    const roadmap = buildRoadmap(ctx, elements);
    return { at: new Date().toISOString(), evs, risks, controls, obligations, policies, elements, roadmap, order };
  }

  function buildPolicy(pid, i, c) {
    const P = KB.POLICIES[pid], org = c.org;
    const themes = c.order.filter(t => theme(t).pol === pid);
    const sections = P.base.map(([h, st]) => ({ h, st: st.slice() }));
    themes.forEach(tid => { const t = theme(tid); sections.push({ h: t.ar, st: t.st.slice(), theme: tid }); });
    const ctl = c.controls.filter(x => themes.includes(x.theme));
    const evs = c.evs.filter(e => e.themes.some(t => themes.includes(t)));
    const depts = (org.depts && org.depts.length ? org.depts : KB.DEPTS);
    const raci = [
      ['إعداد السياسة وتحديثها', P.owner, 'R'], ['اعتماد السياسة', 'الرئيس التنفيذي / لجنة المخاطر', 'A'],
      ['مراجعة التوافق التنظيمي', 'الامتثال', 'C'], ['المراجعة القانونية', 'الشؤون القانونية', 'C'],
      ['تطبيق السياسة', 'جميع الإدارات المعنية', 'R'], ['المتابعة والقياس', 'إدارة المخاطر', 'R'], ['الضمان المستقل', 'التدقيق الداخلي', 'I']];
    const signers = [[P.owner, 'مالك السياسة', 'إعداد'], ['الامتثال', 'مدير الامتثال', 'مراجعة'], ['الشؤون القانونية', 'المستشار القانوني', 'مراجعة'],
      ['إدارة المخاطر', 'مدير المخاطر', 'مراجعة'], ['التدقيق الداخلي', 'رئيس التدقيق الداخلي', 'اطلاع'], ['الإدارة التنفيذية', 'الرئيس التنفيذي', 'اعتماد']];
    if (pid === 'POL-IS') signers.splice(1, 0, ['تقنية المعلومات', 'مدير تقنية المعلومات', 'مراجعة']);
    return { id: pid, no: 'TF-' + pid.replace('POL-', 'POL-') + '-' + pad(i + 1, 3), ar: P.ar, en: P.en, owner: P.owner, dept: P.dept, ver: '1.0', date: today(), review: addDays(today(), 365),
      class: 'داخلي', purpose: P.purpose, scope: 'تسري هذه السياسة على جميع منسوبي ' + (org.name || 'المنظمة') + ' والمتعاقدين والأطراف الثالثة الذين يصلون إلى معلوماتها أو أصولها، وتشمل الإدارات: ' + (P.dept === 'جميع الإدارات' ? depts.join('، ') : P.dept) + (org.systems && /IS|DP|BCM|TP/.test(pid) ? '، والأنظمة: ' + org.systems : '') + '.',
      regs: P.regs.filter(r => (org.regs || []).includes(r) || /^ISO|GRC/.test(r)).map(r => KB.REGS[r]).filter(Boolean),
      sections, controls: ctl.map(x => x.id), kpis: themes.map(t => theme(t).kri).concat(ctl.slice(0, 6).map(x => x.kci)),
      events: evs.map(e => e.id + ' — ' + e.title), raci, signers, themes };
  }

  /* إرشاد «ماذا سنفعل» لكل عنصر — مبني على البيانات والأحداث */
  function guide(e, c) {
    const org = c.org, top = c.risks.filter(r => r.kind === 'خطر').slice(0, 3), n = c.evs.length;
    const ctlN = t => c.controls.filter(x => x.t === t).length;
    const pol = c.policies.map(p => p.ar);
    const has = id => c.order.includes(id);
    const evsOf = ids => c.evs.filter(ev => ev.themes.some(t => ids.includes(t)));
    const G = {
      L1: () => ({ why: (org.regs || []).length + ' متطلبات تنظيمية مختارة و' + evsOf(['REG']).length + ' تغيير تنظيمي مسجل', act: ['إعداد تحليل PESTLE للسياق الخارجي لقطاع ' + (org.sector || 'المنظمة') + ' مع إبراز: ' + (org.regs || []).map(r => KB.REGS[r] && KB.REGS[r].tag).filter(Boolean).slice(0, 4).join('، '), 'تعيين مالك لكل عامل خارجي (التنظيمي للامتثال، التقني للأمن السيبراني، الاقتصادي للمالية)', 'تفعيل رصد أسبوعي للتعاميم والأنظمة الجديدة (ممارسة فهم المعنى)', 'تحديد محفزات إعادة النظر: صدور تعميم، حادث جوهري في القطاع، تغير اقتصادي'], out: ['سجل العوامل الخارجية', 'تقرير PESTLE'], owner: 'الاستراتيجية والامتثال', days: 30 }),
      L2: () => ({ why: 'الأحداث كشفت فجوات داخلية في: ' + c.order.slice(0, 3).map(t => KB.THEMES.find(x => x.id === t).ar).join('، '), act: ['تحليل SWOT يجمع نقاط القوة والضعف الداخلية مع نتائج الأحداث', 'مراجعة الهيكل التنظيمي وخطوط المساءلة لكشف الثغرات والتداخل (مثل غياب مالك للحسابات المميزة)', 'مراجعة الحوافز الحالية بحثًا عن حوافز مضرة' + (has('FRD') ? ' (الحوافز المرتبطة بحجم التمويل فقط)' : ''), 'تحديد العوامل الداخلية القابلة للتأثير وتعيين مالكيها'], out: ['مصفوفة SWOT', 'خريطة خطوط المساءلة'], owner: 'الاستراتيجية والموارد البشرية', days: 30 }),
      L3: () => ({ why: has('PHI') || has('WB') ? 'مؤشرات ثقافية: وقوع في التصيد، وغياب قناة إبلاغ آمنة' : 'لا يوجد قياس دوري للثقافة', act: ['تنفيذ استبيان نبض الثقافة (8 عدسات: الحوكمة، الإدارة، الضمان، الأداء، المخاطر، الامتثال، الأخلاقيات، القوى العاملة)', 'تحليل الثقافات الفرعية حسب الإدارة والفرع', 'مقارنة النتائج بخط أساس داخلي لا بمعايير خارجية', 'تصميم تدخلات القدوة القيادية وتحسين ثقافة الإبلاغ'], out: ['تقرير الثقافة المؤسسية', 'خطة التأثير الثقافي'], owner: 'الموارد البشرية والامتثال', days: 45 }),
      L4: () => ({ why: 'أصحاب مصلحة متأثرون بالأحداث: العملاء، الجهة الرقابية، المساهمون، الموردون', act: ['إعداد سجل أصحاب المصلحة وتحليل الاهتمام والسلطة', 'وضع العميل والجهة الرقابية في ربع «إدارة عن قرب»', 'خطة تواصل وبناء علاقات لكل فئة مع مسؤول محدد', 'رصد التغيرات (شكاوى، وسائل التواصل، ملاحظات رقابية)'], out: ['سجل أصحاب المصلحة', 'خطة التواصل'], owner: 'الاتصال المؤسسي', days: 30 }),
      A1: () => ({ why: 'الرؤية: ' + (org.vision || '—'), act: ['تحديث الرسالة والرؤية والقيم بحيث تتضمن الالتزام بالنزاهة والامتثال', 'اعتماد بيان الرغبة في المخاطر: ' + (org.appetite || 'يحدده المجلس'), 'ربط الأهداف الاستراتيجية بالرؤية عبر بطاقة الأداء المتوازن', 'التحقق من التوجه مع الإدارات وتحديد محفزات إعادة النظر'], out: ['وثيقة التوجه الاستراتيجي', 'بيان الرغبة في المخاطر'], owner: 'الإدارة التنفيذية', days: 45 }),
      A2: () => ({ why: 'تحويل نتائج الأحداث إلى أهداف قابلة للقياس', act: ['صياغة أهداف GRC للمنشأة: «تعزيز المرونة السيبرانية»، «امتثال كامل لحماية البيانات»، «خفض الخسائر التشغيلية»', 'تعريف مؤشرات قيادية ولاحقة لكل هدف (KPI/KRI/KCI) مع مستهدف ونطاق تحمل', 'إسقاط الأهداف على الإدارات ورفعها (Top-down / Bottom-up)', 'تعيين مالك واحد مساءل لكل هدف'], out: ['مصفوفة الأهداف والمؤشرات'], owner: 'إدارة الأداء والمخاطر', days: 30 }),
      A3: () => ({ why: n + ' حدثًا صُنّفت إلى ' + c.order.length + ' موضوعات', act: ['اعتماد معايير التعريف (الفئات، الرغبة، التحمل، الاستيعاب)', 'تعريف ' + c.risks.filter(r => r.kind === 'خطر').length + ' مخاطر و' + c.risks.filter(r => r.kind === 'فرصة').length + ' فرص و' + c.obligations.length + ' التزامات من الأحداث المسجلة', 'دراسة الترابط بين المخاطر (مثل: التصيد ← اختراق الحساب ← الاحتيال)', 'التحقق من القائمة مع الإدارات وترتيب أولوية التحليل'], out: ['سجل المخاطر والفرص', 'سجل الالتزامات'], owner: 'إدارة المخاطر والامتثال', days: 21 }),
      A4: () => ({ why: 'أعلى المخاطر المتأصلة: ' + top.map(r => r.id + ' (' + r.inh + ')').join('، '), act: ['تحليل الاحتمالية والأثر على مقياس 5×5 وحساب المستوى المتأصل والمتبقي', 'إعداد مخطط ربطة العنق (Bowtie) لأعلى خطر: ' + (top[0] ? top[0].title : ''), 'مقارنة المخاطر المتبقية بنطاقات التحمل وتحديد ما يتطلب تصميمًا إضافيًا', 'تحليل كمي (FAIR أو Monte Carlo) للمخاطر الحرجة'], out: ['تقرير تحليل المخاطر', 'خريطة الحرارة'], owner: 'إدارة المخاطر', days: 30 }),
      A5: () => ({ why: c.controls.length + ' ضابطًا مقترحًا لمعالجة المخاطر', act: ['اختيار خيار المعالجة لكل خطر: تجنب، قبول، مشاركة، أو ضبط', 'تصميم مزيج متوازن: ' + ctlN('P') + ' استباقي، ' + ctlN('D') + ' استقصائي، ' + ctlN('R') + ' استجابي', 'إضافة ضوابط حوكمية وضمان للمخاطر الحرجة', 'تقييم التكلفة والمنفعة، وتوزيع الضوابط على خطوط المساءلة مع فصل المهام', 'إعداد الخطة المتكاملة واعتمادها'], out: ['مكتبة الضوابط', 'الخطة المتكاملة'], owner: 'إدارة المخاطر مع الإدارات', days: 45 }),
      P1: () => ({ why: 'تنفيذ الضوابط المصممة وإثبات تشغيلها', act: ['تشغيل الضوابط حسب الأولوية بدءًا بالمخاطر الحرجة', 'تعيين مالك وتكرار ودليل تشغيل لكل ضابط', 'اختبار ضغط للضوابط الحرجة لكشف إمكانية الالتفاف عليها', 'توثيق أي تغيير في الضوابط وقرارات التأديب'], out: ['سجل تشغيل الضوابط', 'أدلة التشغيل'], owner: 'الإدارات التشغيلية (الخط الأول)', days: 90 }),
      P2: () => ({ why: pol.length + ' سياسات مولّدة تلقائيًا', act: ['مراجعة واعتماد حزمة السياسات: ' + pol.slice(0, 4).join('، ') + (pol.length > 4 ? '…' : ''), 'إصدار مدونة السلوك وإرشادات القرار الأخلاقي', 'اعتماد إطار إدارة السياسات (الإنشاء، الاعتماد، النشر، التحديث، الاستثناءات)', 'جمع إقرارات الاطلاع من الموظفين إلكترونيًا'], out: ['حزمة السياسات المعتمدة', 'سجل الإقرارات'], owner: 'الامتثال وملاك السياسات', days: 45 }),
      P3: () => ({ why: 'إيصال السياسات والمخاطر للجهات الصحيحة في الوقت الصحيح', act: ['إطار تواصل يحدد المرسل والجمهور والرسالة والقناة والتوقيت', 'تقارير دورية للمجلس واللجان عن المخاطر والامتثال', 'تقارير الجهات الرقابية الإلزامية بمواعيدها', 'قنوات تغذية راجعة لكل رسالة'], out: ['مصفوفة التواصل', 'لوحات التقارير'], owner: 'الاتصال المؤسسي والامتثال', days: 30 }),
      P4: () => ({ why: has('PHI') ? 'وقوع الموظفين في التصيد يتطلب تعليمًا حسب الدور' : 'رفع الوعي بالسياسات الجديدة', act: ['خطة تعليم حسب الدور والمخاطر (المالية، خدمة العملاء، تقنية المعلومات)', 'وحدات قصيرة عند نقطة الحاجة ومساعد إرشادي داخلي', 'خط مساعدة للاستفسار عن السلوك المتوقع', 'قياس نتائج التعلم بتغير السلوك (نموذج كيركباتريك) لا بعدد الساعات'], out: ['خطة التعليم السنوية', 'تقارير الأثر'], owner: 'الموارد البشرية والأمن السيبراني', days: 60 }),
      P5: () => ({ why: has('FRD') ? 'حوافز مرتبطة بالحجم فقط أسهمت في التلاعب' : 'مواءمة الحوافز مع السلوك المرغوب', act: ['تعريف السلوك المرغوب (الإبلاغ، الالتزام بالضوابط، إدارة المخاطر)', 'ربط جزء من المكافأة بمؤشرات الالتزام والجودة لا بالحجم فقط', 'حوافز غير مالية: التقدير والمسار المهني', 'مراجعة الحوافز للتأكد من عدم وجود حوافز مضرة'], out: ['إطار الحوافز المحدّث'], owner: 'الموارد البشرية', days: 60 }),
      P6: () => ({ why: has('WB') ? 'البلاغ وصل عبر البريد العام لغياب قناة رسمية' : 'تعزيز قنوات الإبلاغ', act: ['إطلاق قناة إبلاغ سرية متعددة الوسائل مع خيار عدم الإفصاح عن الهوية', 'ربط الأنظمة الحرجة بالتنبيهات الآلية (SIEM، المراقبة المستمرة للضوابط)', 'تصنيف البلاغات وتوجيهها حسب النوع والخطورة', 'حماية معلومات البلاغات والمبلغين'], out: ['قناة الإبلاغ', 'مصفوفة التوجيه'], owner: 'الامتثال والأمن السيبراني', days: 30 }),
      P7: () => ({ why: 'اكتشاف الأحداث بالبحث لا بانتظار البلاغ', act: ['خطة استقصاء: استبيانات وتقييم ذاتي منسق لتجنب الإرهاق', 'تحليلات بيانات للمعاملات والسجلات لاكتشاف الأنماط الشاذة', 'مقابلات الخروج وجولات ميدانية', 'توحيد نتائج كل المسارات في رؤية شاملة'], out: ['خطة الاستقصاء', 'تقرير النتائج'], owner: 'إدارة المخاطر والتدقيق', days: 60 }),
      P8: () => ({ why: n + ' أحداث تتطلب استجابة ومعالجة للأسباب الجذرية', act: ['استجابة متدرجة حسب الأثر: التصحيح والاستعادة والتحقيق والإفصاح', 'مراجعة ما بعد الحدث لكل حدث بخطورة ≥ 4 لتحديد السبب الجذري', 'تأديب متسق وإعادة تدريب', 'تحديد الإفصاحات الواجبة (مثل إشعار الجهة المختصة بتسرب البيانات خلال 72 ساعة)'], out: ['سجل الاستجابة', 'تقارير ما بعد الحدث'], owner: 'إدارة المخاطر والأمن السيبراني', days: 30 }),
      R1: () => ({ why: 'متابعة ' + c.controls.length + ' ضابطًا و' + c.risks.length + ' مؤشرات مخاطر', act: ['لوحة متابعة موحدة لمؤشرات KPI/KRI/KCI بنطاقات الرغبة والتحمل', 'قياس الأداء الشامل: الفعالية، الكفاءة، سرعة الاستجابة، المرونة', 'تحليل نتائج المتابعة شهريًا ورفع الضعف للإدارة', 'إعادة تقييم القدرة دوريًا عند تغير السياق'], out: ['لوحة المتابعة', 'تقرير الأداء الشامل'], owner: 'إدارة المخاطر', days: 45 }),
      R2: () => ({ why: 'المخاطر الحرجة تتطلب ضمانًا مستقلًا', act: ['خطة ضمان متكاملة تحدد من يضمن ماذا ومتى (خريطة الضمان)', 'تحديد مستوى الضمان المطلوب لكل مجال حسب الأولوية', 'تنفيذ تقييمات الضمان ومتابعة توصياتها', 'تحسين نهج الضمان بعد كل دورة'], out: ['خريطة الضمان', 'تقارير الضمان'], owner: 'التدقيق الداخلي', days: 90 }),
      R3: () => ({ why: 'تحويل الدروس المستفادة إلى تغيير فعلي', act: ['خطة تحسين مرتبة بالأولوية وممولة', 'تنفيذ مبادرات التحسين مع إدارة التغيير', 'متابعة إغلاق التحسينات وأثرها', 'تغذية النتائج عكسيًا إلى الدراسة والمواءمة والتنفيذ'], out: ['سجل التحسين'], owner: 'مكتب إدارة GRC', days: 120 })
    };
    const g = (G[e.c] || (() => ({ why: '', act: e.pr.slice(0, 4), out: [], owner: '', days: 60 })))();
    const linked = c.risks.filter(r => (KB.THEMES.find(t => t.id === r.theme).el || []).includes(e.c)).map(r => r.id);
    const tb = window.TFB && window.TFB.maturity ? window.TFB.maturity().els : {};
    const cur = +(tb && tb[e.c]) || Math.max(1, Math.min(3, 3 - Math.floor(linked.length / 2)));
    return { code: e.c, ar: e.ar, en: e.en, purpose: e.pu, practices: e.pr, tools: e.tl, why: g.why, actions: g.act, outputs: g.out, owner: g.owner,
      days: g.days, due: addDays(today(), g.days), cur, target: +(org.target || 4), linked, status: 'لم يبدأ' };
  }

  function buildRoadmap(c, els) {
    const ph = [['0–30 يومًا', 'الاستقرار والاحتواء', 30], ['31–60 يومًا', 'التأسيس', 60], ['61–90 يومًا', 'التشغيل', 90], ['91–180 يومًا', 'المتابعة والضمان والتحسين', 180]];
    return ph.map(([t, d, lim], i) => ({ t, d, items: els.filter(e => e.days <= lim && (i === 0 || e.days > ph[i - 1][2])).map(e => e.code + ' · ' + e.ar + ': ' + e.actions[0])
      .concat(i === 0 ? c.risks.filter(r => r.inh >= 15).map(r => 'معالجة عاجلة للخطر ' + r.id + ' — ' + r.cat) : []) }));
  }

  /* المرشد الداخلي: خطوات «ماذا سنفعل» */
  function advisor(S, G) {
    if (!G) return [];
    const crit = G.risks.filter(r => r.inh >= 15), opp = G.risks.filter(r => r.kind === 'فرصة');
    return [
      { k: 'data', t: 'راجع بيانات المنظمة والأحداث', d: 'سُجّل ' + G.evs.length + ' حدثًا وصُنّفت تلقائيًا إلى ' + G.order.length + ' موضوعات. أضف أي حدث جديد وسيُعاد بناء كل شيء تلقائيًا.' },
      { k: 'risks', t: 'اعتمد سجل المخاطر والفرص', d: crit.length + ' مخاطر حرجة تتطلب معالجة خلال 30 يومًا: ' + crit.map(r => r.cat).join('، ') + (opp.length ? '. ولديك ' + opp.length + ' فرصة يجب تقييمها بالمنهجية نفسها.' : '.') },
      { k: 'controls', t: 'شغّل الضوابط حسب الأولوية', d: G.controls.length + ' ضابطًا موزعة: ' + G.controls.filter(x => x.t === 'P').length + ' استباقي، ' + G.controls.filter(x => x.t === 'D').length + ' استقصائي، ' + G.controls.filter(x => x.t === 'R').length + ' استجابي — مع ضوابط حوكمة وضمان للمخاطر الحرجة.' },
      { k: 'policies', t: 'راجع حزمة السياسات واجمع التوقيعات', d: G.policies.length + ' سياسات كاملة بفهرس وجداول اعتماد وتوقيع لكل إدارة. حرّرها ثم اطبعها PDF أو صدّرها إلى Word.' },
      { k: 'model', t: 'نفّذ خطة العناصر العشرين', d: 'لكل عنصر من L1 إلى R3: لماذا الآن، ماذا سنفعل، المخرجات، المالك، الموعد، والنضج الحالي والمستهدف.' },
      { k: 'roadmap', t: 'اعرض النتائج على الإدارة', d: 'صدّر عرض PowerPoint تنفيذيًا وتقريرًا شاملًا قابلًا للطباعة، ثم تابع خارطة الطريق 30/60/90/180 يومًا.' }];
  }

  /* إجابات المرشد الداخلي */
  function answer(q, S, G) {
    q = (q || '').trim(); const L = q.toLowerCase(); if (!G) return 'أدخل البيانات والأحداث أولًا ثم اضغط «توليد».';
    const code = (q.match(/\b([LAPR][1-8])\b/i) || [])[1];
    if (code) { const e = G.elements.find(x => x.code === code.toUpperCase()); if (e) return `**${e.code} · ${e.ar}** — ${e.purpose}\n**لماذا الآن:** ${e.why}\n**ماذا سنفعل:**\n` + e.actions.map(a => '- ' + a).join('\n') + `\n**المخرجات:** ${e.outputs.join('، ')} · **المالك:** ${e.owner} · **الموعد:** ${e.due}`; }
    const th = KB.THEMES.find(t => t.kw.some(k => L.includes(k.toLowerCase())) || L.includes(t.ar));
    if (/مؤشر|kpi|kri|kci/.test(L) && G.kpis) return 'المؤشرات الرئيسية:\n' + G.kpis.filter(k => k.type !== 'KPI' || /^KPI-S/.test(k.id)).slice(0, 10).map(k => `- ${k.id} (${k.type}) ${k.name} — الأساس ${k.base} ← المستهدف ${k.target} · التحمل ${k.tol}`).join('\n') + '\nالتفاصيل والصياغة الكاملة في تبويب «الأهداف والمؤشرات».';
    if (/ضابط|ضوابط|control/.test(L)) { const cs = G.controls.filter(c => !th || c.theme === th.id).slice(0, 6); return (th ? `ضوابط «${th.ar}»:` : 'أهم الضوابط:') + '\n' + cs.map(c => `- ${c.id} (${TN[c.t]}): ${c.ar} — ${c.owner} · ${c.freq}`).join('\n'); }
    if (/سياس|policy/.test(L)) return 'حزمة السياسات المولّدة:\n' + G.policies.map(p => `- ${p.no} ${p.ar} — المالك: ${p.owner} · ${p.sections.length} أقسام`).join('\n') + '\nلاعتماد السياسة: راجعها ← وقّع الإعداد والمراجعة من الإدارات ← اعتماد الرئيس التنفيذي/اللجنة ← نشر وجمع الإقرارات.';
    if (/خطر|مخاطر|risk/.test(L)) { const rs = G.risks.filter(r => !th || r.theme === th.id).slice(0, 5); return 'المخاطر الأعلى:\n' + rs.map(r => `- ${r.id} ${r.title} — متأصل ${r.inh} ← متبقٍ ${r.res} · ${r.treat}`).join('\n'); }
    if (/التزام|تنظيم|امتثال|complian/.test(L)) return 'سجل الالتزامات:\n' + G.obligations.map(o => `- ${o.id} ${o.tag}: ${o.req} (${o.kind})`).join('\n');
    if (/ابدأ|ماذا|خطوة|خطة|next|start/.test(L)) return advisor(S, G).map((s, i) => `${i + 1}. **${s.t}** — ${s.d}`).join('\n');
    if (th) { const r = G.risks.find(x => x.theme === th.id); return `موضوع «${th.ar}»: ` + (r ? `الخطر ${r.id} (${r.inh})، ` : '') + 'بنود السياسة المقترحة:\n' + th.st.map(s => '- ' + s).join('\n'); }
    return 'يمكنني مساعدتك في: المخاطر، الضوابط، السياسات، الالتزامات، أو أي عنصر (مثال: P6 أو A5). اكتب مثلًا «ما ضوابط التصيد؟» أو «ماذا أفعل الآن؟».';
  }

  window.TFS_ENGINE = { generate, classify, advisor, answer, level, TN, TNE, today };
})();
