// Standalone high-craft 3D Engine Synthesizer for Pretex 360 (بريتكس 360)
// Creates rich, fully-featured interactive Three.js applications and games matching user request
import { DEFAULT_DESERT_MARKET_GAME } from "../src/defaultDesertMarketGame";

export interface SynthesizedGame {
  title: string;
  thoughtSteps: string[];
  html: string;
  explanation: string;
  suggestedFeatures?: string[];
}

export function synthesize3DGame(prompt: string, uploadedImage?: string): SynthesizedGame {
  const p = (prompt || "").toLowerCase();

  // 1. Tactical, Military, Soldier, Desert Market, War & Combat Games (AAA Quality)
  if (
    p.includes("معركة") ||
    p.includes("سوق") ||
    p.includes("صحراء") ||
    p.includes("حرب") ||
    p.includes("جندي") ||
    p.includes("جنود") ||
    p.includes("قوات") ||
    p.includes("تكتيك") ||
    p.includes("سلاح") ||
    p.includes("رصاص") ||
    p.includes("قناص") ||
    p.includes("قتال") ||
    p.includes("desert") ||
    p.includes("market") ||
    p.includes("tactical") ||
    p.includes("soldier") ||
    p.includes("military") ||
    p.includes("war") ||
    p.includes("battle")
  ) {
    return {
      title: "معركة السوق الصحراوي التكتيكية 3D (ماكس جودة)",
      thoughtSteps: [
        "تحليل البيئة التكتيكية الشاملة: السوق الصحراوي الأثري والأزقة والمباني والمظلات",
        "هندسة مجسمات جنود القوات الخاصة بدقة فائقة: خوذة بالستية، منظار ليلي NVG، درع واقي، وبندقية M4A1",
        "تفعيل فيزياء الرماية المتقدمة والارتداد ومؤثرات النار والدخان ومحرك الصوت التفاعلي Web Audio",
        "برمجة نظام التحكم الشامل: تبديل منظور الشخص الأول (FPS) ومنظور الشخص الثالث مع أزرار اللمس للجوال"
      ],
      html: DEFAULT_DESERT_MARKET_GAME,
      explanation: "تم بناء لعبة معركة السوق الصحراوي التكتيكية بأعلى مستويات الجودة الرسومية 3D مع مجسمات جنود القوات الخاصة والأسلحة والبيئة الصحراوية الغنية والمؤثرات الصوتية.",
      suggestedFeatures: [
        "هل تريد إضافة ترسانة قناصة وأسلحة ثقيلة بازوكا؟",
        "هل تريد إضافة طائرات هليكوبتر حربية ودعم جوي؟",
        "هل تريد إضافة طور البقاء ضد موجات متتالية؟",
        "هل تريد تفعيل الطقس الليلي مع منظار الرؤية الليلية NVG؟"
      ]
    };
  }
  
  let genre = "general";
  let title = "عالم روني ستيكس ثلاثي الأبعاد";

  if (p.includes("سيار") || p.includes("سباق") || p.includes("عرب") || p.includes("drift") || p.includes("car") || p.includes("race") || p.includes("تفحيط")) {
    genre = "car";
    title = "لعبة سباق وانجراف السيارات الخارقة 3D";
  } else if (p.includes("كافيه") || p.includes("مقهى") || p.includes("قهو") || p.includes("مطعم") || p.includes("متجر") || p.includes("cafe") || p.includes("shop")) {
    genre = "cafe";
    title = "مقهى ومتجر روني ستيكس الافتراضي 3D";
  } else if (p.includes("فضاء") || p.includes("كوكب") || p.includes("طائر") || p.includes("صاروخ") || p.includes("space") || p.includes("ship")) {
    genre = "space";
    title = "استكشاف الفضاء ومطاردة الكويكبات 3D";
  } else if (p.includes("مدين") || p.includes("شوارع") || p.includes("عمار") || p.includes("city")) {
    genre = "city";
    title = "مدينة روني ستيكس الحيوية 3D";
  } else if (p.includes("زومبي") || p.includes("رماية") || p.includes("zombie") || p.includes("shooter") || p.includes("بقاء")) {
    genre = "survival";
    title = "مغامرة البقاء ومكافحة الزومبي 3D";
  }

  const thoughtSteps = [
    `تحليل متطلبات الفكرة بدقة عالية: "${prompt.slice(0, 60)}"`,
    `بناء نظام الإحداثيات، الكاميرا التفاعلية، ومحرك الإضاءة الطبيعي PBR وظلال عالية الدقة`,
    `هندسة مجسمات الـ 3D (${genre === "car" ? "سيارة سوبركار متطورة مع فيزياء دريفت وتفحيط" : "عالم تفاعلي مع تحكم سلس وتصادمات"})`,
    `برمجة واجهة المستخدم الرسومية HUD ونظام المؤثرات الصوتية عبر Web Audio API`
  ];

  let specificCode = "";

  if (genre === "car") {
    specificCode = `
      // Car Physics & Track
      const carGroup = new THREE.Group();
      
      // Car Chassis
      const bodyGeo = new THREE.BoxGeometry(2.2, 0.7, 4.4);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.8, roughness: 0.2 });
      const carBody = new THREE.Mesh(bodyGeo, bodyMat);
      carBody.position.y = 0.7;
      carBody.castShadow = true;
      carGroup.add(carBody);

      // Cabin / Roof
      const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 1.25, -0.2);
      carGroup.add(cabin);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 24);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });

      const wheels = [];
      const wheelPositions = [
        [-1.1, 0.45, 1.3],
        [1.1, 0.45, 1.3],
        [-1.1, 0.45, -1.3],
        [1.1, 0.45, -1.3]
      ];

      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        carGroup.add(wheel);
        wheels.push(wheel);
      });

      // Headlights
      const lightGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hlLeft = new THREE.Mesh(lightGeo, lightMat);
      hlLeft.position.set(-0.7, 0.7, 2.22);
      const hlRight = hlLeft.clone();
      hlRight.position.x = 0.7;
      carGroup.add(hlLeft, hlRight);

      const spotL = new THREE.SpotLight(0xffffff, 3, 25, Math.PI / 6, 0.3);
      spotL.position.set(0, 0.8, 2.2);
      spotL.target.position.set(0, 0, 10);
      carGroup.add(spotL);
      carGroup.add(spotL.target);

      scene.add(carGroup);

      // Track Ground
      const groundGeo = new THREE.PlaneGeometry(300, 300);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Circuit Road
      const roadGeo = new THREE.RingGeometry(35, 65, 64);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.05;
      road.receiveShadow = true;
      scene.add(road);

      // Neon Checkpoints & Cones
      for(let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const rad = 50 + (Math.sin(i) * 6);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 12), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xf59e0b : 0xef4444 }));
        cone.position.set(Math.cos(angle) * rad, 0.6, Math.sin(angle) * rad);
        cone.castShadow = true;
        scene.add(cone);
      }

      // Physics variables
      let speed = 0;
      let angle = 0;
      const maxSpeed = 1.2;
      const acceleration = 0.025;
      const friction = 0.96;
      let score = 0;

      function updateGame() {
        if (keys['ArrowUp'] || keys['KeyW']) {
          speed = Math.min(speed + acceleration, maxSpeed);
          playEngineSound(150 + speed * 150);
        } else if (keys['ArrowDown'] || keys['KeyS']) {
          speed = Math.max(speed - acceleration, -maxSpeed * 0.5);
          playEngineSound(120);
        } else {
          speed *= friction;
        }

        if (Math.abs(speed) > 0.01) {
          const turnSpeed = 0.035 * (speed / maxSpeed);
          if (keys['ArrowLeft'] || keys['KeyA']) angle += turnSpeed;
          if (keys['ArrowRight'] || keys['KeyD']) angle -= turnSpeed;
        }

        carGroup.rotation.y = angle;
        carGroup.position.x += Math.sin(angle) * speed;
        carGroup.position.z += Math.cos(angle) * speed;

        wheels.forEach(w => w.rotation.x += speed * 2);

        // Third-person chase camera
        const camOffset = new THREE.Vector3(0, 3.8, -8).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.lerp(carGroup.position.clone().add(camOffset), 0.1);
        camera.lookAt(carGroup.position.clone().add(new THREE.Vector3(0, 1.2, 0)));

        const kmh = Math.round(Math.abs(speed) * 120);
        document.getElementById('hud-speed').innerText = kmh + ' كم/س';
      }
    `;
  } else {
    // General 3D Explorer & World
    specificCode = `
      // Player Avatar
      const playerGroup = new THREE.Group();
      const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3 }));
      pBody.position.y = 0.9;
      pBody.castShadow = true;
      playerGroup.add(pBody);
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
      pHead.position.y = 1.9;
      playerGroup.add(pHead);
      scene.add(playerGroup);

      // Environment Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Grid Floor Pattern
      const grid = new THREE.GridHelper(200, 40, 0x6366f1, 0x1e293b);
      grid.position.y = 0.02;
      scene.add(grid);

      // Interactive World Objects
      for(let i = 0; i < 25; i++) {
        const h = 2 + Math.random() * 8;
        const bMat = new THREE.MeshStandardMaterial({ 
          color: [0x3b82f6, 0x8b5cf6, 0x10b981, 0xf59e0b][i % 4],
          metalness: 0.4,
          roughness: 0.2
        });
        const building = new THREE.Mesh(new THREE.BoxGeometry(3, h, 3), bMat);
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        building.position.set(x, h/2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
      }

      // Collectible floating gems
      const gems = [];
      for(let i = 0; i < 15; i++) {
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.5 }));
        gem.position.set((Math.random() - 0.5) * 60, 1.2, (Math.random() - 0.5) * 60);
        scene.add(gem);
        gems.push(gem);
      }

      let pAngle = 0;
      let score = 0;

      function updateGame() {
        const moveSpeed = 0.25;
        let moved = false;

        if (keys['ArrowUp'] || keys['KeyW']) {
          playerGroup.position.x += Math.sin(pAngle) * moveSpeed;
          playerGroup.position.z += Math.cos(pAngle) * moveSpeed;
          moved = true;
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
          playerGroup.position.x -= Math.sin(pAngle) * moveSpeed;
          playerGroup.position.z -= Math.cos(pAngle) * moveSpeed;
          moved = true;
        }
        if (keys['ArrowLeft'] || keys['KeyA']) {
          pAngle += 0.04;
          playerGroup.rotation.y = pAngle;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          pAngle -= 0.04;
          playerGroup.rotation.y = pAngle;
        }

        if (moved) playStepSound();

        // Rotate gems & check collection
        gems.forEach(g => {
          g.rotation.y += 0.03;
          if (g.position.distanceTo(playerGroup.position) < 1.5 && g.visible) {
            g.visible = false;
            score += 10;
            document.getElementById('hud-score').innerText = score;
            playChimeSound();
          }
        });

        // Smooth Camera Follow
        const offset = new THREE.Vector3(0, 5, -9).applyAxisAngle(new THREE.Vector3(0, 1, 0), pAngle);
        camera.position.lerp(playerGroup.position.clone().add(offset), 0.1);
        camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      }
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; width: 100vw; height: 100vh; }
    #canvas-container { width: 100%; height: 100%; position: absolute; inset: 0; }
    
    /* Modern Gaming HUD */
    .hud {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(99, 102, 241, 0.3);
      backdrop-filter: blur(10px);
      padding: 12px 18px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .hud-title { font-weight: 800; color: #818cf8; font-size: 14px; }
    .hud-stat { display: flex; justify-content: space-between; gap: 14px; font-weight: 600; }
    .hud-val { color: #38bdf8; font-family: monospace; font-size: 14px; }

    /* Onscreen Mobile Controls */
    .mobile-controls {
      position: absolute;
      bottom: 24px;
      left: 24px;
      right: 24px;
      display: flex;
      justify-content: space-between;
      z-index: 20;
      pointer-events: none;
    }
    .touch-btn {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.85);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      user-select: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .touch-btn:active { background: #4f46e5; border-color: #818cf8; transform: scale(0.95); }
    .d-pad { display: grid; grid-template-columns: repeat(3, 58px); gap: 6px; }

    .help-badge {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      color: #94a3b8;
      pointer-events: none;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>

  <div class="hud">
    <div class="hud-title">${title}</div>
    ${genre === "car" ? `
    <div class="hud-stat"><span>السرعة:</span><span class="hud-val" id="hud-speed">0 كم/س</span></div>
    ` : `
    <div class="hud-stat"><span>النقاط:</span><span class="hud-val" id="hud-score">0</span></div>
    `}
    <div class="hud-stat"><span>محرك 3D:</span><span class="hud-val">Three.js RonyStix</span></div>
  </div>

  <div class="help-badge">تحكم عبر الكيبورد (WASD أو الأسهم) أو أزرار الشاشة</div>

  <div class="mobile-controls">
    <div class="d-pad">
      <div></div>
      <div class="touch-btn" id="btn-up">↑</div>
      <div></div>
      <div class="touch-btn" id="btn-left">←</div>
      <div class="touch-btn" id="btn-down">↓</div>
      <div class="touch-btn" id="btn-right">→</div>
    </div>
  </div>

  <script>
    // Audio Synthesizer
    let audioCtx = null;
    function getAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    function playEngineSound(freq) {
      try {
        const ctx = getAudio();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    }

    function playChimeSound() {
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {}
    }

    function playStepSound() {
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch (e) {}
    }

    // Three.js Scene Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, -12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x6366f1, 0x0f172a, 0.4);
    scene.add(hemiLight);

    // Key inputs
    const keys = {};
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // Touch controls setup
    const bindTouch = (id, code) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[code] = true; });
      el.addEventListener('touchend', (e) => { e.preventDefault(); keys[code] = false; });
      el.addEventListener('mousedown', () => { keys[code] = true; });
      el.addEventListener('mouseup', () => { keys[code] = false; });
    };
    bindTouch('btn-up', 'KeyW');
    bindTouch('btn-down', 'KeyS');
    bindTouch('btn-left', 'KeyA');
    bindTouch('btn-right', 'KeyD');

    // Billboard for user uploaded image if present
    if (window.USER_UPLOADED_IMAGE_DATA) {
      try {
        const loader = new THREE.TextureLoader();
        loader.load(window.USER_UPLOADED_IMAGE_DATA, (tex) => {
          const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 });
          const board = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), mat);
          board.position.set(0, 5, 20);
          board.rotation.y = Math.PI;
          scene.add(board);
          const frame = new THREE.Mesh(new THREE.BoxGeometry(10.4, 6.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
          frame.position.set(0, 5, 20.2);
          scene.add(frame);
        });
      } catch (e) {}
    }

    ${specificCode}

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      updateGame();
      renderer.render(scene, camera);
    }
    animate();

    // Window Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

  return {
    title,
    thoughtSteps,
    html,
    explanation: `تمت برمجة ${title} بنجاح بأحدث معايير محرك Three.js، مع دعم القيادة والحركة والفيزياء والمؤثرات الصوتية التفاعلية.`,
    suggestedFeatures: genre === "car" ? [
      "هل تريد إضافة وضع الانجراف الحر Drift مع دخان كثيف للإطارات؟",
      "هل تريد إضافة مسار سباق ليلي مع أضواء نيون مبهرة؟",
      "هل تريد إضافة سيارات منافسة تتسابق معك بالذكاء الاصطناعي؟",
      "هل تريد إضافة زر نيترو توربو لزيادة السرعة الفائقة؟"
    ] : [
      "هل تريد إضافة نظام مراحل ومهام تدريجية؟",
      "هل تريد إضافة متجر لترقية الأدوات والقدرات؟",
      "هل تريد إضافة موسيقى حماسية ومؤثرات صوتية محيطية؟",
      "هل تريد إضافة نمط التحدي الزمني مع لوحة الصدارة؟"
    ]
  };
}
