// =========================================================================
// S-Agent project page — interactions (dark theme only)
// =========================================================================

/* ---------- copy BibTeX ---------- */
function copyBib(){
  var t = document.getElementById('bib-content').innerText;
  navigator.clipboard.writeText(t).then(function(){
    var b = document.querySelector('.copy-btn');
    var o = b.innerHTML;
    b.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(function(){ b.innerHTML = o; }, 1600);
  }).catch(function(){});
}

(function(){
  'use strict';

  /* ---------- ablation bars: fill once visible ---------- */
  var wrap = document.getElementById('ablBars');
  function fill(){
    if(!wrap) return;
    var vals = [].slice.call(wrap.querySelectorAll('.abl-fill')).map(function(b){ return parseFloat(b.dataset.v) || 0; });
    var max = Math.max.apply(null, vals) * 1.04;
    wrap.querySelectorAll('.abl-fill').forEach(function(b){
      b.style.width = Math.min(100, (parseFloat(b.dataset.v) / max) * 100) + '%';
    });
  }
  if(wrap && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ fill(); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(wrap);
  } else {
    fill();
  }
  // also fill if the parent <details> opens later
  var det = wrap ? wrap.closest('details') : null;
  if(det){ det.addEventListener('toggle', function(){ if(det.open) fill(); }); }

  /* ---------- performance dashboard: animated bars + counters ---------- */
  var perfDashboard = document.getElementById('perfDashboard');
  var perfStarted = false;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }

  function animateNumber(el, target){
    if(!el) return;
    if(reduceMotion){
      el.textContent = target.toFixed(1);
      return;
    }
    var start = window.performance && window.performance.now ? window.performance.now() : Date.now();
    var dur = 980;
    function tick(now){
      var t = clamp(((now || Date.now()) - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(1);
      if(t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }

  function revealPerformanceDashboard(){
    if(!perfDashboard || perfStarted) return;
    perfStarted = true;
    perfDashboard.querySelectorAll('.perf-chart').forEach(function(chart){
      var min = parseFloat(chart.dataset.min);
      var max = parseFloat(chart.dataset.max);
      if(!isFinite(min)) min = 0;
      if(!isFinite(max) || max <= min) max = 100;
      chart.querySelectorAll('.perf-bar').forEach(function(bar){
        var value = parseFloat(bar.dataset.value) || 0;
        var pct = clamp(((value - min) / (max - min)) * 100, 0, 100);
        bar.style.setProperty('--bar-height', Math.max(5, pct).toFixed(2) + '%');
        animateNumber(bar.querySelector('.perf-value'), value);
      });
    });
    perfDashboard.classList.add('is-visible');
  }

  if(perfDashboard && 'IntersectionObserver' in window){
    var perfIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          revealPerformanceDashboard();
          perfIo.disconnect();
        }
      });
    }, { threshold: 0.02 });
    perfIo.observe(perfDashboard);
  } else {
    revealPerformanceDashboard();
  }

  /* ---------- placeholder links (arXiv / Code not yet public) ---------- */
  document.querySelectorAll('a[data-placeholder]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var span = a.querySelector('.soon') || a;
      var orig = span.textContent;
      span.textContent = 'coming soon';
      setTimeout(function(){ span.textContent = orig; }, 1500);
    });
  });

  /* ---------- in-page trajectory sample window ---------- */
  var trajModal = document.getElementById('trajModal');
  var trajEmbed = document.getElementById('trajEmbed');
  var trajModalKicker = document.getElementById('trajModalKicker');
  var trajModalTitle = document.getElementById('trajModalTitle');
  var lastTrajectoryTrigger = null;
  var trajBuilt = false;
  var trajActive = 0;
  var trajMode = 'sample';
  var trajFrameLoadTimer = null;

  var trajAssets = 'assets/case6111/demo/';
  var trajectorySteps = [
    {
      label:'Question',
      kicker:'Step 00',
      stat:'64 frames',
      narrator:'The agent starts from a video question: stand by the headphones, face away from the entrance door, then locate the camera in the person-centered frame.',
      html:'<div class="traj-split traj-question"><div><div class="traj-eyebrow">Question + video input</div><h3>Standing by the <b>headphones</b>, facing away from the <b class="gold">entrance door</b> — where is the <b class="rose">camera</b>?</h3><p>Choices: front-left, front-right, back-left, back-right.</p></div><figure class="traj-media"><img src="' + trajAssets + 'inputGrid.jpg" alt="64 sampled video frames"><figcaption>64 sampled frames from Case 6111</figcaption></figure></div>'
    },
    {
      label:'2D Evidence',
      kicker:'Step 01',
      stat:'3 / 3 located',
      narrator:'Object grounding locks the three spatial entities needed by the question: headphones, entrance door, and camera.',
      html:'<div class="traj-headline"><div><div class="traj-eyebrow">2D Visual Evidence Acquisition</div><h3>Ground the entities before reasoning.</h3></div><span class="traj-stat good">3 / 3 located</span></div><div class="traj-evidence-grid"><figure class="traj-media"><img src="' + trajAssets + 'headphones.jpg" alt="Headphones grounding"><figcaption><span class="dot cyan"></span>headphones · standing anchor</figcaption></figure><figure class="traj-media"><img src="' + trajAssets + 'door.jpg" alt="Entrance door grounding"><figcaption><span class="dot gold"></span>entrance door · facing reference</figcaption></figure><figure class="traj-media"><img src="' + trajAssets + 'camera.jpg" alt="Camera grounding"><figcaption><span class="dot rose"></span>camera · target object</figcaption></figure></div>'
    },
    {
      label:'3D Lift',
      kicker:'Step 02',
      stat:'3 anchors',
      narrator:'Metric3D lifts the visual evidence into one shared reconstruction, preserving object centers for later spatial tools.',
      html:'<div class="traj-split traj-cloud"><figure class="traj-media traj-media-wide"><img src="' + trajAssets + 'cloudAnim.webp" alt="Dense point cloud with object anchors"></figure><div class="traj-kpis"><div class="traj-eyebrow">2D-to-3D Geometric Lifting</div><h3>Lift grounded objects into the scene frame.</h3><div class="traj-kpi accent"><span>object centers</span><b>3 anchors</b></div><div class="traj-targets"><span><i class="dot cyan"></i>headphones</span><span><i class="dot gold"></i>door</span><span><i class="dot rose"></i>camera</span></div></div></div>'
    },
    {
      label:'Orientation',
      kicker:'Step 03',
      stat:'person frame',
      narrator:'The orientation expert re-centers the scene at the headphones and points the person away from the door.',
      html:'<div class="traj-headline"><div><div class="traj-eyebrow">Spatial Knowledge Aggregation</div><h3>Build the egocentric frame.</h3></div><span class="traj-stat">door behind</span></div><div class="traj-orient"><figure class="traj-media"><img src="' + trajAssets + 'step3Intro.webp" alt="Point cloud aligned to top-down scene view"></figure><div class="traj-ego-map"><span class="axis x"></span><span class="axis y"></span><span class="front-arrow"></span><span class="front-label">FACING</span><span class="side left">LEFT</span><span class="side right">RIGHT</span><span class="side back">BACK</span><span class="person"></span><span class="person-label">HEADPHONES</span><span class="door"></span><span class="door-label">DOOR</span><span class="camera"></span><span class="camera-label">CAMERA</span></div></div>'
    },
    {
      label:'Direction',
      kicker:'Step 04',
      stat:'back-right',
      narrator:'In the person-centered coordinate frame, the camera falls behind and to the right.',
      html:'<div class="traj-headline"><div><div class="traj-eyebrow">Relative Direction Expert</div><h3>Resolve the camera quadrant.</h3></div><span class="traj-stat verdict">BACK-RIGHT</span></div><div class="traj-relative"><div class="quad active"><span>BACK-RIGHT</span></div><span class="axis x"></span><span class="axis y"></span><span class="front-arrow"></span><span class="front-label">FACING</span><span class="side left">LEFT</span><span class="side right">RIGHT</span><span class="side back">BACK</span><span class="person"></span><span class="person-label">PERSON</span><span class="door"></span><span class="door-label">DOOR</span><span class="path"></span><span class="camera"></span><span class="camera-label">CAMERA</span></div>'
    },
    {
      label:'Answer',
      kicker:'Final',
      stat:'D',
      narrator:'Final answer: D, back-right. The trace is now embedded in the project page as native page content.',
      html:'<div class="traj-final-panel"><div class="traj-eyebrow">Final answer</div><p>Standing at <b>headphones</b>, facing opposite the <b class="gold">entrance door</b>, the <b class="rose">camera</b> is at:</p><div class="answer-letter">D</div><h3>back-right</h3><div class="traj-final-row"><span>✓ correct</span><span>GT D</span><span>3 turns · 6 tool calls</span></div></div>'
    }
  ];

  function clampStep(i){
    return Math.max(0, Math.min(trajectorySteps.length - 1, i));
  }

  function setTrajectoryHeader(kicker, title){
    if(trajModalKicker) trajModalKicker.textContent = kicker || 'Agent Trajectory Sample';
    if(trajModalTitle) trajModalTitle.textContent = title || 'S-Agent · Case 6111';
  }

  function resetTrajectoryFrame(){
    if(trajFrameLoadTimer){
      clearTimeout(trajFrameLoadTimer);
      trajFrameLoadTimer = null;
    }
    if(!trajEmbed) return;
    var frame = trajEmbed.querySelector('iframe.traj-frame');
    if(frame) frame.removeAttribute('src');
    trajEmbed.removeAttribute('data-frame-loaded');
  }

  function buildTrajectoryEmbed(){
    if(!trajEmbed || trajBuilt) return;
    trajEmbed.className = 'traj-content';
    trajEmbed.removeAttribute('data-frame-loaded');
    trajEmbed.innerHTML =
      '<div class="traj-embed-bg"><span></span><span></span></div>' +
      '<div class="traj-native-stage"><article class="traj-native-card" id="trajNativeCard"></article></div>' +
      '<div class="traj-native-controls">' +
        '<div class="traj-native-narrator" id="trajNativeNarrator"></div>' +
        '<div class="traj-native-dots" id="trajNativeDots"></div>' +
        '<div class="traj-native-bar">' +
          '<button class="traj-nav-btn" type="button" id="trajPrev" aria-label="Previous trajectory step"><i class="fas fa-step-backward" aria-hidden="true"></i></button>' +
          '<button class="traj-nav-btn" type="button" id="trajNext" aria-label="Next trajectory step"><i class="fas fa-step-forward" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';
    var dots = trajEmbed.querySelector('#trajNativeDots');
    trajectorySteps.forEach(function(step, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'traj-dotstep';
      btn.setAttribute('aria-label', step.kicker + ' ' + step.label);
      btn.innerHTML = '<span class="pt"></span><span class="dl">' + step.label + '</span>';
      btn.addEventListener('click', function(){ setTrajectoryStep(i); });
      dots.appendChild(btn);
      if(i < trajectorySteps.length - 1){
        var seg = document.createElement('span');
        seg.className = 'traj-dotseg';
        dots.appendChild(seg);
      }
    });
    trajEmbed.querySelector('#trajPrev').addEventListener('click', function(){ setTrajectoryStep(trajActive - 1); });
    trajEmbed.querySelector('#trajNext').addEventListener('click', function(){ setTrajectoryStep(trajActive + 1); });
    trajBuilt = true;
  }

  function setTrajectoryStep(i){
    if(!trajEmbed) return;
    buildTrajectoryEmbed();
    trajActive = clampStep(i);
    var step = trajectorySteps[trajActive];
    trajEmbed.dataset.step = String(trajActive);
    var card = trajEmbed.querySelector('#trajNativeCard');
    var narrator = trajEmbed.querySelector('#trajNativeNarrator');
    if(card){
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = '';
      card.innerHTML =
        '<div class="traj-native-meta"><span>' + step.kicker + '</span><strong>' + step.label + '</strong><em>' + step.stat + '</em></div>' +
        '<div class="traj-native-body">' + step.html + '</div>';
    }
    if(narrator){
      narrator.style.animation = 'none';
      narrator.offsetHeight;
      narrator.textContent = step.narrator;
      narrator.style.animation = 'trajBodyRise .42s cubic-bezier(.2,.8,.2,1) both';
    }
    trajEmbed.querySelectorAll('.traj-dotstep').forEach(function(btn, idx){
      btn.classList.toggle('is-active', idx === trajActive);
      btn.classList.toggle('is-done', idx < trajActive);
      if(idx === trajActive) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
    trajEmbed.querySelectorAll('.traj-dotseg').forEach(function(seg, idx){
      seg.classList.toggle('is-done', idx < trajActive);
    });
    var prev = trajEmbed.querySelector('#trajPrev');
    var next = trajEmbed.querySelector('#trajNext');
    if(prev) prev.disabled = trajActive === 0;
    if(next) next.disabled = trajActive === trajectorySteps.length - 1;
  }

  function openTrajectoryWindow(href, stepIndex, trigger){
    if(!trajModal || !trajEmbed) return false;
    lastTrajectoryTrigger = trigger || null;
    trajMode = 'sample';
    trajModal.classList.remove('is-frame');
    resetTrajectoryFrame();
    setTrajectoryHeader('Agent Trajectory Sample', 'S-Agent · Case 6111');
    buildTrajectoryEmbed();
    setTrajectoryStep(typeof stepIndex === 'number' ? stepIndex : 0);
    trajModal.classList.add('is-open');
    trajModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var closeBtn = trajModal.querySelector('.traj-close');
    if(closeBtn) closeBtn.focus({ preventScroll:true });
    return true;
  }

  function sessionMetaFromCard(card){
    var bench = card.querySelector('.sbench');
    var model = card.querySelector('.smodel');
    var type = card.querySelector('.pill');
    var benchText = bench ? bench.textContent.trim() : 'S-Agent';
    var caseText = model ? model.textContent.replace(/^·\s*/, '').trim() : '';
    var typeText = type ? type.textContent.trim() : 'Session';
    return {
      kicker: benchText + ' · ' + typeText,
      title: 'S-Agent · ' + benchText + (caseText ? ' ' + caseText : '')
    };
  }

  function openTrajectoryFrame(href, meta, trigger){
    if(!trajModal || !trajEmbed || !href) return false;
    lastTrajectoryTrigger = trigger || null;
    trajMode = 'frame';
    trajBuilt = false;
    resetTrajectoryFrame();
    setTrajectoryHeader(meta && meta.kicker, meta && meta.title);
    trajModal.classList.add('is-frame');
    trajEmbed.className = 'traj-content is-frame';
    trajEmbed.removeAttribute('data-step');
    trajEmbed.setAttribute('aria-label', 'Embedded real S-Agent trajectory');

    var loader = document.createElement('div');
    loader.className = 'traj-frame-loader';
    loader.innerHTML = '<span class="traj-loader-mark"></span><strong>Loading trajectory</strong><em>Embedding the full agent trace in-page</em>';

    function markFrameLoaded(){
      if(trajFrameLoadTimer){
        clearTimeout(trajFrameLoadTimer);
        trajFrameLoadTimer = null;
      }
      trajEmbed.setAttribute('data-frame-loaded', 'true');
      if(loader){
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
      }
      if(frame){
        frame.style.opacity = '1';
        frame.style.transform = 'none';
      }
    }

    var frame = document.createElement('iframe');
    frame.className = 'traj-frame';
    frame.title = meta && meta.title ? meta.title : 'S-Agent trajectory';
    frame.loading = 'eager';
    frame.addEventListener('load', markFrameLoaded, { once:true });
    frame.onload = markFrameLoaded;
    trajEmbed.innerHTML = '';
    trajEmbed.appendChild(loader);
    trajEmbed.appendChild(frame);
    trajFrameLoadTimer = setTimeout(markFrameLoaded, 900);
    var frameSrc = href;
    try{
      var frameUrl = new URL(href, window.location.href);
      frameUrl.searchParams.set('embed', '1');
      frameSrc = frameUrl.href;
    }catch(e){}
    frame.src = frameSrc;

    trajModal.classList.add('is-open');
    trajModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var closeBtn = trajModal.querySelector('.traj-close');
    if(closeBtn) closeBtn.focus({ preventScroll:true });
    return true;
  }

  function closeTrajectoryWindow(){
    if(!trajModal || !trajModal.classList.contains('is-open')) return;
    trajModal.classList.remove('is-open');
    trajModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if(trajMode === 'frame'){
      setTimeout(function(){
        if(!trajModal.classList.contains('is-open')){
          resetTrajectoryFrame();
          trajEmbed.innerHTML = '';
          trajEmbed.className = 'traj-content';
        }
      }, 260);
    }
    trajMode = 'sample';
    if(lastTrajectoryTrigger && typeof lastTrajectoryTrigger.focus === 'function'){
      lastTrajectoryTrigger.focus({ preventScroll:true });
    }
  }

  if(trajModal){
    trajModal.querySelectorAll('[data-traj-close]').forEach(function(el){
      el.addEventListener('click', closeTrajectoryWindow);
    });
    window.addEventListener('keydown', function(e){
      if(!trajModal.classList.contains('is-open')) return;
      if(e.key === 'Escape') closeTrajectoryWindow();
      else if(trajMode !== 'sample') return;
      else if(e.key === 'ArrowRight'){ e.preventDefault(); setTrajectoryStep(trajActive + 1); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); setTrajectoryStep(trajActive - 1); }
    });
  }

  document.querySelectorAll('#samples .stile').forEach(function(card){
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', function(e){
      e.preventDefault();
      var href = card.getAttribute('href');
      if(openTrajectoryFrame(href, sessionMetaFromCard(card), card)){
        var cta = card.querySelector('.scta');
        if(cta){
          cta.classList.add('is-opened');
          setTimeout(function(){ cta.classList.remove('is-opened'); }, 900);
        }
      }
    });
  });

  /* ---------- hero agent trajectory: sequential focus card carousel ---------- */
  (function(){
    var car = document.getElementById('heroCar');
    if(!car) return;
    var viewport = car.querySelector('.hcar-viewport');
    var track = car.querySelector('.hcar-track');
    var cards = [].slice.call(track.querySelectorAll('.hcard'));
    var arrows = [].slice.call(track.querySelectorAll('.hcar-arrow'));
    var railWrap = car.querySelector('.hcar-rail');
    var n = cards.length;
    if(!n) return;
    var active = 0;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // build the stepper rail from each card's thumbnail
    var railNodes = [];
    cards.forEach(function(_, i){
      if(i > 0){ var seg = document.createElement('span'); seg.className = 'rseg'; railWrap.appendChild(seg); }
      var card = cards[i];
      var diagramKind = card.dataset.railDiagram || '';
      var img = card.querySelector('img');
      var thumbSrc = card.dataset.thumb || (img ? img.getAttribute('src') : '');
      var stepLabel = card.dataset.stepLabel || ('Step ' + String(i).padStart(2, '0'));
      var nd = document.createElement('button');
      nd.type = 'button';
      nd.className = 'rnode';
      nd.setAttribute('aria-label', stepLabel);
      nd.title = stepLabel;
      if(diagramKind){
        nd.classList.add('rnode--diagram', 'rnode--' + diagramKind);
        nd.innerHTML = diagramKind === 'relative'
          ? '<svg class="rdiagram" viewBox="0 0 64 40" aria-hidden="true"><path class="rd-zone" d="M32 21 H58 V36 H32 Z"/><path class="rd-axis" d="M8 21 H56 M32 5 V36"/><path class="rd-front" d="M32 21 V9"/><path class="rd-front-head" d="M32 5 27 13 37 13Z"/><path class="rd-path" d="M32 21 49 31"/><circle class="rd-door" cx="32" cy="33" r="2.8"/><circle class="rd-person" cx="32" cy="21" r="3.5"/><circle class="rd-cam" cx="49" cy="31" r="3.4"/></svg>'
          : '<svg class="rdiagram" viewBox="0 0 64 40" aria-hidden="true"><path class="rd-axis" d="M8 21 H56 M32 5 V36"/><path class="rd-front" d="M32 21 V9"/><path class="rd-front-head" d="M32 5 27 13 37 13Z"/><circle class="rd-ring" cx="32" cy="21" r="9"/><path class="rd-turn" d="M24 15 20 21 27 22Z"/><circle class="rd-door" cx="32" cy="33" r="2.8"/><circle class="rd-person" cx="32" cy="21" r="3.5"/></svg>';
      } else if(thumbSrc){
        var thumb = document.createElement('img');
        thumb.src = thumbSrc;
        thumb.alt = '';
        thumb.loading = 'lazy';
        nd.appendChild(thumb);
      }
      var index = document.createElement('span');
      index.className = 'rindex';
      index.textContent = String(i).padStart(2, '0');
      nd.appendChild(index);
      nd.addEventListener('click', function(){ go(i); restart(); });
      railWrap.appendChild(nd);
      railNodes.push(nd);
    });
    var railSegs = [].slice.call(railWrap.querySelectorAll('.rseg'));

    function layout(){
      var target = cards[active];
      if(!target) return;
      var center = target.offsetLeft + target.offsetWidth / 2;
      var x = viewport.clientWidth / 2 - center;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      cards.forEach(function(c, i){
        var dist = Math.abs(i - active);
        c.classList.toggle('is-active', i === active);
        c.classList.toggle('is-before', i < active);
        c.classList.toggle('is-after', i > active);
        c.classList.toggle('is-far', dist > 1);
        c.setAttribute('aria-hidden', i === active ? 'false' : 'true');
      });
      arrows.forEach(function(a, i){
        a.classList.toggle('is-past', i < active);
        a.classList.toggle('is-next', i === active && active < n - 1);
      });
      railNodes.forEach(function(nd, i){
        nd.classList.toggle('on', i === active);
        nd.classList.toggle('done', i < active);
        if(i === active) nd.setAttribute('aria-current', 'step');
        else nd.removeAttribute('aria-current');
      });
      railSegs.forEach(function(s, i){ s.classList.toggle('done', i < active); });
    }
    function go(i){
      active = (i + n) % n;
      layout();
    }

    // autoplay: walk through the trajectory in one direction, then loop.
    var timer = null;
    function tick(){ go(active + 1); }
    function start(){ if(!timer && !reduceMotion) timer = setInterval(tick, 2500); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }
    function restart(){ stop(); start(); }

    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);

    // pointer drag / swipe
    var down = false, moved = false, sx = 0;
    car.addEventListener('pointerdown', function(e){ down = true; moved = false; sx = e.clientX; stop(); });
    car.addEventListener('pointermove', function(e){ if(down && Math.abs(e.clientX - sx) > 8) moved = true; });
    window.addEventListener('pointerup', function(e){
      if(!down) return; down = false;
      var dx = e.clientX - sx;
      if(moved && Math.abs(dx) > 36){ go(active + (dx < 0 ? 1 : -1)); }
      start();
    });

    // click: focus a side card, or open the active one in an in-page window
    cards.forEach(function(c, i){
      c.addEventListener('click', function(){
        if(moved) return;
        if(i !== active){ go(i); restart(); return; }
        if(openTrajectoryWindow(null, i, c)) stop();
      });
    });

    window.addEventListener('resize', layout);
    if('ResizeObserver' in window){ new ResizeObserver(layout).observe(viewport); }
    cards.forEach(function(c){ var img = c.querySelector('img'); if(img && !img.complete){ img.addEventListener('load', layout); } });
    layout();
    start();
  })();
})();
