let currentPage = 0;
const TOTAL = 5;
let goalUnlocked = false;
let bgmStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-char]").forEach(el => {
    const k = el.dataset.char;
    if (window.CHARS && window.CHARS[k]) {
      el.innerHTML = window.CHARS[k];
    }
  });

  setupConfetti();
  setupFinalPhoto();
  initDotNav();
  setupBgm();

  if (window.SIL) window.SIL.init();
  if (window.MEM) window.MEM.init();
  if (window.TYPEGAME) window.TYPEGAME.init();

  currentPage = 0;
  showPage(0);
});

function setupBgm() {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!audio) return;

  audio.volume = 0.35;

  const tryPlay = () => {
    if (bgmStarted) return;
    audio.play().then(() => {
      bgmStarted = true;
      if (btn) btn.textContent = "♫ MUSIC OFF";
    }).catch(() => {});
  };

  document.addEventListener("click", tryPlay, { once: true });
  document.addEventListener("touchstart", tryPlay, { once: true });
}

function toggleMusic() {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      bgmStarted = true;
      if (btn) btn.textContent = "♫ MUSIC OFF";
    }).catch(() => {});
  } else {
    audio.pause();
    if (btn) btn.textContent = "♫ MUSIC ON";
  }
}

function showPage(idx) {
  if (idx < 0 || idx >= TOTAL) return;
  if (idx === 4 && !goalUnlocked) return;

  document.querySelectorAll(".page").forEach((p, i) => {
    p.classList.remove("active");
    if (i === idx) p.classList.add("active");
  });

  document.querySelectorAll(".nav-dot").forEach((d, i) => {
    d.classList.toggle("on", i === idx);
  });

  const bar = document.getElementById("progress-bar");
  if (bar) bar.style.transform = `scaleX(${(idx + 1) / TOTAL})`;

  const hud = document.getElementById("stage-hud");
  const labels = ["STAGE SELECT", "STAGE 1", "STAGE 2", "STAGE 3", "GOAL!"];
  if (hud) hud.textContent = labels[idx] || "";

  currentPage = idx;

  if (window.setWorldFloor) window.setWorldFloor(idx);

  if (idx === 3 && window.THREE && !window._cakeInited) {
    window._cakeInited = true;
    setTimeout(() => {
      if (window.initCake) window.initCake("cake-canvas-3d");
    }, 120);
  }
}

function nextPage() {
  if (currentPage === 3 && !goalUnlocked) return;
  if (currentPage < TOTAL - 1) showPage(currentPage + 1);
}

function prevPage() {
  if (currentPage > 0) showPage(currentPage - 1);
}

function goPage(i) {
  showPage(i);
}

function initDotNav() {
  const nav = document.getElementById("dot-nav");
  if (!nav) return;

  nav.innerHTML = "";

  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement("button");
    d.className = "nav-dot" + (i === 0 ? " on" : "");
    d.setAttribute("aria-label", "Go to page " + (i + 1));

    if (i === 4) {
      d.classList.add("locked");
      d.title = "Finish all stages first!";
      d.onclick = () => {};
    } else {
      d.onclick = () => goPage(i);
    }

    nav.appendChild(d);
  }
}

function unlockGoalDot() {
  goalUnlocked = true;
  const dots = document.querySelectorAll(".nav-dot");
  if (dots[4]) {
    dots[4].classList.remove("locked");
    dots[4].title = "Goal unlocked!";
    dots[4].onclick = () => goPage(4);
  }
}

function blowCandles() {
  const btn = document.getElementById("blow-btn");
  if (btn) {
    btn.textContent = "WISH MADE!";
    btn.disabled = true;
  }

  if (window.blowCandlesOut) window.blowCandlesOut();

  spawnBurst(innerWidth * 0.5, innerHeight * 0.4, 100);
  setTimeout(() => spawnBurst(innerWidth * 0.3, innerHeight * 0.35, 60), 400);
  setTimeout(() => spawnBurst(innerWidth * 0.7, innerHeight * 0.45, 50), 700);
}

function setupFinalPhoto() {
  const input = document.getElementById("final-photo-input");
  if (!input) return;

  input.addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;

    const r = new FileReader();
    r.onload = ev => {
      const pv = document.getElementById("photo-preview");
      const img = document.getElementById("photo-img");
      if (img) img.src = ev.target.result;
      if (pv) pv.style.display = "block";
    };
    r.readAsDataURL(f);
  });
}

let confCanvas, confCtx, pieces = [], confRunning = false;

function setupConfetti() {
  confCanvas = document.getElementById("confetti-canvas");
  if (!confCanvas) return;

  confCtx = confCanvas.getContext("2d");

  const resize = () => {
    confCanvas.width = innerWidth;
    confCanvas.height = innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);
}

function spawnBurst(x, y, count = 70) {
  const cols = ["#FFE44D", "#FF85A1", "#85C1FF", "#C4A0FF", "#FFFFFF", "#7AE0A0", "#FF5C82"];

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 2.5 + Math.random() * 6.5;
    pieces.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 2.5,
      g: 0.1 + Math.random() * 0.05,
      size: 4 + Math.random() * 8,
      color: cols[Math.floor(Math.random() * cols.length)],
      alpha: 1,
      decay: 0.008 + Math.random() * 0.008
    });
  }

  if (!confRunning) {
    confRunning = true;
    requestAnimationFrame(confLoop);
  }
}

function confLoop() {
  if (!confCtx || !confCanvas) return;

  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);

  pieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.vx *= 0.98;
    p.alpha -= p.decay;

    if (p.alpha <= 0) return;

    confCtx.save();
    confCtx.globalAlpha = Math.max(p.alpha, 0);
    confCtx.fillStyle = p.color;
    confCtx.fillRect(p.x, p.y, p.size, p.size * 0.7);
    confCtx.restore();
  });

  pieces = pieces.filter(p => p.alpha > 0 && p.y < confCanvas.height + 60);

  if (pieces.length) requestAnimationFrame(confLoop);
  else confRunning = false;
}