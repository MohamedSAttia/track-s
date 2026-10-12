/* Track Ford GRC — مصمّمات ونماذج تطبيقية (خطوة بخطوة)
   أربعة معالجات: مصمّم الأهداف والمؤشرات · نموذج الأداء الشامل · خطوط المساءلة · نموذج IACM.
   كلها تعمل بمحرك داخلي، وتتحوّل تلقائيًا إلى Claude عبر /api/ai عند تفعيله، وتُصدَّر PPT/PDF وتُرسَل واتساب/إيميل. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EN = () => (window.TFC && window.TFC.EN) ? window.TFC.EN() : false;
  const L = (ar, en) => EN() ? en : ar;
  const ai = () => !!(window.TFAI && window.TFAI.ok);
  const SYS = 'أنت مستشار حوكمة ومخاطر وامتثال خبير بنموذج قدرات GRC 3.5 من OCEG. تجيب بالعربية الفصحى المختصرة، عمليًا، وبمصطلحات النموذج الرسمية.';
  const rd = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const org = () => { try { return (window.TFB && window.TFB.profile()) || {}; } catch (e) { return {}; } };
  const groupName = () => { try { const u = window.TFC && window.TFC.user(); if (u && u.group && u.group !== 'عام') return u.group; const g = (localStorage.getItem('tf_group_name') || '').trim(); if (g) return g; return (org() || {}).name || 'مجموعتي'; } catch (e) { return 'مجموعتي'; } };
  const setGroupName = n => { try { n = String(n || '').trim(); if (n) localStorage.setItem('tf_group_name', n); const u = window.TFC && window.TFC.user && window.TFC.user(); if (u && window.TFC.setUser && (!u.group || u.group === 'عام')) { u.group = n; window.TFC.setUser(u); } window.TFC && window.TFC.sync && window.TFC.sync(true); } catch (e) {} };
  const traineeName = () => { try { const u = window.TFC && window.TFC.user(); return u && !u.guest ? u.name : ''; } catch (e) { return ''; } };

  /* ───────── تحميل pptxgenjs عند الحاجة ───────── */
  let pptxLoading = null;
  function ensurePptx() {
    if (window.PptxGenJS) return Promise.resolve(true);
    if (pptxLoading) return pptxLoading;
    pptxLoading = new Promise(res => {
      const s = document.createElement('script');
      s.src = 'vendor/pptxgen.bundle.js'; s.onload = () => res(!!window.PptxGenJS); s.onerror = () => res(false);
      document.head.appendChild(s);
    });
    return pptxLoading;
  }

  /* ───────── مُصدِّر PPT عام مبني على بنية موحّدة ───────── */
  // doc = { title, subtitle, meta:[{k,v}], blocks:[{heading, kind:'table'|'bullets'|'kv'|'text', ...}] }
  async function toPPT(doc, fname) {
    const ok = await ensurePptx();
    if (!ok) { toast(L('تعذّر تحميل مولّد PowerPoint — استخدم تصدير PDF.', 'Could not load the PowerPoint engine — use PDF export.')); return; }
    const p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.author = 'Dr. Mohamed Attia'; p.company = 'Track Ford GRC';
    const NAVY = '0A1B3D', NAVY2 = '13295A', GOLD = 'C9973B', GOLD2 = 'E2B85A', WHITE = 'FFFFFF', GREY = '5B6476', ICE = 'EFF5FA', LINE = 'E7DCC6', GREEN = '047857', RED = 'B91C1C', AMBER = 'B45309';
    const W = 13.333, H = 7.5, M = 0.6, CW = W - 2 * M;
    const ar = o => Object.assign({ fontFace: 'Rubik', align: 'right', rtlMode: true }, o);
    const en = o => Object.assign({ fontFace: 'Montserrat', align: 'left' }, o);
    function frame(sl, kick, dark) {
      if (dark) sl.background = { color: NAVY };
      sl.addShape('rect', { x: 0, y: 0, w: W, h: 0.16, fill: { color: GOLD } });
      if (kick) sl.addText(kick, en({ x: M, y: 0.32, w: CW, h: 0.24, fontSize: 9, bold: true, color: GOLD, isTextBox: true }));
      sl.addText('TRACK FORD · GRC', en({ x: W - 3.1, y: 0.3, w: 2.5, h: 0.24, fontSize: 9, bold: true, color: dark ? GOLD2 : GREY, align: 'right', isTextBox: true }));
      sl.addText('د. محمد عطية · trackford.sa', ar({ x: M, y: H - 0.42, w: CW, h: 0.26, fontSize: 9, color: GREY, align: 'left', isTextBox: true }));
    }
    // cover
    let s = p.addSlide(); s.background = { color: NAVY };
    s.addShape('rect', { x: 0, y: 0, w: W, h: 0.16, fill: { color: GOLD } });
    s.addText('TRACK FORD · GRC CAPABILITY MODEL 3.5', en({ x: M, y: 1.4, w: CW, h: 0.4, fontSize: 13, bold: true, color: GOLD2, isTextBox: true }));
    s.addText(doc.title, ar({ x: M, y: 2.0, w: CW, h: 1.2, fontSize: 34, bold: true, color: WHITE, isTextBox: true }));
    if (doc.subtitle) s.addText(doc.subtitle, ar({ x: M, y: 3.2, w: CW, h: 0.6, fontSize: 16, color: GOLD2, isTextBox: true }));
    (doc.meta || []).forEach((m, i) => {
      s.addShape('roundRect', { x: M + i * 3.2, y: 4.4, w: 3.0, h: 1.0, fill: { color: NAVY2 }, line: { type: 'none' }, rectRadius: 0.08 });
      s.addText(String(m.v), ar({ x: M + i * 3.2 + 0.1, y: 4.5, w: 2.8, h: 0.5, fontSize: 18, bold: true, color: GOLD2, align: 'center', isTextBox: true }));
      s.addText(String(m.k), ar({ x: M + i * 3.2 + 0.1, y: 5.0, w: 2.8, h: 0.35, fontSize: 11, color: WHITE, align: 'center', isTextBox: true }));
    });
    s.addText(L('أُعدّ داخل منصة تراكفورد — ', 'Built in the Track Ford platform — ') + new Date().toLocaleDateString('ar-SA-u-ca-gregory'), ar({ x: M, y: 6.6, w: CW, h: 0.3, fontSize: 11, color: GREY, isTextBox: true }));
    // content blocks — one slide per block
    (doc.blocks || []).forEach(bl => {
      const sl = p.addSlide(); frame(sl, bl.kick || '');
      sl.addText(bl.heading, ar({ x: M, y: 0.62, w: CW, h: 0.6, fontSize: 22, bold: true, color: NAVY, isTextBox: true }));
      sl.addShape('rect', { x: M, y: 1.26, w: CW, h: 0.02, fill: { color: GOLD } });
      if (bl.kind === 'table') {
        const head = bl.cols.map(c => ({ text: c, options: { fill: NAVY, color: WHITE, bold: true, align: 'center', fontFace: 'Rubik' } }));
        const rows = bl.rows.map((r, ri) => r.map(cell => ({ text: String(cell), options: { fontFace: 'Rubik', align: 'right', color: '1B2436', fill: ri % 2 ? 'F6F9FC' : WHITE, valign: 'middle' } })));
        sl.addTable([head, ...rows], { x: M, y: 1.5, w: CW, colW: bl.colW || null, border: { type: 'solid', color: LINE, pt: 0.5 }, fontSize: 12, rowH: 0.5, autoPage: false });
      } else if (bl.kind === 'bullets') {
        sl.addText(bl.items.map(t => ({ text: t, options: { bullet: { code: '2022' }, breakLine: true } })), ar({ x: M, y: 1.5, w: CW, h: 5.2, fontSize: 15, color: '1B2436', paraSpaceAfter: 8, isTextBox: true }));
      } else if (bl.kind === 'kv') {
        bl.pairs.forEach((kv, i) => {
          const y = 1.55 + i * 0.62;
          sl.addShape('roundRect', { x: W - M - 3.4, y: y, w: 3.4, h: 0.52, fill: { color: ICE }, line: { type: 'none' }, rectRadius: 0.05 });
          sl.addText(kv.k, ar({ x: W - M - 3.3, y: y, w: 3.2, h: 0.52, fontSize: 12, bold: true, color: NAVY, valign: 'middle', isTextBox: true }));
          sl.addText(String(kv.v), ar({ x: M, y: y, w: CW - 3.6, h: 0.52, fontSize: 12, color: '1B2436', valign: 'middle', isTextBox: true }));
        });
      } else {
        sl.addText(String(bl.text || ''), ar({ x: M, y: 1.5, w: CW, h: 5.2, fontSize: 15, color: '1B2436', isTextBox: true }));
      }
    });
    await p.writeFile({ fileName: fname || 'TrackFord_GRC.pptx' });
  }

  /* ───────── تصدير HTML للطباعة / PDF ───────── */
  function docHTML(doc) {
    const metaRow = (doc.meta || []).map(m => `<span class="k">${esc(m.v)}</span> <small>${esc(m.k)}</small>`).join(' · ');
    const blocks = (doc.blocks || []).map(bl => {
      let body = '';
      if (bl.kind === 'table') body = `<table><tr>${bl.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${bl.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
      else if (bl.kind === 'bullets') body = `<ul>${bl.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
      else if (bl.kind === 'kv') body = `<table>${bl.pairs.map(p => `<tr><th style="width:32%">${esc(p.k)}</th><td>${esc(p.v)}</td></tr>`).join('')}</table>`;
      else body = `<p>${esc(bl.text || '')}</p>`;
      return `<h2>${esc(bl.heading)}</h2>${body}`;
    }).join('');
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(doc.title)}</title><style>
      @page{size:A4 portrait;margin:14mm}body{font-family:'Rubik',Tahoma,Arial,sans-serif;color:#16202E;line-height:1.8;padding:20px}
      h1{color:#0A1B3D;border-bottom:3px solid #C9973B;padding-bottom:8px}h2{color:#fff;background:#0A1B3D;padding:7px 14px;border-radius:6px;margin-top:22px;font-size:16px}
      table{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px}th{background:#0A1B3D;color:#fff;padding:7px;text-align:right}td{border:1px solid #DCE4EC;padding:6px}tr:nth-child(even) td{background:#F6F9FC}
      ul{margin:8px 24px}.k{font-size:20px;font-weight:bold;color:#C9973B}.meta{background:#EFF5FA;border:1px solid #CBDDF5;border-radius:10px;padding:10px 14px;margin:10px 0}
      .cr{margin-top:28px;border-top:1px solid #DCE4EC;padding-top:10px;color:#5B6476;font-size:12px;text-align:center}</style></head><body>
      <h1>${esc(doc.title)}</h1>${doc.subtitle ? `<p style="color:#5B6476">${esc(doc.subtitle)}</p>` : ''}
      ${metaRow ? `<div class="meta">${metaRow}</div>` : ''}${blocks}
      <div class="cr">تراكفورد · trackford.sa · إعداد: د. محمد عطية — ${new Date().toLocaleDateString('ar-SA-u-ca-gregory')}</div></body></html>`;
  }
  function toPDF(doc) { const w = window.open('', '_blank'); if (!w) { toast('اسمح بالنوافذ المنبثقة للطباعة.'); return; } w.document.write(docHTML(doc)); w.document.close(); setTimeout(() => w.print(), 600); }
  function docText(doc) {
    let t = `📋 ${doc.title}${doc.subtitle ? ' — ' + doc.subtitle : ''}\n`;
    if (doc.meta && doc.meta.length) t += doc.meta.map(m => `${m.k}: ${m.v}`).join(' · ') + '\n';
    (doc.blocks || []).forEach(bl => {
      t += `\n— ${bl.heading} —\n`;
      if (bl.kind === 'table') { t += bl.cols.join(' | ') + '\n'; bl.rows.forEach(r => t += r.join(' | ') + '\n'); }
      else if (bl.kind === 'bullets') bl.items.forEach(i => t += '• ' + i + '\n');
      else if (bl.kind === 'kv') bl.pairs.forEach(p => t += `${p.k}: ${p.v}\n`);
      else t += (bl.text || '') + '\n';
    });
    t += '\nتراكفورد · trackford.sa';
    return t;
  }
  function shareWA(doc) { const t = docText(doc); window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); }
  function shareEmail(doc) { location.href = 'mailto:?subject=' + encodeURIComponent(doc.title) + '&body=' + encodeURIComponent(docText(doc)); }
  function copyText(doc) { const t = docText(doc); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('نُسخ النص ✅')).catch(() => prompt('انسخ:', t)); }

  function exportBar(getDoc, fnameBase) {
    const id = 'xb' + Math.random().toString(36).slice(2, 7);
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      el.querySelector('[data-x=ppt]').onclick = async () => { const d = getDoc(); if (!d) return; await toPPT(d, (fnameBase || 'TrackFord') + '.pptx'); };
      el.querySelector('[data-x=pdf]').onclick = () => { const d = getDoc(); if (d) toPDF(d); };
      el.querySelector('[data-x=wa]').onclick = () => { const d = getDoc(); if (d) shareWA(d); };
      el.querySelector('[data-x=mail]').onclick = () => { const d = getDoc(); if (d) shareEmail(d); };
      el.querySelector('[data-x=copy]').onclick = () => { const d = getDoc(); if (d) copyText(d); };
    }, 0);
    return `<div class="bld-exp" id="${id}"><b>${L('تصدير ومشاركة:', 'Export & share:')}</b>
      <button class="bld-b gold" data-x="ppt">📽️ PowerPoint</button>
      <button class="bld-b" data-x="pdf">🖨️ PDF</button>
      <button class="bld-b wa" data-x="wa">💬 واتساب</button>
      <button class="bld-b" data-x="mail">✉️ بريد</button>
      <button class="bld-b ghost" data-x="copy">📋 نسخ</button></div>`;
  }

  function toast(m) { let t = document.getElementById('tfToast'); if (!t) { t = document.createElement('div'); t.id = 'tfToast'; document.body.appendChild(t); t.style.cssText = 'position:fixed;bottom:22px;inset-inline-start:22px;background:#0A1B3D;color:#fff;padding:12px 18px;border-radius:12px;z-index:2147483001;font-family:Rubik,Tahoma,sans-serif;font-size:14px;max-width:360px;transition:.3s'; } t.textContent = m; t.style.opacity = '1'; clearTimeout(t._h); t._h = setTimeout(() => t.style.opacity = '0', 3000); }

  function save(key, data) { const g = groupName(); const all = rd('tf_builders') || {}; all[key] = { data, at: Date.now(), group: g, by: traineeName() }; wr('tf_builders', all); try { window.TFC && window.TFC.mark && window.TFC.mark('build_' + key); window.TFC && window.TFC.sync && window.TFC.sync(true); } catch (e) {} }
  function load(key) { const all = rd('tf_builders') || {}; return (all[key] || {}).data || null; }

  const EL = { L1: 'السياق الخارجي', L2: 'السياق الداخلي', L3: 'الثقافة', L4: 'أصحاب المصلحة', A1: 'التوجيه', A2: 'الأهداف', A3: 'التحديد', A4: 'التقييم', A5: 'التصميم', P1: 'الضوابط', P2: 'السياسات', P3: 'التواصل', P4: 'التثقيف', P5: 'الحوافز', P6: 'الإخطار', P7: 'الاستقصاء', P8: 'الاستجابة', R1: 'المتابعة', R2: 'الضمان', R3: 'التحسين' };

  /* ═══════════════ ① مصمّم الأهداف والمؤشرات ═══════════════ */
  function objectiveBuilder(host) {
    let d = load('objective') || { objective: '', smart: { s: '', m: '', a: '', r: '', t: '' }, kpi: { name: '', formula: '', target: '', freq: 'شهري', owner: '' }, kri: { name: '', formula: '', appetite: '', tolerance: '', capacity: '', freq: 'أسبوعي', owner: '' }, kci: { name: '', formula: '', target: '', freq: 'شهري', owner: '' }, response: '' };
    const getDoc = () => ({
      title: 'مصمّم الأهداف والمؤشرات — ' + groupName(), subtitle: d.objective || 'هدف قابل للقياس مرتبط بمؤشراته',
      meta: [{ k: 'المجموعة', v: groupName() }, { k: 'KPI', v: d.kpi.name || '—' }, { k: 'KRI', v: d.kri.name || '—' }, { k: 'KCI', v: d.kci.name || '—' }],
      blocks: [
        { heading: 'الهدف بصيغة SMART', kind: 'kv', pairs: [{ k: 'الهدف', v: d.objective }, { k: 'محدد (S)', v: d.smart.s }, { k: 'قابل للقياس (M)', v: d.smart.m }, { k: 'قابل للتحقيق (A)', v: d.smart.a }, { k: 'ذو صلة (R)', v: d.smart.r }, { k: 'محدد بزمن (T)', v: d.smart.t }] },
        { heading: 'المؤشرات الثلاثة', kind: 'table', cols: ['النوع', 'الاسم', 'المعادلة', 'الهدف/النطاقات', 'التكرار', 'المالك'], rows: [
          ['KPI أداء', d.kpi.name, d.kpi.formula, 'الهدف: ' + d.kpi.target, d.kpi.freq, d.kpi.owner],
          ['KRI مخاطر', d.kri.name, d.kri.formula, `تقبّل ${d.kri.appetite} · تحمّل ${d.kri.tolerance} · استيعاب ${d.kri.capacity}`, d.kri.freq, d.kri.owner],
          ['KCI امتثال', d.kci.name, d.kci.formula, 'الهدف: ' + d.kci.target, d.kci.freq, d.kci.owner]] },
        { heading: 'الاستجابة عند تجاوز الحدود', kind: 'text', text: d.response }]
    });
    const render = () => {
      host.innerHTML = `<div class="bld-head"><h3>🎯 مصمّم الأهداف والمؤشرات</h3><p>اكتب هدفًا بصيغة SMART ثم اشتقّ منه مؤشر الأداء (KPI) ومؤشر المخاطر (KRI) ومؤشر الامتثال (KCI) ونطاقاتها. ${ai() ? 'يمكن توليد مسودة بالذكاء الاصطناعي.' : ''}</p></div>
        <div class="bld-ai">${ai() ? '<button class="bld-b gold" id="aiFill">🤖 توليد مسودة من ملف مؤسستك</button>' : '<span class="bld-note">المحرك الداخلي: عبّئ الحقول، وستُبنى البطاقة والتصدير تلقائيًا.</span>'}</div>
        <div class="bld-grid">
          <section class="bld-card"><h4>① الهدف (SMART)</h4>
            <label>الهدف العام<textarea data-k="objective" rows="2" placeholder="مثال: رفع رضا العملاء من 78% إلى 88% بنهاية 2026">${esc(d.objective)}</textarea></label>
            <div class="bld-2"><label>محدد S<input data-k="smart.s" value="${esc(d.smart.s)}"></label><label>قابل للقياس M<input data-k="smart.m" value="${esc(d.smart.m)}"></label>
            <label>قابل للتحقيق A<input data-k="smart.a" value="${esc(d.smart.a)}"></label><label>ذو صلة R<input data-k="smart.r" value="${esc(d.smart.r)}"></label></div>
            <label>محدد بزمن T<input data-k="smart.t" value="${esc(d.smart.t)}"></label></section>
          <section class="bld-card kpi"><h4>② KPI — مؤشر الأداء (الفرصة)</h4>
            <label>الاسم<input data-k="kpi.name" value="${esc(d.kpi.name)}" placeholder="نسبة المشاريع المسلّمة في موعدها"></label>
            <label>المعادلة<input data-k="kpi.formula" value="${esc(d.kpi.formula)}"></label>
            <div class="bld-2"><label>الهدف<input data-k="kpi.target" value="${esc(d.kpi.target)}" placeholder="95%"></label><label>التكرار<input data-k="kpi.freq" value="${esc(d.kpi.freq)}"></label></div>
            <label>المالك<input data-k="kpi.owner" value="${esc(d.kpi.owner)}"></label></section>
          <section class="bld-card kri"><h4>③ KRI — مؤشر المخاطر (العقبة)</h4>
            <label>الاسم<input data-k="kri.name" value="${esc(d.kri.name)}" placeholder="عدد المقاولين المتأخرين"></label>
            <label>المعادلة<input data-k="kri.formula" value="${esc(d.kri.formula)}"></label>
            <div class="bld-3"><label>تقبّل<input data-k="kri.appetite" value="${esc(d.kri.appetite)}"></label><label>تحمّل<input data-k="kri.tolerance" value="${esc(d.kri.tolerance)}"></label><label>استيعاب<input data-k="kri.capacity" value="${esc(d.kri.capacity)}"></label></div>
            <div class="bld-2"><label>التكرار<input data-k="kri.freq" value="${esc(d.kri.freq)}"></label><label>المالك<input data-k="kri.owner" value="${esc(d.kri.owner)}"></label></div></section>
          <section class="bld-card kci"><h4>④ KCI — مؤشر الامتثال (الالتزام)</h4>
            <label>الاسم<input data-k="kci.name" value="${esc(d.kci.name)}" placeholder="نسبة المواقع المطابقة للسلامة"></label>
            <label>المعادلة<input data-k="kci.formula" value="${esc(d.kci.formula)}"></label>
            <div class="bld-2"><label>الهدف<input data-k="kci.target" value="${esc(d.kci.target)}" placeholder="100%"></label><label>التكرار<input data-k="kci.freq" value="${esc(d.kci.freq)}"></label></div>
            <label>المالك<input data-k="kci.owner" value="${esc(d.kci.owner)}"></label></section>
          <section class="bld-card" style="grid-column:1/-1"><h4>⑤ الاستجابة عند تجاوز الحدود</h4>
            <label><textarea data-k="response" rows="2" placeholder="≤ التحمّل: متابعة · بين التحمّل والاستيعاب: تصعيد وخطة تعافٍ · فوق الاستيعاب: إيقاف وتدخّل الإدارة">${esc(d.response)}</textarea></label></section>
        </div>
        <div class="bld-tip">💡 القاعدة: KPI يقيس التقدّم نحو الهدف · KRI يستشعر ما قد يعطّله مبكرًا · KCI يقيس الوفاء بالالتزام — تُقرأ معًا (نقطة اختبار + واقع عملي).</div>
        ${exportBar(getDoc, 'TrackFord_Objective_' + groupName())}`;
      bind();
    };
    const setPath = (o, path, v) => { const ks = path.split('.'); let t = o; for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]]; t[ks[ks.length - 1]] = v; };
    const bind = () => {
      host.querySelectorAll('[data-k]').forEach(el => el.addEventListener('input', () => { setPath(d, el.dataset.k, el.value); save('objective', d); }));
      const b = host.querySelector('#aiFill'); if (b) b.onclick = async () => {
        b.disabled = true; b.textContent = '⏳ يولّد…';
        try { const o = org(); const r = await window.TFAI.json(`صمّم هدفًا واحدًا بصيغة SMART مع مؤشراته لمنظمة «${o.name || 'جهة'}»${o.sector ? ' قطاع ' + o.sector : ''} وفق نموذج قدرات GRC 3.5. أعد JSON: {"objective":"","smart":{"s":"","m":"","a":"","r":"","t":""},"kpi":{"name":"","formula":"","target":"","freq":"","owner":""},"kri":{"name":"","formula":"","appetite":"","tolerance":"","capacity":"","freq":"","owner":""},"kci":{"name":"","formula":"","target":"","freq":"","owner":""},"response":""}`, SYS, { max_tokens: 1500 }); d = Object.assign(d, r); save('objective', d); render(); toast('تم توليد مسودة — عدّلها كما تشاء ✅'); }
        catch (e) { b.disabled = false; b.textContent = '🤖 توليد مسودة من ملف مؤسستك'; toast('تعذّر التوليد — عبّئ يدويًا.'); }
      };
    };
    render();
  }

  /* ═══════════════ ② باني نموذج الأداء الشامل ═══════════════ */
  const TP = [['الفعالية', 'Effective', 'تحقّق ممارساتنا الغرض المقصود وبأفضل تصميم'], ['الكفاءة', 'Efficient', 'نحقّق الغرض بأقل كلفة ممكنة'], ['الاستجابة', 'Responsive', 'نستشعر التغيّر ونتكيّف بسرعة'], ['المرونة', 'Resilient', 'نتحمّل الاضطرابات ونتعافى ولدينا بدائل']];
  function tpBuilder(host) {
    let d = load('total') || { v: [0, 0, 0, 0], note: ['', '', '', ''], action: ['', '', '', ''] };
    const avg = () => { const s = d.v.reduce((a, b) => a + b, 0); return d.v.length ? (s / d.v.length) : 0; };
    const getDoc = () => ({
      title: 'نموذج الأداء الشامل — ' + groupName(), subtitle: 'الأبعاد الأربعة · المتوسط ' + avg().toFixed(1) + ' / 4',
      meta: TP.map((t, i) => ({ k: t[0], v: d.v[i] + '/4' })),
      blocks: [{ heading: 'تقييم الأبعاد الأربعة', kind: 'table', cols: ['البُعد', 'التقييم (0-4)', 'الملاحظة', 'إجراء التحسين'], rows: TP.map((t, i) => [t[0] + ' · ' + t[1], String(d.v[i]), d.note[i], d.action[i]]) },
        { heading: 'الخلاصة', kind: 'text', text: `المتوسط ${avg().toFixed(1)}/4. أضعف بُعد: ${TP[d.v.indexOf(Math.min(...d.v))][0]} — يُبدأ به في خطة التحسين.` }]
    });
    const render = () => {
      host.innerHTML = `<div class="bld-head"><h3>📊 باني نموذج الأداء الشامل</h3><p>قيّم كل بُعد من 0 (غير موجود) إلى 4 (ناضج)، واكتب ملاحظة وإجراء تحسين. يُرسم المخطط ويُحسب المتوسط تلقائيًا.</p></div>
        <div class="bld-split"><div class="bld-tp">${TP.map((t, i) => `<div class="tp-row"><div class="tp-q"><b>${t[0]}</b> <span class="en">${t[1]}</span><br><small>${t[2]}</small></div>
          <div class="tp-scale">${[0, 1, 2, 3, 4].map(v => `<button class="tp-b ${d.v[i] === v ? 'on' : ''}" data-i="${i}" data-v="${v}">${v}</button>`).join('')}</div>
          <input class="tp-note" data-note="${i}" placeholder="ملاحظة" value="${esc(d.note[i])}"><input class="tp-note" data-act="${i}" placeholder="إجراء تحسين" value="${esc(d.action[i])}"></div>`).join('')}</div>
          <div class="bld-chart"><canvas id="tpRadar" width="360" height="360"></canvas><div class="tp-score"><b id="tpAvg">${avg().toFixed(1)}</b><span>المتوسط / 4</span></div></div></div>
        ${exportBar(getDoc, 'TrackFord_TotalPerformance_' + groupName())}`;
      draw(); bind();
    };
    const draw = () => {
      const c = host.querySelector('#tpRadar'); if (!c) return; const x = c.getContext('2d'), W = 360, cx = W / 2, cy = W / 2, R = 130;
      x.clearRect(0, 0, W, W); const N = 4;
      for (let ring = 1; ring <= 4; ring++) { x.beginPath(); for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / N, r = R * ring / 4; const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = '#E7DCC6'; x.stroke(); }
      x.fillStyle = '#5B6476'; x.font = '12px Rubik'; x.textAlign = 'center';
      TP.forEach((t, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; x.fillText(t[0], cx + (R + 20) * Math.cos(a), cy + (R + 20) * Math.sin(a) + 4); });
      x.beginPath(); d.v.forEach((v, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N, r = R * v / 4; const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath();
      x.fillStyle = 'rgba(201,151,59,.35)'; x.fill(); x.strokeStyle = '#C9973B'; x.lineWidth = 2; x.stroke();
    };
    const bind = () => {
      host.querySelectorAll('.tp-b').forEach(b => b.onclick = () => { d.v[+b.dataset.i] = +b.dataset.v; save('total', d); host.querySelector('#tpAvg').textContent = avg().toFixed(1); host.querySelectorAll(`.tp-b[data-i="${b.dataset.i}"]`).forEach(x => x.classList.toggle('on', x === b)); draw(); });
      host.querySelectorAll('[data-note]').forEach(el => el.oninput = () => { d.note[+el.dataset.note] = el.value; save('total', d); });
      host.querySelectorAll('[data-act]').forEach(el => el.oninput = () => { d.action[+el.dataset.act] = el.value; save('total', d); });
    };
    render();
  }

  /* ═══════════════ ③ باني خطوط المساءلة ═══════════════ */
  const LINES = [['الخط الأول', 'الملكية والعمليات — يدير الأداء والمخاطر مباشرة'], ['الخط الثاني', 'الدعم والمراقبة — الخبرة والمنهجية والمتابعة'], ['الخط الثالث', 'التدقيق والضمان — تأكيد موضوعي مستقل'], ['الإدارة التنفيذية', 'تخصيص الموارد والمساءلة التنفيذية'], ['المجلس/اللجنة', 'الإشراف والتوجيه والمساءلة النهائية']];
  function loaBuilder(host) {
    let d = load('loa') || { topic: '', rows: LINES.map(l => ({ line: l[0], who: '', role: '' })) };
    const getDoc = () => ({ title: 'خطوط المساءلة الخمسة — ' + groupName(), subtitle: d.topic || 'توزيع المسؤوليات', meta: [{ k: 'الموضوع', v: d.topic || '—' }, { k: 'المجموعة', v: groupName() }],
      blocks: [{ heading: 'توزيع المسؤوليات عبر الخطوط الخمسة', kind: 'table', cols: ['الخط', 'المسؤول (الجهة/الدور)', 'المسؤولية تحديدًا'], rows: d.rows.map(r => [r.line, r.who, r.role]) }] });
    const render = () => {
      host.innerHTML = `<div class="bld-head"><h3>⚖️ باني خطوط المساءلة</h3><p>اختر موضوعًا (عملية أو مخاطرة أو التزام)، ثم حدّد من المسؤول وما مسؤوليته في كل خط من الخطوط الخمسة. ${ai() ? 'يمكن التوليد بالذكاء الاصطناعي.' : ''}</p></div>
        <label class="bld-topic">الموضوع<input data-k="topic" value="${esc(d.topic)}" placeholder="مثال: فعالية ضوابط مكافحة غسل الأموال"></label>
        ${ai() ? '<button class="bld-b gold" id="aiFill" style="margin:8px 0">🤖 توليد توزيع مقترح</button>' : ''}
        <div class="loa">${d.rows.map((r, i) => `<div class="loa-row" style="--i:${i}"><div class="loa-line"><b>${r.line}</b><small>${LINES[i][1]}</small></div>
          <input data-who="${i}" placeholder="الجهة/الدور المسؤول" value="${esc(r.who)}"><input data-role="${i}" placeholder="المسؤولية تحديدًا في هذا الموضوع" value="${esc(r.role)}"></div>`).join('')}</div>
        <div class="bld-tip">💡 نقطة اختبار: الخط الثاني قد يقدّم ضمانًا محدودًا، أما الضمان الموضوعي المستقل فمن الخط الثالث. لا تخلط الملكية بالمراقبة بالضمان.</div>
        ${exportBar(getDoc, 'TrackFord_LoA_' + groupName())}`;
      bind();
    };
    const bind = () => {
      host.querySelector('[data-k=topic]').oninput = e => { d.topic = e.target.value; save('loa', d); };
      host.querySelectorAll('[data-who]').forEach(el => el.oninput = () => { d.rows[+el.dataset.who].who = el.value; save('loa', d); });
      host.querySelectorAll('[data-role]').forEach(el => el.oninput = () => { d.rows[+el.dataset.role].role = el.value; save('loa', d); });
      const b = host.querySelector('#aiFill'); if (b) b.onclick = async () => { b.disabled = true; b.textContent = '⏳…'; try { const r = await window.TFAI.json(`وزّع المسؤوليات عبر خطوط المساءلة الخمسة لموضوع «${d.topic || 'فعالية الضوابط'}» في منظمة «${(org().name) || 'جهة'}». أعد JSON: {"rows":[{"line":"الخط الأول","who":"","role":""}, ... خمسة بالترتيب]}`, SYS, { max_tokens: 1200 }); if (r.rows) { r.rows.slice(0, 5).forEach((x, i) => { d.rows[i].who = x.who || ''; d.rows[i].role = x.role || ''; }); save('loa', d); render(); toast('تم ✅'); } } catch (e) { b.disabled = false; b.textContent = '🤖 توليد توزيع مقترح'; toast('تعذّر التوليد.'); } };
    };
    render();
  }

  /* ═══════════════ ④ باني IACM (ربطة العنق) ═══════════════ */
  function iacmBuilder(host) {
    let d = load('iacm') || { event: '', causes: ['', '', ''], consequences: ['', '', ''], proactive: ['', ''], detective: ['', ''], responsive: ['', ''] };
    const li = a => a.filter(x => x && x.trim());
    const getDoc = () => ({ title: 'نموذج IACM — ' + groupName(), subtitle: d.event || 'ربطة العنق: من المسبب إلى العاقبة', meta: [{ k: 'الحدث', v: d.event || '—' }, { k: 'المجموعة', v: groupName() }],
      blocks: [
        { heading: 'الحدث والمسببات والعواقب', kind: 'kv', pairs: [{ k: 'الحدث', v: d.event }, { k: 'المسببات', v: li(d.causes).join(' · ') }, { k: 'العواقب', v: li(d.consequences).join(' · ') }] },
        { heading: 'الضوابط حسب النوع', kind: 'table', cols: ['النوع', 'الموضع', 'الضوابط'], rows: [['استباقية Proactive', 'قبل الحدث — تمنع المسبب', li(d.proactive).join(' · ')], ['كشفية Detective', 'عند/حول الحدث — ترصد', li(d.detective).join(' · ')], ['استجابية Responsive', 'بعد الحدث — تعالج العاقبة', li(d.responsive).join(' · ')]] }]
    });
    const render = () => {
      const col = (label, key, n, cls) => `<div class="iacm-col ${cls}"><h4>${label}</h4>${Array.from({ length: n }).map((_, i) => `<input data-arr="${key}" data-i="${i}" placeholder="${label} ${i + 1}" value="${esc((d[key] || [])[i] || '')}">`).join('')}</div>`;
      host.innerHTML = `<div class="bld-head"><h3>🎀 باني نموذج IACM (ربطة العنق)</h3><p>اكتب الحدث في المنتصف، ثم المسببات (يسار) والعواقب (يمين)، والضوابط الاستباقية والكشفية والاستجابية. ${ai() ? 'يمكن التوليد بالذكاء الاصطناعي.' : ''}</p></div>
        <label class="bld-topic">الحدث (المخاطرة المحورية)<input data-ev placeholder="مثال: تسرّب بيانات عملاء عبر مورّد" value="${esc(d.event)}"></label>
        ${ai() ? '<button class="bld-b gold" id="aiFill" style="margin:8px 0">🤖 توليد ربطة العنق</button>' : ''}
        <div class="iacm">${col('المسببات', 'causes', 3, 'cause')}${col('ضوابط استباقية', 'proactive', 2, 'proa')}
          <div class="iacm-ev"><span>⚠️</span><b>${esc(d.event) || 'الحدث'}</b></div>
          ${col('ضوابط كشفية', 'detective', 2, 'det')}${col('العواقب', 'consequences', 3, 'cons')}${col('ضوابط استجابية', 'responsive', 2, 'resp')}</div>
        <div class="bld-tip">💡 الاستباقية تمنع قبل الحدث · الكشفية ترصد عنده · الاستجابية تعالج بعده — هذا جوهر IACM ونقطة اختبار متكررة.</div>
        ${exportBar(getDoc, 'TrackFord_IACM_' + groupName())}`;
      bind();
    };
    const bind = () => {
      host.querySelector('[data-ev]').oninput = e => { d.event = e.target.value; save('iacm', d); host.querySelector('.iacm-ev b').textContent = e.target.value || 'الحدث'; };
      host.querySelectorAll('[data-arr]').forEach(el => el.oninput = () => { d[el.dataset.arr][+el.dataset.i] = el.value; save('iacm', d); });
      const b = host.querySelector('#aiFill'); if (b) b.onclick = async () => { b.disabled = true; b.textContent = '⏳…'; try { const r = await window.TFAI.json(`ابنِ نموذج IACM (ربطة عنق) للحدث «${d.event || 'حادثة تشغيلية'}» في منظمة «${(org().name) || 'جهة'}». أعد JSON: {"event":"","causes":["",""],"consequences":["",""],"proactive":["",""],"detective":["",""],"responsive":["",""]}`, SYS, { max_tokens: 1300 }); d = Object.assign(d, r); ['causes', 'consequences', 'proactive', 'detective', 'responsive'].forEach(k => { d[k] = (d[k] || []).concat(['', '', '']).slice(0, k === 'causes' || k === 'consequences' ? 3 : 2); }); save('iacm', d); render(); toast('تم ✅'); } catch (e) { b.disabled = false; b.textContent = '🤖 توليد ربطة العنق'; toast('تعذّر التوليد.'); } };
    };
    render();
  }

  /* ───────── القائمة والتركيب ───────── */
  const TOOLS = [
    ['objective', '🎯 مصمّم الأهداف والمؤشرات', 'من هدف SMART إلى KPI وKRI وKCI ونطاقاتها', objectiveBuilder],
    ['total', '📊 نموذج الأداء الشامل', 'تقييم الأبعاد الأربعة ورسم المخطط', tpBuilder],
    ['loa', '⚖️ خطوط المساءلة', 'توزيع المسؤوليات عبر الخطوط الخمسة', loaBuilder],
    ['iacm', '🎀 نموذج IACM', 'ربطة العنق: المسبب والحدث والعاقبة والضوابط', iacmBuilder]];
  function mount(host, which) {
    if (!host) return;
    if (which && TOOLS.find(t => t[0] === which)) {
      host.innerHTML = `<div class="bld-wrap"><button class="bld-back" id="bldBack">→ كل المصمّمات</button><div id="bldBody"></div></div>`;
      host.querySelector('#bldBack').onclick = () => mount(host);
      TOOLS.find(t => t[0] === which)[3](host.querySelector('#bldBody'));
      return;
    }
    host.innerHTML = `<div class="bld-wrap"><section class="bld-hero"><div class="bld-eyebrow">🧰 ${ai() ? 'مدعوم بمحرك داخلي + Claude' : 'محرك داخلي — يعمل بلا إنترنت'}</div>
      <h2>مصمّمات ونماذج GRC التطبيقية</h2><p>ابنِ مخرجاتك الحقيقية خطوة بخطوة: الأهداف والمؤشرات، الأداء الشامل، خطوط المساءلة، ونموذج IACM. صدّرها PowerPoint أو PDF وأرسلها واتساب أو بريدًا لكل مجموعة ونشاط.</p>
      <div class="bld-group"><label>👥 اسم المجموعة</label><input id="bldGrp" value="${esc(groupName())}" placeholder="اكتب اسم مجموعتكم"><button class="bld-gb" id="bldGrpSave">حفظ الاسم</button></div></section>
      <div class="bld-menu">${TOOLS.map(t => `<button class="bld-tool" data-t="${t[0]}"><span class="ic">${t[1].split(' ')[0]}</span><b>${t[1].replace(/^\S+\s/, '')}</b><small>${t[2]}</small>${load(t[0]) ? '<span class="done">✓ لديكم مسودة محفوظة</span>' : ''}</button>`).join('')}</div></div>`;
    const gi = host.querySelector('#bldGrp'); host.querySelector('#bldGrpSave').onclick = () => { setGroupName(gi.value); toast('تم حفظ اسم المجموعة: ' + groupName()); };
    host.querySelectorAll('.bld-tool').forEach(b => b.onclick = () => mount(host, b.dataset.t));
  }
  const css = document.createElement('style'); css.textContent = `
  .bld-wrap{padding-block:10px;font-family:Rubik,Tahoma,system-ui,sans-serif}
  .bld-hero{background:linear-gradient(135deg,#0A1B3D,#13295A);color:#fff;border-radius:18px;padding:24px 26px;margin-bottom:14px}.bld-hero h2{margin:6px 0;font-size:24px}.bld-hero p{color:#D9C9A4;margin:0}.bld-eyebrow{font-size:12px;color:#E2B85A;font-weight:700}
  .bld-group{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:14px;background:rgba(255,255,255,.08);border:1px solid rgba(226,184,90,.4);border-radius:12px;padding:10px 12px}.bld-group label{color:#E2B85A;font-weight:700;font-size:13px}.bld-group input{flex:1;min-width:160px;font:inherit;padding:8px 10px;border:1px solid rgba(255,255,255,.3);border-radius:10px;background:rgba(255,255,255,.95);color:#0A1B3D}.bld-gb{border:0;background:linear-gradient(180deg,#F2D584,#D4A84C);color:#0A1B3D;border-radius:10px;padding:8px 16px;font:inherit;font-weight:700;cursor:pointer}
  .bld-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.bld-tool{text-align:start;border:1px solid #E7DCC6;background:#fff;border-radius:16px;padding:16px;cursor:pointer;display:grid;gap:4px;border-top:4px solid #C9973B}.bld-tool:hover{box-shadow:0 10px 24px -14px rgba(10,27,61,.5)}.bld-tool .ic{font-size:26px}.bld-tool b{color:#0A1B3D;font-size:16px}.bld-tool small{color:#5B6476}.bld-tool .done{color:#047857;font-size:12px;font-weight:700}
  .bld-back{border:1px solid #E7DCC6;background:#fff;border-radius:999px;padding:7px 16px;font:inherit;font-weight:700;cursor:pointer;margin-bottom:12px;color:#0A1B3D}
  .bld-head h3{margin:0 0 4px;color:#0A1B3D;font-size:20px}.bld-head p{color:#5B6476;margin:0 0 10px}
  .bld-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:760px){.bld-grid{grid-template-columns:1fr}}
  .bld-card{border:1px solid #E7DCC6;border-radius:14px;padding:14px;background:#fff}.bld-card h4{margin:0 0 10px;color:#0A1B3D}.bld-card.kpi{border-top:4px solid #047857}.bld-card.kri{border-top:4px solid #B91C1C}.bld-card.kci{border-top:4px solid #C9973B}
  .bld-card label,.bld-topic{display:grid;gap:4px;font-size:13px;font-weight:600;color:#1B2436;margin-bottom:8px}.bld-card input,.bld-card textarea,.bld-topic input{font:inherit;padding:8px 10px;border:1px solid #E7DCC6;border-radius:10px;background:#FBF8F2}
  .bld-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bld-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
  .bld-tip{background:#F6EEDC;border-radius:12px;padding:10px 14px;margin:12px 0;font-size:13px;color:#1B2436}.bld-note{color:#5B6476;font-size:13px}.bld-ai{margin-bottom:10px}
  .bld-exp{display:flex;gap:8px;flex-wrap:wrap;align-items:center;border-top:1px dashed #E7DCC6;padding-top:12px;margin-top:6px}.bld-exp b{font-size:13px;color:#0A1B3D}
  .bld-b{border:1px solid #C9973B;background:#0A1B3D;color:#fff;border-radius:999px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer;font-size:13px}.bld-b.gold{background:linear-gradient(180deg,#F2D584,#D4A84C);color:#0A1B3D}.bld-b.ghost{background:#fff;color:#1B2436;border-color:#E7DCC6}.bld-b.wa{background:#25D366;border-color:#1da851}
  .bld-split{display:grid;grid-template-columns:1fr 380px;gap:14px}@media(max-width:820px){.bld-split{grid-template-columns:1fr}}
  .tp-row{border:1px solid #E7DCC6;border-radius:12px;padding:10px;margin-bottom:8px}.tp-q{margin-bottom:6px}.tp-q .en{color:#5B6476;font-size:12px}.tp-scale{display:flex;gap:6px;margin-bottom:6px}.tp-b{width:40px;height:34px;border:1px solid #E7DCC6;background:#fff;border-radius:8px;font:inherit;font-weight:700;cursor:pointer}.tp-b.on{background:#0A1B3D;color:#fff;border-color:#C9973B}.tp-note{width:100%;font:inherit;padding:6px 8px;border:1px solid #E7DCC6;border-radius:8px;margin-top:4px;background:#FBF8F2}
  .bld-chart{border:1px solid #E7DCC6;border-radius:14px;padding:14px;text-align:center;background:#fff}.tp-score b{font-size:40px;color:#C9973B;font-family:Montserrat,Arial}.tp-score span{display:block;color:#5B6476;font-size:12px}
  .loa-row{display:grid;grid-template-columns:230px 1fr 1.4fr;gap:8px;align-items:center;border:1px solid #E7DCC6;border-radius:12px;padding:10px;margin-bottom:8px;border-inline-start:5px solid hsl(calc(210 - var(--i)*30) 50% 45%)}@media(max-width:760px){.loa-row{grid-template-columns:1fr}}.loa-line b{color:#0A1B3D}.loa-line small{color:#5B6476;display:block;font-size:11.5px}.loa-row input{font:inherit;padding:8px;border:1px solid #E7DCC6;border-radius:8px;background:#FBF8F2}
  .iacm{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:start}@media(max-width:900px){.iacm{grid-template-columns:1fr 1fr}}.iacm-col h4{margin:0 0 6px;font-size:13px;color:#0A1B3D}.iacm-col input{width:100%;font:inherit;padding:7px;border:1px solid #E7DCC6;border-radius:8px;margin-bottom:6px;background:#FBF8F2;font-size:12.5px}.iacm-col.cause input,.iacm-col.cons input{background:#FDECEA}.iacm-col.proa input,.iacm-col.det input,.iacm-col.resp input{background:#EAF3EC}
  .iacm-ev{grid-row:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0A1B3D;color:#fff;border-radius:14px;padding:16px 8px;min-height:90px}.iacm-ev span{font-size:26px}.iacm-ev b{font-size:13px;text-align:center;margin-top:6px}`;
  document.head.appendChild(css);
  window.TFBuild = { mount, TOOLS, toPPT, toPDF, docText };
})();
