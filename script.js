// ── Boot / login screen ──
(function() {
  const screen   = document.getElementById('bootScreen');
  const wordEl   = document.getElementById('bootWord');
  const fillEl   = document.getElementById('bootBarFill');
  const startBtn = document.getElementById('bootStart');
  const loadLbl  = document.getElementById('bootLoadingLabel');
  if (!screen || !wordEl || !fillEl || !startBtn) return;

  // Sélection Player 1 / Player 2 — au clic, on bascule l'état actif
  const playerRows = document.querySelectorAll('.boot-player-row');
  playerRows.forEach(row => {
    row.addEventListener('click', () => {
      playerRows.forEach(r => r.classList.remove('is-active'));
      row.classList.add('is-active');
    });
  });

  // Mot affiché : CLIPS.EXE
  const sequence = ['C','L','I','P','S', '.', 'E','X','E'];

  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&!?';
  const letterDelay   = 150; // ms entre chaque lettre qui se "résout"
  const scrambleTicks = 4;   // nb de caractères aléatoires affichés avant la vraie lettre
  const scrambleSpeed = 28;  // ms entre chaque tick de scramble
  const totalDuration = sequence.length * letterDelay + 300;

  // Barre de chargement : se remplit en continu sur la même durée totale
  fillEl.style.transitionDuration = totalDuration + 'ms';
  requestAnimationFrame(() => { fillEl.style.width = '100%'; });

  // Crée la lettre suivante dans le DOM (le curseur ::after, toujours rendu après
  // le dernier enfant, se retrouve donc automatiquement juste derrière elle) puis
  // l'anime avec un effet de "décodage hacker" avant de se fixer sur le bon caractère.
  function addLetter(ch) {
    const span = document.createElement('span');
    span.className = 'boot-letter' + (ch === '.' ? ' boot-dot' : '');
    wordEl.appendChild(span);
    requestAnimationFrame(() => { span.classList.add('show'); });

    let tick = 0;
    const scramble = setInterval(() => {
      span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      tick++;
      if (tick >= scrambleTicks) {
        clearInterval(scramble);
        span.textContent = ch;
      }
    }, scrambleSpeed);
  }

  // Révélation des lettres une à une
  let i = 0;
  const interval = setInterval(() => {
    if (i === 0) wordEl.classList.add('typing-started'); // le curseur n'apparaît qu'au moment de la 1ère lettre
    addLetter(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      // Petit délai après la dernière lettre / fin de barre avant d'afficher START
      setTimeout(() => {
        if (loadLbl) loadLbl.classList.add('boot-done');
        startBtn.classList.add('boot-ready');
      }, 350);
    }
  }, letterDelay);

  function enterSite() {
    screen.classList.add('boot-hide');
    document.body.classList.remove('boot-active');
    document.body.classList.add('site-revealed');
    setTimeout(() => { screen.style.display = 'none'; }, 600);
  }

  startBtn.addEventListener('click', enterSite);
})();

