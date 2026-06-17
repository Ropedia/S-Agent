/* =====================================================================
   S-Agent — 20.0s auto-playing demo reel.
   Base: faithful brand-fidelity build (leans on the published site's
   design system: te* logo + traj* trajectory classes).
   Grafted: a real match-cut SPINE across all four act seams (shared-
   element expand/recede) + a recurring scan-sweep & accent-flash
   connective beat on every boundary, so the four acts read as one world.
   No framework, plain JS.
   ===================================================================== */
(function(){
  'use strict';

  /* ---- Trajectory steps: COPIED VERBATIM from app.js (Case 6111) ---- */
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

  /* ---- Act-3 ReVSI cases (5/5 correct) ----
     Cover path is 'trajectories/assets/<group>/<id>/...' — verified to
     return HTTP 200 in this docroot (the bare 'assets/<group>/...' form
     404s here). Do NOT "fix" the prefix; it matches the spec + live root. */
  var revsiCases = [
    {id:'3001', cat:'Distance',  group:'abs_distance',     q:'Distance between the <b>computer mouse</b> and the <b>smoke detector</b>?', gt:'GT 3.0 m',  ans:'3.09 m'},
    {id:'2534', cat:'Distance',  group:'abs_distance',     q:'Distance between the <b>laptop</b> and the <b>desktop printer</b>?',       gt:'GT 3.4 m',  ans:'3.33 m'},
    {id:'467',  cat:'Counting',  group:'counting_single',  q:'How many <b>monitor(s)</b>?',                                              gt:'GT 3',      ans:'3'},
    {id:'383',  cat:'Counting',  group:'counting_single',  q:'How many <b>monitor(s)</b>?',                                              gt:'GT 2',      ans:'2'},
    {id:'422',  cat:'Counting',  group:'counting_single',  q:'How many <b>green pillow(s)</b>?',                                         gt:'GT 3',      ans:'3'}
  ];

  /* ---- Logo SVG factory. Each copy needs UNIQUE gradient ids
         (logoRail / logoBeacon clash if duplicated). ---- */
  var logoSeq = 0;
  function makeLogoSVG(){
    var u = 'rl' + (++logoSeq);
    var railId = u + 'Rail';
    var beaconId = u + 'Beacon';
    var orbitPath = 'M84 118C119 78 185 72 234 107';
    var orbit2Path = 'M75 202C118 238 190 241 247 206';
    var ribbon = 'M224 78C169 46 91 63 85 113C78 173 239 151 241 214C243 266 157 274 90 242';
    return '' +
'<svg class="title-eye anim" viewBox="56 50 210 232" role="img" aria-label="S-Agent logo">' +
  '<defs>' +
    '<linearGradient id="' + railId + '" x1="86" y1="76" x2="244" y2="246" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#CCFFA0"/><stop offset="0.5" stop-color="#6CBF43"/><stop offset="1" stop-color="#4F8F35"/>' +
    '</linearGradient>' +
    '<radialGradient id="' + beaconId + '" cx="50%" cy="50%" r="58%">' +
      '<stop stop-color="#F4FFF0"/><stop offset="0.46" stop-color="#8DF3DF"/><stop offset="1" stop-color="#6CBF43"/>' +
    '</radialGradient>' +
  '</defs>' +
  '<ellipse class="field" cx="166" cy="164" rx="94" ry="114"/>' +
  '<path class="orbit o1" d="' + orbitPath + '"/>' +
  '<path class="orbit o2" d="' + orbit2Path + '"/>' +
  '<path class="mesh" d="M101 107L224 78L240 214L90 242L161 157L101 107M161 157L224 78M161 157L240 214"/>' +
  '<path class="axis" d="M91 176H247M166 72V258"/>' +
  '<path class="back" d="' + ribbon + '"/>' +
  '<path class="rail" d="' + ribbon + '" stroke="url(#' + railId + ')"/>' +
  '<path class="shine" d="' + ribbon + '"/>' +
  '<path class="depth" d="M224 78l13 16M101 107l13 16M161 157l13 16M240 214l13 16M90 242l13 16"/>' +
  '<circle class="spark" r="3.6"><animateMotion dur="5.4s" repeatCount="indefinite" path="' + ribbon + '"/></circle>' +
  '<circle class="spark" r="2.6" opacity="0.7"><animateMotion dur="5.4s" begin="1.9s" repeatCount="indefinite" path="' + ribbon + '"/></circle>' +
  '<g class="beacon" transform="translate(161 157)">' +
    '<circle class="beacon-ring" r="24"/>' +
    '<circle class="beacon-core" r="8" fill="url(#' + beaconId + ')"/>' +
  '</g>' +
  '<g class="node n1" transform="translate(224 78)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>' +
  '<g class="node n2" transform="translate(101 107)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>' +
  '<g class="node n3" transform="translate(161 157)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>' +
  '<g class="node n4" transform="translate(240 214)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>' +
  '<g class="node n5" transform="translate(90 242)"><circle class="ring" r="14"/><circle class="dot" r="13"/></g>' +
'</svg>';
  }

  /* ===================================================================
     DOM refs
     =================================================================== */
  var actTitle   = document.getElementById('act-title');
  var actHero    = document.getElementById('act-hero');
  var actWall    = document.getElementById('act-wall');
  var actOutro   = document.getElementById('act-outro');
  var heroFrame  = document.getElementById('heroFrame');
  var wallWrap   = document.getElementById('wallWrap');
  var outroWrap  = document.getElementById('outroWrap');
  var trajContent= document.getElementById('reelTrajContent');
  var titleFlare = document.getElementById('titleFlare');
  var scanEl     = document.getElementById('reel-scan');
  var flashEl    = document.getElementById('reel-flash');

  /* place logo copies (unique gradient ids each) */
  document.getElementById('titleLogoSlot').innerHTML = makeLogoSVG();
  document.getElementById('heroBarLogo').innerHTML    = makeLogoSVG();
  document.getElementById('wallLogo').innerHTML       = makeLogoSVG();
  document.getElementById('outroLogo').innerHTML      = makeLogoSVG();

  /* ---- Build the trajectory embed shell once, mirroring app.js ---- */
  var trajBuilt = false;
  var trajActive = -1;
  function buildTrajectoryEmbed(){
    if(trajBuilt) return;
    trajContent.innerHTML =
      '<div class="traj-embed-bg"><span></span><span></span></div>' +
      '<div class="traj-native-stage"><article class="traj-native-card" id="reelTrajCard"></article></div>' +
      '<div class="traj-native-controls">' +
        '<div class="traj-native-narrator" id="reelTrajNarrator"></div>' +
        '<div class="traj-native-dots" id="reelTrajDots"></div>' +
        '<div class="traj-native-bar"></div>' +
      '</div>';
    var dots = trajContent.querySelector('#reelTrajDots');
    trajectorySteps.forEach(function(step, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'traj-dotstep';
      btn.setAttribute('aria-label', step.kicker + ' ' + step.label);
      btn.innerHTML = '<span class="pt"></span><span class="dl">' + step.label + '</span>';
      dots.appendChild(btn);
      if(i < trajectorySteps.length - 1){
        var seg = document.createElement('span');
        seg.className = 'traj-dotseg';
        dots.appendChild(seg);
      }
    });
    trajBuilt = true;
  }

  /* Set the hero step. Re-triggers the traj* entrance animation each time
     (style.animation='none', force reflow via offsetHeight, restore). */
  function setTrajectoryStep(i){
    buildTrajectoryEmbed();
    i = Math.max(0, Math.min(trajectorySteps.length - 1, i));
    if(i === trajActive) return;
    trajActive = i;
    var step = trajectorySteps[i];
    trajContent.dataset.step = String(i);
    var card = trajContent.querySelector('#reelTrajCard');
    var narrator = trajContent.querySelector('#reelTrajNarrator');
    if(card){
      card.style.animation = 'none';
      card.offsetHeight; /* force reflow so the card + all traj* children replay */
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
    trajContent.querySelectorAll('.traj-dotstep').forEach(function(btn, idx){
      btn.classList.toggle('is-active', idx === i);
      btn.classList.toggle('is-done', idx < i);
    });
    trajContent.querySelectorAll('.traj-dotseg').forEach(function(seg, idx){
      seg.classList.toggle('is-done', idx < i);
    });
  }

  /* ---- Build the Act-3 case grid once ---- */
  var wallBuilt = false;
  function buildWall(){
    if(wallBuilt) return;
    var grid = document.getElementById('reelGrid');
    var html = '';
    revsiCases.forEach(function(c, i){
      var pos = i === 3 ? ' r2a' : (i === 4 ? ' r2b' : '');
      var catClass = c.cat === 'Counting' ? ' cat-cnt' : '';
      var cover = 'trajectories/assets/' + c.group + '/' + c.id + '/evidence_selector_contact_sheet.jpg';
      html +=
        '<div class="reel-card c' + i + pos + '">' +
          '<div class="reel-card-inner">' +
            '<div class="reel-card-media">' +
              '<span class="reel-card-cat' + catClass + '">' + c.cat + '</span>' +
              '<img src="' + cover + '" alt="Case ' + c.id + ' evidence">' +
            '</div>' +
            '<div class="reel-card-body">' +
              '<div class="reel-card-id">Case ' + c.id + ' · ' + c.group + '</div>' +
              '<div class="reel-card-q">' + c.q + '</div>' +
              '<div class="reel-card-ans">' +
                '<span class="reel-stat gt">' + c.gt + '</span>' +
                '<span class="reel-stat">S-Agent ' + c.ans + '</span>' +
                '<span class="reel-check">✓</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    grid.innerHTML = html;
    wallBuilt = true;
  }

  /* ===================================================================
     Timeline (sums to EXACTLY 20.0s)
       ACT1 title : 0.0 - 2.8
       ACT2 hero  : 2.8 - 14.8  (12.0s, 6 steps x 2.0s)
       ACT3 wall  : 14.8 - 19.2 (4.4s)
       OUTRO      : 19.2 - 20.0 (0.8s)
     =================================================================== */
  var HERO_START = 2.8, HERO_END = 14.8, WALL_START = 14.8, WALL_END = 19.2, OUTRO_START = 19.2;
  var STEP_DUR = (HERO_END - HERO_START) / trajectorySteps.length; // 2.0s
  window.__REEL_DURATION = 20;

  function heroStepForTime(t){
    var k = Math.floor((t - HERO_START) / STEP_DUR);
    return Math.max(0, Math.min(trajectorySteps.length - 1, k));
  }

  /* set which act is live + which hero step, for a given macro time.
     Pure composition — used both by playback and by seekReel(). */
  var liveAct = null;
  function setMacro(t){
    var act;
    if(t < HERO_START)       act = actTitle;
    else if(t < WALL_START)  act = actHero;
    else if(t < OUTRO_START) act = actWall;
    else                     act = actOutro;

    if(act === actHero) setTrajectoryStep(heroStepForTime(t));
    if(act === actWall) buildWall();

    if(act !== liveAct){
      [actTitle, actHero, actWall, actOutro].forEach(function(a){
        a.classList.toggle('is-live', a === act);
      });
      liveAct = act;
      // re-arm act-scoped entrance animations by toggling the reflow
      void act.offsetHeight;
    }
  }

  /* ===================================================================
     Connective tissue: scan-sweep + accent flash fired on every seam.
     (grafted from the high-energy candidate — ties the world together)
     =================================================================== */
  function fireScan(){
    if(scanEl){ scanEl.classList.remove('go'); void scanEl.offsetWidth; scanEl.classList.add('go'); }
  }
  function fireFlash(){
    if(flashEl){ flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go'); }
  }

  /* ===================================================================
     MATCH-CUT SPINE (grafted idea: real shared-element cuts, not
     crossfades, across ALL four seams).
       title -> hero : beacon flare expands; hero frame scales up from
                       the beacon center (shared origin).
       hero  -> wall : final 'D' frame shrinks/recedes AS the wall grid
                       lands — the shrinking card visually multiplies
                       into the 5 cards.
       wall  -> outro: the whole wall recedes/contracts into the centered
                       outro logo lockup (shared center).
     =================================================================== */
  function matchCutTitleToHero(){
    fireScan(); fireFlash();
    if(titleFlare){
      titleFlare.style.animation = 'none'; void titleFlare.offsetHeight;
      titleFlare.style.opacity = '1';
      titleFlare.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), opacity .5s ease';
      titleFlare.style.transform = 'translate(-50%,-50%) scale(34)';
      setTimeout(function(){ titleFlare.style.opacity = '0'; }, 360);
    }
    if(heroFrame){
      heroFrame.style.animation = 'none'; void heroFrame.offsetHeight;
      heroFrame.style.transformOrigin = '50% 46%';
      heroFrame.style.animation = 'reelHeroFromBeacon .58s cubic-bezier(.2,.9,.24,1) both';
    }
  }
  function matchCutHeroToWall(){
    // final 'D' frame recedes/shrinks while the wall grid simultaneously
    // lands behind it — a true shared-element hand-off, not a hard cut.
    fireScan(); fireFlash();
    if(heroFrame){
      heroFrame.style.animation = 'reelHeroRecede .46s cubic-bezier(.4,0,.2,1) both';
    }
    if(wallWrap){
      wallWrap.style.animation = 'none'; void wallWrap.offsetHeight;
      wallWrap.style.transformOrigin = '50% 50%';
      wallWrap.style.animation = 'reelWallEmerge .5s cubic-bezier(.2,.9,.24,1) both';
    }
  }
  function matchCutWallToOutro(){
    // the wall contracts toward its center; the outro logo lockup rises
    // out of that same center — shared-center recede match-cut.
    fireScan(); fireFlash();
    if(wallWrap){
      wallWrap.style.animation = 'reelWallRecede .42s cubic-bezier(.4,0,.2,1) both';
    }
    if(outroWrap){
      outroWrap.style.animation = 'none'; void outroWrap.offsetHeight;
      outroWrap.style.transformOrigin = '50% 50%';
      outroWrap.style.animation = 'reelOutroFromCenter .56s cubic-bezier(.2,1.05,.28,1) both';
    }
  }

  /* inject the match-cut keyframes (frame-level, not in styles.css) */
  (function(){
    var s = document.createElement('style');
    s.textContent =
      '@keyframes reelHeroFromBeacon{0%{opacity:.2;transform:scale(.12);}60%{opacity:1;transform:scale(1.02);}100%{opacity:1;transform:scale(1);}}' +
      '@keyframes reelHeroRecede{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(.62);}}' +
      '@keyframes reelWallEmerge{0%{opacity:0;transform:scale(.7);}60%{opacity:1;transform:scale(1.01);}100%{opacity:1;transform:scale(1);}}' +
      '@keyframes reelWallRecede{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(.24);}}' +
      '@keyframes reelOutroFromCenter{0%{opacity:0;transform:scale(.32);}55%{opacity:1;transform:scale(1.03);}100%{opacity:1;transform:scale(1);}}';
    document.head.appendChild(s);
  })();

  function clearTransientCutStyles(){
    if(heroFrame) heroFrame.style.animation = '';
    if(wallWrap)  wallWrap.style.animation = '';
    if(outroWrap) outroWrap.style.animation = '';
    if(titleFlare){ titleFlare.style.transform = 'translate(-50%,-50%) scale(0)'; titleFlare.style.opacity = '0'; }
    if(scanEl) scanEl.classList.remove('go');
    if(flashEl) flashEl.classList.remove('go');
  }

  /* ===================================================================
     Playback loop (rAF, macro time in seconds)
     =================================================================== */
  var startTs = null, rafId = null, playing = false;
  var firedTitleCut = false, firedWallCut = false, firedOutroCut = false;

  function frame(ts){
    if(startTs === null) startTs = ts;
    var t = (ts - startTs) / 1000;

    // one-shot match-cuts at act boundaries (fire slightly before the
    // hard composition swap so the shared element is already moving)
    if(!firedTitleCut && t >= HERO_START){ firedTitleCut = true; matchCutTitleToHero(); }
    if(!firedWallCut  && t >= WALL_START - 0.42){ firedWallCut = true; matchCutHeroToWall(); }
    if(!firedOutroCut && t >= OUTRO_START - 0.40){ firedOutroCut = true; matchCutWallToOutro(); }

    setMacro(Math.min(t, 19.999));

    if(t >= window.__REEL_DURATION){
      playing = false;
      setMacro(19.999); // settle on outro
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  window.startReel = function(){
    if(playing) return;
    if(rafId) cancelAnimationFrame(rafId);
    startTs = null;
    firedTitleCut = false; firedWallCut = false; firedOutroCut = false;
    playing = true;
    clearTransientCutStyles();
    liveAct = null; trajActive = -1;
    rafId = requestAnimationFrame(frame);
  };

  /* seekReel(t): set the MACRO composition (which act + which hero step)
     to time t, WITHOUT running the rAF clock — for screenshot verification.
     Transient match-cut transforms are cleared so the seeked act renders
     clean and fully visible. */
  window.seekReel = function(tSeconds){
    if(playing){ playing = false; if(rafId) cancelAnimationFrame(rafId); }
    var t = Math.max(0, Math.min(tSeconds, 19.999));
    clearTransientCutStyles();
    liveAct = null;            // force re-arm of entrance animations
    if(t >= HERO_START && t < WALL_START) trajActive = -1; // force step re-trigger
    setMacro(t);
  };

  /* auto-play on load (suppressed with ?auto=0 for clean offline capture) */
  if(!/[?&]auto=0(\b|$)/.test(location.search)){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', window.startReel);
    } else {
      window.startReel();
    }
  }
})();
