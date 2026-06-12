window.SIL = {
  questions: [
    {
      photoSrc: "us.jpg",
      fallbackSrc: "us.jpg",
      question: "我地係幾時影呢張相架小麵？",
      correct: 2,
      options: [
        "1月3號 補祝我地3個月快樂👌🏻",
        "3月22號 補祝白色情人節🤍",
        "2月14號 情人節🥰",
        "6月7號 six seven let's gooooo!!!6️⃣7️⃣"
      ]
    },
    {
      photoSrc: "us2.jpg",
      fallbackSrc: "us2.jpg",
      question: "呢張相我地喺邊度影架？",
      correct: 3,
      options: [
        "太古城 做太古達人",
        "偷偷地話你知 呢個答案就係正確答案",
        "你屋企樓下",
        "環球影城Here We Go"
      ]
    }
  ],

  qIdx: 0,
  lives: 3,
  passed: false,
  canvas: null,
  ctx: null,

  init() {
    this.qIdx = 0;
    this.lives = 3;
    this.passed = false;
    this.canvas = document.getElementById("sil-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    const nb = document.getElementById("sil-next-btn");
    if (nb) nb.disabled = true;

    this._renderQ();
  },

  _renderQ() {
    const q = this.questions[this.qIdx];
    if (!q) {
      this._allDone();
      return;
    }

    const ql = document.getElementById("sil-q-label");
    if (ql) ql.textContent = `Q${this.qIdx + 1}/${this.questions.length} · ${q.question}`;

    this._renderLives();
    this._loadSilhouette(q.photoSrc, q.fallbackSrc);
    this._buildOptions(q);

    const fb = document.getElementById("sil-feedback");
    if (fb) {
      fb.textContent = "";
      fb.style.color = "";
    }
  },

  _loadSilhouette(src, fallbackSrc) {
    if (!this.canvas || !this.ctx) return;

    const c = this.canvas;
    const ctx = this.ctx;
    c.width = 460;
    c.height = 345;

    this._drawWaitingState(ctx, c.width, c.height);

    const tryLoad = (currentSrc, onFail) => {
      const img = new Image();

      img.onload = () => {
        c.width = 460;
        c.height = 345;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);

        try {
          const id = ctx.getImageData(0, 0, c.width, c.height);
          const d = id.data;

          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const lum = r * 0.299 + g * 0.587 + b * 0.114;

            if (lum < 70) {
              d[i] = 28;
              d[i + 1] = 18;
              d[i + 2] = 46;
            } else if (lum < 140) {
              d[i] = 70;
              d[i + 1] = 52;
              d[i + 2] = 98;
            } else {
              d[i] = 150;
              d[i + 1] = 132;
              d[i + 2] = 188;
            }

            d[i + 3] = 255;
          }

          ctx.putImageData(id, 0, 0);

          const tmp = document.createElement("canvas");
          tmp.width = 115;
          tmp.height = 86;
          const tctx = tmp.getContext("2d");
          tctx.drawImage(c, 0, 0, tmp.width, tmp.height);

          ctx.clearRect(0, 0, c.width, c.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tmp, 0, 0, c.width, c.height);

          ctx.fillStyle = "rgba(255,255,255,.10)";
          ctx.fillRect(0, 0, c.width, c.height);

          ctx.strokeStyle = "rgba(255,228,77,.20)";
          ctx.lineWidth = 10;
          ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

          ctx.fillStyle = "rgba(255,228,77,.85)";
          ctx.font = "10px 'Press Start 2P', monospace";
          ctx.textAlign = "center";
          ctx.fillText("guess when!", c.width / 2, c.height - 16);
        } catch (err) {
          this._drawPhotoMissingState(ctx, c.width, c.height, currentSrc);
        }
      };

      img.onerror = () => onFail();
      img.src = currentSrc;
    };

    tryLoad(src, () => {
      if (fallbackSrc && fallbackSrc !== src) {
        tryLoad(fallbackSrc, () => {
          this._drawPhotoMissingState(ctx, c.width, c.height, `${src} / ${fallbackSrc}`);
        });
      } else {
        this._drawPhotoMissingState(ctx, c.width, c.height, src);
      }
    });
  },

  _drawWaitingState(ctx, w, h) {
    ctx.fillStyle = "#0e0820";
    ctx.fillRect(0, 0, w, h);

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(133,193,255,.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.setLineDash([]);

    const cx = w / 2;
    const cy = h / 2 - 20;

    ctx.fillStyle = "rgba(133,193,255,.5)";
    ctx.fillRect(cx - 28, cy - 18, 56, 38);
    ctx.fillRect(cx - 10, cy - 26, 20, 10);

    ctx.fillStyle = "#0e0820";
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(133,193,255,.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,228,77,.7)";
    ctx.fillText("loading photo...", cx, cy + 42);
    ctx.fillText("please wait", cx, cy + 60);
  },

  _drawPhotoMissingState(ctx, w, h, src) {
    ctx.fillStyle = "#0e0820";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,133,161,.9)";
    ctx.font = "bold 11px 'Press Start 2P', monospace";
    ctx.fillText("photo not found!", w / 2, h / 2 - 44);

    ctx.fillStyle = "rgba(255,228,77,.85)";
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.fillText("checked:", w / 2, h / 2 - 12);

    ctx.fillStyle = "rgba(133,193,255,.9)";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText(src, w / 2, h / 2 + 14);

    ctx.fillStyle = "rgba(122,224,160,.75)";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText("still answer below", w / 2, h / 2 + 50);
  },

  _buildOptions(q) {
    const wrap = document.getElementById("sil-options");
    if (!wrap) return;

    wrap.innerHTML = "";
    q.options.forEach((label, i) => {
      const btn = document.createElement("button");
      btn.className = "sil-opt";
      btn.textContent = label;
      btn.onclick = () => this._answer(i);
      wrap.appendChild(btn);
    });
  },

  _answer(idx) {
    const q = this.questions[this.qIdx];
    const fb = document.getElementById("sil-feedback");
    const btns = document.querySelectorAll(".sil-opt");
    btns.forEach(b => b.disabled = true);

    if (idx === q.correct) {
      btns[idx].classList.add("correct");
      if (fb) {
        fb.textContent = "✨ 答啱！";
        fb.style.color = "#7AE0A0";
      }
      if (window.spawnBurst) spawnBurst(innerWidth * 0.5, innerHeight * 0.4, 70);
      setTimeout(() => this._nextQ(), 1200);
    } else {
      btns[idx].classList.add("wrong");
      btns[q.correct].classList.add("correct");
      this.lives--;
      this._renderLives();

      if (fb) {
        fb.textContent = `唔係呀～ 得返 ${this.lives} ♥`;
        fb.style.color = "#FF5C82";
      }

      if (this.lives <= 0) {
        setTimeout(() => this._nextQ(), 1200);
      } else {
        setTimeout(() => {
          btns.forEach(b => {
            b.classList.remove("correct", "wrong");
            b.disabled = false;
          });
          if (fb) fb.textContent = "";
        }, 1000);
      }
    }
  },

  _nextQ() {
    this.qIdx++;
    if (this.qIdx >= this.questions.length) this._allDone();
    else this._renderQ();
  },

  _allDone() {
    this.passed = true;
    const fb = document.getElementById("sil-feedback");
    if (fb) {
      fb.textContent = "🎊 第一關pass屎！";
      fb.style.color = "#7AE0A0";
    }

    const nb = document.getElementById("sil-next-btn");
    if (nb) nb.disabled = false;

    if (window.spawnBurst) spawnBurst(innerWidth * 0.5, innerHeight * 0.4, 100);
  },

  _renderLives() {
    const el = document.getElementById("sil-lives-val");
    if (!el) return;

    el.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.textContent = i < this.lives ? "♥" : "♡";
      s.style.color = i < this.lives ? "#FF85A1" : "#aaa";
      el.appendChild(s);
    }
  }
};