function buildEmbedUrl(ytId) {
      return 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0';
    }
  function openModal(ytId, name, sub, bonus, related) {
    document.getElementById('modal-frame').src = buildEmbedUrl(ytId);
    document.getElementById('modal-name').textContent = name || '';
    document.getElementById('modal-sub').textContent  = sub  || '';

    // Bonus strip
    const bonusSection = document.getElementById('modal-bonus');
    const bonusList    = document.getElementById('bonus-list');
    bonusList.innerHTML = '';
    if (bonus && bonus.length > 0) {
      bonus.forEach(b => {
        const thumb = document.createElement('div');
        thumb.className = 'bonus-thumb';
        thumb.innerHTML = `
          <div class="bonus-img">
            <img src="https://img.youtube.com/vi/${b.ytId}/maxresdefault.jpg" alt="${b.title}">
            <div class="bonus-play">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="white" stroke-width="1.5" fill="rgba(0,0,0,0.5)"/>
                <polygon points="19,14 38,24 19,34" fill="white"/>
              </svg>
            </div>
          </div>
          <div class="bonus-info"><div class="bonus-title">${b.title}</div></div>`;
        thumb.addEventListener('click', () => {
          document.getElementById('modal-frame').src = buildEmbedUrl(b.ytId);
          bonusList.querySelectorAll('.bonus-thumb').forEach(t => t.classList.remove('bonus-active'));
          thumb.classList.add('bonus-active');
        });
        bonusList.appendChild(thumb);
      });
      bonusSection.classList.add('has-bonus');
    } else {
      bonusSection.classList.remove('has-bonus');
    }

    // Related strip (Option B)
    const relatedSection = document.getElementById('modal-related');
    const relatedLinks   = document.getElementById('modal-related-links');
    relatedLinks.innerHTML = '';
    if (related && related.length > 0) {
      related.forEach(r => {
        const targetCard = document.querySelector(`.map-card[data-id="${r.mapId}"]`);
        if (!targetCard) return;
        const btn = document.createElement('button');
        btn.className = 'modal-related-btn';
        const arrow = r.direction === 'original'
          ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.innerHTML = `${arrow} ${r.label}`;
        btn.addEventListener('click', () => {
          const targetBonus   = targetCard.dataset.bonus   ? JSON.parse(targetCard.dataset.bonus)   : [];
          const targetRelated = targetCard.dataset.related ? JSON.parse(targetCard.dataset.related) : [];
          openModal(targetCard.dataset.ytId, targetCard.dataset.name, targetCard.dataset.map, targetBonus, targetRelated);
        });
        relatedLinks.appendChild(btn);
      });
      relatedSection.classList.add('has-related');
    } else {
      relatedSection.classList.remove('has-related');
    }

    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modal-frame').src = '';
    document.getElementById('modal-bonus').classList.remove('has-bonus');
    document.getElementById('modal-related').classList.remove('has-related');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ── jumpToCard: badge click → open modal of target card directly ──
  function jumpToCard(e, mapId) {
    e.stopPropagation();
    const targetCard = document.querySelector(`.map-card[data-id="${mapId}"]`);
    if (!targetCard) return;
    const bonus   = targetCard.dataset.bonus   ? JSON.parse(targetCard.dataset.bonus)   : [];
    const related = targetCard.dataset.related ? JSON.parse(targetCard.dataset.related) : [];
    openModal(targetCard.dataset.ytId, targetCard.dataset.name, targetCard.dataset.map, bonus, related);
  }

  // ── Inline bonus panel toggle ──
  function toggleBonus(e, btn) {
    e.stopPropagation(); // don't fire card click → modal
    const card  = btn.closest('.map-card');
    const panel = card.querySelector('.map-bonus-panel');
    const bonus = card.dataset.bonus ? JSON.parse(card.dataset.bonus) : [];
    const isOpen = panel.classList.contains('open');

    if (!isOpen && panel.innerHTML === '') {
      // Build panel rows on first open
      panel.innerHTML = `<div class="map-bonus-panel-label">// RELATED CLIPS</div><div class="map-bonus-rows"></div>`;
      const rows = panel.querySelector('.map-bonus-rows');
      bonus.forEach(b => {
        const row = document.createElement('div');
        row.className = 'map-bonus-row';
        row.innerHTML = `
          <div class="map-bonus-row-icon">
            <img src="https://img.youtube.com/vi/${b.ytId}/maxresdefault.jpg" alt="${b.title}">
            <div class="map-bonus-row-play">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="white" stroke-width="1" fill="rgba(0,0,0,0.5)"/>
                <polygon points="19,14 38,24 19,34" fill="white"/>
              </svg>
            </div>
          </div>
          <div class="map-bonus-row-title">${b.title}</div>
          <div class="map-bonus-row-open">▶ OPEN</div>`;
        row.addEventListener('click', e => {
          e.stopPropagation();
          // Open modal on this bonus clip, passing all bonus clips so modal bonus strip also works
          openModal(b.ytId, b.title, card.dataset.map, bonus.filter(x => x.ytId !== b.ytId));
        });
        rows.appendChild(row);
      });
    }

    panel.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
  }

  // ── Kacky cards — click on card body opens modal ──
  const cards = document.querySelectorAll('.map-card');
  cards.forEach(c => {
    c.addEventListener('click', e => {
      if (e.target.closest('.map-bonus-btn') || e.target.closest('.map-bonus-panel') || e.target.closest('.map-remix-badge')) return;
      const bonus   = c.dataset.bonus   ? JSON.parse(c.dataset.bonus)   : [];
      const related = c.dataset.related ? JSON.parse(c.dataset.related) : [];
      openModal(c.dataset.ytId, c.dataset.name, c.dataset.map, bonus, related);
    });
  });

  // ── RL cards ──
  document.querySelectorAll('.rl-card').forEach(c => c.addEventListener('click', () =>
    openModal(c.dataset.ytId,
      c.querySelector('.rl-title').textContent,
      c.querySelector('.rl-meta').textContent, [], [])));

  // ── CoD cards ──
  document.querySelectorAll('.cod-card').forEach(c => c.addEventListener('click', () =>
    openModal(c.dataset.ytId,
      c.querySelector('.cod-card-title').textContent,
      c.querySelector('.cod-card-tag').textContent, [], [])));

  // ── RL tabs ──
  const rlCards = document.querySelectorAll('.rl-card');
  document.querySelectorAll('.rl-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rl-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      let n = 0;
      rlCards.forEach(c => {
        const show = cat === 'all' || c.dataset.cat === cat;
        c.style.display = show ? '' : 'none';
        if (show) n++;
      });
      document.getElementById('rl-count').textContent = n + ' CLIPS';
    });
  });

  // ── Kacky event tabs ──
  document.querySelectorAll('.etab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.etab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const ev = tab.dataset.event;
      let n = 0;
      cards.forEach(c => {
        const show = ev === 'all' || c.dataset.event === ev;
        c.classList.toggle('hidden', !show);
        if (show) n++;
      });
      document.getElementById('kacky-count').textContent = n + ' CLIPS';
    });
  });

  // ── Counts ──
  document.getElementById('kacky-count').textContent = cards.length + ' CLIPS';
  document.getElementById('rl-count').textContent    = document.querySelectorAll('.rl-card').length + ' CLIPS';
  document.getElementById('cod-count').textContent = document.querySelectorAll('.cod-card').length + ' CLIPS';

  // ── Kacky search ──
  const kackySearch = document.getElementById('kacky-search');
  const kackySearchClear = document.getElementById('kacky-search-clear');

  kackySearch.addEventListener('input', filterKacky);

  function clearKackySearch() {
    kackySearch.value = '';
    kackySearchClear.classList.remove('visible');
    filterKacky();
    kackySearch.focus();
  }

  function filterKacky() {
    const query = kackySearch.value.trim().toLowerCase();
    kackySearchClear.classList.toggle('visible', query.length > 0);

    const activeTab = document.querySelector('.etab.active');
    const activeEvent = activeTab ? activeTab.dataset.event : 'all';

    let visible = 0;
    cards.forEach(c => {
      const matchEvent = activeEvent === 'all' || c.dataset.event === activeEvent;
      const matchSearch = !query
        || c.dataset.map.toLowerCase().includes(query)
        || c.dataset.name.toLowerCase().includes(query)
        || (c.dataset.event || '').toLowerCase().includes(query);
      const show = matchEvent && matchSearch;
      c.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    document.getElementById('kacky-count').textContent = visible + ' CLIPS';

    // No results message
    let noRes = document.getElementById('kacky-no-results');
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'kacky-no-results';
      noRes.className = 'kacky-no-results';
      noRes.textContent = 'NO MAPS FOUND';
      document.querySelector('.kacky-grid').appendChild(noRes);
    }
    noRes.classList.toggle('visible', visible === 0);
  }

  // Patch etab click to also re-apply search filter
  document.querySelectorAll('.etab').forEach(tab => {
    tab.addEventListener('click', () => {
      // small delay so active class is set first
      setTimeout(filterKacky, 0);
    });
  });


  // ── Kacky charts ──
  const eventStats = {
    all:  { clips: 140, total: 335, avgRank: 141, t10:6,  t50:24, t100:20, other:65 },
    kr6:  { clips: 27,  total: 75,  avgRank: 160, t10:1,  t50:4,  t100:7,  other:15 },
    kk10: { clips: 25,  total: 100, avgRank: 151, t10:0,  t50:7,  t100:3,  other:15 },
    km4:  { clips: 63,  total: 100, avgRank: 129, t10:5,  t50:13, t100:10, other:35 },
    kb2:  { clips: 25,  total: 60,  avgRank: null,t10:0,  t50:0,  t100:0,  other:0  },
  };
  const CIRC = 188.5; // 2 * PI * 30

  function updateCharts(eventKey) {
    const d = eventStats[eventKey] || eventStats['all'];

    // Progression donut
    const pct = d.total ? Math.min(d.clips / d.total, 1) : 0;
    const progressOffset = CIRC - pct * CIRC;
    document.getElementById('chart-progress-track').style.strokeDashoffset = progressOffset;
    document.getElementById('chart-progress-val').textContent = d.clips;
    document.getElementById('chart-progress-total').textContent = '/ ' + (d.total || '?');

    // Avg rank donut — scale: rank 1 = full, rank 500+ = nearly empty
    const rankEl = document.getElementById('chart-rank-val');
    const rankTrack = document.getElementById('chart-rank-track');
    if (d.avgRank) {
      const rankPct = Math.max(0, 1 - (d.avgRank - 1) / 499);
      rankTrack.style.strokeDashoffset = CIRC - rankPct * CIRC;
      rankEl.textContent = '#' + d.avgRank;
    } else {
      rankTrack.style.strokeDashoffset = CIRC;
      rankEl.textContent = '—';
    }

    // Top Ranks donut — stacked arcs
    const total = d.t10 + d.t50 + d.t100 + d.other;
    if (total > 0) {
      const arcT10  = (d.t10  / total) * CIRC;
      const arcT50  = (d.t50  / total) * CIRC;
      const arcT100 = (d.t100 / total) * CIRC;

      // Grey background fills the full circle
      document.getElementById('chart-tops-other').style.strokeDasharray  = CIRC;
      document.getElementById('chart-tops-other').style.strokeDashoffset = 0;
      document.getElementById('chart-tops-other').setAttribute('transform', 'rotate(-90 40 40)');

      // Clockwise from top (-90°):
      // Gold first, then silver after gold, then bronze after silver
      const startTop = -90;
      const rot10  = startTop;
      const rot50  = startTop + (d.t10  / total) * 360;
      const rot100 = startTop + (d.t10 + d.t50) / total * 360;

      const el10 = document.getElementById('chart-tops-10');
      el10.style.strokeDashoffset = CIRC - arcT10;
      el10.setAttribute('transform', `rotate(${rot10} 40 40)`);

      const el50 = document.getElementById('chart-tops-50');
      el50.style.strokeDashoffset = CIRC - arcT50;
      el50.setAttribute('transform', `rotate(${rot50} 40 40)`);

      const el100 = document.getElementById('chart-tops-100');
      el100.style.strokeDashoffset = CIRC - arcT100;
      el100.setAttribute('transform', `rotate(${rot100} 40 40)`);

      document.getElementById('chart-tops-val').textContent = d.t10 + d.t50 + d.t100;
    } else {
      ['chart-tops-10','chart-tops-50','chart-tops-100','chart-tops-other'].forEach(id => {
        document.getElementById(id).style.strokeDashoffset = CIRC;
      });
      document.getElementById('chart-tops-val').textContent = '—';
    }

    // Legend
    document.getElementById('leg-t10').textContent   = `TOP 10 (${d.t10})`;
    document.getElementById('leg-t50').textContent   = `TOP 50 (${d.t50})`;
    document.getElementById('leg-t100').textContent  = `TOP 100 (${d.t100})`;
    document.getElementById('leg-other').textContent = `OTHER (${d.other})`;
  }

  // Init on load
  updateCharts('all');

  // Hook into existing etab clicks
  document.querySelectorAll('.etab').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => updateCharts(tab.dataset.event), 0);
    });
  });


  // ── Kacky filter panel ──
  let currentSort = 'default';
  let currentShow = 'show-all';

  function toggleFilterPanel() {
    const btn   = document.getElementById('kacky-filter-btn');
    const panel = document.getElementById('kacky-filter-panel');
    btn.classList.toggle('active');
    panel.classList.toggle('open');
  }

  // Close panel when clicking outside
  document.addEventListener('click', e => {
    const wrap = document.getElementById('kacky-filter-wrap');
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById('kacky-filter-btn').classList.remove('active');
      document.getElementById('kacky-filter-panel').classList.remove('open');
    }
  });

  function applyFilter(type) {
    const sortFilters = ['default','rank-asc','rank-desc','name-asc'];
    const showFilters = ['show-all','show-fin','show-notfin'];

    if (sortFilters.includes(type)) currentSort = type;
    if (showFilters.includes(type)) currentShow = type;

    // Update selected state
    document.querySelectorAll('.filter-option').forEach(opt => {
      const f = opt.dataset.filter;
      const active = (sortFilters.includes(f) && f === currentSort) ||
                     (showFilters.includes(f) && f === currentShow);
      opt.classList.toggle('selected', active);
    });

    const grid = document.querySelector('.kacky-grid');
    const allCards = [...document.querySelectorAll('.map-card')];

    // Get active event tab
    const activeTab = document.querySelector('.etab.active');
    const activeEvent = activeTab ? activeTab.dataset.event : 'all';

    // Filter by event + show
    allCards.forEach(c => {
      const matchEvent = activeEvent === 'all' || c.dataset.event === activeEvent;
      const isNotFin   = c.classList.contains('not-fin');
      const matchShow  = currentShow === 'show-all'    ? true
                       : currentShow === 'show-fin'    ? !isNotFin
                       : currentShow === 'show-notfin' ? isNotFin
                       : true;
      const query = document.getElementById('kacky-search').value.trim().toLowerCase();
      const matchSearch = !query
        || c.dataset.map.toLowerCase().includes(query)
        || c.dataset.name.toLowerCase().includes(query);
      c.classList.toggle('hidden', !(matchEvent && matchShow && matchSearch));
    });

    // Sort visible cards in DOM
    const visibleCards = allCards.filter(c => !c.classList.contains('hidden'));
    visibleCards.sort((a, b) => {
      if (currentSort === 'rank-asc' || currentSort === 'rank-desc') {
        const raEl = a.querySelectorAll('.map-stat-value')[1];
        const rbEl = b.querySelectorAll('.map-stat-value')[1];
        const ra = raEl ? parseInt(raEl.textContent.replace('#','')) || 9999 : 9999;
        const rb = rbEl ? parseInt(rbEl.textContent.replace('#','')) || 9999 : 9999;
        return currentSort === 'rank-asc' ? ra - rb : rb - ra;
      }
      if (currentSort === 'name-asc') {
        return a.dataset.name.localeCompare(b.dataset.name);
      }
      // default: map number
      const na = parseInt(a.dataset.map.replace(/[^0-9]/g,'')) || 0;
      const nb = parseInt(b.dataset.map.replace(/[^0-9]/g,'')) || 0;
      return na - nb;
    });

    visibleCards.forEach(c => grid.appendChild(c));

    // Update count
    document.getElementById('kacky-count').textContent = visibleCards.length + ' CLIPS';
  }


  // ── Extras tabs ──
  const extrasCards = document.querySelectorAll('.extras-card');
  document.querySelectorAll('.extras-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.extras-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const game = tab.dataset.game;
      let n = 0;
      extrasCards.forEach(c => {
        const show = game === 'all' || c.dataset.game === game;
        c.style.display = show ? '' : 'none';
        if (show) n++;
      });
      document.getElementById('extras-count').textContent = n + ' CLIPS';
    });
  });

  // ── Extras cards ──
  extrasCards.forEach(c => c.addEventListener('click', () => {
    const metaEl = c.querySelector('.extras-meta');
    openModal(c.dataset.ytId,
      c.querySelector('.extras-title').textContent,
      metaEl ? metaEl.textContent : '', [], []);
  }));

  // ── Extras count ──
  document.getElementById('extras-count').textContent = extrasCards.length + ' CLIPS';

  // ── Extras tabs ──
  const extraCards = document.querySelectorAll('.extras-card');
  document.querySelectorAll('.etab-x').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.etab-x').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const game = tab.dataset.game;
      let n = 0;
      extraCards.forEach(c => {
        const show = game === 'all' || c.dataset.game === game;
        c.classList.toggle('hidden', !show);
        if (show) n++;
      });
      document.getElementById('extras-count').textContent = n + ' CLIPS';
    });
  });

  // Extras card click
  extraCards.forEach(c => c.addEventListener('click', () => {
    const metaEl = c.querySelector('.extras-meta');
    openModal(c.dataset.ytId,
      c.querySelector('.extras-title').textContent,
      metaEl ? metaEl.textContent : '', [], []);
  }));

  // Extras count init
  document.getElementById('extras-count').textContent = extraCards.length + ' CLIPS';
