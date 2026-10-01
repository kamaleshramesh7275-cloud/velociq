import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * EngineTwinCanvas.jsx
 * 
 * VelocIQ Definitive CAD Automotive Engine Digital Twin.
 * Precision-engineered to 1:1 parity with the reference industrial CAD render:
 * 
 * - Full Pause / Resume synchronization with simulation clock freeze
 * - Unified responsive non-overlapping toolbar layout across all screen resolutions
 * - Solid CAD Cutaway Architecture with ductile cast-iron cylinder sleeve liners
 * - Front horizontal rigid coolant distribution hard-line spanning across block
 * - High-pressure common fuel rail with 4 electronic multi-hole direct injectors
 * - 4-into-1 tuned organic mandrel-swept exhaust runners & scalloped merge collector
 * - Close-coupled catalytic converter with dual O2 sensors & 3-bolt downpipe flange
 * - Thermostat housing neck with diamond flange, hose barb, jubilee clamp & ECT sensor
 * - DOHC valvetrain with 4 coil-on-plug units, wiring conduit, 14 perimeter cap screws & PCV pipe
 * - Forward-repositioned accessory serpentine drive with vented alternator & active Poly-V belt
 * - Structural cast block waffle stiffening grid, spin-on oil filter, knock sensor & dipstick
 * - Right-side transverse transaxle with 10 bellhousing bolts, differential cup, oil cooler & orange solenoid plug
 * - Dual CAD Studio Lighting: "Keyshot Pure CAD White" vs "Executive Cyber Dark"
 * - Procedural Web Audio Engine Acoustic Synthesizer revving dynamically with RPM
 */

