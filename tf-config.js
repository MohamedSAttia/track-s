/* Track Ford GRC — عنوان الخادم الحيّ (Railway). كل طلبات المنصّة تذهب إلى هذا الخادم المشترك،
   فتعمل المتابعة اللحظية والتسجيل والإشعارات من أي جهاز وحتى لو فُتحت الملفات محليًا.
   لتغيير الخادم لاحقًا (مثلاً إلى نطاقك الخاص): عدّل القيمة التالية فقط. اتركها فارغة '' لاستخدام نفس أصل الصفحة. */
window.TF_API_BASE = 'https://trackford-api-production.up.railway.app';

/* الشهادات والإفادات المعتمدة (Track Ford Certification) — يُحمَّل تلقائيًا في كل الصفحات */
(function () { try {
  var me = document.currentScript && document.currentScript.src; var base = me ? me.replace(/tf-config\.js.*$/, '') : '';
  /* إخفاء الصورة الشخصية فورًا واستبدالها بصورة ديناميكية (tf-hero.js) */
  var st = document.createElement('style'); st.textContent = '.art img.man{visibility:hidden!important}'; (document.head || document.documentElement).appendChild(st);
  ['tf-hero.js', 'tf-cert.js'].forEach(function (f) { var s = document.createElement('script'); s.src = base + f; s.defer = true; (document.head || document.documentElement).appendChild(s); });
} catch (e) {} })();
