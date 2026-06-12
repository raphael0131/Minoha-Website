(function(){
  const C   = document.getElementById("world-canvas");
  const ctx = C.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // ── Colour palette ───────────────────────────────────────
  const P = {
    grass:"#5a8a20", grassL:"#7ab030",
    cloud:"#ffe44d", star:"#ffffff",
    treeT:"#2a6020", treeB:"#4a2c0a",
    houseW:"#e8d5b0", houseDoor:"#8b5e3c",
    pathD:"#6b5020", pathL:"#8b7040",
    flagP:"#ff85a1", flagB:"#85c1ff",
    coin:"#ffe44d",
  };

  // ── World = 5 floors tall (one per page) ─────────────────
  const FLOORS = 5;
  let W, H, worldH;

  function resize() {
    W = C.width  = window.innerWidth;
    H = C.height = window.innerHeight;
    worldH = H * FLOORS;
  }

  // ── Camera: called by app.js when page changes ────────────
  let camY = 0, targetCamY = 0;
  window.setWorldFloor = function(idx) {
    // idx 0 = bottom floor (cover), idx 4 = top floor (cake/goal)
    targetCamY = (FLOORS - 1 - idx) * H;
  };

  // ── Animation loop ────────────────────────────────────────
  let charWalk = 0, t = 0;

  function loop() {
    requestAnimationFrame(loop);
    t++;
    // smooth camera pan
    camY += (targetCamY - camY) * 0.07;
    charWalk++;
    redraw();
  }

  // ── Main draw ─────────────────────────────────────────────
  function redraw() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    // translate so the correct floor is visible
    ctx.translate(0, -worldH + H + camY);
    drawWorld();
    ctx.restore();
  }

  function drawWorld() {
    // full-world sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, worldH);
    grad.addColorStop(0,   "#0a0520");
    grad.addColorStop(0.3, "#1a0e2e");
    grad.addColorStop(0.6, "#2a1244");
    grad.addColorStop(1,   "#3d1a30");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, worldH);

    // draw every floor
    for (let f = 0; f < FLOORS; f++) {
      const fy = worldH - (f + 1) * H;  // top-left Y of this floor
      drawFloor(f, fy);
    }

    // draw walking couple on the current floor
    drawCharacters();
  }

  // ── PER-FLOOR DISPATCHER ─────────────────────────────────
  function drawFloor(f, fy) {
    drawStars(f, fy);
    if (f === 0) drawFloor0(fy);   // cover  – night village
    if (f === 1) drawFloor1(fy);   // stage1 – enchanted forest
    if (f === 2) drawFloor2(fy);   // stage2 – pixel city
    if (f === 3) drawFloor3(fy);   // stage3 – sky platforms + rainbow
    if (f === 4) drawFloor4(fy);   // ending – CAKE sky
    drawGround(f, fy);
    drawFlag(f, fy, 0.04);
    drawFlag(f, fy, 0.94);
  }

  // ── STARS & MOON ─────────────────────────────────────────
  function drawStars(f, fy) {
    const seed = f * 137;
    for (let i = 0; i < 40; i++) {
      const sx = pseudo(seed + i * 7)  * W;
      const sy = fy + pseudo(seed + i * 13) * H * 0.7;
      const blink = Math.sin(t * 0.04 + i) > 0.6 ? 1 : 0.4;
      px("#ffffff", sx, sy, 2, 2, blink);
    }
    if (f <= 1) {
      const mx = W * 0.82, my = fy + H * 0.12;
      px("#ffe44d", mx, my, 18, 18, 1);
      px("#1a0e2e", mx + 6, my - 2, 10, 14, 1);   // moon shadow
      px("#f5c800", mx + 2, my + 6, 3, 3, 1);      // craters
      px("#f5c800", mx - 4, my + 2, 2, 2, 1);
    }
  }

  // ── FLOOR 0: NIGHT VILLAGE (Cover page) ──────────────────
  function drawFloor0(fy) {
    const mtCols = ["#2a1a44","#3a2054","#4a2864"];
    for (let m = 0; m < 5; m++) {
      drawMountain(mtCols[m % 3], W * (0.05 + m * 0.2), fy + H * 0.55, H * (0.22 + m % 3 * 0.08));
    }
    for (let c = 0; c < 4; c++) {
      const cx = ((W * (0.1 + c * 0.25) + t * 0.3 * (c % 2 ? 1 : -1)) % (W + 60)) - 30;
      drawCloud(cx, fy + H * (0.18 + c * 0.07));
    }
    drawHouse(W * 0.15, fy + H * 0.5,  80, "#e8d5b0", "#cc4444");
    drawHouse(W * 0.38, fy + H * 0.5,  65, "#d0c8a0", "#8844cc");
    drawHouse(W * 0.62, fy + H * 0.48, 90, "#e8d5b0", "#44aa44");
    drawHouse(W * 0.82, fy + H * 0.5,  70, "#c8c0a0", "#cc8800");
    // flickering windows
    px("#ffe44d", W*0.15+22, fy+H*0.5-28, 12, 10, Math.sin(t*0.08)>0?1:.3);
    px("#ffe44d", W*0.62+26, fy+H*0.48-32, 14, 10, 1);
    px("#85c1ff", W*0.82+20, fy+H*0.5-26,  10, 10, Math.sin(t*0.05+2)>.2?1:.4);
  }

  // ── FLOOR 1: ENCHANTED FOREST (Stage 1) ──────────────────
  function drawFloor1(fy) {
    for (let tr = 0; tr < 7; tr++) {
      drawTree(W*(0.06+tr*0.13), fy+H*0.55, H*(0.25+pseudo(tr*11)*0.15));
    }
    // fireflies
    for (let ff = 0; ff < 12; ff++) {
      const fx = W * (pseudo(ff*7)*0.9 + 0.05);
      const ffy = fy + H * (0.3 + pseudo(ff*13)*0.35);
      if (Math.sin(t*0.1 + ff*1.3) > 0.3) px("#ffe44d", fx, ffy, 3, 3, 0.9);
    }
    // mushrooms
    for (let m = 0; m < 5; m++) drawMushroom(W*(0.12+m*0.18), fy+H*0.56);
    // stepping stones
    for (let s = 0; s < 8; s++) {
      const sx = W*(0.05+s*0.12);
      px(P.pathD, sx, fy+H*0.58, 30, 8, 1);
      px(P.pathL, sx+4, fy+H*0.58+2, 20, 3, 1);
    }
  }

  // ── FLOOR 2: PIXEL CITY (Stage 2) ────────────────────────
  function drawFloor2(fy) {
    const bdata = [
      [0.08,0.55,60,120,"#4466aa","#5577bb"],
      [0.22,0.5, 80,140,"#aa4466","#bb5577"],
      [0.38,0.48,70,160,"#44aa66","#55bb77"],
      [0.55,0.52,65,130,"#aa8844","#bb9955"],
      [0.70,0.47,85,150,"#6644aa","#7755bb"],
      [0.85,0.53,55,110,"#44aaaa","#55bbbb"],
    ];
    bdata.forEach(([rx,ry,bw,bh,c1,c2]) => {
      const bx = W*rx, by = fy+H*ry;
      px(c1, bx, by, bw, bh, 1);
      px(c2, bx+4, by+4, bw-8, 4, 1);
      // animated windows
      for (let wr = 0; wr < Math.floor(bh/20); wr++) {
        for (let wc = 0; wc < Math.floor(bw/16); wc++) {
          const lit = pseudo(wr*7+wc*13+(rx*100|0)) > 0.4;
          const on  = Math.sin(t*0.06+wr+wc) > 0.4;
          px(lit&&on ? "#ffe44d" : "#1a1a3a", bx+wc*16+6, by+wr*20+10, 8, 8, 1);
        }
      }
      // antenna + blinking light
      px("#888888", bx+bw/2-1, by-16, 2, 16, 1);
      px("#ff4444", bx+bw/2-2, by-20, 4, 4, Math.sin(t*0.12)>0?1:.1);
    });
    // street lamps
    for (let l = 0; l < 5; l++) {
      const lx = W*(0.1+l*0.2);
      px("#888888", lx, fy+H*0.52, 4, 60, 1);
      px("#ffe44d", lx-8, fy+H*0.52, 20, 8, 1);
      ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = "#ffe44d";
      ctx.beginPath(); ctx.arc(lx+2, fy+H*0.52+4, 22, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // moving pixel car
    const carX = ((W*0.2 + t*0.8) % (W+80)) - 40;
    drawCar(carX, fy+H*0.574);
  }

  // ── FLOOR 3: SKY PLATFORMS + RAINBOW (Stage 3) ───────────
  function drawFloor3(fy) {
    // cloud platforms
    [[0.1,0.45],[0.3,0.38],[0.5,0.42],[0.68,0.36],[0.85,0.44]].forEach(([rx,ry]) => {
      const px2 = W*rx, py = fy+H*ry;
      ctx.fillStyle = "#ffe8f8"; ctx.fillRect(px2, py, 100, 18);
      ctx.fillStyle = "#ffe44d"; ctx.fillRect(px2+2, py-2, 96, 16);
      ctx.strokeStyle = "#3D2C4E"; ctx.lineWidth = 2; ctx.strokeRect(px2, py, 100, 18);
    });
    // sparkles
    for (let sp = 0; sp < 20; sp++) {
      if (Math.sin(t*0.08 + sp*0.7) > 0.5) {
        drawSparkle(W*(pseudo(sp*7)*0.9+0.05), fy+H*(pseudo(sp*11)*0.7+0.1));
      }
    }
    // pixel rainbow arc
    ["#ff5555","#ffaa00","#ffe44d","#55cc55","#55aaff","#aa55ff"].forEach((c,i) => {
      ctx.save(); ctx.globalAlpha = 0.32; ctx.strokeStyle = c; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(W*0.5, fy+H*0.75, W*0.28+i*8, Math.PI, 0); ctx.stroke();
      ctx.restore();
    });
    // floating coins
    for (let co = 0; co < 6; co++) {
      const cox = W*(0.15+co*0.14);
      const coy = fy+H*0.3 + Math.sin(t*0.05+co)*8;
      px(P.coin, cox, coy, 14, 14, 1);
      px("#f5c800", cox+2, coy+2, 10, 4, 1);
    }
  }

  // ── FLOOR 4: GOAL SKY + BIG PIXEL CAKE (Ending) ──────────
  function drawFloor4(fy) {
    // darker sky override for drama
    const sg = ctx.createLinearGradient(0, fy, 0, fy+H);
    sg.addColorStop(0, "#2a0a3a"); sg.addColorStop(1, "#1a0e2e");
    ctx.fillStyle = sg; ctx.fillRect(0, fy, W, H);

    // dense twinkling stars
    for (let i = 0; i < 60; i++) {
      const bri = Math.sin(t*0.06 + i*0.9);
      const sx = W * (pseudo(i*9)*0.95 + 0.025);
      const sy = fy + H * (pseudo(i*13)*0.65 + 0.05);
      if (bri > 0) px("#ffffff", sx, sy, bri>.7?4:2, bri>.7?4:2, Math.abs(bri));
    }

    // BIG PIXEL CAKE centred in top half
    drawBigCake(W * 0.5, fy + H * 0.38);

    // "GOAL!" pixel banner
    const bx = W*0.5 - 90, by = fy + H*0.06;
    ctx.fillStyle = "#ffe44d"; ctx.fillRect(bx, by, 180, 40);
    ctx.strokeStyle = "#3D2C4E"; ctx.lineWidth = 3; ctx.strokeRect(bx, by, 180, 40);
    ctx.fillStyle = "#3D2C4E";
    ctx.font = "bold 13px 'Press Start 2P',monospace";
    ctx.textAlign = "center";
    ctx.fillText("GOAL! 🎂", W*0.5, by+27);

    // hearts raining down
    for (let h = 0; h < 8; h++) {
      const hx = W * (pseudo(h*17)*0.85 + 0.07);
      const hy = fy + ((H*0.1 + pseudo(h*11)*H*0.7 + t*1.2*(1+h%3*0.3)) % H);
      drawHeart(hx, hy, h%2===0 ? "#ff85a1" : "#ffb8d0");
    }
  }

  // ── GROUND PLATFORM (each floor) ─────────────────────────
  function drawGround(f, fy) {
    const gY = fy + H*0.62, gH = H*0.38;
    const grad = ctx.createLinearGradient(0, gY-10, 0, gY+gH);
    const gradStops = [
      ["#3d1a30","#2a0e1e"],
      ["#2a4010","#1a2808"],
      ["#1a1a3a","#0a0a20"],
      ["#1a1030","#0a0820"],
      ["#200a30","#10041a"],
    ];
    grad.addColorStop(0, gradStops[f][0]);
    grad.addColorStop(1, gradStops[f][1]);
    ctx.fillStyle = grad; ctx.fillRect(0, gY, W, gH);

    // grass strip
    ctx.fillStyle = f===1?P.grassL : f===3?"#4a8ab0" : P.grass;
    ctx.fillRect(0, gY, W, 12);
    ctx.fillStyle = f===1?"#8acc40" : f===3?"#5aaacc" : P.grassL;
    ctx.fillRect(0, gY, W, 5);

    // tile row
    for (let tx = 0; tx < W; tx += 16) {
      ctx.fillStyle = tx%32===0 ? P.pathL : P.pathD;
      ctx.fillRect(tx, gY+12, 16, 6);
    }
    // ground texture
    ctx.fillStyle = "rgba(0,0,0,.2)";
    for (let gx = 0; gx < W; gx += 20)
      ctx.fillRect(gx + pseudo(f*100+gx)*10, gY+18, 4, 4);
  }

  // ── PIXEL COUPLE walking on current floor ─────────────────
  function drawCharacters() {
    const floor    = Math.round((worldH - H - camY) / H);
    const floorY   = worldH - (floor + 1) * H;
    const groundY  = floorY + H*0.62 - 50;
    const wx       = W * 0.42;
    const step     = Math.floor(charWalk / 8) % 2;
    drawPixelBoy (wx,      groundY, step);
    drawPixelGirl(wx + 40, groundY, step);
    if (Math.sin(t*0.05) > 0.7)
      drawHeart(wx+18, groundY - 22 - Math.sin(t*0.05)*10, "#ff85a1");
  }

  // ── PIXEL BOY (16×24 pixel art) ───────────────────────────
  function drawPixelBoy(x, y, frame) {
    const s = 2;
    const rows = [
      "  BBBB  ",
      " BBBBBB ",
      " BSSSSB ",
      " BSSSSB ",
      " BSSSSB ",
      "  BBBB  ",
      " EEEEEE ",
      " EEEEEE ",
      "  EEEE  ",
      "  PPPP  ",
      "  PPPP  ",
      frame ? " PP  PP " : " P PP P ",
    ];
    const cm = { B:"#2C1A0A", S:"#FFDBB5", E:"#85C1FF", P:"#3A3A5A", " ":null };
    rows.forEach((r,ri) =>
      [...r].forEach((c,ci) => { if(cm[c]) px(cm[c], x+ci*s, y+ri*s, s, s, 1); })
    );
  }

  // ── PIXEL GIRL (16×24 pixel art) ──────────────────────────
  function drawPixelGirl(x, y, frame) {
    const s = 2;
    const rows = [
      " HHHHHH ",
      "HHHHHHHH",
      "HSSSSSH ",
      "HSSSSSH ",
      "HSSSSSH ",
      " HHHH   ",
      " DDDDDD ",
      " DDDDDD ",
      "DDDDDDDD",
      " SSSSSS ",
      " SS  SS ",
      frame ? " SS  SS " : " S SS S ",
    ];
    const cm = { H:"#4A2C0A", S:"#FFDBB5", D:"#FF85A1", " ":null };
    rows.forEach((r,ri) =>
      [...r].forEach((c,ci) => { if(cm[c]) px(cm[c], x+ci*s, y+ri*s, s, s, 1); })
    );
  }

  // ── SHAPES ────────────────────────────────────────────────
  function drawMountain(col, bx, by, height) {
    const w = height * 1.2;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(bx-w/2, by); ctx.lineTo(bx, by-height); ctx.lineTo(bx+w/2, by);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.beginPath();
    ctx.moveTo(bx-w*.12, by-height*.75); ctx.lineTo(bx, by-height); ctx.lineTo(bx+w*.12, by-height*.75);
    ctx.closePath(); ctx.fill();
  }

  function drawCloud(cx, cy) {
    ctx.fillStyle = "#ffe44d"; ctx.globalAlpha = 0.65;
    [[0,0,26,14],[20,-8,22,14],[-20,-6,22,12],[36,-4,18,12]]
      .forEach(([dx,dy,cw,ch]) => ctx.fillRect(cx+dx, cy+dy, cw, ch));
    ctx.globalAlpha = 1;
  }

  function drawTree(tx, ty, th) {
    px(P.treeB, tx-5, ty-th*0.3, 10, th*0.3, 1);
    for (let l = 0; l < 3; l++) {
      const lw = (3-l)*28, ly = ty-th*0.3-(l+1)*(th*0.25);
      ctx.fillStyle = l===0?"#1a4a10":l===1?"#2a6020":P.treeT;
      ctx.fillRect(tx-lw/2, ly, lw, th*0.28);
    }
  }

  function drawMushroom(mx, my) {
    px("#cc2222", mx, my-16, 20, 16, 1);
    px("#ff4444", mx+2, my-14, 16, 12, 1);
    px("#ffffff", mx+4, my-12, 4, 4, 1);
    px("#ffffff", mx+12, my-10, 3, 3, 1);
    px("#e8c89a", mx+6, my-4, 8, 10, 1);
  }

  function drawHouse(hx, hy, hw, wallC, roofC) {
    const hh = hw * 0.9;
    ctx.fillStyle = wallC; ctx.fillRect(hx-hw/2, hy-hh, hw, hh);
    ctx.fillStyle = roofC;
    ctx.beginPath();
    ctx.moveTo(hx-hw/2-6, hy-hh); ctx.lineTo(hx, hy-hh-hw*0.5); ctx.lineTo(hx+hw/2+6, hy-hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.houseDoor; ctx.fillRect(hx-8, hy-24, 16, 24);
    ctx.fillStyle = "#ffe8a0";
    ctx.fillRect(hx-hw/2+10, hy-hh+14, 18, 14);
    ctx.fillRect(hx+hw/2-28, hy-hh+14, 18, 14);
    ctx.strokeStyle = "#3D2C4E"; ctx.lineWidth = 2;
    ctx.strokeRect(hx-hw/2, hy-hh, hw, hh);
  }

  function drawCar(cx, cy) {
    px("#ff5555", cx,    cy,    60, 22, 1);
    px("#ff7777", cx+4,  cy+2,  52, 10, 1);
    px("#88ccff", cx+10, cy+2,  16, 12, 1);
    px("#88ccff", cx+32, cy+2,  16, 12, 1);
    px("#333333", cx+8,  cy+18, 16, 10, 1);
    px("#333333", cx+38, cy+18, 16, 10, 1);
    px("#888888", cx+10, cy+20, 12, 8,  1);
    px("#888888", cx+40, cy+20, 12, 8,  1);
  }

  function drawFlag(f, fy, rx) {
    const fx = W*rx, fy2 = fy + H*0.3;
    px("#aaaaaa", fx, fy2, 3, H*0.3, 1);
    const fc = f%2===0 ? P.flagP : P.flagB;
    ctx.fillStyle = fc;
    ctx.beginPath();
    ctx.moveTo(fx+3, fy2); ctx.lineTo(fx+24, fy2+8); ctx.lineTo(fx+3, fy2+16);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3D2C4E"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx+3, fy2); ctx.lineTo(fx+24, fy2+8); ctx.lineTo(fx+3, fy2+16);
    ctx.closePath(); ctx.stroke();
  }

  function drawSparkle(sx, sy) {
    px("#ffe44d", sx,   sy,   4, 4, 1);
    px("#ffe44d", sx-6, sy+2, 2, 2, 0.7);
    px("#ffe44d", sx+6, sy+2, 2, 2, 0.7);
    px("#ffe44d", sx+2, sy-6, 2, 2, 0.7);
  }

  function drawHeart(hx, hy, col) {
    ctx.fillStyle = col || "#ff85a1";
    [[1,0],[2,0],[0,1],[1,1],[2,1],[3,1],
     [0,2],[1,2],[2,2],[3,2],[1,3],[2,3],[2,4]]
      .forEach(([dx,dy]) => ctx.fillRect(hx+dx*4-8, hy+dy*4, 4, 4));
  }

  function drawBigCake(cx, cy) {
    // tier 1 (bottom – pink)
    ctx.fillStyle = "#FFB8D0"; ctx.fillRect(cx-80, cy, 160, 44);
    ctx.strokeStyle = "#3D2C4E"; ctx.lineWidth = 3; ctx.strokeRect(cx-80, cy, 160, 44);
    for (let d = 0; d < 6; d++) px(P.coin, cx-80+14+d*24, cy+16, 10, 10, 1);

    // tier 2 (yellow)
    ctx.fillStyle = "#FFE44D"; ctx.fillRect(cx-55, cy-38, 110, 38);
    ctx.strokeRect(cx-55, cy-38, 110, 38);
    for (let d = 0; d < 4; d++) px("#ff85a1", cx-55+12+d*24, cy-38+14, 8, 8, 1);

    // tier 3 (blue)
    ctx.fillStyle = "#85C1FF"; ctx.fillRect(cx-35, cy-70, 70, 32);
    ctx.strokeRect(cx-35, cy-70, 70, 32);

    // candles
    [-20,-6,0,6,20].forEach(dx => {
      px("#ffffff", cx+dx-3, cy-92, 6, 22, 1);
      ctx.fillStyle = "#ffcc44";
      ctx.beginPath();
      ctx.moveTo(cx+dx-4, cy-92); ctx.lineTo(cx+dx, cy-104); ctx.lineTo(cx+dx+4, cy-92);
      ctx.closePath(); ctx.fill();
      if (Math.sin(t*0.15 + dx) > 0) {
        ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = "#ffe44d";
        ctx.beginPath(); ctx.arc(cx+dx, cy-96, 8, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    });

    // pixel heart on cake
    drawHeart(cx-10, cy-64, "#ff85a1");

    // glow aura
    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = "#ffe44d";
    ctx.beginPath(); ctx.arc(cx, cy-35, 100, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── HELPER: draw a filled rectangle ───────────────────────
  function px(col, x, y, w, h, alpha) {
    if (!col) return;
    ctx.save();
    if (alpha !== undefined && alpha !== 1) ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
    ctx.restore();
  }

  // ── HELPER: deterministic pseudo-random (no Math.random) ──
  function pseudo(n) {
    n = (n ^ 61) ^ (n >> 16);
    n += n << 3;
    n ^= n >> 4;
    n *= 0x27d4eb2d;
    n ^= n >> 15;
    return (n >>> 0) / 0xffffffff;
  }

  // ── BOOT ──────────────────────────────────────────────────
  window.addEventListener("resize", resize);
  resize();
  loop();

})();