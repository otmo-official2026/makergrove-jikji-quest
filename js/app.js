/* 사라진 활자를 찾아라 — 학생 화면 프로토타입
 * 서버 없음. 가입·진행 기록은 이 폰의 localStorage에만 저장한다.
 */
(function () {
  'use strict';
  const CO = window.COURSE;
  const FX = window.FX;
  const ART = window.ART;
  const KEY = 'jikji-proto-v1';
  const app = document.getElementById('app');
  const N = CO.stages.length;

  /* =========================================================
   * 저장
   * ======================================================= */
  function blank() {
    return { v: 1, user: null, phase: 'none', introStep: 0, current: 0, stages: {}, level: 'normal', final: { step: 'rank', award: 0, lucky: null, luckyAt: null, received: false, receivedAt: null, finishedAt: null, forced: null } };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return s;
    } catch (e) { /* 손상된 기록은 새로 시작 */ }
    return blank();
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 공간 없음 */ } }
  const rec = (n) => (S.stages[n] = S.stages[n] || { status: 'locked' });
  const stageOf = (n) => CO.stages[n - 1];

  /* =========================================================
   * 도우미
   * ======================================================= */
  const $ = (sel, root = app) => root.querySelector(sel);
  const $$ = (sel, root = app) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = (arr) => `<span class="lines">${arr.map((l) => `<span>${esc(l)}</span>`).join('')}</span>`;
  const now = () => Date.now();
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const dur = (ms) => { const m = Math.round(ms / 60000); if (m < 1) return `${Math.max(1, Math.round(ms / 1000))}초`; const h = Math.floor(m / 60); return h ? `${h}시간 ${m % 60}분` : `${m}분`; };
  const durS = (sec) => { const m = Math.floor(sec / 60), s = Math.round(sec % 60); return m ? `${m}분 ${String(s).padStart(2, '0')}초` : `${s}초`; };
  const fill = (tpl, o) => tpl.replace(/\{(\w+)\}/g, (_, k) => (o[k] !== undefined ? o[k] : ''));
  const mask = (name) => (name.length <= 2 ? name[0] + '○' : name[0] + '○'.repeat(name.length - 2) + name[name.length - 1]);
  const ICON = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9h7z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/></svg>',
  };
  const AGENT_NOTE = '<p class="note note-agent">실제 운영에서는 요원의<br>확인 코드로 열립니다</p>';

  /* 자막: " / "에서 줄을 끊는다 */
  const capLines = (c) => String(c).split(/\s*\/\s*/);
  const capHtml = (c) => `<span>${capLines(c).map((l) => `<span class="ln">${esc(l)}</span>`).join('')}</span>`;
  /* 한 화면의 자막 전체에서 가장 긴 줄이 한 줄에 들어가도록 글자 크기를 똑같이 줄인다 */
  function fitSubs(sub, caps) {
    if (!sub || !sub.isConnected) return;
    sub.style.fontSize = '';
    const base = parseFloat(getComputedStyle(sub).fontSize);
    const probe = document.createElement('div'); // span이면 자막 등장 애니메이션(축소)이 걸려 폭이 작게 잡힌다
    probe.className = 'ln';
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:0;top:0;width:max-content;animation:none;transform:none';
    sub.appendChild(probe);
    let max = 0;
    caps.forEach((c) => capLines(c).forEach((l) => { probe.textContent = l; max = Math.max(max, probe.getBoundingClientRect().width); }));
    probe.remove();
    const room = sub.clientWidth - 12; // 글자 테두리와 그림자 자리
    if (max > room) sub.style.fontSize = `${Math.floor(base * (room / max) * 10) / 10}px`;
  }
  /* 한글 글꼴은 글자 묶음별로 나눠 받는다: 자막에 쓰인 글자를 미리 받아 둔다 */
  const capFont = (caps) => (document.fonts && document.fonts.load ? document.fonts.load('27px "Black Han Sans"', caps.join('')).catch(() => []) : Promise.resolve([]));
  function fitSubsLive(sub, caps) {
    const fit = () => fitSubs(sub, caps);
    fit();
    capFont(caps).then(fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fit);
    window.addEventListener('resize', fit);
    return () => { window.removeEventListener('resize', fit); if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', fit); };
  }
  /* 장소·카드 그림: 이미지가 안 열리면 SVG 그림으로 */
  const picHtml = (src, fb, alt = '') => `<img class="pic" src="${esc(src)}" alt="${esc(alt)}" data-fb="${fb}" decoding="async">`;
  function bindPics(root = app) {
    $$('img[data-fb]', root).forEach((img) => {
      const fallback = () => {
        const [kind, key] = img.dataset.fb.split(':');
        const box = img.parentNode;
        if (!box) return;
        box.classList.add('pic-fb');
        img.outerHTML = kind === 'card' ? ART.cards[key]() : kind === 'act' ? ART.activity[key]() : ART.places[key]();
      };
      if (img.complete && !img.naturalWidth) fallback();
      else img.addEventListener('error', fallback, { once: true });
    });
  }

  /* =========================================================
   * 점수 (01_기능명세서 4장)
   * ======================================================= */
  // raw: { dice, quiz:[w,w,w], lottery:'win'|'lose', penaltyDone, count, photo, final }
  function stagePoints(n, raw) {
    const g = stageOf(n).game;
    switch (g.type) {
      case 'activity': return { grade: raw.pass ? g.points : 0, luck: 0 };
      case 'dice': return { grade: 0, luck: (raw.dice || 0) * g.perPip };
      case 'quiz': return { grade: g.questions.reduce((s, _, i) => s + Math.max(g.floor, g.perQuestion - g.penalty * ((raw.quiz || [])[i] || 0)), 0), luck: 0 };
      case 'lottery': return { grade: 0, luck: raw.lottery === 'win' ? g.win : raw.penaltyDone ? g.afterPenalty : g.lose };
      case 'count': return { grade: (raw.count || 0) * g.perItem, luck: 0 };
      case 'final': return { grade: (raw.photo ? g.photoPoints : 0) + (raw.solved ? Math.max(g.arrange.floor, g.arrange.points - g.arrange.penalty * (raw.final || 0)) : 0), luck: 0 };
      default: return { grade: 0, luck: 0 };
    }
  }
  function speedPoints(rank, total) {
    for (const t of CO.speedTiers) if (rank / total <= t.top + 1e-9) return t.points;
    return CO.speedTiers[CO.speedTiers.length - 1].points;
  }

  /* 가상 참가자 (수준과 조 재배치 반영) */
  function virtualPeople() {
    const L = CO.levels[S.level] || CO.levels.normal;
    const list = CO.virtual.map((v) => ({ ...v }));
    if (S.user) {
      const counts = {};
      list.forEach((v) => { counts[v.team] = (counts[v.team] || 0) + 1; });
      const short = Object.keys(counts).map(Number).find((t) => counts[t] < 5);
      if (short && S.user.team !== short) {
        const mover = list.find((v) => v.team === S.user.team);
        if (mover) mover.team = short;
      }
    }
    return list.map((v) => {
      const dice = Math.max(1, Math.min(v.lottery === 'win' ? 5 : 6, v.dice + L.dice));
      return {
        id: `${v.team}조-${v.no}`, name: v.name, team: v.team, me: false,
        t: v.t.map((x) => Math.round(x * L.time)),
        raw: (n) => ({
          pass: true, dice, lottery: v.lottery, penaltyDone: true,
          quiz: v.quiz.map((w, i) => Math.max(0, w + (i === 0 ? L.quiz : 0))),
          count: Math.max(0, Math.min(10, v.count + L.count)),
          photo: true, solved: true, final: Math.max(0, v.final + L.final),
        }),
      };
    });
  }
  function myRaw(n) {
    const r = rec(n);
    return { pass: !!r.pass, dice: r.dice, quiz: r.quiz ? r.quiz.wrong : [], lottery: r.lottery, penaltyDone: !!r.penaltyDone, count: r.count, photo: !!r.photo, solved: !!r.solved, final: r.arrange ? r.arrange.wrong : 0 };
  }
  const resulted = (n) => { const st = rec(n).status; return st === 'result' || st === 'done'; };
  function completedCount() { let k = 0; for (let n = 1; n <= N; n++) { if (resulted(n)) k = n; else break; } return k; }

  function people() {
    const vs = virtualPeople();
    const me = {
      id: S.user ? S.user.id : '—', name: S.user ? S.user.name : '', team: S.user ? S.user.team : 0, me: true,
      t: CO.stages.map((s) => { const r = rec(s.no); return r.endAt && r.startAt ? (r.endAt - r.startAt) / 1000 : null; }),
      raw: myRaw,
    };
    return [...vs, me];
  }

  /* k단계까지의 집계 */
  function standings(k) {
    const P = people();
    const rows = P.map((p) => ({ p, speed: 0, grade: 0, luck: 0, total: 0, time: 0, stage: [] }));
    for (let n = 1; n <= k; n++) {
      const order = rows.map((r, i) => i).sort((a, b) => (rows[a].p.t[n - 1] - rows[b].p.t[n - 1]) || (rows[b].p.me - rows[a].p.me) || a - b);
      const sp = []; order.forEach((idx, pos) => { sp[idx] = speedPoints(pos + 1, rows.length); });
      rows.forEach((r, i) => {
        const pts = stagePoints(n, r.p.raw(n));
        const st = { speed: sp[i], grade: pts.grade, luck: pts.luck, time: r.p.t[n - 1] };
        st.total = st.speed + st.grade + st.luck;
        r.stage[n] = st;
        r.speed += st.speed; r.grade += st.grade; r.luck += st.luck; r.total += st.total; r.time += st.time;
      });
    }
    const byTotal = rows.slice().sort((a, b) => b.total - a.total || a.time - b.time || b.p.me - a.p.me);
    byTotal.forEach((r, i) => { r.rank = i + 1; });
    const me = rows.find((r) => r.p.me);
    let stageRank = null;
    if (k > 0) {
      const so = rows.slice().sort((a, b) => b.stage[k].total - a.stage[k].total || a.stage[k].time - b.stage[k].time || b.p.me - a.p.me);
      stageRank = so.indexOf(me) + 1;
    }
    const teams = {};
    rows.forEach((r) => { teams[r.p.team] = (teams[r.p.team] || 0) + r.total; });
    const teamList = Object.keys(teams).map((t) => ({ team: Number(t), total: teams[t] })).sort((a, b) => b.total - a.total || a.team - b.team);
    teamList.forEach((t, i) => { t.rank = i + 1; });
    return { rows: byTotal, me, stageRank, teams: teamList, size: rows.length };
  }

  function myStatus() {
    const k = completedCount();
    if (!k) return { total: 0, rank: null, prev: null, k };
    const cur = standings(k);
    const prev = k > 1 ? standings(k - 1).me.rank : null;
    return { total: cur.me.total, rank: cur.me.rank, prev, k, st: cur };
  }
  const lettersGot = () => CO.stages.filter((s) => rec(s.no).grabbed).map((s) => s.letter);

  /* 시상 (4.5, AWARD-02·03) */
  function computeAwards() {
    const st = standings(N);
    const top = st.rows.slice(0, 3);
    const topIds = top.map((r) => r.p.id);
    const pickBest = (key) => st.rows.slice().sort((a, b) => b[key] - a[key] || a.time - b.time || b.p.me - a.p.me).find((r) => !topIds.includes(r.p.id));
    return CO.awards.map((a) => {
      if (a.by === 'team') {
        const t = st.teams[0];
        return { a, team: t.team, score: t.total, mine: !!S.user && t.team === S.user.team, who: `${t.team}조` };
      }
      const r = a.by === 'total' ? top[a.place - 1] : pickBest(a.by);
      const score = a.by === 'total' ? r.total : r[a.by];
      return { a, row: r, score, mine: r.p.me, who: `${r.p.team}조 ${r.p.me ? r.p.name : mask(r.p.name)}` };
    });
  }

  /* =========================================================
   * 라우팅 (해시). 주소의 뜻은 03_IA 4장과 같다.
   * ======================================================= */
  function canonical() {
    if (!S.user) return '/';
    if (S.phase === 'joined') return '/join';
    if (S.phase === 'intro') return '/intro';
    if (S.phase === 'final') return '/final/' + S.final.step;
    const n = S.current, r = rec(n);
    switch (r.status) {
      case 'open': return '/go';
      case 'arrived': return `/s/${n}`;
      case 'quest': return `/s/${n}/quest`;
      case 'playing': case 'penalty': return `/s/${n}/play`;
      case 'result': return r.grabbed ? `/s/${n}/report` : `/s/${n}/play`;
      default: return '/go';
    }
  }
  function parse() {
    const h = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
    const [path, qs] = h.split('?');
    return { path: path || '/', q: new URLSearchParams(qs || '') };
  }
  function go(path) { if (location.hash === '#' + path) route(); else location.hash = path; }
  function redirect(path) { const target = path || canonical(); history.replaceState(null, '', '#' + target); route(); }

  let cleanup = [];
  function teardown() { cleanup.forEach((f) => { try { f(); } catch (e) { /* 이미 정리됨 */ } }); cleanup = []; }

  function route() {
    teardown();
    closeSheets();
    const { path, q } = parse();
    const m = path.match(/^\/s\/(\d+)(?:\/(quest|play|report))?$/);
    if (m) {
      const n = Number(m[1]), sub = m[2];
      if (!sub && q.has('k')) return qrEnter(n, q.get('k'), 'url');
      if (!S.user) return redirect('/');
      if (sub === 'report' && n >= 1 && n <= N && (rec(n).status === 'done' || (S.phase === 'final' && resulted(n)))) return screenReport(n, true);
      if (path !== canonical()) return redirect();
      if (!sub) return screenStory(n);
      if (sub === 'quest') return screenQuest(n);
      if (sub === 'play') return screenPlay(n);
      return screenReport(n, false);
    }
    if (path === '/') return screenStart();
    if (path === '/join') {
      if (!S.user) return screenJoin();
      if (S.phase === 'joined') return screenCert();
      return redirect();
    }
    if (path !== canonical()) return redirect();
    if (path === '/intro') return S.introStep ? screenCards() : screenOpening();
    if (path === '/go') return screenMove();
    if (path === '/final/rank') return screenFinalRank();
    if (path === '/final/awards') return screenAwards();
    if (path === '/final/lucky') return screenLucky();
    if (path === '/final/card') return screenCard();
    return redirect();
  }
  window.addEventListener('hashchange', route);

  /* QR 진입 (QR-01·04, PROG-04·05, E1·E2·E3·E4) */
  function qrEnter(n, k, source) {
    const s = stageOf(n);
    if (!S.user) { history.replaceState(null, '', '#/'); route(); band('먼저 가입이 필요해요'); return; }
    if (!s || k !== s.code) {
      if (source === 'scanner') { band('올바른 QR이 아니에요'); return; }
      redirect(); band('올바른 QR이 아니에요'); return;
    }
    if (S.phase === 'final' || rec(n).status === 'done') { history.replaceState(null, '', `#/s/${n}/report`); route(); return; }
    if (S.phase !== 'stages') { redirect(); return; }
    if (n > S.current) { if (source === 'scanner') history.pushState(null, '', `#/s/${n}?k=${encodeURIComponent(k)}`); return screenLocked(n); }
    if (n === S.current && rec(n).status === 'open') {
      Object.assign(rec(n), { status: 'arrived', arriveAt: now() });
      save();
    }
    redirect();
  }

  /* =========================================================
   * 화면 틀
   * ======================================================= */
  function frame({ bar = true, status = false, timer = null, body = '', foot = '', dark = false, mainCls = '', cls = '' }) {
    app.className = (dark ? 'dark ' : '') + cls;
    app.innerHTML = `${bar ? barHtml() : ''}${timer ? timerHtml() : status ? statusHtml() : ''}<main class="main ${mainCls}" id="main">${body}</main>${foot ? `<footer class="foot">${foot}</footer>` : ''}`;
    if (bar) bindBar();
    if (timer) startTimer(timer);
    if (status) bindStatus();
    app.scrollTop = 0;
  }
  function barHtml() {
    const dots = CO.stages.map((s) => {
      const r = rec(s.no); const cls = r.status === 'done' || (S.phase === 'final') ? 'done' : (S.phase === 'stages' && s.no === S.current) ? (r.status === 'result' ? 'done' : 'now') : '';
      return `<i class="${cls}"></i>`;
    }).join('');
    return `<header class="bar"><button class="logo" type="button" aria-label="${esc(CO.title)}">직지</button><div class="dots" aria-label="6단계 중 진행">${dots}</div><button class="help" type="button" aria-label="규칙·도움말">?</button></header>`;
  }
  let logoTaps = [];
  function logoTap() {
    const t = now();
    logoTaps = logoTaps.filter((x) => t - x < 2500); logoTaps.push(t);
    if (logoTaps.length >= 5) { logoTaps = []; sheetDemo(); }
  }
  function bindBar() {
    $('.bar .logo').addEventListener('click', logoTap);
    $('.bar .help').addEventListener('click', sheetHelp);
  }
  function statusHtml() {
    const m = myStatus();
    let arrow = '';
    if (m.prev && m.rank < m.prev) arrow = '<span class="up">▲</span>';
    else if (m.prev && m.rank > m.prev) arrow = '<span class="down">▼</span>';
    return `<nav class="status" aria-label="내 현황">
      <button type="button" data-s="me"><b>${m.total}</b><small>점</small></button>
      <button type="button" data-s="rank">${arrow}<b>${m.rank || '—'}</b><small>위</small></button>
      <button type="button" data-s="vault"><small>활자</small><b>${lettersGot().length}</b><small>/6</small></button></nav>`;
  }
  function bindStatus() {
    $$('.status button').forEach((b) => b.addEventListener('click', () => ({ me: sheetMe, rank: sheetRank, vault: sheetVault }[b.dataset.s])()));
  }
  function timerHtml() { return `<div class="timer" role="timer">${ICON.clock}<span>00:00</span></div>`; }
  function startTimer(from) {
    const el = $('.timer span');
    const tick = () => { el.textContent = mmss(now() - from); };
    tick();
    const id = setInterval(tick, 500);
    cleanup.push(() => clearInterval(id));
    wakeLock(true);
    cleanup.push(() => wakeLock(false));
  }
  let lock = null;
  function wakeLock(on) {
    if (!('wakeLock' in navigator)) return;
    if (on && !lock) navigator.wakeLock.request('screen').then((l) => { lock = l; }).catch(() => { lock = null; });
    if (!on && lock) { lock.release().catch(() => {}); lock = null; }
  }

  function band(text, ok) {
    const old = $('.band'); if (old) old.remove();
    const b = document.createElement('div');
    b.className = 'band' + (ok ? ' ok' : ''); b.setAttribute('role', 'status'); b.textContent = text;
    app.appendChild(b);
    setTimeout(() => b.remove(), 2600);
  }

  function dialog(big, text, onOk) {
    const w = document.createElement('div');
    w.className = 'dialog-wrap';
    w.innerHTML = `<div class="sheet-back"></div><div class="dialog" role="alertdialog" aria-modal="true"><div class="dialog-v">${esc(big)}</div><p>${text}</p>
      <div class="dialog-btns"><button class="btn ghost" type="button" data-a="no">다시 고르기</button><button class="btn" type="button" data-a="ok">확정</button></div></div>`;
    app.appendChild(w);
    w.querySelector('[data-a=no]').addEventListener('click', () => w.remove());
    w.querySelector('.sheet-back').addEventListener('click', () => w.remove());
    w.querySelector('[data-a=ok]').addEventListener('click', () => { w.remove(); onOk(); });
    w.querySelector('[data-a=ok]').focus();
  }

  /* 덮이는 창 */
  function sheet(title, body, { foot = '', onClose, cls = '' } = {}) {
    const w = document.createElement('div');
    w.className = 'sheet-wrap ' + cls;
    w.innerHTML = `<div class="sheet-back"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-head"><h2>${title}</h2><button class="x" type="button" aria-label="닫기">${ICON.x}</button></div>
      <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}</section>`;
    app.appendChild(w);
    const close = () => { const f = w._clean; w._clean = null; w.remove(); if (f) f(); if (onClose) onClose(); };
    w._close = close;
    w.querySelector('.x').addEventListener('click', close);
    w.querySelector('.sheet-back').addEventListener('click', close);
    return w;
  }
  function closeSheets() { $$('.sheet-wrap, .dialog-wrap, .scan').forEach((w) => { const f = w._clean; w._clean = null; w.remove(); if (f) f(); }); }

  /* =========================================================
   * A. 입장
   * ======================================================= */
  function screenStart() {
    const has = !!S.user;
    const finished = S.phase === 'final' && (S.final.step === 'card');
    const hero = `<div class="hero" aria-hidden="true"><div class="hero-ring"></div>
      <span class="hero-lost">?</span><span class="hero-lost">?</span><span class="hero-lost">?</span><span class="hero-lost">?</span><span class="hero-lost">?</span>
      ${FX.typeBlock('直', { size: 132, spin: true, float: true })}</div>`;
    let foot;
    if (finished) foot = `<button class="btn" type="button" data-go="resume">수료 카드 보기</button>`;
    else if (has) foot = `<button class="btn" type="button" data-go="resume">이어 하기</button>`;
    else foot = `<button class="btn" type="button" data-go="join">시작하기</button>`;
    app.className = 'start dark';
    app.innerHTML = `<div class="start-top"><button class="logo" type="button" aria-label="${esc(CO.title)}">직지</button><p>청주 지역문화자원을 활용한<br>증강현실 체험교육플랫폼</p></div>
      <main class="main">${hero}
        <h1 class="cap start-title"><span class="tilt">${esc(CO.title)}</span></h1>
        <p class="start-sub">${esc(CO.subtitle)}</p>
        <div class="start-meta"><span class="chip">${ICON.clock}약 ${CO.minutes}분</span><span class="chip">${ICON.pin}${N}단계</span></div>
      </main><footer class="foot">${foot}</footer>`;
    $('.logo').addEventListener('click', logoTap);
    $('[data-go]').addEventListener('click', (e) => (e.currentTarget.dataset.go === 'join' ? go('/join') : go(canonical())));
  }

  const draft = { name: '', phone: '', school: '', grade: '', cls: '', team: 0, req: false, opt: false, tried: false };
  function screenJoin() {
    const J = CO.join;
    const opts = (arr, ph, val, suf = '') => `<option value="">${ph}</option>${arr.map((x) => `<option value="${esc(x)}"${String(val) === String(x) ? ' selected' : ''}>${esc(x)}${suf}</option>`).join('')}`;
    frame({
      bar: false,
      body: `<h1 class="h1">참가 등록</h1>
      <div class="form-row" data-f="name"><label for="f-name">이름</label><input class="inp" id="f-name" autocomplete="off" maxlength="10" value="${esc(draft.name)}"><p class="err" aria-live="polite"></p></div>
      <div class="form-row" data-f="phone"><label for="f-phone">연락처</label><input class="inp" id="f-phone" inputmode="numeric" autocomplete="off" placeholder="010-" maxlength="13" value="${esc(draft.phone)}"><p class="err" aria-live="polite"></p></div>
      <div class="form-row" data-f="school"><label for="f-school">학교</label><select class="sel" id="f-school">${opts(J.schools, '선택', draft.school)}</select><p class="err" aria-live="polite"></p></div>
      <div class="form-row" data-f="gc"><span class="lab" id="l-gc">학년·반</span><div class="two"><select class="sel" id="f-grade" aria-labelledby="l-gc">${opts(J.grades, '학년', draft.grade, '학년')}</select><select class="sel" id="f-cls" aria-labelledby="l-gc">${opts(J.classes, '반', draft.cls, '반')}</select></div><p class="err" aria-live="polite"></p></div>
      <div class="form-row" data-f="team"><span class="lab" id="l-team">조</span><div class="teams" role="group" aria-labelledby="l-team">${Array.from({ length: J.teams }, (_, i) => `<button type="button" aria-pressed="${draft.team === i + 1}" data-t="${i + 1}">${i + 1}</button>`).join('')}</div><p class="err" aria-live="polite"></p></div>
      <div class="consent" id="consent">
        <div class="consent-row"><button class="check" type="button" role="checkbox" aria-checked="${draft.req}" data-c="req"><span class="box"></span>${esc(J.terms.required.label)}</button><button class="view" type="button" data-v="required">보기</button></div>
        <div class="consent-row"><button class="check" type="button" role="checkbox" aria-checked="${draft.opt}" data-c="opt"><span class="box"></span>${esc(J.terms.optional.label)}</button><button class="view" type="button" data-v="optional">보기</button></div>
      </div>
      <p class="guard">만 14세 미만은 보호자 동의가<br>확인된 학생만 참가합니다</p>`,
      foot: `<button class="btn" type="button" id="join-btn">가입하기</button>`,
    });
    const errs = {
      name: () => (/^[가-힣a-zA-Z]{2,10}$/.test(draft.name.trim()) ? '' : '이름을 2자 이상 적어 주세요'),
      phone: () => (/^010\d{8}$/.test(draft.phone.replace(/\D/g, '')) ? '' : '휴대전화 번호를 확인해 주세요'),
      school: () => (draft.school ? '' : '학교를 골라 주세요'),
      gc: () => (draft.grade && draft.cls ? '' : '학년과 반을 골라 주세요'),
      team: () => (draft.team ? '' : '조를 골라 주세요'),
    };
    const valid = () => Object.values(errs).every((f) => !f());
    const paint = () => {
      if (draft.tried) Object.keys(errs).forEach((k) => { const row = $(`[data-f=${k}]`); const msg = errs[k](); row.classList.toggle('bad', !!msg); row.querySelector('.err').textContent = msg; });
      $('#join-btn').classList.toggle('off', !(valid() && draft.req));
      $('#join-btn').setAttribute('aria-disabled', String(!(valid() && draft.req)));
    };
    $('#f-name').addEventListener('input', (e) => { draft.name = e.target.value; paint(); });
    $('#f-phone').addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 11);
      e.target.value = d.length > 7 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
      draft.phone = e.target.value; paint();
    });
    $('#f-school').addEventListener('change', (e) => { draft.school = e.target.value; paint(); });
    $('#f-grade').addEventListener('change', (e) => { draft.grade = e.target.value; paint(); });
    $('#f-cls').addEventListener('change', (e) => { draft.cls = e.target.value; paint(); });
    $$('.teams button').forEach((b) => b.addEventListener('click', () => { draft.team = Number(b.dataset.t); $$('.teams button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); paint(); }));
    $$('.check').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.c; draft[k] = !draft[k]; b.setAttribute('aria-checked', String(draft[k])); paint(); }));
    $$('.view').forEach((b) => b.addEventListener('click', () => sheetTerms(b.dataset.v)));
    $('#join-btn').addEventListener('click', () => {
      draft.tried = true; paint();
      if (!valid()) { const first = $('.form-row.bad'); if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      if (!draft.req) { const c = $('#consent'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); return; }
      const phone = draft.phone.replace(/\D/g, '');
      if (S.user && S.user.phone.replace(/\D/g, '') === phone) { go(canonical()); return; }
      const t = now();
      const used = new Set(CO.virtual.map((v) => v.no));
      const free = Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, '0')).filter((x) => !used.has(x));
      const no = free[Math.floor(Math.random() * free.length)];
      S = blank();
      S.user = {
        id: `${draft.team}조-${no}`, no, name: draft.name.trim(), phone: draft.phone, school: draft.school, grade: Number(draft.grade), cls: Number(draft.cls), team: draft.team,
        consentRequired: { agreed: true, at: t }, consentOptional: { agreed: draft.opt, at: draft.opt ? t : null }, joinedAt: t,
      };
      S.phase = 'joined';
      Object.assign(draft, { name: '', phone: '', school: '', grade: '', cls: '', team: 0, req: false, opt: false, tried: false });
      save();
      go('/join');
    });
    paint();
  }

  function sheetTerms(which) {
    const T = CO.join.terms, t = T[which];
    const w = sheet(esc(t.title), `<table class="terms-table">
      <tr><th>수집 항목</th><td>${esc(t.items)}</td></tr><tr><th>목적</th><td>${esc(t.purpose)}</td></tr><tr><th>보유 기간</th><td>${esc(t.keep)}</td></tr>
      <tr><th>거부할 권리</th><td>${esc(T.refuse)}</td></tr></table><p class="note">${esc(T.draft)}</p>`, { foot: '<button class="btn" type="button" data-ok>확인</button>' });
    w.querySelector('[data-ok]').addEventListener('click', w._close);
  }

  function screenCert() {
    const u = S.user;
    frame({
      body: `<div class="cert"><p class="cert-title">수습 각자장 임명장</p><p class="cert-name">${esc(u.name)}</p><p class="cert-no">${u.team}조 - ${u.no}</p>
        <p class="cert-body">활자를 새기는 장인,<br>각자장의 길에 들어섰습니다</p><div class="cert-seal">각자<br>임명</div></div>`,
      mainCls: 'center',
      foot: `<button class="btn" type="button" id="b">모험 시작</button>`,
    });
    $('#b').addEventListener('click', () => { S.phase = 'intro'; S.introStep = 0; save(); go('/intro'); });
    FX.preloadImage(CO.opening.image);
    CO.intro.forEach((c) => FX.preloadImage(c.image));
  }

  /* =========================================================
   * B. 오프닝
   * ======================================================= */
  function screenOpening() {
    const O = CO.opening;
    app.className = 'dark';
    /* 장소 이야기와 같은 방식: 화면을 누를 때마다 자막 한 장, 마지막 장에서 버튼 */
    app.innerHTML = `<div class="stage" data-story><div class="media"></div>
      <div class="subs"><p class="sub cap"></p><div class="sub-dots" aria-hidden="true">${O.captions.map(() => '<i></i>').join('')}</div><div class="tap-hint">화면을 눌러 넘기세요</div></div></div>`;
    let done = false;
    const finish = () => { if (done) return; done = true; S.introStep = 1; save(); route(); };
    const story = { story: { captions: O.captions, video: O.video, image: O.image, scene: 'opening' } };
    cleanup.push(runStory(app, story, '다음', finish));
    cleanup.push(() => { done = true; });
  }

  function screenCards() {
    const I = CO.intro;
    frame({
      body: `<div class="cards" id="cards">${I.map((c, i) => `<div class="card-slide"><article class="icard" aria-label="${i + 1} / ${I.length}"><div class="icard-art">${c.image ? picHtml(c.image, `card:${c.art}`) : ART.cards[c.art]()}</div><h2 class="h1">${esc(c.title)}</h2><p>${c.body.map(esc).join('<br>')}</p></article></div>`).join('')}</div>
        <div class="pager">${I.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`,
      mainCls: 'center',
      foot: `<button class="btn" type="button" id="b">다음</button>`,
    });
    $('#main').style.display = 'flex';
    bindPics();
    const cards = $('#cards');
    let idx = 0;
    const sync = () => {
      idx = Math.round(cards.scrollLeft / cards.clientWidth);
      $$('.pager i').forEach((d, i) => d.classList.toggle('on', i === idx));
      $('#b').textContent = idx === I.length - 1 ? '첫 장소로 출발' : '다음';
    };
    cards.addEventListener('scroll', () => window.requestAnimationFrame(sync), { passive: true });
    $('#b').addEventListener('click', () => {
      if (idx < I.length - 1) { cards.scrollTo({ left: (idx + 1) * cards.clientWidth, behavior: FX.reduce ? 'auto' : 'smooth' }); idx += 1; sync(); return; }
      S.phase = 'stages'; S.current = 1; rec(1).status = 'open'; rec(1).openAt = now(); save(); go('/go');
    });
  }

  /* =========================================================
   * C. 단계 진행
   * ======================================================= */
  function stageVideos(s) {
    const r = s.result;
    const list = [s.story.video];
    if (r.win) list.push(r.win.video, r.lose.video);
    else if (r.video.includes('{value}')) for (let i = 1; i <= 6; i++) list.push(r.video.replace('{value}', i));
    else list.push(r.video);
    return list;
  }

  function screenMove() {
    const n = S.current, s = stageOf(n);
    frame({
      status: true,
      body: `<span class="step-no"><i></i>${n}단계</span>
        <div class="place-art">${s.image ? picHtml(s.image, `place:${s.art}`, s.place) : ART.places[s.art]()}</div>
        <h1 class="h1 place-name">${esc(s.place)}</h1>
        <p class="guide">요원을 따라 이동하세요<br>도착하면 QR을 찍습니다</p>`,
      foot: `<button class="btn" type="button" id="b">QR 찍기</button>`,
    });
    bindPics();
    FX.preload(stageVideos(s));
    (s.story.images || [s.story.image]).forEach(FX.preloadImage);
    FX.preloadImage(s.game.image);
    capFont(s.story.captions);
    $('#b').addEventListener('click', openScanner);
  }

  /* C-02 QR 찍기 */
  function openScanner() {
    const n = S.current, s = stageOf(n);
    const w = document.createElement('div');
    w.className = 'scan';
    w.innerHTML = `<div class="scan-top"><button class="x" type="button" aria-label="닫기">${ICON.x}</button></div>
      <div class="scan-view"><video playsinline muted></video><div class="scan-frame"><i></i><i></i><i></i><i></i></div><div class="scan-line"></div></div>
      <p class="scan-msg">요원이 든 QR을 비추세요</p>
      <div style="flex:1"></div>
      <footer class="foot"><button class="btn" type="button" id="demo-qr">QR 찍었다 치고 넘어가기</button><p class="note">시연용 버튼입니다</p></footer>`;
    app.appendChild(w);
    const video = w.querySelector('video');
    let stream = null, timer = null, stopped = false, lastBad = 0;
    const stop = () => { stopped = true; clearInterval(timer); if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
    w._clean = stop;
    cleanup.push(stop);
    w.querySelector('.x').addEventListener('click', () => { stop(); w.remove(); });
    w.querySelector('#demo-qr').addEventListener('click', () => { stop(); w.remove(); qrEnter(n, s.code, 'scanner'); });

    const denied = (reason) => {
      w.querySelector('.scan-line').remove();
      const off = document.createElement('div');
      off.className = 'scan-off';
      off.innerHTML = `<h3>카메라를 켤 수 없어요</h3>${reason === 'insecure' ? '<p>이 주소에서는 카메라를 쓸 수 없어요.</p>' : ''}
        <ol><li>주소창 옆 설정 버튼을 누릅니다</li><li>카메라를 허용으로 바꿉니다</li><li>이 화면을 다시 엽니다</li></ol>
        <p><b>폰 기본 카메라로 찍어도 됩니다</b></p>`;
      w.querySelector('.scan-view').appendChild(off);
    };
    const handle = (text) => {
      const m = String(text).match(/#\/s\/(\d+)\?k=([^&\s#]+)/);
      if (!m) { if (now() - lastBad > 2500) { lastBad = now(); band('올바른 QR이 아니에요'); } return; }
      const sn = Number(m[1]), sk = decodeURIComponent(m[2]);
      const st = stageOf(sn);
      if (!st || st.code !== sk) { if (now() - lastBad > 2500) { lastBad = now(); band('올바른 QR이 아니에요'); } return; }
      stop(); w.remove(); qrEnter(sn, sk, 'scanner');
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { denied(window.isSecureContext ? 'denied' : 'insecure'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then((st) => {
      if (stopped) { st.getTracks().forEach((t) => t.stop()); return; }
      stream = st; video.srcObject = st;
      const p = video.play(); if (p && p.catch) p.catch(() => {});
      let detector = null;
      if ('BarcodeDetector' in window) { try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { detector = null; } }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let busy = false;
      timer = setInterval(async () => {
        if (busy || stopped || video.readyState < 2) return;
        busy = true;
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes && codes[0]) handle(codes[0].rawValue);
          } else if (window.jsQR) {
            const scale = Math.min(1, 480 / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (code && code.data) handle(code.data);
          }
        } catch (e) { detector = null; }
        busy = false;
      }, 260);
    }).catch(() => denied('denied'));
  }

  /* X-01 잠긴 장소 */
  function screenLocked(n) {
    const c = stageOf(S.current), l = stageOf(n);
    frame({
      status: true,
      body: `<div class="lock-place"><div class="place-art">${l.image ? picHtml(l.image, `place:${l.art}`, l.place) : ART.places[l.art]()}</div><div class="lock-art">${ART.lock()}</div></div>
        <h1 class="h1 x-title">아직 열리지 않은 장소입니다</h1><p class="x-desc">지금은 ${S.current}단계 ${esc(c.place)} 차례예요</p>`,
      mainCls: 'center',
      foot: `<button class="btn" type="button" id="b">내 차례로 돌아가기</button>`,
    });
    bindPics();
    $('#b').addEventListener('click', () => go(canonical()));
  }

  /* C-03 장소 이야기 (STORY-03, 05) */
  /* 장소 이야기 화면 틀: C-03과 보관함 다시 보기가 같이 쓴다 */
  function storyHtml(n, s, extra = '') {
    return `<div class="stage" data-story><div class="media"></div>
      <div class="place-tag"><b>${n}단계</b><span>${esc(s.place)}</span></div>${extra}
      <div class="subs"><p class="sub cap"></p><div class="sub-dots" aria-hidden="true">${s.story.captions.map(() => '<i></i>').join('')}</div><div class="tap-hint">화면을 눌러 넘기세요</div></div></div>`;
  }
  /* 화면을 누를 때마다 자막을 한 장씩. 마지막 장에서 버튼(label)을 띄운다. 정리 함수를 돌려준다 */
  function runStory(root, s, label, onEnd) {
    const caps = s.story.captions;
    const stage = $('[data-story]', root), sub = $('.sub', stage), hint = $('.tap-hint', stage), media = $('.media', stage);
    /* 그림이 여러 장이면 자막 순서에 맞춰 바꾼다 (6장 자막, 3장 그림 → 2장마다) */
    const imgs = s.story.images && s.story.images.length ? s.story.images : [s.story.image];
    imgs.forEach(FX.preloadImage);
    let want = 0, ready = false;
    FX.play(media, { video: s.story.video, image: imgs[0], scene: s.story.scene, loop: true }).then(() => { ready = true; if (want) FX.swapImage(media, imgs[want]); });
    const unfit = fitSubsLive(sub, caps);
    let i = -1, last = 0;
    const next = () => {
      if (i >= caps.length - 1) return;
      const t = now();
      if (i >= 0 && t - last < 250) return; // 두 번 눌림 방지
      last = t;
      i += 1;
      const k = Math.floor(i * imgs.length / caps.length);
      if (k !== want) { want = k; if (ready) FX.swapImage(media, imgs[k]); }
      sub.innerHTML = capHtml(caps[i]);
      sub.setAttribute('aria-label', `${i + 1} / ${caps.length}`);
      $$('.sub-dots i', stage).forEach((d, k) => d.classList.toggle('on', k <= i));
      if (i === caps.length - 1) {
        hint.innerHTML = `<button class="btn btn-in" type="button">${label}</button>`;
        const b = $('button', hint);
        b.addEventListener('click', (e) => { e.stopPropagation(); if (now() - last < 400) return; onEnd(); });
      }
    };
    stage.addEventListener('click', next);
    const t0 = setTimeout(next, 500);
    return () => { clearTimeout(t0); unfit(); };
  }

  function screenStory(n) {
    const s = stageOf(n);
    app.className = 'dark';
    app.innerHTML = storyHtml(n, s);
    cleanup.push(runStory(app, s, '퀘스트 받기', () => { Object.assign(rec(n), { status: 'quest', storyAt: now() }); save(); go(`/s/${n}/quest`); }));
  }

  /* C-04 퀘스트 창 */
  function screenQuest(n) {
    const s = stageOf(n);
    const stakes = [['속도', s.max.speed], ['성적', s.max.grade], ['행운', s.max.luck]].filter((x) => x[1] > 0);
    frame({
      status: true,
      body: `<section class="quest" aria-label="퀘스트"><span class="quest-tag">QUEST ${n}</span><h1 class="cap gold quest-name">${esc(s.quest.name)}</h1>
        <ol class="rules">${s.quest.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
        <div class="stakes"><h3>걸린 점수</h3><div class="stakes-row">${stakes.map(([k, v]) => `<div class="stake"><span>${k}</span><b>${v}</b></div>`).join('')}</div></div></section>`,
      foot: `<button class="btn" type="button" id="b">게임 시작</button><p class="note">누르면 시간이 흐릅니다</p>`,
    });
    $('#b').addEventListener('click', () => { Object.assign(rec(n), { status: 'playing', startAt: now() }); save(); go(`/s/${n}/play`); });
  }

  /* C-05 ~ C-07 + 활자 잡기 */
  function screenPlay(n) {
    const r = rec(n), s = stageOf(n);
    if (r.status === 'penalty') return r.shown ? screenPenalty(n) : screenResult(n);
    if (r.status === 'result') return r.shown ? screenAR(n) : screenResult(n);
    const g = s.game;
    if (g.type === 'activity') return gameActivity(n, g.art, g.lines, () => finishGame(n, { pass: true }), g.image);
    if (g.type === 'dice') return gameDice(n);
    if (g.type === 'lottery') return gameLottery(n);
    if (g.type === 'count') return gameCount(n);
    if (g.type === 'quiz') return gameQuiz(n);
    if (g.type === 'final') {
      if (!r.photo) return gameActivity(n, g.art, g.lines, () => { r.photo = true; r.photoAt = now(); save(); band(`통과! 성적 +${g.photoPoints}`, true); screenPlay(n); }, g.image);
      return gameArrange(n);
    }
    return redirect();
  }

  function finishGame(n, patch, nextStatus = 'result') {
    const r = rec(n);
    Object.assign(r, patch, { status: nextStatus });
    if (nextStatus === 'result') r.endAt = now();
    if (nextStatus === 'penalty') r.penaltyIdx = Math.floor(Math.random() * CO.penalties.length);
    save();
    screenResult(n);
  }

  function gameActivity(n, art, txt, onOk, image) {
    frame({
      timer: rec(n).startAt,
      body: `<div class="act-art">${image ? picHtml(image, `act:${art}`) : ART.activity[art]()}</div><p class="h2 act-lines">${txt.map(esc).join('<br>')}</p>`,
      foot: `<button class="btn" type="button" id="b">요원 확인</button>${AGENT_NOTE}`,
    });
    bindPics();
    $('#b').addEventListener('click', onOk);
  }

  function pipFace(v) {
    const pips = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] }[v];
    return Array.from({ length: 9 }, (_, k) => `<s class="${pips.includes(k + 1) ? 'on' : ''}${v === 1 ? ' big' : ''}"></s>`).join('');
  }
  function gameDice(n) {
    const g = stageOf(n).game;
    frame({
      timer: rec(n).startAt,
      body: `<h1 class="h1 q-title">${esc(g.question)}</h1>
        <div class="dice-grid">${[1, 2, 3, 4, 5, 6].map((v) => `<button class="die-btn" type="button" data-v="${v}" aria-label="${v}">${pipFace(v)}</button>`).join('')}</div>
        <p class="pick-note">한 번만 입력할 수 있어요</p>`,
    });
    $$('.die-btn').forEach((b) => b.addEventListener('click', () => {
      const v = Number(b.dataset.v);
      dialog(String(v), `${v}로 확정할까요?<br>바꿀 수 없어요`, () => finishGame(n, { dice: v, input: `주사위 ${v}` }));
    }));
  }
  function gameLottery(n) {
    const g = stageOf(n).game;
    frame({
      timer: rec(n).startAt,
      body: `<h1 class="h1 q-title">${esc(g.question)}</h1>
        <div class="lot-grid"><button class="lot-btn win" type="button" data-v="win">${ICON.star}당첨</button><button class="lot-btn lose" type="button" data-v="lose">${ICON.cloud}꽝</button></div>
        <p class="pick-note">한 번만 입력할 수 있어요</p>`,
    });
    $$('.lot-btn').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.v, label = v === 'win' ? '당첨' : '꽝';
      dialog(label, `${label}으로 확정할까요?<br>바꿀 수 없어요`, () => finishGame(n, { lottery: v, input: label }, v === 'win' ? 'result' : 'penalty'));
    }));
  }
  function gameCount(n) {
    const g = stageOf(n).game;
    let v = g.min;
    frame({
      timer: rec(n).startAt,
      body: `<h1 class="h1 q-title">${esc(g.question)}</h1>
        <div class="counter"><button type="button" id="minus" aria-label="하나 빼기">−</button><output id="val" aria-live="polite">${v}</output><button type="button" id="plus" aria-label="하나 더하기">+</button></div>
        <p class="counter-unit">개</p><p class="pick-note">한 번만 입력할 수 있어요</p>`,
      foot: `<button class="btn" type="button" id="b">입력하기</button>`,
    });
    const paint = () => { $('#val').textContent = v; $('#minus').disabled = v <= g.min; $('#plus').disabled = v >= g.max; };
    $('#minus').addEventListener('click', () => { v = Math.max(g.min, v - 1); paint(); });
    $('#plus').addEventListener('click', () => { v = Math.min(g.max, v + 1); paint(); });
    $('#b').addEventListener('click', () => dialog(`${v}개`, `${v}개로 확정할까요?<br>바꿀 수 없어요`, () => finishGame(n, { count: v, input: `${v}개` })));
    paint();
  }
  function gameQuiz(n) {
    const g = stageOf(n).game, r = rec(n);
    r.quiz = r.quiz || { i: 0, wrong: g.questions.map(() => 0) };
    const qi = r.quiz.i, Q = g.questions[qi];
    const pts = () => Math.max(g.floor, g.perQuestion - g.penalty * r.quiz.wrong[qi]);
    frame({
      timer: r.startAt,
      body: `<div class="qz-head"><span>문제 ${qi + 1} / ${g.questions.length}</span><b class="qz-pts" id="pts">${pts()}점</b></div>
        <h1 class="h1 qz-q">${esc(Q.q)}</h1>
        <div class="opts" id="opts">${Q.options.map((o, i) => `<button class="opt" type="button" data-i="${i}"><em>${'①②③④'[i]}</em>${esc(o)}</button>`).join('')}</div>
        <p class="qz-msg" id="msg" aria-live="polite"></p>`,
    });
    $$('.opt').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      if (i === Q.answer) {
        b.classList.add('right'); $('#opts').classList.add('lock');
        const msg = $('#msg'); msg.className = 'qz-msg good'; msg.textContent = Q.note;
        const t = setTimeout(() => {
          if (qi < g.questions.length - 1) { r.quiz.i += 1; save(); gameQuiz(n); } else finishGame(n, { input: `퀴즈 오답 ${r.quiz.wrong.join('·')}` });
        }, 1100);
        cleanup.push(() => clearTimeout(t));
      } else {
        r.quiz.wrong[qi] += 1; save();
        b.classList.remove('wrong', 'shake'); void b.offsetWidth; b.classList.add('wrong', 'shake');
        const msg = $('#msg'); msg.className = 'qz-msg bad'; msg.textContent = '다시 찾아보세요';
        const p = $('#pts'); p.textContent = `${pts()}점`; p.classList.remove('drop'); void p.offsetWidth; p.classList.add('drop');
      }
    }));
  }
  function gameArrange(n) {
    const g = stageOf(n).game.arrange, r = rec(n);
    r.arrange = r.arrange || { placed: [], wrong: 0 };
    const tray = CO.stages.map((s) => s.letter);
    const pts = () => Math.max(g.floor, g.points - g.penalty * r.arrange.wrong);
    frame({
      timer: r.startAt,
      body: `<div class="qz-head"><span>마지막 문제</span><b class="qz-pts" id="pts">${pts()}점</b></div>
        <h1 class="h1 qz-q">${esc(g.title)}</h1>
        <div class="slots" id="slots"></div>
        <p class="tray-lab">모은 활자</p><div class="tray" id="tray"></div>
        <p class="qz-msg bad" id="msg" aria-live="polite"></p>`,
      foot: `<button class="btn" type="button" id="b">완성하기</button>`,
    });
    const placed = r.arrange.placed;
    const paint = () => {
      $('#slots').innerHTML = Array.from({ length: 6 }, (_, i) => placed[i] !== undefined
        ? `<button class="slot on" type="button" data-s="${i}" aria-label="${tray[placed[i]]} 빼기"><span class="tile">${tray[placed[i]]}</span></button>`
        : '<span class="slot"></span>').join('');
      $('#tray').innerHTML = tray.map((l, i) => `<button class="tile${placed.includes(i) ? ' used' : ''}" type="button" data-t="${i}">${l}</button>`).join('');
      $$('#slots [data-s]').forEach((b) => b.addEventListener('click', () => { placed.splice(Number(b.dataset.s), 1); save(); paint(); }));
      $$('#tray [data-t]').forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.t); if (placed.includes(i) || placed.length >= 6) return; placed.push(i); save(); paint(); }));
      $('#b').classList.toggle('off', placed.length < 6);
    };
    $('#b').addEventListener('click', () => {
      if (placed.length < 6) return;
      const word = placed.map((i) => tray[i]).join('');
      if (word === CO.answer) { finishGame(n, { solved: true, input: word }); return; }
      r.arrange.wrong += 1; placed.length = 0; save();
      $('#msg').textContent = '순서가 달라요';
      const p = $('#pts'); p.textContent = `${pts()}점`; p.classList.remove('drop'); void p.offsetWidth; p.classList.add('drop');
      const sl = $('#slots'); sl.classList.remove('shake'); void sl.offsetWidth; sl.classList.add('shake');
      paint();
    });
    paint();
  }

  /* C-06 결과 연출 */
  function screenResult(n) {
    const s = stageOf(n), r = rec(n);
    r.shown = true; save();
    let spec = s.result, value = '';
    if (s.game.type === 'lottery') spec = s.result[r.lottery];
    if (s.game.type === 'dice') value = r.dice;
    if (s.game.type === 'count') value = r.count;
    const pts = stagePoints(n, myRaw(n));
    const video = spec.video.replace('{value}', value);
    const text = fill(spec.text, { grade: pts.grade, luck: pts.luck, value });
    app.className = 'dark';
    app.innerHTML = `<div class="stage" id="stage"><div class="media" id="m"></div></div>`;
    let ready = false, moved = false;
    const next = () => {
      if (!ready || moved) return; moved = true;
      if (r.status === 'penalty') screenPenalty(n); else screenAR(n);
    };
    $('#stage').addEventListener('click', next);
    const letters = CO.stages.map((x) => x.hanja);
    FX.play($('#m'), { video, scene: spec.scene, opts: { value, letters } }).then(() => {
      if (!$('#stage')) return;
      const t = document.createElement('p');
      t.className = 'cap gold result-text'; t.textContent = text;
      const h = document.createElement('p'); h.className = 'tap-next'; h.textContent = '화면을 누르면 넘어가요';
      $('#stage').append(t, h);
      ready = true;
      const tm = setTimeout(next, 2600);
      cleanup.push(() => clearTimeout(tm));
    });
  }

  /* C-07 벌칙 미션 */
  function screenPenalty(n) {
    const r = rec(n);
    if (r.penaltyIdx === undefined) { r.penaltyIdx = 0; save(); }
    const p = CO.penalties[r.penaltyIdx];
    frame({
      timer: r.startAt,
      body: `<span class="penalty-tag">벌칙 미션</span><p class="h1 penalty-body">${p.map(esc).join('<br>')}</p><p class="penalty-reward">${esc(CO.penaltyReward)}</p>`,
      mainCls: 'center',
      foot: `<button class="btn" type="button" id="b">요원 확인</button>${AGENT_NOTE}`,
    });
    $('#b').addEventListener('click', () => { Object.assign(r, { penaltyDone: true, status: 'result', endAt: now() }); save(); screenAR(n); });
  }

  /* 증강현실: 카메라 화면 위에 활자가 떠서 돈다. 눌러 잡으면 보관함으로 */
  function screenAR(n) {
    const s = stageOf(n), r = rec(n);
    app.className = 'dark';
    const got = lettersGot();
    const mini = CO.stages.map((x) => (rec(x.no).grabbed ? `<i class="on">${x.letter}</i>` : x.no === n ? `<i data-new>${''}</i>` : '<i></i>'));
    app.innerHTML = `<div class="ar" id="ar">
      <div class="ar-bg" id="bg"><div class="ar-paint">${ART.places[s.art]()}</div></div>
      <div class="ar-vignette"></div><div class="ar-hud"><i></i><i></i><i></i><i></i></div>
      <div class="ar-top"><p class="cap sm">활자가 나타났다!</p><span class="ar-cam" id="cam" hidden><i></i>카메라</span></div>
      <div class="ar-halo"></div>
      <div class="ar-orbit">${Array.from({ length: 6 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
      <button class="ar-obj" type="button" id="obj" aria-label="${s.letter} 활자 잡기">${FX.typeBlock(s.hanja, { size: 128, spin: true, float: true })}</button>
      <div class="ar-bottom"><p class="tap-hint">활자를 눌러 잡으세요</p><div class="ar-box"><span>활자 보관함</span><span class="mini">${mini.join('')}</span><b id="cnt">${got.length}/6</b></div></div></div>`;
    let stream = null, stopped = false;
    const stop = () => { stopped = true; if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
    cleanup.push(stop);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then((st) => {
        if (stopped) { st.getTracks().forEach((t) => t.stop()); return; }
        stream = st;
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.srcObject = st;
        $('#bg').prepend(v);
        const p = v.play(); if (p && p.catch) p.catch(() => {});
        v.addEventListener('playing', () => { const pt = $('.ar-paint'); if (pt) pt.remove(); const c = $('#cam'); if (c) c.hidden = false; }, { once: true });
      }).catch(() => { /* 권한 없음: 그림 배경으로 같은 연출 */ });
    }
    let grabbed = false;
    $('#obj').addEventListener('click', () => {
      if (grabbed) return; grabbed = true;
      $('#ar').classList.add('got');
      const slot = $('.mini [data-new]');
      setTimeout(() => {
        if (!slot) return;
        slot.classList.add('on', 'new'); slot.textContent = s.letter;
        $('#cnt').textContent = `${got.length + 1}/6`;
      }, 650);
      const cap = document.createElement('p'); cap.className = 'cap gold ar-got'; cap.textContent = `${s.letter} 획득!`;
      const mem = document.createElement('p'); mem.className = 'ar-mem'; mem.textContent = s.memory || '';
      $('#ar').append(cap, mem);
      let left = false;
      const leave = () => { if (left) return; left = true; stop(); r.grabbed = true; r.grabbedAt = now(); save(); go(`/s/${n}/report`); };
      const t = setTimeout(leave, s.memory ? 4200 : 1700);
      const t2 = setTimeout(() => $('#ar') && $('#ar').addEventListener('click', leave), 1700);
      cleanup.push(() => { clearTimeout(t); clearTimeout(t2); });
    });
  }

  /* C-08 단계 성적표 / X-02 다시 보기 */
  function screenReport(n, again) {
    const s = stageOf(n);
    const st = standings(n);
    const my = st.me.stage[n];
    const prev = n > 1 ? standings(n - 1).me.rank : null;
    const cur = st.me.rank;
    const bar = (label, key, max, cls) => (max > 0
      ? `<div class="barrow seq"><span>${label}</span><div class="bar-track"><div class="bar-fill ${cls}" data-w="${Math.round((my[key] / max) * 100)}"></div></div><b>${my[key]}</b></div>`
      : `<div class="barrow seq"><span>${label}</span><div class="dash"></div><b>—</b></div>`);
    let move = `${cur}위`;
    if (prev) move = `${prev}위 → ${cur}위 ${cur < prev ? `<span class="up">▲${prev - cur}</span>` : cur > prev ? `<span class="down">▼${cur - prev}</span>` : ''}`;
    const count = CO.stages.filter((x) => x.no <= n && rec(x.no).grabbed).length;
    const last = n === N;
    frame({
      body: `${again ? '<p class="again">이미 끝낸 장소예요</p>' : ''}<h1 class="h1 rep-title">${n}단계 완료</h1>
        <div class="bars">${bar('속도', 'speed', s.max.speed, 'speed')}${bar('성적', 'grade', s.max.grade, 'grade')}${bar('행운', 'luck', s.max.luck, 'luck')}</div>
        <p class="rep-sum seq">이번 단계 <b>${my.total}</b>점 · ${st.stageRank}위</p>
        <div class="rep-letter seq"><div class="flip" id="flip"><div class="flip-in"><div class="flip-a"></div><div class="flip-b">${s.letter}</div></div></div><div class="rep-letter-txt"><p>활자 획득 <b>${count}/6</b></p>${s.memory ? `<p class="rep-mem">${esc(s.memory)}</p>` : ''}</div></div>
        <div class="rep-total seq"><p class="row1">종합 <b>${st.me.total}</b>점</p><p class="row2">${move}</p></div>`,
      mainCls: again ? 'no-anim' : '',
      foot: again ? `<button class="btn" type="button" id="b">내 차례로 돌아가기</button>` : `<button class="btn" type="button" id="b">${last ? '결과 보러 가기' : '다음 장소로'}</button>`,
    });
    const seq = $$('.seq');
    const show = (el) => { el.classList.add('in'); $$('.bar-fill', el).forEach((f) => { f.style.width = f.dataset.w + '%'; }); if (el.classList.contains('rep-letter')) setTimeout(() => $('#flip') && $('#flip').classList.add('on'), 150); };
    if (again || FX.reduce) seq.forEach(show);
    else seq.forEach((el, i) => { const t = setTimeout(() => show(el), 200 + i * 400); cleanup.push(() => clearTimeout(t)); });
    $('#b').addEventListener('click', () => {
      if (again) return go(canonical());
      const r = rec(n);
      r.status = 'done'; r.doneAt = now();
      r.scores = { speed: my.speed, grade: my.grade, luck: my.luck, stageRank: st.stageRank, rank: cur };
      if (last) { S.phase = 'final'; S.final.step = 'rank'; S.final.finishedAt = now(); }
      else { S.current = n + 1; Object.assign(rec(n + 1), { status: 'open', openAt: now() }); }
      save();
      go(canonical());
    });
  }

  /* =========================================================
   * D. 마무리
   * ======================================================= */
  function finalSnapshot() {
    const st = standings(N);
    const me = st.me;
    const myTeam = st.teams.find((t) => t.team === S.user.team);
    const awards = computeAwards();
    const mine = awards.filter((a) => a.mine);
    S.final.result = { total: me.total, speed: me.speed, grade: me.grade, luck: me.luck, rank: me.rank, teamRank: myTeam ? myTeam.rank : null, awards: mine.map((a) => a.a.name) };
    return { st, me, myTeam, awards, mine };
  }

  function screenFinalRank() {
    const { st, me, myTeam } = finalSnapshot(); save();
    const bar = (label, v, cls) => `<div class="barrow"><span>${label}</span><div class="bar-track"><div class="bar-fill ${cls}" data-w="${Math.round((v / 180) * 100)}"></div></div><b>${v}</b></div>`;
    frame({
      status: true,
      body: `<h1 class="h1">최종 결과</h1>
        <div class="final-rank"><p class="big"><span id="rk">${st.size}</span><small>위</small></p><p class="of">${st.size}명 중</p></div>
        <p class="final-total">종합 <b>${me.total}</b>점</p>
        <div class="bars">${bar('속도', me.speed, 'speed')}${bar('성적', me.grade, 'grade')}${bar('행운', me.luck, 'luck')}</div>
        <p class="final-team">우리 조 <b>${myTeam.rank}</b>위</p>
        <button class="btn ghost final-more" type="button" id="all">전체 순위 보기</button>`,
      foot: `<button class="btn" type="button" id="b">시상식 보기</button>`,
    });
    const el = $('#rk');
    let v = st.size;
    const target = me.rank;
    const stepMs = FX.reduce ? 0 : Math.max(40, 1400 / Math.max(1, st.size - target));
    const tick = () => { if (v > target) { v -= 1; el.textContent = v; const t = setTimeout(tick, stepMs + (v - target < 4 ? 120 : 0)); cleanup.push(() => clearTimeout(t)); } else { $$('.bar-fill').forEach((f) => { f.style.width = f.dataset.w + '%'; }); } };
    const t0 = setTimeout(tick, 400); cleanup.push(() => clearTimeout(t0));
    $('#all').addEventListener('click', sheetRank);
    $('#b').addEventListener('click', () => { S.final.step = 'awards'; S.final.award = 0; save(); go(canonical()); });
  }

  function screenAwards() {
    const { awards } = finalSnapshot();
    const i = Math.min(S.final.award || 0, awards.length - 1);
    const a = awards[i];
    const last = i === awards.length - 1;
    app.className = 'dark';
    app.innerHTML = `<div class="pager" style="padding-top:18px">${awards.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="award-wrap"><article class="acard${a.mine ? ' mine' : ''}">${a.mine ? '<p class="mine-band">내 보상에 담겼어요</p>' : ''}
        <div class="acard-art"><div id="m"></div></div><h1 class="cap gold acard-name">${esc(a.a.name)}</h1>
        <p class="acard-who">${esc(a.who)}</p><p class="acard-rec">${esc(fill(a.a.line, { score: a.score }))}</p></article></div>
      <footer class="foot"><button class="btn" type="button" id="b">${last ? '랜덤 보상 뽑기' : '다음'}</button></footer>`;
    FX.play($('#m'), { video: CO.awardVideo, scene: 'trophy' });
    if (a.mine) FX.confetti(app);
    $('#b').addEventListener('click', () => {
      if (last) { S.final.step = 'lucky'; save(); go(canonical()); return; }
      S.final.award = i + 1; save(); screenAwards();
    });
  }

  function screenLucky() {
    const L = CO.lucky;
    app.className = 'dark';
    const opened = !!S.final.lucky;
    app.innerHTML = `<div class="lucky"><h1 class="cap gold lucky-title">완주 보상</h1><p class="lucky-desc" id="desc">${opened ? '' : '상자를 눌러 열어 보세요'}</p>
      <button class="lucky-box" type="button" id="boxbtn" aria-label="보물 상자 열기"><div id="box"></div></button>
      <div id="out">${opened ? prizeHtml(S.final.lucky) : '<p class="lucky-once">한 번만 열 수 있어요</p>'}</div></div>
      <footer class="foot" id="ft">${opened ? '<button class="btn" type="button" id="b">수료 카드 받기</button>' : ''}</footer>`;
    const box = $('#box');
    function prizeHtml(name) { return `<p class="lucky-prize-lab">완주 보상</p><p class="cap gold lucky-prize">${esc(name)}</p>`; }
    const bindNext = () => $('#b').addEventListener('click', () => { S.final.step = 'card'; save(); go(canonical()); });
    const showOpen = async (animate) => {
      const ok = await FX.hasVideo(L.video);
      if (ok && animate) { await FX.play(box, { video: L.video, scene: 'chest' }); }
      else { await FX.play(box, { video: null, scene: 'chest' }); const c = $('.fx-chest', box); if (c) c.classList.add('open'); }
    };
    if (opened) { showOpen(false); bindNext(); return; }
    FX.play(box, { video: null, scene: 'chest' });
    let busy = false;
    $('#boxbtn').addEventListener('click', async () => {
      if (busy || S.final.lucky) return; busy = true;
      const total = L.items.reduce((s, x) => s + x.chance, 0);
      let roll = Math.random() * total, prize = L.items[L.items.length - 1].name;
      for (const it of L.items) { if (roll < it.chance) { prize = it.name; break; } roll -= it.chance; }
      S.final.lucky = prize; S.final.luckyAt = now(); save();
      $('#desc').textContent = '';
      const ok = await FX.hasVideo(L.video);
      if (ok) await FX.play(box, { video: L.video, scene: 'chest' });
      else { const c = $('.fx-chest', box); if (c) c.classList.add('open'); await FX.wait(900); }
      if (!$('#out')) return;
      $('#out').innerHTML = prizeHtml(prize);
      FX.confetti(app);
      $('#ft').innerHTML = '<button class="btn" type="button" id="b">수료 카드 받기</button>';
      bindNext();
    });
  }

  function cardData() {
    const res = S.final.result || finalSnapshot().me;
    const r = S.final.result;
    const d = new Date(S.final.finishedAt || now());
    return {
      title: CO.title, letters: CO.answer.split(''), name: S.user.name, team: S.user.team,
      rank: r.rank, total: r.total, awards: r.awards.length ? r.awards.join(', ') : '완주',
      time: dur((S.final.finishedAt || now()) - S.user.joinedAt),
      date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
      res,
    };
  }
  function screenCard() {
    if (!S.final.result) { finalSnapshot(); save(); }
    const c = cardData();
    const prizes = CO.awards.filter((a) => S.final.result.awards.includes(a.name)).map((a) => a.prize);
    if (S.final.lucky) prizes.push(S.final.lucky);
    const got = S.final.received;
    frame({
      body: `<article class="ccard" id="ccard"><p class="ccard-title">${esc(c.title)}</p>
        <div class="ccard-letters">${c.letters.map((l) => `<span>${l}</span>`).join('')}</div>
        <p class="ccard-name">${esc(c.name)} · ${c.team}조</p><p class="ccard-rank">${c.rank}위 · ${c.total}점</p>
        <p class="ccard-award">${esc(c.awards)}</p><p class="ccard-meta">소요 시간 ${c.time}<br>${c.date}</p><div class="ccard-seal">직지<br>수료</div></article>
        <section class="rewards"><h3>받을 보상</h3>${prizes.map((p) => `<div class="reward${got ? ' got' : ''}"><span>${esc(p)}</span><span>${got ? '수령 완료' : '수령 전'}</span></div>`).join('')}</section>
        <button class="btn ghost save-btn" type="button" id="save">카드 저장</button>`,
      foot: got ? '' : `<button class="btn" type="button" id="b">수령 완료</button><p class="note">요원에게 이 화면을 보여 주세요</p>${AGENT_NOTE}`,
    });
    $('#save').addEventListener('click', saveCard);
    if (!got) $('#b').addEventListener('click', () => { S.final.received = true; S.final.receivedAt = now(); save(); screenCard(); band('수령 완료', true); });
  }

  /* 수료 카드를 이미지로 저장 (AWARD-09) */
  async function saveCard() {
    const c = cardData();
    try { await document.fonts.ready; } catch (e) { /* 글꼴 대기 실패 시 기본 글꼴 */ }
    const W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    const K = ART.colors;
    x.fillStyle = K.INK; x.fillRect(0, 0, W, H);
    x.strokeStyle = K.GOLD; x.lineWidth = 14; x.strokeRect(40, 40, W - 80, H - 80);
    x.strokeStyle = 'rgba(244,210,122,.35)'; x.lineWidth = 3; x.strokeRect(70, 70, W - 140, H - 140);
    x.fillStyle = K.GOLD_HI; x.font = '72px "Black Han Sans"'; x.textBaseline = 'top';
    x.fillText(c.title, 120, 130);
    const tw = 120, gap = 24;
    c.letters.forEach((l, i) => {
      const lx = 120 + i * (tw + gap), ly = 290;
      const g = x.createRadialGradient(lx + 40, ly + 36, 6, lx + 60, ly + 60, 100);
      g.addColorStop(0, '#F8DC8C'); g.addColorStop(.5, K.GOLD); g.addColorStop(1, '#A9781F');
      x.fillStyle = g; x.fillRect(lx, ly, tw, tw);
      x.strokeStyle = '#5B3F12'; x.lineWidth = 6; x.strokeRect(lx, ly, tw, tw);
      x.fillStyle = K.INK; x.font = '900 80px "Noto Serif KR"'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(l, lx + tw / 2, ly + tw / 2 + 4);
      x.textAlign = 'left'; x.textBaseline = 'top';
    });
    x.fillStyle = K.PAPER; x.font = '96px "Black Han Sans"'; x.fillText(`${c.name} · ${c.team}조`, 120, 510);
    x.fillStyle = K.GOLD_HI; x.font = '84px "Black Han Sans"'; x.fillText(`${c.rank}위 · ${c.total}점`, 120, 640);
    x.fillStyle = K.PAPER; x.font = '700 56px "IBM Plex Sans KR"'; x.fillText(c.awards, 120, 770);
    x.fillStyle = '#D9CDB2'; x.font = '500 44px "IBM Plex Sans KR"';
    x.fillText(`소요 시간 ${c.time}`, 120, 880); x.fillText(c.date, 120, 945);
    x.save(); x.translate(860, 1090); x.rotate(-0.17);
    x.strokeStyle = K.SEAL; x.lineWidth = 12; x.strokeRect(-90, -90, 180, 180);
    x.fillStyle = K.SEAL; x.font = '900 52px "Noto Serif KR"'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('직지', 0, -32); x.fillText('수료', 0, 36); x.restore();
    x.fillStyle = 'rgba(243,234,214,.6)'; x.font = '500 30px "IBM Plex Sans KR"'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText(CO.platform, 120, 1210);
    const url = cv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = `수료카드_${S.user.id}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    band('카드를 이미지로 저장했어요', true);
  }

  /* =========================================================
   * E. 상시 메뉴
   * ======================================================= */
  function sheetMe() {
    const m = myStatus();
    const k = m.k;
    const row = k ? m.st.me : { speed: 0, grade: 0, luck: 0, total: 0, stage: [] };
    const bar = (label, v, cls) => `<div class="barrow"><span>${label}</span><div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.round((v / 180) * 100)}%"></div></div><b>${v}</b></div>`;
    const u = S.user;
    sheet('내 현황', `<div class="me-head"><span class="tag">${esc(u.id)}</span><b>${esc(u.name)}</b><span>${u.team}조</span></div>
      <p class="me-total">종합 <b>${row.total}</b>점</p>
      <div class="bars">${bar('속도', row.speed, 'speed')}${bar('성적', row.grade, 'grade')}${bar('행운', row.luck, 'luck')}</div>
      <div class="stage-list">${CO.stages.map((s) => {
        const st = s.no <= k ? row.stage[s.no] : null;
        const parts = st ? [['속도', st.speed, s.max.speed], ['성적', st.grade, s.max.grade], ['행운', st.luck, s.max.luck]].filter((x) => x[2] > 0).map((x) => `${x[0]} ${x[1]}`).join(' · ') + ` · ${durS(st.time)}` : '';
        return `<div class="srow${st ? '' : ' off'}"><span class="n">${s.no}</span><span class="p">${esc(s.place)}${st ? `<small>${parts}</small>` : ''}</span><span class="t">${st ? st.total : ''}</span></div>`;
      }).join('')}</div>`);
  }

  function sheetVault() {
    const got = CO.stages.filter((s) => rec(s.no).grabbed);
    const w = sheet(`활자 보관함 ${got.length} / 6`, `<div class="vault-list">${Array.from({ length: 6 }, (_, i) => {
      const g = got[i];
      return g
        ? `<button class="vrow" type="button" data-n="${g.no}" aria-label="${g.letter} — ${esc(g.place)} 이야기 다시 보기"><span class="vt">${g.letter}</span><span class="vm"><small>${g.no}단계 ${esc(g.place)}</small>${esc(g.memory || '')}</span></button>`
        : '<div class="vrow off"><span class="vt"></span><span class="vm"></span></div>';
    }).join('')}</div>
      <p class="vault-note">활자를 누르면 그 장소의<br>이야기를 다시 볼 수 있어요</p>`);
    $$('[data-n]', w).forEach((b) => b.addEventListener('click', () => storyReplay(Number(b.dataset.n))));
  }
  /* E-02 → 그 장소 자막 6장 다시 보기 (C-03과 같은 화면, 닫으면 보관함으로) */
  function storyReplay(n) {
    const s = stageOf(n);
    const w = document.createElement('div');
    w.className = 'sheet-wrap story-over';
    w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', `${n}단계 ${s.place} 이야기`);
    w.innerHTML = storyHtml(n, s, `<button class="x story-x" type="button" aria-label="닫기">${ICON.x}</button>`);
    app.appendChild(w);
    const close = () => { const f = w._clean; w._clean = null; w.remove(); if (f) f(); };
    w._close = close;
    w._clean = runStory(w, s, '닫기', close);
    $('.story-x', w).addEventListener('click', (e) => { e.stopPropagation(); close(); });
  }

  function sheetRank() {
    const k = S.phase === 'final' ? N : completedCount();
    let tab = 'me';
    const w = sheet('순위표', `<div class="tabs" role="tablist"><button type="button" role="tab" data-t="me" aria-selected="true">개인</button><button type="button" role="tab" data-t="team" aria-selected="false">조</button></div><div id="rl"></div>`);
    const paint = () => {
      const box = $('#rl', w);
      if (!k) { box.innerHTML = '<p class="vault-note">첫 단계를 끝내면 순위가 나와요</p>'; return; }
      const st = standings(k);
      if (tab === 'me') {
        const myIdx = st.me.rank - 1;
        const show = new Set([...Array(10).keys(), myIdx - 2, myIdx - 1, myIdx, myIdx + 1, myIdx + 2].filter((i) => i >= 0 && i < st.rows.length));
        let html = '', lastI = -1;
        [...show].sort((a, b) => a - b).forEach((i) => {
          if (lastI >= 0 && i > lastI + 1) html += '<p class="rgap">· · ·</p>';
          const r = st.rows[i];
          html += `<div class="rrow${r.p.me ? ' me' : ''}"><span class="r">${i + 1}</span><span>${r.p.team}조 ${esc(r.p.me ? r.p.name : mask(r.p.name))}${r.p.me ? '<span class="tagme">나</span>' : ''}</span><span class="s">${r.total}</span></div>`;
          lastI = i;
        });
        box.innerHTML = `<div class="rank-list">${html}</div>`;
      } else {
        box.innerHTML = `<div class="rank-list">${st.teams.map((t) => `<div class="rrow${S.user && t.team === S.user.team ? ' me' : ''}"><span class="r">${t.rank}</span><span>${t.team}조${S.user && t.team === S.user.team ? '<span class="tagme">우리 조</span>' : ''}</span><span class="s">${t.total}</span></div>`).join('')}</div>`;
      }
    };
    $$('[role=tab]', w).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.t; $$('[role=tab]', w).forEach((x) => x.setAttribute('aria-selected', String(x === b))); paint(); }));
    paint();
  }

  function sheetHelp() {
    const tiers = CO.speedTiers.map((t, i) => `<tr><td>${i === CO.speedTiers.length - 1 ? '그 밖' : `상위 ${Math.round(t.top * 100)}%`}</td><td>${t.points}점</td></tr>`).join('');
    const gradeRows = CO.stages.filter((s) => s.max.grade).map((s) => `<tr><td>${s.no}단계 ${esc(s.quest.name)}</td><td>${s.max.grade}점</td></tr>`).join('');
    const luckRows = CO.stages.filter((s) => s.max.luck).map((s) => `<tr><td>${s.no}단계 ${esc(s.quest.name)}</td><td>${s.max.luck}점</td></tr>`).join('');
    sheet('규칙·도움말', `
      <details class="acc" open><summary>속도 점수</summary><div><p>게임 시작부터 결과 확정까지 걸린 시간으로 순서를 매겨요. 이동 시간은 재지 않아요.</p><table>${tiers}</table></div></details>
      <details class="acc"><summary>성적 점수</summary><div><p>퀴즈 정답, 맞힌 개수, 활동 통과로 정해져요.</p><table>${gradeRows}</table></div></details>
      <details class="acc"><summary>행운 점수</summary><div><p>주사위 눈과 복불복 결과로 정해져요. 꽝이어도 벌칙 미션을 마치면 30점.</p><table>${luckRows}</table></div></details>
      <details class="acc"><summary>시상 종류</summary><div><table>${CO.awards.slice().reverse().map((a) => `<tr><td>${esc(a.name)}</td><td>${a.by === 'team' ? '조원 종합 점수 합 1위' : a.by === 'total' ? '종합 점수' : `${{ luck: '행운', grade: '성적', speed: '속도' }[a.by]} 점수 1위`}</td></tr>`).join('')}<tr><td>랜덤 보상</td><td>완주자 전원</td></tr></table><p>종합 1~3위가 부문상과 겹치면 부문상은 다음 순위에게 가요.</p></div></details>
      <details class="acc"><summary>QR이 안 찍혀요</summary><div>카메라 권한을 허용해 주세요. 폰 기본 카메라로 찍어도 됩니다.</div></details>
      <details class="acc"><summary>잘못 입력했어요</summary><div>확정 전에는 [다시 고르기]로 바꿀 수 있어요. 확정한 뒤에는 바꿀 수 없어요.</div></details>
      <details class="acc"><summary>화면이 꺼졌어요</summary><div>다시 열면 하던 화면으로 돌아와요. 기록은 이 폰에 남아 있어요.</div></details>
      <details class="acc"><summary>모은 활자는 어디서 보나요?</summary><div>위쪽 "활자" 칸을 누르면 활자 보관함이 열려요.</div></details>`);
  }

  /* =========================================================
   * X-03 통신 끊김
   * ======================================================= */
  function offlineShow() {
    if ($('.offline-wrap')) return;
    const w = document.createElement('div');
    w.className = 'offline-wrap';
    w.innerHTML = `<div class="sheet-back"></div><div class="dialog" role="alertdialog" aria-modal="true"><p class="h2">연결이 잠깐 끊겼어요</p><p>기록은 그대로 남아 있어요</p><div style="margin-top:20px"><button class="btn" type="button">다시 시도</button></div></div>`;
    app.appendChild(w);
    w.querySelector('.btn').addEventListener('click', () => {
      if (navigator.onLine) { w.remove(); route(); } else { const d = w.querySelector('.dialog'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); }
    });
  }
  window.addEventListener('offline', offlineShow);
  window.addEventListener('online', () => { const w = $('.offline-wrap'); if (w) w.remove(); });

  /* =========================================================
   * X-04 시연 도구 (로고 5번)
   * ======================================================= */
  function demoUser() {
    if (S.user) return;
    const t = now() - 100 * 60000;
    S.user = { id: '3조-07', no: '07', name: '김하늘', phone: '', school: CO.join.schools[1], grade: 2, cls: 3, team: 3, consentRequired: { agreed: true, at: t }, consentOptional: { agreed: false, at: null }, joinedAt: t, demo: true };
  }
  function fillStage(n, raw, sec, base) {
    const start = base, end = base + sec * 1000;
    S.stages[n] = {
      status: 'done', openAt: start - 300000, arriveAt: start - 120000, storyAt: start - 60000, startAt: start, endAt: end, shown: true, grabbed: true, grabbedAt: end + 30000, doneAt: end + 60000,
      pass: true, dice: raw.dice, lottery: raw.lottery, penaltyDone: raw.lottery === 'lose', penaltyIdx: 0, count: raw.count,
      quiz: { i: 2, wrong: raw.quiz.slice() }, photo: true, solved: true, arrange: { placed: [], wrong: raw.final },
    };
    return end + 15 * 60000;
  }
  function demoJump(n, screen) {
    demoUser();
    const F = CO.demoFill;
    let base = S.user.joinedAt + 8 * 60000;
    S.stages = {};
    for (let j = 1; j < n; j++) base = fillStage(j, F, F.t[j - 1], base);
    S.phase = 'stages'; S.current = n; S.introStep = 1;
    S.final = blank().final;
    const r = rec(n);
    const t = now();
    if (screen === 'C-01') Object.assign(r, { status: 'open', openAt: t });
    if (screen === 'C-03') Object.assign(r, { status: 'arrived', openAt: t, arriveAt: t });
    if (screen === 'C-04') Object.assign(r, { status: 'quest', openAt: t, arriveAt: t, storyAt: t });
    if (screen === 'C-05') Object.assign(r, { status: 'playing', openAt: t, arriveAt: t, storyAt: t, startAt: t });
    if (screen === 'C-08') { fillStage(n, F, F.t[n - 1], t - F.t[n - 1] * 1000 - 60000); r.status = 'result'; S.stages[n].status = 'result'; }
    save();
    go(canonical());
  }
  function demoForce(mode) {
    demoUser();
    const vs = virtualPeople();
    const slow = (k) => Math.max(...vs.map((v) => v.t[k])) + 40;
    const mid = (k) => vs.map((v) => v.t[k]).sort((a, b) => a - b)[Math.floor(vs.length / 2)];
    const plans = {
      first: { raw: { dice: 6, lottery: 'win', count: 10, quiz: [0, 0, 0], final: 0 }, t: (k) => Math.min(...vs.map((v) => v.t[k])) - 5 },
      lucky: { raw: { dice: 6, lottery: 'win', count: 1, quiz: [3, 3, 3], final: 2 }, t: slow },
      none: { raw: { dice: 2, lottery: 'lose', count: 4, quiz: [2, 1, 2], final: 1 }, t: mid },
    };
    const P = plans[mode];
    S.stages = {};
    let base = S.user.joinedAt + 8 * 60000;
    for (let j = 1; j <= N; j++) base = fillStage(j, P.raw, Math.max(5, P.t(j - 1)), base);
    S.phase = 'final'; S.current = N; S.introStep = 1;
    S.final = blank().final;
    S.final.finishedAt = base; S.final.forced = mode;
    save();
    go(canonical());
  }
  function qrURL(n) {
    const baseURL = location.href.split('#')[0];
    return n ? `${baseURL}#/s/${n}?k=${encodeURIComponent(stageOf(n).code)}` : `${baseURL}#/`;
  }
  function qrImg(text) {
    const qr = window.qrcode(0, 'M');
    qr.addData(text); qr.make();
    return qr.createDataURL(6, 2);
  }
  function sheetDemo() {
    closeSheets();
    let jumpStage = S.current || 1, jumpScreen = 'C-01';
    let levelChanged = false;
    const w = sheet('시연 도구', `
      <section class="demo-sec"><h3>처음부터 다시</h3><p>가입과 진행 기록을 모두 지우고 시작 화면으로 갑니다.</p><div class="seg"><button type="button" id="d-reset">처음부터 다시</button></div></section>
      <section class="demo-sec"><h3>단계 이동</h3><p>앞 단계는 예시 기록(주사위 5, 퀴즈 1번 틀림, 꽝+벌칙, 8개)으로 채웁니다.</p>
        <div class="seg" id="d-stage">${CO.stages.map((s) => `<button type="button" data-v="${s.no}" aria-pressed="${s.no === jumpStage}">${s.no}단계</button>`).join('')}</div>
        <div class="seg" id="d-screen">${[['C-01', '이동 안내'], ['C-03', '장소 이야기'], ['C-04', '퀘스트 창'], ['C-05', '게임'], ['C-08', '성적표']].map(([k, l]) => `<button type="button" data-v="${k}" aria-pressed="${k === jumpScreen}">${l}</button>`).join('')}</div>
        <div class="seg"><button type="button" id="d-go">이동</button></div></section>
      <section class="demo-sec"><h3>가상 참가자 수준</h3><p>바꾸면 순위가 다시 계산됩니다.</p><div class="seg" id="d-level">${Object.keys(CO.levels).map((k) => `<button type="button" data-v="${k}" aria-pressed="${S.level === k}">${CO.levels[k].label}</button>`).join('')}</div></section>
      <section class="demo-sec"><h3>결과 강제</h3><p>6단계까지 채우고 최종 결과부터 봅니다.</p><div class="seg" id="d-force"><button type="button" data-v="first">내가 1위</button><button type="button" data-v="lucky">내가 행운상</button><button type="button" data-v="none">수상 없음</button></div></section>
      <section class="demo-sec"><h3>QR 주소 보기</h3><p>인쇄해서 실제로 찍어 볼 수 있습니다.</p><div class="qr-grid">${[0, 1, 2, 3, 4, 5, 6].map((n) => `<div class="qr-item"><img alt="" src="${qrImg(qrURL(n))}"><b>${n ? `${n}단계 ${esc(stageOf(n).place)}` : '입장 QR'}</b><code>${esc(qrURL(n))}</code></div>`).join('')}</div></section>`);
    const pressGroup = (id, set) => $$(`#${id} button`, w).forEach((b) => b.addEventListener('click', () => { $$(`#${id} button`, w).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); set(b.dataset.v); }));
    $('#d-reset', w).addEventListener('click', () => { try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch (e) { /* 저장소 없음 */ } S = blank(); w._close(); history.replaceState(null, '', '#/'); route(); band('기록을 모두 지웠어요', true); });
    pressGroup('d-stage', (v) => { jumpStage = Number(v); });
    pressGroup('d-screen', (v) => { jumpScreen = v; });
    $('#d-go', w).addEventListener('click', () => { w._close(); demoJump(jumpStage, jumpScreen); });
    pressGroup('d-level', (v) => { S.level = v; levelChanged = true; save(); band(`가상 참가자 수준: ${CO.levels[v].label}`, true); });
    $$('#d-force button', w).forEach((b) => b.addEventListener('click', () => { w._close(); demoForce(b.dataset.v); }));
    w._clean = () => { if (levelChanged) { levelChanged = false; setTimeout(route, 0); } };
  }

  /* 시작 */
  route();
})();
