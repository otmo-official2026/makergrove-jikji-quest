/* 그림: 장소·규칙 카드·활동·자물쇠를 SVG로 직접 그린다. 외부 이미지 없음. */
(function () {
  const INK = '#1A1714', GOLD = '#D9A93A', GOLD_HI = '#F4D27A', GOLD_LO = '#8C6420', SEAL = '#C2321F', PAPER = '#F3EAD6', PAPER_2 = '#E3D5B6', PATINA = '#2F6F62';
  const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const sky = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
  const frame = (inner, id) => `<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${sky('g' + id, '#F7EFDC', '#E9DCBE')}<rect width="320" height="190" fill="url(#g${id})"/>${inner}</svg>`;
  const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SEAL}" opacity=".92"/>`;
  const hills = `<path d="M0 120 Q40 88 80 104 T170 96 T250 100 T320 92 V190 H0Z" fill="${PAPER_2}"/><path d="M0 120 Q40 88 80 104 T170 96 T250 100 T320 92" fill="none" ${S} stroke-width="2" opacity=".55"/>`;
  const ground = (y) => `<rect x="0" y="${y}" width="320" height="${190 - y}" fill="#D8C59C"/><path d="M0 ${y}H320" ${S}/>`;
  const blockSm = (x, y, w, glyph) => `<g transform="translate(${x} ${y})"><path d="M0 ${w * .25} L${w * .5} 0 L${w * 1.5} 0 L${w} ${w * .25}Z" fill="${GOLD_HI}" ${S}/><path d="M${w} ${w * .25} L${w * 1.5} 0 V${w} L${w} ${w * 1.25}Z" fill="${GOLD_LO}" ${S}/><rect x="0" y="${w * .25}" width="${w}" height="${w}" fill="${GOLD}" ${S}/>${glyph ? `<text x="${w / 2}" y="${w * .25 + w * .74}" font-size="${w * .66}" text-anchor="middle" font-family="Noto Serif KR, serif" font-weight="900" fill="${INK}" transform="scale(-1 1) translate(${-w} 0)">${glyph}</text>` : ''}</g>`;

  const places = {
    plaza: () => frame(`${sun(262, 46, 22)}${hills}${ground(140)}
      <path d="M40 190 L120 140 M280 190 L200 140 M160 190 V140" stroke="${INK}" stroke-width="2" opacity=".35"/>
      <rect x="128" y="118" width="64" height="24" fill="${PAPER}" ${S}/>
      ${blockSm(136, 46, 46, '直')}
      <g ${S} fill="none"><path d="M44 140 V96"/><path d="M276 140 V96"/></g>
      <path d="M44 96 l26 6 -26 7z" fill="${SEAL}" ${S}/><path d="M276 96 l-26 6 26 7z" fill="${SEAL}" ${S}/>
      <g fill="${PATINA}" ${S}><circle cx="22" cy="128" r="14"/><circle cx="300" cy="126" r="16"/></g>
      <g fill="${INK}"><circle cx="96" cy="150" r="4"/><rect x="92" y="154" width="8" height="14" rx="3"/><circle cx="226" cy="152" r="4"/><rect x="222" y="156" width="8" height="14" rx="3"/></g>`, 'plaza'),
    temple: () => frame(`${sun(60, 44, 20)}
      <path d="M0 110 L60 70 L110 100 L170 58 L240 98 L290 76 L320 90 V190 H0Z" fill="${PAPER_2}" ${S} stroke-width="2"/>
      ${ground(142)}
      <g fill="#CDB98C" ${S} stroke-width="2.5">${[0, 1, 2, 3, 4].map(i => `<rect x="${42 + i * 50}" y="150" width="30" height="12" rx="3"/><rect x="${42 + i * 50}" y="170" width="30" height="12" rx="3"/>`).join('')}</g>
      <g ${S}><rect x="146" y="124" width="28" height="18" fill="${PAPER}"/><path d="M134 124 H186 L178 114 H142Z" fill="${INK}"/><rect x="149" y="98" width="22" height="16" fill="${PAPER}"/><path d="M138 98 H182 L175 89 H145Z" fill="${INK}"/><rect x="152" y="76" width="16" height="13" fill="${PAPER}"/><path d="M142 76 H178 L172 68 H148Z" fill="${INK}"/><path d="M160 68 V50" stroke="${GOLD_LO}"/><circle cx="160" cy="48" r="4" fill="${GOLD}"/></g>
      <path d="M92 142 V112 Q110 96 128 112 V142" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 5" opacity=".5"/>
      <path d="M192 142 V112 Q210 96 228 112 V142" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 5" opacity=".5"/>`, 'temple'),
    museum: () => frame(`${sun(266, 42, 18)}${hills}${ground(150)}
      <path d="M50 92 Q160 56 270 92 L254 100 H66Z" fill="${INK}" ${S}/>
      <path d="M44 92 Q36 88 34 80" fill="none" ${S}/><path d="M276 92 Q284 88 286 80" fill="none" ${S}/>
      <rect x="70" y="100" width="180" height="50" fill="${PAPER}" ${S}/>
      <g ${S}>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${82 + i * 31} 100 V150"/>`).join('')}</g>
      <rect x="140" y="112" width="40" height="38" fill="${GOLD}" ${S}/>
      <path d="M150 124 h20 M150 132 h20 M150 140 h20" stroke="${INK}" stroke-width="2"/>
      <path d="M60 150 H260 L270 160 H50Z" fill="#CDB98C" ${S}/>`, 'museum'),
    foundry: () => frame(`${hills}${ground(150)}
      <path d="M40 150 V92 Q40 60 80 60 H120 Q160 60 160 92 V150Z" fill="#B65A3C" ${S}/>
      ${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<path d="M${46 + c * 38 + (r % 2) * 18} ${100 + r * 12} h30" stroke="${INK}" stroke-width="1.5" opacity=".45"/>`).join('')).join('')}
      <path d="M70 150 V116 Q70 100 100 100 Q130 100 130 116 V150Z" fill="${INK}"/>
      <path d="M78 150 Q100 116 122 150Z" fill="${GOLD_HI}"/><path d="M88 150 Q100 128 112 150Z" fill="${SEAL}"/>
      <g transform="rotate(28 220 92)"><path d="M196 74 H244 L238 112 H202Z" fill="#5C4B3A" ${S}/><path d="M200 80 H240" stroke="${GOLD_HI}" stroke-width="5"/></g>
      <path d="M244 104 Q252 120 248 146" stroke="${GOLD_HI}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M244 104 Q252 120 248 146" stroke="${SEAL}" stroke-width="2" fill="none" opacity=".6"/>
      <rect x="214" y="146" width="66" height="16" fill="${PAPER_2}" ${S}/>
      <g fill="${GOLD}" ${S} stroke-width="2">${[0, 1, 2].map(i => `<rect x="${222 + i * 18}" y="150" width="12" height="8"/>`).join('')}</g>`, 'foundry'),
    press: () => frame(`${sun(52, 40, 16)}${hills}${ground(156)}
      <g ${S}><rect x="104" y="40" width="16" height="116" fill="#7A5A3A"/><rect x="200" y="40" width="16" height="116" fill="#7A5A3A"/><rect x="96" y="32" width="128" height="16" fill="${INK}"/>
      <rect x="152" y="48" width="16" height="34" fill="${GOLD}"/><path d="M128 64 H192" stroke-width="5"/><circle cx="128" cy="64" r="5" fill="${SEAL}"/><circle cx="192" cy="64" r="5" fill="${SEAL}"/>
      <rect x="124" y="82" width="72" height="14" fill="${GOLD_LO}"/>
      <rect x="84" y="118" width="152" height="12" fill="${INK}"/>
      <rect x="128" y="104" width="64" height="14" fill="${PAPER}"/></g>
      <g stroke="${INK}" stroke-width="1.6" opacity=".7"><path d="M136 109 h48 M136 113 h36"/></g>
      <g ${S} fill="${PAPER}"><path d="M244 122 l40 -14 v34 l-40 14z"/><path d="M252 124 l24 -8 M252 132 l24 -8 M252 140 l16 -5" stroke-width="1.6"/></g>`, 'press'),
    center: () => frame(`${hills}${ground(150)}
      <rect x="70" y="78" width="180" height="72" fill="${PAPER}" ${S}/>
      <g ${S} fill="${INK}" opacity=".9">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${82 + i * 21}" y="92" width="12" height="44" rx="2"/>`).join('')}</g>
      <path d="M60 78 H260 L248 66 H72Z" fill="${INK}" ${S}/>
      <circle cx="160" cy="40" r="24" fill="${PATINA}" ${S}/>
      <path d="M136 40 H184 M160 16 V64 M142 26 Q160 34 178 26 M142 54 Q160 46 178 54" fill="none" stroke="${PAPER}" stroke-width="2"/>
      <path d="M160 16 Q146 40 160 64 Q174 40 160 16" fill="none" stroke="${PAPER}" stroke-width="2"/>
      <g fill="${GOLD}" ${S} stroke-width="2"><path d="M30 150 l10 -40 10 40z"/><path d="M270 150 l10 -46 10 46z"/></g>`, 'center'),
  };

  const cards = {
    mission: () => `<svg viewBox="0 0 200 150" aria-hidden="true">
      <g transform="translate(16 30)">${['要', '心', '節', '指', '體', '直'].map((g, i) => {
        const x = (i % 3) * 58, y = Math.floor(i / 3) * 52; const lost = i === 1 || i === 4;
        return lost ? `<rect x="${x}" y="${y}" width="44" height="44" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="5 5"/><text x="${x + 22}" y="${y + 31}" font-size="22" text-anchor="middle" font-family="Black Han Sans, sans-serif" fill="${SEAL}">?</text>`
          : `<rect x="${x}" y="${y}" width="44" height="44" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/><text x="${x + 22}" y="${y + 33}" font-size="30" text-anchor="middle" font-family="Noto Serif KR, serif" font-weight="900" fill="${INK}">${g}</text>`;
      }).join('')}</g></svg>`,
    scores: () => `<svg viewBox="0 0 200 150" aria-hidden="true">
      <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
        <rect x="22" y="70" width="40" height="60" fill="${SEAL}"/><rect x="80" y="38" width="40" height="92" fill="${GOLD}"/><rect x="138" y="54" width="40" height="76" fill="${PATINA}"/></g>
      <path d="M16 130 H184" stroke="${INK}" stroke-width="3"/>
      <g font-family="Black Han Sans, sans-serif" font-size="20" text-anchor="middle" fill="${INK}"><text x="42" y="60">속도</text><text x="100" y="28">성적</text><text x="158" y="44">행운</text></g></svg>`,
    awards: () => `<svg viewBox="0 0 200 150" aria-hidden="true">
      <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
        <rect x="70" y="86" width="60" height="50" fill="${GOLD}"/><rect x="16" y="104" width="54" height="32" fill="${PAPER_2}"/><rect x="130" y="112" width="54" height="24" fill="${PAPER_2}"/>
        <path d="M80 26 H120 V46 Q120 70 100 70 Q80 70 80 46Z" fill="${GOLD_HI}"/><path d="M80 32 Q66 32 66 44 Q66 56 80 56 M120 32 Q134 32 134 44 Q134 56 120 56" fill="none"/>
        <path d="M100 70 V80 M88 80 H112" /></g>
      <g font-family="Black Han Sans, sans-serif" font-size="22" text-anchor="middle" fill="${INK}"><text x="100" y="120">1</text><text x="43" y="128">2</text><text x="157" y="132">3</text></g>
      <g fill="${SEAL}"><circle cx="40" cy="40" r="4"/><circle cx="162" cy="30" r="5"/><rect x="150" y="70" width="7" height="7" transform="rotate(20 153 73)"/><rect x="34" y="74" width="6" height="6" transform="rotate(-20 37 77)"/></g></svg>`,
  };

  const activity = {
    chant: () => `<svg viewBox="0 0 240 160" aria-hidden="true">
      ${[0, 1, 2, 3, 4].map(i => { const x = 40 + i * 40; const up = i % 2 === 0; return `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="${INK}"><circle cx="${x}" cy="88" r="11"/><path d="M${x} 99 V132 M${x} 132 l-9 22 M${x} 132 l9 22" fill="none"/><path d="M${x} 108 ${up ? `l-14 -26 M${x} 108 l14 -26` : `l-14 14 M${x} 108 l14 14`}" fill="none"/></g>`; }).join('')}
      <g font-family="Black Han Sans, sans-serif" font-size="24" fill="${SEAL}" stroke="${INK}" stroke-width="1.2"><text x="18" y="44" transform="rotate(-10 18 44)">와아!</text><text x="160" y="40" transform="rotate(8 160 40)">직지!</text></g>
      <path d="M100 30 l8 -14 M120 26 V8 M140 30 l-8 -14" stroke="${GOLD_LO}" stroke-width="4" stroke-linecap="round"/></svg>`,
    jump: () => `<svg viewBox="0 0 240 160" aria-hidden="true">
      <path d="M10 150 H230" stroke="${INK}" stroke-width="3"/>
      ${[0, 1, 2, 3, 4].map(i => { const x = 40 + i * 40, y = 64 + (i % 2) * 10; return `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="${INK}"><circle cx="${x}" cy="${y}" r="11"/><path d="M${x} ${y + 11} V${y + 44} M${x} ${y + 44} l-14 10 M${x} ${y + 44} l14 10 M${x} ${y + 20} l-16 -22 M${x} ${y + 20} l16 -22" fill="none"/></g><ellipse cx="${x}" cy="148" rx="12" ry="3" fill="${INK}" opacity=".25"/>`; }).join('')}
      <rect x="184" y="10" width="44" height="30" rx="4" fill="${GOLD}" stroke="${INK}" stroke-width="3"/><circle cx="206" cy="25" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><path d="M168 18 l10 4 M170 32 l10 -2" stroke="${SEAL}" stroke-width="3" stroke-linecap="round"/></svg>`,
  };

  const lock = () => `<svg viewBox="0 0 160 170" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
    <path d="M44 74 V52 Q44 18 80 18 Q116 18 116 52 V74" fill="none"/><rect x="26" y="72" width="108" height="84" rx="10" fill="${GOLD}"/>
    <circle cx="80" cy="106" r="11" fill="${INK}"/><path d="M80 112 V134" /></g></svg>`;

  const done = () => `<svg viewBox="0 0 160 170" aria-hidden="true"><g transform="rotate(-8 80 85)"><rect x="22" y="30" width="116" height="116" rx="14" fill="none" stroke="${SEAL}" stroke-width="8"/>
    <text x="80" y="108" font-size="52" text-anchor="middle" font-family="Black Han Sans, sans-serif" fill="${SEAL}">완료</text></g></svg>`;

  window.ART = { places, cards, activity, lock, done, colors: { INK, GOLD, GOLD_HI, GOLD_LO, SEAL, PAPER, PAPER_2, PATINA } };
})();
