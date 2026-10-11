/* Track Ford GRC — المقابلة الحية: مستشار ذكي بوجه وصوت باللهجة السعودية يحاورك عبر الكاميرا والمايك
   - شخصية «سعود» مرسومة ومتحركة (رمش، حركة فم متزامنة مع الصوت، إيماءات) أو بصورة حقيقية تختارها.
   - يتكلم بصوت المتصفح (ar-SA) ويسمعك عبر التعرف على الكلام (Chrome/Edge) أو بالكتابة.
   - محرك حوار داخلي: يسأل عن عناصر النموذج، يفهم إجابتك ويقدّر مستوى النضج، يجيب عن أسئلتك، ويختم بخلاصة وأولويات.
   - يسجّل المقابلة فيديو (الكانفس + صوتك) ويعلّم بند المقابلة في مسار الدورة. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const HEX = { L: '#1AA39A', A: '#E5483D', P: '#E59A1F', R: '#8E2A6B' };
  const Q = {
    L1: 'نبدأ بالسياق الخارجي. عندكم أحد مسؤول يتابع الأنظمة الجديدة واللوايح وتغيّرات السوق أول بأول؟ وإذا طلع شي جديد، كيف يوصل للإدارة؟',
    L2: 'طيب، السياق الداخلي: عملياتكم وأصولكم المهمة مكتوبة وموثّقة؟ ولا المعرفة كلها في روس الموظفين وإذا راح واحد راحت معه؟',
    L3: 'الثقافة عندكم: لو موظف شاف غلط، يتكلم على راحته ولا يسكت ويقول ما لي دخل؟ وهل تقيسون الثقافة بأي استبيان أو مؤشر؟',
    L4: 'أصحاب المصلحة: عندكم سجل واضح بمتطلبات الجهات التنظيمية والعملاء والشركاء؟ وتتواصلون معهم بشكل منتظم ولا بس وقت المشاكل؟',
    A1: 'التوجيه: مجلس الإدارة معتمد شهية مخاطر وحدود تحمّل مكتوبة ومعروفة؟ ولا الموضوع كل واحد يجتهد على كيفه؟',
    A2: 'الأهداف: أهدافكم واضحة ومتسلسلة من المنظمة لين الإدارات والأقسام؟ ولها مؤشرات تقيسونها؟',
    A3: 'التحديد: عندكم سجل واحد موحّد للمخاطر والفرص والالتزامات النظامية؟ ولا كل إدارة عندها ملفها لحالها وما أحد يدري عن الثاني؟',
    A4: 'التقييم: كيف تقيّمون المخاطر عندكم؟ تحسبون الاحتمالية والأثر؟ تفرّقون بين الخطر الكامن والمتبقي؟ وتقارنونه بالشهية؟',
    A5: 'التصميم: لما تطلع لكم مخاطرة كبيرة، كيف تصمّمون معالجتها؟ فيه مالك مسؤول وموعد وميزانية؟ ولا تنحل بالاجتهاد؟',
    P1: 'الضوابط: ضوابطكم مكتوبة ولها ملّاك وتُختبر بشكل دوري؟ ولا ماشية بالعادة وخبرة الموظف القديم؟',
    P2: 'السياسات: سياساتكم محدّثة ومعتمدة، والموظفين فعلًا قاريينها وموقّعين عليها؟ ولا مكدّسة في درج؟',
    P3: 'التواصل: معلومات الحوكمة والمخاطر توصل للإدارة والمجلس في وقتها؟ وبأي شكل، تقارير دورية ولا لما تصير مصيبة؟',
    P4: 'التثقيف: التدريب عندكم مفصّل على حسب دور كل موظف ولا تدريب عام للكل؟ وهل تقيسون أثره بعدين؟',
    P5: 'الحوافز: المكافآت والترقيات والجزاءات مرتبطة بالسلوك المنضبط والنزاهة؟ ولا بس بالأرقام والمبيعات؟',
    P6: 'الإبلاغ: فيه قناة سرية يبلّغ فيها الموظف عن المخالفات؟ والناس تثق فيها فعلًا؟ وفيه حماية للمبلّغ من الانتقام؟',
    P7: 'الاستقصاء: لما يجيكم بلاغ، كيف تحققون فيه؟ فيه إجراء ثابت ومستقل؟ ولا يعتمد على مزاج المدير؟',
    P8: 'الاستجابة: عندكم خطط جاهزة للحوادث والأزمات واستمرارية الأعمال؟ ومتى آخر مرة جربتوها فعليًا؟',
    R1: 'المتابعة: عندكم لوحة مؤشرات للأداء والمخاطر والامتثال تتابعونها؟ وفيه إنذار مبكر يطق قبل ما تكبر المشكلة؟',
    R2: 'الضمان: المراجعة الداخلية تشتغل على أساس المخاطر؟ وفيه تنسيق بين الخط الأول والثاني والثالث ولا كل واحد يراجع لحاله؟',
    R3: 'التحسين: لما تصير حادثة أو تجيكم ملاحظة، تتحوّل لتحسين حقيقي في النظام؟ ولا تنقفل وتتكرر السنة الجاية؟' };
  const LVL_RE = [
    [5, /تحسين مستمر|نحسّن|نحسن باستمرار|دروس مستفاد|مقارن(ة|ات) مرجعي|نطوّر|نطور كل|benchmark|افضل الممارسات|أفضل الممارسات/],
    [4, /مؤشر|مؤشرات|نقيس|قياس|لوحة|داشبورد|بيانات|نسبة|تقرير دوري|تقارير دورية|كل ربع|شهري|kpi|kri|kci/i],
    [3, /موثق|موثّق|سياسة|سياسات|إجراء|اجراء|معتمد|منهجية|منتظم|بشكل منتظم|سنوي|نطبق|مطبّق|مطبق|في كل الإدارات|كل الادارات|نظام رسمي/],
    [2, /أحيان|احيان|حسب الشخص|فردي|غير موثق|مو موثق|يعتمد على|على حسب|جزئي|بعض الإدارات|بعض الادارات|مو رسمي|غير رسمي|بالخبرة|بالعادة|نحاول|بدينا|بدأنا/],
    [1, /ما عندنا|ما فيه|مافيه|لا يوجد|ما يوجد|أبد|ابد|ولا شي|ما نسوي|ما نقيس|ما في|لا توجد|مافي|لا أعتقد|ما أظن|ما اظن|ماعندنا/]];
  const YES = /^(نعم|ايه|إيه|أكيد|اكيد|طبعا|طبعاً|ايوه|أيوه|موجود|فيه)\b/;
  const QUESTION = /\?|؟|^(وش|ايش|إيش|كيف|ليش|ليه|متى|وين|من هو|هل|ممكن تشرح|يعني ايش|يعني وش)/;
  const REFLECT = {
    1: n => `واضح، يعني ${n} عندكم للحين ما له نظام — نحطّه مستوى واحد، مبدئي. ولا يهمّك، أغلب الجهات تبدأ من هنا، المهم إنكم عرفتوا وين واقفين.`,
    2: n => `تمام، فيه جهود في ${n} بس تعتمد على أشخاص معيّنين وما هي موثّقة كلها — هذا مستوى اثنين، مُدار. خطوة وحدة وتصير متّسقة.`,
    3: n => `ممتاز ما قصّرتوا، ${n} عندكم موثّق ومطبّق في كل مكان — هذا مستوى ثلاثة، متّسق. أساس قوي تبنون عليه.`,
    4: n => `ما شاء الله تبارك الله، تقيسون ${n} بمؤشرات وتراجعون النتائج — مستوى أربعة، مُقاس. والله قليل اللي يوصل هنا.`,
    5: n => `هذا أعلى شي: تحسين مستمر في ${n} مبني على بيانات ودروس مستفادة — مستوى خمسة. حافظوا عليه ووثّقوا الأدلة عشان المراجع.` };
  const PROBE = ['طيب عطني مثال من الواقع عشان أفهم أكثر؟', 'وضّح لي أكثر: هذا مكتوب وموثّق، ولا يعتمد على خبرة الأشخاص؟', 'تمام، وهل تقيسونه بمؤشر أو تقرير دوري؟', 'يعني لو سألت موظف جديد عنه، يعرف يجاوبني؟'];
  const SMALL = { greet: ['هلا والله وغلا', 'يا هلا ومرحبا', 'حيّاك الله', 'أهلين وسهلين'], ok: ['تمام', 'طيب', 'أبشر', 'واضح', 'زين'], thanks: ['العفو، هذا واجبنا', 'ولو، تأمر أمر'] };
  /* نسخة فصحى للصوت الآلي (أصوات المتصفح تنطق الفصحى أوضح) */
  const toMSA = t => t.replace(/عندكم/g, 'لديكم').replace(/وش |وش$/g, 'ما ').replace(/كيفه/g, 'هواه').replace(/للحين/g, 'حتى الآن').replace(/بس /g, 'لكن ').replace(/زين/g, 'جيد').replace(/أبشر/g, 'حسنًا').replace(/هلا والله وغلا|يا هلا ومرحبا|أهلين وسهلين/g, 'أهلًا وسهلًا').replace(/حيّاك الله/g, 'مرحبًا بك').replace(/ما قصّرتوا/g, 'أحسنتم').replace(/عطني/g, 'أعطني').replace(/بعدين/g, 'لاحقًا').replace(/لين /g, 'إلى ').replace(/روس/g, 'رؤوس').replace(/تطق/g, 'ينبّه').replace(/الجاية/g, 'القادمة').replace(/يطلع|تطلع/g, 'يظهر').replace(/جربتوها/g, 'اختبرتموها').replace(/ماشية/g, 'تسير').replace(/قاريينها/g, 'قرؤوها').replace(/تجيكم|يجيكم/g, 'يصلكم').replace(/تنقفل/g, 'تُغلق').replace(/ما لي دخل/g, 'لا شأن لي').replace(/تدري/g, 'تعلم').replace(/يدري/g, 'يعلم').replace(/تبنون/g, 'تبنون').replace(/شي\b/g, 'شيء').replace(/هالـ|هال/g, 'هذه ال');
  const pick = a => a[Math.floor(Math.random() * a.length)];

  let ctx, host, CV, CX, cam = null, camVideo = null, mic = null, analyser = null, rec = null, chunks = [], recording = false, raf = null;
  const ST = { mode: 'draw', clips: {}, msa: false, mouth: 0, blink: 0, nextBlink: 0, speaking: false, listening: false, sub: '', subWho: 'ai', lvls: {}, meter: {}, turn: 0, plan: [], idx: -1, probes: 0, awaiting: null, log: [], done: false, started: false, face: null, vol: 0, name: '', busy: false, voice: null };

  /* ───── الصوت: اختيار أوضح صوت عربي متاح ───── */
  function pickVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const ar = vs.filter(v => /^ar/i.test(v.lang));
    const pref = ['naayf', 'hamed', 'zariyah', 'ar-sa', 'google', 'microsoft', 'laila', 'maged', 'tarik'];
    ar.sort((a, b) => { const sa = pref.findIndex(p => (a.name + a.lang).toLowerCase().includes(p)), sb = pref.findIndex(p => (b.name + b.lang).toLowerCase().includes(p)); return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb); });
    ST.voice = ar[0] || null; return ST.voice;
  }
  function speak(text) {
    return new Promise(res => {
      ST.sub = text; ST.subWho = 'ai';
      if (!window.speechSynthesis) { ST.speaking = true; setTimeout(() => { ST.speaking = false; res(); }, Math.max(1500, text.length * 55)); return; }
      try { speechSynthesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(ST.msa ? toMSA(text) : text); u.lang = 'ar-SA'; u.rate = 0.98; u.pitch = 0.95; if (ST.voice) u.voice = ST.voice;
      let ended = false; const fin = () => { if (ended) return; ended = true; ST.speaking = false; res(); };
      u.onstart = () => { ST.speaking = true; }; u.onend = fin; u.onerror = fin; u.onboundary = () => { ST.mouth = 1; };
      speechSynthesis.speak(u); setTimeout(fin, Math.max(2500, text.length * 120)); // أمان
    });
  }

  /* ───── الاستماع ───── */
  let SRi = null;
  function listen() {
    return new Promise(res => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      ST.listening = true; ST.sub = '… أسمعك، تفضّل'; ST.subWho = 'me'; setBtn();
      const typed = host.querySelector('#lvIn'); const doneBtn = host.querySelector('#lvSend');
      let finished = false; const finish = txt => { if (finished) return; finished = true; ST.listening = false; try { SRi && SRi.stop(); } catch (e) {} SRi = null; doneBtn.onclick = null; typed.value = ''; ST._interim = ''; setBtn(); res((txt || '').trim()); };
      doneBtn.onclick = () => finish(typed.value || ST._interim || ''); typed.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); finish(typed.value); } };
      if (!SR) { typed.focus(); typed.placeholder = 'اكتب إجابتك هنا ثم اضغط إرسال (التعرف الصوتي يحتاج Chrome أو Edge)'; return; }
      try {
        SRi = new SR(); SRi.lang = 'ar-SA'; SRi.continuous = true; SRi.interimResults = true; let fin = '', silence = null;
        SRi.onresult = e => { let tmp = ''; fin = ''; for (let i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript + ' '; else tmp += e.results[i][0].transcript; } ST._interim = (fin + tmp).trim(); ST.sub = ST._interim || '… أسمعك'; typed.value = ST._interim; clearTimeout(silence); silence = setTimeout(() => finish(ST._interim), 2200); };
        SRi.onerror = () => { typed.focus(); }; SRi.onend = () => { if (!finished && ST._interim) finish(ST._interim); else if (!finished) { try { SRi.start(); } catch (e) {} } };
        SRi.start();
      } catch (e) { typed.focus(); }
    });
  }
  function setBtn() { const b = host.querySelector('#lvSend'); if (b) { b.disabled = !ST.listening; b.textContent = ST.listening ? '✅ خلصت إجابتي' : (ST.speaking ? '🔊 سعود يتكلم…' : 'إرسال'); } const m = host.querySelector('#lvMic'); if (m) m.classList.toggle('on', ST.listening); }

  /* ───── محرك الحوار ───── */
  const S = () => ctx.S, EL = () => ctx.EL;
  function elName(c) { const e = EL().find(x => x[0] === c); return e ? e[1] : c; }
  function estimate(txt) {
    const t = txt.toLowerCase(); let lv = 0;
    for (const [l, re] of LVL_RE) { if (re.test(t)) { lv = Math.max(lv, l); } }
    if (!lv && YES.test(txt.trim())) lv = txt.length > 40 ? 3 : 2;
    if (!lv && txt.length > 60) lv = 2;
    return lv;
  }
  function plan() {
    const comps = ['L', 'A', 'P', 'R']; const out = [];
    comps.forEach(k => { const els = EL().filter(e => e[0][0] === k); const sorted = els.slice().sort((a, b) => (ctx.score(a[0]) || 9) - (ctx.score(b[0]) || 9)); out.push(sorted[0][0], sorted[1][0]); });
    return out;
  }
  async function say(t, who) { ST.log.push({ who: who || 'ai', text: t }); logTurn(ST.log[ST.log.length - 1]); if (!who || who === 'ai') await speak(t); }
  function answerQuestion(q) { try { return ctx.localAnswer(q); } catch (e) { return 'سؤال حلو — نرجع له بعد ما نخلّص التقييم إن شاء الله.'; } }
  async function run() {
    if (ST.started) return; ST.started = true; ST.done = false; ST.lvls = {}; ST.meter = {}; ST.log = []; host.querySelector('#lvLog').innerHTML = '';
    const name = (S().p.name || '').trim(); const u = (window.TFC && window.TFC.user && window.TFC.user()) || null; ST.name = u && !u.guest ? u.name.split(' ')[0] : '';
    await say(`${pick(SMALL.greet)}${ST.name ? ' يا ' + ST.name : ''}، أنا سعود، مستشار الحوكمة والمخاطر والامتثال في تراكفورد. اليوم ودّي نسولف شوي عن ${name ? '«' + name + '»' : 'جهتكم'} ونشوف وين واصلين في قدرات الحوكمة والمخاطر والامتثال على نموذج أوسيج ثلاثة ونص. جاوبني على راحتك بدون رسميات، وإذا عندك أي سؤال اسألني في أي وقت.`);
    if (!name) { await say('أول شي، عرّفني على جهتكم: وش اسمها ووش طبيعة شغلها؟'); const a = await listen(); if (a) { ST.log.push({ who: 'me', text: a }); logTurn({ who: 'me', text: a }); const nm = a.replace(/^(احنا|إحنا|نحن|اسمها|جهتنا|شركة|شركتنا)\s*/g, '').split(/[،,.]/)[0].trim().slice(0, 60); if (nm) { S().p.name = nm; try { ctx.save && ctx.save(); } catch (e) {} } await say(`${pick(SMALL.ok)}، الله يحيّيكم. يلا نبدأ.`); } }
    ST.plan = plan(); ST.idx = -1;
    while (ST.idx < ST.plan.length - 1) {
      ST.idx++; const c = ST.plan[ST.idx]; const tgt = +S().p.target || 4;
      await say(Q[c]); let ans = await listen(); if (!ans) { await say('ما سمعتك زين — ممكن تعيدها؟ أو اكتبها لي تحت.'); ans = await listen(); }
      if (!ans) continue;
      ST.log.push({ who: 'me', text: ans }); logTurn({ who: 'me', text: ans });
      if (QUESTION.test(ans) && ans.length < 160) { await say(answerQuestion(ans)); await say('طيب، نرجع لسؤالنا: ' + Q[c]); ans = await listen(); if (!ans) continue; ST.log.push({ who: 'me', text: ans }); logTurn({ who: 'me', text: ans }); }
      let lv = estimate(ans);
      if (!lv && ST.probes < 3) { ST.probes++; await say(pick(PROBE)); const more = await listen(); if (more) { ST.log.push({ who: 'me', text: more }); logTurn({ who: 'me', text: more }); lv = estimate(ans + ' ' + more) || 2; } else lv = 2; }
      if (!lv) lv = 2;
      ST.lvls[c] = lv; const k = c[0]; const vals = Object.entries(ST.lvls).filter(([x]) => x[0] === k).map(([, v]) => v); ST.meter[k] = vals.reduce((a, b) => a + b, 0) / vals.length;
      S().a[c] = lv; try { ctx.save && ctx.save(); } catch (e) {}
      const e = EL().find(x => x[0] === c);
      await say(REFLECT[lv](e[1]) + (lv < tgt ? ` عشان توصلون للمستوى ${tgt}: ${e[4]}` : ''));
    }
    const m = ctx.lossModel(); await say('آخر سؤال وما أطوّل عليك: خلال السنة اللي راحت، تقريبًا كم خسرتوا من غرامات أو حوادث أو تعطّل؟ ولو ما عندكم رقم عادي قول لي.');
    const la = await listen(); if (la) { ST.log.push({ who: 'me', text: la }); logTurn({ who: 'me', text: la }); const num = (la.replace(/,/g, '').match(/\d+(\.\d+)?/) || [])[0]; if (num) { let v = +num; if (/مليون/.test(la)) v *= 1e6; else if (/ألف|الف/.test(la)) v *= 1e3; S().l.ops = [1, v]; try { ctx.save && ctx.save(); } catch (e) {} await say(`يعني تقريبًا ${ctx.fmt(v)} ريال. هذا رقم مهم جدًا، لأنه يحوّل الحوكمة في نظر الإدارة من مصروف إلى استثمار له عائد واضح.`); } else await say('تمام، أول شي أنصحكم فيه: سجل واحد للحوادث والخسائر — بدونه ما تقدرون تثبتون للإدارة قيمة البرنامج.'); }
    const vals = Object.values(ST.lvls); const ov = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    let rep = null; try { rep = ctx.buildLocalReport(); } catch (e) {}
    const weak = Object.entries(ST.meter).sort((a, b) => a[1] - b[1]).map(([k]) => ctx.COMP.find(c => c.k === k).ar);
    await say(`خلاصة سوالفنا: مؤشر قدرات الحوكمة والمخاطر والامتثال عندكم تقريبًا ${ov.toFixed(1)} من خمسة، يعني ${ctx.lvName(ov)}. أضعف مكوّن عندكم ${weak[0] || '—'} وبعده ${weak[1] || '—'}.${rep ? ' وأهم ثلاث أولويات لأول تسعين يوم: ' + rep.recommendations.slice(0, 3).map((r, i) => `${i + 1}) ${r.title}`).join('، ') + '.' : ''} التقرير الكامل بالتوصيات جاهز لكم في المرحلة الخامسة، حمّلوه واعرضوه على الإدارة.`);
    await say(`يعطيكم العافية على وقتكم${ST.name ? ' يا ' + ST.name : ''}، وتراكفورد معكم خطوة بخطوة. موفّقين إن شاء الله.`);
    ST.done = true; ST.started = false; try { window.TFC && window.TFC.mark('sim'); } catch (e) {} try { ctx.onFinish && ctx.onFinish(); } catch (e) {}
    if (recording) stopRec(); setBtn(); host.querySelector('#lvStart').textContent = '🔁 مقابلة جديدة';
  }
  function logTurn(t) { const d = document.createElement('div'); d.className = 'lv-t ' + t.who; d.innerHTML = `<b>${t.who === 'ai' ? 'سعود · المستشار' : (ST.name || 'أنت')}</b>${esc(t.text)}`; const L = host.querySelector('#lvLog'); L.append(d); L.scrollTop = 1e9; }

  /* ───── مقدّم حقيقي: مقاطع فيديو (تحدث/استماع) محفوظة في المتصفح ───── */
  const DB = { open: () => new Promise((res, rej) => { const r = indexedDB.open('tf_live', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
    get: async k => { try { const d = await DB.open(); return await new Promise((res, rej) => { const q = d.transaction('clips').objectStore('clips').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); } catch (e) { return null; } },
    set: async (k, v) => { try { const d = await DB.open(); return await new Promise((res, rej) => { const q = d.transaction('clips', 'readwrite').objectStore('clips').put(v, k); q.onsuccess = () => res(true); q.onerror = () => rej(q.error); }); } catch (e) { return false; } } };
  function setClip(k, blob) { if (!blob) return; const v = document.createElement('video'); v.src = URL.createObjectURL(blob); v.muted = true; v.loop = true; v.playsInline = true; v.play().catch(() => {}); ST.clips[k] = v; if (ST.clips.talk) { ST.mode = 'video'; updModeUI(); } }
  async function loadClips() { const t = await DB.get('talk'), i = await DB.get('idle'); if (t) setClip('talk', t); if (i) setClip('idle', i); const f = await DB.get('face'); if (f) { const im = new Image(); im.onload = () => { ST.face = im; if (!ST.clips.talk) { ST.mode = 'photo'; updModeUI(); } }; im.src = URL.createObjectURL(f); } }
  async function recordClip(k) {
    if (!cam) { const ok = await startCam(); if (!ok) return; }
    const vs = new MediaStream(cam.getVideoTracks()); const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || '';
    const r = new MediaRecorder(vs, mime ? { mimeType: mime, videoBitsPerSecond: 2.5e6 } : undefined); const ch = []; r.ondataavailable = e => { if (e.data.size) ch.push(e.data); };
    const btn = host.querySelector(k === 'talk' ? '#lvRecTalk' : '#lvRecIdle'); let n = 8; btn.disabled = true; const tick = setInterval(() => { n--; btn.textContent = (k === 'talk' ? 'تكلّم الآن… ' : 'انظر للكاميرا وأومئ… ') + n; }, 1000);
    ST.sub = k === 'talk' ? 'سجّل الآن: تكلّم بشكل طبيعي لمدة 8 ثوانٍ (بدون صوت، للفم فقط)' : 'سجّل الآن: اسمع وأومئ برأسك بهدوء لمدة 8 ثوانٍ'; ST.subWho = 'me';
    r.onstop = async () => { clearInterval(tick); btn.disabled = false; btn.textContent = k === 'talk' ? '⏺ سجّل مقطع التحدث (8 ث)' : '⏺ سجّل مقطع الاستماع (8 ث)'; const blob = new Blob(ch, { type: 'video/webm' }); await DB.set(k, blob); setClip(k, blob); ST.sub = 'تم حفظ المقطع ✅ — المقدّم الآن بصورتك الحقيقية.'; };
    r.start(); setTimeout(() => { try { r.stop(); } catch (e) {} }, 8000);
  }
  function updModeUI() { host.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('gold', b.dataset.mode === ST.mode)); const st = host.querySelector('#lvClipSt'); if (st) st.textContent = (ST.clips.talk ? '✅ مقطع التحدث محفوظ' : '◻ لا يوجد مقطع تحدث') + ' · ' + (ST.clips.idle ? '✅ مقطع الاستماع محفوظ' : '◻ لا يوجد مقطع استماع') + (ST.face ? ' · ✅ صورة محفوظة' : ''); }
  function drawVideoPresenter(cx, cy, t) {
    const talk = ST.clips.talk, idle = ST.clips.idle || ST.clips.talk; const v = ST.speaking ? talk : idle; if (!v || v.readyState < 2) return false;
    const w = 460, h = 520, x = cx - w / 2, y = cy - h / 2 + 20; const nod = ST.speaking ? Math.sin(t / 300) * 2 : 0;
    CX.save(); rr(x, y + nod, w, h, 26); CX.clip(); const vr = v.videoWidth / v.videoHeight || 1.33; let dw = w, dh = w / vr; if (dh < h) { dh = h; dw = h * vr; } CX.translate(x + w, 0); CX.scale(-1, 1); CX.drawImage(v, (w - dw) / 2, y + nod + (h - dh) / 2, dw, dh); CX.restore();
    CX.strokeStyle = ST.speaking ? '#E2B85A' : 'rgba(255,255,255,.35)'; CX.lineWidth = 4; rr(x, y + nod, w, h, 26); CX.stroke(); return true;
  }
  /* ───── الرسم ───── */
  function rr(x, y, w, h, r) { CX.beginPath(); CX.moveTo(x + r, y); CX.arcTo(x + w, y, x + w, y + h, r); CX.arcTo(x + w, y + h, x, y + h, r); CX.arcTo(x, y + h, x, y, r); CX.arcTo(x, y, x + w, y, r); CX.closePath(); }
  function wrap(text, maxW, font) { CX.font = font; const words = String(text).split(/\s+/), lines = []; let cur = ''; words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (CX.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function drawPersona(cx, cy, sc, t) {
    const sway = Math.sin(t / 900) * 2 * sc, nod = ST.speaking ? Math.sin(t / 260) * 2.5 * sc : 0;
    CX.save(); CX.translate(cx + sway, cy + nod);
    // الثوب
    CX.fillStyle = '#F7F7F2'; CX.beginPath(); CX.moveTo(-150 * sc, 300 * sc); CX.quadraticCurveTo(-120 * sc, 110 * sc, 0, 100 * sc); CX.quadraticCurveTo(120 * sc, 110 * sc, 150 * sc, 300 * sc); CX.closePath(); CX.fill();
    CX.strokeStyle = '#E2E2DA'; CX.lineWidth = 2 * sc; CX.beginPath(); CX.moveTo(0, 118 * sc); CX.lineTo(0, 300 * sc); CX.stroke();
    // الشماغ: الجزء الخلفي
    CX.fillStyle = '#F4F1EA'; CX.beginPath(); CX.moveTo(-95 * sc, -60 * sc); CX.quadraticCurveTo(-120 * sc, 120 * sc, -60 * sc, 200 * sc); CX.lineTo(60 * sc, 200 * sc); CX.quadraticCurveTo(120 * sc, 120 * sc, 95 * sc, -60 * sc); CX.closePath(); CX.fill();
    // نقشة الشماغ الحمراء
    CX.save(); CX.beginPath(); CX.moveTo(-95 * sc, -60 * sc); CX.quadraticCurveTo(-120 * sc, 120 * sc, -60 * sc, 200 * sc); CX.lineTo(60 * sc, 200 * sc); CX.quadraticCurveTo(120 * sc, 120 * sc, 95 * sc, -60 * sc); CX.closePath(); CX.clip();
    CX.strokeStyle = 'rgba(190,40,40,.55)'; CX.lineWidth = 1.2 * sc; for (let i = -140; i <= 140; i += 14) { CX.beginPath(); CX.moveTo(i * sc, -80 * sc); CX.lineTo(i * sc, 220 * sc); CX.stroke(); CX.beginPath(); CX.moveTo(-140 * sc, i * sc + 60 * sc); CX.lineTo(140 * sc, i * sc + 60 * sc); CX.stroke(); } CX.restore();
    // الوجه
    if (ST.face && ST.mode !== 'draw') { CX.save(); CX.beginPath(); CX.ellipse(0, 0, 62 * sc, 78 * sc, 0, 0, Math.PI * 2); CX.clip(); const im = ST.face; const r = Math.max(124 * sc / im.width, 156 * sc / im.height); CX.drawImage(im, -im.width * r / 2, -im.height * r / 2 - 6 * sc, im.width * r, im.height * r); CX.restore(); }
    else {
      CX.fillStyle = '#D9A56E'; CX.beginPath(); CX.ellipse(0, 0, 62 * sc, 78 * sc, 0, 0, Math.PI * 2); CX.fill();
      // لحية خفيفة
      CX.fillStyle = 'rgba(60,40,30,.55)'; CX.beginPath(); CX.ellipse(0, 42 * sc, 50 * sc, 36 * sc, 0, 0, Math.PI); CX.fill();
      CX.fillStyle = '#D9A56E'; CX.beginPath(); CX.ellipse(0, 30 * sc, 36 * sc, 22 * sc, 0, 0, Math.PI * 2); CX.fill();
      // حواجب وعينان
      CX.strokeStyle = '#3B2A1E'; CX.lineWidth = 4 * sc; CX.lineCap = 'round'; CX.beginPath(); CX.moveTo(-38 * sc, -28 * sc); CX.quadraticCurveTo(-24 * sc, -36 * sc, -10 * sc, -28 * sc); CX.moveTo(10 * sc, -28 * sc); CX.quadraticCurveTo(24 * sc, -36 * sc, 38 * sc, -28 * sc); CX.stroke();
      const blink = ST.blink; CX.fillStyle = '#fff'; CX.beginPath(); CX.ellipse(-24 * sc, -12 * sc, 11 * sc, 7 * sc * (1 - blink), 0, 0, Math.PI * 2); CX.ellipse(24 * sc, -12 * sc, 11 * sc, 7 * sc * (1 - blink), 0, 0, Math.PI * 2); CX.fill();
      CX.fillStyle = '#2B1D14'; CX.beginPath(); CX.arc(-24 * sc, -12 * sc, 4.5 * sc * (1 - blink), 0, Math.PI * 2); CX.arc(24 * sc, -12 * sc, 4.5 * sc * (1 - blink), 0, Math.PI * 2); CX.fill();
      // أنف
      CX.strokeStyle = '#B9825A'; CX.lineWidth = 3 * sc; CX.beginPath(); CX.moveTo(0, -4 * sc); CX.lineTo(-5 * sc, 16 * sc); CX.lineTo(5 * sc, 18 * sc); CX.stroke();
      // شارب
      CX.fillStyle = '#3B2A1E'; CX.beginPath(); CX.ellipse(0, 28 * sc, 22 * sc, 5 * sc, 0, 0, Math.PI * 2); CX.fill();
    }
    // الفم (يعمل مع الصورة والرسم)
    const open = 2 * sc + ST.mouth * 14 * sc; CX.fillStyle = '#5A1E1E'; CX.beginPath(); CX.ellipse(0, 44 * sc, 16 * sc, open, 0, 0, Math.PI * 2); CX.fill(); if (open > 7 * sc) { CX.fillStyle = '#fff'; CX.fillRect(-11 * sc, 44 * sc - open + 2 * sc, 22 * sc, 4 * sc); }
    // الغترة الأمامية والعقال
    CX.fillStyle = '#F4F1EA'; CX.beginPath(); CX.moveTo(-70 * sc, -62 * sc); CX.quadraticCurveTo(0, -112 * sc, 70 * sc, -62 * sc); CX.quadraticCurveTo(0, -78 * sc, -70 * sc, -62 * sc); CX.fill();
    CX.strokeStyle = '#111'; CX.lineWidth = 9 * sc; CX.beginPath(); CX.ellipse(0, -66 * sc, 66 * sc, 20 * sc, 0, Math.PI * 1.05, Math.PI * 1.95); CX.stroke(); CX.lineWidth = 5 * sc; CX.beginPath(); CX.ellipse(0, -58 * sc, 62 * sc, 16 * sc, 0, Math.PI * 1.08, Math.PI * 1.92); CX.stroke();
    CX.restore();
  }
  function frame(t) {
    if (!CV) return; const W = CV.width, H = CV.height; CX.direction = 'rtl'; CX.textBaseline = 'top';
    // خلفية استوديو
    const g = CX.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0A1B3D'); g.addColorStop(1, '#13295A'); CX.fillStyle = g; CX.fillRect(0, 0, W, H);
    CX.fillStyle = 'rgba(201,151,59,.08)'; CX.beginPath(); CX.arc(W * 0.68, H * 0.42, 260, 0, Math.PI * 2); CX.fill();
    // الشعار والعنوان
    CX.fillStyle = '#E2B85A'; CX.font = '700 13px Montserrat, Arial'; CX.direction = 'ltr'; CX.textAlign = 'left'; CX.fillText('TRACK FORD · LIVE GRC INTERVIEW', 28, 22); CX.direction = 'rtl';
    CX.fillStyle = '#fff'; CX.font = '700 24px Rubik, Tahoma'; CX.textAlign = 'right'; CX.fillText('مقابلة تقييم مباشرة — ' + (S().p.name || 'جهتكم'), W - 28, 16);
    // رمش
    if (t > ST.nextBlink) { ST.blink = Math.min(1, ST.blink + 0.25); if (ST.blink >= 1) ST.nextBlink = t + 2500 + Math.random() * 3000; } else ST.blink = Math.max(0, ST.blink - 0.2);
    // فم
    if (ST.speaking) { ST.mouth = Math.max(0, ST.mouth - 0.12) + (Math.random() < 0.35 ? Math.random() * 0.8 : 0); ST.mouth = Math.min(1, ST.mouth); } else ST.mouth = Math.max(0, ST.mouth - 0.15);
    if (!(ST.mode === 'video' && drawVideoPresenter(W * 0.68, H * 0.46, t))) drawPersona(W * 0.68, H * 0.46, 1.25, t);
    // بطاقة اسم المستشار
    CX.fillStyle = 'rgba(255,255,255,.95)'; rr(W * 0.68 - 170, H * 0.46 + 232, 340, 54, 12); CX.fill(); CX.fillStyle = '#0A1B3D'; CX.font = '700 20px Rubik, Tahoma'; CX.textAlign = 'center'; CX.fillText('سعود — مستشار GRC الذكي', W * 0.68, H * 0.46 + 240); CX.fillStyle = '#5B6476'; CX.font = '500 12px Rubik, Tahoma'; CX.fillText(ST.speaking ? '🔊 يتحدث' : ST.listening ? '👂 يستمع إليك' : 'جاهز', W * 0.68, H * 0.46 + 264);
    // مقياس النضج
    const px = 28, py = 70, pw = 300; CX.fillStyle = 'rgba(255,255,255,.08)'; rr(px, py, pw, 330, 14); CX.fill(); CX.fillStyle = '#E2B85A'; CX.font = '700 16px Rubik, Tahoma'; CX.textAlign = 'right'; CX.fillText('مقياس النضج الحي', px + pw - 14, py + 12);
    ctx.COMP.forEach((c, i) => { const y = py + 46 + i * 68, v = ST.meter[c.k] || 0; CX.fillStyle = '#fff'; CX.font = '600 14px Rubik, Tahoma'; CX.fillText(`${c.ar} · ${c.en}`, px + pw - 14, y); CX.fillStyle = 'rgba(255,255,255,.15)'; rr(px + 14, y + 24, pw - 28, 12, 6); CX.fill(); if (v) { CX.fillStyle = HEX[c.k]; rr(px + 14, y + 24, (pw - 28) * v / 5, 12, 6); CX.fill(); } CX.fillStyle = '#D9C9A4'; CX.font = '500 12px Rubik, Tahoma'; CX.fillText(v ? `${v.toFixed(1)} / 5 — ${ctx.lvName(v)}` : 'بانتظار إجابتك…', px + pw - 14, y + 40); });
    const vals = Object.values(ST.meter); const ov = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; CX.fillStyle = '#E2B85A'; CX.font = '800 30px Montserrat, Arial'; CX.direction = 'ltr'; CX.textAlign = 'center'; CX.fillText(ov ? ov.toFixed(1) : '—', px + pw / 2, py + 330 - 40); CX.direction = 'rtl';
    // كاميرا المستخدم
    const cw = 300, ch = 200, cxp = 28, cyp = H - ch - 92;
    CX.fillStyle = '#000'; rr(cxp, cyp, cw, ch, 14); CX.fill();
    if (camVideo && camVideo.readyState >= 2) { CX.save(); rr(cxp, cyp, cw, ch, 14); CX.clip(); const vr = camVideo.videoWidth / camVideo.videoHeight || 1.5; let dw = cw, dh = cw / vr; if (dh < ch) { dh = ch; dw = ch * vr; } CX.translate(cxp + cw, 0); CX.scale(-1, 1); CX.drawImage(camVideo, (cw - dw) / 2, cyp + (ch - dh) / 2, dw, dh); CX.restore(); }
    else { CX.fillStyle = '#5B6476'; CX.font = '500 14px Rubik, Tahoma'; CX.textAlign = 'center'; CX.fillText('الكاميرا غير مفعّلة', cxp + cw / 2, cyp + ch / 2 - 8); }
    CX.strokeStyle = ST.listening ? '#22C55E' : 'rgba(255,255,255,.35)'; CX.lineWidth = 3; rr(cxp, cyp, cw, ch, 14); CX.stroke();
    CX.fillStyle = 'rgba(10,27,61,.85)'; rr(cxp + 8, cyp + ch - 34, cw - 16, 26, 8); CX.fill(); CX.fillStyle = '#fff'; CX.font = '600 13px Rubik, Tahoma'; CX.textAlign = 'right'; CX.fillText((ST.name || 'المتدرب') + ' · ' + (S().p.name || 'الجهة'), cxp + cw - 16, cyp + ch - 29);
    // مستوى الصوت
    if (analyser) { const d = new Uint8Array(analyser.frequencyBinCount); analyser.getByteTimeDomainData(d); let s = 0; for (let i = 0; i < d.length; i++) { const v = (d[i] - 128) / 128; s += v * v; } ST.vol = Math.min(1, Math.sqrt(s / d.length) * 6); for (let i = 0; i < 12; i++) { CX.fillStyle = i / 12 < ST.vol ? '#22C55E' : 'rgba(255,255,255,.15)'; CX.fillRect(cxp + cw + 10, cyp + ch - 8 - i * 16, 8, 12); } }
    // الترجمة
    const lines = wrap(ST.sub || '', W - 420, '600 24px Rubik, Tahoma'); const sh = Math.max(64, 26 + lines.length * 34);
    CX.fillStyle = ST.subWho === 'ai' ? 'rgba(255,255,255,.96)' : 'rgba(226,184,90,.96)'; rr(360, H - sh - 24, W - 388, sh, 16); CX.fill();
    CX.fillStyle = '#0A1B3D'; CX.font = '600 24px Rubik, Tahoma'; CX.textAlign = 'right'; lines.forEach((l, i) => CX.fillText(l, W - 48, H - sh - 24 + 14 + i * 34));
    if (recording) { CX.fillStyle = '#EF4444'; CX.beginPath(); CX.arc(W - 40, 70, 8, 0, Math.PI * 2); CX.fill(); CX.font = '700 12px Montserrat, Arial'; CX.direction = 'ltr'; CX.textAlign = 'right'; CX.fillStyle = '#fff'; CX.fillText('REC', W - 54, 63); CX.direction = 'rtl'; }
    raf = requestAnimationFrame(frame);
  }

  /* ───── الكاميرا والمايك والتسجيل ───── */
  async function startCam() {
    try { cam = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true }); camVideo = document.createElement('video'); camVideo.srcObject = cam; camVideo.muted = true; camVideo.playsInline = true; await camVideo.play(); const AC = window.AudioContext || window.webkitAudioContext; if (AC) { const ac = new AC(); const src = ac.createMediaStreamSource(cam); analyser = ac.createAnalyser(); analyser.fftSize = 512; src.connect(analyser); } host.querySelector('#lvCam').textContent = '📷 الكاميرا تعمل'; return true; }
    catch (e) { host.querySelector('#lvCam').textContent = '📷 تعذّر تشغيل الكاميرا — اسمح بالوصول من المتصفح'; return false; }
  }
  function stopCam() { if (cam) cam.getTracks().forEach(t => t.stop()); cam = null; camVideo = null; analyser = null; }
  function startRec() {
    if (!CV.captureStream || !window.MediaRecorder) { ctx.note('المتصفح لا يدعم التسجيل — استخدم Chrome أو Edge.'); return; }
    const stream = CV.captureStream(30); if (cam) cam.getAudioTracks().forEach(t => stream.addTrack(t));
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || '';
    chunks = []; rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3e6 } : undefined);
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => { recording = false; const blob = new Blob(chunks, { type: 'video/webm' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `TrackFord_Live_Interview_${(S().p.name || 'org').replace(/\s+/g, '_')}.webm`; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); host.querySelector('#lvRec').textContent = '⏺ تسجيل المقابلة'; ctx.note('تم تنزيل فيديو المقابلة (صورتك وصوتك مع المستشار). صوت المستشار يُسمع من السماعات أثناء المقابلة.'); };
    recording = true; rec.start(500); host.querySelector('#lvRec').textContent = '⏹ إيقاف التسجيل';
  }
  function stopRec() { try { rec && rec.stop(); } catch (e) {} }

  function mount(c, h) {
    ctx = c; host = h;
    host.innerHTML = `<div class="lv-wrap"><div class="lv-main"><canvas id="lvCanvas" width="1280" height="720" aria-label="المقابلة الحية"></canvas>
      <div class="lv-ctl"><button class="btn gold" id="lvStart">▶ ابدأ المقابلة</button><button class="btn" id="lvRec">⏺ تسجيل المقابلة</button><button class="btn ghost" id="lvCamBtn">📷 تشغيل الكاميرا</button><button class="btn ghost" id="lvStop">⏹ إنهاء</button><span class="note" id="lvCam">الكاميرا غير مفعّلة</span></div>
      <div class="lv-pres"><b>المقدّم:</b> <button class="btn ghost" data-mode="draw">🧑‍💼 شخصية مرسومة</button><button class="btn ghost" data-mode="photo">🖼 صورة حقيقية</button><button class="btn ghost" data-mode="video">🎥 فيديو حقيقي</button> <label class="btn ghost" style="cursor:pointer">رفع صورة<input type="file" id="lvFace" accept="image/*" hidden></label><button class="btn ghost" id="lvRecTalk">⏺ سجّل مقطع التحدث (8 ث)</button><button class="btn ghost" id="lvRecIdle">⏺ سجّل مقطع الاستماع (8 ث)</button><label class="btn ghost" style="cursor:pointer">رفع مقطع تحدث<input type="file" id="lvUpTalk" accept="video/*" hidden></label><label class="btn ghost" style="cursor:pointer">رفع مقطع استماع<input type="file" id="lvUpIdle" accept="video/*" hidden></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px"><input type="checkbox" id="lvMsa" style="width:auto"> نطق بالفصحى (أوضح مع أصوات المتصفح)</label><span class="note" id="lvClipSt"></span></div>
      <div class="note">💡 لمقدّم يبدو شخصًا حقيقيًا: اختر «فيديو حقيقي» وسجّل مقطعين من كاميرتك (8 ثوانٍ تتكلّم بصمت + 8 ثوانٍ تستمع وتومئ) — تُحفظ في المتصفح ويُعرض مقطع التحدث كلما نطق المستشار ومقطع الاستماع عندما يسمعك.</div>
      <div class="lv-in"><span id="lvMic" class="lv-mic">🎙️</span><input id="lvIn" placeholder="تكلّم بصوتك… أو اكتب هنا إن لم يعمل المايك"><button class="btn" id="lvSend" disabled>إرسال</button></div>
      <div class="note">يعمل التعرف الصوتي والصوت العربي بأفضل جودة في Microsoft Edge على ويندوز (صوت «Naayf» السعودي) وفي Chrome على أندرويد. يمكنك دائمًا الكتابة بدل الكلام.</div></div>
      <div class="card lv-side"><h3 style="margin:0 0 8px">نص المقابلة</h3><div class="lv-log" id="lvLog"><div class="note">اضغط «ابدأ المقابلة» — سعود سيرحّب بك ويبدأ الأسئلة.</div></div></div></div>`;
    CV = host.querySelector('#lvCanvas'); CX = CV.getContext('2d');
    if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
    host.querySelector('#lvStart').onclick = async () => { if (ST.started) return; if (!cam) await startCam(); run(); };
    host.querySelector('#lvCamBtn').onclick = startCam;
    host.querySelector('#lvRec').onclick = () => recording ? stopRec() : startRec();
    host.querySelector('#lvStop').onclick = () => { try { speechSynthesis.cancel(); } catch (e) {} ST.started = false; ST.listening = false; try { SRi && SRi.stop(); } catch (e) {} if (recording) stopRec(); ST.sub = 'انتهت المقابلة.'; };
    host.querySelector('#lvFace').onchange = async e => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { ST.face = im; ST.mode = 'photo'; updModeUI(); }; im.src = URL.createObjectURL(f); await DB.set('face', f); };
    host.querySelector('#lvUpTalk').onchange = async e => { const f = e.target.files[0]; if (!f) return; await DB.set('talk', f); setClip('talk', f); updModeUI(); };
    host.querySelector('#lvUpIdle').onchange = async e => { const f = e.target.files[0]; if (!f) return; await DB.set('idle', f); setClip('idle', f); updModeUI(); };
    host.querySelector('#lvRecTalk').onclick = () => recordClip('talk'); host.querySelector('#lvRecIdle').onclick = () => recordClip('idle');
    host.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { if (b.dataset.mode === 'video' && !ST.clips.talk) { ctx.note('سجّل أو ارفع مقطع التحدث أولًا.'); return; } if (b.dataset.mode === 'photo' && !ST.face) { ctx.note('ارفع صورة أولًا.'); return; } ST.mode = b.dataset.mode; updModeUI(); });
    host.querySelector('#lvMsa').onchange = e => { ST.msa = e.target.checked; };
    loadClips().then(updModeUI); updModeUI();
    if (raf) cancelAnimationFrame(raf); ST.nextBlink = performance.now() + 1500; raf = requestAnimationFrame(frame);
  }
  function unmount() { if (raf) cancelAnimationFrame(raf); raf = null; stopCam(); try { speechSynthesis.cancel(); } catch (e) {} }
  const css = document.createElement('style'); css.textContent = `.lv-wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px}@media(max-width:900px){.lv-wrap{grid-template-columns:1fr}}#lvCanvas{width:100%;height:auto;aspect-ratio:16/9;display:block;border-radius:12px;background:#0A1B3D}.lv-ctl,.lv-pres{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}.lv-pres{background:var(--chip,#F3EBDA);border-radius:12px;padding:8px 10px;font-size:13px}.lv-pres .btn{padding:6px 12px;font-size:12.5px}.lv-in{display:flex;gap:8px;align-items:center;margin-top:10px}.lv-in input{flex:1}.lv-mic{font-size:22px;opacity:.4}.lv-mic.on{opacity:1;animation:lvp 1s infinite}@keyframes lvp{50%{transform:scale(1.25)}}.lv-log{max-height:560px;overflow:auto;display:grid;gap:8px;font-size:14px}.lv-t{padding:8px 10px;border-radius:10px;background:var(--chip,#F3EBDA);border-inline-start:4px solid #C9973B}.lv-t.ai{background:var(--goldsoft,#F6EEDC);border-color:#0A1B3D}.lv-t b{display:block;font-size:12px;color:var(--muted,#5B6476)}`; document.head.appendChild(css);
  function resume() { if (CV && !raf) raf = requestAnimationFrame(frame); }
  window.TFLive = { mount, unmount, resume, state: ST };
})();
