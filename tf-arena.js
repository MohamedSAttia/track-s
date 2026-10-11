/* Track Ford GRCP® — ساحة الذكاء الاصطناعي: أنشطة وتمارين وألعاب مدعومة بالذكاء الاصطناعي
   أربعة أنشطة تعمل بمحرك مدمج دائمًا، وتتحوّل تلقائيًا إلى Claude عبر /api/ai عند تفعيله على الخادم:
   ① محاكي الحوادث  ② سباق تصنيف العناصر  ③ الممتحن الشفهي  ④ مُحلّل الحالة الواقعية */
(function () {
  'use strict';
  const LS = 'grcpArena';
  const rd = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const wr = v => { try { localStorage.setItem(LS, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ai = () => !!(window.TFAI && window.TFAI.ok);
  const SYS = 'أنت مدرّب معتمد لشهادة GRCP من OCEG، خبير بنموذج قدرات GRC 3.5 (المكوّنات LEARN/ALIGN/PERFORM/REVIEW والعناصر L1–L4, A1–A5, P1–P8, R1–R3). تجيب بالعربية الفصحى المختصرة، وتستشهد بمصطلحات النموذج الرسمية، وتذكر رقم الصفحة من الكتاب الأحمر عند الإمكان.';
  const EL = {
    L1: ['السياق الخارجي', 'External Context'], L2: ['السياق الداخلي', 'Internal Context'], L3: ['الثقافة', 'Culture'], L4: ['أصحاب المصلحة', 'Stakeholders'],
    A1: ['التوجيه', 'Direction'], A2: ['الأهداف', 'Objectives'], A3: ['التحديد', 'Identification'], A4: ['التقييم', 'Assessment'], A5: ['التصميم', 'Design'],
    P1: ['الضوابط', 'Controls'], P2: ['السياسات', 'Policies'], P3: ['التواصل', 'Communication'], P4: ['التثقيف', 'Education'], P5: ['الحوافز', 'Incentives'], P6: ['الإخطار', 'Notification'], P7: ['الاستقصاء', 'Inquiry'], P8: ['الاستجابة', 'Response'],
    R1: ['المتابعة', 'Monitoring'], R2: ['الضمان', 'Assurance'], R3: ['التحسين', 'Improvement'] };
  const COMP = { L: ['الدراسة', 'LEARN', '#EA580C'], A: ['المواءمة', 'ALIGN', '#0F766E'], P: ['التنفيذ', 'PERFORM', '#1D4ED8'], R: ['المراجعة', 'REVIEW', '#047857'] };
  const org = () => { try { const p = window.TFB && window.TFB.profile(); return p && p.name ? p : null; } catch (e) { return null; } };
  const orgName = () => (org() || {}).name || 'شركة السعيد';

  /* ───────── ① محاكي الحوادث ───────── */
  const SCEN = [
    { t: 'تسرّب بيانات عبر مورّد', s: 'الساعة 11:40 مساءً. أبلغ مورّد خدمات الفوترة عن «نشاط غير معتاد» على خوادمه، وبيانات 40,000 عميل قد تكون تأثرت. لم يُسمع من المورّد منذ ساعة.', steps: [
      { q: 'قرارك الأول؟', o: [['تفعيل خطة الاستجابة للحوادث وتشكيل فريق الأزمة فورًا', 3, 'P8', 'الاستجابة المنظّمة أولًا؛ خطة الاستجابة (P8) تُفعَّل عند الاشتباه لا بعد التأكد.'], ['انتظار تأكيد المورّد قبل أي خطوة', 0, 'P8', 'الانتظار يُفقد نافذة الإخطار النظامي (72 ساعة لدى كثير من الجهات) ويُضاعف الأثر.'], ['إرسال تعميم فوري لكل العملاء', 1, 'P3', 'التواصل مهم لكن قبل تقدير النطاق يولّد ذعرًا ومعلومات غير دقيقة.']] },
      { q: 'من يجب إخطاره خلال الساعات الأولى؟', o: [['الإدارة التنفيذية، الجهة التنظيمية وفق المتطلبات، والمستشار القانوني', 3, 'P6', 'الإخطار (P6) الداخلي والخارجي وفق الالتزامات الإلزامية المحدّدة في A3.'], ['فريق تقنية المعلومات فقط حتى تتضح الصورة', 1, 'P6', 'حصر المعرفة يؤخر قرارات الإدارة ويخالف خطوط المساءلة.'], ['الصحافة لاحتواء السمعة', 0, 'P3', 'التواصل الخارجي يأتي بعد التحقق وبرسالة معتمدة.']] },
      { q: 'بعد احتواء الحادثة، ما الخطوة التي تعكس نضجًا حقيقيًا؟', o: [['تحقيق مستقل (P7) وتحليل الأسباب الجذرية ثم تحديث الضوابط وعقود المورّدين (R3)', 3, 'R3', 'التحسين (R3) يغلق الدائرة: من الحادثة إلى تعديل الضوابط والسياسات وإدارة الطرف الثالث.'], ['معاقبة الموظف المسؤول عن العقد', 0, 'P5', 'العقاب دون تحليل جذري يعزز ثقافة الإخفاء (L3).'], ['إنهاء التعاقد مع المورّد فورًا', 1, 'A5', 'قد يكون جزءًا من الاستجابة، لكن دون تحليل لا يمنع التكرار.']] }] },
    { t: 'بلاغ احتيال عبر الخط الساخن', s: 'وصل بلاغ مجهول عبر الخط الساخن يتهم مدير المشتريات بتوجيه عقود إلى شركة يملكها قريبه بقيمة 2.4 مليون ريال.', steps: [
      { q: 'كيف تتعامل مع البلاغ؟', o: [['تسجيله وتقييمه وفق إجراء الاستقصاء (P7) مع حماية سرية المُبلّغ', 3, 'P7', 'الاستقصاء المنهجي المستقل هو جوهر P7، وحماية المُبلّغ شرط لاستمرار P6.'], ['تجاهله لأنه مجهول المصدر', 0, 'P6', 'النموذج يشجّع قنوات الإبلاغ المجهولة؛ التجاهل يقتل الثقة في القناة.'], ['مواجهة المدير مباشرة بالاتهام', 0, 'P7', 'المواجهة قبل جمع الأدلة تُفسد التحقيق وقد تنتهك حقوقه.']] },
      { q: 'ثبت تضارب المصالح. ما الإجراء المتوازن؟', o: [['إجراء تأديبي متناسب وفق سياسة معتمدة، واسترداد ما أمكن، وإبلاغ الجهات إن لزم', 3, 'P5', 'الحوافز (P5) تشمل الجزاءات المتناسبة والمعلنة مسبقًا في السياسات (P2).'], ['نقل المدير إلى إدارة أخرى بهدوء', 0, 'L3', 'الرسالة الثقافية: المخالفة بلا عاقبة — تآكل النزاهة.'], ['فصل كل فريق المشتريات', 0, 'P5', 'عقاب جماعي غير متناسب ويخالف العدالة الإجرائية.']] },
      { q: 'ما الضابط الاستباقي الذي كان سيمنع الحادثة؟', o: [['إقرار سنوي لتضارب المصالح مع فحص آلي لعلاقات المورّدين', 3, 'P1', 'ضابط استباقي (Proactive) موثّق ومُختبر — P1.'], ['مراجعة داخلية بعد نهاية كل سنة', 1, 'R2', 'الضمان كشفي لاحق، لا يمنع الحادثة.'], ['زيادة رواتب المشتريات', 0, 'P5', 'لا علاقة سببية مثبتة؛ الحوافز وحدها لا تغني عن الضوابط.']] }] },
    { t: 'تغيير تنظيمي مفاجئ', s: 'أصدرت الجهة التنظيمية لائحة جديدة تُلزم بتصنيف البيانات وحمايتها خلال 90 يومًا، وعلمت بها المنظمة من خبر صحفي.', steps: [
      { q: 'ما الفجوة التي كشفها ذلك أولًا؟', o: [['ضعف رصد السياق الخارجي (L1) وغياب قناة رسمية للتغيّرات التنظيمية', 3, 'L1', 'المعرفة من الصحافة = لا يوجد رصد منهجي للسياق الخارجي.'], ['ضعف التدريب (P4)', 1, 'P4', 'قد يكون لاحقًا، لكن الجذر هو الرصد.'], ['غياب الخط الساخن (P6)', 0, 'P6', 'غير ذي صلة بالموقف.']] },
      { q: 'ما أول خطوة عملية؟', o: [['تسجيل الالتزام الجديد في سجل الالتزامات (A3) وتقييم أثره (A4) وتصميم خطة (A5)', 3, 'A3', 'سلسلة المواءمة: تحديد → تقييم → تصميم.'], ['شراء نظام تصنيف بيانات فورًا', 1, 'A5', 'حل قبل التحليل؛ قد لا يناسب نطاق الالتزام.'], ['طلب تمديد من الجهة التنظيمية', 1, 'L4', 'قد يكون جزءًا من إدارة أصحاب المصلحة، لكن ليس بديلًا عن المعالجة.']] },
      { q: 'كيف تضمن عدم تكرار المفاجأة؟', o: [['مؤشر امتثال رئيسي (KCI) لرصد التغيّرات التنظيمية ضمن المتابعة (R1) مع مالك محدد', 3, 'R1', 'المتابعة المستمرة بمؤشرات وحدود إنذار — R1.'], ['الاشتراك في نشرة إخبارية', 1, 'L1', 'خطوة جزئية بلا مالك ولا مؤشر.'], ['تعيين مستشار قانوني خارجي دائم', 1, 'R2', 'قد يساعد لكنه لا يبني قدرة داخلية.']] }] }];
  function incident(host) {
    const S = { sc: null, i: 0, score: 0, log: [] };
    const start = async (useAI) => {
      host.querySelector('#inc').innerHTML = '<div class="ar-note">جارٍ تجهيز السيناريو…</div>';
      S.sc = null; S.i = 0; S.score = 0; S.log = [];
      if (useAI && ai()) {
        try {
          const o = org();
          const r = await window.TFAI.json(`أنشئ سيناريو حادثة واقعي لمنظمة اسمها «${orgName()}»${o && o.sector ? ' في قطاع ' + o.sector : ''} بالسعودية، لتدريب متدربي GRCP على اتخاذ القرار وفق نموذج قدرات GRC 3.5. الشكل: {"t":"عنوان","s":"وصف الموقف في 3 جمل","steps":[{"q":"سؤال القرار","o":[["خيار",درجة 0-3,"رمز العنصر مثل P8","تعليق تعليمي قصير"],...3 خيارات]}, ... 4 خطوات]}. اجعل خيارًا واحدًا فقط بدرجة 3 في كل خطوة، واربط كل خيار بعنصر صحيح من النموذج.`, SYS, { max_tokens: 2500 });
          if (r && r.steps && r.steps.length >= 3) S.sc = r;
        } catch (e) {}
      }
      if (!S.sc) S.sc = SCEN[Math.floor(Math.random() * SCEN.length)];
      step();
    };
    const step = () => {
      const sc = S.sc, el = host.querySelector('#inc');
      if (S.i >= sc.steps.length) { const max = sc.steps.length * 3, pct = Math.round(S.score / max * 100); save('incident', pct);
        el.innerHTML = `<div class="ar-res"><div class="ar-big">${pct}%</div><div>${pct >= 80 ? 'قرارات مسؤول حماية ناضج — استجابة منظّمة وتعلّم من الحادثة.' : pct >= 50 ? 'قرارات مقبولة؛ راجع العناصر المميزة بالأحمر أدناه.' : 'الحادثة أُديرت بردود فعل لا بمنهجية — أعد المحاولة بعد مراجعة PERFORM.'}</div></div>
        <ol class="ar-log">${S.log.map(l => `<li><b>${esc(l.q)}</b><br>اخترت: ${esc(l.pick)} <span class="ar-tag" style="background:${l.sc === 3 ? '#047857' : l.sc >= 1 ? '#A97A26' : '#B91C1C'}">${l.sc}/3 · ${esc(l.el)}</span><br><small>${esc(l.fb)}</small></li>`).join('')}</ol>
        <div class="ar-btns"><button class="ar-btn" id="incAgain">سيناريو آخر</button>${ai() ? '<button class="ar-btn gold" id="incAI">🤖 سيناريو جديد بالذكاء الاصطناعي</button>' : ''}</div>`;
        el.querySelector('#incAgain').onclick = () => start(false); const b = el.querySelector('#incAI'); if (b) b.onclick = () => start(true); return; }
      const st = sc.steps[S.i];
      el.innerHTML = `<div class="ar-scn"><b>${esc(sc.t)}</b><p>${esc(sc.s)}</p></div><div class="ar-q">الخطوة ${S.i + 1} من ${sc.steps.length} — ${esc(st.q)}</div><div class="ar-opts">${st.o.map((o, k) => `<button class="ar-opt" data-k="${k}">${esc(o[0])}</button>`).join('')}</div><div id="incFb"></div>`;
      el.querySelectorAll('.ar-opt').forEach(b => b.onclick = () => {
        const o = st.o[+b.dataset.k]; const sc3 = Math.max(0, Math.min(3, +o[1] || 0)); S.score += sc3; S.log.push({ q: st.q, pick: o[0], sc: sc3, el: o[2], fb: o[3] });
        el.querySelectorAll('.ar-opt').forEach((x, k) => { x.disabled = true; if (st.o[k][1] >= 3) x.classList.add('ok'); if (k === +b.dataset.k && sc3 < 3) x.classList.add('bad'); });
        el.querySelector('#incFb').innerHTML = `<div class="ar-fb"><span class="ar-tag" style="background:${COMP[(o[2] || 'P')[0]][2]}">${esc(o[2])} · ${esc((EL[o[2]] || [''])[0])}</span> ${esc(o[3])}<br><button class="ar-btn" id="incNext">${S.i + 1 < sc.steps.length ? 'الخطوة التالية ←' : 'النتيجة'}</button></div>`;
        el.querySelector('#incNext').onclick = () => { S.i++; step(); };
      });
    };
    host.innerHTML = `<div class="ar-head"><h3>🚨 محاكي الحوادث</h3><p>موقف حقيقي يتطوّر خطوة بخطوة؛ كل قرار يُقيَّم وفق عناصر النموذج. ${ai() ? 'الذكاء الاصطناعي يولّد سيناريوهات جديدة لقطاعك.' : 'ثلاثة سيناريوهات مدمجة (يتفعّل توليد سيناريوهات جديدة عند تشغيل الخادم).'}</p></div><div id="inc"></div>`;
    start(ai());
  }

  /* ───────── ② سباق تصنيف العناصر ───────── */
  const BANK = [['رصد التغيّرات في اللوائح وأسعار السوق والتقنيات الناشئة', 'L1'], ['توثيق خريطة العمليات والأصول الحرجة', 'L2'], ['استبيان سنوي يقيس ثقافة النزاهة', 'L3'], ['سجل بتوقعات العملاء والجهات التنظيمية والمستثمرين', 'L4'], ['اعتماد المجلس لبيان شهية المخاطر', 'A1'], ['تسلسل أهداف SMART من المنظمة إلى الإدارات', 'A2'], ['حصر الالتزامات الإلزامية والطوعية في سجل موحّد', 'A3'], ['تقدير الاحتمالية والأثر للخطر الكامن والمتبقي', 'A4'], ['اختيار مزيج استجابات: تجنّب، مشاركة، تحكّم، قبول', 'A5'], ['فصل المهام في دورة المدفوعات', 'P1'], ['دورة حياة السياسات: صياغة واعتماد ونشر وإقرار', 'P2'], ['تقرير GRC ربع سنوي للجنة المراجعة', 'P3'], ['تدريب قائم على الأدوار لموظفي المشتريات', 'P4'], ['ربط المكافآت بمؤشرات السلوك المنضبط', 'P5'], ['خط ساخن سري لاستقبال البلاغات', 'P6'], ['تحقيق مستقل في بلاغ تضارب مصالح', 'P7'], ['خطة استمرارية أعمال تُختبر سنويًا', 'P8'], ['لوحة مؤشرات KRI بحدود إنذار مبكر', 'R1'], ['مراجعة داخلية تقدّم رأيًا موضوعيًا مبنيًا على المخاطر', 'R2'], ['سجل دروس مستفادة يُحوَّل إلى تعديلات في الضوابط', 'R3'], ['تحليل أصحاب المصلحة وخطة التواصل معهم', 'L4'], ['تحديد الفرص الناشئة من التحوّل الرقمي', 'A3'], ['إقرار الموظفين الإلكتروني بمدونة السلوك', 'P2'], ['إجراء كشفي: مطابقة الحسابات البنكية شهريًا', 'P1'], ['إعلان القيم والرسالة والرؤية', 'A1'], ['قياس أثر التدريب على سلوك الموظفين', 'P4'], ['اختبار الضوابط الرئيسية بواسطة الخط الثاني', 'R2'], ['تحديث شهية المخاطر بعد تغيّر السوق', 'R3'], ['رصد منافس جديد يغيّر هيكل التسعير', 'L1'], ['تحليل الثقافة الفرعية في فرع بعيد', 'L3']];
  function classify(host) {
    let qs = [], i = 0, ok = 0, t0 = 0, timer = null;
    const render = () => {
      const q = qs[i], el = host.querySelector('#cls');
      if (!q) { clearInterval(timer); const sec = Math.round((Date.now() - t0) / 1000), pct = Math.round(ok / qs.length * 100); save('classify', pct);
        el.innerHTML = `<div class="ar-res"><div class="ar-big">${ok}/${qs.length}</div><div>${pct}% خلال ${sec} ثانية — ${pct >= 85 ? 'تمييز ممتاز بين العناصر؛ هذه مهارة الاختبار الأساسية.' : pct >= 60 ? 'جيد؛ راجع الفروق بين عناصر PERFORM المتقاربة (P1/P2/P3).' : 'ركّز على جدول العناصر العشرين قبل إعادة المحاولة.'}</div></div><div class="ar-btns"><button class="ar-btn" id="clsAgain">جولة جديدة</button>${ai() ? '<button class="ar-btn gold" id="clsAI">🤖 جمل جديدة بالذكاء الاصطناعي</button>' : ''}</div>`;
        el.querySelector('#clsAgain').onclick = () => start(false); const b = el.querySelector('#clsAI'); if (b) b.onclick = () => start(true); return; }
      el.innerHTML = `<div class="ar-q">${i + 1}/${qs.length} · <span id="clsT">0</span>s — إلى أي عنصر تنتمي هذه الممارسة؟</div><div class="ar-stmt">${esc(q[0])}</div><div class="ar-grid">${Object.keys(EL).map(k => `<button class="ar-el" data-k="${k}" style="border-color:${COMP[k[0]][2]}"><b>${k}</b> ${EL[k][0]}</button>`).join('')}</div><div id="clsFb"></div>`;
      el.querySelectorAll('.ar-el').forEach(b => b.onclick = () => { const good = b.dataset.k === q[1]; if (good) ok++; el.querySelectorAll('.ar-el').forEach(x => { x.disabled = true; if (x.dataset.k === q[1]) x.classList.add('ok'); }); if (!good) b.classList.add('bad');
        el.querySelector('#clsFb').innerHTML = `<div class="ar-fb">${good ? '✅ صحيح' : '❌ الصحيح: ' + q[1] + ' ' + EL[q[1]][0]} — ${esc(q[2] || ('عنصر ' + EL[q[1]][0] + ' (' + EL[q[1]][1] + ') ضمن مكوّن ' + COMP[q[1][0]][0] + '.'))}</div>`; setTimeout(() => { i++; render(); }, good ? 700 : 1800); });
    };
    const start = async (useAI) => {
      host.querySelector('#cls').innerHTML = '<div class="ar-note">جارٍ التجهيز…</div>'; qs = []; i = 0; ok = 0;
      if (useAI && ai()) { try { const r = await window.TFAI.json(`أنشئ 10 ممارسات قصيرة (جملة واحدة لكل منها) من واقع منظمة سعودية في قطاع ${((org() || {}).sector) || 'الخدمات'}، كل ممارسة تنتمي بوضوح إلى عنصر واحد من عناصر نموذج قدرات GRC 3.5 (L1–L4, A1–A5, P1–P8, R1–R3) مع تنويع المكوّنات. الشكل: {"items":[["الممارسة","P6","تعليل من سطر واحد"],...]}`, SYS, { max_tokens: 1800 }); qs = (r.items || []).filter(x => EL[x[1]]).slice(0, 10); } catch (e) {} }
      if (qs.length < 6) qs = [...BANK].sort(() => Math.random() - .5).slice(0, 10);
      t0 = Date.now(); clearInterval(timer); timer = setInterval(() => { const t = host.querySelector('#clsT'); if (t) t.textContent = Math.round((Date.now() - t0) / 1000); }, 500); render();
    };
    host.innerHTML = `<div class="ar-head"><h3>⚡ سباق تصنيف العناصر</h3><p>10 ممارسات، صنّف كل واحدة إلى عنصرها الصحيح بأسرع وقت. المهارة الأهم في اختبار GRCP: التمييز بين العناصر المتقاربة.</p></div><div id="cls"></div>`;
    start(ai());
  }

  /* ───────── ③ الممتحن الشفهي ───────── */
  const VIVA = [
    { q: 'اشرح الفرق بين الحوكمة والإدارة والضمان، ومن المسؤول عن كل منها.', k: ['توجيه', 'إشراف', 'سلطة الحوكمة', 'الإدارة', 'الموضوعية', 'الكفاءة'], m: 'الحوكمة: توجيه وإشراف وتقييم من سلطة الحوكمة (المجلس). الإدارة: التخطيط والبناء والتشغيل لتحقيق الأهداف. الضمان: تقييم موضوعي وكفء يمنح الثقة لأصحاب المصلحة؛ مستواه دالة في الموضوعية والكفاءة (ص 38).' },
    { q: 'ما الأداء المنضبط؟ وكيف يختلف عن مجرد الامتثال؟', k: ['تحقيق الأهداف', 'عدم اليقين', 'النزاهة', 'موثوق'], m: 'الأداء المنضبط = تحقيق الأهداف بموثوقية، مع التعامل مع عدم اليقين، والعمل بنزاهة. الامتثال جزء من النزاهة فقط؛ الأداء المنضبط يوازن بين الأداء والمخاطر والامتثال معًا.' },
    { q: 'صف مكوّن المواءمة ALIGN وعناصره الخمسة وتسلسلها المنطقي.', k: ['التوجيه', 'الأهداف', 'التحديد', 'التقييم', 'التصميم'], m: 'A1 التوجيه (الرسالة والقيم وشهية المخاطر) → A2 الأهداف → A3 تحديد الفرص والتهديدات والالتزامات → A4 تقييمها → A5 تصميم الإجراءات والضوابط المتكاملة.' },
    { q: 'ما الفرق بين الإجراءات الاستباقية والكشفية والاستجابية؟ أعطِ مثالًا لكل منها.', k: ['استباقي', 'كشفي', 'استجابي', 'قبل', 'أثناء', 'بعد'], m: 'الاستباقية تمنع قبل الحدث (فصل المهام)، الكشفية ترصد أثناء/بعد (المطابقات، المتابعة)، الاستجابية تعالج وتتعافى (خطة الاستجابة، التحقيق، الإصلاح).' },
    { q: 'لماذا لا يكون الضمان مطلقًا؟ وما العاملان اللذان يحددان مستواه؟', k: ['الموضوعية', 'الكفاءة', 'مستوى الضمان', 'مطلق'], m: 'لأن أي تقييم مبني على عينات وأدلة وحكم مهني؛ مستوى الضمان دالة في موضوعية مقدّمه وكفاءته (ص 38).' },
    { q: 'اشرح مستويات النضج الخمسة في النموذج وكيف يُستخدم النضج لتحديد نقطة البدء.', k: ['مبدئي', 'مُدار', 'متّسق', 'مُقاس', 'مُحسَّن'], m: '1 مبدئي (مرتجل) · 2 مُدار (يعتمد على أفراد) · 3 متّسق (موثّق ومطبّق) · 4 مُقاس (بيانات ومؤشرات) · 5 مُحسَّن (تحسين مستمر). يحدد المستوى الحالي والمستهدف لكل عنصر فجوة الأولوية.' }];
  function viva(host) {
    let cur = null;
    const next = async () => { cur = VIVA[Math.floor(Math.random() * VIVA.length)]; host.querySelector('#vq').textContent = cur.q; host.querySelector('#va').value = ''; host.querySelector('#vfb').innerHTML = ''; };
    const grade = async () => {
      const a = host.querySelector('#va').value.trim(); const fb = host.querySelector('#vfb'); if (a.length < 15) { fb.innerHTML = '<div class="ar-note">اكتب إجابة من 3 أسطر على الأقل كما لو كنت تشرح لزميل.</div>'; return; }
      fb.innerHTML = '<div class="ar-note">يقيّم الممتحن إجابتك…</div>';
      if (ai()) { try { const r = await window.TFAI.json(`قيّم إجابة متدرب GRCP على السؤال الشفهي التالي وفق نموذج قدرات GRC 3.5.\nالسؤال: ${cur.q}\nالإجابة النموذجية المرجعية: ${cur.m}\nإجابة المتدرب: ${a}\nأعد: {"score":0-10,"strengths":["..."],"gaps":["..."],"model":"إجابة نموذجية مختصرة من 3-4 جمل مع مرجع الصفحة إن أمكن","followup":"سؤال متابعة أعمق واحد"}`, SYS, { max_tokens: 1200 });
        save('viva', Math.round((+r.score || 0) * 10)); fb.innerHTML = `<div class="ar-res"><div class="ar-big">${r.score}/10</div></div><div class="ar-fb"><b>نقاط القوة:</b> ${(r.strengths || []).map(esc).join(' · ')}<br><b>الفجوات:</b> ${(r.gaps || []).map(esc).join(' · ')}<br><b>الإجابة النموذجية:</b> ${esc(r.model)}<br><b>سؤال متابعة:</b> ${esc(r.followup)}</div>`; return; } catch (e) {} }
      const hit = cur.k.filter(k => a.includes(k)); const sc = Math.round(hit.length / cur.k.length * 10); save('viva', sc * 10);
      fb.innerHTML = `<div class="ar-res"><div class="ar-big">${sc}/10</div><div>تقييم آلي بالمصطلحات الرئيسية (يتحوّل إلى تقييم لغوي كامل عند تفعيل الخادم).</div></div><div class="ar-fb"><b>مصطلحات ذكرتها:</b> ${hit.join('، ') || '—'}<br><b>مصطلحات ناقصة:</b> ${cur.k.filter(k => !hit.includes(k)).join('، ') || '—'}<br><b>الإجابة النموذجية:</b> ${esc(cur.m)}</div>`;
    };
    host.innerHTML = `<div class="ar-head"><h3>🎤 الممتحن الشفهي</h3><p>سؤال مفتوح بأسلوب المناقشة؛ اكتب إجابتك بكلماتك ويُقيّمها الممتحن ${ai() ? 'الذكي (Claude)' : 'الآلي'} مع إجابة نموذجية.</p></div><div class="ar-q" id="vq"></div><textarea id="va" class="ar-ta" placeholder="اكتب إجابتك هنا…"></textarea><div class="ar-btns"><button class="ar-btn gold" id="vgo">قيّم إجابتي</button><button class="ar-btn" id="vnext">سؤال آخر</button></div><div id="vfb"></div>`;
    host.querySelector('#vgo').onclick = grade; host.querySelector('#vnext').onclick = next; next();
  }

  /* ───────── ④ مُحلّل الحالة الواقعية ───────── */
  const KW = [[/لائح|نظام|تنظيم|هيئة|ساما|زاتكا|ضريب/, 'A3', 'التزام إلزامي يجب تسجيله وتقييمه'], [/غرام|عقوب|مخالف/, 'A3', 'التزام إلزامي مخالف — راجع سلسلة A3→A4→A5 وضوابط P1'], [/احتيال|اختلاس|رشو|تضارب/, 'P1', 'ضوابط استباقية وكشفية + قناة إبلاغ P6 واستقصاء P7'], [/بلاغ|شكو|خط ساخن/, 'P6', 'قناة إخطار وحماية المُبلّغ'], [/تحقيق|تحرّ/, 'P7', 'استقصاء منهجي مستقل'], [/تدريب|توعي|وعي/, 'P4', 'تثقيف قائم على الأدوار وقياس الأثر'], [/سياس|إجراء|دليل/, 'P2', 'دورة حياة السياسات'], [/مكافأ|حافز|راتب|ترقي/, 'P5', 'ربط الحوافز بالسلوك المنضبط'], [/مجلس|لجنة|إدارة عليا|رئيس/, 'A1', 'توجيه سلطة الحوكمة وخطوط المساءلة'], [/هدف|خطة استراتيج|مؤشر أداء|kpi/i, 'A2', 'أهداف قابلة للقياس ومؤشرات'], [/مورّد|مورد|طرف ثالث|عقد/, 'L4', 'أصحاب المصلحة وإدارة الأطراف الثالثة + ضوابط P1'], [/عميل|سمعة|إعلام/, 'L4', 'توقعات أصحاب المصلحة والتواصل P3'], [/سيبران|اختراق|بيانات|تسرّب|تسرب/, 'P8', 'استجابة للحوادث + ضوابط P1 + التزامات الخصوصية A3'], [/ثقافة|سلوك|نزاهة|قيم/, 'L3', 'قياس الثقافة ومعالجة فجواتها'], [/مراجعة داخلية|تدقيق|ضمان/, 'R2', 'ضمان موضوعي مبني على المخاطر'], [/مؤشر|لوحة|متابعة|رصد/, 'R1', 'متابعة مستمرة بمؤشرات KPI/KRI/KCI'], [/درس|تحسين|تكرار/, 'R3', 'تحسين مستمر من الدروس المستفادة'], [/سوق|منافس|اقتصاد|تقني/, 'L1', 'رصد السياق الخارجي'], [/هيكل|عملية|نظام داخلي|موارد/, 'L2', 'فهم السياق الداخلي'], [/خطر|مخاطر|احتمال|أثر/, 'A4', 'تقييم الاحتمالية والأثر (كامن/متبقٍ)'], [/تعطّل|انقطاع|كارث|استمرار/, 'P8', 'استجابة واستمرارية أعمال']];
  function caseLab(host) {
    const d = rd();
    host.innerHTML = `<div class="ar-head"><h3>🧭 مُحلّل الحالة الواقعية</h3><p>صف موقفًا حقيقيًا من منظمتك (${esc(orgName())}) أو من الأخبار، وسيحوّله المحلّل إلى خريطة عناصر النموذج: ما الالتزامات، ما المخاطر، أي الضوابط، ومن المساءَل.</p></div><textarea id="cs" class="ar-ta" placeholder="مثال: لدينا تأخر متكرر في سداد ضريبة القيمة المضافة بسبب اعتماد قسم المحاسبة على موظف واحد، وتلقّينا غرامة الشهر الماضي…">${esc(d.lastCase || '')}</textarea><div class="ar-btns"><button class="ar-btn gold" id="csgo">حلّل الحالة</button></div><div id="csout"></div>`;
    host.querySelector('#csgo').onclick = async () => {
      const t = host.querySelector('#cs').value.trim(), out = host.querySelector('#csout'); if (t.length < 20) { out.innerHTML = '<div class="ar-note">اكتب وصفًا من جملتين على الأقل.</div>'; return; }
      const dd = rd(); dd.lastCase = t; wr(dd); out.innerHTML = '<div class="ar-note">جارٍ التحليل…</div>';
      if (ai()) { try { const r = await window.TFAI.json(`حلّل الحالة التالية لمنظمة «${orgName()}» وفق نموذج قدرات GRC 3.5: "${t}"\nأعد: {"summary":"تشخيص في جملتين","elements":[{"el":"P1","why":"لماذا هذا العنصر معني","action":"إجراء عملي"}],"obligations":["..."],"risks":["..."],"controls":{"proactive":["..."],"detective":["..."],"responsive":["..."]},"accountability":"من المساءَل وفق خطوط المساءلة","kpi":["مؤشر متابعة"]} من 4 إلى 6 عناصر.`, SYS, { max_tokens: 2200 });
        out.innerHTML = `<div class="ar-fb"><b>التشخيص:</b> ${esc(r.summary)}</div><div class="ar-cards">${(r.elements || []).map(e => `<div class="ar-card" style="border-top-color:${COMP[(e.el || 'P')[0]][2]}"><b>${esc(e.el)} ${esc((EL[e.el] || [''])[0])}</b><div>${esc(e.why)}</div><div class="ar-act">▶ ${esc(e.action)}</div></div>`).join('')}</div><div class="ar-fb"><b>الالتزامات:</b> ${(r.obligations || []).map(esc).join(' · ')}<br><b>المخاطر:</b> ${(r.risks || []).map(esc).join(' · ')}<br><b>الضوابط:</b> استباقية: ${((r.controls || {}).proactive || []).map(esc).join('، ')} | كشفية: ${((r.controls || {}).detective || []).map(esc).join('، ')} | استجابية: ${((r.controls || {}).responsive || []).map(esc).join('، ')}<br><b>المساءلة:</b> ${esc(r.accountability)}<br><b>مؤشرات:</b> ${(r.kpi || []).map(esc).join(' · ')}</div>`; save('case', 100); return; } catch (e) {} }
      const hits = []; KW.forEach(([re, el, why]) => { if (re.test(t) && !hits.find(h => h.el === el)) hits.push({ el, why }); }); if (!hits.length) hits.push({ el: 'A3', why: 'ابدأ دائمًا بتحديد الالتزامات والمخاطر المرتبطة بالموقف' }, { el: 'P1', why: 'ثم صمّم ضوابط تمنع أو تكشف أو تستجيب' });
      out.innerHTML = `<div class="ar-fb"><b>التشخيص (المحرك المدمج):</b> الحالة تمسّ ${hits.length} عناصر من النموذج؛ الأولوية للعناصر أدناه بترتيبها. <small>يتحوّل التحليل إلى تحليل لغوي كامل عند تفعيل الخادم.</small></div><div class="ar-cards">${hits.slice(0, 6).map(h => `<div class="ar-card" style="border-top-color:${COMP[h.el[0]][2]}"><b>${h.el} ${EL[h.el][0]}</b><div>${esc(h.why)}</div></div>`).join('')}</div><div class="ar-fb"><b>المساءلة:</b> الخط الأول يملك المعالجة، الخط الثاني يدعم ويراقب، الخط الثالث يقدّم الضمان، والإدارة التنفيذية والمجلس مساءلان عن الإشراف.</div>`; save('case', 100);
    };
  }

  function save(k, pct) { const d = rd(); d.best = d.best || {}; d.best[k] = Math.max(d.best[k] || 0, pct); d.runs = (d.runs || 0) + 1; wr(d); const s = document.getElementById('arScore'); if (s) s.innerHTML = scoreHtml(); }
  function scoreHtml() { const d = rd(), b = d.best || {}; const names = { incident: 'محاكي الحوادث', classify: 'سباق التصنيف', viva: 'الممتحن الشفهي', case: 'محلّل الحالة' }; return Object.keys(names).map(k => `<span class="ar-tag" style="background:${b[k] >= 80 ? '#047857' : b[k] ? '#A97A26' : '#6B7280'}">${names[k]}: ${b[k] != null ? b[k] + '%' : '—'}</span>`).join(' ') + ` <small>${d.runs || 0} محاولة</small>`; }

  const TABS = [['incident', '🚨 محاكي الحوادث', incident], ['classify', '⚡ سباق التصنيف', classify], ['viva', '🎤 الممتحن الشفهي', viva], ['case', '🧭 محلّل الحالة', caseLab]];
  function mount(host, tab) {
    if (!host) return; const o = org();
    host.innerHTML = `<div class="wrap ar-wrap"><section class="ar-hero"><div class="ar-eyebrow">🤖 ${ai() ? 'مدعوم بـ Claude عبر خادم تراكفورد' : 'يعمل بالمحرك المدمج — ويتحوّل تلقائيًا إلى Claude عند تفعيل الخادم'}</div><h2>ساحة الذكاء الاصطناعي — أنشطة وتمارين وألعاب</h2><p>أربعة أنشطة تُدرّبك على التفكير كمسؤول حماية: قرارات تحت الضغط، تمييز العناصر، شرح المفاهيم بصوتك، وتحليل حالات حقيقية${o ? ` من «${esc(o.name)}»` : ''}. نتائجك تُحفظ وتظهر في لوحة التقدّم.</p><div id="arScore">${scoreHtml()}</div></section><nav class="ar-tabs">${TABS.map(t => `<button data-t="${t[0]}">${t[1]}</button>`).join('')}</nav><section class="ar-body" id="arBody"></section></div>`;
    const open = k => { host.querySelectorAll('.ar-tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === k)); const t = TABS.find(x => x[0] === k) || TABS[0]; t[2](host.querySelector('#arBody')); };
    host.querySelectorAll('.ar-tabs button').forEach(b => b.onclick = () => open(b.dataset.t)); open(tab || 'incident');
  }
  const css = document.createElement('style'); css.textContent = `.ar-wrap{padding-block:18px}.ar-hero{background:linear-gradient(135deg,#0A1B3D,#13295A);color:#fff;border-radius:18px;padding:26px 28px;margin-bottom:14px}.ar-hero h2{margin:6px 0;font-size:26px}.ar-hero p{color:#D9C9A4;margin:0 0 10px}.ar-eyebrow{font-size:12px;color:#E2B85A;font-weight:700}.ar-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.ar-tabs button{border:1px solid #E7DCC6;background:#fff;border-radius:999px;padding:9px 16px;font:inherit;font-weight:700;cursor:pointer}.ar-tabs button.on{background:#0A1B3D;color:#fff;border-color:#C9973B}.ar-body{background:#fff;border:1px solid #E7DCC6;border-radius:16px;padding:20px;min-height:320px}.ar-head h3{margin:0 0 4px;font-size:20px;color:#0A1B3D}.ar-head p{color:#5B6476;margin:0 0 14px}.ar-scn{background:#F6EEDC;border-inline-start:4px solid #C9973B;border-radius:10px;padding:12px 14px;margin-bottom:12px}.ar-scn p{margin:4px 0 0}.ar-q{font-weight:800;font-size:17px;margin:10px 0;color:#0A1B3D}.ar-stmt{font-size:20px;font-weight:700;background:#F6EEDC;border-radius:12px;padding:16px;margin-bottom:12px;text-align:center}.ar-opts{display:grid;gap:8px}.ar-opt,.ar-el{border:2px solid #E7DCC6;background:#fff;border-radius:12px;padding:12px 14px;font:inherit;text-align:start;cursor:pointer}.ar-opt:hover,.ar-el:hover{border-color:#C9973B}.ar-opt.ok,.ar-el.ok{background:#ECFDF5;border-color:#047857}.ar-opt.bad,.ar-el.bad{background:#FEF2F2;border-color:#B91C1C}.ar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.ar-el{padding:8px 10px;font-size:13px}.ar-el b{display:inline-block;min-width:28px;color:#0A1B3D}.ar-fb{background:#FBF8F2;border:1px solid #E7DCC6;border-radius:12px;padding:12px 14px;margin-top:12px;line-height:1.8}.ar-tag{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700;margin:2px}.ar-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.ar-btn{border:1px solid #C9973B;background:#0A1B3D;color:#fff;border-radius:999px;padding:9px 18px;font:inherit;font-weight:700;cursor:pointer}.ar-btn.gold{background:linear-gradient(180deg,#F2D584,#D4A84C);color:#0A1B3D}.ar-res{text-align:center;padding:14px}.ar-big{font-size:48px;font-weight:900;color:#C9973B;font-family:Montserrat,Arial}.ar-log li{margin-bottom:10px}.ar-ta{width:100%;min-height:130px;border:1px solid #E7DCC6;border-radius:12px;padding:12px;font:inherit;resize:vertical}.ar-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:12px}.ar-card{border:1px solid #E7DCC6;border-top:4px solid #0A1B3D;border-radius:12px;padding:12px}.ar-act{color:#0F766E;font-weight:700;margin-top:6px}.ar-note{color:#5B6476;padding:10px}`; document.head.appendChild(css);
  window.TFArena = { mount, TABS };
})();
