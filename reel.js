/* =====================================================================
   S-Agent — ~34s auto-playing demo reel (v2).
   title -> hero primer (one case) -> 13-case PARALLEL mini-pipeline wall -> outro.
   Leans on styles.css brand tokens + te* logo animation. Data: window.REEL_TILES.
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
  $("titleLogo").innerHTML = makeLogoSVG("rlA");
  $("outroLogo").innerHTML = makeLogoSVG("rlB");

  /* ---- preload every tile image so the wall paints instantly ---- */
  TILES.forEach(function(t){ (t.steps || []).forEach(function(s){ if(s.img){ var im = new Image(); im.src = s.img; } }); });

  /* ---- a tile = a compact mini reasoning pipeline ---- */
  function buildTile(tile){
    var el = document.createElement("div");
    el.className = "tile" + (tile.benchmark === "MMSI" ? " mmsi" : "");
    var dots = (tile.steps || []).map(function(_, i){ return '<span class="tile-dot" data-d="' + i + '"></span>'; }).join("");
    el.innerHTML =
      '<div class="tile-top"><span class="tile-bm">' + esc(tile.benchmark) + '</span><span class="tile-id">#' + esc(tile.caseId) + '</span><span class="tile-cat">' + esc(tile.category) + '</span></div>'
      + '<div class="tile-view">'
      +   '<img class="tv-img" alt="">'
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
    var isAnswer = step.kind === "answer" || !step.img;
    if(isAnswer){
      el.classList.add("show-answer");
    } else {
      el.classList.remove("show-answer");
      var img = el.querySelector(".tv-img");
      if(img.getAttribute("src") !== step.img){ img.src = step.img; }
      img.classList.remove("show"); void img.offsetWidth; img.classList.add("show");
      el.querySelector(".tile-step .sn").textContent = String(idx + 1);
      el.querySelector(".tile-step .sl").textContent = step.label;
      el.querySelector(".tile-step .sv").textContent = step.value;
    }
  }

  /* ---- mount hero (one representative case) + the 13-tile wall ---- */
  var heroTile = TILES.filter(function(t){ return t.caseId === "3001"; })[0] || TILES[0];
  var heroEl = buildTile(heroTile);
  $("heroMount").appendChild(heroEl);

  var wallEls = TILES.map(function(t){ var el = buildTile(t); $("wallGrid").appendChild(el); return el; });

  /* ---- timeline (seconds) ---- */
  var DUR = 34; window.__REEL_DURATION = DUR;
  var TITLE_END = 3, HERO_END = 10.5, WALL_START = 11, WALL_END = 31;
  var HERO_LEAD = 0.25, HERO_STEP = 1.32;
  var WALL_LEAD = 0.5, WALL_STAGGER = 0.12, WALL_STEP = 3.0;
  var ACTS = { title: $("act-title"), hero: $("act-hero"), wall: $("act-wall"), outro: $("act-outro") };
  var scan = $("reel-scan");

  function actAt(t){ return t < TITLE_END ? "title" : t < WALL_START ? "hero" : t < WALL_END ? "wall" : "outro"; }

  function showAct(name){
    for(var k in ACTS){ ACTS[k].classList.toggle("is-live", k === name); }
  }
  function fireScan(){ scan.classList.remove("go"); void scan.offsetWidth; scan.classList.add("go"); }

  var playing = false, startTs = null, raf = null, lastAct = null;

  function resetReel(){
    lastAct = null;
    heroEl._step = -1; heroEl.classList.remove("show-answer");
    wallEls.forEach(function(el){ el._step = -1; el._entered = false; el.classList.remove("show-answer", "enter"); el.style.visibility = "hidden"; });
  }

  function setMacro(t){
    var act = actAt(t);
    showAct(act);
    if(act !== lastAct){ if(playing && lastAct !== null) fireScan(); lastAct = act; }

    if(act === "hero"){
      setTileStep(heroEl, Math.floor((t - TITLE_END - HERO_LEAD) / HERO_STEP));
    } else if(act === "wall"){
      for(var i = 0; i < wallEls.length; i++){
        var el = wallEls[i];
        var ts = WALL_START + WALL_LEAD + i * WALL_STAGGER;
        if(t >= ts){
          if(el.style.visibility !== "visible"){ el.style.visibility = "visible"; }
          if(!el._entered){ el._entered = true; if(playing){ el.classList.add("enter"); } }
          setTileStep(el, Math.floor((t - ts) / WALL_STEP));
        } else {
          el.style.visibility = "hidden"; el._entered = false; el._step = -1;
        }
      }
    }
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

  /* idle initial frame so ?auto=0 shows the title statically (logo only) */
  showAct("title");

  if(!/[?&]auto=0(\b|$)/.test(location.search)){
    if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", window.startReel); }
    else { window.startReel(); }
  }
})();
