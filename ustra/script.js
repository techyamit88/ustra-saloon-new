/* =========================================================================
   USTRA — Classic Indian Saloon
   Vanilla JS. No frameworks, no build step — drop these three files
   (index.html, style.css, script.js) plus an /audio folder anywhere
   static files are served.
   ========================================================================= */
(() => {
  "use strict";

  /* -----------------------------------------------------------------------
     0. DATA — services & playlist live here so content is easy to edit
     ----------------------------------------------------------------------- */
  const DATA = {
    services: [
      { icon:"✂️", name:"Haircut",            price:"₹150",  desc:"Classic scissor-over-comb, any style." },
      { icon:"🪒", name:"Ustra Shave",         price:"₹60",   desc:"Hot towel + straight razor finish." },
      { icon:"💆", name:"Head Massage",        price:"₹100",  desc:"10-minute champi with warm oil." },
      { icon:"🧖", name:"Facial",              price:"₹300",  desc:"Cleanup, scrub, mask & glow." },
      { icon:"🎨", name:"Hair Colour",         price:"₹250",  desc:"Global colour or grey coverage." },
      { icon:"🌿", name:"Bridal Mehendi",      price:"₹1200", desc:"Full hands, traditional patterns." },
    ],
    // Placeholder playlist. Copyrighted commercial tracks can't be bundled here —
    // drop your own licensed 90s Bollywood / Indipop MP3s into /audio using these
    // exact filenames (or edit the src values below) and the player will pick them up.
    //
    // window.USTRA_AUDIO_OVERRIDE: when running under the Streamlit wrapper
    // (app.py), plain relative paths like "audio/track-1.mp3" don't resolve —
    // Streamlit doesn't serve arbitrary local folders like a normal web server.
    // app.py works around this by base64-embedding the MP3s directly into the
    // page and setting this global before script.js runs. Opening index.html
    // straight in a browser (or any normal static host) never sets this, so it
    // just falls back to the relative /audio paths below as usual.
    playlist: (window.USTRA_AUDIO_OVERRIDE && window.USTRA_AUDIO_OVERRIDE.length)
      ? window.USTRA_AUDIO_OVERRIDE
      : [
          { title:"Yaadon Ki Gali",   artist:"Old Radio Sessions", src:"audio/track-1.mp3" },
          { title:"Chandni Raat",     artist:"Retro Waves",        src:"audio/track-2.mp3" },
          { title:"Sham-e-Mehfil",    artist:"Old Radio Sessions", src:"audio/track-3.mp3" },
        ],
  };

  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  /* -----------------------------------------------------------------------
     1. LOADER / CURTAIN — also doubles as the required user gesture
        that unlocks autoplay for the music player
     ----------------------------------------------------------------------- */
  function initLoader(onEnter){
    const loader  = $("#loader");
    const enterBtn = $("#enterBtn");
    let opened = false;

    function open(){
      if (opened) return;
      opened = true;
      loader.classList.add("is-open");
      document.body.style.overflow = "";
      setTimeout(() => loader.classList.add("is-hidden"), 1200);
      onEnter && onEnter();
    }

    document.body.style.overflow = "hidden";
    enterBtn.addEventListener("click", open);

    // Safety net: if someone lands with JS-disabled affordances or waits too long,
    // don't trap them behind the curtain forever.
    setTimeout(open, 15000);
  }

  /* -----------------------------------------------------------------------
     2. DAY / NIGHT SALOON TOGGLE
     ----------------------------------------------------------------------- */
  function initThemeToggle(){
    const root   = document.documentElement;
    const toggle = $("#themeToggle");
    const label  = $("#themeLabel");
    const stored = localStorage.getItem("ustra-theme");
    if (stored) root.setAttribute("data-theme", stored);

    function sync(){
      const isDay = root.getAttribute("data-theme") === "day";
      toggle.setAttribute("aria-pressed", String(isDay));
      label.textContent = isDay ? "Day Saloon" : "Night Saloon";
    }
    sync();

    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "day" ? "night" : "day";
      root.setAttribute("data-theme", next);
      localStorage.setItem("ustra-theme", next);
      sync();
    });
  }

  /* -----------------------------------------------------------------------
     3. MOBILE NAV
     ----------------------------------------------------------------------- */
  function initMobileNav(){
    const burger = $("#navBurger");
    const menu   = $("#navLinksMobile");
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("#navLinksMobile a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }));
  }

  /* -----------------------------------------------------------------------
     4. FLOATING PETALS — lightweight canvas particle system
     ----------------------------------------------------------------------- */
  function initPetals(){
    const canvas = $("#petalCanvas");
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let petals = [];
    let w, h;

    function resize(){
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function makePetal(){
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h,
        r: 4 + Math.random() * 5,
        speedY: .4 + Math.random() * .6,
        speedX: Math.sin(Math.random() * Math.PI),
        drift: Math.random() * Math.PI * 2,
        hue: Math.random() > .5 ? "#E8A33D" : "#B21F2D",
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - .5) * .02,
      };
    }
    const COUNT = reduceMotion ? 0 : Math.min(26, Math.floor(window.innerWidth / 60));
    petals = Array.from({length: COUNT}, makePetal);

    function drawPetal(p){
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = .55;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * .6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function tick(){
      ctx.clearRect(0, 0, w, h);
      petals.forEach(p => {
        p.drift += .01;
        p.y += p.speedY;
        p.x += Math.sin(p.drift) * .6;
        p.rot += p.rotSpeed;
        if (p.y > h + 20){ Object.assign(p, makePetal(), {y:-20}); }
        drawPetal(p);
      });
      requestAnimationFrame(tick);
    }
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  /* -----------------------------------------------------------------------
     5. SERVICE FLIP CARDS
     ----------------------------------------------------------------------- */
  function initServiceCards(){
    const grid = $("#cardGrid");
    grid.innerHTML = DATA.services.map(s => `
      <div class="flip-card">
        <div class="flip-card__inner">
          <button class="flip-card__face flip-card__front" type="button" aria-label="${s.name}, tap for price">
            <span class="flip-card__icon" aria-hidden="true">${s.icon}</span>
            <span class="flip-card__name">${s.name}</span>
            <span class="flip-card__hint">Tap to see price</span>
          </button>
          <div class="flip-card__face flip-card__back">
            <span class="flip-card__price">${s.price}</span>
            <span class="flip-card__desc">${s.desc}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  /* -----------------------------------------------------------------------
     6. BEFORE / AFTER SLIDER
     ----------------------------------------------------------------------- */
  function initGallerySlider(){
    const slider = $("#baSlider");
    const before = $(".ba-frame__panel--before");
    const handle = $("#baHandle");

    function update(val){
      before.style.clipPath = `inset(0 0 0 ${val}%)`;
      handle.style.left = `${val}%`;
    }
    update(slider.value);
    slider.addEventListener("input", e => update(e.target.value));
  }

  /* -----------------------------------------------------------------------
     7. BOOKING FORM — register-style, client-side only (no backend wired up)
     ----------------------------------------------------------------------- */
  function initBookingForm(){
    const form = $("#bookingForm");
    const status = $("#bookingStatus");
    const dateInput = $("#bkDate");
    dateInput.min = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.checkValidity()){
        form.reportValidity();
        return;
      }
      const name = $("#bkName").value.trim();
      status.textContent = `Likha gaya! ${name}, we'll call you to confirm your slot.`;
      form.reset();
    });
  }

  /* -----------------------------------------------------------------------
     8. MUSIC PLAYER — vintage disc player with visualizer + synthesized
        scissor-snip ambience (Web Audio API, no external SFX files needed)
     ----------------------------------------------------------------------- */
  function initPlayer(){
    const player      = $("#player");
    const audio       = $("#audioEl");
    const playBtn     = $("#playerPlay");
    const prevBtn     = $("#playerPrev");
    const nextBtn     = $("#playerNext");
    const seek        = $("#playerSeek");
    const timeEl       = $("#playerTime");
    const durEl        = $("#playerDuration");
    const volume       = $("#playerVolume");
    const trackNameEl  = $("#playerTrackName");
    const artistNameEl = $("#playerArtistName");
    const collapseBtn  = $("#playerCollapse");
    const ambientBtn   = $("#ambientToggle");
    const vizCanvas    = $("#playerViz");
    const vizCtx       = vizCanvas.getContext("2d");

    let index = 0;
    let audioCtx, analyser, sourceNode, dataArray;
    let ambientOn = false;
    let ambientTimer = null;

    audio.volume = Number(volume.value) / 100;

    function fmtTime(s){
      if (!isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, "0");
      return `${m}:${sec}`;
    }

    function loadTrack(i, autoplay){
      index = (i + DATA.playlist.length) % DATA.playlist.length;
      const t = DATA.playlist[index];
      audio.src = t.src;
      trackNameEl.textContent = t.title;
      artistNameEl.textContent = t.artist;
      if (autoplay) play();
    }

    function play(){
      ensureAudioGraph();
      audio.play().then(() => {
        player.classList.add("is-playing");
        playBtn.textContent = "⏸";
        playBtn.setAttribute("aria-label", "Pause");
        stopAmbient();
      }).catch(() => {
        // Autoplay blocked, or the placeholder MP3 file isn't present yet.
        trackNameEl.textContent = "Add your MP3s";
        artistNameEl.textContent = "See /audio in the project";
        player.classList.remove("is-playing");
      });
    }

    function pause(){
      audio.pause();
      player.classList.remove("is-playing");
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", "Play");
      if (ambientOn) startAmbient();
    }

    playBtn.addEventListener("click", () => audio.paused ? play() : pause());
    prevBtn.addEventListener("click", () => loadTrack(index - 1, true));
    nextBtn.addEventListener("click", () => loadTrack(index + 1, true));
    audio.addEventListener("ended", () => loadTrack(index + 1, true));

    audio.addEventListener("loadedmetadata", () => {
      seek.max = Math.floor(audio.duration) || 100;
      durEl.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      seek.value = Math.floor(audio.currentTime);
      timeEl.textContent = fmtTime(audio.currentTime);
    });
    seek.addEventListener("input", () => { audio.currentTime = Number(seek.value); });
    volume.addEventListener("input", () => { audio.volume = Number(volume.value) / 100; });

    collapseBtn.addEventListener("click", () => {
      const collapsed = player.classList.toggle("is-collapsed");
      collapseBtn.setAttribute("aria-expanded", String(!collapsed));
    });

    /* ---- Web Audio: analyser-driven bar visualizer ---- */
    function ensureAudioGraph(){
      if (audioCtx) { if (audioCtx.state === "suspended") audioCtx.resume(); return; }
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      drawViz();
    }

    function drawViz(){
      requestAnimationFrame(drawViz);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      const w = vizCanvas.width, h = vizCanvas.height;
      vizCtx.clearRect(0, 0, w, h);
      const barCount = 14;
      const barW = w / barCount;
      for (let i = 0; i < barCount; i++){
        const v = dataArray[i] || 0;
        const barH = player.classList.contains("is-playing") ? (v / 255) * h : 2;
        vizCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--marigold") || "#E8A33D";
        vizCtx.fillRect(i * barW + 1, h - barH, barW - 2, barH);
      }
    }

    /* ---- Synthesized ambience: soft chatter hum + occasional scissor snip,
            entirely generated via oscillators/noise — no audio files needed ---- */
    function synthSnip(){
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 3200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start();
    }

    function startAmbient(){
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const schedule = () => {
        synthSnip();
        ambientTimer = setTimeout(schedule, 1800 + Math.random() * 2600);
      };
      schedule();
    }
    function stopAmbient(){ clearTimeout(ambientTimer); ambientTimer = null; }

    ambientBtn.addEventListener("click", () => {
      ambientOn = !ambientOn;
      ambientBtn.setAttribute("aria-pressed", String(ambientOn));
      if (ambientOn && audio.paused) startAmbient(); else stopAmbient();
    });

    loadTrack(0, false);

    return { play }; // exposed so the curtain click can attempt autoplay
  }

  /* -----------------------------------------------------------------------
     9. SCROLL REVEAL — small fade/rise on section entry
     ----------------------------------------------------------------------- */
  function initReveal(){
    const targets = $$(".services, .gallery, .book, .footer, .card-grid, .ba-frame, .register");
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting){
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: .15 });

    targets.forEach(t => {
      t.style.opacity = "0";
      t.style.transform = "translateY(24px)";
      t.style.transition = "opacity .8s ease-out, transform .8s ease-out";
      io.observe(t);
    });
  }

  /* -----------------------------------------------------------------------
     INIT
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();

    initThemeToggle();
    initMobileNav();
    initPetals();
    initServiceCards();
    initGallerySlider();
    initBookingForm();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) initReveal();
    else $$(".services,.gallery,.book,.footer").forEach(t => { t.style.opacity=1; });

    const musicPlayer = initPlayer();
    initLoader(() => musicPlayer.play());
  });
})();