window.MEM = {
  EMOJIS: ["🌙", "💛", "💙", "😘", "🌧️", "❤️", "🥰", "📿"],
  cards: [],
  flipped: [],
  matched: 0,
  locked: false,
  timer: 0,
  iv: null,

  init() {
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.locked = false;
    this.timer = 0;
    clearInterval(this.iv);

    const pairs = [...this.EMOJIS, ...this.EMOJIS].sort(() => Math.random() - 0.5);
    const grid = document.getElementById("memory-grid");
    if (!grid) return;

    grid.innerHTML = "";

    pairs.forEach(e => {
      const c = document.createElement("div");
      c.className = "mem-card";
      c.dataset.e = e;
      c.innerHTML = `<div class="hidden-face"></div><span class="face">${e}</span>`;
      c.addEventListener("click", () => this._flip(c));
      grid.appendChild(c);
      this.cards.push(c);
    });

    this.iv = setInterval(() => {
      this.timer++;
      const el = document.getElementById("mem-timer");
      if (el) el.textContent = `${this.timer}s`;
    }, 1000);

    const s = document.getElementById("mem-status");
    if (s) s.textContent = "flip cards to find matching pairs!";

    const nb = document.getElementById("mem-next-btn");
    if (nb) nb.disabled = true;

    const bc = document.getElementById("mem-complete");
    if (bc) {
      bc.style.display = "none";
      bc.innerHTML = "";
    }
  },

  _flip(card) {
    if (this.locked || card.classList.contains("flipped") || card.classList.contains("matched") || this.flipped.length >= 2) return;

    card.classList.add("flipped");
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.locked = true;
      setTimeout(() => this._check(), 700);
    }
  },

  _check() {
    const [a, b] = this.flipped;

    if (a.dataset.e === b.dataset.e) {
      a.classList.add("matched");
      b.classList.add("matched");
      this.matched++;

      const s = document.getElementById("mem-status");
      if (s) s.textContent = `matched ${this.matched}/${this.EMOJIS.length}!`;

      if (this.matched === this.EMOJIS.length) this._win();
    } else {
      a.classList.remove("flipped");
      b.classList.remove("flipped");
    }

    this.flipped = [];
    this.locked = false;
  },

  _win() {
    clearInterval(this.iv);

    const bc = document.getElementById("mem-complete");
    if (bc) {
      bc.style.display = "block";
      bc.innerHTML = `cleared in ${this.timer}s!<br>點解你咁聰明嘅小麵bb💛`;
    }

    if (window.spawnBurst) spawnBurst(innerWidth * 0.5, innerHeight * 0.4, 100);

    const nb = document.getElementById("mem-next-btn");
    if (nb) nb.disabled = false;
  }
};

