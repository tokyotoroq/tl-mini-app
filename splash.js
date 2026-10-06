// Заставка TL: колесо удачи + эскизный круг + падающие лепестки,
// затем появляется «TL», из которого «вытекает» «ЛИЧНЫЙ КАБИНЕТ».
// Показывается при каждом открытии мини-приложения (~4,3 с).
(function () {
    const splash = document.getElementById("splash");
    if (!splash) return;

    const SHOW_MS = 4700;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { splash.remove(); document.body.classList.add("app-ready"); return; }

    let seed = 5;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const C = 115;
    const P = (r, a) => { a = (a - 90) * Math.PI / 180; return [+(C + r * Math.cos(a)).toFixed(2), +(C + r * Math.sin(a)).toFixed(2)]; };
    const arc = (r, a, b) => { const p = P(r, a), q = P(r, b); return `M${p[0]} ${p[1]} A${r} ${r} 0 ${(b - a) > 180 ? 1 : 0} 1 ${q[0]} ${q[1]}`; };
    const ds = (du, dl) => `stroke-dasharray:100 200;stroke-dashoffset:100;animation:sp-draw ${du}s ease-out ${dl}s forwards`;
    const INK = "#1a1414";

    const defs = `<svg width="0" height="0" style="position:absolute"><defs>
      <linearGradient id="sp-pg1" x1="0" y1="0" x2="0" y2="-14" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#b3121c"/><stop offset=".55" stop-color="#d9636c"/><stop offset="1" stop-color="#f2c4c7"/></linearGradient>
      <linearGradient id="sp-pg2" x1="0" y1="0" x2="0" y2="-14" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c94a55"/><stop offset=".6" stop-color="#e48f97"/><stop offset="1" stop-color="#f0b3b8"/></linearGradient>
      <linearGradient id="sp-pg3" x1="0" y1="0" x2="0" y2="-14" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8f0f17"/><stop offset=".6" stop-color="#b3121c"/><stop offset="1" stop-color="#d9636c"/></linearGradient>
      <filter id="sp-ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>
      <filter id="sp-wash" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.5 1.2" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>
    </defs></svg>`;

    // эскизный круг: полный, с недорисованными местами
    function sketchRing(r) {
        let o = `<g filter="url(#sp-ink)" fill="none" stroke="${INK}" stroke-linecap="round">`;
        [[-4, 118, 1.6], [124, 232, 1.5], [236, 352, 1.7]].forEach(([a, b, w], i) => {
            o += `<path d="${arc(r, a, b)}" pathLength="100" stroke-width="${w}" style="${ds(.45, .15 + i * .35)}"/>`;
        });
        [[40, 170, .6, r + 2.2], [200, 330, .55, r - 2], [300, 385, .5, r + 1.4]].forEach(([a, b, w, rr], i) => {
            o += `<path d="${arc(rr, a, b)}" pathLength="100" stroke-width="${w}" opacity=".55" style="${ds(.5, .6 + i * .3)}"/>`;
        });
        return o + "</g>";
    }

    const ICON = {
        gift: (x, y) => `<g transform="translate(${x} ${y}) scale(1.25)" fill="none" stroke="${INK}" stroke-width="1" stroke-linejoin="round"><rect x="-6" y="-3" width="12" height="9" fill="#f4efe6"/><rect x="-7" y="-6" width="14" height="3.5" fill="#f4efe6"/><path d="M0 -6V6M0 -6c-2-4-6-3-4 0M0 -6c2-4 6-3 4 0"/></g>`,
        ticket: (x, y) => `<g transform="translate(${x} ${y}) scale(1.25)" fill="#f4efe6" stroke="${INK}" stroke-width="1"><path d="M-8 -4.5h16v3a1.6 1.6 0 0 0 0 3v3h-16v-3a1.6 1.6 0 0 0 0-3Z"/><path d="M-2 -4.5v9" stroke-dasharray="1.2 1.2"/></g>`,
        star: (x, y) => `<g transform="translate(${x} ${y}) scale(1.25)"><path d="M0 -7 2 -2.2 7 -2 3 1.2 4.4 6.4 0 3.4 -4.4 6.4 -3 1.2 -7 -2 -2 -2.2Z" fill="#f4efe6" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/></g>`
    };

    // колесо: 8 секторов, в центре монета с квадратным отверстием
    function wheel() {
        const R = 86, vals = ["FREE", "X2", "gift", "500", "FREE", "star", "ticket", "X3"];
        let o = '<g class="sp-spin">';
        for (let k = 0; k < 8; k++) {
            const a = k * 45 - 22.5, b = a + 45, red = k % 2 === 0;
            const d = `M${C} ${C} L${P(R, a)} A${R} ${R} 0 0 1 ${P(R, b)} Z`;
            o += `<path d="${d}" fill="${red ? "#c42a34" : (k % 4 === 1 ? "#f4efe6" : "#e9d9c4")}" opacity="${red ? .9 : 1}" filter="url(#sp-wash)"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="1" filter="url(#sp-ink)"/>`;
            const ip = P(63, k * 45), val = vals[k];
            const inner = ICON[val] ? ICON[val](ip[0], ip[1])
                : `<text x="${ip[0]}" y="${ip[1] + 5}" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${val.length > 3 ? 12 : 14}" letter-spacing="${val.length > 3 ? .8 : 0}" text-anchor="middle" fill="${red ? "#f4efe6" : INK}">${val}</text>`;
            o += `<g transform="rotate(${k * 45} ${ip[0]} ${ip[1]})">${inner}</g>`;
        }
        o += `<g filter="url(#sp-ink)"><circle cx="${C}" cy="${C}" r="36" fill="#e2c9a0" stroke="${INK}" stroke-width="1.6"/><circle cx="${C}" cy="${C}" r="31" fill="none" stroke="${INK}" stroke-width=".7"/>
          <rect x="${C - 8.5}" y="${C - 8.5}" width="17" height="17" fill="#ecebe7" stroke="${INK}" stroke-width="1.5"/>
          ${["福", "運", "当", "券"].map((ch, i) => { const p = P(21, i * 90); return `<text x="${p[0]}" y="${p[1] + 4.5}" font-family="Noto Serif CJK JP, Hiragino Mincho ProN, Yu Mincho, serif" font-weight="900" font-size="12" text-anchor="middle" fill="${INK}">${ch}</text>`; }).join("")}</g>`;
        return o + "</g>";
    }
    const pointer = `<g class="sp-pointer" filter="url(#sp-ink)"><path d="M${C} 30 L${C - 9} 10 Q${C} 4 ${C + 9} 10Z" fill="#b3121c" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="${C}" cy="11" r="2.2" fill="${INK}"/></g>`;

    const PETAL = "M0 0 C-4 -3 -5.6 -10 -2.3 -14 Q-1 -13.2 0 -12.2 Q1 -13.2 2.3 -14 C5.6 -10 4 -3 0 0Z";
    const petal = (g) => `<svg viewBox="-7 -15 14 16"><path d="${PETAL}" fill="url(#${g})"/><path d="M0 -.8 Q-.4 -6 0 -11" fill="none" stroke="#8f0f17" stroke-width=".35" opacity=".35"/></svg>`;

    splash.innerHTML = `${defs}<div class="sp-layer" id="sp-back"></div>
      <div class="sp-wrap">
        <div class="sp-mark"><svg viewBox="0 0 230 230">${sketchRing(104)}${wheel()}${pointer}</svg></div>
        <div class="sp-title" id="sp-title"></div>
        <div class="sp-sub" lang="ja">個人アカウント</div>
      </div>
      <div class="sp-layer sp-front" id="sp-front"></div>`;

    // лепестки
    const back = splash.querySelector("#sp-back"), front = splash.querySelector("#sp-front");
    for (let i = 0; i < 30; i++) {
        const big = rnd() < .08, s = big ? 26 + rnd() * 6 : 12 + rnd() * 10, g = ["sp-pg1", "sp-pg2", "sp-pg2", "sp-pg3"][Math.floor(rnd() * 4)];
        const el = `<div class="sp-petal" style="left:${(rnd() * 110 - 5).toFixed(1)}%;--s:${s.toFixed(1)}px;--d:${(big ? 3.2 : 4.5 + rnd() * 2.5).toFixed(2)}s;--dl:${(.1 + rnd() * 2.6).toFixed(2)}s;--dx:${((rnd() - .2) * 200).toFixed(0)}px;--r:${(rnd() * 360).toFixed(0)}deg;--sw:${(.9 + rnd()).toFixed(2)}s">${petal(g)}</div>`;
        (big ? front : back).insertAdjacentHTML("beforeend", el);
    }

    // надпись: «ЛИЧНЫЙ» / «КАБИНЕТ» одной ширины и высоты, «TL» — на высоту двух строк
    const F = [["Manrope", 600], ["IBM Plex Sans", 500], ["Inter", 800]];
    function buildTitle() {
        const box = splash.querySelector("#sp-title");
        const cv = document.createElement("canvas").getContext("2d");
        const cap = (f, w, t) => { cv.font = `${w} 100px '${f}', Arial, sans-serif`; return cv.measureText(t).actualBoundingBoxAscent || 72; };
        const h = 13, g = h * .5, H = 2 * h + g, GX = h * .6;
        const s1 = h * 100 / cap(F[0][0], F[0][1], "НКБ"), s2 = h * 100 / cap(F[1][0], F[1][1], "НКБ"), s3 = H * 100 / cap(F[2][0], F[2][1], "TL");
        box.innerHTML = `<div class="sp-flow"><svg class="sp-lines" overflow="visible">
            <text class="sp-l1" y="${h}" font-family="${F[0][0]}" font-weight="${F[0][1]}" font-size="${s1.toFixed(2)}" fill="#111">ЛИЧНЫЙ</text>
            <text class="sp-l2" y="${H}" font-family="${F[1][0]}" font-weight="${F[1][1]}" font-size="${s2.toFixed(2)}" fill="#111">КАБИНЕТ</text></svg></div>
          <svg class="sp-tl" overflow="visible"><text y="${H}" font-family="${F[2][0]}" font-weight="${F[2][1]}" font-size="${s3.toFixed(2)}" fill="#111">TL</text></svg>`;
        const lines = box.querySelector(".sp-lines"), t1 = lines.querySelector(".sp-l1"), t2 = lines.querySelector(".sp-l2");
        const b1 = t1.getBBox(), b2 = t2.getBBox(), WL = Math.max(b1.width, b2.width) * 1.04;
        t1.setAttribute("letter-spacing", ((WL - b1.width) / 5).toFixed(2));
        t2.setAttribute("letter-spacing", ((WL - b2.width) / 6).toFixed(2));
        t1.setAttribute("x", -b1.x); t2.setAttribute("x", -b2.x);
        lines.style.width = WL.toFixed(1) + "px"; lines.style.height = H.toFixed(1) + "px";
        const tl = box.querySelector(".sp-tl"), tt = tl.querySelector("text"), b3 = tt.getBBox();
        tt.setAttribute("x", -b3.x); tl.style.width = b3.width.toFixed(1) + "px"; tl.style.height = H.toFixed(1) + "px";
        box.style.setProperty("--H", H.toFixed(1) + "px");
        box.style.setProperty("--FW", (WL + GX).toFixed(1) + "px");
        box.style.setProperty("--GX", GX.toFixed(1) + "px");
    }
    const loads = F.map(([f, w]) => document.fonts ? document.fonts.load(`${w} 20px '${f}'`, "ЛИЧНЫЙКАБИНЕТTL") : Promise.resolve());
    Promise.race([Promise.all(loads), new Promise(r => setTimeout(r, 1500))]).then(start, start);
    function start() { try { buildTitle(); } catch (e) {} setTimeout(hide, SHOW_MS); }

    function hide() {
        if (splash.classList.contains("is-hiding")) return;
        splash.classList.add("is-hiding");
        document.body.classList.add("app-ready");
        setTimeout(() => splash.remove(), 700);
    }
    setTimeout(hide, SHOW_MS + 2500);
})();
