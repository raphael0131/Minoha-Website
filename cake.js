function initCake(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const W = canvas.clientWidth  || 380;
  const H = canvas.clientHeight || 380;
  canvas.width = W; canvas.height = H;

  // ── Scene setup ──────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0e2e);

  const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  cam.position.set(0, 3.2, 8);
  cam.lookAt(0, 1, 0);

  const ren = new THREE.WebGLRenderer({ canvas, antialias: false });
  ren.setPixelRatio(1);
  ren.setSize(W, H);
  ren.shadowMap.enabled = true;

  // ── Lighting ─────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xFFF0E0, 0.9));

  const dl = new THREE.DirectionalLight(0xFFFFFF, 1.1);
  dl.position.set(5, 10, 7);
  dl.castShadow = true;
  scene.add(dl);

  const dl2 = new THREE.DirectionalLight(0xFFE0FF, 0.4);
  dl2.position.set(-5, 4, -4);
  scene.add(dl2);

  const pl = new THREE.PointLight(0xFFD070, 2.2, 14);
  pl.position.set(0, 4.5, 0);
  scene.add(pl);

  // ── Material helper ───────────────────────────────────────
  const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.65 });

  // ── Cake group ────────────────────────────────────────────
  const G = new THREE.Group();
  scene.add(G);

  // Plate
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 0.1, 12), mat(0xFFF3D0)
  );
  plate.position.y = -0.05;
  G.add(plate);

  // Three tiers [topR, botR, height, y, sideCol, topCol]
  [
    [2.2, 2.2, 1.0, 0.56, 0xFFB8D0, 0xFFDDE8],
    [1.6, 1.6, 0.9, 1.66, 0xFFE44D, 0xFFF5A0],
    [1.1, 1.1, 0.8, 2.61, 0x85C1FF, 0xC8E8FF],
  ].forEach(([rT, rB, h, y, sideC, topC]) => {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(rT, rB, h, 12), mat(sideC)
    );
    body.position.y = y;
    G.add(body);

    const frosting = new THREE.Mesh(
      new THREE.CylinderGeometry(rT + 0.06, rT + 0.06, 0.07, 12), mat(topC)
    );
    frosting.position.y = y + h / 2 + 0.035;
    G.add(frosting);
  });

  // Pixel decorations (little cubes around each tier)
  const dc = [0xFF85A1, 0xFFE44D, 0x85C1FF, 0xC4A0FF];
  const blk = (c, x, y, z, s = 0.16) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat(c));
    b.position.set(x, y, z);
    G.add(b);
  };
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    blk(dc[i % 4], Math.cos(a) * 2, 0.56, Math.sin(a) * 2);
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    blk(dc[(i + 1) % 4], Math.cos(a) * 1.45, 1.66, Math.sin(a) * 1.45);
  }
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    blk(0xFFE44D, Math.cos(a) * 0.9, 2.61, Math.sin(a) * 0.9, 0.12);
  }

  // Pixel heart on tier 2 front face
  const hm = mat(0xFF85A1);
  [
    [ 0,  0], [ 1,  0], [-1,  0],
    [ 0, -1], [ 1,  1], [-1,  1],
    [ 0, -2]
  ].forEach(([dx, dy]) => {
    const hb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.12), hm);
    hb.position.set(dx * 0.22, 1.9 + dy * 0.22, 1.12);
    G.add(hb);
  });

  // ── Candles + flames ──────────────────────────────────────
  const cpos = [
    [ 0.0, 3.09,  0.0],
    [-0.5, 3.09,  0.4],
    [ 0.5, 3.09,  0.4],
    [-0.5, 3.09, -0.4],
    [ 0.5, 3.09, -0.4],
  ];
  const cc = [0x85C1FF, 0xFF85A1, 0xFFE44D, 0xC4A0FF, 0x7AE0A0];
  const flames = [];

  cpos.forEach(([x, y, z], i) => {
    // candle body
    const bd = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.5, 0.12), mat(cc[i % 5])
    );
    bd.position.set(x, y + 0.25, z);
    G.add(bd);

    // flame mesh
    const fm = new THREE.MeshStandardMaterial({
      color: 0xFFCC44,
      emissive: 0xFF8800,
      emissiveIntensity: 1.3,
      transparent: true,
      opacity: 0.95,
    });
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.1), fm);
    f.position.set(x, y + 0.6, z);
    f._phase = Math.random() * Math.PI * 2;
    flames.push(f);
    G.add(f);
  });

  // ── Drag-to-spin ──────────────────────────────────────────
  let drag = false, prevX = 0, rotY = 0, velY = 0;

  canvas.addEventListener("pointerdown", e => {
    drag = true;
    prevX = e.clientX;
    velY = 0;
    canvas.style.cursor = "grabbing";
  });
  window.addEventListener("pointermove", e => {
    if (!drag) return;
    velY = (e.clientX - prevX) * 0.012;
    rotY += velY;
    prevX = e.clientX;
  });
  window.addEventListener("pointerup", () => {
    drag = false;
    canvas.style.cursor = "grab";
  });

  // ── Blow candles ──────────────────────────────────────────
  let blowing = false, blowP = 0;
  window.blowCandlesOut = () => { blowing = true; blowP = 0; };

  // ── Render loop ───────────────────────────────────────────
  let tt = 0;
  (function loop() {
    requestAnimationFrame(loop);
    tt += 0.018;

    // auto-rotate + momentum
    if (!drag) { velY *= 0.9; rotY += 0.007 + velY; }
    G.rotation.y = rotY;
    G.position.y = Math.sin(tt * 0.7) * 0.06;   // gentle float

    // flicker flames
    flames.forEach(f => {
      f._phase += 0.14;
      const sc = 1 + Math.sin(f._phase * 2) * 0.15;
      f.scale.set(sc, sc + Math.cos(f._phase) * 0.1, sc);
      f.material.emissiveIntensity = 0.9 + Math.sin(f._phase * 1.8) * 0.4;
    });

    // blow-out animation
    if (blowing) {
      blowP += 0.05;
      flames.forEach(f => {
        const sc = Math.max(0, 1 - blowP * 1.4);
        f.scale.set(sc, sc, sc);
        f.material.opacity = Math.max(0, 1 - blowP);
      });
      pl.intensity = Math.max(0, 2.2 - blowP * 3.5);
      if (blowP >= 1) blowing = false;
    }

    ren.render(scene, cam);
  })();

  // ── Resize handler ────────────────────────────────────────
  window.addEventListener("resize", () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    cam.aspect = nw / nh;
    cam.updateProjectionMatrix();
    ren.setSize(nw, nh);
  });
}