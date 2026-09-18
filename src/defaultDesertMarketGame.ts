export const DEFAULT_DESERT_MARKET_GAME = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>معركة السوق الصحراوي التكتيكية 3D</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #c2996d;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      cursor: crosshair;
    }

    /* Tactical HUD */
    #hud {
      position: absolute;
      inset: 0;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
      z-index: 10;
    }

    .hud-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    /* Scoreboard */
    .score-banner {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 20px;
      color: #fff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .team-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .team-name {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .team-score {
      font-size: 24px;
      font-weight: 900;
      font-family: monospace;
    }
    .allies { color: #38bdf8; }
    .enemies { color: #f87171; }
    .score-divider {
      font-size: 18px;
      color: #94a3b8;
      font-weight: bold;
    }

    /* Radar / Minimap */
    #radar-container {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid rgba(56, 189, 248, 0.4);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    #radar-canvas {
      width: 100%;
      height: 100%;
    }

    /* Crosshair */
    #crosshair {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      width: 28px;
      height: 28px;
      transition: transform 0.08s ease-out;
    }
    .ch-dot {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #38bdf8;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 6px #38bdf8;
    }
    .ch-line {
      position: absolute;
      background: rgba(255, 255, 255, 0.85);
    }
    .ch-top { width: 2px; height: 7px; top: 0; left: 50%; transform: translateX(-50%); }
    .ch-bottom { width: 2px; height: 7px; bottom: 0; left: 50%; transform: translateX(-50%); }
    .ch-left { height: 2px; width: 7px; left: 0; top: 50%; transform: translateY(-50%); }
    .ch-right { height: 2px; width: 7px; right: 0; top: 50%; transform: translateY(-50%); }

    /* Hitmarker */
    #hitmarker {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 22px;
      height: 22px;
      opacity: 0;
      transition: opacity 0.15s ease-out;
    }
    #hitmarker::before, #hitmarker::after {
      content: '';
      position: absolute;
      background: #ef4444;
      border-radius: 1px;
    }
    #hitmarker::before { width: 100%; height: 2px; top: 50%; transform: translateY(-50%); }
    #hitmarker::after { height: 100%; width: 2px; left: 50%; transform: translateX(-50%); }

    /* Bottom HUD */
    .hud-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }

    .health-card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 16px;
      min-width: 210px;
      color: #fff;
    }
    .health-label {
      font-size: 11px;
      color: #94a3b8;
      font-weight: bold;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .health-bar-bg {
      width: 100%;
      height: 10px;
      background: #334155;
      border-radius: 5px;
      overflow: hidden;
    }
    #health-bar-fill {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #ef4444, #10b981);
      transition: width 0.2s ease;
    }

    .ammo-card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 20px;
      text-align: center;
      color: #fff;
    }
    .ammo-numbers {
      font-size: 28px;
      font-weight: 900;
      font-family: monospace;
      color: #facc15;
    }
    .ammo-max {
      font-size: 16px;
      color: #94a3b8;
    }
    .weapon-name {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 700;
    }

    /* Start / Instructions overlay */
    #start-screen {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      z-index: 50;
      cursor: pointer;
      text-align: center;
      padding: 24px;
    }
    .screen-card {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 32px 40px;
      max-width: 540px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .title-banner {
      font-size: 28px;
      font-weight: 900;
      color: #f59e0b;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
      text-align: right;
    }
    .ctrl-item {
      background: rgba(15, 23, 42, 0.6);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
    }
    .ctrl-key {
      color: #38bdf8;
      font-family: monospace;
      font-weight: bold;
    }
    .play-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      padding: 14px 32px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
      transition: all 0.2s;
    }
    .play-btn:hover {
      transform: scale(1.04);
      box-shadow: 0 6px 24px rgba(245, 158, 11, 0.6);
    }

    /* Screen flash for damage */
    #damage-flash {
      position: absolute;
      inset: 0;
      background: rgba(220, 38, 38, 0.35);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.1s ease-out;
      z-index: 15;
    }

    /* Mobile Controls */
    #mobile-controls {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 25;
      display: none;
    }
    .touch-btn {
      pointer-events: auto;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      border: 2px solid rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      color: #fff;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
    }
    #btn-fire {
      position: absolute;
      bottom: 40px;
      left: 30px;
      width: 72px;
      height: 72px;
      background: rgba(239, 68, 68, 0.75);
      border-color: rgba(239, 68, 68, 0.9);
      font-size: 16px;
    }
    #btn-jump {
      position: absolute;
      bottom: 125px;
      left: 35px;
      width: 52px;
      height: 52px;
      font-size: 12px;
    }
    #btn-reload {
      position: absolute;
      bottom: 45px;
      left: 115px;
      width: 52px;
      height: 52px;
      font-size: 12px;
    }
    #joystick-zone {
      position: absolute;
      bottom: 40px;
      right: 30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.5);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      pointer-events: auto;
    }
    #joystick-knob {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #38bdf8;
      top: 35px;
      left: 35px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="damage-flash"></div>

  <!-- HUD -->
  <div id="hud">
    <div class="hud-top">
      <div class="score-banner">
        <div class="team-badge">
          <span class="team-name allies">قوات التحالف</span>
          <span class="team-score allies" id="allies-score">0</span>
        </div>
        <span class="score-divider">:</span>
        <div class="team-badge">
          <span class="team-name enemies">مرتزقة الصحراء</span>
          <span class="team-score enemies" id="enemies-score">0</span>
        </div>
      </div>

      <div id="radar-container">
        <canvas id="radar-canvas" width="110" height="110"></canvas>
      </div>
    </div>

    <div id="crosshair">
      <div class="ch-dot"></div>
      <div class="ch-line ch-top"></div>
      <div class="ch-line ch-bottom"></div>
      <div class="ch-line ch-left"></div>
      <div class="ch-line ch-right"></div>
    </div>
    <div id="hitmarker"></div>

    <div class="hud-bottom">
      <div class="health-card">
        <div class="health-label">
          <span>صحة المحارب</span>
          <span id="health-num">100 / 100</span>
        </div>
        <div class="health-bar-bg">
          <div id="health-bar-fill"></div>
        </div>
      </div>

      <div class="ammo-card">
        <div class="weapon-name">بندقية تكتيكية M4-Desert</div>
        <div class="ammo-numbers"><span id="ammo-cur">30</span> <span class="ammo-max">/ 120</span></div>
      </div>
    </div>
  </div>

  <!-- Mobile Controls -->
  <div id="mobile-controls">
    <button class="touch-btn" id="btn-fire">إطلاق</button>
    <button class="touch-btn" id="btn-jump">قفز</button>
    <button class="touch-btn" id="btn-reload">تعبئة</button>
    <div id="joystick-zone">
      <div id="joystick-knob"></div>
    </div>
  </div>

  <!-- Start Modal -->
  <div id="start-screen">
    <div class="screen-card">
      <h1 class="title-banner">معركة السوق الصحراوي 3D</h1>
      <p class="subtitle">سوق قديم تكتيكي في قلب الصحراء. فريقان واقعيان مسلحان، ذكاء اصطناعي قتالي، براميل متفجرة، وعواصف غبار!</p>
      
      <div class="controls-grid">
        <div class="ctrl-item"><span>الحركة:</span> <span class="ctrl-key">W, A, S, D</span></div>
        <div class="ctrl-item"><span>التصويب والرؤية:</span> <span class="ctrl-key">الفأرة (Mouse)</span></div>
        <div class="ctrl-item"><span>إطلاق النار:</span> <span class="ctrl-key">كليك يسار</span></div>
        <div class="ctrl-item"><span>زووم القناص:</span> <span class="ctrl-key">كليك يمين</span></div>
        <div class="ctrl-item"><span>القفز:</span> <span class="ctrl-key">Space</span></div>
        <div class="ctrl-item"><span>إعادة التعبئة:</span> <span class="ctrl-key">مفتاح R</span></div>
        <div class="ctrl-item"><span>تبديل المنظور:</span> <span class="ctrl-key">مفتاح V</span></div>
        <div class="ctrl-item"><span>تفجير البراميل:</span> <span class="ctrl-key">أطلق عليها!</span></div>
      </div>

      <button class="play-btn" id="play-button">ابدأ المعركة وقفل الفأرة</button>
    </div>
  </div>

  <script>
    // --- Audio Synthesizer (Realistic Web Audio API) ---
    const AudioEngine = {
      ctx: null,
      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      },
      playGunshot() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Noise blast for muzzle crack
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4500, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);

        // Sub bass thump
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      },
      playExplosion() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const dur = 1.8;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      },
      playHit() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.04);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      },
      playReload() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    };

    // --- Three.js Setup ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd8b589);
    scene.fog = new THREE.FogExp2(0xd8b589, 0.014);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(60, 100, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const d = 100;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Tactical Sand Ground
    const groundGeo = new THREE.PlaneGeometry(350, 350, 40, 40);
    // Add subtle procedural dunes
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.04) * Math.cos(y * 0.04) * 1.5;
      posAttr.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xc89f6e,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Procedural Dust Particle Storm ---
    const dustCount = 1200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 250;
      dustPositions[i + 1] = Math.random() * 25;
      dustPositions[i + 2] = (Math.random() - 0.5) * 250;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xedd6af,
      size: 0.45,
      transparent: true,
      opacity: 0.45
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // --- Desert Market Architecture (Bazaar Stalls, Clay Buildings, Crates, Barrels) ---
    const colliders = [];
    const explosiveBarrels = [];

    // Building Creator
    function createClayBuilding(x, z, w, h, d, color = 0xbaa182) {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      const bodyGeo = new THREE.BoxGeometry(w, h, d);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Roof trim / parapet
      const trimGeo = new THREE.BoxGeometry(w + 0.6, 0.8, d + 0.6);
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x9e8467, roughness: 0.9 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.y = h + 0.4;
      trim.castShadow = true;
      group.add(trim);

      // Archway Door cutout visual
      const doorGeo = new THREE.BoxGeometry(2.4, 4, 0.4);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 2, d / 2 + 0.1);
      group.add(door);

      group.position.set(x, 0, z);
      scene.add(group);

      colliders.push({
        box: new THREE.Box3().setFromObject(body),
        mesh: body
      });
      return group;
    }

    // Market Bazaar Stall Creator
    function createMarketStall(x, z, rotY = 0, stripeColor = 0x991b1b) {
      const stall = new THREE.Group();
      
      // Wooden table
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
      const tableGeo = new THREE.BoxGeometry(5, 1.2, 2.5);
      const table = new THREE.Mesh(tableGeo, woodMat);
      table.position.y = 0.6;
      table.castShadow = true;
      stall.add(table);

      // 4 Canopy poles
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8);
      const polePositions = [
        [-2.3, 1.9, -1.1],
        [2.3, 1.9, -1.1],
        [-2.3, 1.9, 1.1],
        [2.3, 1.9, 1.1]
      ];
      polePositions.forEach(pos => {
        const pole = new THREE.Mesh(poleGeo, woodMat);
        pole.position.set(...pos);
        pole.castShadow = true;
        stall.add(pole);
      });

      // Striped fabric awning
      const awningMat = new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.7 });
      const awningGeo = new THREE.ConeGeometry(3.6, 1.4, 4);
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.y = 4.2;
      awning.rotation.y = Math.PI / 4;
      awning.castShadow = true;
      stall.add(awning);

      // Crates on stall
      const crateMat = new THREE.MeshStandardMaterial({ color: 0x855723 });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1), crateMat);
      crate.position.set(-1, 1.6, 0);
      crate.castShadow = true;
      stall.add(crate);

      stall.position.set(x, 0, z);
      stall.rotation.y = rotY;
      scene.add(stall);

      colliders.push({
        box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1, z), new THREE.Vector3(5.2, 2.5, 3)),
        mesh: table
      });
    }

    // Wooden Supply Crate
    function createSupplyCrate(x, z, size = 1.6) {
      const crateMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), crateMat);
      crate.position.set(x, size / 2, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      scene.add(crate);
      colliders.push({
        box: new THREE.Box3().setFromObject(crate),
        mesh: crate
      });
    }

    // Explosive Red Barrel
    function createExplosiveBarrel(x, z) {
      const group = new THREE.Group();
      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.4,
        metalness: 0.6
      });
      const barrelGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16);
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.y = 0.9;
      barrel.castShadow = true;
      group.add(barrel);

      // Warning hazard yellow stripes
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
      const stripeGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.25, 16);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.9;
      group.add(stripe);

      group.position.set(x, 0, z);
      scene.add(group);

      const barrelObj = {
        group,
        pos: new THREE.Vector3(x, 0.9, z),
        health: 25,
        exploded: false,
        mesh: barrel
      };
      explosiveBarrels.push(barrelObj);
      colliders.push({
        box: new THREE.Box3().setFromObject(barrel),
        mesh: barrel,
        isBarrel: true,
        barrelRef: barrelObj
      });
    }

    // Build Perimeter Buildings & Desert City Map
    // North Row
    createClayBuilding(-40, -45, 25, 14, 16, 0xc2a88a);
    createClayBuilding(-10, -48, 22, 18, 14, 0xb89a77);
    createClayBuilding(25, -45, 28, 15, 18, 0xc7ab8c);
    // South Row
    createClayBuilding(-35, 45, 22, 15, 16, 0xc7ab8c);
    createClayBuilding(5, 48, 26, 17, 14, 0xbaa182);
    createClayBuilding(38, 45, 24, 13, 16, 0xb89a77);
    // East / West Walls
    createClayBuilding(-55, 0, 16, 12, 45, 0xc2a88a);
    createClayBuilding(55, 0, 16, 12, 45, 0xc2a88a);

    // Center Market Alleys & Stalls
    createMarketStall(-18, -12, 0.2, 0xb91c1c);
    createMarketStall(-16, 12, -0.15, 0x1d4ed8);
    createMarketStall(16, -10, 0.1, 0x047857);
    createMarketStall(18, 14, -0.2, 0xb91c1c);
    createMarketStall(0, -22, Math.PI / 2, 0xd97706);
    createMarketStall(0, 22, Math.PI / 2, 0x4338ca);

    // Crates stacks
    createSupplyCrate(-8, -4, 1.8);
    createSupplyCrate(-6.5, -4, 1.4);
    createSupplyCrate(-7.2, -4 + 1.8, 1.2);
    createSupplyCrate(8, 6, 1.8);
    createSupplyCrate(9.5, 6, 1.4);
    createSupplyCrate(28, 0, 2.2);
    createSupplyCrate(-28, 0, 2.2);

    // Explosive Barrels placed tactically around market
    createExplosiveBarrel(-12, -8);
    createExplosiveBarrel(12, 10);
    createExplosiveBarrel(0, 5);
    createExplosiveBarrel(-22, 15);
    createExplosiveBarrel(22, -18);

    // --- Procedural High-Res Texture Generator ---
    function createProceduralTexture(type, baseColor, detailColor, detailColor2) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 256, 256);

      if (type === 'camo') {
        // Multi-tone military camouflage splotches
        for (let i = 0; i < 45; i++) {
          ctx.fillStyle = (i % 2 === 0) ? detailColor : (detailColor2 || '#2c2217');
          ctx.beginPath();
          const cx = Math.random() * 256;
          const cy = Math.random() * 256;
          const r = 16 + Math.random() * 32;
          ctx.ellipse(cx, cy, r, r * (0.6 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    }

    const desertCamoTex = createProceduralTexture('camo', '#c4a47c', '#8a6e4d', '#4d3b28');
    const urbanCamoTex = createProceduralTexture('camo', '#27272a', '#3f3f46', '#141416');

    // --- Ultra-Realistic Humanoid Soldier Character Builder ---
    function buildHumanoidModel(team = 'allies') {
      const root = new THREE.Group();
      
      const camoTex = team === 'allies' ? desertCamoTex : urbanCamoTex;
      const suitMat = new THREE.MeshStandardMaterial({ map: camoTex, roughness: 0.85 });
      const vestColor = team === 'allies' ? 0x8a6b47 : 0x1f2024;
      const gearMat = new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.75 });
      const armorPlateMat = new THREE.MeshStandardMaterial({ color: team === 'allies' ? 0x9c7951 : 0x141416, roughness: 0.65 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xc88f62, roughness: 0.6 });
      const gunMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
      const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f0f12, metalness: 0.9, roughness: 0.2 });
      const goggleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.85 });
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x2b2219, roughness: 0.8 });

      // Torso Group (bobs on walk)
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 1.45;
      root.add(torsoGroup);

      // 1. Inner Combat Shirt (with camo texture)
      const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.78, 0.44), suitMat);
      shirt.castShadow = true;
      torsoGroup.add(shirt);

      // 2. Heavy Tactical Plate Carrier Armor Vest
      const plateCarrier = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.7, 0.48), armorPlateMat);
      plateCarrier.castShadow = true;
      torsoGroup.add(plateCarrier);

      // 3. Three Front MOLLE Ammo Magazine Pouches
      for (let m = -1; m <= 1; m++) {
        const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), gearMat);
        pouch.position.set(m * 0.22, -0.12, 0.28);
        pouch.castShadow = true;
        torsoGroup.add(pouch);

        // Magazine top sticking out
        const magTop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.08), darkMetalMat);
        magTop.position.set(m * 0.22, 0.04, 0.28);
        torsoGroup.add(magTop);
      }

      // 4. Tactical Shoulder Radio & Antenna on Left Shoulder
      const radio = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.1), darkMetalMat);
      radio.position.set(-0.28, 0.26, 0.2);
      torsoGroup.add(radio);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45), darkMetalMat);
      antenna.position.set(-0.28, 0.52, 0.2);
      torsoGroup.add(antenna);

      // 5. Back Tactical Pack / Hydration
      const backPack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.58, 0.16), gearMat);
      backPack.position.set(0, 0.02, -0.3);
      backPack.castShadow = true;
      torsoGroup.add(backPack);

      // 6. Tactical Belt with Sidearm Pistol Holster
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.14, 0.46), gearMat);
      belt.position.set(0, -0.42, 0);
      torsoGroup.add(belt);
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), darkMetalMat);
      buckle.position.set(0, -0.42, 0.24);
      torsoGroup.add(buckle);

      // Drop-leg holster on right thigh
      const holster = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.16), darkMetalMat);
      holster.position.set(0.38, -0.65, 0);
      torsoGroup.add(holster);
      const pGrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), gunMat);
      pGrip.position.set(0.38, -0.52, 0.02);
      pGrip.rotation.z = -0.2;
      torsoGroup.add(pGrip);

      // 7. Neck & Head
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.78, 0);
      torsoGroup.add(headGroup);

      // Shemagh / Scarf collar around neck
      const shemagh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.18, 12), gearMat);
      shemagh.position.y = -0.15;
      headGroup.add(shemagh);

      // Head & Face
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), skinMat);
      head.castShadow = true;
      headGroup.add(head);

      // Balaclava Mask covering mouth/nose
      const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.18, 12), gearMat);
      mask.position.set(0, -0.06, 0.04);
      headGroup.add(mask);

      // Ballistic FAST Tactical Helmet
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 14), armorPlateMat);
      helmet.scale.set(1.02, 0.86, 1.14);
      helmet.position.set(0, 0.08, 0);
      helmet.castShadow = true;
      headGroup.add(helmet);

      // Front NVG Wilcox shroud mount
      const nvgMount = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.04), darkMetalMat);
      nvgMount.position.set(0, 0.1, 0.26);
      headGroup.add(nvgMount);

      // Side ARC Accessory Rails
      const railL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.2), darkMetalMat);
      railL.position.set(-0.25, 0.06, 0.02);
      headGroup.add(railL);
      const railR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.2), darkMetalMat);
      railR.position.set(0.25, 0.06, 0.02);
      headGroup.add(railR);

      // Tactical Comms Headset (Ear cups + mic)
      const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05), darkMetalMat);
      earL.rotation.z = Math.PI / 2;
      earL.position.set(-0.24, 0, 0);
      headGroup.add(earL);
      const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05), darkMetalMat);
      earR.rotation.z = Math.PI / 2;
      earR.position.set(0.24, 0, 0);
      headGroup.add(earR);
      const micBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2), darkMetalMat);
      micBoom.rotation.x = Math.PI / 3;
      micBoom.position.set(-0.22, -0.06, 0.1);
      headGroup.add(micBoom);

      // Polarized Tactical Goggles
      const gogglesFrame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.14), darkMetalMat);
      gogglesFrame.position.set(0, 0.04, 0.2);
      headGroup.add(gogglesFrame);
      const gogglesLens = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.02), goggleMat);
      gogglesLens.position.set(0, 0.04, 0.275);
      headGroup.add(gogglesLens);

      // 8. Left Arm (Articulated Forearm + Tactical Gloves holding rifle foregrip)
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.46, 0.28, 0);
      torsoGroup.add(leftArm);

      const lBicep = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.44, 0.2), suitMat);
      lBicep.position.y = -0.2;
      lBicep.castShadow = true;
      leftArm.add(lBicep);

      const lElbow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), darkMetalMat);
      lElbow.position.set(0, -0.38, -0.08);
      leftArm.add(lElbow);

      const lForearm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.18), suitMat);
      lForearm.position.set(0, -0.58, 0.16);
      lForearm.rotation.x = Math.PI / 3.2;
      lForearm.castShadow = true;
      leftArm.add(lForearm);

      const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), gearMat);
      lGlove.position.set(0, -0.74, 0.28);
      leftArm.add(lGlove);

      // 9. Right Arm (Holding rifle trigger & grip)
      const rightArm = new THREE.Group();
      rightArm.position.set(0.46, 0.28, 0);
      torsoGroup.add(rightArm);

      const rBicep = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.44, 0.2), suitMat);
      rBicep.position.y = -0.2;
      rBicep.castShadow = true;
      rightArm.add(rBicep);

      const rElbow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), darkMetalMat);
      rElbow.position.set(0, -0.38, -0.08);
      rightArm.add(rElbow);

      const rForearm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.18), suitMat);
      rForearm.position.set(0, -0.56, 0.14);
      rForearm.rotation.x = Math.PI / 3.4;
      rForearm.castShadow = true;
      rightArm.add(rForearm);

      const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), gearMat);
      rGlove.position.set(0, -0.72, 0.26);
      rightArm.add(rGlove);

      // Posed arm angles pointing rifle forward
      leftArm.rotation.set(Math.PI / 4, 0.2, -0.2);
      rightArm.rotation.set(Math.PI / 3.2, -0.2, 0.2);

      // 10. High-Detail M4A1 Tactical Assault Rifle
      const gunGroup = new THREE.Group();
      
      // Receiver & Body
      const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.75), gunMat);
      gunBody.castShadow = true;
      gunGroup.add(gunBody);

      // Top Picatinny Rail
      const gunRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.7), darkMetalMat);
      gunRail.position.set(0, 0.105, 0);
      gunGroup.add(gunRail);

      // Handguard & Barrel
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.45), gearMat);
      handguard.position.set(0, 0.01, 0.48);
      gunGroup.add(handguard);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.5), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.85);
      gunGroup.add(barrel);

      // Muzzle Suppressor / Flash Hider
      const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32), darkMetalMat);
      suppressor.rotation.x = Math.PI / 2;
      suppressor.position.set(0, 0.02, 1.15);
      gunGroup.add(suppressor);

      // Curved 30-round STANAG Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.14), darkMetalMat);
      mag.position.set(0, -0.18, 0.18);
      mag.rotation.x = -0.2;
      gunGroup.add(mag);

      // Tactical Crane Buttstock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.35), darkMetalMat);
      stock.position.set(0, -0.04, -0.45);
      gunGroup.add(stock);

      // ACOG Optical Sight with Sunshade
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3), darkMetalMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.15, 0.02);
      gunGroup.add(scope);

      // Muzzle Flash Effect
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0 });
      const flash = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), flashMat);
      flash.position.set(0, 0.02, 1.35);
      gunGroup.add(flash);

      gunGroup.position.set(0.18, -0.45, 0.65);
      torsoGroup.add(gunGroup);

      // 11. Legs & Heavy Combat Boots
      // Left Leg Group
      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.22, 0.95, 0);
      root.add(leftLeg);

      const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.26), suitMat);
      lThigh.position.y = -0.25;
      lThigh.castShadow = true;
      leftLeg.add(lThigh);

      // Cargo Pocket on side of thigh
      const lPocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.2), gearMat);
      lPocket.position.set(-0.14, -0.25, 0);
      leftLeg.add(lPocket);

      // Hard molded Knee Pad
      const lKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.1), darkMetalMat);
      lKneepad.position.set(0, -0.5, 0.14);
      leftLeg.add(lKneepad);

      const lShin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), suitMat);
      lShin.position.y = -0.68;
      lShin.castShadow = true;
      leftLeg.add(lShin);

      // Combat Boot with thick sole
      const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.38), bootMat);
      lBoot.position.set(0, -0.88, 0.06);
      lBoot.castShadow = true;
      leftLeg.add(lBoot);

      // Right Leg Group
      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.22, 0.95, 0);
      root.add(rightLeg);

      const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.26), suitMat);
      rThigh.position.y = -0.25;
      rThigh.castShadow = true;
      rightLeg.add(rThigh);

      const rPocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.2), gearMat);
      rPocket.position.set(0.14, -0.25, 0);
      rightLeg.add(rPocket);

      const rKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.1), darkMetalMat);
      rKneepad.position.set(0, -0.5, 0.14);
      rightLeg.add(rKneepad);

      const rShin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.22), suitMat);
      rShin.position.y = -0.68;
      rShin.castShadow = true;
      rightLeg.add(rShin);

      const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.38), bootMat);
      rBoot.position.set(0, -0.88, 0.06);
      rBoot.castShadow = true;
      rightLeg.add(rBoot);

      return {
        root,
        torsoGroup,
        leftLeg,
        rightLeg,
        gunGroup,
        muzzleFlash: flash,
        head: headGroup
      };
    }

    // --- First-Person Viewmodel Gun with Gloved Hands ---
    function createFPViewmodel() {
      const group = new THREE.Group();
      const gunMat = new THREE.MeshStandardMaterial({ color: 0x1c1c20, metalness: 0.85, roughness: 0.25 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x111113, metalness: 0.9, roughness: 0.3 });
      const tanGripMat = new THREE.MeshStandardMaterial({ color: 0x8a6d4b, roughness: 0.8 });
      const scopeLensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.05 });

      // Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.7), gunMat);
      group.add(receiver);

      // Top Rail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.65), darkMat);
      rail.position.set(0, 0.095, 0);
      group.add(rail);

      // Barrel & Handguard
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.5), tanGripMat);
      handguard.position.set(0, 0.01, 0.45);
      group.add(handguard);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), darkMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, 0.85);
      group.add(barrel);

      // Tactical Suppressor
      const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.35), darkMat);
      suppressor.rotation.x = Math.PI / 2;
      suppressor.position.set(0, 0.02, 1.15);
      group.add(suppressor);

      // Curved STANAG Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.35, 0.14), darkMat);
      mag.position.set(0, -0.2, 0.18);
      mag.rotation.x = -0.15;
      group.add(mag);

      // Pistol Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.09), tanGripMat);
      grip.position.set(0, -0.15, -0.18);
      grip.rotation.x = -0.35;
      group.add(grip);

      // ACOG Tactical Scope
      const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28), darkMat);
      scopeBody.rotation.x = Math.PI / 2;
      scopeBody.position.set(0, 0.14, -0.05);
      group.add(scopeBody);

      const scopeLens = new THREE.Mesh(new THREE.CircleGeometry(0.034, 16), scopeLensMat);
      scopeLens.position.set(0, 0.14, -0.191);
      scopeLens.rotation.y = Math.PI;
      group.add(scopeLens);

      // Glove Hands holding weapon
      const gloveMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.8 });

      // Right Hand
      const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.14), gloveMat);
      rHand.position.set(0.03, -0.12, -0.16);
      group.add(rHand);
      const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.6), gloveMat);
      rArm.rotation.x = Math.PI / 3;
      rArm.rotation.z = -Math.PI / 6;
      rArm.position.set(0.22, -0.35, -0.38);
      group.add(rArm);

      // Left Hand
      const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), gloveMat);
      lHand.position.set(-0.02, -0.02, 0.42);
      group.add(lHand);
      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.65), gloveMat);
      lArm.rotation.x = Math.PI / 3.5;
      lArm.rotation.z = Math.PI / 4.5;
      lArm.position.set(-0.25, -0.3, 0.15);
      group.add(lArm);

      // Muzzle Flash
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xfff066, transparent: true, opacity: 0 });
      const flash = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), flashMat);
      flash.position.set(0, 0.02, 1.35);
      group.add(flash);

      const defaultPos = new THREE.Vector3(0.28, -0.24, -0.55);
      const adsPos = new THREE.Vector3(0, -0.14, -0.35);
      group.position.copy(defaultPos);

      let recoilOffset = 0;

      return {
        group,
        flash,
        kickRecoil: () => {
          recoilOffset = 0.08;
          flash.material.opacity = 1;
          setTimeout(() => flash.material.opacity = 0, 45);
        },
        update: (delta, isWalking, isADS, walkTime) => {
          recoilOffset = THREE.MathUtils.lerp(recoilOffset, 0, delta * 15);
          const target = isADS ? adsPos : defaultPos;
          const swayX = isWalking && !isADS ? Math.sin(walkTime * 8) * 0.015 : 0;
          const swayY = isWalking && !isADS ? Math.abs(Math.cos(walkTime * 8)) * 0.012 : 0;

          group.position.x = THREE.MathUtils.lerp(group.position.x, target.x + swayX, delta * 12);
          group.position.y = THREE.MathUtils.lerp(group.position.y, target.y + swayY, delta * 12);
          group.position.z = THREE.MathUtils.lerp(group.position.z, target.z + recoilOffset, delta * 18);
          group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, recoilOffset * 0.8, delta * 15);
        }
      };
    }

    // --- Player & Bots Setup ---
    const player = {
      pos: new THREE.Vector3(0, 0, 30),
      velocity: new THREE.Vector3(),
      rotationY: 0,
      pitch: 0,
      health: 100,
      maxHealth: 100,
      ammo: 30,
      reserveAmmo: 120,
      isReloading: false,
      onGround: true,
      model: null,
      isThirdPerson: false,
      isADS: false,
      shootCooldown: 0
    };

    // Build Player Model & First-Person Viewmodel
    player.model = buildHumanoidModel('allies');
    scene.add(player.model.root);

    player.fpViewmodel = createFPViewmodel();
    camera.add(player.fpViewmodel.group);
    scene.add(camera);

    // Enemy AI Bots & Friendly Ally Bots
    const bots = [];
    const BOT_CONFIG = [
      // Opposing Mercenary Squad (Enemies)
      { team: 'enemies', x: -20, z: -25, hp: 80, name: 'Merc-Alpha' },
      { team: 'enemies', x: 20, z: -28, hp: 80, name: 'Merc-Bravo' },
      { team: 'enemies', x: -5, z: -35, hp: 90, name: 'Merc-Charlie' },
      { team: 'enemies', x: 12, z: -15, hp: 75, name: 'Merc-Delta' },
      { team: 'enemies', x: -25, z: -5, hp: 75, name: 'Merc-Echo' },
      // Allied Support Squad
      { team: 'allies', x: -12, z: 28, hp: 90, name: 'Ally-Ghost' },
      { team: 'allies', x: 14, z: 26, hp: 90, name: 'Ally-Soap' }
    ];

    BOT_CONFIG.forEach(cfg => {
      const botMesh = buildHumanoidModel(cfg.team);
      botMesh.root.position.set(cfg.x, 0, cfg.z);
      scene.add(botMesh.root);

      bots.push({
        ...cfg,
        mesh: botMesh,
        pos: botMesh.root.position,
        state: 'patrol',
        targetPos: new THREE.Vector3(cfg.x, 0, cfg.z),
        cooldown: Math.random() * 2,
        alive: true,
        shootTimer: 0,
        walkCycle: Math.random() * 10
      });
    });

    // Score Tracking
    let scoreAllies = 0;
    let scoreEnemies = 0;

    // Bullets and Tracer Projectiles
    const bullets = [];
    const bulletGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
    bulletGeo.rotateX(Math.PI / 2);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    function fireBullet(origin, dir, shooterTeam = 'allies') {
      const mesh = new THREE.Mesh(bulletGeo, bulletMat);
      mesh.position.copy(origin);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      scene.add(mesh);

      bullets.push({
        mesh,
        pos: mesh.position,
        dir: dir.clone().normalize(),
        speed: 160,
        distanceLeft: 120,
        team: shooterTeam
      });
    }

    // Explosions FX Manager
    const explosions = [];
    function triggerExplosion(pos, radius = 9, damage = 90) {
      AudioEngine.playExplosion();

      // Fireball Sphere
      const sphereGeo = new THREE.SphereGeometry(1.5, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pos);
      scene.add(sphere);

      explosions.push({
        mesh: sphere,
        scale: 1,
        maxScale: radius * 0.9,
        opacity: 0.9,
        light: new THREE.PointLight(0xff7700, 3, 25)
      });
      scene.add(explosions[explosions.length - 1].light);
      explosions[explosions.length - 1].light.position.copy(pos);

      // Damage player if close
      const dPlayer = pos.distanceTo(player.pos);
      if (dPlayer < radius) {
        const dmg = Math.round(damage * (1 - dPlayer / radius));
        takePlayerDamage(dmg);
      }

      // Damage bots
      bots.forEach(b => {
        if (!b.alive) return;
        const dB = pos.distanceTo(b.pos);
        if (dB < radius) {
          const dmg = Math.round(damage * (1 - dB / radius));
          b.hp -= dmg;
          if (b.hp <= 0) killBot(b);
        }
      });
    }

    // --- Controls & Pointer Lock ---
    let isPointerLocked = false;
    const keys = {};

    document.getElementById('play-button').addEventListener('click', () => {
      AudioEngine.init();
      container.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = document.pointerLockElement === container;
      document.getElementById('start-screen').style.display = isPointerLocked ? 'none' : 'flex';
    });

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'KeyR') reloadWeapon();
      if (e.code === 'KeyV') {
        player.isThirdPerson = !player.isThirdPerson;
      }
    });
    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPointerLocked) return;
      const sens = player.isADS ? 0.0012 : 0.0024;
      player.rotationY -= e.movementX * sens;
      player.pitch -= e.movementY * sens;
      player.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, player.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (!isPointerLocked) return;
      if (e.button === 0) tryPlayerShoot();
      if (e.button === 2) {
        player.isADS = true;
        camera.fov = 40;
        camera.updateProjectionMatrix();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        player.isADS = false;
        camera.fov = 75;
        camera.updateProjectionMatrix();
      }
    });
    window.addEventListener('contextmenu', e => e.preventDefault());

    // Mobile Virtual Joystick & Touch
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.getElementById('mobile-controls').style.display = 'block';
      let touchStartX = 0, touchStartY = 0;
      const knob = document.getElementById('joystick-knob');
      const zone = document.getElementById('joystick-zone');

      zone.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      });
      zone.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        const dist = Math.min(45, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * dist;
        const ky = Math.sin(angle) * dist;
        knob.style.transform = \`translate(\${kx}px, \${ky}px)\`;

        keys['KeyW'] = ky < -15;
        keys['KeyS'] = ky > 15;
        keys['KeyA'] = kx < -15;
        keys['KeyD'] = kx > 15;
      });
      zone.addEventListener('touchend', () => {
        knob.style.transform = 'translate(0, 0)';
        keys['KeyW'] = false;
        keys['KeyS'] = false;
        keys['KeyA'] = false;
        keys['KeyD'] = false;
      });

      document.getElementById('btn-fire').addEventListener('touchstart', (e) => {
        e.preventDefault();
        AudioEngine.init();
        tryPlayerShoot();
      });
      document.getElementById('btn-jump').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (player.onGround) player.velocity.y = 8;
      });
      document.getElementById('btn-reload').addEventListener('touchstart', (e) => {
        e.preventDefault();
        reloadWeapon();
      });
    }

    // --- Shooting Logic ---
    function tryPlayerShoot() {
      if (player.isReloading) return;
      if (player.ammo <= 0) {
        reloadWeapon();
        return;
      }
      if (player.shootCooldown > 0) return;

      player.ammo--;
      updateHudAmmo();
      player.shootCooldown = 0.12;

      AudioEngine.playGunshot();

      // Muzzle Flash & Recoil
      if (!player.isThirdPerson && player.fpViewmodel) {
        player.fpViewmodel.kickRecoil();
      } else {
        player.model.muzzleFlash.material.opacity = 1;
        setTimeout(() => player.model.muzzleFlash.material.opacity = 0, 50);
      }

      // Raycast shooting from camera center
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Spawn visual bullet
      const muzzleWorldPos = new THREE.Vector3();
      if (!player.isThirdPerson && player.fpViewmodel && player.fpViewmodel.flash) {
        player.fpViewmodel.flash.getWorldPosition(muzzleWorldPos);
      } else {
        player.model.muzzleFlash.getWorldPosition(muzzleWorldPos);
      }
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      fireBullet(muzzleWorldPos, camDir, 'allies');

      // Check Hits against bots & barrels
      const targets = [];
      bots.forEach(b => {
        if (b.alive && b.team === 'enemies') {
          b.mesh.root.traverse(child => {
            if (child.isMesh) {
              child.userData = { bot: b };
              targets.push(child);
            }
          });
        }
      });
      explosiveBarrels.forEach(bar => {
        if (!bar.exploded) {
          bar.mesh.userData = { barrel: bar };
          targets.push(bar.mesh);
        }
      });

      const hits = raycaster.intersectObjects(targets);
      if (hits.length > 0) {
        const hit = hits[0];
        if (hit.object.userData.bot) {
          const b = hit.object.userData.bot;
          b.hp -= 34;
          showHitmarker();
          AudioEngine.playHit();
          if (b.hp <= 0) killBot(b);
        } else if (hit.object.userData.barrel) {
          const bar = hit.object.userData.barrel;
          bar.health -= 34;
          if (bar.health <= 0 && !bar.exploded) {
            bar.exploded = true;
            scene.remove(bar.group);
            triggerExplosion(bar.pos);
          }
        }
      }
    }

    function showHitmarker() {
      const hm = document.getElementById('hitmarker');
      hm.style.opacity = '1';
      setTimeout(() => hm.style.opacity = '0', 120);
    }

    function reloadWeapon() {
      if (player.isReloading || player.ammo === 30 || player.reserveAmmo <= 0) return;
      player.isReloading = true;
      AudioEngine.playReload();
      setTimeout(() => {
        const needed = 30 - player.ammo;
        const take = Math.min(needed, player.reserveAmmo);
        player.ammo += take;
        player.reserveAmmo -= take;
        player.isReloading = false;
        updateHudAmmo();
      }, 1200);
    }

    function updateHudAmmo() {
      document.getElementById('ammo-cur').innerText = player.ammo;
    }

    function takePlayerDamage(amount) {
      player.health = Math.max(0, player.health - amount);
      document.getElementById('health-num').innerText = \`\${player.health} / \${player.maxHealth}\`;
      document.getElementById('health-bar-fill').style.width = \`\${(player.health / player.maxHealth) * 100}%\`;

      const flash = document.getElementById('damage-flash');
      flash.style.opacity = '1';
      setTimeout(() => flash.style.opacity = '0', 150);

      if (player.health <= 0) {
        scoreEnemies++;
        document.getElementById('enemies-score').innerText = scoreEnemies;
        // Respawn player
        setTimeout(() => {
          player.health = 100;
          player.pos.set(0, 0, 35);
          takePlayerDamage(0); // refresh UI
        }, 1500);
      }
    }

    function killBot(b) {
      b.alive = false;
      // Animate fall
      b.mesh.root.rotation.x = Math.PI / 2;
      b.mesh.root.position.y = 0.3;

      if (b.team === 'enemies') {
        scoreAllies++;
        document.getElementById('allies-score').innerText = scoreAllies;
      } else {
        scoreEnemies++;
        document.getElementById('enemies-score').innerText = scoreEnemies;
      }

      // Respawn bot after 8 seconds
      setTimeout(() => {
        b.alive = true;
        b.hp = 80;
        b.mesh.root.rotation.x = 0;
        b.mesh.root.position.set((Math.random() - 0.5) * 40, 0, -30);
      }, 8000);
    }

    // --- Radar Minimap Drawing ---
    const radarCanvas = document.getElementById('radar-canvas');
    const rCtx = radarCanvas.getContext('2d');
    function updateRadar() {
      rCtx.clearRect(0, 0, 110, 110);
      const cx = 55, cy = 55;
      const scale = 0.75;

      // Radar scanline circle
      rCtx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      rCtx.lineWidth = 1;
      rCtx.beginPath();
      rCtx.arc(cx, cy, 50, 0, Math.PI * 2);
      rCtx.stroke();
      rCtx.beginPath();
      rCtx.arc(cx, cy, 25, 0, Math.PI * 2);
      rCtx.stroke();

      // Player center icon
      rCtx.fillStyle = '#38bdf8';
      rCtx.beginPath();
      rCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      rCtx.fill();

      // Bots dots
      bots.forEach(b => {
        if (!b.alive) return;
        const dx = (b.pos.x - player.pos.x) * scale;
        const dz = (b.pos.z - player.pos.z) * scale;
        // Rotate relative to player view
        const cos = Math.cos(player.rotationY);
        const sin = Math.sin(player.rotationY);
        const rx = dx * cos - dz * sin;
        const ry = dx * sin + dz * cos;

        if (Math.hypot(rx, ry) < 52) {
          rCtx.fillStyle = b.team === 'allies' ? '#60a5fa' : '#ef4444';
          rCtx.beginPath();
          rCtx.arc(cx + rx, cy + ry, 3, 0, Math.PI * 2);
          rCtx.fill();
        }
      });
    }

    // --- Main Game Loop ---
    let lastTime = performance.now();
    let walkCycle = 0;

    function animate(currentTime) {
      requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Player Movement Logic
      const moveDir = new THREE.Vector3();
      if (keys['KeyW']) moveDir.z -= 1;
      if (keys['KeyS']) moveDir.z += 1;
      if (keys['KeyA']) moveDir.x -= 1;
      if (keys['KeyD']) moveDir.x += 1;

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY);
        const speed = player.isADS ? 6 : 14;
        player.velocity.x = moveDir.x * speed;
        player.velocity.z = moveDir.z * speed;

        // Limb walk animation
        walkCycle += delta * 12;
        player.model.leftLeg.rotation.x = Math.sin(walkCycle) * 0.6;
        player.model.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.6;
      } else {
        player.velocity.x *= 0.8;
        player.velocity.z *= 0.8;
        player.model.leftLeg.rotation.x = 0;
        player.model.rightLeg.rotation.x = 0;
      }

      // Jump & Gravity
      if (keys['Space'] && player.onGround) {
        player.velocity.y = 8;
        player.onGround = false;
      }
      player.velocity.y -= 22 * delta;
      player.pos.y += player.velocity.y * delta;

      if (player.pos.y <= 0) {
        player.pos.y = 0;
        player.velocity.y = 0;
        player.onGround = true;
      }

      // Apply Horizontal Velocity & Wall Collision
      const nextX = player.pos.x + player.velocity.x * delta;
      const nextZ = player.pos.z + player.velocity.z * delta;
      
      let blockedX = false, blockedZ = false;
      const pRadius = 0.8;
      colliders.forEach(c => {
        if (c.box.containsPoint(new THREE.Vector3(nextX, 1, player.pos.z))) blockedX = true;
        if (c.box.containsPoint(new THREE.Vector3(player.pos.x, 1, nextZ))) blockedZ = true;
      });

      if (!blockedX) player.pos.x = nextX;
      if (!blockedZ) player.pos.z = nextZ;

      // Update Player Mesh Position
      player.model.root.position.copy(player.pos);
      player.model.root.rotation.y = player.rotationY;

      // Camera Positioning
      const isWalking = (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) && player.onGround;

      if (player.isThirdPerson) {
        player.model.root.visible = true;
        if (player.fpViewmodel) player.fpViewmodel.group.visible = false;
        const camOffset = new THREE.Vector3(0, 2.2, 3.8);
        camOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch);
        camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY);
        camera.position.copy(player.pos).add(camOffset);
        camera.lookAt(player.pos.clone().add(new THREE.Vector3(0, 1.8, 0)));
      } else {
        // First Person: hide player 3rd person mesh, display realistic FP viewmodel with sway and recoil
        player.model.root.visible = false;
        if (player.fpViewmodel) {
          player.fpViewmodel.group.visible = true;
          player.fpViewmodel.update(delta, isWalking, player.isADS, walkCycle);
        }
        camera.position.copy(player.pos).add(new THREE.Vector3(0, 2.0, 0));
        camera.rotation.order = 'YXZ';
        camera.rotation.y = player.rotationY;
        camera.rotation.x = player.pitch;
      }

      // Shoot cooldown
      if (player.shootCooldown > 0) player.shootCooldown -= delta;

      // Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.pos.addScaledVector(b.dir, b.speed * delta);
        b.distanceLeft -= b.speed * delta;
        if (b.distanceLeft <= 0) {
          scene.remove(b.mesh);
          bullets.splice(i, 1);
        }
      }

      // Update Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        ex.scale += delta * 25;
        ex.mesh.scale.set(ex.scale, ex.scale, ex.scale);
        ex.opacity -= delta * 1.5;
        ex.mesh.material.opacity = Math.max(0, ex.opacity);
        ex.light.intensity = ex.opacity * 4;

        if (ex.opacity <= 0) {
          scene.remove(ex.mesh);
          scene.remove(ex.light);
          explosions.splice(i, 1);
        }
      }

      // --- Bot AI Logic ---
      bots.forEach(b => {
        if (!b.alive) return;

        b.walkCycle += delta * 6;
        b.mesh.leftLeg.rotation.x = Math.sin(b.walkCycle) * 0.5;
        b.mesh.rightLeg.rotation.x = -Math.sin(b.walkCycle) * 0.5;

        // Enemy AI targets the player
        if (b.team === 'enemies') {
          const distToPlayer = b.pos.distanceTo(player.pos);
          
          // Look at player
          b.mesh.root.lookAt(player.pos.x, b.pos.y, player.pos.z);

          // Advance towards player if too far
          if (distToPlayer > 18) {
            const step = new THREE.Vector3().subVectors(player.pos, b.pos).normalize().multiplyScalar(4.5 * delta);
            b.pos.add(step);
          }

          // Shoot player if in range & line of sight
          b.shootTimer += delta;
          if (distToPlayer < 45 && b.shootTimer > 1.8) {
            b.shootTimer = 0;
            // Bot shoots with audio & tracer
            AudioEngine.playGunshot();
            b.mesh.muzzleFlash.material.opacity = 1;
            setTimeout(() => b.mesh.muzzleFlash.material.opacity = 0, 50);

            const botAimDir = new THREE.Vector3().subVectors(player.pos, b.pos).normalize();
            // add subtle aim spread
            botAimDir.x += (Math.random() - 0.5) * 0.08;
            botAimDir.y += (Math.random() - 0.5) * 0.08;
            fireBullet(b.pos.clone().add(new THREE.Vector3(0, 1.4, 0)), botAimDir, 'enemies');

            // Chance to hit player
            if (distToPlayer < 30 && Math.random() < 0.4) {
              takePlayerDamage(12);
            }
          }
        } else {
          // Ally Bot attacks closest enemy
          const enemy = bots.find(e => e.alive && e.team === 'enemies');
          if (enemy) {
            b.mesh.root.lookAt(enemy.pos.x, b.pos.y, enemy.pos.z);
            b.shootTimer += delta;
            if (b.shootTimer > 2.2) {
              b.shootTimer = 0;
              AudioEngine.playGunshot();
              const dir = new THREE.Vector3().subVectors(enemy.pos, b.pos).normalize();
              fireBullet(b.pos.clone().add(new THREE.Vector3(0, 1.4, 0)), dir, 'allies');
              if (Math.random() < 0.3) {
                enemy.hp -= 20;
                if (enemy.hp <= 0) killBot(enemy);
              }
            }
          }
        }
      });

      // Update Dust Particles drift
      const dustPos = dustParticles.geometry.attributes.position.array;
      for (let i = 0; i < dustCount * 3; i += 3) {
        dustPos[i] += delta * 6; // wind blowing X
        if (dustPos[i] > 125) dustPos[i] = -125;
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;

      // Update Radar
      updateRadar();

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);

    // Responsive Resizing
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;
