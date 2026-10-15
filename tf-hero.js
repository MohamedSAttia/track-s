/* Track Ford GRC — صورة ديناميكية لواجهة البوابة بدل الصورة الشخصية
   مدار GRC متحرك: درع تراكفورد في المركز، المكوّنات الأربعة تدور حوله، والعناصر العشرون تتلألأ على المدار الخارجي.
   تصميم وبرمجة وإعداد: د. محمد عطية */
(function () {
  'use strict';
  const NODES = [['تعلّم', 'LEARN', '#3B82F6'], ['مواءمة', 'ALIGN', '#E2B85A'], ['تنفيذ', 'PERFORM', '#22C55E'], ['مراجعة', 'REVIEW', '#A855F7']];
  function svg() {
    const cx = 200, cy = 210, R1 = 150, R2 = 118, R3 = 182;
    const dots = Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2 - Math.PI / 2; return `<circle class="tw" cx="${(cx + R3 * Math.cos(a)).toFixed(1)}" cy="${(cy + R3 * Math.sin(a)).toFixed(1)}" r="${i % 5 === 0 ? 4 : 2.6}" style="animation-delay:${(i * 0.17).toFixed(2)}s"/>`; }).join('');
    const nodes = NODES.map((n, i) => { const a = i / 4 * 360; return `<g transform="rotate(${a} ${cx} ${cy})"><g transform="translate(${cx} ${cy - R1})"><g class="up" style="--a:${-a}deg"><circle r="31" fill="${n[2]}" fill-opacity=".16" stroke="${n[2]}" stroke-width="2"/><circle r="24" fill="#0A1B3D" stroke="${n[2]}" stroke-width="1.5"/><text y="-1" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${n[0]}</text><text y="12" text-anchor="middle" font-size="7" font-weight="700" letter-spacing="1.2" fill="${n[2]}">${n[1]}</text></g></g></g>`; }).join('');
    return `<svg viewBox="0 0 400 420" role="img" aria-label="منظومة الحوكمة والمخاطر والامتثال المتكاملة — تراكفورد" font-family="Rubik, Tahoma, sans-serif">
<defs><radialGradient id="tfhG" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#E2B85A" stop-opacity=".38"/><stop offset=".45" stop-color="#13295A" stop-opacity=".25"/><stop offset="1" stop-color="#0A1B3D" stop-opacity="0"/></radialGradient>
<linearGradient id="tfhGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2D584"/><stop offset=".5" stop-color="#C9973B"/><stop offset="1" stop-color="#8C6A2B"/></linearGradient>
<linearGradient id="tfhShield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13295A"/><stop offset="1" stop-color="#06122B"/></linearGradient></defs>
<circle cx="${cx}" cy="${cy}" r="200" fill="url(#tfhG)" class="glow"/>
<g class="spin s1"><circle cx="${cx}" cy="${cy}" r="${R3}" fill="none" stroke="#E2B85A" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="2 9"/>${dots}</g>
<g class="spin s2"><ellipse cx="${cx}" cy="${cy}" rx="${R2 + 40}" ry="${R2 - 40}" fill="none" stroke="#E2B85A" stroke-opacity=".28" stroke-width="1.2"/><circle cx="${cx + R2 + 40}" cy="${cy}" r="3.5" fill="#F2D584"/></g>
<g class="spin s3"><ellipse cx="${cx}" cy="${cy}" rx="${R2 - 40}" ry="${R2 + 40}" fill="none" stroke="#9FB7E8" stroke-opacity=".25" stroke-width="1.2"/><circle cx="${cx}" cy="${cy - R2 - 40}" r="3" fill="#9FB7E8"/></g>
<circle cx="${cx}" cy="${cy}" r="${R1}" fill="none" stroke="url(#tfhGold)" stroke-width="2" stroke-opacity=".8"/>
<g class="spin s4">${nodes}</g>
<g class="pulse"><path d="M${cx} ${cy - 62} l50 18 v34 c0 34 -22 56 -50 68 c-28 -12 -50 -34 -50 -68 v-34 z" fill="url(#tfhShield)" stroke="url(#tfhGold)" stroke-width="3"/>
<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700" fill="url(#tfhGold)">TF</text>
<text x="${cx}" y="${cy + 30}" text-anchor="middle" font-size="10.5" font-weight="800" letter-spacing="3" fill="#E2B85A">GRC</text></g>
</svg>`;
  }
  const CSS = `.tfhero{position:absolute;inset:0 0 auto 0;width:100%;aspect-ratio:400/420;pointer-events:none;z-index:1}
.tfhero svg{width:100%;height:100%;display:block;overflow:visible}
.tfhero .spin{transform-box:view-box;transform-origin:200px 210px;animation:tfhSpin 60s linear infinite}
.tfhero .s1{animation-duration:90s}.tfhero .s2{animation-duration:22s}.tfhero .s3{animation-duration:30s;animation-direction:reverse}.tfhero .s4{animation-duration:48s}
.tfhero .up{transform-box:fill-box;transform-origin:center;animation:tfhUp 48s linear infinite}
.tfhero .tw{fill:#F2D584;animation:tfhTw 3.4s ease-in-out infinite}
.tfhero .pulse{transform-box:fill-box;transform-origin:center;animation:tfhPulse 3.2s ease-in-out infinite}
.tfhero .glow{animation:tfhGlow 5s ease-in-out infinite}
.tfhero .beat path{stroke-dasharray:420;stroke-dashoffset:420;animation:tfhBeat 3.6s ease-in-out infinite}
@keyframes tfhSpin{to{transform:rotate(360deg)}}
@keyframes tfhUp{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a) - 360deg))}}
@keyframes tfhTw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes tfhPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes tfhGlow{0%,100%{opacity:.75}50%{opacity:1}}
@keyframes tfhBeat{0%{stroke-dashoffset:420}55%{stroke-dashoffset:0}100%{stroke-dashoffset:-420}}
@media (prefers-reduced-motion:reduce){.tfhero *{animation:none!important}.tfhero .beat path{stroke-dashoffset:0}}`;
  function mount() {
    const imgs = document.querySelectorAll('.art img.man, img.man');
    if (!imgs.length) return;
    if (!document.getElementById('tfHeroCss')) { const st = document.createElement('style'); st.id = 'tfHeroCss'; st.textContent = CSS; document.head.appendChild(st); }
    imgs.forEach(img => {
      const host = img.parentElement; if (!host || host.querySelector('.tfhero')) { img.remove(); return; }
      const d = document.createElement('div'); d.className = 'tfhero'; d.innerHTML = svg(); host.insertBefore(d, img); img.remove();
      host.querySelectorAll('img.globe').forEach(g => { g.style.opacity = '.35'; });
      host.querySelectorAll('.ring').forEach(r => { r.style.display = 'none'; });
    });
  }
  window.TFHero = { mount, svg };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mount) : mount();
})();