window.TYPEGAME = {
  TARGET: "我最愛智智bb!",
  typed: "",
  done: false,

  init() {
    this.typed = "";
    this.done = false;
    this.render();

    const inp = document.getElementById("type-input");
    if (!inp) return;

    const fresh = inp.cloneNode(true);
    inp.parentNode.replaceChild(fresh, inp);
    fresh.value = "";
    fresh.addEventListener("input", e => this.onInput(e));

    const nb = document.getElementById("type-next-btn");
    if (nb) nb.disabled = true;

    const tc = document.getElementById("type-complete");
    if (tc) {
      tc.style.display = "none";
      tc.innerHTML = "";
    }

    const s = document.getElementById("type-status");
    if (s) {
      s.textContent = "";
      s.style.color = "";
    }
  },

  render() {
    const el = document.getElementById("type-target-display");
    if (!el) return;

    let h = "";
    for (let i = 0; i < this.TARGET.length; i++) {
      if (i < this.typed.length) h += `<span class="done">${this.TARGET[i]}</span>`;
      else if (i === this.typed.length) h += `<span class="cursor"></span>${this.TARGET[i]}`;
      else h += this.TARGET[i];
    }

    if (this.typed.length >= this.TARGET.length) h += `<span class="cursor"></span>`;
    el.innerHTML = h;
  },

  onInput(e) {
    if (this.done) return;

    const val = e.target.value.toLowerCase();
    this.typed = val;
    this.render();

    const s = document.getElementById("type-status");

    if (val === this.TARGET) {
      this.done = true;

      if (s) {
        s.textContent = "soo strong 小麵 啱晒!";
        s.style.color = "#7AE0A0";
      }

      const tc = document.getElementById("type-complete");
      if (tc) {
        tc.style.display = "block";
        tc.innerHTML = "EASY過關✨";
      }

      const nb = document.getElementById("type-next-btn");
      if (nb) nb.disabled = false;

      if (window.spawnBurst) spawnBurst(innerWidth * 0.5, innerHeight * 0.4, 90);
      if (window.unlockGoalDot) window.unlockGoalDot();
    } else if (this.TARGET.startsWith(val)) {
      const pct = Math.round((val.length / this.TARGET.length) * 100);
      if (s) {
        s.textContent = `${pct}% 繼續gogo!`;
        s.style.color = "";
      }
    } else {
      if (s) {
        s.textContent = "你...好似打錯左喎bb(⁎⁍̴̛ᴗ⁍̴̛⁎)";
        s.style.color = "#FF5C82";
      }
    }
  }
};