// Publication filtering: Highlights/All toggle, year dropdown, search box.
(function () {
  const pubs = Array.from(document.querySelectorAll('.pub'));
  const btnSelected = document.getElementById('btn-selected');
  const btnAll = document.getElementById('btn-all');
  const search = document.getElementById('search');
  const year = document.getElementById('year');
  const count = document.getElementById('count');

  const state = { selectedOnly: true, year: 'all', query: '' };

  function apply() {
    // Searching or filtering opens the full archive, like the original site.
    const filtering = state.query || state.year !== 'all';
    const useSelected = state.selectedOnly && !filtering;

    let shown = 0;
    pubs.forEach((p) => {
      const ok =
        (!useSelected || p.dataset.selected === 'true') &&
        (state.year === 'all' || p.dataset.year === state.year) &&
        (!state.query || p.textContent.toLowerCase().includes(state.query));
      p.hidden = !ok;
      if (ok) shown++;
    });

    btnSelected.classList.toggle('active', useSelected);
    btnAll.classList.toggle('active', !useSelected);
    count.textContent = 'Showing ' + shown + ' of ' + pubs.length + ' publications';
  }

  btnSelected.addEventListener('click', () => { state.selectedOnly = true; state.year = 'all'; state.query = ''; search.value = ''; year.value = 'all'; apply(); });
  btnAll.addEventListener('click', () => { state.selectedOnly = false; apply(); });

  search.addEventListener('input', () => { state.query = search.value.trim().toLowerCase(); apply(); });
  year.addEventListener('change', () => { state.year = year.value; apply(); });

  apply();
})();


