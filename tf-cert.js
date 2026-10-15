/* Track Ford GRC — الشهادات والإفادات المعتمدة (Certificates & attestations)
   - المتدرب يكتب اسمه كما يريده في الشهادة (إنجليزي) والإفادة (عربي) ← موافقة المدرب ← تنزيل PDF.
   - كل وثيقة برقم تسلسلي + رمز تحقق + رمز QR داخل إطار بهوية تراكفورد يُتحقق منه على خادم تراكفورد مباشرة.
   تصميم وبرمجة وإعداد: د. محمد عطية */
(function () {
  'use strict';
  if (window.TFCert) return;
  const API = () => (window.TF_API_BASE || '').replace(/\/$/, '');
  const BASE = (() => { const s = document.currentScript && document.currentScript.src; return s ? s.replace(/tf-cert\.js.*$/, '') : ''; })();
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '') || 'index';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EN = () => { try { if (window.TFC && window.TFC.EN) return window.TFC.EN(); return (localStorage.getItem('grcpLang') || '').replace(/"/g, '') === 'en'; } catch (e) { return false; } };
  const L = (ar, en) => EN() ? en : ar;
  const user = () => { try { return JSON.parse(localStorage.getItem('tf_user') || 'null'); } catch (e) { return null; } };
  const NV = '#0A1B3D', NV2 = '#13295A', INK = '#06122B', GD = '#C9973B', CR = '#FBF8F2';
  const DEF = { program: 'Governance, Risk and Compliance Professional', programAr: 'أخصائي الحوكمة والمخاطر والامتثال', kind: 'Preparation Course', kindAr: 'دورة تحضيرية', approvalNo: '138229', hours: '30', dates: '11–15 October 2026', datesAr: '11–15 أكتوبر 2026', signName: 'Dr. Mohamed Elhefny', signTitle: 'Founder & CEO', signNameAr: 'د. محمد الحفني', signTitleAr: 'المؤسس والرئيس التنفيذي', trainer: 'Dr. Mohamed Attia', trainerAr: 'د. محمد عطية', prefix: 'TF-2026' };

  /* ───────── تحميل المكتبات والخطوط والصور عند الحاجة ───────── */
  const loaded = {};
  function script(local, cdn) {
    if (loaded[local]) return loaded[local];
    return loaded[local] = new Promise((ok, no) => {
      const add = (src, fb) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fb ? add(fb) : no(new Error('load ' + src)); document.head.appendChild(s); };
      add(BASE + local, cdn);
    });
  }
  async function libs() {
    const fl = document.getElementById('tfcFonts');
    if (!fl) { const l = document.createElement('link'); l.id = 'tfcFonts'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Tinos:wght@400;700&family=UnifrakturMaguntia&display=swap'; document.head.appendChild(l); }
    await Promise.all([
      window.TFCA ? 0 : script('vendor/tf-cert-assets.js'),
      window.qrcode ? 0 : script('vendor/qrcode.js', 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js')]);
    try { await Promise.all(['96px "UnifrakturMaguntia"', 'bold 40px Tinos', '20px Tinos', 'bold 30px Rubik', '18px Rubik'].map(f => document.fonts.load(f, 'Aaأب'))); } catch (e) {}
    if (!IMG.logo) await Promise.all(['logo', 'seal', 'sig'].map(k => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.onerror = r; i.src = window.TFCA[k]; })));
  }
  const IMG = {};

  /* ───────── أدوات الرسم ───────── */
  const goldG = (c, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#8C6A2B'); g.addColorStop(.3, '#F2D584'); g.addColorStop(.55, '#B8862F'); g.addColorStop(.8, '#EBCB7C'); g.addColorStop(1, '#9A7432'); return g; };
  const navyG = (c, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, INK); g.addColorStop(1, NV2); return g; };
  function txt(c, s, x, y, font, color, align, ls) { c.font = font; c.fillStyle = color || NV; c.textAlign = align || 'center'; c.direction = /[؀-ۿ]/.test(s) && !/^[A-Za-z]/.test(s) ? 'rtl' : 'ltr'; try { c.letterSpacing = (ls || 0) + 'px'; } catch (e) {} c.fillText(s, x, y); try { c.letterSpacing = '0px'; } catch (e) {} }
  function fit(c, s, font, size, maxW) { let z = size; c.font = font.replace('#', z); while (c.measureText(s).width > maxW && z > 10) { z -= 1; c.font = font.replace('#', z); } return font.replace('#', z); }
  function wrap(c, s, maxW) { const w = s.split(/\s+/), out = []; let line = ''; w.forEach(x => { const t = line ? line + ' ' + x : x; if (c.measureText(t).width > maxW && line) { out.push(line); line = x; } else line = t; }); if (line) out.push(line); return out; }
  function swoosh(c, W) {
    c.beginPath(); c.moveTo(0, 0); c.lineTo(W * .47, 0); c.bezierCurveTo(W * .3, W * .03, W * .12, W * .13, 0, W * .3); c.closePath(); c.fillStyle = navyG(c, 0, 0, W * .4, W * .25); c.fill();
    c.beginPath(); c.moveTo(W * .53, 0); c.bezierCurveTo(W * .33, W * .035, W * .13, W * .15, 0, W * .335); c.lineTo(0, W * .308); c.bezierCurveTo(W * .125, W * .135, W * .315, W * .028, W * .485, 0); c.closePath(); c.fillStyle = goldG(c, 0, W * .3, W * .5, 0); c.fill();
    c.beginPath(); c.moveTo(W * .41, 0); c.bezierCurveTo(W * .26, W * .03, W * .1, W * .11, 0, W * .235); c.lineWidth = W * .0022; c.strokeStyle = goldG(c, 0, W * .2, W * .4, 0); c.stroke();
  }
  function qrDraw(c, url, x, y, s) {
    const q = window.qrcode(0, 'H'); q.addData(url); q.make(); const n = q.getModuleCount(), m = s / (n + 2);
    c.fillStyle = '#fff'; c.fillRect(x, y, s, s); c.fillStyle = INK;
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(x + (k + 1) * m, y + (r + 1) * m, m + .3, m + .3);
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  /* إطار التحقق بهوية تراكفورد: كحلي + إطار ذهبي مزدوج + QR + رقم الشهادة */
  function qrFrame(c, d, x, y, w) {
    const q = w - 22, band = 40, h = q + 22 + band;
    c.save(); c.shadowColor = 'rgba(6,18,43,.28)'; c.shadowBlur = 10; c.shadowOffsetY = 3; rr(c, x, y, w, h, 10); c.fillStyle = navyG(c, x, y, x + w, y + h); c.fill(); c.restore();
    rr(c, x + 3, y + 3, w - 6, h - 6, 8); c.lineWidth = 1.6; c.strokeStyle = goldG(c, x, y, x + w, y + h); c.stroke();
    rr(c, x + 7, y + 7, w - 14, h - 14, 6); c.lineWidth = .7; c.stroke();
    rr(c, x + 10, y + 10, q + 2, q + 2, 4); c.fillStyle = '#fff'; c.fill();
    qrDraw(c, vurl(d), x + 11, y + 11, q);
    if (IMG.logo) { const m = q * .22, cx = x + 11 + q / 2, cy = y + 11 + q / 2; c.fillStyle = '#fff'; rr(c, cx - m / 2 - 2, cy - m / 2 - 2, m + 4, m + 4, 3); c.fill(); c.drawImage(IMG.logo, 0, 0, IMG.logo.width, IMG.logo.height * .72, cx - m / 2, cy - m / 2 + m * .06, m, m * .86); }
    c.fillStyle = goldG(c, x, 0, x + w, 0); c.fillRect(x + 16, y + q + 30.5, w - 32, .8);
    txt(c, d.no, x + w / 2, y + q + 26, fit(c, d.no, 'bold #px Tinos', 10.5, w - 22), '#F2D584', 'center');
    txt(c, 'SCAN TO VERIFY', x + w / 2, y + q + 43, 'bold 8px Tinos', '#FFFFFF', 'center', 2);
    return h;
  }
  const vurl = d => API() + '/verify?c=' + encodeURIComponent(d.no || '') + '&v=' + encodeURIComponent(d.verify || '');
  const fmtD = (t, ar) => { const x = t ? new Date(t) : new Date(); return x.toLocaleDateString(ar ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };

  /* ───────── الشهادة (إنجليزي — A4 أفقي) ───────── */
  function drawCert(cv, d, K) {
    const W = 1123, H = 794, c = cv.getContext('2d'); cv.width = W * K; cv.height = H * K; c.setTransform(K, 0, 0, K, 0, 0);
    const g = c.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 700); g.addColorStop(0, '#FFFEFA'); g.addColorStop(1, '#F7F2E6'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); swoosh(c, W); c.restore(); c.save(); c.translate(W, H); c.rotate(Math.PI); swoosh(c, W); c.restore();
    c.lineCap = 'butt'; c.lineWidth = 8; c.strokeStyle = goldG(c, 575, 0, 1090, 140); c.beginPath(); c.moveTo(575, 46); c.lineTo(1086, 46); c.lineTo(1086, 130); c.stroke();
    c.strokeStyle = goldG(c, 30, 600, 460, 780); c.beginPath(); c.moveTo(36, 598); c.lineTo(36, 768); c.lineTo(452, 768); c.stroke();
    if (IMG.logo) c.drawImage(IMG.logo, W / 2 - 88, 52, 176, 147);
    txt(c, 'Certificate', W / 2, 292, '92px "UnifrakturMaguntia"', NV);
    c.fillStyle = goldG(c, 300, 0, 830, 0); c.fillRect(300, 323, 78, 2.4); c.fillRect(745, 323, 78, 2.4);
    txt(c, 'OF COMPLETION', W / 2, 333, '600 25px Tinos', INK, 'center', 7);
    txt(c, 'This certificate is awarded to', W / 2, 370, '21px Tinos', '#1B2436');
    const nm = d.nameEn || '[Participant Name]'; txt(c, nm, W / 2, 422, fit(c, nm, 'bold #px Tinos', 46, 780), INK);
    c.fillStyle = goldG(c, 150, 0, 970, 0); c.fillRect(152, 440, 818, 2);
    txt(c, 'for successfully completing the training program', W / 2, 474, '21px Tinos', '#1B2436');
    const pr = d.cfg.program; txt(c, pr, W / 2, 514, fit(c, pr, 'bold #px Tinos', 33, 840), INK);
    const kd = d.cfg.kind.toUpperCase(); txt(c, kd, W / 2, 545, 'bold 19px Tinos', '#A27A2E', 'center', 6); c.font = 'bold 19px Tinos'; try { c.letterSpacing = '6px'; } catch (e) {} const kw = c.measureText(kd).width / 2 + 22; try { c.letterSpacing = '0px'; } catch (e) {}
    c.fillStyle = GD; [W / 2 - kw, W / 2 + kw].forEach(x => { c.save(); c.translate(x, 538); c.rotate(Math.PI / 4); c.fillRect(-4, -4, 8, 8); c.restore(); });
    txt(c, 'TVTC Course Approval No.: ' + d.cfg.approvalNo, W / 2, 574, '18px Tinos', '#1B2436');
    txt(c, d.cfg.hours + ' Training Hours   |   ' + d.cfg.dates, W / 2, 598, '18px Tinos', '#1B2436');
    // signature
    if (IMG.sig) c.drawImage(IMG.sig, 205, 638, 190, 67);
    c.fillStyle = NV; c.fillRect(165, 710, 275, 1.6);
    txt(c, d.cfg.signName, 302, 731, 'bold 18px Tinos', INK); txt(c, d.cfg.signTitle, 302, 750, '16px Tinos', '#1B2436');
    // stamp
    c.fillRect(560, 710, 170, 1.6);
    if (IMG.seal) { c.save(); c.shadowColor = 'rgba(80,55,10,.35)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.drawImage(IMG.seal, 597, 609, 96, 96); c.restore(); }
    txt(c, 'Company Stamp', 645, 731, '16px Tinos', '#1B2436');
    // verification: QR (top-right) + barcode (bottom centre)
    if (d.no && d.verify) {
      const fh = qrFrame(c, d, 952, 62, 120); txt(c, 'Code ' + d.verify, 1012, 62 + fh + 15, '10.5px Tinos', '#5B6476'); txt(c, 'Issued ' + fmtD(d.issuedAt), 1012, 62 + fh + 29, '10px Tinos', '#8E97A8');
    } else {
      txt(c, 'Certificate No. & QR are issued after trainer approval', 1014, 120, '10px Tinos', '#8E97A8');
      c.save(); c.translate(W / 2, H / 2 + 40); c.rotate(-0.32); txt(c, 'PREVIEW · NOT ISSUED', 0, 0, 'bold 72px Tinos', 'rgba(180,35,24,.10)', 'center', 6); c.restore();
    }
    return cv;
  }

  /* ───────── الإفادة الرسمية (ثنائية اللغة — A4 عمودي) ───────── */
  function drawAttest(cv, d, K) {
    const W = 794, H = 1123, c = cv.getContext('2d'); cv.width = W * K; cv.height = H * K; c.setTransform(K, 0, 0, K, 0, 0);
    const cf = d.cfg, ok = !!(d.no && d.verify);
    c.fillStyle = '#FFFEFA'; c.fillRect(0, 0, W, H);
    c.save(); c.scale(.62, .62); swoosh(c, W); c.restore(); c.save(); c.translate(W, H); c.rotate(Math.PI); c.scale(.62, .62); swoosh(c, W); c.restore();
    c.strokeStyle = goldG(c, 0, 0, W, H); c.lineWidth = 3; c.strokeRect(22, 22, W - 44, H - 44); c.lineWidth = 1; c.strokeRect(30, 30, W - 60, H - 60);
    if (IMG.logo) c.drawImage(IMG.logo, W / 2 - 54, 42, 108, 90);
    txt(c, 'شركة تراكفورد للاستشارات  ·  TRACK FORD BUSINESS CONSULTING', W / 2, 152, '500 11.5px Rubik', '#8C6A2B', 'center', 1);
    txt(c, 'إفادة رسمية', W / 2, 196, 'bold 34px Rubik', NV);
    txt(c, 'OFFICIAL ATTESTATION', W / 2, 222, 'bold 15px Tinos', '#A27A2E', 'center', 6);
    c.fillStyle = goldG(c, 200, 0, 600, 0); c.fillRect(220, 234, 354, 1.6);
    const ref = ok ? d.no : '—';
    txt(c, 'رقم المرجع: ' + ref, W - 70, 264, '13.5px Rubik', '#1B2436', 'right'); txt(c, 'التاريخ: ' + fmtD(d.issuedAt, true), W - 70, 284, '13.5px Rubik', '#1B2436', 'right');
    txt(c, 'Ref. No.: ' + ref, 70, 264, '13.5px Tinos', '#1B2436', 'left'); txt(c, 'Date: ' + fmtD(d.issuedAt), 70, 284, '13.5px Tinos', '#1B2436', 'left');
    // Arabic body
    let y = 322; txt(c, 'إلى من يهمه الأمر،', W - 70, y, 'bold 17px Rubik', NV, 'right');
    const ar = `تشهد شركة تراكفورد للاستشارات بأن المتدرب/ة «${d.nameAr || '—'}» قد أتمّ/ت بنجاح برنامج «${cf.programAr}» — ${cf.kindAr}، المعتمدة من المؤسسة العامة للتدريب التقني والمهني برقم (${cf.approvalNo})، بواقع (${cf.hours}) ساعة تدريبية خلال الفترة ${cf.datesAr}، وأنجز/ت التطبيقات العملية على منصة تراكفورد للحوكمة والمخاطر والامتثال وفق المعايير الدولية وأفضل الممارسات المعتمدة في هذا المجال، وذلك بعد مراجعة المدرب واعتماده.`;
    c.font = '15px Rubik'; c.direction = 'rtl'; wrap(c, ar, W - 140).forEach(l => { y += 27; txt(c, l, W - 70, y, '15px Rubik', '#1B2436', 'right'); });
    y += 38; txt(c, 'To Whom It May Concern,', 70, y, 'bold 16px Tinos', NV, 'left');
    const en = `This is to certify that ${d.nameEn || '—'} has successfully completed the ${cf.program} ${cf.kind}, approved by the Technical and Vocational Training Corporation (TVTC) under No. ${cf.approvalNo}, comprising ${cf.hours} training hours during ${cf.dates}, including the practical applications on the Track Ford Governance, Risk and Compliance platform in line with international standards and recognized best practices in governance, risk and compliance, as reviewed and approved by the course trainer.`;
    c.font = '15px Tinos'; c.direction = 'ltr'; wrap(c, en, W - 140).forEach(l => { y += 22; txt(c, l, 70, y, '15px Tinos', '#1B2436', 'left'); });
    // results table
    y += 24; const p = d.progress || {}, hrs = p.timeSec ? (p.timeSec / 3600).toFixed(1) : '—';
    const rows = [['نسبة إنجاز مسار الدورة', 'Course track completion', (p.overall || 0) + '%'], ['أفضل نتيجة في الاختبار التجريبي', 'Best mock exam score', p.examBest ? p.examBest + '%' : '—'], ['الساعات التدريبية المعتمدة', 'Accredited training hours', cf.hours], ['ساعات النشاط على المنصة', 'Active hours on the platform', hrs], ['الفترة', 'Period', cf.dates], ['المدرب', 'Trainer', cf.trainer + ' · ' + cf.trainerAr]];
    const rh = 28, tx = 60, tw = W - 120;
    rows.forEach((r, i) => { const yy = y + i * rh; c.fillStyle = i % 2 ? '#FFFFFF' : '#F6EEDC'; c.fillRect(tx, yy, tw, rh); c.strokeStyle = '#E7DCC6'; c.lineWidth = 1; c.strokeRect(tx, yy, tw, rh);
      txt(c, r[0], tx + tw - 12, yy + 19, '500 13px Rubik', NV, 'right'); txt(c, r[1], tx + 12, yy + 19, '13px Tinos', '#5B6476', 'left'); txt(c, String(r[2]), tx + tw / 2, yy + 19, 'bold 13px Tinos', INK, 'center'); });
    y += rows.length * rh + 26;
    txt(c, 'أُعطيت هذه الإفادة بناءً على طلبه/ا دون أدنى مسؤولية على الشركة.', W / 2, y, '13px Rubik', '#5B6476'); y += 18;
    txt(c, 'This attestation is issued upon the holder\'s request without any liability on the company.', W / 2, y, 'italic 13px Tinos', '#5B6476');
    // signatures & verification
    const sy = Math.max(y + 34, H - 250);
    if (IMG.sig) c.drawImage(IMG.sig, W - 270, sy, 180, 63);
    c.fillStyle = NV; c.fillRect(W - 290, sy + 70, 220, 1.4);
    txt(c, cf.signNameAr + '  ·  ' + cf.signName, W - 180, sy + 92, 'bold 13.5px Rubik', INK); txt(c, cf.signTitleAr + '  ·  ' + cf.signTitle, W - 180, sy + 111, '12.5px Rubik', '#5B6476');
    if (IMG.seal) { c.save(); c.shadowColor = 'rgba(80,55,10,.35)'; c.shadowBlur = 8; c.shadowOffsetY = 2; c.drawImage(IMG.seal, W / 2 - 62, sy - 10, 124, 124); c.restore(); }
    txt(c, 'الختم الرسمي · Company Stamp', W / 2, sy + 132, '12px Rubik', '#5B6476');
    if (ok) { const fh = qrFrame(c, d, 66, sy - 18, 126); txt(c, 'امسح للتحقق · رمز ' + d.verify, 129, sy - 18 + fh + 15, '10.5px Rubik', '#5B6476'); }
    else { c.save(); c.translate(W / 2, H / 2); c.rotate(-0.5); txt(c, 'PREVIEW · مسودة', 0, 0, 'bold 70px Tinos', 'rgba(180,35,24,.10)'); c.restore(); }
    txt(c, ok ? ('Verification: ' + API().replace(/^https?:\/\//, '') + '/verify?c=' + d.no + '  ·  Code ' + d.verify) : 'تصدر الإفادة برقم ورمز تحقق بعد موافقة المدرب', W / 2, H - 50, '10.5px Tinos', '#8E97A8');
    return cv;
  }

  /* ───────── PDF ───────── */
  async function pdf(kind, d) {
    await libs(); await script('vendor/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const land = kind === 'cert', cv = document.createElement('canvas'); (land ? drawCert : drawAttest)(cv, d, 2.6);
    const doc = new window.jspdf.jsPDF({ orientation: land ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    const w = land ? 297 : 210, h = land ? 210 : 297;
    doc.addImage(cv.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, w, h, undefined, 'FAST');
    if (d.no && d.verify) doc.link(land ? 253 : 18, land ? 17 : 236, 30, 40, { url: vurl(d) });
    doc.setProperties({ title: (land ? 'Certificate' : 'Attestation') + ' — ' + (d.nameEn || ''), subject: d.cfg.program + ' ' + d.cfg.kind, author: 'Track Ford Business Consulting', keywords: (d.no || '') + ' ' + (d.verify || ''), creator: 'Track Ford · Dr. Mohamed Attia' });
    const safe = (d.nameEn || 'Participant').replace(/[^A-Za-z0-9]+/g, '_');
    doc.save((land ? 'TrackFord_Certificate_' : 'TrackFord_Attestation_') + safe + (d.no ? '_' + d.no : '') + '.pdf');
  }
  async function preview(kind, d, w) { await libs(); const cv = document.createElement('canvas'); (kind === 'cert' ? drawCert : drawAttest)(cv, d, 1.4); cv.style.width = (w || 100) + '%'; cv.style.height = 'auto'; cv.style.display = 'block'; return cv; }

  /* ───────── واجهة المتدرب ───────── */
  const CSS = `.tfcz-fab{position:fixed;bottom:18px;inset-inline-end:18px;z-index:2147482000;background:linear-gradient(180deg,#F2D584,#D4A84C);color:${INK};border:2px solid ${NV};border-radius:999px;padding:11px 18px;font:700 14.5px Rubik,Tahoma,sans-serif;cursor:pointer;box-shadow:0 10px 26px rgba(6,18,43,.35);display:flex;gap:8px;align-items:center}
  .tfcz-fab i{font-style:normal;background:#B42318;color:#fff;border-radius:99px;font-size:11px;padding:0 7px}.tfcz-fab.ok i{background:#15803D}
  #tfcz{position:fixed;inset:0;background:rgba(6,18,43,.74);z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:14px;font-family:Rubik,Tahoma,sans-serif}
  #tfcz .bx{background:${CR};border-radius:20px;max-width:880px;width:100%;max-height:94vh;overflow:auto;box-shadow:0 30px 90px rgba(0,0,0,.5);border:2px solid ${GD}}
  #tfcz .hd{background:linear-gradient(135deg,${INK},${NV2});color:#fff;padding:18px 22px;display:flex;gap:12px;align-items:center;border-bottom:3px solid ${GD}}#tfcz .hd b{color:#E2B85A;font-size:11px;letter-spacing:.16em}#tfcz .hd h2{margin:2px 0 0;font-size:21px}
  #tfcz .hd .x{margin-inline-start:auto;background:none;border:0;color:#fff;font-size:22px;cursor:pointer}#tfcz .bd{padding:18px 22px;color:#1B2436}
  #tfcz .st{display:flex;gap:10px;align-items:center;border-radius:14px;padding:12px 14px;margin-bottom:14px;font-weight:600}#tfcz .st.pending{background:#FFF4DB;color:#8a5a00}#tfcz .st.approved{background:#E6F4EA;color:#15803D}#tfcz .st.rejected,#tfcz .st.revoked{background:#FDECEA;color:#B42318}#tfcz .st.none{background:#E8EEFB;color:#1F5FBF}
  #tfcz .fm{display:grid;grid-template-columns:1fr 1fr;gap:12px}#tfcz label{display:grid;gap:5px;font-size:13px;font-weight:600}#tfcz label small{font-weight:400;color:#5B6476}#tfcz input{font:inherit;padding:10px 12px;border:1px solid #E7DCC6;border-radius:10px;background:#fff}
  #tfcz .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center}#tfcz .btn{border:1.5px solid ${GD};background:${NV};color:#fff;border-radius:999px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer}#tfcz .btn.g{background:linear-gradient(180deg,#F2D584,#D4A84C);color:${INK}}#tfcz .btn.o{background:transparent;color:${NV}}#tfcz .btn:disabled{opacity:.5}
  #tfcz .pv{display:grid;grid-template-columns:1.42fr 1fr;gap:12px;margin-top:14px;align-items:start}#tfcz .pv>div{border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.18);background:#fff}#tfcz .msg{color:#B42318;font-size:13px;min-height:18px;margin-top:6px}
  #tfcz .cele{text-align:center;padding:6px 0 4px}#tfcz .cele h3{margin:4px 0;color:${NV};font-size:22px}#tfcz .cele p{margin:0;color:#5B6476}
  @media(max-width:720px){#tfcz .fm,#tfcz .pv{grid-template-columns:1fr}.tfcz-fab{bottom:12px;inset-inline-end:12px;padding:9px 14px}}`;
  let STATE = { cert: null, config: null, progress: null, user: null }, pollT = null;
  async function api(path, opt) { const r = await fetch(API() + path, Object.assign({ headers: { 'content-type': 'text/plain' } }, opt || {})); const j = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, j }; }
  async function refresh() {
    const u = user(); if (!u || !u.token || u.local || !API()) return null;
    try { const r = await api('/api/cert?id=' + encodeURIComponent(u.id) + '&token=' + encodeURIComponent(u.token)); if (r.ok) { STATE = Object.assign(STATE, r.j); fab(); return r.j; } } catch (e) {}
    return null;
  }
  const docData = () => { const c = STATE.cert || {}, cfg = Object.assign({}, DEF, STATE.config || {}); return { nameEn: c.nameEn, nameAr: c.nameAr, no: c.status === 'approved' ? c.no : '', verify: c.status === 'approved' ? c.verify : '', issuedAt: c.issuedAt, cfg, progress: c.progress || STATE.progress || {} }; };
  function fab() {
    if (page === 'trainer' || page === 'certificates' || page === 'studio') return;
    let b = document.querySelector('.tfcz-fab'); if (!b) { b = document.createElement('button'); b.className = 'tfcz-fab'; b.type = 'button'; b.onclick = () => open(); document.body.appendChild(b); }
    const s = STATE.cert && STATE.cert.status; b.classList.toggle('ok', s === 'approved');
    b.innerHTML = '🎓 ' + L('شهادتي', 'My Certificate') + (s === 'approved' ? ` <i>${L('جاهزة', 'Ready')}</i>` : s === 'pending' ? ` <i>${L('قيد المراجعة', 'Pending')}</i>` : '');
  }
  function shell(inner) {
    let o = document.getElementById('tfcz'); if (!o) { o = document.createElement('div'); o.id = 'tfcz'; document.body.appendChild(o); o.addEventListener('click', e => { if (e.target === o) close(); }); }
    o.setAttribute('dir', EN() ? 'ltr' : 'rtl'); o.innerHTML = `<div class="bx"><div class="hd"><span style="font-size:30px">🎓</span><div><b>TRACK FORD · CERTIFICATION</b><h2>${L('الشهادة والإفادة الرسمية', 'Certificate & official attestation')}</h2></div><button class="x" aria-label="close">✕</button></div><div class="bd">${inner}</div></div>`;
    o.querySelector('.x').onclick = close; return o;
  }
  function close() { const o = document.getElementById('tfcz'); if (o) o.remove(); }
  async function open(celebrate) {
    const u = user();
    if (!u || u.local) { shell(`<div class="st none">ℹ️ ${L('سجّل دخولك في المنصّة أولًا (اسمك وجوالك) ليتمكن المدرب من اعتماد شهادتك.', 'Please register / sign in to the platform first so the trainer can approve your certificate.')}</div><div class="row"><button class="btn g" id="tfczReg">${L('التسجيل / الدخول', 'Register / Sign in')}</button></div>`); const b = document.getElementById('tfczReg'); b.onclick = () => { close(); window.TFC && window.TFC.regModal && window.TFC.regModal(); }; return; }
    shell(`<p>${L('جارٍ التحميل…', 'Loading…')}</p>`); await refresh(); await libs().catch(() => {});
    const c = STATE.cert, s = c ? c.status : 'none', d = docData();
    const stTxt = { none: L('لم تطلب الشهادة بعد. اكتب اسمك كما تحب أن يظهر، ثم أرسل الطلب لموافقة المدرب.', 'You have not requested your certificate yet. Type your name exactly as it should appear, then submit it for trainer approval.'),
      pending: L('⏳ طلبك بانتظار موافقة المدرب. ستصلك الشهادة والإفادة هنا فور الاعتماد.', '⏳ Your request is awaiting the trainer\'s approval. Your documents will appear here once approved.'),
      approved: L('✅ اعتمد المدرب شهادتك — يمكنك تنزيل الشهادة والإفادة الرسمية بصيغة PDF.', '✅ Approved by your trainer — download your certificate and official attestation as PDF.'),
      rejected: L('⚠️ أعاد المدرب الطلب للتعديل', '⚠️ The trainer returned your request for correction') + (c && c.note ? ': ' + esc(c.note) : ''), revoked: L('⛔ أُلغيت هذه الشهادة. تواصل مع المدرب.', '⛔ This certificate has been revoked. Please contact your trainer.') }[s];
    const form = s === 'revoked' ? '' : `<div class="fm"><label>${L('الاسم بالإنجليزية كما يظهر في الشهادة', 'Name in English (as on the certificate)')}<input id="tfczEn" dir="ltr" maxlength="80" value="${esc(c && c.nameEn || '')}" placeholder="e.g. Sarah M. Al-Otaibi"><small>${L('أحرف إنجليزية فقط', 'Latin letters only')}</small></label>
      <label>${L('الاسم بالعربية كما يظهر في الإفادة', 'Name in Arabic (as on the attestation)')}<input id="tfczAr" dir="rtl" maxlength="80" value="${esc(c && c.nameAr || (/[؀-ۿ]/.test(u.name || '') ? u.name : ''))}" placeholder="سارة محمد العتيبي"><small>${L('أحرف عربية فقط', 'Arabic letters only')}</small></label></div>
      <div class="row"><button class="btn ${s === 'approved' ? 'o' : 'g'}" id="tfczSend">${s === 'approved' ? L('طلب تعديل الاسم (يتطلب موافقة جديدة)', 'Request a name change (needs re-approval)') : s === 'pending' ? L('تحديث الطلب', 'Update request') : L('إرسال للمدرب للموافقة', 'Submit for trainer approval')}</button><span class="msg" id="tfczMsg"></span></div>`;
    const dl = s === 'approved' ? `<div class="row"><button class="btn g" id="tfczC">⬇️ ${L('تنزيل الشهادة PDF', 'Download certificate (PDF)')}</button><button class="btn g" id="tfczA">⬇️ ${L('تنزيل الإفادة الرسمية PDF', 'Download attestation (PDF)')}</button><a class="btn o" href="${esc(vurl(d))}" target="_blank" rel="noopener">🔗 ${L('صفحة التحقق', 'Verification page')}</a></div>` : '';
    const cele = celebrate && s === 'approved' ? `<div class="cele"><div style="font-size:46px">🎉</div><h3>${L('مبارك! صدرت إفادتك الرسمية المعتمدة', 'Congratulations! Your certified attestation has been issued')}</h3><p>${L('رقم الشهادة', 'Certificate No.')} <b dir="ltr">${esc(c.no)}</b> · ${L('رمز التحقق', 'Verification code')} <b dir="ltr">${esc(c.verify)}</b></p></div>` : '';
    shell(`${cele}<div class="st ${s}">${stTxt}</div>${dl}${form}<div class="pv"><div id="tfczP1"></div><div id="tfczP2"></div></div>`);
    const draw = async () => { const dd = docData(); const en = document.getElementById('tfczEn'), ar = document.getElementById('tfczAr'); if (en && s !== 'approved') { dd.nameEn = en.value.trim() || dd.nameEn; dd.nameAr = ar.value.trim() || dd.nameAr; }
      const p1 = document.getElementById('tfczP1'), p2 = document.getElementById('tfczP2'); if (!p1) return; p1.replaceChildren(await preview('cert', dd)); p2.replaceChildren(await preview('attest', dd)); };
    draw(); let t; ['tfczEn', 'tfczAr'].forEach(k => { const el = document.getElementById(k); if (el) el.oninput = () => { clearTimeout(t); t = setTimeout(draw, 350); }; });
    const sb = document.getElementById('tfczSend'); if (sb) sb.onclick = async () => {
      const nameEn = document.getElementById('tfczEn').value.trim(), nameAr = document.getElementById('tfczAr').value.trim(), m = document.getElementById('tfczMsg');
      if (!/^[A-Za-z][A-Za-z .'\-]{2,79}$/.test(nameEn)) { m.textContent = L('اكتب الاسم الإنجليزي بأحرف إنجليزية (3 أحرف على الأقل).', 'Enter the English name in Latin letters (min. 3).'); return; }
      if (!/^[؀-ۿݐ-ݿ][؀-ۿݐ-ݿ .\-]{2,79}$/.test(nameAr)) { m.textContent = L('اكتب الاسم العربي بأحرف عربية.', 'Enter the Arabic name in Arabic letters.'); return; }
      sb.disabled = true; m.textContent = L('جارٍ الإرسال…', 'Sending…');
      const r = await api('/api/cert', { method: 'POST', body: JSON.stringify({ id: u.id, token: u.token, nameEn, nameAr }) }).catch(() => ({ ok: false, j: {} }));
      sb.disabled = false; if (!r.ok) { m.textContent = L('تعذّر الإرسال: ', 'Could not send: ') + (r.j.error || 'offline'); return; }
      STATE.cert = r.j.cert; fab(); open(); poll();
    };
    const bc = document.getElementById('tfczC'), ba = document.getElementById('tfczA');
    if (bc) bc.onclick = async () => { bc.disabled = true; await pdf('cert', docData()).catch(e => alert(e.message)); bc.disabled = false; };
    if (ba) ba.onclick = async () => { ba.disabled = true; await pdf('attest', docData()).catch(e => alert(e.message)); ba.disabled = false; };
  }
  function poll() {
    clearTimeout(pollT); const s = STATE.cert && STATE.cert.status; if (s !== 'pending') return;
    pollT = setTimeout(async () => { const j = await refresh(); const c = j && j.cert; if (c && c.status === 'approved') announce(c); else poll(); }, 30000);
  }
  function announce(c) { const k = 'tf_cert_seen_' + c.no; try { if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); } catch (e) {} open(true); }
  function boot() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (page === 'trainer') { const a = document.createElement('a'); a.href = 'certificates.html'; a.className = 'tfcz-fab'; a.style.textDecoration = 'none'; a.innerHTML = '🎓 الشهادات والإفادات'; document.body.appendChild(a); return; }
    if (page === 'certificates' || page === 'studio') return;
    const u = user(); fab();
    if (u && !u.local) refresh().then(j => { const c = j && j.cert; if (c && c.status === 'approved') announce(c); else poll(); });
  }
  window.TFCert = { libs, drawCert, drawAttest, pdf, preview, open, refresh, DEF, vurl };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
