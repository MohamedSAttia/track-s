/* Track Ford · استوديو GRC الذكي — الواجهة والتصدير
   تصميم وبرمجة وإعداد: د. محمد عطية */
(function () {
  'use strict';
  const KB = window.TFS_KB, EN = window.TFS_ENGINE, DYN = window.TFS_DYN, TOOLS = window.TFS_TOOLS;
  const KEY = 'tf_studio_v2', CREDIT = 'تصميم وبرمجة وإعداد: د. محمد عطية', CREDIT_EN = 'Designed, developed & prepared by Dr. Mohamed Attia';
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^- (.+)$/gm, '• $1').replace(/\n/g, '<br>');
  const clone = o => JSON.parse(JSON.stringify(o));
  const thm = id => KB.THEMES.find(t => t.id === id);
  const STG = { L: ['تعلّم', 'LEARN', '#1F5FBF'], A: ['مواءمة', 'ALIGN', '#B7791F'], P: ['تنفيذ', 'PERFORM', '#15803D'], R: ['مراجعة', 'REVIEW', '#7A3FB8'] };
  const rd = () => { try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem('tf_studio_v1') || 'null'); } catch (e) { return null; } };
  const wr = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('تعذّر الحفظ المحلي — صدّر نسخة JSON'); } };
  const fresh = () => ({ v: 2, org: clone(KB.SAMPLE.org), events: clone(KB.SAMPLE.events), gen: null, pol: {}, docs: {}, chat: [], ws: {}, objs: [], kpis: [], ov: {}, del: {}, log: [] });
  let S = Object.assign(fresh(), rd() || {});
  ['mission', 'values', 'strategy'].forEach(k => { if (S.org[k] == null && KB.SAMPLE.org.name === S.org.name) S.org[k] = KB.SAMPLE.org[k]; });
  let TAB = 'dash', SEL = { pol: null, el: null, tool: null, kt: 'all' };

  function toast(t) { const d = $('#toast'); d.innerHTML = t; d.classList.add('on'); clearTimeout(d._t); d._t = setTimeout(() => d.classList.remove('on'), 4800); }
  const SMART = () => !!(window.TFAI && window.TFAI.ok);
  const LTR = () => !!(window.TFS_I18N && window.TFS_I18N.lang === 'en');

  function regenerate(silent) {
    S.events.forEach((e, i) => { if (!e.id) e.id = 'EV-' + String(i + 1).padStart(2, '0'); });
    S.gen = EN.generate(S); DYN.enrich(S, S.gen); wr();
    if (!silent) toast('✨ أعيد بناء كل المخرجات من ' + S.events.length + ' حدثًا — مع الحفاظ على تعديلاتك');
  }
  regenerate(true);

  /* حدث أو قرار جديد ← دراسة فورية حسب العناصر ← انعكاس على المواءمة والتنفيذ والمراجعة */
  function addEvent(e) {
    const before = DYN.snap(S, S.gen);
    e.id = 'EV-' + String(S.events.length + 1).padStart(2, '0'); S.events.push(e); regenerate(true);
    const ev = S.gen.evs.find(x => x.id === e.id), imp = DYN.impact(before, S, S.gen, ev), st = DYN.study(ev, S.gen);
    S.log.unshift({ at: new Date().toISOString(), ev: clone(ev), imp, st }); S.log = S.log.slice(0, 40); wr();
    toast(`⚡ «${esc(e.title)}» صُنّف إلى: <b>${ev.themes.map(t => thm(t).ar).join('، ')}</b><br>دُرس في ${st.length} عنصرًا وانعكس على ${Object.values(imp).reduce((a, x) => a + x.length, 0)} تحديثًا — انظر «التفاعل الديناميكي»`);
    go('dyn');
  }

  /* ───────── التنقل ───────── */
  const GROUPS = [['نظرة عامة', [['dash', '📊', 'لوحة القيادة'], ['dyn', '⚡', 'التفاعل الديناميكي']]],
    ['المدخلات', [['data', '🗂️', 'البيانات والأحداث'], ['ind', '🎯', 'الأهداف والمؤشرات']]],
    ['نموذج GRC', [['model', '🧩', 'العناصر العشرون والأدوات']]],
    ['السجلات', [['risks', '⚠️', 'المخاطر والفرص'], ['obl', '📜', 'الالتزامات'], ['ctl', '🛡️', 'الضوابط (IACM)'], ['pol', '📘', 'السياسات']]],
    ['المخرجات', [['road', '🗺️', 'خارطة الطريق'], ['guide', '🧭', 'المرشد'], ['out', '📤', 'التقارير والتصدير']]]];
  const TABS = GROUPS.flatMap(g => g[1]);
  function nav() {
    $('#tabs').innerHTML = GROUPS.map(([g, ts]) => `<div class="tg">${g}</div>` + ts.map(([k, i, t]) => `<button data-tab="${k}" class="${k === TAB ? 'on' : ''}"><span>${i}</span>${t}${k === 'dyn' && S.log.length ? `<em>${S.log.length}</em>` : ''}</button>`).join('')).join('');
    $$('#tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
  }
  function go(t, keep) { TAB = t; if (t === 'model' && !keep) SEL.el = null; nav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); try { history.replaceState(null, '', '#' + t); } catch (e) {} }
  function render() {
    const G = S.gen, v = $('#view');
    $('#orgName').textContent = S.org.name || 'منظمة جديدة';
    v.innerHTML = ({ dash, dyn, data, ind, model, risks, obl, ctl, pol, road, guide, out })[TAB](G); bind(v);
  }

  /* ───────── التحرير ───────── */
  function setPath(path, val) {
    const p = path.split('.'); let o = S;
    for (let i = 0; i < p.length - 1; i++) o = o[isNaN(p[i]) ? p[i] : +p[i]];
    const k = p[p.length - 1], old = o[k];
    o[k] = typeof old === 'number' ? (+val || 0) : val;
    if ((p[0] === 'objs' || p[0] === 'kpis') && S[p[0]][+p[1]]) S[p[0]][+p[1]]._e = 1;
    DYN.recordOv(S, path, o[k]); wr();
  }
  function bind(v) {
    $$('[data-k]', v).forEach(el => {
      const ev = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : (el.isContentEditable ? 'blur' : 'input');
      el.addEventListener(ev, () => {
        const val = el.isContentEditable ? el.innerText.trim() : (el.type === 'checkbox' ? el.checked : el.value);
        setPath(el.dataset.k, val);
        if (/^gen\.risks\.\d+\.(L|I|rL|rI)$/.test(el.dataset.k)) { const r = S.gen.risks[+el.dataset.k.split('.')[2]]; r.inh = r.L * r.I; r.res = r.rL * r.rI; wr(); render(); }
        if (el.dataset.re) { regenerate(true); render(); }
      });
    });
    $$('[data-ws]', v).forEach(el => el.addEventListener('blur', () => {
      const [tid, ri, ci] = el.dataset.ws.split('~'); const row = S.ws[tid][+ri]; if (!row) return;
      const val = el.innerText.trim(); if (row.c[+ci] === val) return; row.c[+ci] = val; row._e = 1; wr();
      const b = el.closest('tr').querySelector('.src'); if (b && row._a) { b.className = 'src e'; b.textContent = 'معدّل'; }
    }));
    $$('[data-act]', v).forEach(b => b.onclick = e => ACT[b.dataset.act](b, e));
  }
  const ed = (path, val, cls) => `<span contenteditable="true" class="ed ${cls || ''}" data-k="${path}">${esc(val)}</span>`;
  const lvl = s => { const l = EN.level(s); return `<b class="lvl" style="background:${l[2]}">${s} · ${l[0]}</b>`; };
  const srcB = r => r._a ? (r._e ? '<span class="src e">معدّل</span>' : '<span class="src a">تلقائي</span>') : '<span class="src u">يدوي</span>';
  const elOf = c => window.TFS_EL.find(e => e.c === c);
  const lastAff = () => S.log[0] ? new Set(S.log[0].st.map(x => x.el)) : new Set();

  /* ───────── 1) لوحة القيادة ───────── */
  function dash(G) {
    const k = [['أحداث وقرارات', G.evs.length, '🗂️'], ['مخاطر حرجة/عالية', G.risks.filter(r => r.inh >= 10 && r.kind === 'خطر').length, '⚠️'], ['ضوابط', G.controls.length, '🛡️'],
      ['سياسات كاملة', G.policies.length, '📘'], ['أهداف', G.objectives.length, '🎯'], ['مؤشرات KPI/KRI/KCI', G.kpis.length, '📈'], ['أوراق عمل', Object.keys(TOOLS.T).length, '📋'], ['متوسط النضج', (G.elements.reduce((a, e) => a + (+e.cur), 0) / G.elements.length).toFixed(1) + ' من 5', '🧩']];
    const comps = window.TFS_COMP.map(c => { const els = G.elements.filter(e => e.code[0] === c.k); return { c, cur: els.reduce((a, e) => a + (+e.cur), 0) / els.length, tg: els.reduce((a, e) => a + (+e.target), 0) / els.length }; });
    const typeN = t => G.controls.filter(x => x.t === t).length, mx = Math.max(1, typeN('P'), typeN('D'), typeN('R'));
    const L = S.log[0];
    return `<div class="hero-s"><div><div class="kick">GRC CAPABILITY MODEL 3.5 · SMART STUDIO</div><h2>${esc(S.org.name)}</h2><p>${esc(S.org.sector || '')} · ${esc(S.org.city || '')} · آخر تحديث: ${new Date(G.at).toLocaleString('ar-SA')}</p></div>
      <div class="hero-act"><button class="btn gold" data-act="goto" data-to="dyn">⚡ حدث أو قرار جديد</button><button class="btn ghost" data-act="ppt">📽️ عرض النتائج</button><button class="btn ghost" data-act="printAll">🖨️ التقرير الشامل</button></div></div>
      <div class="kpis">${k.map(([t, n, i]) => `<div class="kpi"><span>${i}</span><b>${n}</b><small>${t}</small></div>`).join('')}</div>
      ${L ? `<div class="card hl"><h3>⚡ آخر تفاعل ديناميكي — ${esc(L.ev.id)} «${esc(L.ev.title)}»</h3><div class="chain mini">${'LAPR'.split('').map(s => `<div class="cs" style="--c:${STG[s][2]}"><b>${STG[s][0]} <i>${STG[s][1]}</i></b><span>${L.st.filter(x => x.el[0] === s).length} عناصر · ${L.imp[s].length} تحديثات</span></div>`).join('<i class="arr">←</i>')}</div><button class="lnk" data-act="goto" data-to="dyn">عرض الدراسة الكاملة ←</button></div>` : ''}
      <div class="grid2">
        <div class="card"><h3>خريطة الحرارة — المخاطر المتأصلة</h3>${heat(G, 'inh')}<p class="mut">كل خلية = المخاطر بحسب الاحتمالية × الأثر.</p></div>
        <div class="card"><h3>الضوابط وفق نموذج IACM</h3>${['P', 'D', 'R'].map(t => `<div class="bar"><span>${EN.TN[t]} <i>${EN.TNE[t]}</i></span><div><i style="width:${typeN(t) / mx * 100}%;background:${t === 'P' ? '#15803D' : t === 'D' ? '#C9973B' : '#1F5FBF'}"></i></div><b>${typeN(t)}</b></div>`).join('')}
          <h3 style="margin-top:18px">النضج حسب المكوّن (الحالي ← المستهدف)</h3>${comps.map(x => `<div class="bar"><span>${x.c.ar}</span><div><i style="width:${x.cur / 5 * 100}%"></i><em style="right:${x.tg / 5 * 100}%"></em></div><b dir="ltr">${x.cur.toFixed(1)} → ${x.tg.toFixed(0)}</b></div>`).join('')}</div></div>
      <div class="card"><h3>🧭 ماذا سنفعل الآن؟</h3><ol class="steps">${EN.advisor(S, G).map(s => `<li><b>${s.t}</b><p>${esc(s.d)}</p><button class="lnk" data-act="goto" data-to="${{ data: 'data', risks: 'risks', controls: 'ctl', policies: 'pol', model: 'model', roadmap: 'out' }[s.k]}">انتقل ←</button></li>`).join('')}</ol></div>`;
  }
  function heat(G, k) {
    let h = '<table class="heat"><tr><th></th>' + [1, 2, 3, 4, 5].map(i => `<th>أثر ${i}</th>`).join('') + '</tr>';
    for (let L = 5; L >= 1; L--) {
      h += `<tr><th>احتمالية ${L}</th>`;
      for (let I = 1; I <= 5; I++) { const rs = G.risks.filter(r => (k === 'inh' ? r.L === L && r.I === I : r.rL === L && r.rI === I)); h += `<td style="background:${EN.level(L * I)[2]}${rs.length ? '' : '33'}" title="${rs.map(r => r.id).join(' ')}">${rs.map(r => r.id).join('<br>')}</td>`; }
      h += '</tr>';
    }
    return h + '</table>';
  }

  /* ───────── 2) التفاعل الديناميكي ───────── */
  const TYPES = ['حادث', 'قرار', 'ملاحظة تدقيق', 'تغيير تنظيمي', 'طرف ثالث', 'بلاغ', 'مؤشر', 'فرصة'];
  function evForm(pre, srcEl) {
    const o = S.org;
    return `<div class="form ev"><label>التاريخ<input type="date" id="${pre}Date" value="${EN.today()}"></label><label>النوع<select id="${pre}Type">${TYPES.map(t => `<option ${srcEl && t === 'قرار' ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label>الإدارة<select id="${pre}Dept">${(o.depts && o.depts.length ? o.depts : KB.DEPTS).map(d => `<option>${esc(d)}</option>`).join('')}<option>الاستراتيجية</option><option>الإدارة التنفيذية</option><option>مجلس الإدارة</option></select></label>
      <label>الخطورة/الأهمية (1–5)<select id="${pre}Sev">${[1, 2, 3, 4, 5].map(n => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>ظهر أثناء العمل على العنصر<select id="${pre}Src"><option value="">— غير محدد —</option>${window.TFS_EL.map(e => `<option value="${e.c}" ${e.c === srcEl ? 'selected' : ''}>${e.c} · ${esc(e.ar)}</option>`).join('')}</select></label>
      <label class="w">العنوان<input id="${pre}Title" placeholder="مثال: قرار بالتعاقد مع مزود دفع جديد / حادث تسرب بيانات / مشكلة في التنفيذ"></label><label class="w">الوصف<textarea id="${pre}Desc" rows="2" placeholder="ماذا حدث أو ما القرار؟ ما السبب؟ ما الأثر المتوقع؟"></textarea></label></div>
      <div class="row"><button class="btn gold" data-act="addEv" data-pre="${pre}">⚡ إضافة وتشغيل الدراسة الفورية</button><span class="mut">يُصنَّف تلقائيًا ويُدرس حسب كل عنصر، وتنعكس النتائج على المواءمة والتنفيذ والمراجعة فورًا.</span></div>`;
  }
  function chainHTML(L) {
    return `<div class="chain">${'LAPR'.split('').map(s => `<div class="cs" style="--c:${STG[s][2]}"><div class="csh"><b>${STG[s][0]}</b><i>${STG[s][1]}</i></div>
      ${L.st.filter(x => x.el[0] === s).map(x => `<div class="si"><b class="code sm">${x.el}</b><div><b>${esc(elOf(x.el).ar)}</b><p>${esc(x.txt)}</p><button class="lnk" data-act="openEl" data-el="${x.el}">فتح أوراق العمل ←</button></div></div>`).join('') || '<p class="mut">لا دراسة مطلوبة</p>'}
      ${L.imp[s].length ? `<div class="ups"><small>ما تغيّر تلقائيًا:</small><ul>${L.imp[s].slice(0, 12).map(t => `<li>${esc(t)}</li>`).join('')}${L.imp[s].length > 12 ? `<li>… و${L.imp[s].length - 12} أخرى</li>` : ''}</ul></div>` : ''}</div>`).join('<div class="arr">←</div>')}</div>`;
  }
  function mapSVG(L) {
    const aff = L ? new Set(L.st.map(x => x.el)) : new Set(), W = 920, cols = 'LAPR'.split(''), colX = i => W - 110 - i * 233;
    const els = window.TFS_EL, pos = {};
    cols.forEach((s, i) => { const es = els.filter(e => e.c[0] === s); es.forEach((e, j) => { pos[e.c] = [colX(i), 70 + j * 52 + (8 - es.length) * 26 * 0.5]; }); });
    const order = els.map(e => e.c).filter(c => aff.has(c));
    let lines = ''; for (let i = 0; i < order.length - 1; i++) { const a = pos[order[i]], b = pos[order[i + 1]]; lines += `<path d="M${a[0] - 70},${a[1]} C${a[0] - 120},${a[1]} ${b[0] + 120},${b[1]} ${b[0] + 70},${b[1]}" stroke="#C9973B" stroke-width="2" fill="none" marker-end="url(#ah)" opacity=".85"/>`; }
    const src = L && L.ev.srcEl && pos[L.ev.srcEl];
    return `<svg viewBox="0 0 ${W} 520" class="imap" role="img" aria-label="خريطة تفاعل العناصر"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="#C9973B"/></marker></defs>
      ${cols.map((s, i) => `<rect x="${colX(i) - 100}" y="14" width="200" height="490" rx="16" fill="${STG[s][2]}" opacity=".07"/><text x="${colX(i)}" y="42" text-anchor="middle" font-weight="800" fill="${STG[s][2]}" font-size="16">${STG[s][0]} · ${STG[s][1]}</text>`).join('')}
      ${lines}${els.map(e => { const [x, y] = pos[e.c], on = aff.has(e.c); return `<g class="nd" data-el="${e.c}"><rect x="${x - 88}" y="${y - 19}" width="176" height="38" rx="10" fill="${on ? STG[e.c[0]][2] : 'var(--surface)'}" stroke="${on ? '#C9973B' : 'var(--line)'}" stroke-width="${src && L.ev.srcEl === e.c ? 4 : 1.5}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12.5" fill="${on ? '#fff' : 'var(--fg)'}" font-weight="${on ? 700 : 500}">${e.c} · ${esc(e.ar)}</text></g>`; }).join('')}</svg>`;
  }
  function dyn(G) {
    const L = S.log[0];
    return `<div class="card hl"><h3>⚡ GRC تفاعلي ديناميكي — أضف حدثًا أو مشكلة أو قرارًا من أي مرحلة</h3>${evForm('dv')}</div>
      ${L ? `<div class="card"><div class="row sp"><h3>🔬 الدراسة الفورية: ${esc(L.ev.id)} · ${esc(L.ev.type)} — «${esc(L.ev.title)}»</h3><span class="mut">${new Date(L.at).toLocaleString('ar-SA')} · الموضوعات: ${L.ev.themes.map(t => `<span class="tag">${esc(thm(t).ar)}</span>`).join(' ')}${L.ev.srcEl ? ` · ظهر أثناء ${L.ev.srcEl}` : ''}</span></div>
        <p class="mut">مسار الانعكاس: تعلّم ← مواءمة ← تنفيذ ← مراجعة. كل بطاقة = دراسة العنصر لهذا الحدث، وأسفلها ما تحدّث تلقائيًا في السجلات وأوراق العمل.</p>${chainHTML(L)}
        <div class="row"><button class="btn ghost" data-act="pvStudy">👁️ معاينة وتحرير تقرير الدراسة قبل الإصدار</button></div></div>
      <div class="card"><h3>🕸️ خريطة تفاعل العناصر العشرين</h3><p class="mut">العناصر المتأثرة ملوّنة بلون مرحلتها، والأسهم تبين تسلسل الانعكاس. انقر أي عنصر لفتح أوراق عمله.</p>${mapSVG(L)}</div>` : `<div class="card"><h3>🕸️ خريطة تفاعل العناصر</h3><p class="mut">أضف حدثًا أو قرارًا لرؤية الدراسة الفورية وانعكاسها على كل العناصر.</p>${mapSVG(null)}</div>`}
      <div class="card"><h3>🗃️ سجل التفاعلات (${S.log.length})</h3>${S.log.map((l, i) => `<details ${i ? '' : 'open'}><summary><b>${esc(l.ev.id)}</b> ${esc(l.ev.type)} — ${esc(l.ev.title)} <small class="mut">· ${l.st.length} عناصر · ${Object.values(l.imp).reduce((a, x) => a + x.length, 0)} تحديثات</small></summary><ul class="lst">${l.st.map(x => `<li><b>${x.el}</b> ${esc(x.txt)}</li>`).join('')}</ul></details>`).join('') || '<p class="mut">لا توجد تفاعلات بعد.</p>'}</div>`;
  }

  /* ───────── 3) البيانات ───────── */
  function data(G) {
    const o = S.org, f = (k, t, ph) => `<label>${t}<input data-k="org.${k}" value="${esc(o[k] || '')}" placeholder="${ph || ''}"></label>`;
    return `<div class="card"><h3>🏢 ملف المنظمة</h3><div class="form">${f('name', 'اسم المنظمة')}${f('sector', 'القطاع')}${f('city', 'المدينة')}${f('emp', 'عدد الموظفين')}${f('rev', 'الإيرادات')}${f('systems', 'الأنظمة الرئيسية')}${f('appetite', 'الرغبة في المخاطر')}
      <label>مستوى النضج المستهدف<select data-k="org.target" data-re="1">${[3, 4, 5].map(n => `<option ${+o.target === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <p class="mut">الرؤية والرسالة والقيم والاستراتيجية في تبويب «الأهداف والمؤشرات».</p>
      <h4>المتطلبات التنظيمية المنطبقة</h4><div class="checks">${Object.entries(KB.REGS).map(([k, r]) => `<label class="ck"><input type="checkbox" ${o.regs.includes(k) ? 'checked' : ''} data-act="reg" data-r="${k}"> ${esc(r.ar)}</label>`).join('')}</div>
      <h4>الإدارات</h4><textarea id="deptsTxt" rows="2">${esc((o.depts || []).join('، '))}</textarea>
      <div class="row"><button class="btn gold" data-act="saveOrg">💾 حفظ وإعادة التوليد</button>${window.TFB && window.TFB.profile ? '<button class="btn ghost" data-act="fromBridge">🔗 استيراد ملف المنظمة الموحّد من المنصّة</button>' : ''}</div></div>
      <div class="card"><h3>⚡ إضافة حدث أو قرار</h3>${evForm('ev')}
        <div class="row"><button class="btn ghost" data-act="csv">📥 استيراد CSV</button><button class="btn ghost" data-act="sample">↺ تحميل المثال الافتراضي</button><button class="btn ghost" data-act="clearEv">🗑️ مسح الأحداث</button><input type="file" id="csvF" accept=".csv,.txt" hidden></div>
        <p class="mut">صيغة CSV: التاريخ,النوع,الإدارة,الخطورة,العنوان,الوصف — كل سطر حدث.</p></div>
      <div class="card"><h3>سجل الأحداث والقرارات (${S.events.length})</h3><div class="tbl"><table><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>العنوان والوصف</th><th>الإدارة</th><th>الخطورة</th><th>المصدر</th><th>التصنيف التلقائي</th><th></th></tr>
      ${S.events.map((e, i) => `<tr><td>${esc(e.id || '')}</td><td>${ed('events.' + i + '.date', e.date)}</td><td>${esc(e.type)}</td><td><b>${ed('events.' + i + '.title', e.title)}</b><br><small>${ed('events.' + i + '.desc', e.desc)}</small></td><td>${esc(e.dept)}</td><td>${ed('events.' + i + '.sev', e.sev)}</td><td>${esc(e.srcEl || '—')}</td><td>${EN.classify(e).map(t => `<span class="tag">${esc(thm(t).ar)}</span>`).join(' ')}</td><td><button class="x" data-act="delEv" data-i="${i}" title="حذف">✕</button></td></tr>`).join('')}</table></div>
      <div class="row"><button class="btn gold" data-act="regen">✨ إعادة التوليد بعد التعديل</button></div></div>`;
  }

  /* ───────── 4) الأهداف والمؤشرات ───────── */
  function ind(G) {
    const o = S.org, ta = (k, t, r, ph) => `<label class="w">${t}<textarea data-k="org.${k}" rows="${r}" placeholder="${ph || ''}">${esc(o[k] || '')}</textarea></label>`;
    const kt = SEL.kt, ks = G.kpis.map((k, i) => [k, i]).filter(([k]) => kt === 'all' || k.type === kt);
    const per = DYN.PERSP;
    return `<div class="card"><h3>🧭 التوجه الاستراتيجي — مصدر الأهداف والمؤشرات</h3><div class="form two">${ta('vision', 'الرؤية', 2)}${ta('mission', 'الرسالة', 2)}${ta('values', 'القيم', 2, 'مفصولة بفواصل')}${ta('strategy', 'الاستراتيجية (محور في كل سطر)', 5, 'محور استراتيجي في كل سطر')}</div>
        <div class="row"><button class="btn gold" data-act="regen">✨ توليد الأهداف والمؤشرات من التوجه والبيانات</button><span class="mut">يُحتفظ بتعديلاتك وإضافاتك، ويُستبدل التلقائي غير المعدّل فقط.</span></div></div>
      <div class="card guide"><h3>📐 إرشاد صياغة المؤشرات</h3><div class="g4">
        <div><b>1 · من الهدف إلى المؤشر</b><p>لكل هدف مؤشر نتيجة <i>لاحق</i> (هل تحقق؟) ومؤشر <i>قيادي</i> ينبئ مبكرًا. اختبر الهدف بـ SMART.</p></div>
        <div><b>2 · ثلاثة أنواع</b><p><b>KPI</b> أداء نحو الهدف · <b>KRI</b> تعرّض للخطر يقارن بالرغبة والتحمل · <b>KCI</b> فعالية الضابط.</p></div>
        <div><b>3 · عناصر الصياغة</b><p>الاسم، المعادلة (البسط ÷ المقام)، الوحدة، المصدر، التكرار، خط الأساس، المستهدف، المالك.</p></div>
        <div><b>4 · حدود المخاطر</b><p><b>الرغبة</b> ما نقبله · <b>التحمل</b> الانحراف المقبول قبل التصعيد · <b>الاستيعاب</b> الحد الأقصى الذي تتحمله المنظمة.</p></div></div></div>
      <div class="card"><div class="row sp"><h3>🎯 الأهداف الاستراتيجية (${G.objectives.length}) — بطاقة الأداء المتوازن</h3><button class="btn ghost" data-act="addObj">➕ هدف</button></div>
        <div class="smap">${per.map(p => `<div class="sm"><b>${p}</b><div>${G.objectives.filter(x => x.persp === p).map(x => `<span class="oc2" title="${esc(x.src)}">${esc(x.id)} · ${esc(x.title)}</span>`).join('') || '<i class="mut">—</i>'}</div></div>`).join('<div class="smarr">▲</div>')}</div>
        <div class="tbl"><table><tr><th>المعرّف</th><th>المنظور</th><th>الهدف</th><th>المصدر</th><th>المالك</th><th>الأفق</th><th>يؤدي إلى</th><th>المخاطر</th><th></th><th></th></tr>
        ${G.objectives.map((x, i) => { const p = 'objs.' + i + '.'; return `<tr><td><b>${esc(x.id)}</b></td><td><select data-k="${p}persp">${per.map(q => `<option ${q === x.persp ? 'selected' : ''}>${q}</option>`).join('')}</select></td><td>${ed(p + 'title', x.title)}</td><td><small>${ed(p + 'src', x.src)}</small></td><td>${ed(p + 'owner', x.owner)}</td><td>${ed(p + 'horizon', x.horizon)}</td><td>${ed(p + 'leads', x.leads)}</td><td>${ed(p + 'risks', x.risks)}</td><td>${srcB(x)}</td><td><button class="x" data-act="delRow" data-c="objs" data-i="${i}">✕</button></td></tr>`; }).join('')}</table></div></div>
      <div class="card"><div class="row sp"><h3>📈 المؤشرات التفصيلية (${G.kpis.length})</h3><div class="row">${['all', 'KPI', 'KRI', 'KCI'].map(t => `<button class="chip ${kt === t ? 'on' : ''}" data-act="kt" data-t="${t}">${t === 'all' ? 'الكل' : t} (${t === 'all' ? G.kpis.length : G.kpis.filter(k => k.type === t).length})</button>`).join('')}<button class="btn ghost" data-act="addKpi" data-t="KPI">➕ KPI</button><button class="btn ghost" data-act="addKpi" data-t="KRI">➕ KRI</button><button class="btn ghost" data-act="addKpi" data-t="KCI">➕ KCI</button></div></div>
        <div class="kgrid">${ks.map(([k, i]) => { const p = 'kpis.' + i + '.', F = (f, t) => `<div><dt>${t}</dt><dd>${ed(p + f, k[f])}</dd></div>`; return `<div class="kc t-${k.type}"><div class="kh"><b class="kt">${k.type}</b><b>${esc(k.id)}</b><span class="tag">${esc(k.lead)}</span>${srcB(k)}<button class="x" data-act="delRow" data-c="kpis" data-i="${i}">✕</button></div>
          <h4>${ed(p + 'name', k.name)}</h4><dl>${F('formula', 'المعادلة')}${F('unit', 'الوحدة')}${F('base', 'خط الأساس')}${F('target', 'المستهدف')}${k.type === 'KRI' ? F('appetite', 'الرغبة') + F('tol', 'التحمل') + F('cap', 'الاستيعاب') : F('tol', 'التحمل')}${F('freq', 'التكرار')}${F('owner', 'المالك')}${F('src', 'مصدر البيانات')}${F('obj', 'الهدف')}${F('links', 'الارتباطات')}</dl>
          <p class="wd">📝 ${esc(DYN.wording(k))}</p></div>`; }).join('')}</div>
        <div class="row"><button class="btn ghost" data-act="pvKpi">👁️ معاينة وتحرير سجل المؤشرات قبل الإصدار</button></div></div>`;
  }

  /* ───────── 5) العناصر العشرون وأدواتها ───────── */
  function model(G) {
    if (SEL.el) return workspace(G, SEL.el);
    const aff = lastAff();
    return `<div class="card"><h3>🧩 نموذج قدرات GRC 3.5 — العناصر العشرون</h3><p class="mut">لكل عنصر: خطة «ماذا سنفعل» وجميع الأدوات والتقنيات كأوراق عمل مولّدة تلقائيًا من بياناتك — قابلة للإضافة والتحرير والحذف. العناصر الموسومة ⚡ تأثرت بآخر حدث.</p></div>
      ${window.TFS_COMP.map(c => `<div class="stage" style="--c:${STG[c.k][2]}"><div class="stg-h"><b>${c.ar}</b><i>${c.en}</i></div><div class="egrid2">${G.elements.filter(e => e.code[0] === c.k).map(e => { const ts = TOOLS.BY[e.code] || [], n = ts.reduce((a, t) => a + (S.ws[t] || []).length, 0);
        return `<button class="ecard" data-act="openEl" data-el="${e.code}">${aff.has(e.code) ? '<span class="flash">⚡</span>' : ''}<b class="code">${e.code}</b><b class="en2">${esc(e.ar)}</b><small>${esc(e.en)}</small><span class="mt"><i style="width:${e.cur / 5 * 100}%"></i><em style="right:${e.target / 5 * 100}%"></em></span><span class="ef2"><span>📋 ${ts.length} أدوات</span><span>${n} صفًا</span><span>${esc(e.status)}</span></span></button>`; }).join('')}</div></div>`).join('')}`;
  }
  function workspace(G, code) {
    const i = G.elements.findIndex(e => e.code === code), e = G.elements[i], p = 'gen.elements.' + i + '.', st = STG[code[0]];
    const ts = TOOLS.BY[code] || []; if (!ts.includes(SEL.tool)) SEL.tool = ts[0];
    const t = TOOLS.T[SEL.tool], rows = S.ws[SEL.tool] || [];
    const L = S.log.find(l => l.st.some(x => x.el === code)), sx = L && L.st.find(x => x.el === code);
    const idx = window.TFS_EL.findIndex(x => x.c === code), prev = window.TFS_EL[idx - 1], next = window.TFS_EL[idx + 1];
    return `<div class="crumb"><button class="lnk" data-act="openEl" data-el="">← كل العناصر</button>${prev ? `<button class="lnk" data-act="openEl" data-el="${prev.c}">${LTR() ? '← ' + prev.c : '→ ' + prev.c}</button>` : ''}${next ? `<button class="lnk" data-act="openEl" data-el="${next.c}">${LTR() ? next.c + ' →' : next.c + ' ←'}</button>` : ''}</div>
      <div class="wsh" style="--c:${st[2]}"><b class="code lg">${code}</b><div><div class="kick">${st[0]} · ${st[1]}</div><h2>${esc(e.ar)} <small>${esc(e.en)}</small></h2><p>${esc(e.purpose)}</p></div><span class="mat">النضج الحالي ${ed(p + 'cur', e.cur)} · المستهدف ${ed(p + 'target', e.target)}</span></div>
      ${sx ? `<div class="card hl"><h3>⚡ دراسة الحدث ${esc(L.ev.id)} لهذا العنصر</h3><p><b>«${esc(L.ev.title)}»</b> — ${esc(sx.txt)}</p></div>` : ''}
      <div class="grid2 w37"><div class="card"><h3>🧭 ماذا سنفعل</h3><p><b>لماذا الآن؟</b> ${ed(p + 'why', e.why)}</p><ol>${e.actions.map((a, k) => `<li>${ed(p + 'actions.' + k, a)}</li>`).join('')}</ol>
          <div class="ef"><span>📦 ${ed(p + 'outputs', e.outputs.join('، '))}</span><span>👤 ${ed(p + 'owner', e.owner)}</span><span>📅 ${ed(p + 'due', e.due)}</span><span>🔗 ${e.linked.join(' ') || '—'}</span>
          <select data-k="${p}status">${['لم يبدأ', 'قيد التنفيذ', 'مكتمل'].map(x => `<option ${x === e.status ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <details><summary>ممارسات النموذج (${e.practices.length})</summary><ol>${e.practices.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details></div>
        <div class="card"><h3><span>⚡ مشكلة أو حادث أو قرار ظهر أثناء العمل على</span> <span>${code}</span></h3>${evForm('el', code)}</div></div>
      <div class="card"><h3>📋 الأدوات والتقنيات (${ts.length})</h3><div class="ttabs">${ts.map(x => `<button class="${x === SEL.tool ? 'on' : ''}" data-act="selTool" data-t="${x}">${esc(TOOLS.T[x].ar)}<small>${(S.ws[x] || []).length}</small></button>`).join('')}</div>
        <div class="wsbox"><div class="row sp"><div><h3 style="margin:0">${esc(t.ar)} <small class="mut">${esc(t.en)}</small></h3><p class="mut" style="margin:4px 0 0">💡 <span>${esc(t.how)}</span></p></div>
          <div class="row"><button class="btn gold" data-act="wsGen">✨ توليد تلقائي</button><button class="btn ghost" data-act="wsAdd">➕ صف</button><button class="btn ghost" data-act="wsReset">↺ إعادة ضبط</button><button class="btn ghost" data-act="pvWs">👁️ معاينة / PDF / Word</button></div></div>
          <div class="tbl"><table class="wst"><tr><th>#</th>${t.cols.map(c => `<th>${esc(c)}</th>`).join('')}<th>المصدر</th><th></th></tr>
          ${rows.map((r, ri) => `<tr><td>${ri + 1}</td>${t.cols.map((c, ci) => `<td><span contenteditable="true" class="ed" data-ws="${SEL.tool}~${ri}~${ci}">${esc(r.c[ci] || '')}</span></td>`).join('')}<td>${srcB(r)}</td><td><button class="x" data-act="wsDel" data-i="${ri}" title="حذف">✕</button></td></tr>`).join('') || `<tr><td colspan="${t.cols.length + 3}" class="mut">لا صفوف — اضغط «توليد تلقائي» أو «➕ صف».</td></tr>`}</table></div></div></div>`;
  }

  /* ───────── 6) السجلات ───────── */
  function risks(G) {
    return `<div class="card"><h3>⚠️ سجل المخاطر والفرص (${G.risks.length}) — قابل للتحرير</h3><p class="mut">المستوى = الاحتمالية × الأثر (5×5). تعديلاتك تبقى بعد إعادة التوليد.</p>
      <div class="tbl"><table><tr><th>المعرّف</th><th>النوع</th><th>الخطر/الفرصة</th><th>السبب ← الأثر</th><th>المالك</th><th>L</th><th>I</th><th>المتأصل</th><th>L'</th><th>I'</th><th>المتبقي</th><th>المعالجة</th><th>الموعد</th><th>المؤشر</th><th>الأحداث</th></tr>
      ${G.risks.map((r, i) => { const p = 'gen.risks.' + i + '.'; return `<tr><td><b>${r.id}</b></td><td>${r.kind}</td><td>${ed(p + 'title', r.title)}<br><small class="tag">${esc(r.cat)}</small></td><td><small>${ed(p + 'cause', r.cause)} ← ${ed(p + 'cons', r.cons)}</small></td><td>${ed(p + 'owner', r.owner)}</td><td>${ed(p + 'L', r.L)}</td><td>${ed(p + 'I', r.I)}</td><td>${lvl(r.inh)}</td><td>${ed(p + 'rL', r.rL)}</td><td>${ed(p + 'rI', r.rI)}</td><td>${lvl(r.res)}</td><td>${ed(p + 'treat', r.treat)}</td><td>${ed(p + 'due', r.due)}</td><td><small>KRI-${r.theme}</small></td><td><small>${r.events.join(' ')}</small></td></tr>`; }).join('')}</table></div></div>
      <div class="grid2"><div class="card"><h3>المتأصل</h3>${heat(G, 'inh')}</div><div class="card"><h3>المتبقي بعد الضوابط</h3>${heat(G, 'res')}</div></div>`;
  }
  function obl(G) {
    return `<div class="card"><h3>📜 سجل الالتزامات (${G.obligations.length})</h3><p class="mut">مبني على المتطلبات المختارة ومرتبط بالضوابط. المراجع توضيحية على مستوى المجال/الضابط — تحقّق من أحدث إصدار رسمي.</p>
      <div class="tbl"><table><tr><th>المعرّف</th><th>المصدر</th><th>المتطلب</th><th>النوع</th><th>المالك</th><th>الضوابط المغطية</th><th>الحالة</th><th>الموعد</th></tr>
      ${G.obligations.map((o, i) => { const p = 'gen.obligations.' + i + '.'; return `<tr><td><b>${o.id}</b></td><td><small>${esc(o.reg)}</small></td><td>${ed(p + 'req', o.req)}</td><td>${o.kind}</td><td>${ed(p + 'owner', o.owner)}</td><td><small>${o.controls.join(' ') || '<i class="warn">لا يوجد — فجوة</i>'}</small></td><td>${ed(p + 'status', o.status)}</td><td>${ed(p + 'due', o.due)}</td></tr>`; }).join('')}</table></div></div>`;
  }
  function ctl(G) {
    const grp = G.order.map(tid => [thm(tid), G.controls.map((c, i) => [c, i]).filter(([c]) => c.theme === tid)]);
    return `<div class="card"><h3>🛡️ مكتبة الضوابط (${G.controls.length})</h3><p class="mut">النوع وفق IACM: <b class="ty P">استباقي</b> قبل الحدث · <b class="ty D">استقصائي</b> أثناءه · <b class="ty R">استجابي</b> بعده. الاتجاه: إداري / حوكمي / ضمان.</p></div>
      ${grp.map(([t, cs]) => `<div class="card"><h3>${esc(t.ar)} <small class="mut">${esc(t.en)}</small></h3><div class="cgrid">${cs.map(([c, i]) => { const p = 'gen.controls.' + i + '.'; return `<div class="cc"><div class="ch"><b>${c.id}</b><span class="ty ${c.t}">${EN.TN[c.t]}</span><span class="tag">${c.cat}</span><span class="tag">${c.orient}</span></div>
        <p>${ed(p + 'ar', c.ar)}</p><dl><dt>المالك</dt><dd>${ed(p + 'owner', c.owner)}</dd><dt>التكرار</dt><dd>${ed(p + 'freq', c.freq)}</dd><dt>الدليل</dt><dd>${ed(p + 'ev', c.ev)}</dd><dt>مؤشر الضابط</dt><dd>${ed(p + 'kci', c.kci)}</dd><dt>المراجع</dt><dd><small>${esc(c.refs.join(' · '))}</small></dd><dt>الحالة</dt><dd>${ed(p + 'status', c.status)}</dd></dl></div>`; }).join('')}</div></div>`).join('')}`;
  }
  function pol(G) {
    const cur = SEL.pol && G.policies.find(p => p.id === SEL.pol) || G.policies[0]; SEL.pol = cur.id;
    return `<div class="polwrap"><aside class="card plist"><h3>📘 حزمة السياسات (${G.policies.length})</h3>${G.policies.map(p => `<button class="pi ${p.id === cur.id ? 'on' : ''}" data-act="selPol" data-id="${p.id}"><b>${esc(p.ar)}</b><small>${p.no} · ${p.sections.length} أقسام${S.pol[p.id] ? ' · ✏️ محرّرة' : ''}</small></button>`).join('')}</aside>
      <section class="card"><div class="row tools"><button class="btn gold" data-act="printPol">🖨️ مراجعة ثم PDF</button><button class="btn ghost" data-act="wordPol">📝 مراجعة ثم Word</button><button class="btn ghost" data-act="resetPol">↺ استعادة النسخة المولّدة</button><span class="mut">✏️ المستند قابل للتحرير مباشرة — يُحفظ تلقائيًا.</span></div>
      <div class="docview" id="docEd" contenteditable="true" data-pid="${cur.id}">${S.pol[cur.id] || policyHTML(cur)}</div></section></div>`;
  }
  const DEFS = [['المنظمة', 'الكيان المعني بهذه السياسة وجميع وحداته التنظيمية.'], ['مالك السياسة', 'الإدارة المسؤولة عن إعداد السياسة وتحديثها ومتابعة تطبيقها.'], ['الضابط', 'إجراء أو آلية تعزز الأحداث المرغوبة وتمنع أو تكشف أو تصحح غير المرغوبة (IACM).'],
    ['الرغبة في المخاطر', 'مستوى المخاطر الذي تقبله المنظمة لتحقيق أهدافها دون إجراء إضافي.'], ['التحمّل', 'نطاق الانحراف المقبول عن المستهدف قبل التصعيد.'], ['الاستثناء', 'إعفاء مؤقت وموثق من بند في السياسة مع ضوابط تعويضية.']];
  function policyHTML(p) {
    const G = S.gen, org = S.org; let n = 0; const H = t => `<h2 id="s${++n}">${n}. ${t}</h2>`;
    const toc = ['الغرض', 'النطاق', 'المراجع والمتطلبات التنظيمية', 'التعريفات', 'الأدوار والمسؤوليات', 'بيانات السياسة', 'الضوابط المرتبطة', 'مؤشرات القياس', 'مبررات الإصدار (الأحداث المرتبطة)', 'الاستثناءات', 'الامتثال والمخالفات', 'المراجعة والتحديث', 'الوثائق ذات العلاقة', 'الاعتماد والتوقيعات'];
    const ctl = G.controls.filter(c => p.controls.includes(c.id));
    let s = `<div class="pg cover"><div class="cv-top"><img src="${window.TFS_LOGO || ''}" alt=""><span>${esc(org.name)}</span></div><div class="cv-mid"><div class="kick">سياسة مؤسسية · POLICY</div><h1>${esc(p.ar)}</h1><h3>${esc(p.en)}</h3></div>
      <table class="meta"><tr><th>رقم الوثيقة</th><td>${p.no}</td><th>الإصدار</th><td>${p.ver}</td></tr><tr><th>مالك السياسة</th><td>${esc(p.owner)}</td><th>التصنيف</th><td>${p.class}</td></tr><tr><th>تاريخ السريان</th><td>${p.date}</td><th>تاريخ المراجعة القادمة</th><td>${p.review}</td></tr><tr><th>نطاق التطبيق</th><td colspan="3">${esc(p.dept)}</td></tr></table></div>
      <div class="pg"><h2>ضبط الوثيقة</h2><table><tr><th>الإصدار</th><th>التاريخ</th><th>الوصف</th><th>أعدّه</th></tr><tr><td>${p.ver}</td><td>${p.date}</td><td>إصدار أولي مبني على تحليل ${p.events.length} حدثًا ومتطلبات ${p.regs.length} مراجع</td><td>${esc(p.owner)}</td></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr></table>
      <h3>قائمة التوزيع</h3><p>${esc((org.depts || KB.DEPTS).join(' · '))}</p>
      <h2>الفهرس</h2><ol class="toc">${toc.map((t, i) => `<li><a href="#s${i + 1}">${t}</a></li>`).join('')}<li>ملحق: نموذج الإقرار بالاطلاع</li></ol></div>
      <div class="pg">${H('الغرض')}<p>${esc(p.purpose)}</p>${H('النطاق')}<p>${esc(p.scope)}</p>
      ${H('المراجع والمتطلبات التنظيمية')}<ul>${p.regs.map(r => `<li>${esc(r.ar)} <small>(${esc(r.en)})</small></li>`).join('')}<li>نموذج قدرات GRC الإصدار 3.5 — عنصر السياسات P2 وعنصر الضوابط P1</li></ul><p class="note">ملاحظة: يُرجى التحقق من أحدث الإصدارات الرسمية للمراجع أعلاه قبل الاعتماد النهائي.</p>
      ${H('التعريفات')}<table><tr><th>المصطلح</th><th>التعريف</th></tr>${DEFS.map(([a, b]) => `<tr><td><b>${a}</b></td><td>${b}</td></tr>`).join('')}</table>
      ${H('الأدوار والمسؤوليات')}<table><tr><th>النشاط</th><th>الجهة</th><th>الدور (RACI)</th></tr>${p.raci.map(r => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td><td>${r[2]}</td></tr>`).join('')}</table><p><small>R مسؤول عن التنفيذ · A مساءل/معتمد · C مُستشار · I مُطّلع</small></p></div>
      <div class="pg">${H('بيانات السياسة')}${p.sections.map((sec, j) => `<h3>${n}.${j + 1} ${esc(sec.h)}</h3><ol class="st">${sec.st.map((t, k) => `<li><b>${n}.${j + 1}.${k + 1}</b> ${esc(t)}</li>`).join('')}</ol>`).join('')}</div>
      <div class="pg">${H('الضوابط المرتبطة')}${ctl.length ? `<table class="big"><tr><th>المعرّف</th><th>الضابط</th><th>النوع</th><th>المالك</th><th>التكرار</th></tr>${ctl.map(c => `<tr><td>${c.id}</td><td>${esc(c.ar)}</td><td>${EN.TN[c.t]}</td><td>${esc(c.owner)}</td><td>${esc(c.freq)}</td></tr>`).join('')}</table>` : '<p>تُطبَّق الضوابط العامة الواردة في سياسة إدارة المخاطر المؤسسية ومكتبة الضوابط.</p>'}
      ${H('مؤشرات القياس')}<ul>${[...new Set(p.kpis)].map(k => `<li>${esc(k)}</li>`).join('') || '<li>نسبة الالتزام بالسياسة وفق نتائج اختبارات الامتثال</li>'}<li>نسبة الموظفين الذين وقّعوا إقرار الاطلاع (المستهدف 100%)</li></ul>
      ${H('مبررات الإصدار (الأحداث المرتبطة)')}${p.events.length ? `<ul>${p.events.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : '<p>إصدار أساسي ضمن الإطار المؤسسي للحوكمة والمخاطر والامتثال.</p>'}
      ${H('الاستثناءات')}<p>تُقدَّم طلبات الاستثناء كتابيًا إلى مالك السياسة مع المبرر والمدة والضوابط التعويضية، وتُعتمد من مدير المخاطر، ولا تتجاوز مدتها 6 أشهر، وتُسجّل في سجل الاستثناءات وتُراجع دوريًا.</p>
      ${H('الامتثال والمخالفات')}<p>يتابع الامتثال تطبيق هذه السياسة عبر اختبارات دورية، ويقدم التدقيق الداخلي ضمانًا مستقلًا. تُعد مخالفة السياسة مخالفة تأديبية تُعالج وفق لائحة الجزاءات باتساق ودون تمييز، مع حق المنظمة في اتخاذ الإجراءات النظامية.</p>
      ${H('المراجعة والتحديث')}<p>تُراجع السياسة سنويًا على الأقل، وفورًا عند وقوع أي من محفزات إعادة النظر: حادث جوهري، تغيير تنظيمي، تغيير جوهري في الأعمال أو التقنية، أو نتائج تدقيق جوهرية.</p>
      ${H('الوثائق ذات العلاقة')}<ul>${S.gen.policies.filter(x => x.id !== p.id).map(x => `<li>${x.no} — ${esc(x.ar)}</li>`).join('')}<li>سجل المخاطر المؤسسي وسجل الالتزامات ومكتبة الضوابط</li></ul></div>
      <div class="pg">${H('الاعتماد والتوقيعات')}<table class="sign"><tr><th>الإدارة</th><th>المسمى</th><th>الدور</th><th>الاسم</th><th>التوقيع</th><th>التاريخ</th></tr>${p.signers.map(x => `<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${x[2]}</td><td></td><td></td><td></td></tr>`).join('')}</table>
      <h2>ملحق: نموذج الإقرار بالاطلاع</h2><div class="ack"><p>أقر أنا الموقّع أدناه بأنني اطلعت على «${esc(p.ar)}» رقم ${p.no} وفهمت ما ورد فيها، وألتزم بتطبيقها، وأعلم أن مخالفتها تعرضني للمساءلة.</p><table><tr><th>الاسم</th><td></td><th>الرقم الوظيفي</th><td></td></tr><tr><th>الإدارة</th><td></td><th>التاريخ</th><td></td></tr><tr><th>التوقيع</th><td colspan="3"></td></tr></table></div></div>`;
    return s;
  }

  /* ───────── 7) المخرجات ───────── */
  function road(G) {
    return `<div class="card"><h3>🗺️ خارطة الطريق التنفيذية</h3><div class="road">${G.roadmap.map(p => `<div class="ph"><div class="phh"><b>${p.t}</b><small>${p.d}</small></div><ul>${p.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
  }
  function guide(G) {
    return `<div class="grid2"><div class="card"><h3>🧭 خطة «ماذا سنفعل» — خطوة بخطوة</h3><ol class="steps">${EN.advisor(S, G).map(s => `<li><b>${s.t}</b><p>${esc(s.d)}</p></li>`).join('')}</ol>
      <h3>أولويات عاجلة</h3><ul class="lst">${G.risks.filter(r => r.inh >= 15).map(r => `<li><b>${r.id}</b> ${esc(r.title)} — <i>${r.treat} قبل ${r.due}</i></li>`).join('') || '<li>لا توجد مخاطر حرجة.</li>'}</ul></div>
      <div class="card chat"><h3>💬 اسأل المرشد</h3><div id="chatLog">${(S.chat.length ? S.chat : [{ r: 'a', t: 'مرحبًا! اسألني: «ماذا أفعل الآن؟»، «ما ضوابط التصيد؟»، «اشرح P6»، «ما المؤشرات؟» أو «ما المخاطر الأعلى؟»' }]).map(m => `<div class="msg ${m.r}">${md(m.t)}</div>`).join('')}</div>
      <div class="chips">${['ماذا أفعل الآن؟', 'ما المخاطر الأعلى؟', 'ما المؤشرات الرئيسية؟', 'اشرح A5', 'كيف أعتمد السياسات؟'].map(q => `<button class="chip" data-act="ask" data-q="${q}">${q}</button>`).join('')}</div>
      <form id="chatF" onsubmit="return false"><input id="chatQ" placeholder="اكتب سؤالك…"><button class="btn gold" data-act="send">إرسال</button></form><p class="mut">الإجابات مبنية على بيانات منظمتك ومخرجاتها في الاستوديو.</p></div></div>`;
  }
  function out(G) {
    return `<div class="outs">${[['ppt', '📽️', 'عرض النتائج PowerPoint', 'التقارير والنتائج الرئيسية فقط: الملخص، خريطة المخاطر، الرسوم البيانية، الأهداف والمؤشرات، النضج، التفاعل الديناميكي، خارطة الطريق.'],
      ['printAll', '🖨️', 'التقرير الشامل PDF', 'معاينة قابلة للتحرير أولًا، ثم طباعة A4 أو حفظ PDF.'],
      ['wordAll', '📝', 'حزمة السياسات Word', 'معاينة وتحرير الحزمة ثم تنزيلها ملف Word.'],
      ['pvKpi', '📈', 'سجل الأهداف والمؤشرات', 'معاينة وتحرير ثم PDF أو Word.'],
      ['pvWsAll', '📋', 'أوراق العمل للعناصر العشرين', 'كل الأدوات والتقنيات بصفوفها — معاينة ثم PDF أو Word.'],
      ['json', '💾', 'نسخة احتياطية JSON', 'تصدير كل البيانات والتعديلات.'], ['importJ', '📂', 'استيراد JSON', 'استعادة نسخة محفوظة.']]
      .map(([a, i, t, d]) => `<button class="oc" data-act="${a}"><span>${i}</span><b>${t}</b><p>${d}</p></button>`).join('')}<input type="file" id="jsonF" accept=".json" hidden></div>${road(G)}`;
  }

  /* ───────── معاينة قابلة للتحرير قبل الإصدار ───────── */
  let PV = null;
  function preview(key, title, gen, opt) {
    opt = opt || {}; PV = { key, title, gen, save: opt.save || (h => { S.docs[key] = h; wr(); }), saved: opt.saved !== undefined ? opt.saved : S.docs[key], fname: opt.fname || title };
    let o = $('#pv'); if (!o) { o = document.createElement('div'); o.id = 'pv'; document.body.appendChild(o); }
    o.innerHTML = `<div class="pvbar"><b>👁️ معاينة قبل الإصدار — ${esc(title)}</b><span class="mut">حرّر النص مباشرة، ثم أصدر PDF أو Word.</span><span class="sp1"></span>
      <button class="btn gold" data-pv="pdf">🖨️ PDF / طباعة</button><button class="btn ghost" data-pv="word">📝 Word</button><button class="btn ghost" data-pv="save">💾 حفظ التعديلات</button><button class="btn ghost" data-pv="reset">↺ النسخة المولّدة</button><button class="btn ghost" data-pv="close">✕ إغلاق</button></div>
      <div class="docview pvd" id="pvDoc" contenteditable="true">${PV.saved || gen()}</div>`;
    o.classList.add('on'); document.body.style.overflow = 'hidden';
    $$('[data-pv]', o).forEach(b => b.onclick = () => {
      const h = $('#pvDoc').innerHTML, a = b.dataset.pv;
      if (a === 'save') { PV.save(h); toast('💾 حُفظت التعديلات'); }
      if (a === 'pdf') { PV.save(h); printDoc(PV.title, h); }
      if (a === 'word') { PV.save(h); word(PV.fname, h); }
      if (a === 'reset') { $('#pvDoc').innerHTML = PV.gen(); PV.save(null); toast('↺ استُعيدت النسخة المولّدة'); }
      if (a === 'close') { o.classList.remove('on'); document.body.style.overflow = ''; render(); }
    });
  }
  const docCover = (kick, title, sub) => `<div class="pg cover"><div class="cv-top"><img src="${window.TFS_LOGO || ''}" alt=""><span>${esc(S.org.name)}</span></div><div><div class="kick">${kick}</div><h1>${title}</h1><h3>${sub || ''}</h3><p>${EN.today()}</p></div><p class="credit">${CREDIT}</p></div>`;
  function kpiDoc() {
    const G = S.gen;
    return docCover('OBJECTIVES & INDICATORS', 'سجل الأهداف الاستراتيجية والمؤشرات', 'KPI · KRI · KCI') +
      `<div class="pg"><h2>التوجه الاستراتيجي</h2><table><tr><th>الرؤية</th><td>${esc(S.org.vision)}</td></tr><tr><th>الرسالة</th><td>${esc(S.org.mission)}</td></tr><tr><th>القيم</th><td>${esc(S.org.values)}</td></tr><tr><th>الاستراتيجية</th><td>${esc(S.org.strategy).replace(/\n/g, '<br>')}</td></tr></table>
      <h2>الأهداف</h2><table class="big"><tr><th>المعرّف</th><th>المنظور</th><th>الهدف</th><th>المصدر</th><th>المالك</th><th>الأفق</th></tr>${G.objectives.map(o => `<tr><td>${esc(o.id)}</td><td>${esc(o.persp)}</td><td>${esc(o.title)}</td><td>${esc(o.src)}</td><td>${esc(o.owner)}</td><td>${esc(o.horizon)}</td></tr>`).join('')}</table></div>
      <div class="pg"><h2>بطاقات المؤشرات</h2>${G.kpis.map(k => `<h3>${esc(k.id)} · ${k.type} — ${esc(k.name)}</h3><table><tr><th>المعادلة</th><td colspan="3">${esc(k.formula)}</td></tr><tr><th>النوع</th><td>${esc(k.lead)}</td><th>الوحدة</th><td>${esc(k.unit)}</td></tr><tr><th>خط الأساس</th><td>${esc(k.base)}</td><th>المستهدف</th><td>${esc(k.target)}</td></tr>${k.type === 'KRI' ? `<tr><th>الرغبة</th><td>${esc(k.appetite)}</td><th>التحمل / الاستيعاب</th><td>${esc(k.tol)} / ${esc(k.cap)}</td></tr>` : ''}<tr><th>التكرار</th><td>${esc(k.freq)}</td><th>المالك</th><td>${esc(k.owner)}</td></tr><tr><th>المصدر</th><td>${esc(k.src)}</td><th>الارتباط</th><td>${esc(k.obj)} · ${esc(k.links)}</td></tr></table><p><small>${esc(DYN.wording(k))}</small></p>`).join('')}</div>`;
  }
  function wsDoc(codes) {
    return docCover('GRC WORKSHEETS', 'أوراق العمل — الأدوات والتقنيات', codes.length === 1 ? codes[0] + ' · ' + esc(elOf(codes[0]).ar) : 'العناصر العشرون') +
      codes.map(c => `<div class="pg"><h2>${c} · ${esc(elOf(c).ar)}</h2><p>${esc(elOf(c).pu)}</p>${(TOOLS.BY[c] || []).map(tid => { const t = TOOLS.T[tid], rows = S.ws[tid] || []; return `<h3>${esc(t.ar)} <small>(${esc(t.en)})</small></h3><table class="big"><tr>${t.cols.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${rows.map(r => `<tr>${t.cols.map((x, i) => `<td>${esc(r.c[i] || '')}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${t.cols.length}">—</td></tr>`}</table>`; }).join('')}</div>`).join('');
  }
  function studyDoc() {
    const L = S.log[0]; if (!L) return '';
    return docCover('DYNAMIC GRC STUDY', 'تقرير الدراسة الفورية للحدث', esc(L.ev.id) + ' — ' + esc(L.ev.title)) +
      `<div class="pg"><h2>الحدث</h2><table><tr><th>النوع</th><td>${esc(L.ev.type)}</td><th>التاريخ</th><td>${esc(L.ev.date)}</td></tr><tr><th>الإدارة</th><td>${esc(L.ev.dept)}</td><th>الخطورة</th><td>${esc(L.ev.sev)}</td></tr><tr><th>الوصف</th><td colspan="3">${esc(L.ev.desc)}</td></tr><tr><th>التصنيف</th><td colspan="3">${L.ev.themes.map(t => esc(thm(t).ar)).join('، ')}</td></tr></table>
      ${'LAPR'.split('').map(s => `<h2>${STG[s][0]} · ${STG[s][1]}</h2><table><tr><th>العنصر</th><th>الدراسة والإجراء</th></tr>${L.st.filter(x => x.el[0] === s).map(x => `<tr><td>${x.el} · ${esc(elOf(x.el).ar)}</td><td>${esc(x.txt)}</td></tr>`).join('') || '<tr><td colspan="2">—</td></tr>'}</table>${L.imp[s].length ? `<ul>${L.imp[s].map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}`).join('')}
      <h2>الاعتماد</h2><table class="sign"><tr><th>الدور</th><th>الاسم</th><th>التوقيع</th><th>التاريخ</th></tr><tr><td>مدير المخاطر</td><td></td><td></td><td></td></tr><tr><td>مدير الامتثال</td><td></td><td></td><td></td></tr><tr><td>الرئيس التنفيذي</td><td></td><td></td><td></td></tr></table></div>`;
  }

  /* ───────── الإجراءات ───────── */
  const ACT = {
    regen: () => { regenerate(); render(); }, goto: b => go(b.dataset.to), road: () => go('road'),
    reg: b => { const r = b.dataset.r, a = S.org.regs; const i = a.indexOf(r); b.checked ? (i < 0 && a.push(r)) : (i >= 0 && a.splice(i, 1)); wr(); },
    saveOrg: () => { S.org.depts = ($('#deptsTxt').value || '').split(/[،,\n]/).map(x => x.trim()).filter(Boolean); regenerate(); render(); },
    fromBridge: () => { const p = window.TFB.profile(); if (!p) return toast('لا يوجد ملف منظمة موحّد بعد في المنصّة'); Object.assign(S.org, { name: p.name || S.org.name, sector: p.sector || S.org.sector, emp: p.emp || S.org.emp, rev: p.rev || S.org.rev }); regenerate(); render(); },
    addEv: b => {
      const P = b.dataset.pre, v = id => ($('#' + P + id) || {}).value || '';
      const e = { date: v('Date'), type: v('Type'), dept: v('Dept'), sev: +v('Sev') || 3, title: v('Title').trim(), desc: v('Desc').trim(), srcEl: v('Src') || undefined };
      if (!e.title) return toast('اكتب عنوان الحدث أو القرار'); addEvent(e);
    },
    delEv: b => { S.events.splice(+b.dataset.i, 1); S.events.forEach((e, i) => e.id = 'EV-' + String(i + 1).padStart(2, '0')); regenerate(); render(); },
    clearEv: () => { if (confirm('مسح كل الأحداث؟')) { S.events = []; regenerate(); render(); } },
    sample: () => { if (confirm('تحميل المثال الافتراضي سيستبدل البيانات والتعديلات الحالية. متابعة؟')) { S = fresh(); regenerate(); render(); nav(); } },
    csv: () => { const f = $('#csvF'); f.onchange = () => { const r = new FileReader(); r.onload = () => { const rows = String(r.result).split(/\r?\n/).filter(x => x.trim()); let n = 0; rows.forEach((ln, i) => { const c = ln.split(',').map(x => x.trim()); if (c.length < 5 || (i === 0 && /date|التاريخ/i.test(c[0]))) return; S.events.push({ date: c[0], type: c[1] || 'حادث', dept: c[2] || '', sev: +c[3] || 3, title: c[4], desc: c.slice(5).join(',') }); n++; }); regenerate(true); render(); toast('📥 استُورد ' + n + ' حدثًا وأعيد التوليد'); }; r.readAsText(f.files[0], 'utf-8'); }; f.click(); },
    ask: b => chatSend(b.dataset.q), send: () => { const q = $('#chatQ').value.trim(); if (q) chatSend(q); },
    /* العناصر وأوراق العمل */
    openEl: b => { SEL.el = b.dataset.el || null; SEL.tool = null; TAB = 'model'; nav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    selTool: b => { SEL.tool = b.dataset.t; render(); },
    wsAdd: () => { const t = TOOLS.T[SEL.tool]; (S.ws[SEL.tool] = S.ws[SEL.tool] || []).push({ k: 'u' + Date.now(), c: t.cols.map(() => ''), _a: 0 }); wr(); render(); const c = $$('.wst tr'); const last = c[c.length - 1]; const f = last && last.querySelector('.ed'); if (f) f.focus(); },
    wsDel: b => { const rows = S.ws[SEL.tool], r = rows[+b.dataset.i]; if (r._a) S.del['ws:' + SEL.tool + ':' + r.k] = 1; rows.splice(+b.dataset.i, 1); wr(); render(); },
    wsGen: () => { Object.keys(S.del).forEach(k => { if (k.startsWith('ws:' + SEL.tool + ':')) delete S.del[k]; }); S.ws[SEL.tool] = DYN.merge(S.ws[SEL.tool], DYN.autoRows(SEL.tool, Object.assign({ org: S.org }, S.gen)), 'k', S.del, 'ws:' + SEL.tool + ':'); wr(); render(); toast('✨ وُلّدت الصفوف تلقائيًا من البيانات والأحداث — مع الإبقاء على صفوفك وتعديلاتك'); },
    wsReset: () => { if (!confirm('إعادة ضبط الورقة إلى النسخة المولّدة؟ ستُحذف الصفوف اليدوية والتعديلات.')) return; Object.keys(S.del).forEach(k => { if (k.startsWith('ws:' + SEL.tool + ':')) delete S.del[k]; }); S.ws[SEL.tool] = []; ACT.wsGen(); },
    pvWs: () => preview('ws:' + SEL.el, 'أوراق عمل ' + SEL.el, () => wsDoc([SEL.el]), { fname: 'TrackFord_Worksheets_' + SEL.el }),
    pvWsAll: () => preview('ws:all', 'أوراق العمل — العناصر العشرون', () => wsDoc(window.TFS_EL.map(e => e.c)), { fname: 'TrackFord_GRC_Worksheets' }),
    /* الأهداف والمؤشرات */
    kt: b => { SEL.kt = b.dataset.t; render(); },
    addObj: () => { S.objs.push({ id: 'OBJ-U' + (S.objs.filter(o => !o._a).length + 1), persp: 'العمليات الداخلية', title: 'هدف جديد — اكتب الصياغة', src: 'يدوي', owner: '', horizon: '12 شهرًا', leads: '', risks: '', _a: 0 }); S.gen.objectives = S.objs; wr(); render(); },
    addKpi: b => { const t = b.dataset.t; S.kpis.push({ id: t + '-U' + (S.kpis.filter(k => !k._a).length + 1), type: t, name: 'مؤشر جديد — اكتب الاسم', obj: '', persp: '', lead: t === 'KPI' ? 'لاحق' : 'قيادي', formula: 'البسط ÷ المقام × 100', unit: '%', base: '', target: '', appetite: '', tol: '', cap: '', freq: 'شهري', owner: '', src: '', links: '', _a: 0 }); S.gen.kpis = S.kpis; SEL.kt = t; wr(); render(); },
    delRow: b => { const c = b.dataset.c, i = +b.dataset.i, r = S[c][i]; if (r._a) S.del[(c === 'objs' ? 'obj:' : 'kpi:') + r.id] = 1; S[c].splice(i, 1); S.gen[c === 'objs' ? 'objectives' : 'kpis'] = S[c]; wr(); render(); },
    pvKpi: () => preview('kpi', 'سجل الأهداف والمؤشرات', kpiDoc, { fname: 'TrackFord_Objectives_KPIs' }),
    pvStudy: () => preview('study:' + S.log[0].ev.id, 'تقرير الدراسة الفورية ' + S.log[0].ev.id, studyDoc, { fname: 'TrackFord_Study_' + S.log[0].ev.id }),
    /* السياسات */
    selPol: b => { SEL.pol = b.dataset.id; render(); },
    resetPol: () => { delete S.pol[SEL.pol]; wr(); render(); toast('↺ استُعيدت النسخة المولّدة'); },
    printPol: () => polPv(), wordPol: () => polPv(),
    wordAll: () => preview('pack', 'حزمة السياسات', () => S.gen.policies.map(p => S.pol[p.id] || policyHTML(p)).join(''), { fname: 'TrackFord_Policy_Pack' }),
    ppt: () => ppt(), printAll: () => preview('report', 'تقرير برنامج GRC — ' + S.org.name, reportHTML, { fname: 'TrackFord_GRC_Report' }),
    json: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'TrackFord_GRC_Studio_' + EN.today() + '.json'; a.click(); },
    importJ: () => { const f = $('#jsonF'); f.onchange = () => { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o.org || !o.events) throw 0; S = Object.assign(fresh(), o); regenerate(true); render(); nav(); toast('📂 استُعيدت النسخة'); } catch (e) { toast('ملف غير صالح'); } }; r.readAsText(f.files[0]); }; f.click(); }
  };
  function polPv() { const p = S.gen.policies.find(x => x.id === SEL.pol); preview('pol:' + p.id, p.ar, () => policyHTML(p), { saved: S.pol[p.id], save: h => { if (h) S.pol[p.id] = h; else delete S.pol[p.id]; wr(); }, fname: p.no + '_' + p.en.replace(/\W+/g, '_') }); }

  async function chatSend(q) {
    S.chat.push({ r: 'u', t: q }); let a = null;
    if (SMART()) {
      const G = S.gen, ctx = { org: S.org.name, sector: S.org.sector, risks: G.risks.slice(0, 8).map(r => [r.id, r.title, r.inh, r.res]), controls: G.controls.length, policies: G.policies.map(p => p.ar), kpis: G.kpis.slice(0, 12).map(k => [k.id, k.name, k.target]), elements: G.elements.map(e => [e.code, e.cur, e.target, e.actions[0]]) };
      try { a = await window.TFAI.chat(S.chat.slice(-8).map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t })), { system: 'أنت «مرشد GRC» داخل منصة تراكفورد، خبير بنموذج OCEG GRC Capability Model 3.5 والمتطلبات السعودية. لا تتحدث عن طبيعتك التقنية ولا عن أي مزود خدمة. أجب بالعربية الفصحى بنقاط عملية قصيرة، واذكر رموز العناصر (L1…R3) ومعرّفات المخاطر والضوابط والمؤشرات عند الحاجة، ولا تختلق أرقام مواد نظامية. السياق: ' + JSON.stringify(ctx), max_tokens: 900 }); } catch (e) { a = null; }
    }
    if (!a) a = EN.answer(q, S, S.gen);
    S.chat.push({ r: 'a', t: a }); S.chat = S.chat.slice(-30); wr(); render(); const l = $('#chatLog'); if (l) l.scrollTop = l.scrollHeight;
  }

  document.addEventListener('input', e => { if (e.target.id === 'docEd') { clearTimeout(e.target._t); e.target._t = setTimeout(() => { S.pol[e.target.dataset.pid] = e.target.innerHTML; wr(); }, 600); } });
  document.addEventListener('keydown', e => { if (e.target.id === 'chatQ' && e.key === 'Enter') { e.preventDefault(); ACT.send(); } });
  document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('.imap .nd'); if (g) ACT.openEl({ dataset: { el: g.dataset.el } }); });

  /* ───────── الطباعة / Word ───────── */
  const PRINT_CSS = `@page{size:A4;margin:16mm 14mm}body{font-family:Rubik,"Segoe UI",Tahoma,sans-serif;color:#1B2436;direction:rtl;font-size:11.5pt;line-height:1.75;margin:0}
    h1{font-size:26pt;color:#0A1B3D;margin:.2em 0}h2{font-size:15pt;color:#0A1B3D;border-bottom:2px solid #C9973B;padding-bottom:4px;margin:18px 0 8px}h3{font-size:12.5pt;color:#13295A;margin:12px 0 6px}
    table{width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:10pt}th,td{border:1px solid #D9CFB8;padding:5px 7px;text-align:right;vertical-align:top}th{background:#F6EEDC;color:#0A1B3D}
    h2,h3{break-after:avoid}tr{break-inside:avoid}table:not(.big){break-inside:avoid}.pg{page-break-after:always}.pg:last-child{page-break-after:auto}.cover{min-height:245mm;display:flex;flex-direction:column;justify-content:space-between;border:3px solid #0A1B3D;padding:14mm;box-sizing:border-box;background:linear-gradient(180deg,#fff 60%,#FBF8F2)}
    .cv-top{display:flex;align-items:center;gap:12px;font-weight:700;color:#0A1B3D}.cv-top img{height:46px}.kick{letter-spacing:.2em;color:#C9973B;font-size:9pt;font-weight:700}.meta th{width:22%}.credit{color:#8a6d2b;font-weight:700;font-size:10pt}
    ol.st{list-style:none;padding:0}ol.st li{margin:4px 0}ol.st b{color:#C9973B;margin-left:6px}.toc a{color:#0A1B3D;text-decoration:none}.note{font-size:9pt;color:#8a6d2b}.sign td{height:34px}.ack{border:1.5px dashed #C9973B;padding:10px}
    .lvl{color:#fff;padding:1px 6px;border-radius:6px;font-size:9pt}.tag{background:#F6EEDC;padding:0 6px;border-radius:6px;font-size:9pt}.foot{position:fixed;bottom:0;left:0;right:0;font-size:8pt;color:#8E97A8;text-align:center}
    .heat td{width:16%;height:28px;color:#fff;text-align:center;font-size:8pt}`;
  function printDoc(title, html) {
    const w = window.open('', '_blank'); if (!w) return toast('اسمح بالنوافذ المنبثقة للطباعة');
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"><style>${PRINT_CSS}</style></head><body>${html}<div class="foot">${esc(S.org.name)} · ${esc(title)} · Track Ford GRC Studio · ${CREDIT}</div><script>setTimeout(()=>{window.focus();window.print()},700)<\/script></body></html>`);
    w.document.close();
  }
  function word(name, html) {
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="ar" dir="rtl"><head><meta charset="utf-8"><style>${PRINT_CSS} body{font-family:Rubik,Arial}</style></head><body dir="rtl">${html}<p class="credit" style="text-align:center">Track Ford GRC Studio · ${CREDIT}</p></body></html>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿', doc], { type: 'application/msword' })); a.download = name + '.doc'; a.click();
  }
  function reportHTML() {
    const G = S.gen, o = S.org;
    const sum = EN.advisor(S, G).map(s => `<li><b>${s.t}:</b> ${esc(s.d)}</li>`).join('');
    return `<div class="pg cover"><div class="cv-top"><img src="${window.TFS_LOGO || ''}" alt=""><span>Track Ford · GRC Studio</span></div><div><div class="kick">GRC PROGRAM REPORT</div><h1>تقرير برنامج الحوكمة والمخاطر والامتثال</h1><h3>${esc(o.name)}</h3><p>${esc(o.sector)} · ${esc(o.city)} · ${EN.today()}</p></div><p>مبني على نموذج قدرات GRC الإصدار 3.5 (OCEG) وعلى ${G.evs.length} حدثًا وقرارًا مسجلًا.</p><p class="credit">${CREDIT}</p></div>
      <div class="pg"><h2>الفهرس</h2><ol><li>الملخص التنفيذي</li><li>التوجه الاستراتيجي والأهداف والمؤشرات</li><li>سجل الأحداث والقرارات</li><li>سجل المخاطر والفرص وخريطة الحرارة</li><li>سجل الالتزامات</li><li>مكتبة الضوابط</li><li>خطة عناصر نموذج GRC العشرين</li><li>سجل التفاعلات الديناميكية</li><li>خارطة الطريق</li><li>حزمة السياسات (${G.policies.length})</li></ol>
      <h2>1. الملخص التنفيذي</h2><table><tr><th>الأحداث</th><td>${G.evs.length}</td><th>المخاطر الحرجة</th><td>${G.risks.filter(r => r.inh >= 15).length}</td></tr><tr><th>الضوابط</th><td>${G.controls.length}</td><th>السياسات</th><td>${G.policies.length}</td></tr><tr><th>الأهداف</th><td>${G.objectives.length}</td><th>المؤشرات</th><td>${G.kpis.length}</td></tr><tr><th>الالتزامات</th><td>${G.obligations.length}</td><th>النضج المستهدف</th><td>${o.target}</td></tr></table><ol>${sum}</ol></div>
      <div class="pg"><h2>2. التوجه الاستراتيجي والأهداف والمؤشرات</h2><table><tr><th>الرؤية</th><td>${esc(o.vision)}</td></tr><tr><th>الرسالة</th><td>${esc(o.mission)}</td></tr><tr><th>القيم</th><td>${esc(o.values)}</td></tr></table>
        <table class="big"><tr><th>الهدف</th><th>المنظور</th><th>المالك</th></tr>${G.objectives.map(x => `<tr><td>${esc(x.id)} · ${esc(x.title)}</td><td>${esc(x.persp)}</td><td>${esc(x.owner)}</td></tr>`).join('')}</table>
        <table class="big"><tr><th>المؤشر</th><th>النوع</th><th>المعادلة</th><th>الأساس</th><th>المستهدف</th><th>التحمل</th><th>المالك</th></tr>${G.kpis.map(k => `<tr><td>${esc(k.id)} · ${esc(k.name)}</td><td>${k.type}</td><td><small>${esc(k.formula)}</small></td><td>${esc(k.base)}</td><td>${esc(k.target)}</td><td>${esc(k.tol)}</td><td>${esc(k.owner)}</td></tr>`).join('')}</table></div>
      <div class="pg"><h2>3. سجل الأحداث والقرارات</h2><table class="big"><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>الحدث</th><th>الإدارة</th><th>الخطورة</th></tr>${G.evs.map(e => `<tr><td>${e.id}</td><td>${e.date}</td><td>${esc(e.type)}</td><td><b>${esc(e.title)}</b><br><small>${esc(e.desc)}</small></td><td>${esc(e.dept)}</td><td>${e.sev}</td></tr>`).join('')}</table></div>
      <div class="pg"><h2>4. سجل المخاطر والفرص</h2>${heat(G, 'inh')}<table class="big"><tr><th>المعرّف</th><th>الخطر/الفرصة</th><th>المالك</th><th>المتأصل</th><th>المتبقي</th><th>المعالجة</th><th>الموعد</th></tr>${G.risks.map(r => `<tr><td>${r.id}</td><td>${esc(r.title)}<br><small>${esc(r.cause)} ← ${esc(r.cons)}</small></td><td>${esc(r.owner)}</td><td>${lvl(r.inh)}</td><td>${lvl(r.res)}</td><td>${esc(r.treat)}</td><td>${r.due}</td></tr>`).join('')}</table></div>
      <div class="pg"><h2>5. سجل الالتزامات</h2><table class="big"><tr><th>المعرّف</th><th>المصدر</th><th>المتطلب</th><th>النوع</th><th>المالك</th><th>الضوابط</th></tr>${G.obligations.map(x => `<tr><td>${x.id}</td><td>${esc(x.reg)}</td><td>${esc(x.req)}</td><td>${x.kind}</td><td>${esc(x.owner)}</td><td><small>${x.controls.join(' ')}</small></td></tr>`).join('')}</table></div>
      <div class="pg"><h2>6. مكتبة الضوابط</h2><table class="big"><tr><th>المعرّف</th><th>الضابط</th><th>النوع</th><th>الاتجاه</th><th>المالك</th><th>التكرار</th><th>المؤشر</th></tr>${G.controls.map(c => `<tr><td>${c.id}</td><td>${esc(c.ar)}<br><small>${esc(c.refs.join(' · '))}</small></td><td>${EN.TN[c.t]}</td><td>${c.orient}</td><td>${esc(c.owner)}</td><td>${esc(c.freq)}</td><td>${esc(c.kci)}</td></tr>`).join('')}</table></div>
      <div class="pg"><h2>7. خطة عناصر نموذج GRC العشرين</h2>${G.elements.map(e => `<h3>${e.code} · ${esc(e.ar)} <small>(${e.cur} ← ${e.target})</small></h3><p><b>لماذا الآن:</b> ${esc(e.why)}</p><ol>${e.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ol><p><small>الأدوات: ${(TOOLS.BY[e.code] || []).map(t => esc(TOOLS.T[t].ar)).join('، ')} · المالك: ${esc(e.owner)} · الموعد: ${e.due}</small></p>`).join('')}</div>
      <div class="pg"><h2>8. سجل التفاعلات الديناميكية</h2>${S.log.length ? S.log.map(l => `<h3>${esc(l.ev.id)} · ${esc(l.ev.type)} — ${esc(l.ev.title)}</h3><table><tr><th>العنصر</th><th>الدراسة</th></tr>${l.st.map(x => `<tr><td>${x.el}</td><td>${esc(x.txt)}</td></tr>`).join('')}</table>`).join('') : '<p>لم تُسجل تفاعلات بعد.</p>'}</div>
      <div class="pg"><h2>9. خارطة الطريق</h2>${G.roadmap.map(p => `<h3>${p.t} — ${p.d}</h3><ul>${p.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</div>
      ${G.policies.map(p => S.pol[p.id] || policyHTML(p)).join('')}`;
  }

  /* ───────── PowerPoint — التقارير والنتائج الرئيسية فقط ───────── */
  function ppt() {
    if (!window.PptxGenJS) return toast('مكتبة العرض غير محمّلة');
    const G = S.gen, o = S.org, p = new window.PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.rtlMode = true; p.title = 'GRC — ' + o.name; p.author = 'د. محمد عطية';
    const NV = '0A1B3D', GD = 'C9973B', G2 = 'E2B85A', CR = 'FBF8F2', MU = '5B6476', F = 'Rubik', W = 13.333;
    p.theme = { headFontFace: F, bodyFontFace: F };
    let n = 0;
    const T = (s, t, x, y, w, h, o2) => s.addText(t, Object.assign({ x, y, w, h, fontFace: F, fontSize: 14, color: '1B2436', align: 'right', rtlMode: true, valign: 'top', margin: 0, isTextBox: true }, o2 || {}));
    const frame = (kick, title, sub) => {
      const s = p.addSlide(); n++; s.background = { color: 'FFFFFF' };
      s.addShape(p.ShapeType.rect, { x: W - 0.18, y: 0, w: 0.18, h: 7.5, fill: { color: NV } });
      T(s, kick, 0.6, 0.38, 11.9, 0.3, { fontSize: 11, bold: true, color: GD, charSpacing: 2 });
      T(s, title, 2.3, 0.66, 10.2, 0.7, { fontSize: 26, bold: true, color: NV, fit: 'shrink' });
      if (sub) T(s, sub, 0.6, 1.32, 11.9, 0.4, { fontSize: 13, color: MU });
      s.addShape(p.ShapeType.roundRect, { x: 0.4, y: 0.3, w: 1.7, h: 0.66, fill: { color: NV }, line: { color: NV, width: 0.5 }, rectRadius: 0.1 }); if (window.TFS_LOGO_PNG) s.addImage({ data: window.TFS_LOGO_PNG, x: 0.5, y: 0.35, w: 1.5, h: 0.56 });
      s.addShape(p.ShapeType.line, { x: 0.6, y: 6.95, w: 12.1, h: 0, line: { color: 'E7DCC6', width: 0.75 } });
      T(s, CREDIT + '   ·   ' + o.name, 1.2, 7.02, 11.5, 0.3, { fontSize: 9, color: '8E97A8' });
      T(s, String(n), 0.6, 7.02, 0.5, 0.3, { fontSize: 9, color: GD, bold: true, align: 'left' });
      return s;
    };
    const card = (s, x, y, w, h, fill) => s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: fill || CR }, line: { color: 'E7DCC6', width: 0.75 }, rectRadius: 0.12 });
    const tbl = (s, head, rows, y, cw, fs) => s.addTable([head.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NV } } }))].concat(rows.map((r, i) => r.map(c => ({ text: String(c), options: { fill: { color: i % 2 ? 'F6EEDC' : 'FFFFFF' } } })))),
      { x: 0.6, y, w: 12.1, colW: cw, fontFace: F, fontSize: fs || 11, align: 'right', rtlMode: true, valign: 'middle', border: { type: 'solid', color: 'E7DCC6', pt: 0.75 }, autoPage: false, margin: 0.05 });
    const chartBase = () => ({ catAxisLabelFontFace: F, valAxisLabelFontFace: F, legendFontFace: F, dataLabelFontFace: F, titleFontFace: F, catAxisLabelColor: MU, valAxisLabelColor: MU, valGridLine: { color: 'EEE6D6', size: 0.5 }, catGridLine: { style: 'none' }, catAxisLabelFontSize: 10, valAxisLabelFontSize: 9 });
    const crit = G.risks.filter(r => r.kind === 'خطر').sort((a, b) => b.inh - a.inh);

    // 1 الغلاف
    let s = p.addSlide(); n++; s.background = { color: NV };
    s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 4.4, h: 7.5, fill: { color: '13295A' } });
    if (window.TFS_LOGO_PNG) s.addImage({ data: window.TFS_LOGO_PNG, x: 0.7, y: 0.7, w: 3.0, h: 1.15 });
    T(s, 'GRC PROGRAM · KEY RESULTS', 5.0, 1.6, 7.7, 0.4, { fontSize: 13, bold: true, color: G2, charSpacing: 3 });
    T(s, 'نتائج برنامج الحوكمة والمخاطر والامتثال', 5.0, 2.1, 7.7, 1.6, { fontSize: 38, bold: true, color: 'FFFFFF' });
    T(s, o.name, 5.0, 3.85, 7.7, 0.6, { fontSize: 22, color: G2 });
    T(s, 'نموذج قدرات GRC 3.5 · ' + EN.today(), 5.0, 4.5, 7.7, 0.4, { fontSize: 14, color: 'D5DBE7' });
    s.addShape(p.ShapeType.line, { x: 5.0, y: 5.6, w: 7.7, h: 0, line: { color: GD, width: 1.25 } });
    T(s, CREDIT, 5.0, 5.75, 7.7, 0.4, { fontSize: 14, bold: true, color: 'FFFFFF' }); T(s, CREDIT_EN, 5.0, 6.15, 7.7, 0.35, { fontSize: 10, color: 'A3ADC2', align: 'right' });
    T(s, [{ text: String(G.evs.length), options: { fontSize: 40, bold: true, color: G2, breakLine: true } }, { text: 'حدثًا وقرارًا حُلّلت', options: { fontSize: 13, color: 'D5DBE7', breakLine: true } }, { text: ' ', options: { fontSize: 10, breakLine: true } }, { text: String(G.controls.length), options: { fontSize: 40, bold: true, color: G2, breakLine: true } }, { text: 'ضابطًا مصممًا', options: { fontSize: 13, color: 'D5DBE7' } }], 0.7, 3.0, 3.0, 3.6, { align: 'center' });

    // 2 الملخص التنفيذي
    s = frame('EXECUTIVE SUMMARY', 'الملخص التنفيذي', 'من البيانات والأحداث إلى برنامج GRC متكامل');
    [['أحداث وقرارات', G.evs.length], ['مخاطر حرجة', G.risks.filter(r => r.inh >= 15).length], ['ضوابط', G.controls.length], ['سياسات', G.policies.length], ['أهداف', G.objectives.length], ['مؤشرات', G.kpis.length]].forEach(([t, v], i) => {
      const x = 12.7 - (i + 1) * 2.0 + 0.1; card(s, x, 1.95, 1.85, 1.35, i === 1 ? 'FDECEA' : CR);
      T(s, String(v), x, 2.05, 1.85, 0.7, { fontSize: 32, bold: true, color: i === 1 ? 'B42318' : NV, align: 'center' }); T(s, t, x, 2.78, 1.85, 0.4, { fontSize: 12, color: MU, align: 'center' }); });
    const msgs = [['أعلى المخاطر', crit.slice(0, 3).map(r => r.cat).join('، ')], ['أولوية 30 يومًا', 'معالجة ' + G.risks.filter(r => r.inh >= 15).length + ' مخاطر حرجة وتشغيل ضوابطها'], ['الحوكمة', G.policies.length + ' سياسات جاهزة للتوقيع و' + G.obligations.length + ' التزامات مربوطة بالضوابط'], ['القياس', G.kpis.filter(k => k.type === 'KRI').length + ' مؤشرات خطر بحدود رغبة وتحمل واستيعاب']];
    msgs.forEach(([h, d], i) => { const y = 3.6 + i * 0.8; s.addShape(p.ShapeType.ellipse, { x: 12.2, y: y + 0.12, w: 0.42, h: 0.42, fill: { color: GD } }); T(s, String(i + 1), 12.2, y + 0.12, 0.42, 0.42, { fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      T(s, [{ text: h + ': ', options: { bold: true, color: NV } }, { text: d, options: { color: '1B2436' } }], 0.6, y + 0.08, 11.4, 0.55, { fontSize: 15, valign: 'middle' }); });

    // 3 ملف المخاطر — رسم بياني
    s = frame('RISK PROFILE', 'ملف المخاطر: المتأصل مقابل المتبقي', 'أثر الضوابط المصممة على كل خطر (الاحتمالية × الأثر)');
    const tops = crit.slice(0, 10);
    s.addChart(p.ChartType.bar, [{ name: 'المتأصل', labels: tops.map(r => r.id + ' ' + r.cat), values: tops.map(r => r.inh) }, { name: 'المتبقي', labels: tops.map(r => r.id + ' ' + r.cat), values: tops.map(r => r.res) }],
      Object.assign(chartBase(), { x: 0.6, y: 1.85, w: 8.3, h: 4.95, barDir: 'bar', barGrouping: 'clustered', chartColors: ['B42318', '15803D'], showLegend: true, legendPos: 'b', legendFontSize: 11, showValue: true, dataLabelFontSize: 9, dataLabelColor: '1B2436', valAxisMaxVal: 25, valAxisMinVal: 0, catAxisOrientation: 'maxMin', barGapWidthPct: 60 }));
    card(s, 9.2, 1.85, 3.5, 4.95);
    const avgI = (tops.reduce((a, r) => a + r.inh, 0) / Math.max(1, tops.length)), avgR = (tops.reduce((a, r) => a + r.res, 0) / Math.max(1, tops.length));
    T(s, [{ text: Math.round((1 - avgR / Math.max(1, avgI)) * 100) + '%', options: { fontSize: 44, bold: true, color: '15803D', breakLine: true } }, { text: 'خفض متوقع في متوسط مستوى المخاطر بعد الضوابط', options: { fontSize: 13, color: MU, breakLine: true } }, { text: ' ', options: { breakLine: true } }, { text: avgI.toFixed(1) + ' ← ' + avgR.toFixed(1), options: { fontSize: 22, bold: true, color: NV, breakLine: true } }, { text: 'متوسط المتأصل ← المتبقي', options: { fontSize: 12, color: MU } }], 9.4, 2.2, 3.1, 4.3, { align: 'center' });

    // 4 خريطة الحرارة
    s = frame('HEAT MAP', 'خريطة الحرارة — قبل الضوابط وبعدها');
    ['inh', 'res'].forEach((k, j) => { const x0 = j ? 0.75 : 7.0; T(s, j ? 'المتبقي بعد الضوابط' : 'المتأصل', x0, 1.45, 5.6, 0.4, { bold: true, color: NV, align: 'center', fontSize: 15 });
      for (let L = 5; L >= 1; L--) for (let I = 1; I <= 5; I++) { const rs = G.risks.filter(r => k === 'inh' ? r.L === L && r.I === I : r.rL === L && r.rI === I); const c = EN.level(L * I)[2].slice(1);
        s.addShape(p.ShapeType.rect, { x: x0 + (5 - I) * 1.1, y: 1.95 + (5 - L) * 0.94, w: 1.06, h: 0.9, fill: { color: c, transparency: rs.length ? 0 : 75 }, line: { color: 'FFFFFF', width: 1 } });
        if (rs.length) T(s, rs.map(r => r.id).join('\n'), x0 + (5 - I) * 1.1, 1.97 + (5 - L) * 0.94, 1.06, 0.86, { fontSize: 9, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' }); } });
    T(s, 'الأثر يزداد ←   ·   الاحتمالية تزداد ↑', 0.6, 6.68, 12.1, 0.25, { fontSize: 10, color: MU, align: 'center' });

    // 5 المخاطر الحرجة
    s = frame('PRIORITY RISKS', 'المخاطر ذات الأولوية', 'المخاطر الحرجة والعالية وخطة معالجتها');
    tbl(s, ['المعرّف', 'الخطر', 'المالك', 'المتأصل', 'المتبقي', 'المعالجة', 'الموعد'], crit.slice(0, 8).map(r => [r.id, r.title, r.owner, r.inh + ' ' + EN.level(r.inh)[0], r.res + ' ' + EN.level(r.res)[0], r.treat, r.due]), 1.9, [0.85, 4.6, 1.75, 1.15, 1.15, 1.4, 1.2], 11);

    // 6 الضوابط
    s = frame('CONTROLS · IACM', 'تصميم الضوابط وفق نموذج IACM', G.controls.length + ' ضابطًا موزعة حسب التوقيت والموضوع');
    const tN = t => G.controls.filter(c => c.t === t).length;
    s.addChart(p.ChartType.doughnut, [{ name: 'IACM', labels: ['استباقي', 'استقصائي', 'استجابي'], values: [tN('P'), tN('D'), tN('R')] }], Object.assign(chartBase(), { x: 8.6, y: 1.85, w: 4.1, h: 4.9, holeSize: 55, chartColors: ['15803D', 'C9973B', '1F5FBF'], showLegend: true, legendPos: 'b', legendFontSize: 12, showPercent: true, showValue: false, dataLabelColor: 'FFFFFF', dataLabelFontSize: 12 }));
    const byT = G.order.map(t => [thm(t).ar, G.controls.filter(c => c.theme === t).length]).sort((a, b) => b[1] - a[1]).slice(0, 10);
    s.addChart(p.ChartType.bar, [{ name: 'الضوابط', labels: byT.map(x => x[0]), values: byT.map(x => x[1]) }], Object.assign(chartBase(), { x: 0.6, y: 1.85, w: 7.8, h: 4.9, barDir: 'bar', chartColors: [NV], showLegend: false, showValue: true, dataLabelFontSize: 10, dataLabelColor: NV, catAxisOrientation: 'maxMin', barGapWidthPct: 45 }));

    // 7 الخارطة الاستراتيجية
    s = frame('STRATEGY MAP', 'الأهداف الاستراتيجية — بطاقة الأداء المتوازن', 'مولّدة من الرؤية والرسالة والاستراتيجية والمخاطر');
    DYN.PERSP.forEach((ps, i) => { const y = 1.9 + i * 1.22, objs = G.objectives.filter(x => x.persp === ps).slice(0, 4);
      s.addShape(p.ShapeType.rect, { x: 10.6, y, w: 2.1, h: 1.05, fill: { color: i % 2 ? GD : NV } }); T(s, ps, 10.6, y, 2.1, 1.05, { fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      objs.forEach((ob, j) => { const x = 10.45 - (j + 1) * 2.48; card(s, x, y + 0.05, 2.4, 0.95); T(s, ob.title, x + 0.08, y + 0.08, 2.24, 0.9, { fontSize: 10.5, color: NV, valign: 'middle', fit: 'shrink' }); }); });

    // 8 المؤشرات الرئيسية
    s = frame('KEY INDICATORS', 'مؤشرات الخطر الرئيسية وحدودها', 'الرغبة ← التحمل ← الاستيعاب لكل مؤشر خطر');
    tbl(s, ['المؤشر', 'خط الأساس', 'المستهدف', 'الرغبة', 'التحمل', 'الاستيعاب', 'التكرار', 'المالك'], G.kpis.filter(k => k.type === 'KRI').slice(0, 9).map(k => [k.name, k.base, k.target, k.appetite, k.tol, k.cap, k.freq, k.owner]), 1.9, [3.9, 1.4, 1.3, 1.0, 1.0, 1.0, 0.9, 1.6], 10.5);

    // 9 النضج
    s = frame('CAPABILITY MATURITY', 'النضج الحالي مقابل المستهدف — العناصر العشرون');
    s.addChart(p.ChartType.bar, [{ name: 'الحالي', labels: G.elements.map(e => e.code), values: G.elements.map(e => +e.cur) }, { name: 'المستهدف', labels: G.elements.map(e => e.code), values: G.elements.map(e => +e.target) }],
      Object.assign(chartBase(), { x: 0.6, y: 1.6, w: 12.1, h: 5.2, barDir: 'col', barGrouping: 'clustered', chartColors: [NV, G2], showLegend: true, legendPos: 't', legendFontSize: 11, valAxisMaxVal: 5, valAxisMinVal: 0, valAxisMajorUnit: 1, showValue: true, dataLabelFontSize: 8, barGapWidthPct: 40 }));

    // 10 التفاعل الديناميكي
    const L = S.log[0];
    if (L) {
      s = frame('DYNAMIC GRC', 'التفاعل الديناميكي: ' + (L.ev.title.length > 42 ? L.ev.title.slice(0, 42) + '…' : L.ev.title), L.ev.id + ' · ' + L.ev.type + ' — دراسة فورية انعكست على المراحل الأربع');
      'LAPR'.split('').forEach((st, i) => { const x = 12.7 - (i + 1) * 3.05 + 0.1, c = STG[st][2].slice(1), items = L.st.filter(z => z.el[0] === st);
        s.addShape(p.ShapeType.rect, { x, y: 1.9, w: 2.9, h: 0.6, fill: { color: c } }); T(s, STG[st][0] + ' · ' + STG[st][1], x, 1.9, 2.9, 0.6, { fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
        card(s, x, 2.55, 2.9, 4.25, 'FFFFFF');
        T(s, items.slice(0, 6).map(z => ({ text: z.el + ' · ' + elOf(z.el).ar, options: { bold: true, color: c, breakLine: true, fontSize: 11 } })).length ? items.slice(0, 6).flatMap(z => [{ text: z.el + ' · ' + elOf(z.el).ar, options: { bold: true, color: c, breakLine: true, fontSize: 10.5 } }, { text: z.txt.slice(0, 95) + (z.txt.length > 95 ? '…' : ''), options: { color: '1B2436', breakLine: true, fontSize: 8.5 } }]) : [{ text: '—', options: {} }], x + 0.1, 2.65, 2.7, 4.05, { paraSpaceAfter: 3, fit: 'shrink' });
        if (i < 3) T(s, '←', x - 0.2, 1.9, 0.2, 0.6, { fontSize: 16, bold: true, color: GD, align: 'center', valign: 'middle' }); });
    }

    // 11 السياسات
    s = frame('POLICY PACK', 'حزمة السياسات', 'وثائق كاملة بفهرس وأدوار وضوابط ومؤشرات وجداول اعتماد وتوقيع لكل إدارة');
    tbl(s, ['رقم الوثيقة', 'السياسة', 'المالك', 'الأقسام', 'الضوابط', 'الأحداث المبررة'], G.policies.map(x => [x.no, x.ar, x.owner, x.sections.length, x.controls.length, x.events.length]), 1.9, [2.1, 4.6, 2.2, 1.0, 1.0, 1.2], 11);

    // 12 خارطة الطريق
    s = frame('ROADMAP', 'خارطة الطريق التنفيذية');
    G.roadmap.forEach((ph, i) => { const x = 12.7 - (i + 1) * 3.05 + 0.1; s.addShape(p.ShapeType.rect, { x, y: 1.6, w: 2.9, h: 0.75, fill: { color: i % 2 ? GD : NV } }); T(s, ph.t + '\n' + ph.d, x, 1.6, 2.9, 0.75, { color: 'FFFFFF', bold: true, align: 'center', valign: 'middle', fontSize: 12 });
      card(s, x, 2.42, 2.9, 4.4, 'FFFFFF'); T(s, ph.items.slice(0, 7).map(t => ({ text: t.length > 80 ? t.slice(0, 80) + '…' : t, options: { bullet: true, breakLine: true } })), x + 0.08, 2.52, 2.74, 4.2, { fontSize: 9, paraSpaceAfter: 4, fit: 'shrink' }); });

    // 13 القرارات المطلوبة
    s = frame('DECISIONS REQUESTED', 'القرارات المطلوبة من الإدارة');
    [['اعتماد سجل المخاطر وبيان الرغبة في المخاطر', 'لجنة المخاطر'], ['اعتماد الأهداف والمؤشرات وحدود التحمل', 'الإدارة التنفيذية'], ['اعتماد حزمة السياسات وجمع التوقيعات', 'الرئيس التنفيذي وملاك السياسات'], ['تشغيل الضوابط الحرجة خلال 30 يومًا', 'الخط الأول'], ['خطة الضمان المستقل', 'التدقيق الداخلي'], ['متابعة شهرية للمؤشرات والتفاعلات الديناميكية', 'مكتب GRC']].forEach(([a, b], i) => {
      const y = 1.7 + i * 0.85; card(s, 0.6, y, 12.1, 0.72, i % 2 ? 'FFFFFF' : CR); s.addShape(p.ShapeType.ellipse, { x: 12.05, y: y + 0.13, w: 0.46, h: 0.46, fill: { color: NV } }); T(s, String(i + 1), 12.05, y + 0.13, 0.46, 0.46, { fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      T(s, a, 3.6, y, 8.3, 0.72, { fontSize: 15, bold: true, color: NV, valign: 'middle' }); T(s, b, 0.8, y, 2.7, 0.72, { fontSize: 12, color: GD, valign: 'middle', bold: true }); });

    // 14 الختام
    s = p.addSlide(); n++; s.background = { color: NV };
    if (window.TFS_LOGO_PNG) s.addImage({ data: window.TFS_LOGO_PNG, x: 5.17, y: 1.5, w: 3.0, h: 1.15 });
    T(s, 'شكرًا لكم', 0.6, 3.0, 12.1, 0.9, { fontSize: 40, bold: true, color: 'FFFFFF', align: 'center' });
    T(s, CREDIT, 0.6, 4.1, 12.1, 0.5, { fontSize: 18, bold: true, color: G2, align: 'center' }); T(s, 'Track Ford · Business Consulting and International Learning', 0.6, 4.65, 12.1, 0.4, { fontSize: 12, color: 'A3ADC2', align: 'center' });

    p.writeFile({ fileName: 'TrackFord_GRC_Key_Results_' + EN.today() + '.pptx' }).then(() => toast('📽️ تم إنشاء عرض النتائج الرئيسية'));
  }

  /* ───────── الإقلاع ───────── */
  function boot() {
    const h = (location.hash || '').slice(1); if (TABS.some(t => t[0] === h)) TAB = h;
    nav(); render(); if (window.TFAI && window.TFAI.probe) window.TFAI.probe().catch(() => {});
    if (window.TFS_LOGO) { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); try { window.TFS_LOGO_PNG = c.toDataURL('image/png'); } catch (e) {} }; im.src = window.TFS_LOGO; }
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
  window.TFS = { get state() { return S; }, regenerate, render, go, addEvent };
})();