// Anchor chain: drawn in the left margin, from the height of the About section down to the
// anchor's eye, in a gentle curve that bulges to the right, staying inside the margin. Links start
// small and transparent and grow larger and more opaque, as if hauled in from a distance through water.
//
// When the page changes size (window resize, rotating a phone, filtering the publications), the chain
// glides from its old position to its new one instead of jumping, and the anchor glides with it so the
// last link stays hooked through the eye.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#2e2a25';
  const SCENE_H = 450, BAR_DX = -1.67, BAR_Y = 45.12;   // must match the anchor scene in style.css
  const RING_SCENE_X = 260;                              // x of the eye inside the anchor scene
  const TAU = 140;                                       // ms; smaller = snappier glide
  const KEYS = ['p0x', 'p0y', 'barX', 'barY', 'S'];
  const EPS = { p0x: 0.15, p0y: 0.15, barX: 0.15, barY: 0.15, S: 0.001 };
  const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  let svg = null, layer = null, scene = null;
  const pool = [];
  let cur = null, tgt = null, rafId = 0, last = 0;

  function stadium(x, y, w, h, r) {
    return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) +
      'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
      'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) +
      'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
  }
  const FACE = stadium(-11, -22, 22, 44, 11) + stadium(-6, -17, 12, 34, 6);

  const DEFS =
    '<defs>' +
    '<pattern id="chh" width="6" height="1.9" patternUnits="userSpaceOnUse"><path d="M0 .95H6" stroke="' + INK + '" stroke-width=".7" fill="none"/></pattern>' +
    '<pattern id="chd" width="1.9" height="1.9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 .95H1.9" stroke="' + INK + '" stroke-width=".7" fill="none"/></pattern>' +
    '<pattern id="chx" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 .7H2.2M.7 0V2.2" stroke="' + INK + '" stroke-width=".7" fill="none"/></pattern>' +
    '<clipPath id="chr"><rect x="0" y="-30" width="20" height="60"/></clipPath>' +
    '<g id="lf">' +
      '<path d="' + FACE + '" fill-rule="evenodd" fill="url(#chd)" stroke="' + INK + '" stroke-width=".9"/>' +
      '<path d="' + FACE + '" fill-rule="evenodd" fill="url(#chx)" clip-path="url(#chr)"/>' +
    '</g>' +
    '<g id="le">' +
      '<rect x="-3.5" y="-22" width="7" height="44" rx="3.5" fill="url(#chh)" stroke="' + INK + '" stroke-width=".8"/>' +
      '<rect x="0" y="-22" width="3.5" height="44" rx="1.7" fill="url(#chx)"/>' +
    '</g>' +
    '</defs>';

  // Where everything should be for the page as it is right now
  function measure() {
    const body = document.body;
    const cs = getComputedStyle(document.documentElement);
    const S = parseFloat(cs.getPropertyValue('--s')) || 1;
    const ringX = parseFloat(cs.getPropertyValue('--ringx')) || 104;
    const W = body.clientWidth, H = body.offsetHeight;
    const about = document.getElementById('about');
    const y0 = about ? about.getBoundingClientRect().top + window.scrollY + 6 : 300;
    return {
      W: W, H: H, S: S,
      p0x: ringX - 30 * S, p0y: y0,                          // where the chain enters, at the height of About
      barX: ringX + BAR_DX * S,                              // inner edge of the eye's top bar, page coordinates
      barY: H - (SCENE_H - BAR_Y) * S
    };
  }

  function ensureSvg() {
    if (svg) return;
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'chain');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = DEFS + '<g></g>';
    layer = svg.lastChild;
    document.body.insertBefore(svg, document.body.firstChild);
    scene = document.querySelector('.scene');
  }

  // Draw the chain for a set of (possibly in-between) parameters
  function render(p) {
    const end = { x: p.barX, y: p.barY - 17 * p.S };       // centre of the last link; its inner surface rests on the bar
    const P0 = { x: p.p0x, y: p.p0y };
    const bulge = 36 * p.S;                                // positive bulge = toward the page content, inside the margin
    const P1 = { x: (P0.x + end.x) / 2 + 2 * bulge, y: (P0.y + end.y) / 2 };

    const N = 800, pts = [], cum = [0];
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      pts.push({
        x: u * u * P0.x + 2 * u * t * P1.x + t * t * end.x,
        y: u * u * P0.y + 2 * u * t * P1.y + t * t * end.y
      });
      if (i) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const total = cum[N];

    // Links are placed from the anchor backward, so the last link is always an edge-on link hooked
    // through the eye; they shrink and fade toward the far end.
    const items = [];
    let k = 0, s = total, idx = N - 1;
    while (s >= 0) {
      while (idx > 0 && cum[idx] > s) idx--;
      const a = pts[idx], b = pts[Math.min(idx + 1, N)];
      const seg = cum[Math.min(idx + 1, N)] - cum[idx];
      const f = seg > 0 ? (s - cum[idx]) / seg : 0;
      const u = s / total;
      const sc = (0.42 + 0.58 * Math.pow(u, 0.9)) * p.S;
      const op = 0.92 * Math.pow(u, 1.15);                 // transparent at the far end, opaque at the anchor
      if (op > 0.01) {
        items.push({
          href: k % 2 ? '#lf' : '#le',
          t: 'translate(' + (a.x + (b.x - a.x) * f).toFixed(1) + ' ' + (a.y + (b.y - a.y) * f).toFixed(1) +
             ') rotate(' + (Math.atan2(-(b.x - a.x), b.y - a.y) * 180 / Math.PI).toFixed(1) + ') scale(' + sc.toFixed(3) + ')',
          op: op.toFixed(3)
        });
      }
      s -= 34 * sc;
      k++;
    }

    while (pool.length < items.length) {
      const el = document.createElementNS(NS, 'use');
      layer.appendChild(el);
      pool.push(el);
    }
    while (pool.length > items.length) layer.removeChild(pool.pop());
    for (let i = 0; i < items.length; i++) {
      const el = pool[i], it = items[i];
      if (el._h !== it.href) { el.setAttribute('href', it.href); el._h = it.href; }
      el.setAttribute('transform', it.t);
      el.setAttribute('opacity', it.op);
    }
  }

  // Keep the anchor hooked to the chain while the chain is still gliding: the anchor has already jumped to its
  // new place in the layout, so offset it back to where the chain's end currently is.
  function placeScene() {
    if (!scene) return;
    const dx = cur.barX - tgt.barX, dy = cur.barY - tgt.barY, k = cur.S / tgt.S;
    if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(k - 1) < 0.0005) {
      scene.style.transform = ''; scene.style.willChange = ''; return;
    }
    scene.style.willChange = 'transform';
    scene.style.transformOrigin = ((RING_SCENE_X + BAR_DX) * tgt.S) + 'px ' + (BAR_Y * tgt.S) + 'px';
    scene.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
  }

  function apply() {
    svg.setAttribute('width', tgt.W);
    svg.setAttribute('height', tgt.H);
    svg.setAttribute('viewBox', '0 0 ' + tgt.W + ' ' + tgt.H);
    render(cur);
    placeScene();
  }

  function step(now) {
    rafId = 0;
    const dt = Math.min(64, now - last);
    last = now;
    const k = 1 - Math.exp(-dt / TAU);                     // ease toward the target; copes with a resize that is still in progress
    let moving = false;
    for (let i = 0; i < KEYS.length; i++) {
      const key = KEYS[i], d = tgt[key] - cur[key];
      if (Math.abs(d) > EPS[key]) { cur[key] += d * k; moving = true; } else { cur[key] = tgt[key]; }
    }
    apply();
    if (moving) rafId = requestAnimationFrame(step);
  }

  // Called whenever the page's size or layout may have changed
  function retarget() {
    ensureSvg();
    const m = measure();
    if (!cur) {                                            // first draw: no animation
      cur = {}; tgt = m;
      KEYS.forEach(function (key) { cur[key] = m[key]; });
      apply();
      return;
    }
    tgt = m;
    if (reduceMotion.matches) {                            // respect "reduce motion": jump straight there
      KEYS.forEach(function (key) { cur[key] = m[key]; });
      apply();
      return;
    }
    apply();                                               // same frame as the layout change, so nothing flashes
    if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(step); }
  }

  retarget();
  window.addEventListener('load', retarget);
  window.addEventListener('resize', retarget);
  if (window.ResizeObserver) new ResizeObserver(retarget).observe(document.body);   // also fires when filtering changes the page height
})();

