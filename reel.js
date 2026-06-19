/* =====================================================================
   S-Agent — ~42s auto-playing demo reel (v5).
   Act 1 TITLE  -> minimal brand build (animated logo + wordmark + tagline)
   Act 2 STRIP  -> top step-preview strip + center enlarged stage walking the
                   full case-6111 reasoning pipeline. Each step flies a card
                   up from its strip thumbnail into a big center stage card.
                   (assets from assets/case6111/ + assets/case6111/demo/.)
   Act 3 WALL   -> fast 13/13 zero-shot finale (data: window.REEL_TILES).
   Act 4 OUTRO  -> sign-off.
   Hooks: window.startReel(), window.seekReel(t), window.__REEL_DURATION.
   ===================================================================== */
(function(){
  "use strict";
  var TILES = (window.REEL_TILES || []).slice();
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); };

  /* ---- the real S-Agent logo (te* classes animate it via styles.css) ---- */
  function makeLogoSVG(idp){
    var D = "M224 78C169 46 91 63 85 113C78 173 239 151 241 214C243 266 157 274 90 242";
    return '<svg class="title-eye anim" viewBox="56 50 210 232" role="img" aria-label="S-Agent logo">'
      + '<defs>'
      + '<linearGradient id="' + idp + 'Rail" x1="86" y1="76" x2="244" y2="246" gradientUnits="userSpaceOnUse"><stop stop-color="#CCFFA0"/><stop offset="0.5" stop-color="#6CBF43"/><stop offset="1" stop-color="#4F8F35"/></linearGradient>'
      + '<radialGradient id="' + idp + 'Beacon" cx="50%" cy="50%" r="58%"><stop stop-color="#F4FFF0"/><stop offset="0.46" stop-color="#8DF3DF"/><stop offset="1" stop-color="#6CBF43"/></radialGradient>'
      + '</defs>'
      + '<ellipse class="field" cx="166" cy="164" rx="94" ry="114"/>'
      + '<path class="orbit o1" d="M84 118C119 78 185 72 234 107"/>'
      + '<path class="orbit o2" d="M75 202C118 238 190 241 247 206"/>'
      + '<path class="mesh" d="M101 107L224 78L240 214L90 242L161 157L101 107M161 157L224 78M161 157L240 214"/>'
      + '<path class="axis" d="M91 176H247M166 72V258"/>'
      + '<path class="back" d="' + D + '"/>'
      + '<path class="rail" d="' + D + '" stroke="url(#' + idp + 'Rail)"/>'
      + '<path class="shine" d="' + D + '"/>'
      + '<path class="depth" d="M224 78l13 16M101 107l13 16M161 157l13 16M240 214l13 16M90 242l13 16"/>'
      + '<circle class="spark" r="3.6"><animateMotion dur="5.4s" repeatCount="indefinite" path="' + D + '"/></circle>'
      + '<circle class="spark" r="2.6" opacity="0.7"><animateMotion dur="5.4s" begin="1.9s" repeatCount="indefinite" path="' + D + '"/></circle>'
      + '<g class="beacon" transform="translate(161 157)"><circle class="beacon-ring" r="24"/><circle class="beacon-core" r="8" fill="url(#' + idp + 'Beacon)"/></g>'
      + '<g class="node n1" transform="translate(224 78)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>'
      + '<g class="node n2" transform="translate(101 107)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>'
      + '<g class="node n3" transform="translate(161 157)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>'
      + '<g class="node n4" transform="translate(240 214)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>'
      + '<g class="node n5" transform="translate(90 242)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>'
      + '</svg>';
  }
  $("titleLogo").insertAdjacentHTML("afterbegin", makeLogoSVG("rlA"));
  $("outroLogo").innerHTML = makeLogoSVG("rlB");

  /* ---- drifting point-cloud field behind everything (spatial chrome) ---- */
  (function buildDotField(){
    var svg = $("dotField"); if(!svg) return;
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", "dotG");
    for(var i = 0; i < 150; i++){
      var a = i * 2.399963;            // golden-angle spiral
      var rad = 60 + (i % 7) * 120 + Math.sin(i * .37) * 90;
      var x = 960 + Math.cos(a) * rad * (0.4 + (i % 5) * .12);
      var y = 540 + Math.sin(a) * rad * (0.34 + (i % 4) * .12) * .62;
      if(x < 40 || x > 1880 || y < 40 || y > 1040) continue;
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("r", (1.1 + (i % 4) * .7).toFixed(2));
      c.style.fill = (i % 3 === 0) ? "var(--teal)" : "var(--accent)";
      c.style.opacity = (0.05 + (i % 6) * .028).toFixed(3);
      g.appendChild(c);
    }
    svg.appendChild(g);
  })();

  /* ===================== ACT 2 · STEP-STRIP + STAGE ===================== */
  /* case 6111 pipeline. A top preview strip (#stepStrip) shows the six steps
     as small thumbnails; the active step's full card is enlarged in the
     center stage (#centerStage). CSS owns the fly-in / enlarge / reveals;
     this engine only toggles classes + restarts the rotating webp medias. */
  var A  = "assets/case6111/demo/";     // demo/ has every asset incl. camera.jpg + the rotating .webp clouds
  var AD = "assets/case6111/demo/";     // richer stage assets live in /demo/
  var EGO_SVG =
    '<svg viewBox="0 0 320 150" role="img" aria-label="Egocentric person frame">'
    + '<line class="fd-axis" x1="44" y1="86" x2="276" y2="86"/><line class="fd-axis" x1="160" y1="34" x2="160" y2="136"/>'
    + '<g class="fd-spin">'
    +   '<line class="fd-front" x1="160" y1="86" x2="160" y2="48"/><path class="fd-fronthead" d="M160 38 L152 54 L168 54 Z"/>'
    +   '<circle class="fd-ring" cx="160" cy="86" r="25"/><path class="fd-turn" d="M138 70 L132 80 L144 82 Z"/>'
    +   '<circle class="fd-door" cx="160" cy="122" r="6"/><circle class="fd-person" cx="160" cy="86" r="7"/>'
    + '</g>'
    + '<text class="fd-t cy" x="160" y="30" text-anchor="middle">FACING</text>'
    + '<text class="fd-t cy" x="160" y="74" text-anchor="middle">PERSON</text>'
    + '<text class="fd-t gd" x="160" y="146" text-anchor="middle">DOOR · BACK</text>'
    + '<text class="fd-t" x="22" y="90">LEFT</text><text class="fd-t" x="298" y="90" text-anchor="end">RIGHT</text></svg>';
  var REL_SVG =
    '<svg viewBox="0 0 320 150" role="img" aria-label="Relative position back-right">'
    + '<path class="fd-zone" d="M160 86 H290 V138 H160 Z"/>'
    + '<line class="fd-axis" x1="44" y1="86" x2="276" y2="86"/><line class="fd-axis" x1="160" y1="34" x2="160" y2="136"/>'
    + '<line class="fd-front" x1="160" y1="86" x2="160" y2="48"/><path class="fd-fronthead" d="M160 38 L152 54 L168 54 Z"/>'
    + '<path class="fd-path" d="M160 86 L232 116"/>'
    + '<circle class="fd-door" cx="160" cy="122" r="6"/><circle class="fd-person" cx="160" cy="86" r="7"/><circle class="fd-cam" cx="232" cy="116" r="6.5"/>'
    + '<text class="fd-t cy" x="160" y="30" text-anchor="middle">FACING</text>'
    + '<text class="fd-t gd" x="150" y="118" text-anchor="end">DOOR</text><text class="fd-t rs" x="244" y="110">CAMERA</text>'
    + '<text class="fd-t" x="22" y="90">LEFT</text><text class="fd-t rs" x="298" y="134" text-anchor="end">BACK-RIGHT</text></svg>';

  var CASE = [
    { thumb:A+"contact.jpg", label:"Question", badge:"STEP 01",
      narr:'Standing by the <b>headphones</b>, facing away from the <span class="g">entrance door</span> — is the <span class="r">camera</span> front-left, front-right, back-left or back-right?',
      body:
        '<div class="sc-head"><span class="sc-title">Question + Video Input</span><span class="sc-chip"><b>64</b> frames</span></div>'
        + '<div class="sc-body sc-body-q"><div class="sc-q">If I stand by the <b>headphones</b>, facing away from the <span class="g">entrance door</span>, is the <span class="r">camera</span> to my <b>front-left</b>, <b>front-right</b>, <b>back-left</b> or <b>back-right</b>?</div><div class="sc-grid"><img src="'+AD+'contact.jpg" alt=""></div></div>' },

    { thumb:A+"headphones.jpg", label:"Grounding", badge:"STEP 02",
      narr:'Object grounding locks the three spatial entities in the 2D views — <b>headphones</b>, <span class="g">entrance door</span> and <span class="r">camera</span>, 3 / 3 located.',
      body:
        '<div class="sc-head"><span class="sc-title">2D Object Grounding</span><span class="sc-chip teal"><b>3/3</b> located</span></div>'
        + '<div class="sc-body sc-trip"><figure class="sc-shot s1"><img src="'+AD+'headphones.jpg" alt=""><figcaption><i class="od cy"></i>headphones · 0.98</figcaption></figure><figure class="sc-shot s2"><img src="'+AD+'door.jpg" alt=""><figcaption><i class="od gd"></i>entrance door · 0.98</figcaption></figure><figure class="sc-shot s3"><img src="'+AD+'camera.jpg" alt=""><figcaption><i class="od rs"></i>camera · 0.39</figcaption></figure></div>' },

    { thumb:A+"cloudPoster.png", label:"Metric3D", badge:"STEP 03",
      narr:'Metric3D lifts the grounded entities into a dense point cloud, recovering the real-world centres of all three anchors.',
      body:
        '<div class="sc-head"><span class="sc-title">2D-to-3D Geometric Lifting</span><span class="sc-chip teal"><b>3D</b> reconstruction</span></div>'
        + '<div class="sc-body sc-cloud"><div class="sc-cloud-view"><img class="sc-anim" data-anim="'+AD+'cloudAnim.webp" src="'+AD+'cloudAnim.webp" alt=""></div><div class="sc-side"><div class="sc-kpi teal"><span>object centers</span><b>3 anchors</b></div><div class="sc-stack"><span><i class="od cy"></i>headphones</span><span><i class="od gd"></i>door</span><span><i class="od rs"></i>camera</span></div></div></div>' },

    { thumb:A+"top.png", label:"Egocentric", badge:"STEP 04",
      narr:'The orientation expert rotates the top-down layout into the person’s frame: stand at the <b>headphones</b>, facing away from the <span class="g">door</span>.',
      body:
        '<div class="sc-head"><span class="sc-title">Egocentric Frame</span><span class="sc-chip">VIS-ORIENT expert</span></div>'
        + '<div class="sc-body sc-ego"><div class="sc-ego-view"><img class="sc-anim" data-anim="'+AD+'step3Intro.webp" src="'+AD+'step3Intro.webp" alt=""></div><div class="sc-ego-diagram">'+EGO_SVG+'</div></div>' },

    { thumb:A+"front.png", label:"Relative", badge:"STEP 05",
      narr:'In the person’s coordinate frame, the relative-direction expert places the <span class="r">camera</span> at the <span class="c">back-right</span> quadrant.',
      body:
        '<div class="sc-head"><span class="sc-title">Relative Direction</span><span class="sc-chip">REL-DIR expert</span></div>'
        + '<div class="sc-body sc-rel"><div class="sc-rel-diagram">'+REL_SVG+'</div></div>' },

    { thumb:A+"still.jpg", label:"Answer", badge:"FINAL", final:true,
      narr:'Final answer — <span class="c">D · back-right</span>. Multi-turn reasoning, grounding, 3D lifting and expert tools close the loop, zero-shot.',
      body:
        '<div class="sc-head final"><span class="sc-title">Final Answer</span><span class="sc-chip ok">✓ correct</span></div>'
        + '<div class="sc-body sc-final"><div class="f-q">Standing at <b>headphones</b>, facing away from the <span class="b2">entrance door</span> — locate the <span class="b3">camera</span></div><div class="f-num">D</div><div class="f-dir">back-right</div><div class="f-row"><span class="f-pill">✓ correct</span><span class="f-pill gt">ground truth <b>D</b></span></div><div class="f-meta">3 turns · 6 tool calls · zero-shot</div></div>' }
  ];
  var FINAL_NARR = 'Five spatial-reasoning steps — from video evidence to an egocentric direction — answered <span class="c">D · back-right</span>, correct and zero-shot.';
  var INTRO_NARR = '<span style="color:var(--muted)">One agent, one full tool-use trajectory — five steps from a question to an egocentric direction.</span>';

  var N = CASE.length;

  /* narrator caption swap (shared with the overview beats below). */
  var narEl = $("narrator"), narText = $("narText"), narTimer = null;
  function setNarrator(html){
    if(!narEl || !narText) return;
    narEl.classList.add("swap");
    if(narTimer) clearTimeout(narTimer);
    narTimer = setTimeout(function(){ narText.innerHTML = html; narEl.classList.remove("swap"); }, 260);
  }

  /* ---- build the top preview strip (#stepStrip) + center stage (#centerStage) ---- */
  var stepStrip = $("stepStrip"), ssFill = $("ssFill"), centerStage = $("centerStage");
  var ssNodes = [], stageCards = [];

  function buildStrip(){
    if(!stepStrip) return;
    CASE.forEach(function(s, i){
      var n = document.createElement("div");
      n.className = "ss-node";
      n.setAttribute("data-i", i);
      n.innerHTML = '<div class="ss-thumb"><img src="' + s.thumb + '" alt=""></div>'
        + '<div class="ss-label">' + s.label + '</div>';
      stepStrip.appendChild(n);
      ssNodes.push(n);
    });
  }
  function buildStage(){
    if(!centerStage) return;
    CASE.forEach(function(s, i){
      var c = document.createElement("div");
      c.className = "stage-card";
      c.setAttribute("data-i", i);
      c.innerHTML = '<div class="sc-badge">' + s.badge + '</div>' + s.body;
      centerStage.appendChild(c);
      stageCards.push(c);
    });
  }
  buildStrip();
  buildStage();

  /* preload strip thumbnails */
  CASE.forEach(function(s){ var im = new Image(); im.src = s.thumb; });

  /* restart the rotating webp inside a card so it replays from frame 0 each
     time the card goes live (a fresh query string forces a reload). */
  var mediaCounter = 0;
  function restartCardMedia(card){
    var anim = card.querySelectorAll("img.sc-anim");
    for(var k = 0; k < anim.length; k++){
      var img = anim[k], base = img.getAttribute("data-anim");
      if(!base) continue;
      img.src = base + "?r=" + (++mediaCounter);
    }
  }

  /* ------------------------------------------------------------------ */
  /* setStep(key): drive strip + stage.  Keys:
        "intro"  -> strip visible, no card live, fill 0  (pre-roll)
        0..N-1   -> that step active; nodes < i are .done; card i flies in
        "done"   -> all nodes .done, no card live, fill 100% (closing overview)
     Idempotent: tracks the last applied key and skips heavy work when the
     key is unchanged, unless `force` is set (resets / seek re-apply clean). */
  /* ------------------------------------------------------------------ */
  var lastStepKey = null;
  function applyStepClasses(active, doneUpto, fillFrac){
    for(var i = 0; i < N; i++){
      var done = i <= doneUpto && i !== active;
      if(ssNodes[i]){ ssNodes[i].classList.toggle("active", i === active); ssNodes[i].classList.toggle("done", done); }
      if(stageCards[i]) stageCards[i].classList.toggle("is-live", i === active);
    }
    if(ssFill) ssFill.style.width = (Math.max(0, Math.min(1, fillFrac)) * 100) + "%";
  }
  function setStep(key, force){
    if(!force && key === lastStepKey) return;
    var changed = (key !== lastStepKey);
    lastStepKey = key;

    if(key === "intro"){
      applyStepClasses(-1, -1, 0);
      if(changed || force) setNarrator(INTRO_NARR);
      return;
    }
    if(key === "done"){
      applyStepClasses(-1, N - 1, 1);
      if(changed || force) setNarrator(FINAL_NARR);
      return;
    }
    var i = key;                                         // numeric step index
    var frac = N > 1 ? (i / (N - 1)) : 1;                // 0 → 1 across the steps
    applyStepClasses(i, i - 1, frac);
    if(stageCards[i]) restartCardMedia(stageCards[i]);   // replay the rotating webp
    if(changed || force) setNarrator(CASE[i].narr);
  }

  /* ============================ ACT 3 · WALL ============================ */
  function buildTile(tile){
    var el = document.createElement("div");
    el.className = "tile" + (tile.benchmark === "MMSI" ? " mmsi" : "");
    var dots = (tile.steps || []).map(function(_, i){ return '<span class="tile-dot"></span>'; }).join("");
    el.innerHTML =
      '<div class="tile-top"><span class="tile-bm">' + esc(tile.benchmark) + '</span><span class="tile-id">#' + esc(tile.caseId) + '</span><span class="tile-cat">' + esc(tile.category) + '</span></div>'
      + '<div class="tile-view"><img class="tv-img" alt="">'
      +   '<div class="tile-step"><span class="sn">1</span><span class="sl"></span><span class="sv"></span></div>'
      +   '<div class="tile-answer"><div class="tile-ans">' + esc(tile.answer) + '</div><div class="tile-aq">' + esc(tile.questionShort) + '</div>'
      +     '<div class="tile-ver"><span class="tile-ok">✓</span> S-Agent <b>' + esc(tile.answer) + '</b> · GT <b>' + esc(tile.gt) + '</b></div></div>'
      + '</div>'
      + '<div class="tile-q">' + esc(tile.questionShort) + '</div>'
      + '<div class="tile-dots">' + dots + '</div>';
    el._tile = tile; el._step = -1; el._entered = false;
    return el;
  }
  function setTileStep(el, idx){
    var tile = el._tile, steps = tile.steps || [];
    idx = Math.max(0, Math.min(idx, steps.length - 1));
    if(idx === el._step) return;
    el._step = idx;
    var step = steps[idx];
    var dots = el.querySelectorAll(".tile-dot");
    for(var k = 0; k < dots.length; k++){ dots[k].classList.toggle("done", k <= idx); dots[k].classList.toggle("cur", k === idx); }
    if(step.kind === "answer" || !step.img){ el.classList.add("show-answer"); }
    else {
      el.classList.remove("show-answer");
      var img = el.querySelector(".tv-img");
      if(img.getAttribute("src") !== step.img){ img.src = step.img; }
      img.classList.remove("show"); void img.offsetWidth; img.classList.add("show");
      el.querySelector(".tile-step .sn").textContent = String(idx + 1);
      el.querySelector(".tile-step .sl").textContent = step.label;
      el.querySelector(".tile-step .sv").textContent = step.value;
    }
  }
  TILES.forEach(function(t){ (t.steps || []).forEach(function(s){ if(s.img){ var im = new Image(); im.src = s.img; } }); });
  var wallEls = TILES.map(function(t){ var el = buildTile(t); $("wallGrid").appendChild(el); return el; });
  var wallBanner = $("wallBanner");

  /* ============================== TIMELINE ============================== */
  /* >>> TUNABLE ACT-2 (STRIP) CONSTANTS — adjust to re-pace the pipeline <<< */
  var TITLE_END     = 6.0;   // s : title hold before the strip act
  var STRIP_LEAD    = 0.6;   // s : strip fade-in / pre-roll before step 0
  var STEP_DWELL    = 3.8;   // s : dwell per step (×N steps)
  var DONE_DWELL    = 1.5;   // s : all-done overview hold before the wall
  /* ---------------------------------------------------------------------- */
  var STRIP_START   = TITLE_END;                        // 6.0
  var STEPS_START   = STRIP_START + STRIP_LEAD;         // 6.6
  var STEPS_END     = STEPS_START + N * STEP_DWELL;     // 6.6 + 6*3.8 = 29.4
  var DONE_END      = STEPS_END + DONE_DWELL;           // 30.9
  var WALL_START    = DONE_END;                         // 30.9
  var WALL_LEAD = 0.4, WALL_STAGGER = 0.10, WALL_STEP = 0.34, WALL_BANNER_AT = 4.2;
  var WALL_END      = WALL_START + 6.6;                 // 37.5
  var DUR           = WALL_END + 4.3;                   // 41.8
  window.__REEL_DURATION = DUR;

  var ACTS = { title: $("act-title"), rail: $("act-rail"), wall: $("act-wall"), outro: $("act-outro") };
  var stage = $("stage"), scan = $("reel-scan");
  function actAt(t){ return t < TITLE_END ? "title" : t < WALL_START ? "rail" : t < WALL_END ? "wall" : "outro"; }
  function showAct(name){ for(var k in ACTS){ ACTS[k].classList.toggle("is-live", k === name); } stage.classList.toggle("chrome-on", name !== "title"); }
  function fireScan(){ scan.classList.remove("go"); void scan.offsetWidth; scan.classList.add("go"); }

  /* drive the step-strip + center stage from the master clock.
     intro pre-roll -> step 0..N-1 -> all-done overview. */
  function updateRail(t){
    if(t < STEPS_START){ setStep("intro"); }
    else if(t < STEPS_END){ setStep(Math.max(0, Math.min(N - 1, Math.floor((t - STEPS_START) / STEP_DWELL)))); }
    else { setStep("done"); }
  }
  function updateWall(t){
    var rel = t - WALL_START;
    for(var i = 0; i < wallEls.length; i++){
      var el = wallEls[i], ts = WALL_LEAD + i * WALL_STAGGER;
      if(rel >= ts){
        if(el.style.visibility !== "visible"){ el.style.visibility = "visible"; }
        if(!el._entered){ el._entered = true; if(playing) el.classList.add("enter"); }
        setTileStep(el, Math.floor((rel - ts) / WALL_STEP));
      } else { el.style.visibility = "hidden"; el._entered = false; el._step = -1; }
    }
    wallBanner.classList.toggle("go", rel >= WALL_BANNER_AT);
  }

  var playing = false, startTs = null, raf = null, lastAct = null;
  function resetReel(){
    lastAct = null;
    /* clear strip + stage: no node active/done, no card live, fill empty. */
    lastStepKey = null;
    for(var i = 0; i < N; i++){
      if(ssNodes[i]) ssNodes[i].classList.remove("active", "done");
      if(stageCards[i]) stageCards[i].classList.remove("is-live");
    }
    if(ssFill) ssFill.style.width = "0%";
    /* re-hide wall tiles (unchanged). */
    wallEls.forEach(function(el){ el._step = -1; el._entered = false; el.classList.remove("show-answer", "enter"); el.style.visibility = "hidden"; });
    wallBanner.classList.remove("go");
  }
  function setMacro(t){
    var act = actAt(t);
    showAct(act);
    if(act !== lastAct){ if(playing && lastAct !== null) fireScan(); lastAct = act; }
    if(act === "rail") updateRail(t);
    else if(act === "wall") updateWall(t);
  }
  function frame(ts){
    if(startTs === null) startTs = ts;
    var t = (ts - startTs) / 1000;
    setMacro(t);
    if(t >= DUR){ playing = false; setMacro(DUR - 0.001); return; }
    raf = requestAnimationFrame(frame);
  }

  window.startReel = function(){
    if(playing) return;
    if(raf) cancelAnimationFrame(raf);
    startTs = null; playing = true; resetReel();
    raf = requestAnimationFrame(frame);
  };
  window.seekReel = function(tSeconds){
    if(playing){ playing = false; if(raf) cancelAnimationFrame(raf); }
    resetReel();
    setMacro(Math.max(0, Math.min(tSeconds, DUR - 0.001)));
  };

  /* idle initial frame so ?auto=0 shows the title statically */
  showAct("title");
  setStep("intro", true);

  if(!/[?&]auto=0(\b|$)/.test(location.search)){
    if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", window.startReel); }
    else { window.startReel(); }
  }
})();