// ── Typewriter effect on hero title ──
(function() {
  const line1El = document.getElementById('tw-line1');
  const line2El = document.getElementById('tw-line2');
  if (!line1El || !line2El) return;

  const word1 = 'VAULT';
  const word2 = 'HIGHLIGHTS';
  const typeSpeed = 75;     // ms per letter
  const pauseBetween = 200; // ms pause between words
  const cursorHtml = '<span class="tw-cursor">&nbsp;</span>';

  let i = 0;

  function typeWord(word, el, onDone) {
    el.innerHTML = cursorHtml;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      el.innerHTML = word.slice(0, idx) + cursorHtml;
      if (idx >= word.length) {
        clearInterval(interval);
        setTimeout(onDone, pauseBetween);
      }
    }, typeSpeed);
  }

  function start() {
    line1El.innerHTML = '';
    line2El.innerHTML = '';
    typeWord(word1, line1El, () => {
      line1El.innerHTML = word1; // remove cursor from line 1
      typeWord(word2, line2El, () => {
        // Leave cursor blinking at the end briefly, then remove
        setTimeout(() => { line2El.innerHTML = word2; }, 1200);
      });
    });
  }

  start();
})();

// ── Animated counter on scroll-into-view AND on tab click ──
(function() {
  const countIds = ['kacky-count', 'rl-count', 'cod-count', 'extras-count'];
  const seenOnce = new Set();

  // Jeton de version par élément : chaque nouvel appel d'animateCount sur un
  // même élément invalide la boucle précédente, qui s'arrête d'elle-même
  // dès qu'elle détecte qu'elle n'est plus la version "courante".
  const animTokens = new WeakMap();

  // Tue immédiatement (de façon synchrone) toute animation en cours sur cet
  // élément, sans en démarrer une nouvelle. Sert à fermer la fenêtre de
  // course : on invalide DÈS le clic, avant même que la nouvelle valeur
  // finale ne soit connue / affichée.
  function invalidateCount(el) {
    animTokens.set(el, (animTokens.get(el) || 0) + 1);
  }

  function animateCount(el) {
    const finalText = el.textContent.trim();
    const match = finalText.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2]; // e.g. " CLIPS"
    // Pour les petits totaux (< 10 clips), l'animation classique de 2800ms
    // paraît traîner pour rien : on la raccourcit nettement dans ce cas.
    const duration = target < 10 ? 1400 : 2800;
    const start = performance.now();

    // Nouveau jeton pour cet appel : toute boucle plus ancienne sur cet
    // élément va se voir invalidée au prochain tick.
    const myToken = (animTokens.get(el) || 0) + 1;
    animTokens.set(el, myToken);

    function tick(now) {
      // Une animation plus récente a été lancée sur cet élément entre-temps
      // (ex: changement rapide d'onglet) -> on abandonne cette boucle.
      if (animTokens.get(el) !== myToken) return;

      const progress = Math.min((now - start) / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix; // ensure exact final value
      }
    }
    requestAnimationFrame(tick);
  }
  window.animateCount = animateCount; // expose for tab-click re-trigger

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seenOnce.has(entry.target.id)) {
        seenOnce.add(entry.target.id);
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.6 });

  window.addEventListener('load', () => {
    countIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Re-animate the relevant counter whenever a category tab is clicked,
    // after the existing filter logic has updated its text content.
    const tabSelectors = ['.etab', '.etab-x', '.rl-tab'];
    const tabToCountId = {
      '.etab':    'kacky-count',
      '.etab-x':  'extras-count',
      '.rl-tab':  'rl-count',
    };

    tabSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(tab => {
        // IMPORTANT: listener en phase "capture" => il s'exécute en TOUT PREMIER,
        // avant tous les autres handlers de clic déjà attachés sur ce bouton
        // (filtrage, mise à jour du texte, etc.), et même avant les éventuelles
        // frames requestAnimationFrame restantes de l'animation précédente.
        // On bump le jeton immédiatement et de façon synchrone : toute boucle
        // tick() encore en vol pour cet élément devient obsolète sur-le-champ,
        // qu'on change de catégorie une fois ou dix fois par seconde.
        tab.addEventListener('click', () => {
          const countId = tabToCountId[sel];
          const el = document.getElementById(countId);
          if (el) invalidateCount(el);
        }, { capture: true });

        tab.addEventListener('click', () => {
          const countId = tabToCountId[sel];
          const el = document.getElementById(countId);
          if (el) {
            // Wait a tick so the existing click handler updates the count text first
            setTimeout(() => animateCount(el), 0);
          }
        });
      });
    });
  });
})();

// ══ MOBILE BURGER MENU ══
(() => {
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (!burger || !navLinks) return;

  function closeMenu() {
    navLinks.classList.remove('mobile-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Ferme le menu une fois qu'on a choisi une section
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Ferme le menu si on repasse en affichage desktop (resize / rotation)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 620) closeMenu();
  });
})();