export default function EngineTwinCanvas({
  isSimRunning = true,
  visualMode = 'CAD',
  explodedFactor = 0,
  thermalState = {},
  telemetry = {},
  cylinderBalance = [],
  activeScenario = 'NOMINAL',
  onSelectComponent = () => {},
  selectedComponent = null
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const reqIdRef = useRef(null);
  const engineRootRef = useRef(null);
  const lightsRef = useRef({});

  // Simulation Clock & State Refs (ensures animation loop accesses latest values without rebinding)
  const isSimRunningRef = useRef(isSimRunning);
  const telemetryRef = useRef(telemetry);
  const simTimeRef = useRef(0);

  useEffect(() => {
    isSimRunningRef.current = isSimRunning;
  }, [isSimRunning]);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  // Studio Lighting & Inspection States
  const [studioTheme, setStudioTheme] = useState('DARK'); // 'DARK' or 'KEYSHOT_WHITE'
  const [cutawayActive, setCutawayActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Subsystem groups for exploded separation & raycasting
  const groupsRef = useRef({
    blockGroup: null,
    headGroup: null,
    exhaustGroup: null,
    transaxleGroup: null,
    accessoryGroup: null,
    pulleys: [],
    cylinderFlashes: [],
    internalPistons: [],
    cylinderLinersGroup: null,
    casingMeshes: []
  });

  const materialsRef = useRef({});
  // Selective clipping plane strictly for outer block/head casing
  const clippingPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.22));

  // Camera & Orbit state (defaults directly to front-3/4 reference perspective)
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 6.6, theta: 0.22, phi: Math.PI / 2.35 });
  const targetLookAt = useRef(new THREE.Vector3(0.12, 0.02, 0));

  // Raycaster
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  // Web Audio Procedural Engine Synthesizer
  useEffect(() => {
    if (!audioEnabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
      audioCtxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      const initialGain = isSimRunningRef.current ? 0.08 : 0.0;
      masterGain.gain.setValueAtTime(initialGain, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      // Low-Frequency Harmonic Rumble Oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const initialFreq = Math.max(25, ((telemetryRef.current.rpm || 1200) / 60) * 1.8);
      osc.frequency.setValueAtTime(initialFreq, ctx.currentTime);

      // Low-pass filter for deep throaty automotive exhaust drone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      oscRef.current = osc;
    } catch (err) {
      console.warn("Web Audio not allowed without user gesture:", err);
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, [audioEnabled]);

  // Synchronize Audio with Engine Speed (RPM) and Pause State
  useEffect(() => {
    if (audioEnabled && oscRef.current && audioCtxRef.current && gainRef.current) {
      const isRunning = isSimRunning && (telemetry.rpm || 0) > 0;
      const currentRpm = telemetry.rpm || 1200;
      const targetFreq = Math.max(26, Math.min(220, (currentRpm / 60) * 1.85));

      oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime(isRunning ? 0.08 : 0.0, audioCtxRef.current.currentTime, 0.04);
    }
  }, [isSimRunning, telemetry.rpm, audioEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 850;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(studioTheme === 'KEYSHOT_WHITE' ? 0xf8fafc : 0x0a0e17);
    scene.fog = new THREE.FogExp2(studioTheme === 'KEYSHOT_WHITE' ? 0xf8fafc : 0x0a0e17, 0.03);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with ACES Filmic, Soft Shadows & Local Clipping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = studioTheme === 'KEYSHOT_WHITE' ? 1.15 : 1.38;
    renderer.localClippingEnabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    setupStudioLighting(scene, studioTheme);

    // 5. Construct Hyper-Detailed Engine Assembly
    const engineRoot = new THREE.Group();
    scene.add(engineRoot);
    engineRootRef.current = engineRoot;

    buildHyperDetailedEngineAssembly(engineRoot);

    // 6. Animation Loop (Strictly driven by accumulated simulation time)
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const isRunning = isSimRunningRef.current && (telemetryRef.current?.rpm || 0) > 0;

      // Accumulate time ONLY when simulation is running
      if (isRunning) {
        simTimeRef.current += delta;
      }

      const simTime = simTimeRef.current;
      const currentRpm = isRunning ? (telemetryRef.current?.rpm || 1200) : 0;

      // Realistic engine harmonic vibration (Freezes on pause)
      if (engineRootRef.current) {
        const vibFactor = isRunning ? (currentRpm / 7000) : 0;
        engineRootRef.current.position.y = Math.sin(simTime * (currentRpm / 40)) * (vibFactor * 0.003);
        engineRootRef.current.position.x = Math.cos(simTime * (currentRpm / 50)) * (vibFactor * 0.002);
      }

      // Rotate pulleys with belt drive (Freezes on pause)
      if (groupsRef.current.pulleys.length > 0) {
        const rotSpeed = simTime * ((telemetryRef.current?.rpm || 1200) / 180);
        groupsRef.current.pulleys.forEach((p, i) => {
          p.rotation.x = rotSpeed * (i % 2 === 0 ? 1 : 1.35);
        });
      }

      // Internal pistons reciprocating in authentic 1-3-4-2 order (Freezes on pause)
      if (groupsRef.current.internalPistons.length === 4) {
        const crankAngle = simTime * ((telemetryRef.current?.rpm || 1200) / 60) * Math.PI * 2;
        groupsRef.current.internalPistons.forEach((piston, idx) => {
          // Cyl 1 & 4 at TDC when 2 & 3 at BDC
          const phase = (idx === 0 || idx === 3) ? 0 : Math.PI;
          piston.position.y = 0.15 + Math.cos(crankAngle + phase) * 0.18;
        });
      }

      // Cylinder combustion flash lights (Freezes on pause)
      if (groupsRef.current.cylinderFlashes.length > 0) {
        const activeCyl = telemetryRef.current?.activeFiringCylinder || 1;
        groupsRef.current.cylinderFlashes.forEach((light, idx) => {
          const isFiring = (idx + 1) === activeCyl;
          light.intensity = isRunning ? (isFiring ? 3.2 : (Math.sin(simTime * 10 + idx) * 0.15 + 0.2)) : 0.06;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, [studioTheme]);

  // Precision Solid CAD Cutaway Toggle (Clips strictly the outer casing, revealing intact internal components)
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats.casingAluminum || !mats.casingBlack) return;

    // Apply clipping plane ONLY to the outer block & head casings
    const casingMaterials = [mats.casingAluminum, mats.casingBlack];
    casingMaterials.forEach(mat => {
      if (cutawayActive) {
        mat.clippingPlanes = [clippingPlaneRef.current];
        mat.clipShadows = true;
      } else {
        mat.clippingPlanes = [];
      }
      mat.needsUpdate = true;
    });

    // Toggle visibility of cast iron cylinder sleeves
    if (groupsRef.current.cylinderLinersGroup) {
      groupsRef.current.cylinderLinersGroup.visible = cutawayActive;
    }
  }, [cutawayActive]);

  // Update exploded separation smoothly
  useEffect(() => {
    const { headGroup, exhaustGroup, transaxleGroup, accessoryGroup } = groupsRef.current;
    if (!headGroup || !exhaustGroup || !transaxleGroup) return;

    headGroup.position.y = 0.55 + (explodedFactor * 1.5);
    exhaustGroup.position.z = 0.72 + (explodedFactor * 1.6);
    exhaustGroup.position.y = 0.05 - (explodedFactor * 0.25);
    transaxleGroup.position.x = 1.05 + (explodedFactor * 1.8);
    if (accessoryGroup) accessoryGroup.position.x = -1.18 - (explodedFactor * 1.2);
  }, [explodedFactor]);

  // Update materials on visual mode or thermal state change
  useEffect(() => {
    updateVisualModeColors();
  }, [visualMode, thermalState, activeScenario, selectedComponent, studioTheme]);

  const updateCameraPosition = () => {
    const { radius, theta, phi } = sphericalRef.current;
    const camera = cameraRef.current;
    if (!camera) return;

    camera.position.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = targetLookAt.current.y + radius * Math.cos(phi);
    camera.position.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(targetLookAt.current);
  };

  /**
   * Studio Lighting Setup (Supports Keyshot Pure CAD White & Cyber Dark Studio)
   */
  const setupStudioLighting = (scene, theme) => {
    const isWhite = theme === 'KEYSHOT_WHITE';

    // Ambient wrap-around light
    const ambient = new THREE.AmbientLight(isWhite ? 0xffffff : 0xffffff, isWhite ? 0.95 : 0.75);
    scene.add(ambient);
    lightsRef.current.ambient = ambient;

    // Key Directional Light (Crisp sun-white with soft contact shadow)
    const keyLight = new THREE.DirectionalLight(0xffffff, isWhite ? 2.8 : 2.5);
    keyLight.position.set(7, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.0;
    scene.add(keyLight);
    lightsRef.current.keyLight = keyLight;

    // Fill Light
    const fillLight = new THREE.DirectionalLight(isWhite ? 0xf1f5f9 : 0xdbeafe, isWhite ? 1.6 : 1.4);
    fillLight.position.set(-8, 5, 6);
    scene.add(fillLight);

    // Rim Light (Defines metallic contours and edges)
    const backLight = new THREE.DirectionalLight(isWhite ? 0xe2e8f0 : 0x38bdf8, isWhite ? 1.2 : 1.8);
    backLight.position.set(1, 6, -8);
    scene.add(backLight);

    // Studio Turntable Ground Disc
    const groundGeom = new THREE.CylinderGeometry(5.4, 5.4, 0.08, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xe2e8f0 : 0x0f172a,
      roughness: isWhite ? 0.9 : 0.75,
      metalness: isWhite ? 0.1 : 0.25
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -1.95;
    ground.receiveShadow = true;
    scene.add(ground);

    if (!isWhite) {
      // Glowing Neon Accent Ring on floor in Dark Mode
      const ringGeom = new THREE.RingGeometry(4.8, 4.86, 64);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = -1.9;
      scene.add(ring);
    }
  };

  /**
   * Constructs the Hyper-Detailed Precision Engine Assembly matching reference photo
   */
  const buildHyperDetailedEngineAssembly = (root) => {
    const mats = materialsRef.current;

    // Dedicated Outer Casing Materials (can be clipped cleanly in Cutaway mode)
    mats.casingAluminum = new THREE.MeshStandardMaterial({
      color: 0xcdd2da,
      roughness: 0.35,
      metalness: 0.58,
      side: THREE.DoubleSide
    });

    mats.casingBlack = new THREE.MeshStandardMaterial({
      color: 0x1a1d22,
      roughness: 0.72,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Solid internal ductile cast iron for cylinder sleeve liners
    mats.castIronLiner = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide
    });

    // Component Materials (Remain 100% solid & intact during cutaway)
    mats.castAluminum = new THREE.MeshStandardMaterial({
      color: 0xcdd2da,
      roughness: 0.35,
      metalness: 0.58
    });

    mats.polishedAluminum = new THREE.MeshStandardMaterial({
      color: 0xe6ebf2,
      roughness: 0.22,
      metalness: 0.75
    });

    mats.exhaustStainless = new THREE.MeshStandardMaterial({
      color: 0xd0d5de,
      roughness: 0.24,
      metalness: 0.82
    });

    mats.matteBlack = new THREE.MeshStandardMaterial({
      color: 0x1a1d22,
      roughness: 0.72,
      metalness: 0.1
    });

    mats.rubberBelt = new THREE.MeshStandardMaterial({
      color: 0x111215,
      roughness: 0.92,
      metalness: 0.02
    });

    mats.chromeHardware = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.12,
      metalness: 0.95
    });

    mats.connectorOrange = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      roughness: 0.35,
      metalness: 0.15
    });

    mats.sensorBrass = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    mats.dipstickYellow = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.38,
      metalness: 0.1
    });

    mats.weldSeam = new THREE.MeshStandardMaterial({
      color: 0xb4bcc8,
      roughness: 0.3,
      metalness: 0.7
    });

    mats.fuelRailStainless = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.18,
      metalness: 0.88
    });

    // Helper: Create rounded beveled rectangular box shape
    const createBeveledBox = (w, h, d, radius = 0.06, bevel = 0.04) => {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + radius, y);
      shape.lineTo(x + w - radius, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + radius);
      shape.lineTo(x + w, y + h - radius);
      shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      shape.lineTo(x + radius, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - radius);
      shape.lineTo(x, y + radius);
      shape.quadraticCurveTo(x, y, x + radius, y);

      const extrudeSettings = {
        depth: d - bevel * 2,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: bevel,
        bevelThickness: bevel
      };
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      return geom;
    };

    // Helper: Hex Bolt
    const createHexBolt = (radius = 0.03, height = 0.04) => {
      return new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 6), mats.chromeHardware);
    };

    // ─────────────────────────────────────────────────────────────
    // 1. ENGINE BLOCK & CRANKCASE (Cast Aluminum Core)
    // ─────────────────────────────────────────────────────────────
    const blockGroup = new THREE.Group();
    blockGroup.name = 'Engine_Block';
    root.add(blockGroup);
    groupsRef.current.blockGroup = blockGroup;

    // Beveled Main Cylinder Block (Using casingAluminum so it can section cleanly)
    const blockGeom = createBeveledBox(1.85, 1.45, 1.45, 0.08, 0.05);
    const blockMesh = new THREE.Mesh(blockGeom, mats.casingAluminum);
    blockMesh.position.set(-0.25, -0.15, 0);
    blockMesh.castShadow = true;
    blockMesh.receiveShadow = true;
    blockMesh.userData = { id: 'block', name: 'Engine Block & Crankcase', subsystem: 'Engine Core' };
    blockGroup.add(blockMesh);

    // Front Structural Casting Waffle Rib Matrix (Authentic Cast Stiffening Grid)
    for (let i = -0.7; i <= 0.7; i += 0.35) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.15, 0.06), mats.casingAluminum);
      rib.position.set(-0.25 + i, -0.15, 0.75);
      blockGroup.add(rib);
    }
    for (let h = -0.6; h <= 0.4; h += 0.3) {
      const hRib = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.035, 0.05), mats.casingAluminum);
      hRib.position.set(-0.25, h, 0.75);
      blockGroup.add(hRib);
    }

    // Diagonal stiffening webs
    const diagRib1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.05), mats.casingAluminum);
    diagRib1.rotateZ(0.5);
    diagRib1.position.set(-0.48, -0.2, 0.75);
    blockGroup.add(diagRib1);

    const diagRib2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.05), mats.casingAluminum);
    diagRib2.rotateZ(-0.5);
    diagRib2.position.set(-0.02, -0.2, 0.75);
    blockGroup.add(diagRib2);

    // Solid Ductile Cast-Iron Cylinder Sleeve Liners (Visible in Cutaway Mode)
    const cylinderLinersGroup = new THREE.Group();
    cylinderLinersGroup.visible = false;
    for (let l = 0; l < 4; l++) {
      const lX = -0.9 + l * 0.45;
      // Cylinder sleeve tube
      const liner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.205, 0.205, 0.82, 24, 1, true),
        mats.castIronLiner
      );
      liner.position.set(lX, 0.18, 0);
      cylinderLinersGroup.add(liner);
    }
    blockGroup.add(cylinderLinersGroup);
    groupsRef.current.cylinderLinersGroup = cylinderLinersGroup;

    // Casting bosses on block
    const boss1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 20), mats.castAluminum);
    boss1.rotateX(Math.PI / 2);
    boss1.position.set(-0.62, -0.32, 0.78);
    blockGroup.add(boss1);

    const boss2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 20), mats.castAluminum);
    boss2.rotateX(Math.PI / 2);
    boss2.position.set(-0.35, -0.62, 0.78);
    blockGroup.add(boss2);

    // ─────────────────────────────────────────────────────────────
    // FEATURE: FRONT HORIZONTAL COOLANT HARD-LINE (Direct Reference Match)
    // ─────────────────────────────────────────────────────────────
    const coolantHardLineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.05, 0.08, 0.65), // From water pump on timing side
      new THREE.Vector3(-0.75, 0.06, 0.68),
      new THREE.Vector3(-0.25, 0.04, 0.68), // Running behind exhaust runners 2-3
      new THREE.Vector3(0.25, 0.05, 0.68),
      new THREE.Vector3(0.68, 0.08, 0.65)  // Merging into thermostat housing
    ]);
    const coolantHardLine = new THREE.Mesh(
      new THREE.TubeGeometry(coolantHardLineCurve, 24, 0.042, 14, false),
      mats.polishedAluminum
    );
    coolantHardLine.userData = { id: 'coolant_hard_line', name: 'Front Coolant Distribution Hard-Line', subsystem: 'Cooling' };
    blockGroup.add(coolantHardLine);

    // Dual brazed mounting brackets anchoring hard-line to block
    [-0.55, 0.35].forEach(x => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.05), mats.castAluminum);
      ear.position.set(x, 0.05, 0.72);
      const earBolt = createHexBolt(0.018, 0.03);
      earBolt.rotateX(Math.PI / 2);
      earBolt.position.set(x, 0.07, 0.74);
      blockGroup.add(ear);
      blockGroup.add(earBolt);
    });

    // Spin-on Oil Filter Canister (Lower Block)
    const oilFilterGroup = new THREE.Group();
    oilFilterGroup.position.set(-0.65, -0.68, 0.82);
    const filterBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 24), mats.matteBlack);
    filterBody.rotateX(Math.PI / 2);
    oilFilterGroup.add(filterBody);
    const filterFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24), mats.polishedAluminum);
    filterFlange.rotateX(Math.PI / 2);
    filterFlange.position.z = -0.15;
    oilFilterGroup.add(filterFlange);
    oilFilterGroup.userData = { id: 'oil_filter', name: 'Spin-on Engine Oil Filter', subsystem: 'Lubrication' };
    blockGroup.add(oilFilterGroup);

    // Oil Pressure Gallery Sensor Switch (Brass Hex)
    const oilSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 6), mats.sensorBrass);
    oilSensor.rotateX(Math.PI / 2);
    oilSensor.position.set(-0.15, -0.55, 0.78);
    oilSensor.userData = { id: 'oil_pressure_sensor', name: 'Main Gallery Oil Pressure Sensor', subsystem: 'Lubrication' };
    blockGroup.add(oilSensor);

    // Knock Sensor (Piezoelectric Donut on Mid-Block)
    const knockSensor = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 12, 20), mats.matteBlack);
    knockSensor.position.set(0.18, -0.15, 0.76);
    knockSensor.userData = { id: 'knock_sensor', name: 'Piezoelectric Engine Knock Sensor', subsystem: 'Ignition & Timing' };
    blockGroup.add(knockSensor);
    const knockBolt = createHexBolt(0.025, 0.06);
    knockBolt.rotateX(Math.PI / 2);
    knockBolt.position.set(0.18, -0.15, 0.77);
    blockGroup.add(knockBolt);

    // Oil Dipstick Tube & Yellow Finger Pull Ring
    const dipstickCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -0.65, 0.65),
      new THREE.Vector3(0.62, 0.05, 0.62),
      new THREE.Vector3(0.68, 0.75, 0.55)
    ]);
    const dipstickTube = new THREE.Mesh(new THREE.TubeGeometry(dipstickCurve, 20, 0.02, 10, false), mats.polishedAluminum);
    blockGroup.add(dipstickTube);
    // Yellow Ring Pull Handle
    const dipstickRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 12, 24), mats.dipstickYellow);
    dipstickRing.position.set(0.68, 0.82, 0.55);
    dipstickRing.rotateY(Math.PI / 4);
    dipstickRing.userData = { id: 'oil_dipstick', name: 'Engine Oil Dipstick & Guide Tube', subsystem: 'Lubrication' };
    blockGroup.add(dipstickRing);

    // Stepped Cast Aluminum Oil Pan (Sump)
    const oilPanGeom = createBeveledBox(1.75, 0.35, 1.35, 0.06, 0.03);
    const oilPan = new THREE.Mesh(oilPanGeom, mats.castAluminum);
    oilPan.position.set(-0.25, -0.98, 0);
    oilPan.userData = { id: 'oil_pan', name: 'Cast Aluminum Stiffened Oil Pan', subsystem: 'Lubrication' };
    blockGroup.add(oilPan);
    // Magnetic Drain Plug
    const drainPlug = createHexBolt(0.04, 0.05);
    drainPlug.position.set(0.45, -1.16, 0.3);
    blockGroup.add(drainPlug);

    // Internal Reciprocating Pistons with Piston Rings & Wrist Pins (100% Solid & Intact)
    const internalPistons = [];
    for (let p = 0; p < 4; p++) {
      const pX = -0.9 + p * 0.45;
      const pistonGroup = new THREE.Group();
      pistonGroup.position.set(pX, 0.15, 0);

      // Piston crown body
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 24), mats.polishedAluminum);
      pistonGroup.add(crown);

      // Piston ring grooves (compression rings)
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.008, 6, 24), mats.chromeHardware);
      ring1.position.y = 0.08;
      ring1.rotateX(Math.PI / 2);
      pistonGroup.add(ring1);

      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.008, 6, 24), mats.chromeHardware);
      ring2.position.y = 0.04;
      ring2.rotateX(Math.PI / 2);
      pistonGroup.add(ring2);

      // Connecting rod top eye & wrist pin
      const rodTop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 12), mats.chromeHardware);
      rodTop.rotateZ(Math.PI / 2);
      rodTop.position.y = -0.05;
      pistonGroup.add(rodTop);

      blockGroup.add(pistonGroup);
      internalPistons.push(pistonGroup);
    }
    groupsRef.current.internalPistons = internalPistons;

    // 4 Internal combustion flash lights
    const cylinderFlashes = [];
    for (let c = 0; c < 4; c++) {
      const xPos = -0.9 + c * 0.45;
      const flashLight = new THREE.PointLight(0xf59e0b, 0.4, 1.6);
      flashLight.position.set(xPos, 0.4, 0);
      blockGroup.add(flashLight);
      cylinderFlashes.push(flashLight);
    }
    groupsRef.current.cylinderFlashes = cylinderFlashes;

    // ─────────────────────────────────────────────────────────────
    // 2. DOHC CYLINDER HEAD & MATTE BLACK VALVE COVER (Top)
    // ─────────────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.name = 'Cylinder_Head';
    headGroup.position.set(-0.25, 0.55, 0);
    root.add(headGroup);
    groupsRef.current.headGroup = headGroup;

    // Aluminum Lower Cylinder Head with Bevels & Spark Plug Wells
    const headGeom = createBeveledBox(1.9, 0.45, 1.4, 0.06, 0.04);
    const headMesh = new THREE.Mesh(headGeom, mats.casingAluminum);
    headMesh.castShadow = true;
    headMesh.position.y = 0.2;
    headMesh.userData = { id: 'cylinder_head', name: '16-Valve DOHC Cylinder Head', subsystem: 'Valvetrain' };
    headGroup.add(headMesh);

    // Engine Lifting Brackets (Hoist Loops on Front-Left & Rear-Right)
    const hoistLoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 10, 20), mats.castAluminum);
    hoistLoop1.position.set(-0.85, 0.45, 0.65);
    hoistLoop1.rotateY(Math.PI / 2);
    headGroup.add(hoistLoop1);

    const hoistLoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 10, 20), mats.castAluminum);
    hoistLoop2.position.set(0.85, 0.45, -0.65);
    hoistLoop2.rotateY(Math.PI / 2);
    headGroup.add(hoistLoop2);

    // Matte Black Polymer Valve Cover (Using casingBlack so it sections cleanly)
    const coverGeom = createBeveledBox(1.85, 0.42, 1.3, 0.07, 0.05);
    const coverMesh = new THREE.Mesh(coverGeom, mats.casingBlack);
    coverMesh.position.set(0, 0.55, 0);
    coverMesh.castShadow = true;
    coverMesh.userData = { id: 'valve_cover', name: 'Matte Black Polymer Valve Cover', subsystem: 'Valvetrain' };
    headGroup.add(coverMesh);

    // Dual Camshaft Cam Humps along top of cover
    const camHumpL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 20), mats.casingBlack);
    camHumpL.rotateZ(Math.PI / 2);
    camHumpL.position.set(0, 0.72, 0.26);
    headGroup.add(camHumpL);

    const camHumpR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 20), mats.casingBlack);
    camHumpR.rotateZ(Math.PI / 2);
    camHumpR.position.set(0, 0.72, -0.26);
    headGroup.add(camHumpR);

    // 14 Perimeter Cap Screws securing Valve Cover to Head (Matching Reference)
    for (let i = 0; i < 5; i++) {
      const xPos = -0.8 + i * 0.4;
      const bFront = createHexBolt(0.028, 0.05);
      bFront.position.set(xPos, 0.72, 0.62);
      headGroup.add(bFront);

      const bRear = createHexBolt(0.028, 0.05);
      bRear.position.set(xPos, 0.72, -0.62);
      headGroup.add(bRear);
    }
    [-0.85, 0.85].forEach(x => {
      [0.2, -0.2].forEach(z => {
        const bSide = createHexBolt(0.028, 0.05);
        bSide.position.set(x, 0.72, z);
        headGroup.add(bSide);
      });
    });

    // Oil Filler Neck and Knurled Cap
    const fillerNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 20), mats.matteBlack);
    fillerNeck.position.set(-0.62, 0.78, 0.26);
    headGroup.add(fillerNeck);
    const fillerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12), mats.matteBlack);
    fillerCap.position.set(-0.62, 0.84, 0.26);
    headGroup.add(fillerCap);

    // ─────────────────────────────────────────────────────────────
    // FEATURE: HIGH-PRESSURE FUEL RAIL & 4 DIRECT INJECTORS
    // ─────────────────────────────────────────────────────────────
    const fuelRailGroup = new THREE.Group();
    fuelRailGroup.position.set(0, 0.72, -0.42);

    // Common stainless fuel rail tube
    const railTube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.68, 20), mats.fuelRailStainless);
    railTube.rotateZ(Math.PI / 2);
    fuelRailGroup.add(railTube);

    // Schrader test port & fuel feed hose fitting
    const schraderPort = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8), mats.sensorBrass);
    schraderPort.position.set(-0.82, 0.04, 0);
    fuelRailGroup.add(schraderPort);

    // 4 High-pressure electronic injectors plunging into head
    for (let inj = 0; inj < 4; inj++) {
      const injX = -0.65 + inj * 0.45;
      const injBody = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.02, 0.16, 12), mats.fuelRailStainless);
      injBody.position.set(injX, -0.09, 0.04);
      injBody.rotateX(-0.35);
      fuelRailGroup.add(injBody);

      const injPlug = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.04, 0.05), mats.matteBlack);
      injPlug.position.set(injX, -0.05, 0.07);
      fuelRailGroup.add(injPlug);
    }
    fuelRailGroup.userData = { id: 'fuel_rail', name: 'High-Pressure Direct Fuel Rail & Injectors', subsystem: 'Fuel System' };
    headGroup.add(fuelRailGroup);

    // 4 Coil-on-Plug Ignition Packs with Harness Clips & Wiring Conduit
    const conduitBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.06), mats.matteBlack);
    conduitBar.position.set(0, 0.8, -0.15);
    headGroup.add(conduitBar);

    for (let c = 0; c < 4; c++) {
      const xPos = -0.65 + c * 0.45;
      const coilGroup = new THREE.Group();
      coilGroup.position.set(xPos, 0.78, 0.02);

      const coilTop = new THREE.Mesh(createBeveledBox(0.24, 0.12, 0.22, 0.03, 0.02), mats.matteBlack);
      coilGroup.add(coilTop);

      const socket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.09), mats.matteBlack);
      socket.position.set(0, 0.04, -0.13);
      coilGroup.add(socket);

      // Fastener hold-down bolt
      const fastener = createHexBolt(0.02, 0.04);
      fastener.position.set(0.08, 0.08, 0.08);
      coilGroup.add(fastener);

      coilGroup.userData = { id: `coil_${c + 1}`, name: `Ignition Coil Pack #${c + 1}`, subsystem: 'Ignition' };
      headGroup.add(coilGroup);
    }

    // Angled PCV Breather Pipe between Coils #3 and #4 (Reference Match)
    const pcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0.75, 0.08),
      new THREE.Vector3(0.52, 0.95, 0.15),
      new THREE.Vector3(0.64, 1.05, 0.18)
    ]);
    const pcvPipe = new THREE.Mesh(new THREE.TubeGeometry(pcvCurve, 14, 0.035, 12, false), mats.castAluminum);
    pcvPipe.userData = { id: 'pcv_valve', name: 'PCV Crankcase Breather Pipe', subsystem: 'Emissions' };
    headGroup.add(pcvPipe);

    // Top/Rear Polished Cast Aluminum Intake Plenum Arch
    const intakePlenumGeom = new THREE.CylinderGeometry(0.25, 0.25, 1.9, 24);
    intakePlenumGeom.rotateZ(Math.PI / 2);
    const intakePlenum = new THREE.Mesh(intakePlenumGeom, mats.polishedAluminum);
    intakePlenum.position.set(0, 0.9, -0.58);
    intakePlenum.userData = { id: 'intake_plenum', name: 'Cast Aluminum Intake Plenum', subsystem: 'Air Induction' };
    headGroup.add(intakePlenum);

    // ─────────────────────────────────────────────────────────────
    // 3. FRONT 4-INTO-1 EXHAUST MANIFOLD & CATALYTIC CONVERTER
    // ─────────────────────────────────────────────────────────────
    const exhaustGroup = new THREE.Group();
    exhaustGroup.name = 'Exhaust_System';
    exhaustGroup.position.set(-0.25, 0.05, 0.72);
    root.add(exhaustGroup);
    groupsRef.current.exhaustGroup = exhaustGroup;

    // Exhaust Manifold Flange Plate on Cylinder Head
    const exFlangeGeom = createBeveledBox(1.72, 0.22, 0.08, 0.04, 0.02);
    const exFlange = new THREE.Mesh(exFlangeGeom, mats.castAluminum);
    exFlange.position.set(0, 0.35, 0);
    exhaustGroup.add(exFlange);

    // 8 Manifold Flange Mounting Studs & Hex Nuts (2 per cylinder exhaust port)
    for (let s = 0; s < 4; s++) {
      const xPort = -0.65 + s * 0.43;
      const studUpper = createHexBolt(0.022, 0.04);
      studUpper.rotateX(Math.PI / 2);
      studUpper.position.set(xPort, 0.43, 0.05);
      exhaustGroup.add(studUpper);

      const studLower = createHexBolt(0.022, 0.04);
      studLower.rotateX(Math.PI / 2);
      studLower.position.set(xPort, 0.27, 0.05);
      exhaustGroup.add(studLower);
    }

    // 4 Organic Mandrel-Bent Exhaust Runners with High-Radius Sweeps
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 0.35, 0.04),
      new THREE.Vector3(-0.78, 0.16, 0.32),
      new THREE.Vector3(-0.35, -0.15, 0.38),
      new THREE.Vector3(0.0, -0.38, 0.34)
    ]);
    const runner1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 24, 0.082, 16, false), mats.exhaustStainless);
    runner1.userData = { id: 'exhaust_runner_1', name: 'Exhaust Runner #1', subsystem: 'Exhaust' };
    exhaustGroup.add(runner1);

    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.35, 0.04),
      new THREE.Vector3(-0.24, 0.18, 0.36),
      new THREE.Vector3(-0.12, -0.18, 0.38),
      new THREE.Vector3(0.0, -0.38, 0.34)
    ]);
    const runner2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 24, 0.082, 16, false), mats.exhaustStainless);
    runner2.userData = { id: 'exhaust_runner_2', name: 'Exhaust Runner #2', subsystem: 'Exhaust' };
    exhaustGroup.add(runner2);

    const curve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.35, 0.04),
      new THREE.Vector3(0.24, 0.18, 0.36),
      new THREE.Vector3(0.12, -0.18, 0.38),
      new THREE.Vector3(0.0, -0.38, 0.34)
    ]);
    const runner3 = new THREE.Mesh(new THREE.TubeGeometry(curve3, 24, 0.082, 16, false), mats.exhaustStainless);
    runner3.userData = { id: 'exhaust_runner_3', name: 'Exhaust Runner #3', subsystem: 'Exhaust' };
    exhaustGroup.add(runner3);

    const curve4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.65, 0.35, 0.04),
      new THREE.Vector3(0.78, 0.16, 0.32),
      new THREE.Vector3(0.35, -0.15, 0.38),
      new THREE.Vector3(0.0, -0.38, 0.34)
    ]);
    const runner4 = new THREE.Mesh(new THREE.TubeGeometry(curve4, 24, 0.082, 16, false), mats.exhaustStainless);
    runner4.userData = { id: 'exhaust_runner_4', name: 'Exhaust Runner #4', subsystem: 'Exhaust' };
    exhaustGroup.add(runner4);

    // Center Manifold Support Bracket to Engine Block (Direct Reference Match)
    const supportBracket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.18), mats.castAluminum);
    supportBracket.position.set(0.0, -0.22, 0.18);
    const bracketBolt = createHexBolt(0.024, 0.05);
    bracketBolt.rotateX(Math.PI / 2);
    bracketBolt.position.set(0.0, -0.22, 0.28);
    supportBracket.add(bracketBolt);
    exhaustGroup.add(supportBracket);

    // Seamless Scalloped 4-into-1 Merge Collector
    const collectorGeom = new THREE.CylinderGeometry(0.22, 0.32, 0.3, 24);
    const collector = new THREE.Mesh(collectorGeom, mats.exhaustStainless);
    collector.position.set(0.0, -0.48, 0.34);
    exhaustGroup.add(collector);

    // Close-Coupled Catalytic Converter Canister (Connected Seamlessly with slight ~6° tilt)
    const catGroup = new THREE.Group();
    catGroup.position.set(0.0, -0.63, 0.34);
    catGroup.rotation.z = -0.09;

    // Upper cone transition
    const catTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.22, 24), mats.exhaustStainless);
    catGroup.add(catTop);

    // Upstream Wideband Oxygen Sensor (O2 / Lambda) + Pigtail Wire
    const o2UpstreamGroup = new THREE.Group();
    o2UpstreamGroup.position.set(0.22, -0.05, 0.22);
    const o2UpstreamBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 12), mats.sensorBrass);
    o2UpstreamBody.rotateZ(Math.PI / 4);
    o2UpstreamGroup.add(o2UpstreamBody);
    const o2UpstreamWire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), mats.matteBlack);
    o2UpstreamWire.position.set(0.08, 0.08, 0);
    o2UpstreamGroup.add(o2UpstreamWire);
    o2UpstreamGroup.userData = { id: 'o2_sensor_upstream', name: 'Upstream Wideband Lambda O2 Sensor', subsystem: 'Emissions & Air-Fuel' };
    catGroup.add(o2UpstreamGroup);

    // Main cylindrical catalyst body
    const catBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.72, 24), mats.exhaustStainless);
    catBody.position.y = -0.45;
    catBody.castShadow = true;
    catGroup.add(catBody);

    // Weld bead accent ring around catalyst body
    const weldRing = new THREE.Mesh(new THREE.TorusGeometry(0.365, 0.02, 12, 32), mats.weldSeam);
    weldRing.position.y = -0.45;
    weldRing.rotateX(Math.PI / 2);
    catGroup.add(weldRing);

    // Circumferential clamping band
    const clampBand = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 24), mats.chromeHardware);
    clampBand.position.y = -0.32;
    catGroup.add(clampBand);

    // Lower tapered neck
    const catBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.2, 0.28, 24), mats.exhaustStainless);
    catBottom.position.y = -0.92;
    catGroup.add(catBottom);

    // Downstream Catalyst Monitoring Oxygen Sensor
    const o2Downstream = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), mats.sensorBrass);
    o2Downstream.position.set(-0.16, -0.85, 0.12);
    o2Downstream.rotateZ(-Math.PI / 3);
    o2Downstream.userData = { id: 'o2_sensor_downstream', name: 'Downstream Catalyst Monitor O2 Sensor', subsystem: 'Emissions' };
    catGroup.add(o2Downstream);

    // Bottom 3-bolt exhaust downpipe connection flange
    const catFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), mats.chromeHardware);
    catFlange.position.set(0, -1.1, 0.08);
    catFlange.rotateX(0.35);
    catGroup.add(catFlange);

    for (let f = 0; f < 3; f++) {
      const fAngle = (f / 3) * Math.PI * 2;
      const fBolt = createHexBolt(0.025, 0.05);
      fBolt.position.set(Math.cos(fAngle) * 0.18, -1.1, 0.08 + Math.sin(fAngle) * 0.18);
      catGroup.add(fBolt);
    }

    catGroup.userData = { id: 'catalytic_converter', name: 'Close-Coupled Catalytic Converter', subsystem: 'Emissions' };
    exhaustGroup.add(catGroup);

    // Coolant Thermostat Housing & Angled Outlet Pipe (Direct Reference Match)
    const waterNeckGroup = new THREE.Group();
    waterNeckGroup.position.set(0.78, 0.05, 0.28);

    // Diamond 2-bolt mounting flange
    const waterBase = new THREE.Mesh(createBeveledBox(0.26, 0.26, 0.2, 0.04, 0.02), mats.castAluminum);
    waterNeckGroup.add(waterBase);
    const wBolt1 = createHexBolt(0.025, 0.05);
    wBolt1.position.set(-0.1, 0.1, 0.11);
    waterNeckGroup.add(wBolt1);
    const wBolt2 = createHexBolt(0.025, 0.05);
    wBolt2.position.set(0.1, -0.1, 0.11);
    waterNeckGroup.add(wBolt2);

    // Angled hose barb pipe
    const waterPipeGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.42, 20);
    waterPipeGeom.rotateX(Math.PI / 3);
    waterPipeGeom.rotateZ(-Math.PI / 6);
    const waterPipe = new THREE.Mesh(waterPipeGeom, mats.castAluminum);
    waterPipe.position.set(0.12, -0.05, 0.18);
    waterNeckGroup.add(waterPipe);

    // Jubilee hose clamp ring on water neck
    const hoseClamp = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 20), mats.chromeHardware);
    hoseClamp.position.set(0.18, -0.12, 0.3);
    waterNeckGroup.add(hoseClamp);

    // Engine Coolant Temperature (ECT) Sensor with connector plug
    const ectSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 8), mats.sensorBrass);
    ectSensor.position.set(-0.08, 0.14, 0.08);
    ectSensor.rotateX(-Math.PI / 4);
    waterNeckGroup.add(ectSensor);
    const ectPlug = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), mats.matteBlack);
    ectPlug.position.set(-0.08, 0.19, 0.12);
    waterNeckGroup.add(ectPlug);

    waterNeckGroup.userData = { id: 'thermostat_housing', name: 'Coolant Thermostat Housing & ECT Sensor', subsystem: 'Cooling' };
    exhaustGroup.add(waterNeckGroup);

    // ─────────────────────────────────────────────────────────────
    // 4. FRONT TIMING COVER & ACCESSORY SERPENTINE DRIVE (Left Side)
    // Shifted forward for optimal front-3/4 visibility
    // ─────────────────────────────────────────────────────────────
    const accessoryGroup = new THREE.Group();
    accessoryGroup.name = 'Accessory_Drive';
    accessoryGroup.position.set(-1.18, 0, 0.12);
    root.add(accessoryGroup);
    groupsRef.current.accessoryGroup = accessoryGroup;

    // Timing Cover with Twin Cam Sprocket Bulges (Direct Reference Match)
    const timingGeom = createBeveledBox(0.18, 1.65, 1.5, 0.06, 0.04);
    const timingCover = new THREE.Mesh(timingGeom, mats.castAluminum);
    timingCover.position.set(0.05, 0.45, 0);
    timingCover.castShadow = true;
    accessoryGroup.add(timingCover);

    const camBulge1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.22, 24), mats.castAluminum);
    camBulge1.rotateZ(Math.PI / 2);
    camBulge1.position.set(0.06, 0.98, -0.32);
    accessoryGroup.add(camBulge1);

    const camBulge2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.22, 24), mats.castAluminum);
    camBulge2.rotateZ(Math.PI / 2);
    camBulge2.position.set(0.06, 0.98, 0.32);
    accessoryGroup.add(camBulge2);

    // Timing cover perimeter M6 bolts
    for (let tb = 0; tb < 6; tb++) {
      const tbMesh = createHexBolt(0.024, 0.04);
      tbMesh.rotateZ(Math.PI / 2);
      tbMesh.position.set(0.15, -0.2 + tb * 0.25, (tb % 2 === 0 ? 0.65 : -0.65));
      accessoryGroup.add(tbMesh);
    }

    const pulleys = [];

    // Upper Water Pump / Idler Pulley
    const idlerGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.14, 24);
    idlerGeom.rotateZ(Math.PI / 2);
    const idler = new THREE.Mesh(idlerGeom, mats.polishedAluminum);
    idler.position.set(-0.06, 0.15, 0.25);
    idler.castShadow = true;
    accessoryGroup.add(idler);
    pulleys.push(idler);

    // Automatic Serpentine Belt Tensioner Arm & Pulley
    const tensionerArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), mats.castAluminum);
    tensionerArm.position.set(-0.04, -0.22, 0.05);
    accessoryGroup.add(tensionerArm);
    const tensionerPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 20), mats.polishedAluminum);
    tensionerPulley.rotateZ(Math.PI / 2);
    tensionerPulley.position.set(-0.06, -0.3, 0.05);
    accessoryGroup.add(tensionerPulley);
    pulleys.push(tensionerPulley);

    // Lower High-Output Alternator with Stator Vents & Heavy Cast Bracket
    const altGroup = new THREE.Group();
    altGroup.position.set(-0.06, -0.65, 0.35);

    // Cast mounting bracket to block with weight-saving cutouts
    const altBracket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.32), mats.castAluminum);
    altBracket.position.set(0.2, 0.08, -0.05);
    altGroup.add(altBracket);
    const altBolt1 = createHexBolt(0.03, 0.06);
    altBolt1.rotateZ(Math.PI / 2);
    altBolt1.position.set(0.32, 0.14, 0.05);
    altGroup.add(altBolt1);

    // Die-cast alternator cylindrical body
    const altBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.48, 24), mats.castAluminum);
    altBody.rotateZ(Math.PI / 2);
    altGroup.add(altBody);

    // Pulley with center locknut
    const altPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 24), mats.polishedAluminum);
    altPulley.rotateZ(Math.PI / 2);
    altPulley.position.x = -0.26;
    altGroup.add(altPulley);
    const altNut = createHexBolt(0.032, 0.04);
    altNut.rotateZ(Math.PI / 2);
    altNut.position.x = -0.34;
    altGroup.add(altNut);
    pulleys.push(altPulley);

    // Stator cooling ventilation slots around circumference
    for (let s = 0; s < 12; s++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), mats.matteBlack);
      const angle = (s / 12) * Math.PI * 2;
      slot.position.set(0, Math.cos(angle) * 0.24, Math.sin(angle) * 0.24);
      altGroup.add(slot);
    }

    // Rear B+ Terminal Stud with Red/Black Boot
    const altTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), mats.connectorOrange);
    altTerm.position.set(0.18, 0.18, -0.15);
    altGroup.add(altTerm);

    altGroup.userData = { id: 'alternator', name: 'High-Output Stator Alternator', subsystem: 'Electrical' };
    accessoryGroup.add(altGroup);

    // Crankshaft Harmonic Damper Pulley (Bottom Dual-Sheave)
    const crankGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 32);
    crankGeom.rotateZ(Math.PI / 2);
    const crankPulley = new THREE.Mesh(crankGeom, mats.chromeHardware);
    crankPulley.position.set(-0.06, -0.75, -0.35);
    accessoryGroup.add(crankPulley);
    // Rubber damper ring
    const crankDamper = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 10, 32), mats.rubberBelt);
    crankDamper.rotateY(Math.PI / 2);
    crankDamper.position.set(-0.06, -0.75, -0.35);
    accessoryGroup.add(crankDamper);
    pulleys.push(crankPulley);

    groupsRef.current.pulleys = pulleys;

    // Multi-Ribbed Serpentine Drive Belt (Closed-Loop Poly-V)
    const beltCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.38, 0.25),
      new THREE.Vector3(-0.06, -0.65, 0.52),
      new THREE.Vector3(-0.06, -0.92, -0.35),
      new THREE.Vector3(-0.06, -0.3, -0.05),
      new THREE.Vector3(-0.06, 0.15, -0.35)
    ], true);
    const beltMesh = new THREE.Mesh(new THREE.TubeGeometry(beltCurve, 48, 0.052, 8, true), mats.rubberBelt);
    beltMesh.userData = { id: 'serpentine_belt', name: 'EPDM Multi-Rib Serpentine Belt', subsystem: 'Accessory Drive' };
    accessoryGroup.add(beltMesh);

    // ─────────────────────────────────────────────────────────────
    // 5. TRANSVERSE TRANSAXLE TRANSMISSION ASSEMBLY (Right Side)
    // ─────────────────────────────────────────────────────────────
    const transaxleGroup = new THREE.Group();
    transaxleGroup.name = 'Transaxle_Transmission';
    transaxleGroup.position.set(1.05, -0.2, 0);
    root.add(transaxleGroup);
    groupsRef.current.transaxleGroup = transaxleGroup;

    // Conical Bellhousing Mating to Engine Block
    const bellGeom = new THREE.CylinderGeometry(0.85, 0.95, 0.65, 24);
    bellGeom.rotateZ(Math.PI / 2);
    const bellMesh = new THREE.Mesh(bellGeom, mats.castAluminum);
    bellMesh.position.set(-0.25, 0, 0);
    bellMesh.castShadow = true;
    transaxleGroup.add(bellMesh);

    // Starter Motor Housing on Upper Bellhousing Quadrant
    const starterGroup = new THREE.Group();
    starterGroup.position.set(-0.15, 0.45, 0.35);
    const starterCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 20), mats.matteBlack);
    starterCyl.rotateZ(Math.PI / 2);
    starterGroup.add(starterCyl);
    const starterSolenoid = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 16), mats.castAluminum);
    starterSolenoid.rotateZ(Math.PI / 2);
    starterSolenoid.position.set(0, 0.16, 0);
    starterGroup.add(starterSolenoid);
    starterGroup.userData = { id: 'starter_motor', name: 'High-Torque Starter Motor', subsystem: 'Electrical' };
    transaxleGroup.add(starterGroup);

    // 10 Heavy M10 Perimeter Bellhousing-to-Block Fastening Bolts
    for (let b = 0; b < 10; b++) {
      const angle = (b / 10) * Math.PI * 2;
      const boltBoss = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8), mats.castAluminum);
      boltBoss.rotateZ(Math.PI / 2);
      boltBoss.position.set(-0.55, Math.cos(angle) * 0.9, Math.sin(angle) * 0.9);
      transaxleGroup.add(boltBoss);

      const m10Bolt = createHexBolt(0.032, 0.04);
      m10Bolt.rotateZ(Math.PI / 2);
      m10Bolt.position.set(-0.6, Math.cos(angle) * 0.9, Math.sin(angle) * 0.9);
      transaxleGroup.add(m10Bolt);
    }

    // Main Ribbed Transaxle Gearcase with Cross-Ribbing
    const caseGeom = new THREE.CylinderGeometry(0.72, 0.65, 1.25, 24);
    caseGeom.rotateZ(Math.PI / 2);
    const caseMesh = new THREE.Mesh(caseGeom, mats.castAluminum);
    caseMesh.position.set(0.6, 0, 0);
    caseMesh.castShadow = true;
    caseMesh.userData = { id: 'transaxle', name: 'Transverse Transaxle Transmission', subsystem: 'Drivetrain' };
    transaxleGroup.add(caseMesh);

    // Case Stiffening Cross-Ribs
    for (let cr = -0.3; cr <= 0.3; cr += 0.2) {
      const cRib = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.05), mats.castAluminum);
      cRib.position.set(0.6, cr, 0.7);
      transaxleGroup.add(cRib);
    }

    // Differential Output Extension Housing & CV Axle Seal Flange
    const diffGeom = new THREE.CylinderGeometry(0.42, 0.38, 0.55, 20);
    diffGeom.rotateZ(Math.PI / 2);
    const diff = new THREE.Mesh(diffGeom, mats.castAluminum);
    diff.position.set(1.35, -0.15, 0.2);
    diff.userData = { id: 'differential', name: 'Final Drive & Differential Assembly', subsystem: 'Drivetrain' };
    transaxleGroup.add(diff);

    // Drive axle output cup / seal flange
    const axleCup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 20), mats.matteBlack);
    axleCup.rotateZ(Math.PI / 2);
    axleCup.position.set(1.65, -0.15, 0.2);
    transaxleGroup.add(axleCup);

    // Transmission Fluid Heat Exchanger / Oil Cooler Plate Stack (Lower Right)
    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(1.15, -0.48, -0.32);
    const coolerBody = new THREE.Mesh(createBeveledBox(0.38, 0.22, 0.28, 0.03, 0.02), mats.polishedAluminum);
    coolerGroup.add(coolerBody);
    // Coolant inlet/outlet barbs
    const barb1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), mats.castAluminum);
    barb1.position.set(-0.1, 0.14, 0.05);
    coolerGroup.add(barb1);
    const barb2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), mats.castAluminum);
    barb2.position.set(0.1, 0.14, 0.05);
    coolerGroup.add(barb2);
    coolerGroup.userData = { id: 'transmission_oil_cooler', name: 'Transmission Fluid Heat Exchanger', subsystem: 'Cooling & Transmission' };
    transaxleGroup.add(coolerGroup);

    // Electro-Hydraulic Auxiliary Solenoid Control Unit (Direct Reference Match)
    const solenoidGroup = new THREE.Group();
    solenoidGroup.position.set(0.9, -0.45, 0.65);

    const solBody = new THREE.Mesh(createBeveledBox(0.48, 0.36, 0.38, 0.04, 0.02), mats.castAluminum);
    solenoidGroup.add(solBody);

    // Cooling ribs on solenoid housing
    for (let r = -0.12; r <= 0.12; r += 0.08) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.35), mats.castAluminum);
      rib.position.y = r;
      solenoidGroup.add(rib);
    }

    // Signature Bright Orange Electrical Locking Connector Tab (Direct Reference Match)
    const orangeTab = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.08), mats.connectorOrange);
    orangeTab.position.set(0.18, 0.18, 0.16);
    solenoidGroup.add(orangeTab);
    const tabClip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.05), mats.matteBlack);
    tabClip.position.set(0.18, 0.22, 0.16);
    solenoidGroup.add(tabClip);

    // Shift cable bracket & selector pivot
    const selectorPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), mats.chromeHardware);
    selectorPivot.position.set(-0.16, 0.18, 0.12);
    solenoidGroup.add(selectorPivot);

    solenoidGroup.userData = { id: 'transmission_solenoid', name: 'Transmission Control Module & Solenoids', subsystem: 'Drivetrain' };
    transaxleGroup.add(solenoidGroup);
  };

  /**
   * Updates Material Colors based on Visual Mode & Multi-Physics Thermal State
   */
  const updateVisualModeColors = () => {
    const mats = materialsRef.current;
    if (!mats.castAluminum) return;

    const {
      headTemp = 90,
      blockTemp = 86,
      coolantTemp = 85,
      oilTemp = 90,
      exhaustTemp = 420
    } = thermalState;

    if (visualMode === 'THERMAL') {
      mats.exhaustStainless.color.set(getThermalColor(exhaustTemp, 250, 700));
      mats.castAluminum.color.set(getThermalColor(blockTemp, 65, 105));
      mats.casingAluminum.color.set(getThermalColor(blockTemp, 65, 105));
      mats.matteBlack.color.set(getThermalColor(headTemp - 10, 60, 100));
      mats.casingBlack.color.set(getThermalColor(headTemp - 10, 60, 100));

      mats.castAluminum.transparent = false;
      mats.casingAluminum.transparent = false;
      mats.castAluminum.opacity = 1.0;
      mats.casingAluminum.opacity = 1.0;
    } else if (visualMode === 'FLUIDS') {
      // Precision X-Ray Inspection
      mats.castAluminum.color.setHex(0x334155);
      mats.casingAluminum.color.setHex(0x334155);
      mats.castAluminum.transparent = true;
      mats.casingAluminum.transparent = true;
      mats.castAluminum.opacity = 0.38;
      mats.casingAluminum.opacity = 0.38;

      mats.exhaustStainless.color.setHex(0xf97316); // Glowing exhaust
      mats.matteBlack.color.setHex(0x1e293b);
      mats.casingBlack.color.setHex(0x1e293b);
      mats.matteBlack.transparent = true;
      mats.casingBlack.transparent = true;
      mats.matteBlack.opacity = 0.45;
      mats.casingBlack.opacity = 0.45;
    } else {
      // CAD PRECISION (Satin Cast Aluminum with Specular Highlights)
      mats.castAluminum.color.setHex(0xcdd2da);
      mats.casingAluminum.color.setHex(0xcdd2da);
      mats.castAluminum.transparent = false;
      mats.casingAluminum.transparent = false;
      mats.castAluminum.opacity = 1.0;
      mats.casingAluminum.opacity = 1.0;

      mats.polishedAluminum.color.setHex(0xe6ebf2);
      mats.exhaustStainless.color.setHex(0xd0d5de);
      mats.matteBlack.color.setHex(0x1a1d22);
      mats.casingBlack.color.setHex(0x1a1d22);
      mats.matteBlack.transparent = false;
      mats.casingBlack.transparent = false;
      mats.matteBlack.opacity = 1.0;
      mats.casingBlack.opacity = 1.0;
    }

    // Highlighting selected component
    if (selectedComponent && mats[selectedComponent.id]) {
      mats[selectedComponent.id].emissive = new THREE.Color(0x38bdf8);
      mats[selectedComponent.id].emissiveIntensity = 0.8;
    }
  };

  const getThermalColor = (temp, minTemp, maxTemp) => {
    const t = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
    const color = new THREE.Color();
    if (t < 0.25) {
      color.lerpColors(new THREE.Color(0x2563eb), new THREE.Color(0x06b6d4), t / 0.25);
    } else if (t < 0.5) {
      color.lerpColors(new THREE.Color(0x06b6d4), new THREE.Color(0x10b981), (t - 0.25) / 0.25);
    } else if (t < 0.75) {
      color.lerpColors(new THREE.Color(0x10b981), new THREE.Color(0xf59e0b), (t - 0.5) / 0.25);
    } else {
      color.lerpColors(new THREE.Color(0xf59e0b), new THREE.Color(0xef4444), (t - 0.75) / 0.25);
    }
    return color;
  };

  // Mouse Orbit & Click handling
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= deltaX * 0.007;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(3.0, Math.min(12.0, sphericalRef.current.radius + e.deltaY * 0.005));
    updateCameraPosition();
  };

  const handleClick = (e) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseVec.current.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseVec.current.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && (!target.userData || !target.userData.id) && target.parent) {
        target = target.parent;
      }
      if (target && target.userData && target.userData.id) {
        onSelectComponent(target.userData);
      }
    }
  };

  const setCameraPreset = (preset) => {
    switch (preset) {
      case 'REFERENCE': // Front 3/4 quarter view matching reference photo
        sphericalRef.current = { radius: 6.6, theta: 0.22, phi: Math.PI / 2.35 };
        break;
      case 'EXHAUST': // Direct front close-up on 4-1 headers and catalyst
        sphericalRef.current = { radius: 5.2, theta: 0.02, phi: Math.PI / 2.1 };
        break;
      case 'TRANSAXLE': // Right side transmission view
        sphericalRef.current = { radius: 5.5, theta: Math.PI / 2.1, phi: Math.PI / 2.3 };
        break;
      case 'ACCESSORY': // Left side serpentine belt & alternator
        sphericalRef.current = { radius: 5.4, theta: -Math.PI / 2.1, phi: Math.PI / 2.2 };
        break;
      case 'TOP': // Top valvetrain, fuel rail, coils & PCV
        sphericalRef.current = { radius: 5.8, theta: 0, phi: 0.18 };
        break;
      default:
        break;
    }
    updateCameraPosition();
  };

  return (
    <div className={`relative w-full h-full min-h-[540px] select-none rounded-2xl overflow-hidden border transition-colors duration-500 ${
      studioTheme === 'KEYSHOT_WHITE' 
        ? 'border-slate-300 bg-slate-100 shadow-xl' 
        : 'border-slate-800 bg-slate-950'
    }`}>
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Unified Responsive Top Control Bar (Never Overlaps) */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-col gap-2.5 pointer-events-none">
        
        {/* Tier 1: Camera Presets (Left) & Simulation Status Pill (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Camera Angle Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setCameraPreset('REFERENCE')}
              className={`rounded-lg backdrop-blur shadow-md px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/90 border border-slate-300 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-900/90 border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              📷 1:1 Reference
            </button>
            <button
              onClick={() => setCameraPreset('EXHAUST')}
              className={`rounded-lg backdrop-blur px-2.5 py-1 text-xs font-medium transition ${
                studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/80 border border-slate-300 text-slate-700 hover:border-slate-500'
                  : 'bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              4-1 Exhaust & Hard-Line
            </button>
            <button
              onClick={() => setCameraPreset('TRANSAXLE')}
              className={`rounded-lg backdrop-blur px-2.5 py-1 text-xs font-medium transition ${
                studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/80 border border-slate-300 text-slate-700 hover:border-slate-500'
                  : 'bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              Transaxle Gearbox
            </button>
            <button
              onClick={() => setCameraPreset('ACCESSORY')}
              className={`rounded-lg backdrop-blur px-2.5 py-1 text-xs font-medium transition ${
                studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/80 border border-slate-300 text-slate-700 hover:border-slate-500'
                  : 'bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              Belt Drive & Alternator
            </button>
            <button
              onClick={() => setCameraPreset('TOP')}
              className={`rounded-lg backdrop-blur px-2.5 py-1 text-xs font-medium transition ${
                studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/80 border border-slate-300 text-slate-700 hover:border-slate-500'
                  : 'bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              Valvetrain & Fuel Rail
            </button>
          </div>

          {/* Right: Simulation State & Live RPM Indicator */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className={`flex items-center gap-2 rounded-full border shadow-sm backdrop-blur px-3 py-1 text-xs ${
              studioTheme === 'KEYSHOT_WHITE'
                ? 'border-slate-300 bg-white/95 text-slate-800'
                : 'border-slate-700/80 bg-slate-900/90 text-slate-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isSimRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold">{isSimRunning ? 'RUNNING' : 'PAUSED'}</span>
              <span className="text-slate-500">|</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{telemetry.rpm || 0} RPM</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Interactive Controls & Studio Toggles (Aligned Right in Clean Sub-Row) */}
        <div className="flex flex-wrap items-center justify-end gap-2 pointer-events-auto">
          {/* Solid CAD Cutaway Slicer Toggle */}
          <button
            onClick={() => setCutawayActive(!cutawayActive)}
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur border transition flex items-center gap-1.5 shadow-sm ${
              cutawayActive 
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                : studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400/50'
            }`}
            title="Toggle Solid CAD Cutaway to inspect internal cast-iron cylinder sleeve liners and pistons"
          >
            ✂️ {cutawayActive ? 'Cutaway: ON' : 'Cutaway: OFF'}
          </button>

          {/* Audio Engine Sound Synthesizer */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur border transition flex items-center gap-1.5 shadow-sm ${
              audioEnabled 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' 
                : studioTheme === 'KEYSHOT_WHITE'
                  ? 'bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50'
            }`}
            title="Toggle Web Audio procedural engine sound revving with RPM"
          >
            🔊 {audioEnabled ? 'Engine Audio: ON' : 'Audio: OFF'}
          </button>

          {/* Dual Lighting Mode: Keyshot White vs Dark Studio */}
          <button
            onClick={() => setStudioTheme(studioTheme === 'DARK' ? 'KEYSHOT_WHITE' : 'DARK')}
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur border transition flex items-center gap-1.5 shadow-sm ${
              studioTheme === 'KEYSHOT_WHITE'
                ? 'bg-slate-900 text-cyan-300 border-slate-700 hover:bg-slate-800'
                : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white'
            }`}
            title="Switch between Keyshot White Studio (matches reference photo) and Cyber Dark Studio"
          >
            {studioTheme === 'KEYSHOT_WHITE' ? '🌙 Dark Studio' : '☀️ Keyshot White'}
          </button>
        </div>
      </div>

      {/* Thermal Gradient Legend */}
      {visualMode === 'THERMAL' && (
        <div className="absolute bottom-4 left-4 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur p-2.5 text-[11px] text-slate-300 flex flex-col gap-1.5 shadow-lg">
          <span className="font-semibold text-slate-200">Thermal Infrared (IR) Gradient</span>
          <div className="h-2 w-48 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-amber-400 to-rose-600" />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>40°C (Cold)</span>
            <span>85°C (Nominal)</span>
            <span>125°C+ (Overheat)</span>
          </div>
        </div>
      )}

      {/* Mouse Drag Hint */}
      <div className={`absolute bottom-4 right-4 text-[10px] pointer-events-none px-2.5 py-1 rounded-lg border backdrop-blur ${
        studioTheme === 'KEYSHOT_WHITE'
          ? 'bg-white/80 border-slate-300 text-slate-600'
          : 'bg-slate-950/75 border-slate-800 text-slate-400'
      }`}>
        Drag: Orbit 360° • Scroll: Zoom • Click any component to inspect CAD telemetry
      </div>
    </div>
  );
}