// "Other" section: sort the dated updates and search them by keyword.
// Sorting reads each entry's <time datetime="YYYY-MM-DD">; entries without a usable date go last.
// Search is case-insensitive, and every word you type has to appear somewhere in the entry
// (title, text, caption, link text or image description).
(function () {
  const list = document.querySelector('#other .updates');
  if (!list) return;
  const search = document.getElementById('other-search');
  const sortSel = document.getElementById('other-sort');
  const count = document.getElementById('other-count');
  const empty = document.getElementById('other-empty');
  const entries = Array.from(list.querySelectorAll('.update'));   // original order, used to break ties

  function timeOf(el) {
    const t = el.querySelector('time');
    return t ? Date.parse(t.getAttribute('datetime') || t.textContent) : NaN;
  }

  // Searchable text for each entry, lower-cased once
  const haystack = new Map(entries.map(function (el) {
    const alts = Array.from(el.querySelectorAll('img[alt]')).map(function (i) { return i.alt; }).join(' ');
    return [el, (el.textContent + ' ' + alts).toLowerCase().replace(/\s+/g, ' ')];
  }));

  function apply() {
    const dir = sortSel.value === 'asc' ? 1 : -1;
    const sorted = entries.slice().sort(function (a, b) {
      const ta = timeOf(a), tb = timeOf(b);
      const missA = isNaN(ta), missB = isNaN(tb);
      if (missA && missB) return entries.indexOf(a) - entries.indexOf(b);
      if (missA) return 1;
      if (missB) return -1;
      return (ta - tb) * dir || entries.indexOf(a) - entries.indexOf(b);
    });
    sorted.forEach(function (el) { list.appendChild(el); });          // re-order the page

    const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0, first = null;
    sorted.forEach(function (el) {
      const ok = words.every(function (w) { return haystack.get(el).indexOf(w) !== -1; });
      el.hidden = !ok;
      el.classList.remove('first-visible');
      if (ok) { shown++; if (!first) first = el; }
    });
    if (first) first.classList.add('first-visible');                  // no divider above the first entry showing
    count.textContent = 'Showing ' + shown + ' of ' + entries.length + ' update' + (entries.length === 1 ? '' : 's');
    empty.hidden = shown !== 0;
  }

  search.addEventListener('input', apply);
  sortSel.addEventListener('change', apply);
  apply();
})();
