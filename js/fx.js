/*
 * 영상 자리와 대체 연출.
 * Media.play(): 코스 데이터의 영상 파일이 있으면 그 영상을, 없거나 3초 안에 열리지 않으면
 * 같은 내용을 CSS·SVG 애니메이션으로 연출한다 (STORY-05, E9).
 */
(function () {
  const C = window.ART.colors;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 300) : ms));

  /* ---------- 활자 입체 블록 ---------- */
  function typeBlock(hanja, opts = {}) {
    const cls = ['tb', opts.spin ? 'tb--spin' : '', opts.float ? 'tb--float' : '', opts.cls || ''].join(' ');
    return `<div class="${cls}" style="--s:${opts.size || 120}px"><div class="tb-in">
      <i class="tb-f tb-front"><b>${hanja}</b></i><i class="tb-f tb-back"><b>${hanja}</b></i>
      <i class="tb-f tb-left"></i><i class="tb-f tb-right"></i><i class="tb-f tb-top"></i><i class="tb-f tb-bottom"></i>
    </div></div>`;
  }

  /* ---------- 영상 파일 확인 (세션마다 한 번) ---------- */
  const known = {};
  function hasVideo(path) {
    if (!path) return Promise.resolve(false);
    if (known[path]) return known[path];
    let cached = null;
    try { cached = sessionStorage.getItem('vid:' + path); } catch (e) { cached = null; }
    if (cached) return (known[path] = Promise.resolve(cached === '1'));
    if (location.protocol === 'file:') return (known[path] = Promise.resolve(false));
    known[path] = fetch(path, { method: 'HEAD', cache: 'no-store' })
      .then((r) => r.ok && (r.headers.get('content-type') || '').indexOf('video') === 0)
      .catch(() => false)
      .then((ok) => { try { sessionStorage.setItem('vid:' + path, ok ? '1' : '0'); } catch (e) { /* 저장 불가 */ } return ok; });
    return known[path];
  }
  function preload(paths) { paths.filter(Boolean).forEach((p) => hasVideo(p)); }

  /* ---------- 이미지 확인 (한 번 받아 두고 재사용). 3초 안에 안 열리면 대체 연출 ---------- */
  const pics = {};
  function hasImage(path) {
    if (!path) return Promise.resolve(null);
    if (pics[path]) return pics[path];
    pics[path] = new Promise((res) => {
      const img = new Image();
      const t = setTimeout(() => res(null), 3000);
      img.onload = () => {
        clearTimeout(t);
        let bg = '#0A0705';
        try {
          /* 아래 끝 줄의 평균색: 남는 아래쪽을 이 색으로 이어 칠한다 */
          const c = document.createElement('canvas');
          c.width = 32; c.height = 1;
          const x = c.getContext('2d');
          x.drawImage(img, 0, img.naturalHeight - 2, img.naturalWidth, 2, 0, 0, 32, 1);
          const d = x.getImageData(0, 0, 32, 1).data;
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
          bg = `rgb(${Math.round(r / 32)},${Math.round(g / 32)},${Math.round(b / 32)})`;
        } catch (e) { /* 파일로 열면 색을 읽을 수 없다: 기본 먹색 */ }
        res({ src: path, w: img.naturalWidth, h: img.naturalHeight, bg });
      };
      img.onerror = () => { clearTimeout(t); res(null); };
      img.src = path;
    });
    pics[path].then((ok) => { if (!ok) delete pics[path]; });
    return pics[path];
  }
  function preloadImage(path) { if (path) hasImage(path); }

  /* 정지 그림 위에 느린 확대·빛 번짐·금빛 입자 */
  const picLayer = (p, cls = '') => `<div class="fx fx-pic${cls}" style="--bg:${p.bg};--ar:${p.w / p.h}">
      <div class="fx-pic-frame"><img class="fx-pic-img" src="${p.src}" alt="">
        <div class="fx-pic-bloom"></div>
        <div class="fx-pic-dust">${Array.from({ length: 16 }, (_, i) => `<i style="--x:${(i * 41 + 7) % 92 + 4}%;--y:${(i * 23) % 50 + 12}%;--t:${7 + (i % 5) * 1.6}s;--dl:${-(i * 1.3)}s;--z:${2 + (i % 3)}px"></i>`).join('')}</div>
      </div></div>`;
  function picture(el, p) { el.innerHTML = picLayer(p); }

  /* 그림이 떠 있는 el에서 다른 그림으로 겹쳐 바꾼다 (이야기 그림 여러 장).
   * 영상·대체 연출 중이거나 새 그림이 안 열리면 그대로 둔다. 마지막 요청만 반영 */
  async function swapImage(el, path) {
    const token = (el._picToken = (el._picToken || 0) + 1);
    const cur = el.querySelector('.fx-pic:last-child');
    if (!cur || !path) return;
    if (cur.querySelector('.fx-pic-img').getAttribute('src') === path) return;
    const p = await hasImage(path);
    if (!p || token !== el._picToken || !el.querySelector('.fx-pic')) return;
    const box = document.createElement('div');
    box.innerHTML = picLayer(p, ' fx-pic--in');
    const layer = box.firstElementChild;
    const img = layer.querySelector('img');
    try { if (img.decode) await img.decode(); } catch (e) { /* 디코드 실패: 그대로 붙인다 */ }
    if (token !== el._picToken) return;
    el.appendChild(layer);
    /* 겹치기가 끝나면 아래 깔린 그림만 지운다 (뒤에 온 그림은 남긴다) */
    const done = () => { if (layer.parentNode !== el) return; while (layer.previousElementSibling) layer.previousElementSibling.remove(); layer.classList.remove('fx-pic--in'); };
    layer.addEventListener('animationend', (e) => { if (e.target === layer) done(); });
    setTimeout(done, 900);
  }

  /* 영상 → 이미지 → 대체 연출 순으로 el 안에 재생. 끝나면 resolve.
   * 이미지는 hold(ms)만큼 기다린 뒤 resolve (기본 0). */
  async function play(el, { video, image, scene, opts = {}, loop = false, hold = 0 }) {
    el.innerHTML = '';
    el.classList.add('media');
    const ok = await hasVideo(video);
    if (ok) {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      v.className = 'media-video'; v.src = video; if (loop) v.loop = true;
      el.appendChild(v);
      const opened = await new Promise((res) => {
        const t = setTimeout(() => res(false), 3000);
        v.addEventListener('canplay', () => { clearTimeout(t); res(true); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(t); res(false); }, { once: true });
      });
      if (opened) {
        const p = v.play(); if (p && p.catch) p.catch(() => {});
        if (loop) return;
        await new Promise((res) => { v.addEventListener('ended', res, { once: true }); setTimeout(res, 9000); });
        return;
      }
      el.innerHTML = '';
    }
    const pic = await hasImage(image);
    if (pic) {
      picture(el, pic);
      if (!loop && hold) await wait(hold);
      return;
    }
    const fn = SCENES[scene];
    const ms = fn ? fn(el, opts) : 0;
    if (!loop) await wait(ms);
  }

  /* ---------- 대체 연출 ---------- */
  const particles = (n, cls) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--i:${i};--r:${(i * 137.5) % 360}deg;--d:${0.6 + ((i * 7) % 5) / 10}"></i>`).join('');

  const SCENES = {
    opening(el) {
      const letters = ['直', '指', '心', '體', '要', '節'];
      el.innerHTML = `<div class="fx fx-opening">
        <div class="fx-night"></div>
        ${particles(28, 'fx-star')}
        <svg class="fx-op-temple" viewBox="0 0 400 160" aria-hidden="true">
          <path d="M0 160 V120 Q100 92 200 108 T400 100 V160Z" fill="#0E0C0A"/>
          <path d="M120 112 H280 L262 96 H138Z" fill="#0E0C0A"/><rect x="146" y="112" width="108" height="30" fill="#0E0C0A"/>
          <path d="M100 112 Q200 70 300 112" fill="none" stroke="#2A241D" stroke-width="3"/>
          <rect x="190" y="118" width="20" height="24" fill="${C.GOLD}" opacity=".55"/>
        </svg>
        <div class="fx-op-board">${letters.map((g, i) => `<div class="fx-op-slot" style="--i:${i}"><div class="fx-op-type" style="--i:${i}">${typeBlock(g, { size: 40 })}</div></div>`).join('')}</div>
      </div>`;
      return 7200;
    },

    /* 장소 이야기 */
    tools(el) {
      el.innerHTML = `<div class="fx fx-story fx-st-tools"><div class="fx-glow"></div>
        <svg viewBox="0 0 360 300" aria-hidden="true">
          <rect x="20" y="190" width="320" height="22" fill="#5A4330" stroke="${C.INK}" stroke-width="3"/>
          <g class="fx-st-knife"><path d="M70 186 L140 120" stroke="#C9C2B4" stroke-width="7" stroke-linecap="round"/><path d="M60 196 L84 172" stroke="#7A5A3A" stroke-width="14" stroke-linecap="round"/></g>
          <g class="fx-st-mallet"><rect x="236" y="120" width="70" height="34" rx="6" fill="#8B6A45" stroke="${C.INK}" stroke-width="3"/><path d="M270 154 V188" stroke="#7A5A3A" stroke-width="10" stroke-linecap="round"/></g>
          <path d="M40 186 H330" stroke="#000" stroke-opacity=".25" stroke-width="4"/>
        </svg>
        <div class="fx-st-row">${['要', '心', '節'].map((g, i) => `<div class="fx-st-bob" style="--i:${i}">${typeBlock(g, { size: 54 })}</div>`).join('')}</div>
      </div>`;
      return 6000;
    },
    temple(el) {
      el.innerHTML = `<div class="fx fx-story fx-st-temple"><div class="fx-glow"></div>
        <svg viewBox="0 0 360 300" aria-hidden="true">
          <path d="M0 230 Q90 200 180 214 T360 206 V300 H0Z" fill="#2A241D"/>
          <g class="fx-st-ghost" fill="none" stroke="${C.GOLD_HI}" stroke-width="2.5" stroke-linejoin="round">
            <path d="M70 140 Q180 96 290 140 L272 150 H88Z"/><path d="M96 150 V214 M140 150 V214 M220 150 V214 M264 150 V214"/><path d="M84 214 H276"/>
            <path d="M120 104 Q180 74 240 104 L228 110 H132Z"/><path d="M144 110 V132 M216 110 V132"/>
          </g>
          <g fill="#6E6150" stroke="${C.INK}" stroke-width="2.5">${[0, 1, 2, 3, 4].map((i) => `<rect x="${70 + i * 46}" y="222" width="34" height="14" rx="3"/><rect x="${82 + i * 46 - 20}" y="248" width="34" height="14" rx="3"/>`).join('')}</g>
        </svg></div>`;
      return 6000;
    },
    showcase(el) {
      el.innerHTML = `<div class="fx fx-story fx-st-case"><div class="fx-rays"></div>
        <svg viewBox="0 0 360 300" aria-hidden="true">
          <rect x="70" y="90" width="220" height="130" fill="#ffffff" fill-opacity=".06" stroke="#E9E2D2" stroke-width="3"/>
          <path d="M70 90 L110 60 H330 L290 90 M290 220 L330 190 V60" fill="none" stroke="#E9E2D2" stroke-width="3" opacity=".6"/>
          <rect x="60" y="220" width="240" height="26" fill="#3B3128" stroke="${C.INK}" stroke-width="3"/>
          <g class="fx-st-book"><path d="M110 196 Q180 170 180 186 Q180 170 250 196 V140 Q180 118 180 132 Q180 118 110 140Z" fill="${C.PAPER}" stroke="${C.INK}" stroke-width="3"/>
          <path d="M180 132 V186" stroke="${C.INK}" stroke-width="2"/><g stroke="${C.INK}" stroke-width="2" opacity=".55"><path d="M126 148 l40 -10 M126 160 l40 -10 M126 172 l40 -10 M194 138 l40 10 M194 150 l40 10 M194 162 l40 10"/></g></g>
          <path d="M84 104 L104 98 M84 118 L96 114" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
        </svg></div>`;
      return 6000;
    },
    pour(el) {
      el.innerHTML = `<div class="fx fx-story fx-st-pour"><div class="fx-glow fx-glow--hot"></div>
        <svg viewBox="0 0 360 300" aria-hidden="true">
          <g class="fx-st-crucible"><path d="M110 70 H200 L190 140 H120Z" fill="#4A3D31" stroke="${C.INK}" stroke-width="3"/><path d="M114 80 H196" stroke="${C.GOLD_HI}" stroke-width="7"/><path d="M200 74 L222 84" stroke="${C.INK}" stroke-width="6" stroke-linecap="round"/></g>
          <path class="fx-st-stream" d="M222 92 Q236 150 226 214" stroke="${C.GOLD_HI}" stroke-width="10" fill="none" stroke-linecap="round"/>
          <rect x="140" y="214" width="170" height="40" fill="#6E6150" stroke="${C.INK}" stroke-width="3"/>
          <g class="fx-st-cells">${[0, 1, 2, 3, 4].map((i) => `<rect x="${152 + i * 31}" y="222" width="22" height="22" fill="${C.GOLD}" stroke="${C.INK}" stroke-width="2" style="--i:${i}"/>`).join('')}</g>
        </svg>${particles(14, 'fx-spark')}</div>`;
      return 6000;
    },
    machine(el) {
      el.innerHTML = `<div class="fx fx-story fx-st-machine"><div class="fx-glow"></div>
        <div class="fx-st-blocks">${['活', '字', '印', '刷'].map((g, i) => `<div style="--i:${i}">${typeBlock(g, { size: 46 })}</div>`).join('')}</div>
        <svg class="fx-st-press" viewBox="0 0 360 300" aria-hidden="true">
          <g stroke="${C.INK}" stroke-width="3" stroke-linejoin="round"><rect x="110" y="60" width="18" height="170" fill="#7A5A3A"/><rect x="232" y="60" width="18" height="170" fill="#7A5A3A"/><rect x="100" y="48" width="160" height="18" fill="#2A241D"/>
          <rect x="170" y="66" width="20" height="44" fill="${C.GOLD}"/><rect x="138" y="110" width="84" height="16" fill="${C.GOLD_LO}"/><rect x="90" y="186" width="180" height="14" fill="#2A241D"/></g>
          <g class="fx-st-paper"><rect x="140" y="160" width="80" height="26" fill="${C.PAPER}" stroke="${C.INK}" stroke-width="3"/><path d="M150 168 h60 M150 176 h44" stroke="${C.INK}" stroke-width="2"/></g>
        </svg></div>`;
      return 6000;
    },
    world(el) {
      const dots = [];
      const land = [[3, 8, 6, 11], [9, 14, 4, 10], [14, 22, 3, 8], [16, 26, 8, 12], [22, 30, 5, 9], [5, 9, 12, 16], [26, 30, 12, 15]];
      for (let y = 0; y < 18; y++) for (let x = 0; x < 34; x++) {
        if (land.some(([x1, x2, y1, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2) && (x * 7 + y * 3) % 5 !== 0) dots.push(`<circle cx="${20 + x * 9.6}" cy="${60 + y * 9.6}" r="2.6"/>`);
      }
      el.innerHTML = `<div class="fx fx-story fx-st-world"><div class="fx-glow"></div>
        <svg viewBox="0 0 360 300" aria-hidden="true"><g fill="${C.GOLD}" opacity=".55">${dots.join('')}</g>
          <circle cx="${20 + 26 * 9.6}" cy="${60 + 8 * 9.6}" r="6" fill="${C.SEAL}" class="fx-st-pin"/>
          <circle cx="${20 + 15 * 9.6}" cy="${60 + 5 * 9.6}" r="6" fill="${C.PATINA}" class="fx-st-pin" style="animation-delay:.6s"/></svg>
        <div class="fx-st-rise"><div class="fx-book-cover"><b>直指</b></div></div></div>`;
      return 6000;
    },

    /* 결과 연출 */
    stamp(el) {
      el.innerHTML = `<div class="fx fx-result fx-stamp"><div class="fx-paper"></div>
        <div class="fx-stamp-seal"><span>통과</span></div>${particles(16, 'fx-ink')}</div>`;
      return 1900;
    },
    dice(el, { value = 1 }) {
      const pips = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
      const face = (n, cls) => `<i class="dc-f ${cls}">${Array.from({ length: 9 }, (_, k) => `<s class="${pips[n].includes(k + 1) ? 'on' : ''}${n === 1 ? ' big' : ''}"></s>`).join('')}</i>`;
      el.innerHTML = `<div class="fx fx-result fx-dice"><div class="fx-felt"></div>
        <div class="dc-move"><div class="dc"><div class="dc-in">
          ${face(1, 'dc-front')}${face(6, 'dc-back')}${face(3, 'dc-right')}${face(4, 'dc-left')}${face(2, 'dc-top')}${face(5, 'dc-bottom')}
        </div></div></div><div class="dc-shadow"></div></div>`;
      const final = { 1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180] }[value];
      const inner = el.querySelector('.dc-in');
      const spins = [[-30, 40], [380, 220], [560, 470], [final[0] + 720, final[1] + 720]];
      if (inner.animate && !reduce) {
        inner.animate([
          { transform: `rotateX(${spins[0][0]}deg) rotateY(${spins[0][1]}deg)` },
          { transform: `rotateX(${spins[1][0]}deg) rotateY(${spins[1][1]}deg)`, offset: 0.35 },
          { transform: `rotateX(${spins[2][0]}deg) rotateY(${spins[2][1]}deg)`, offset: 0.65 },
          { transform: `rotateX(${spins[3][0]}deg) rotateY(${spins[3][1]}deg)` },
        ], { duration: 1900, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
      } else {
        inner.style.transform = `rotateX(${final[0]}deg) rotateY(${final[1]}deg)`;
      }
      return 2500;
    },
    book(el) {
      el.innerHTML = `<div class="fx fx-result fx-bookflip"><div class="fx-rays"></div>
        <div class="bk"><div class="bk-l"></div><div class="bk-r"></div>
          ${[0, 1, 2, 3].map((i) => `<div class="bk-p" style="--i:${i}"></div>`).join('')}</div>${particles(12, 'fx-sparkle')}</div>`;
      return 2300;
    },
    boxWin(el) {
      el.innerHTML = `<div class="fx fx-result fx-box fx-box--win"><div class="fx-rays fx-rays--gold"></div>
        ${boxSvg()}${particles(22, 'fx-coin')}</div>`;
      return 2500;
    },
    boxLose(el) {
      el.innerHTML = `<div class="fx fx-result fx-box fx-box--lose">
        ${boxSvg()}${particles(10, 'fx-smoke')}<div class="fx-kkwang">꽝</div></div>`;
      return 2600;
    },
    count(el, { value = 0 }) {
      el.innerHTML = `<div class="fx fx-result fx-count"><div class="fx-glow"></div>
        <div class="ct-num"><b>0</b><small>개</small></div>
        <div class="ct-stack">${Array.from({ length: 10 }, (_, i) => `<i class="${i < value ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</div></div>`;
      const b = el.querySelector('.ct-num b');
      const step = value ? Math.min(160, 1300 / value) : 0;
      for (let i = 1; i <= value; i++) setTimeout(() => { b.textContent = i; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }, reduce ? 0 : 250 + i * step);
      return 600 + value * step + 700;
    },
    merge(el, { letters = ['直', '指', '心', '體', '要', '節'] }) {
      el.innerHTML = `<div class="fx fx-result fx-merge"><div class="fx-rays fx-rays--gold"></div>
        <div class="mg-ring">${letters.map((g, i) => `<div class="mg-t" style="--i:${i}">${typeBlock(g, { size: 48 })}</div>`).join('')}</div>
        <div class="mg-flash"></div>
        <div class="mg-book"><div class="fx-book-cover"><b>直指</b><small>心體要節</small></div></div></div>`;
      return 3300;
    },

    /* 시상·보상 */
    trophy(el) {
      el.innerHTML = `<div class="fx fx-trophy"><div class="fx-rays fx-rays--gold"></div>
        <svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="${C.GOLD_LO}"/><stop offset=".45" stop-color="${C.GOLD_HI}"/><stop offset="1" stop-color="${C.GOLD}"/></linearGradient></defs>
          <g stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"><path d="M62 30 H138 V70 Q138 112 100 112 Q62 112 62 70Z" fill="url(#tg)"/>
          <path d="M62 44 Q34 44 34 66 Q34 90 64 92 M138 44 Q166 44 166 66 Q166 90 136 92" fill="none"/>
          <path d="M92 112 H108 V138 H92Z" fill="${C.GOLD}"/><rect x="66" y="138" width="68" height="18" fill="${C.GOLD_LO}"/><rect x="56" y="156" width="88" height="22" fill="#3B3128"/></g>
          <text x="100" y="84" text-anchor="middle" font-family="Noto Serif KR, serif" font-weight="900" font-size="34" fill="${C.INK}">字</text>
          <path class="tr-shine" d="M70 30 L84 30 L70 104 L60 96Z" fill="#fff" opacity=".55"/></svg></div>`;
      return 1400;
    },
    chest(el) {
      el.innerHTML = `<div class="fx fx-chest"><div class="fx-rays fx-rays--gold"></div>
        <svg viewBox="0 0 220 200" aria-hidden="true"><g stroke="${C.INK}" stroke-width="4" stroke-linejoin="round">
          <rect x="30" y="96" width="160" height="86" rx="6" fill="#8A4B2A"/><rect x="30" y="96" width="160" height="22" fill="${C.GOLD}"/>
          <rect x="96" y="104" width="28" height="36" rx="4" fill="${C.GOLD_HI}"/><circle cx="110" cy="120" r="5" fill="${C.INK}"/>
          <path d="M54 96 V182 M166 96 V182" stroke="${C.GOLD}" stroke-width="8"/></g>
          <g class="ch-lid" stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"><path d="M30 96 V70 Q30 40 110 40 Q190 40 190 70 V96Z" fill="#9C5631"/><path d="M54 92 V52 M166 92 V52" stroke="${C.GOLD}" stroke-width="8"/><path d="M30 92 H190" stroke="${C.GOLD}" stroke-width="6"/></g>
          <g class="ch-light"><path d="M48 96 L10 -10 H210 L172 96Z" fill="${C.GOLD_HI}" opacity=".5"/></g></svg>
        ${particles(18, 'fx-coin')}</div>`;
      return 0;
    },
  };

  function boxSvg() {
    return `<svg class="bx" viewBox="0 0 220 220" aria-hidden="true"><g stroke="${C.INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M40 100 H180 V196 H40Z" fill="#B7743E"/><path d="M40 100 H180" /><path d="M96 100 V196 M124 100 V196" stroke="${C.SEAL}" stroke-width="10"/>
      <text x="110" y="166" text-anchor="middle" font-family="Black Han Sans, sans-serif" font-size="34" fill="${C.PAPER}" stroke="${C.INK}" stroke-width="1.5">?</text></g>
      <g class="bx-lid" stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"><path d="M30 76 H190 V104 H30Z" fill="#C98A50"/><path d="M96 76 V104 M124 76 V104" stroke="${C.SEAL}" stroke-width="10"/><path d="M110 76 Q90 50 76 62 Q70 76 110 76 Q130 50 144 62 Q150 76 110 76" fill="${C.SEAL}"/></g></svg>`;
  }

  /* 꽃가루 (내 수상) */
  function confetti(host) {
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = [C.SEAL, C.GOLD, C.GOLD_HI, C.PATINA, C.PAPER];
    box.innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="--x:${(i * 53) % 100}%;--c:${colors[i % colors.length]};--d:${1.6 + (i % 7) * 0.22}s;--w:${(i * 31) % 50 - 25}px;--r:${(i * 97) % 360}deg"></i>`).join('');
    host.appendChild(box);
    setTimeout(() => box.remove(), 3600);
  }

  window.FX = { typeBlock, play, preload, preloadImage, swapImage, hasVideo, confetti, wait, reduce };
})();
