/* Track Ford · استوديو GRC الذكي — الأهداف والمؤشرات، أوراق العمل، الحفظ الذكي للتعديلات، والتفاعل الديناميكي بين العناصر
   تصميم وبرمجة وإعداد: د. محمد عطية */
(function () {
  'use strict';
  const KB = window.TFS_KB, TOOLS = window.TFS_TOOLS;
  const th = id => KB.THEMES.find(t => t.id === id);
  const pad = n => String(n).padStart(2, '0');
  const PERSP = ['المالي', 'العملاء', 'العمليات الداخلية', 'التعلم والنمو'];

  /* مواصفات المؤشرات لكل موضوع:
     [المنظور، الهدف، KPI (قيادي): الاسم، المعادلة، المستهدف، KRI: المعادلة، الوحدة، خط الأساس، المستهدف، الرغبة، التحمل، الاستيعاب، مصدر البيانات] */
  const IND = {
    IAM: ['العمليات الداخلية', 'إحكام إدارة الهويات والصلاحيات', 'نسبة الحسابات المميزة المراجعة ربع سنويًا', 'الحسابات المميزة المراجعة ÷ إجمالي الحسابات المميزة × 100', '100%', 'عدد الحسابات المميزة التي لم تُراجع خلال 90 يومًا', 'حساب', '37', '0', '0', '≤ 3', '≤ 10', 'نظام إدارة الهويات (IAM)'],
    MAL: ['العمليات الداخلية', 'رفع المرونة أمام البرمجيات الضارة والفدية', 'نسبة تغطية حماية الأجهزة الطرفية EDR', 'الأجهزة المحمية ÷ إجمالي الأجهزة × 100', '≥ 98%', 'عدد إصابات البرمجيات الضارة المؤكدة شهريًا', 'إصابة/شهر', '1', '0', '0', '≤ 1', '≤ 3', 'لوحة EDR ومركز العمليات الأمنية'],
    PHI: ['التعلم والنمو', 'بناء وعي أمني يقلل الوقوع في التصيّد', 'نسبة إكمال التوعية الأمنية الإلزامية', 'الموظفون المكملون ÷ إجمالي الموظفين × 100', '≥ 95%', 'نسبة النقر في محاكاة التصيّد', '%', '18%', '≤ 5%', '≤ 5%', '≤ 8%', '≤ 12%', 'منصة محاكاة التصيّد'],
    VUL: ['العمليات الداخلية', 'معالجة الثغرات ضمن المهل المعتمدة', 'نسبة الثغرات الحرجة المعالجة خلال 15 يومًا', 'الثغرات الحرجة المعالجة في المهلة ÷ إجمالي الحرجة × 100', '≥ 95%', 'عدد الثغرات الحرجة المفتوحة أكثر من 15 يومًا', 'ثغرة', '6', '0', '0', '≤ 2', '≤ 5', 'أداة فحص الثغرات'],
    LOG: ['العمليات الداخلية', 'رصد أمني شامل للأنظمة الحرجة', 'نسبة الأنظمة الحرجة المربوطة بنظام SIEM', 'الأنظمة المربوطة ÷ الأنظمة الحرجة × 100', '100%', 'متوسط زمن اكتشاف الحوادث (MTTD)', 'ساعة', '5', '≤ 1', '≤ 1', '≤ 4', '≤ 8', 'نظام SIEM'],
    BCM: ['العمليات الداخلية', 'ضمان استمرارية الخدمات الحرجة', 'نسبة اختبارات الاستعادة الناجحة', 'الاختبارات الناجحة ÷ الاختبارات المنفذة × 100', '100%', 'ساعات التوقف غير المخطط للخدمات الحرجة', 'ساعة/ربع', '6', '≤ 4', '≤ 4', '≤ 6', '≤ 12', 'سجل الحوادث ومراقبة التوفر'],
    DP: ['العملاء', 'امتثال كامل لنظام حماية البيانات الشخصية', 'نسبة الأنظمة المصنفة بياناتها والمحمية بـ DLP', 'الأنظمة المصنفة والمحمية ÷ أنظمة البيانات الشخصية × 100', '100%', 'عدد حوادث البيانات الشخصية المؤكدة', 'حادث/ربع', '1', '0', '0', '≤ 1', '≤ 2', 'سجل حوادث حماية البيانات'],
    TPR: ['العمليات الداخلية', 'إدارة مخاطر الأطراف الثالثة والسحابة', 'نسبة الموردين الحرجين المقيَّمين أمنيًا', 'الموردون المقيَّمون ÷ الموردين الحرجين × 100', '100%', 'عدد إخفاقات SLA للموردين الحرجين', 'إخفاق/ربع', '2', '0', '≤ 1', '≤ 2', '≤ 3', 'سجل الموردين وتقارير SLA'],
    FRD: ['المالي', 'خفض الخسائر الناتجة عن الاحتيال وسوء السلوك', 'نسبة المعاملات الخاضعة للمراجعة الثانية (Maker-Checker)', 'المعاملات بمراجعة ثانية ÷ إجمالي المعاملات × 100', '100%', 'قيمة الخسائر الناتجة عن الاحتيال', 'ريال/ربع', 'قيد القياس', '≤ 0.05% من المحفظة', '≤ 0.05%', '≤ 0.1%', '≤ 0.2%', 'نظام التمويل الأساسي والتحقيقات'],
    WB: ['التعلم والنمو', 'ثقافة إبلاغ آمنة وموثوقة', 'نسبة البلاغات المعالجة خلال 60 يومًا', 'البلاغات المغلقة في المهلة ÷ إجمالي البلاغات × 100', '≥ 90%', 'نسبة البلاغات غير المغلقة أكثر من 60 يومًا', '%', 'غير متاح (لا قناة)', '≤ 10%', '≤ 10%', '≤ 20%', '≤ 30%', 'نظام إدارة البلاغات'],
    REG: ['العمليات الداخلية', 'الاستجابة للتغيرات التنظيمية في المواعيد', 'نسبة المتطلبات الجديدة المقيَّم أثرها خلال 30 يومًا', 'المتطلبات المقيَّمة في المهلة ÷ المتطلبات الجديدة × 100', '100%', 'عدد الملاحظات الرقابية المفتوحة بعد موعدها', 'ملاحظة', '1', '0', '0', '≤ 1', '≤ 3', 'سجل الالتزامات'],
    CHG: ['العمليات الداخلية', 'تغييرات تقنية آمنة ومختبرة', 'نسبة التغييرات المعتمدة من مجلس التغيير CAB', 'التغييرات المعتمدة ÷ إجمالي التغييرات × 100', '100%', 'نسبة التغييرات الفاشلة', '%', '8%', '≤ 2%', '≤ 2%', '≤ 5%', '≤ 8%', 'نظام إدارة التغيير (ITSM)'],
    CX: ['العملاء', 'تجربة عميل عادلة وسريعة', 'نسبة الشكاوى المغلقة خلال 5 أيام عمل', 'الشكاوى المغلقة في المهلة ÷ إجمالي الشكاوى × 100', '≥ 90%', 'عدد الشكاوى لكل 10,000 عميل', 'شكوى', '+35% عن الربع السابق', 'انخفاض 30%', 'ضمن خط الأساس', '+10%', '+25%', 'نظام إدارة علاقات العملاء CRM'],
    OPP: ['المالي', 'اقتناص فرص النمو والابتكار ضمن الرغبة في المخاطر', 'نسبة المبادرات الجديدة المقيَّمة مخاطرها قبل الإطلاق', 'المبادرات المقيَّمة ÷ المبادرات المطلقة × 100', '100%', 'نسبة المبادرات المتأخرة عن مستهدفها', '%', '—', '≤ 10%', '≤ 10%', '≤ 20%', '≤ 30%', 'مكتب إدارة المشاريع']
  };
  const guessPersp = s => /نمو|إيراد|ربح|مالي|محفظ|تكلف/.test(s) ? 'المالي' : /عميل|عملاء|تجربة|رضا|سوق/.test(s) ? 'العملاء' : /كفاء|ثقاف|موظف|تعلم|مهار|قدرات/.test(s) ? 'التعلم والنمو' : 'العمليات الداخلية';
  const PERSP_KPI = {
    'المالي': ['معدل نمو المحفظة/الإيرادات', '(القيمة الحالية − السابقة) ÷ السابقة × 100', '+15% سنويًا', 'المالية', 'النظام المالي'],
    'العملاء': ['مؤشر صافي الترويج NPS', '% المروّجين − % المنتقدين', '≥ 45', 'خدمة العملاء', 'استبيان العملاء'],
    'العمليات الداخلية': ['نسبة الضوابط الفعالة في الاختبار', 'الضوابط الفعالة ÷ الضوابط المختبرة × 100', '≥ 90%', 'إدارة المخاطر', 'سجل اختبار الضوابط'],
    'التعلم والنمو': ['مؤشر ثقافة المخاطر (استبيان الثقافة)', 'متوسط النتائج الإيجابية للعدسات الثماني', '≥ 75%', 'الموارد البشرية', 'استبيان الثقافة']
  };
  const LEADS = { 'التعلم والنمو': 'العمليات الداخلية', 'العمليات الداخلية': 'العملاء', 'العملاء': 'المالي', 'المالي': 'الرؤية' };

  /* ───── توليد الأهداف من الرؤية والرسالة والاستراتيجية والمخاطر ───── */
  function genObjectives(org, G) {
    const out = [];
    const pillars = String(org.strategy || '').split(/\n|،|;/).map(x => x.trim()).filter(Boolean);
    pillars.forEach((p, i) => { const ps = guessPersp(p); out.push({ id: 'OBJ-S' + (i + 1), persp: ps, title: p, src: 'الاستراتيجية', owner: PERSP_KPI[ps][3], horizon: '12 شهرًا', leads: LEADS[ps], risks: '' }); });
    G.order.forEach(tid => {
      const s = IND[tid]; if (!s) return; const r = G.risks.find(x => x.theme === tid);
      out.push({ id: 'OBJ-' + tid, persp: s[0], title: s[1], src: (r ? 'المخاطر (' + r.id + ')' : 'المخاطر') + (org.mission ? ' + الرسالة' : ''), owner: th(tid).dept, horizon: r && r.inh >= 15 ? '6 أشهر' : '12 شهرًا', leads: LEADS[s[0]], risks: r ? r.id : '' });
    });
    if (org.vision) out.unshift({ id: 'OBJ-V', persp: 'المالي', title: 'تحقيق الرؤية: ' + org.vision, src: 'الرؤية', owner: 'الرئيس التنفيذي', horizon: '3 سنوات', leads: 'الرؤية', risks: '' });
    return out;
  }
  /* ───── توليد المؤشرات التفصيلية KPI / KRI / KCI ───── */
  function genKpis(org, G, objs) {
    const out = [];
    objs.filter(o => /^OBJ-(S\d+|V)$/.test(o.id)).forEach(o => {
      const k = PERSP_KPI[o.persp];
      out.push({ id: 'KPI-' + o.id.slice(4), type: 'KPI', name: k[0], obj: o.id, persp: o.persp, lead: 'لاحق', formula: k[1], unit: /NPS/.test(k[0]) ? 'نقطة' : '%', base: 'يُقاس في الربع الأول', target: k[2], appetite: '—', tol: '±10% من المستهدف', cap: '—', freq: 'ربع سنوي', owner: k[3], src: k[4], links: o.title });
    });
    G.order.forEach(tid => {
      const s = IND[tid], t = th(tid); if (!s) return;
      const r = G.risks.find(x => x.theme === tid), cs = G.controls.filter(c => c.theme === tid);
      out.push({ id: 'KPI-' + tid, type: 'KPI', name: s[2], obj: 'OBJ-' + tid, persp: s[0], lead: 'قيادي', formula: s[3], unit: '%', base: 'يُقاس', target: s[4], appetite: '—', tol: '−5% من المستهدف', cap: '—', freq: 'شهري', owner: t.dept, src: s[12], links: 'OBJ-' + tid });
      out.push({ id: 'KRI-' + tid, type: 'KRI', name: t.kri, obj: 'OBJ-' + tid, persp: s[0], lead: 'قيادي', formula: s[5], unit: s[6], base: s[7], target: s[8], appetite: s[9], tol: s[10], cap: s[11], freq: 'شهري', owner: 'إدارة المخاطر', src: s[12], links: (r ? r.id : '') + (r && r.events.length ? ' · ' + r.events.join(' ') : '') });
      const c0 = cs.find(c => c.t === 'P') || cs[0];
      if (c0) out.push({ id: 'KCI-' + tid, type: 'KCI', name: c0.kci, obj: 'OBJ-' + tid, persp: s[0], lead: 'قيادي', formula: 'نتيجة اختبار تشغيل الضابط ' + c0.id, unit: '%', base: 'لم يُختبر', target: /=|≥|≤/.test(c0.kci) ? c0.kci.split(/=|≥|≤/).pop().trim() : '100%', appetite: '—', tol: '≥ 95%', cap: '—', freq: c0.freq === 'مستمر' ? 'شهري' : c0.freq, owner: c0.owner, src: c0.ev, links: c0.id });
    });
    return out;
  }
  const wording = k => `«${k.name}» — ${k.type === 'KRI' ? 'مؤشر خطر' : k.type === 'KCI' ? 'مؤشر ضابط' : 'مؤشر أداء'} ${k.lead} يُحسب بالمعادلة: ${k.formula}، بوحدة ${k.unit}، من ${k.src}، بتكرار ${k.freq}. خط الأساس ${k.base} والمستهدف ${k.target}` + (k.type === 'KRI' ? `؛ الرغبة ${k.appetite}، والتحمل ${k.tol} (تصعيد للجنة المخاطر عند تجاوزه)، والاستيعاب ${k.cap}` : `؛ نطاق التحمل ${k.tol}`) + `. المالك: ${k.owner}.`;

  /* ───── دمج ذكي: يحفظ تعديلات المستخدم وصفوفه، ويستبدل التلقائي غير المعدّل ───── */
  function merge(prev, auto, key, delSet, delPrefix) {
    prev = prev || []; const pm = new Map(prev.map(r => [r[key], r])), seen = new Set(), out = [];
    auto.forEach(a => {
      if (delSet[delPrefix + a[key]]) return; seen.add(a[key]);
      const p = pm.get(a[key]);
      out.push(p && (p._e || !p._a) ? p : Object.assign({ _a: 1 }, a));
    });
    prev.forEach(p => { if (!seen.has(p[key]) && (!p._a || p._e)) out.push(p); });
    return out;
  }

  /* ───── تجاوزات المستخدم على السجلات المولّدة (تبقى بعد إعادة التوليد) ───── */
  const OVK = { risks: r => r.theme, controls: c => c.id, obligations: o => o.tag, elements: e => e.code };
  function applyOv(S, G) {
    S.ov = S.ov || {};
    Object.keys(OVK).forEach(coll => (G[coll] || []).forEach(x => {
      const o = S.ov[coll + ':' + OVK[coll](x)]; if (!o) return;
      Object.keys(o).forEach(f => {
        const path = f.split('.'); let t = x;
        for (let i = 0; i < path.length - 1; i++) t = t[path[i]];
        const k = path[path.length - 1]; t[k] = typeof t[k] === 'number' ? (+o[f] || 0) : o[f];
      });
      if (coll === 'risks') { x.inh = x.L * x.I; x.res = x.rL * x.rI; }
    }));
  }
  function recordOv(S, path, val) {
    const p = path.split('.'); if (p[0] !== 'gen' || !OVK[p[1]]) return;
    const x = S.gen[p[1]][+p[2]]; if (!x) return;
    S.ov = S.ov || {}; const k = p[1] + ':' + OVK[p[1]](x);
    (S.ov[k] = S.ov[k] || {})[p.slice(3).join('.')] = val;
  }

  /* ───── أوراق العمل لكل أداة ───── */
  function autoRows(tid, ctx) {
    const t = TOOLS.T[tid]; let rows = [];
    try { rows = t.gen(ctx) || []; } catch (e) { rows = []; }
    return rows.filter(Boolean).map(c => ({ k: c.slice(0, 2).join('|'), c: c.map(v => v == null ? '' : String(v)) }));
  }

  /* ───── الإثراء بعد كل توليد ───── */
  function enrich(S, G) {
    S.del = S.del || {}; S.ws = S.ws || {};
    applyOv(S, G);
    G.objectives = merge(S.objs, genObjectives(S.org, G), 'id', S.del, 'obj:'); S.objs = G.objectives;
    G.kpis = merge(S.kpis, genKpis(S.org, G, G.objectives), 'id', S.del, 'kpi:'); S.kpis = G.kpis;
    const ctx = Object.assign({ org: S.org }, G);
    Object.keys(TOOLS.T).forEach(tid => { S.ws[tid] = merge(S.ws[tid], autoRows(tid, ctx), 'k', S.del, 'ws:' + tid + ':'); });
    return G;
  }

  /* ───── التفاعل الديناميكي: دراسة الحدث حسب كل عنصر ───── */
  const TYPE_EL = { 'حادث': ['P8', 'R2'], 'ملاحظة تدقيق': ['L2', 'R2', 'R3'], 'تغيير تنظيمي': ['L1', 'P2', 'P3'], 'طرف ثالث': ['L1', 'L4'], 'بلاغ': ['P6', 'P8', 'L3'], 'مؤشر': ['R1', 'A2'], 'فرصة': ['L1', 'A1', 'A2'], 'قرار': ['A1', 'A2', 'P3'] };
  function affected(ev) {
    const s = new Set(['A3', 'A4', 'A5', 'P1', 'R1', 'R3']);
    (ev.themes || []).forEach(t => (th(t).el || []).forEach(e => s.add(e)));
    (TYPE_EL[ev.type] || []).forEach(e => s.add(e)); if (+ev.sev >= 4) { s.add('P8'); s.add('R2'); }
    if (ev.srcEl) s.add(ev.srcEl);
    const ord = window.TFS_EL.map(e => e.c); return ord.filter(c => s.has(c));
  }
  function study(ev, G) {
    const t = th(ev.themes[0]), r = G.risks.find(x => x.theme === t.id) || {}, cs = G.controls.filter(c => c.theme === t.id), pol = G.policies.find(p => p.id === t.pol) || {};
    const kri = (G.kpis || []).find(k => k.id === 'KRI-' + t.id), obj = (G.objectives || []).find(o => o.id === 'OBJ-' + t.id);
    const lv = window.TFS_ENGINE.level(r.inh || 0)[0];
    const M = {
      L1: `إضافة الإشارة «${ev.title}» إلى PESTLE وصنع المعنى، وتقييم أثرها على السياق الخارجي وتعيين مالك ومحفز إعادة نظر`,
      L2: `تحديث SWOT الداخلي: نقطة ضعف «${t.risk.cause}» مع الدليل ${ev.id}`,
      L3: `فحص الأثر الثقافي: هل يعكس الحدث نمطًا سلوكيًا؟ إضافة عبارة لاستبيان الثقافة وملاحظة إثنوغرافية في ${ev.dept}`,
      L4: `تحديث سجل أصحاب المصلحة المتأثرين (${t.id === 'CX' || t.id === 'DP' ? 'العملاء والجهة الرقابية' : 'الإدارة والجهات المعنية'}) وخطة التواصل معهم`,
      A1: `مراجعة التوجه وبيان الرغبة في المخاطر في ضوء ${ev.type === 'قرار' ? 'القرار' : 'الحدث'} «${ev.title}»`,
      A2: obj ? `تحديث الهدف ${obj.id} «${obj.title}» ومؤشره ${kri ? kri.id : ''}` : 'صياغة هدف ومؤشر جديدين',
      A3: `تعريف/تحديث ${r.id || 'خطر جديد'} «${t.risk.ar}» في السجل وربطه بالحدث ${ev.id}`,
      A4: r.id ? `تحليل: احتمالية ${r.L} × أثر ${r.I} = ${r.inh} (${lv}) ← متبقٍ ${r.res}؛ Bowtie: «${t.risk.cause}» ← «${t.risk.cons}»` : 'تحليل الاحتمالية والأثر',
      A5: `تصميم ${cs.length} ضوابط (${cs.filter(c => c.t === 'P').length} استباقي/${cs.filter(c => c.t === 'D').length} استقصائي/${cs.filter(c => c.t === 'R').length} استجابي) — منها: ${cs.slice(0, 2).map(c => c.ar).join('؛ ')}`,
      P1: cs[0] ? `تشغيل ${cs[0].id} فورًا وتوثيق دليل التشغيل (${cs[0].ev})` : 'تشغيل الضوابط',
      P2: pol.ar ? `تحديث «${pol.ar}» — قسم «${t.ar}» وإعادة جمع التوقيعات والإقرارات` : 'تحديث السياسة المرتبطة',
      P3: `إبلاغ ${+ev.sev >= 4 ? 'لجنة المخاطر والإدارة التنفيذية' : 'الإدارة المعنية'}${t.id === 'DP' || t.id === 'REG' ? ' والجهة الرقابية ضمن المهل النظامية' : ''}`,
      P4: `وحدة تعلم مصغّرة (4 دقائق) مستفادة من «${ev.title}» لموظفي ${ev.dept}`,
      P5: `مراجعة الحوافز ذات العلاقة والتأكد من عدم وجود حوافز مضرة`,
      P6: `تفعيل/تحسين قناة الإبلاغ والتنبيه الآلي على «${t.ar}»`,
      P7: `استقصاء مماثل في الإدارات الأخرى بتحليل البيانات والسجلات`,
      P8: `استجابة متدرجة (احتواء ← تصحيح ← استعادة ← تحقيق) ومراجعة ما بعد الحدث AAR خلال 10 أيام`,
      R1: kri ? `متابعة ${kri.id} «${kri.name}» ${kri.freq} مقابل التحمل ${kri.tol}` : 'إضافة مؤشر للمتابعة',
      R2: `إدراج «${t.ar}» في خريطة الضمان — ${r.inh >= 15 ? 'تدقيق هذا العام (ضمان معقول)' : 'ضمن الدورة الاعتيادية (ضمان محدود)'}`,
      R3: `مبادرة تحسين للسبب الجذري «${t.risk.cause}» وتغذية النتائج عكسيًا إلى المواءمة والتنفيذ`
    };
    return affected(ev).map(c => ({ el: c, txt: M[c] }));
  }
  /* لقطة لمقارنة ما قبل وما بعد */
  function snap(S, G) {
    return { risks: Object.fromEntries(G.risks.map(r => [r.theme, { id: r.id, inh: r.inh, res: r.res }])), ctl: new Set(G.controls.map(c => c.id)), pol: Object.fromEntries(G.policies.map(p => [p.id, p.sections.length])),
      obl: Object.fromEntries(G.obligations.map(o => [o.tag, o.controls.length])), objs: new Set((G.objectives || []).map(o => o.id)), kpis: new Set((G.kpis || []).map(k => k.id)),
      ws: Object.fromEntries(Object.keys(S.ws || {}).map(k => [k, S.ws[k].map(r => r.c.join('|')).join('¦')])), cur: Object.fromEntries(G.elements.map(e => [e.code, e.linked.length])) };
  }
  function impact(b, S, G, ev) {
    const out = { L: [], A: [], P: [], R: [] }, add = (st, t) => out[st].push(t);
    G.risks.forEach(r => { const o = b.risks[r.theme]; if (!o) add('A', `🆕 ${r.kind} جديد ${r.id} «${r.title}» (${r.inh})`); else if (o.inh !== r.inh) add('A', `↑ ${r.id} تغيّر المستوى المتأصل ${o.inh} ← ${r.inh}`); });
    G.obligations.forEach(o => { if (b.obl[o.tag] != null && b.obl[o.tag] !== o.controls.length) add('A', `🔗 التزام ${o.id} (${o.tag}): ضوابط مغطية ${b.obl[o.tag]} ← ${o.controls.length}`); });
    (G.objectives || []).forEach(o => { if (!b.objs.has(o.id)) add('A', `🎯 هدف جديد ${o.id} «${o.title}»`); });
    const nk = (G.kpis || []).filter(k => !b.kpis.has(k.id)); nk.forEach(k => add('R', `📈 مؤشر جديد ${k.id} (${k.type}) «${k.name}»`));
    const nc = G.controls.filter(c => !b.ctl.has(c.id)); if (nc.length) add('P', `🛡️ ${nc.length} ضوابط جديدة: ${nc.slice(0, 4).map(c => c.id).join('، ')}${nc.length > 4 ? '…' : ''}`);
    G.policies.forEach(p => { if (b.pol[p.id] == null) add('P', `📘 سياسة جديدة «${p.ar}»`); else if (b.pol[p.id] !== p.sections.length) add('P', `📘 «${p.ar}»: أقسام ${b.pol[p.id]} ← ${p.sections.length}`); });
    Object.keys(S.ws).forEach(k => { const now = S.ws[k].map(r => r.c.join('|')).join('¦'); if (b.ws[k] !== now) { const t = TOOLS.T[k]; add(t.el[0], `📋 ${t.el} · ${t.ar}: حُدّثت (${S.ws[k].length} صفًا)`); } });
    if (+ev.sev >= 4) add('R', `🔍 ${ev.id} ضمن خطة الضمان R2 ومراجعة ما بعد الحدث`);
    return out;
  }

  window.TFS_DYN = { enrich, recordOv, merge, genObjectives, genKpis, wording, study, affected, snap, impact, PERSP, IND, autoRows };
})();
