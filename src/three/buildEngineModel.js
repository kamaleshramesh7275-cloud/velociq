/**
 * src/three/buildEngineModel.js
 * 
 * Parametric 3D Powertrain Mesh Factory for VelocIQ (Three.js r186).
 * Builds authentic CAD-quality digital twin geometry for all 10 powertrain families:
 * - Inline (I4, I3, Single 4S)
 * - Vee (V6 60°, V8 90°)
 * - Boxer (Flat-4 180° opposed)
 * - Diesel (Common-rail, VGT, DPF canister)
 * - Bi-Fuel CNG (High-pressure regulator, gas rail, dual injectors)
 * - Full Hybrid (Atkinson I4 + compact e-motor, planetary power split, top inverter)
 * - BEV (PMSM stator with hairpin windings, permanent magnet rotor, SiC inverter, reduction drive)
 */

import * as THREE from 'three';

export function buildParametricEngineAssembly(root, engineType, mats, registerComponentMeshes) {
  const engineId = engineType.id || 'i4_petrol';
  const layout = engineType.layout || 'INLINE';
  const numCylinders = engineType.cylinders || 0;

  // Assembly Subsystem Groups
  const blockGroup = new THREE.Group();
  blockGroup.name = 'BlockGroup';

  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';

  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = 'ExhaustGroup';

  const transaxleGroup = new THREE.Group();
  transaxleGroup.name = 'TransaxleGroup';

  const accessoryGroup = new THREE.Group();
  accessoryGroup.name = 'AccessoryGroup';

  const cylinderLinersGroup = new THREE.Group();
  cylinderLinersGroup.name = 'CylinderLinersGroup';
  cylinderLinersGroup.visible = false;

  const pulleys = [];
  const cylinderFlashes = [];
  const internalPistons = [];
  const casingMeshes = [];
  let motorRotorGroup = null;

  // Helper to register mesh for raycast & risk highlighting
  const tag = (mesh, id, name, subsystem) => {
    mesh.userData = { id, name, subsystem };
    registerComponentMeshes(id, mesh);
    return mesh;
  };

  // Helper for casing meshes that clip in cutaway view
  const makeCasing = (geom, mat, id, name, subsystem) => {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    tag(mesh, id, name, subsystem);
    casingMeshes.push(mesh);
    return mesh;
  };

  // -------------------------------------------------------------
  // 1. BEV PMSM ELECTRIC MOTOR POWERTRAIN
  // -------------------------------------------------------------
  if (layout === 'BEV' || engineId === 'bev_pmsm') {
    // A. Ribbed Stator Cylindrical Housing
    const statorHousingGeom = new THREE.CylinderGeometry(0.78, 0.78, 1.35, 36);
    statorHousingGeom.rotateZ(Math.PI / 2);
    const statorHousing = makeCasing(statorHousingGeom, mats.casingAluminum, 'stator_housing', 'PMSM Liquid-Cooled Stator Housing', 'Electric Drive');
    blockGroup.add(statorHousing);

    // Cooling ribs along stator housing
    for (let i = -0.55; i <= 0.55; i += 0.18) {
      const ribGeom = new THREE.TorusGeometry(0.81, 0.025, 12, 36);
      ribGeom.rotateY(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeom, mats.castAluminum);
      rib.position.x = i;
      blockGroup.add(rib);
    }

    // B. Internal Copper Hairpin Windings (Visible in cutaway)
    const statorCoreGeom = new THREE.CylinderGeometry(0.72, 0.72, 1.25, 32, 1, true);
    statorCoreGeom.rotateZ(Math.PI / 2);
    const copperStator = new THREE.Mesh(statorCoreGeom, mats.copperWire || mats.sensorBrass);
    cylinderLinersGroup.add(copperStator);

    // Copper end-turns rings
    const endTurnL = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 16, 32), mats.copperWire || mats.sensorBrass);
    endTurnL.position.x = -0.62;
    endTurnL.rotateY(Math.PI / 2);
    cylinderLinersGroup.add(endTurnL);

    const endTurnR = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 16, 32), mats.copperWire || mats.sensorBrass);
    endTurnR.position.x = 0.62;
    endTurnR.rotateY(Math.PI / 2);
    cylinderLinersGroup.add(endTurnR);

    // C. Internal Permanent Magnet Rotor & Shaft
    motorRotorGroup = new THREE.Group();
    motorRotorGroup.name = 'MotorRotor';

    const rotorBodyGeom = new THREE.CylinderGeometry(0.52, 0.52, 1.15, 24);
    rotorBodyGeom.rotateZ(Math.PI / 2);
    const rotorBody = new THREE.Mesh(rotorBodyGeom, mats.darkSteel || mats.matteBlack);
    tag(rotorBody, 'pmsm_rotor', 'Permanent Magnet Rotor Core', 'Rotor Assembly');
    motorRotorGroup.add(rotorBody);

    // Permanent magnet pole strips embedded around rotor
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const poleGeom = new THREE.BoxGeometry(1.10, 0.04, 0.14);
      const pole = new THREE.Mesh(poleGeom, mats.polishedAluminum);
      pole.position.set(0, Math.cos(angle) * 0.52, Math.sin(angle) * 0.52);
      pole.rotation.x = -angle;
      motorRotorGroup.add(pole);
    }

    // Central Drive Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.95, 24);
    shaftGeom.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeom, mats.chromeHardware);
    motorRotorGroup.add(shaft);

    cylinderLinersGroup.add(motorRotorGroup);
    blockGroup.add(cylinderLinersGroup);

    // D. Top-Mounted SiC Power Electronics Inverter Module
    const inverterBox = makeCasing(new THREE.BoxGeometry(0.95, 0.42, 0.85), mats.casingBlack, 'sic_inverter', 'Silicon-Carbide (SiC) Inverter Module', 'Power Electronics');
    inverterBox.position.set(0, 0.98, 0);
    headGroup.add(inverterBox);

    // Inverter top cooling plate / heatsink fins
    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.78), mats.castAluminum);
    heatsink.position.set(0, 1.20, 0);
    headGroup.add(heatsink);

    // 3 High-Voltage 3-Phase Orange Busbars from Inverter into Motor
    for (let b = -0.22; b <= 0.22; b += 0.22) {
      const busbarGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.26, 12);
      const busbar = new THREE.Mesh(busbarGeom, mats.orangePlug || mats.sensorBrass);
      busbar.position.set(b, 0.75, 0.25);
      headGroup.add(busbar);
    }

    // High Voltage Junction Box & Interlock
    const hvJunction = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.35), mats.orangePlug || mats.sensorBrass);
    hvJunction.position.set(0.48, 0.98, 0.25);
    tag(hvJunction, 'hv_junction_box', 'High-Voltage DC Interlock Junction', 'HV Battery Interface');
    headGroup.add(hvJunction);

    // E. Coaxial Single-Speed Reduction Gearbox & Differential (Right side)
    const gearboxHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.52, 0.58, 28), mats.castAluminum);
    gearboxHousing.rotateZ(Math.PI / 2);
    gearboxHousing.position.set(1.05, -0.05, 0);
    tag(gearboxHousing, 'reduction_gearbox', 'Single-Speed Helical Reduction Drive & Differential', 'Transmission');
    transaxleGroup.add(gearboxHousing);

    // Drive axle output flange
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.12, 20), mats.polishedAluminum);
    flange.rotateZ(Math.PI / 2);
    flange.position.set(1.36, -0.05, 0);
    transaxleGroup.add(flange);

    // F. Simulated Traction Battery Pack Sub-assembly (Underneath)
    const packGeom = new THREE.BoxGeometry(1.60, 0.22, 1.40);
    const batteryPack = new THREE.Mesh(packGeom, mats.matteBlack);
    batteryPack.position.set(0, -0.92, 0);
    tag(batteryPack, 'battery_pack', '60 kWh Modular Liquid-Cooled Battery Pack', 'Energy Storage');
    blockGroup.add(batteryPack);

    // Stator Phase Electromagnetic Glow Lights
    for (let fl = 0; fl < 4; fl++) {
      const angle = (fl / 4) * Math.PI * 2;
      const flash = new THREE.PointLight(0x0284c7, 0.1, 1.8);
      flash.position.set(0, Math.cos(angle) * 0.65, Math.sin(angle) * 0.65);
      blockGroup.add(flash);
      cylinderFlashes.push(flash);
    }
  }

  // -------------------------------------------------------------
  // 2. V-ENGINES (V6 60° & V8 90°)
  // -------------------------------------------------------------
  else if (layout === 'VEE') {
    const isV8 = numCylinders === 8;
    const bankAngleRad = ((engineType.bankAngleDeg || (isV8 ? 90 : 60)) * Math.PI) / 360; // Half-angle
    const cylsPerBank = numCylinders / 2;
    const blockLength = cylsPerBank * 0.38 + 0.30;

    // V-Block Main Crankcase
    const vCrankcase = makeCasing(new THREE.BoxGeometry(blockLength, 0.68, 0.88), mats.casingAluminum, isV8 ? 'v8_block' : 'v_block', isV8 ? 'Cast Aluminum 90° V8 Engine Block' : 'Die-Cast 60° V6 Deep-Skirt Block', 'Cylinder Block');
    vCrankcase.position.set(0, -0.15, 0);
    blockGroup.add(vCrankcase);

    // Two Angled Cylinder Banks
    const bankLeftGroup = new THREE.Group();
    const bankRightGroup = new THREE.Group();

    bankLeftGroup.rotation.x = bankAngleRad;
    bankRightGroup.rotation.x = -bankAngleRad;

    // Cylinder liners for each bank
    for (let c = 0; c < cylsPerBank; c++) {
      const xPos = -((cylsPerBank - 1) * 0.36) / 2 + c * 0.36;

      // Left Bank liner
      const linerL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.65, 20, 1, true), mats.ductileIron);
      linerL.position.set(xPos, 0.28, 0);
      bankLeftGroup.add(linerL);

      // Left Piston
      const pistonL = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.20, 20), mats.polishedAluminum);
      pistonL.position.set(xPos, 0.28, 0);
      pistonL.userData = { bank: 'left', cylIndex: c * 2, baseY: 0.28 };
      bankLeftGroup.add(pistonL);
      internalPistons.push(pistonL);

      // Right Bank liner
      const linerR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.65, 20, 1, true), mats.ductileIron);
      linerR.position.set(xPos + 0.05, 0.28, 0); // Bore offset
      bankRightGroup.add(linerR);

      // Right Piston
      const pistonR = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.20, 20), mats.polishedAluminum);
      pistonR.position.set(xPos + 0.05, 0.28, 0);
      pistonR.userData = { bank: 'right', cylIndex: c * 2 + 1, baseY: 0.28 };
      bankRightGroup.add(pistonR);
      internalPistons.push(pistonR);

      // Combustion flash lights
      const flashL = new THREE.PointLight(0xff7700, 0.1, 1.2);
      flashL.position.set(xPos, 0.52, 0);
      bankLeftGroup.add(flashL);
      cylinderFlashes.push(flashL);

      const flashR = new THREE.PointLight(0xff7700, 0.1, 1.2);
      flashR.position.set(xPos + 0.05, 0.52, 0);
      bankRightGroup.add(flashR);
      cylinderFlashes.push(flashR);
    }

    cylinderLinersGroup.add(bankLeftGroup);
    cylinderLinersGroup.add(bankRightGroup);
    blockGroup.add(cylinderLinersGroup);

    // Dual Cylinder Heads
    const headGeom = new THREE.BoxGeometry(blockLength, 0.35, 0.46);

    const headLeft = makeCasing(headGeom, mats.casingBlack, isV8 ? 'bank1_head' : 'bank_left_head', 'DOHC Bank 1 Cylinder Head & Cam Cover', 'Valvetrain');
    headLeft.position.set(0, 0.48, Math.sin(bankAngleRad) * 0.45);
    headLeft.rotation.x = bankAngleRad;
    headGroup.add(headLeft);

    const headRight = makeCasing(headGeom.clone(), mats.casingBlack, isV8 ? 'bank2_head' : 'bank_right_head', 'DOHC Bank 2 Cylinder Head & Cam Cover', 'Valvetrain');
    headRight.position.set(0.05, 0.48, -Math.sin(bankAngleRad) * 0.45);
    headRight.rotation.x = -bankAngleRad;
    headGroup.add(headRight);

    // Center Valley Intake Surge Tank / Plenum
    const intakePlenum = makeCasing(new THREE.BoxGeometry(blockLength * 0.85, 0.32, 0.42), mats.casingBlack, isV8 ? 'tunnel_ram_plenum' : 'intake_surge_tank', isV8 ? 'Dual-Plenum Cross-Ram Intake Assembly' : 'Acoustic Variable-Volume Intake Plenum', 'Air Induction');
    intakePlenum.position.set(0, 0.65, 0);
    headGroup.add(intakePlenum);

    // Dual Tuned Exhaust Manifolds (Left and Right Flanks)
    const headerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, blockLength * 0.8, 16), mats.exhaustStainless);
    headerLeft.rotateZ(Math.PI / 2);
    headerLeft.position.set(0, 0.12, 0.56);
    tag(headerLeft, 'exhaust_l', 'Bank 1 Hydroformed Tubular Header', 'Exhaust');
    exhaustGroup.add(headerLeft);

    const headerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, blockLength * 0.8, 16), mats.exhaustStainless);
    headerRight.rotateZ(Math.PI / 2);
    headerRight.position.set(0, 0.12, -0.56);
    tag(headerRight, isV8 ? 'dual_exhaust' : 'exhaust_r', 'Bank 2 Hydroformed Tubular Header', 'Exhaust');
    exhaustGroup.add(headerRight);

    // Oil pan underneath
    const oilPan = new THREE.Mesh(new THREE.BoxGeometry(blockLength * 0.88, 0.28, 0.65), mats.darkSteel || mats.matteBlack);
    oilPan.position.set(0, -0.62, 0);
    tag(oilPan, 'oil_pan', 'Baffled Windage Aluminum Oil Sump', 'Lubrication');
    blockGroup.add(oilPan);
  }

  // -------------------------------------------------------------
  // 3. BOXER FLAT-4 (180° HORIZONTALLY OPPOSED)
  // -------------------------------------------------------------
  else if (layout === 'BOXER' || engineId === 'boxer4') {
    // Horizontally Opposed Split Crankcase
    const crankcase = makeCasing(new THREE.BoxGeometry(0.68, 0.48, 0.72), mats.casingAluminum, 'split_crankcase', 'Horizontally Opposed Split-Die Crankcase', 'Cylinder Block');
    crankcase.position.set(0, -0.05, 0);
    blockGroup.add(crankcase);

    // Left Cylinder Bank (-Z) and Right Cylinder Bank (+Z)
    for (let c = 0; c < 2; c++) {
      const xPos = -0.18 + c * 0.36;

      // Left liner extending horizontally along -Z
      const linerL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.62, 20, 1, true), mats.ductileIron);
      linerL.rotateX(Math.PI / 2);
      linerL.position.set(xPos, 0, -0.55);
      cylinderLinersGroup.add(linerL);

      const pistonL = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.18, 20), mats.polishedAluminum);
      pistonL.rotateX(Math.PI / 2);
      pistonL.position.set(xPos, 0, -0.55);
      pistonL.userData = { axis: 'horizontal', side: -1, cylIndex: c * 2, baseZ: -0.55 };
      internalPistons.push(pistonL);
      cylinderLinersGroup.add(pistonL);

      // Right liner extending horizontally along +Z
      const linerR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.62, 20, 1, true), mats.ductileIron);
      linerR.rotateX(Math.PI / 2);
      linerR.position.set(xPos + 0.06, 0, 0.55);
      cylinderLinersGroup.add(linerR);

      const pistonR = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.18, 20), mats.polishedAluminum);
      pistonR.rotateX(Math.PI / 2);
      pistonR.position.set(xPos + 0.06, 0, 0.55);
      pistonR.userData = { axis: 'horizontal', side: 1, cylIndex: c * 2 + 1, baseZ: 0.55 };
      internalPistons.push(pistonR);
      cylinderLinersGroup.add(pistonR);

      // Flashes
      const flashL = new THREE.PointLight(0xff7700, 0.1, 1.2);
      flashL.position.set(xPos, 0, -0.85);
      cylinderFlashes.push(flashL);
      cylinderLinersGroup.add(flashL);

      const flashR = new THREE.PointLight(0xff7700, 0.1, 1.2);
      flashR.position.set(xPos + 0.06, 0, 0.85);
      cylinderFlashes.push(flashR);
      cylinderLinersGroup.add(flashR);
    }
    blockGroup.add(cylinderLinersGroup);

    // Left and Right Cylinder Heads (Mounted horizontally on flanks)
    const headL = makeCasing(new THREE.BoxGeometry(0.64, 0.42, 0.28), mats.casingBlack, 'left_opposed_head', 'Left Flat-4 DOHC Cylinder Head', 'Valvetrain');
    headL.position.set(0, 0, -0.92);
    headGroup.add(headL);

    const headR = makeCasing(new THREE.BoxGeometry(0.64, 0.42, 0.28), mats.casingBlack, 'right_opposed_head', 'Right Flat-4 DOHC Cylinder Head', 'Valvetrain');
    headR.position.set(0.06, 0, 0.92);
    headGroup.add(headR);

    // Low-slung exhaust collector below
    const exhaustCollector = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.85), mats.exhaustStainless);
    exhaustCollector.position.set(0, -0.42, 0);
    tag(exhaustCollector, 'exhaust_runners', 'Equal-Length Symmetrical Boxer Exhaust Manifold', 'Exhaust');
    exhaustGroup.add(exhaustCollector);

    // Flat oil pan
    const oilSump = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.55), mats.darkSteel || mats.matteBlack);
    oilSump.position.set(0, -0.58, 0);
    tag(oilSump, 'oil_sump', 'Flat Boxer Baffled Oil Sump', 'Lubrication');
    blockGroup.add(oilSump);
  }

  // -------------------------------------------------------------
  // 4. SINGLE-CYLINDER 4-STROKE (THUMPER)
  // -------------------------------------------------------------
  else if (layout === 'SINGLE' || engineId === 'single_4s') {
    // Crankcase unit with integrated transmission
    const crankcase = makeCasing(new THREE.BoxGeometry(0.55, 0.45, 0.48), mats.casingAluminum, 'unit_crankcase', 'Unit-Construction Motorcycle Crankcase', 'Cylinder Block');
    crankcase.position.set(0, -0.22, 0);
    blockGroup.add(crankcase);

    // Vertical Finned Cylinder Barrel
    const barrel = makeCasing(new THREE.CylinderGeometry(0.24, 0.24, 0.52, 24), mats.casingBlack, 'cylinder_barrel', 'Air-Cooled Finned Cylinder Barrel', 'Cylinder Block');
    barrel.position.set(0, 0.24, 0);
    blockGroup.add(barrel);

    // Horizontal cooling fins around barrel
    for (let f = 0.05; f <= 0.45; f += 0.08) {
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.015, 24), mats.matteBlack);
      fin.position.set(0, f, 0);
      blockGroup.add(fin);
    }

    // Ductile Iron liner inside barrel
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.50, 20, 1, true), mats.ductileIron);
    liner.position.set(0, 0.24, 0);
    cylinderLinersGroup.add(liner);

    // Single Piston
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.16, 20), mats.polishedAluminum);
    piston.position.set(0, 0.24, 0);
    piston.userData = { cylIndex: 0, baseY: 0.24 };
    internalPistons.push(piston);
    cylinderLinersGroup.add(piston);

    // Combustion flash light
    const flash = new THREE.PointLight(0xff7700, 0.1, 1.5);
    flash.position.set(0, 0.46, 0);
    cylinderFlashes.push(flash);
    cylinderLinersGroup.add(flash);

    blockGroup.add(cylinderLinersGroup);

    // Cylinder Head with Wide Cooling Fins & Spark Plug
    const finnedHead = makeCasing(new THREE.BoxGeometry(0.48, 0.32, 0.44), mats.casingBlack, 'cylinder_head_fins', 'Dual-Valve Hemispherical Finned Cylinder Head', 'Valvetrain');
    finnedHead.position.set(0, 0.65, 0);
    headGroup.add(finnedHead);

    const sparkPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), mats.chromeHardware);
    sparkPlug.position.set(0, 0.86, 0);
    headGroup.add(sparkPlug);

    // Organic Swept Single Exhaust Header Pipe
    const headerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.65, 0.24),
      new THREE.Vector3(0, 0.45, 0.42),
      new THREE.Vector3(0, -0.15, 0.48),
      new THREE.Vector3(0, -0.35, 0.75)
    ]);
    const headerPipe = new THREE.Mesh(new THREE.TubeGeometry(headerCurve, 20, 0.05, 12, false), mats.exhaustStainless);
    tag(headerPipe, 'exhaust_header', 'Single Hydroformed Tuned Exhaust Downpipe', 'Exhaust');
    exhaustGroup.add(headerPipe);
  }

  // -------------------------------------------------------------
  // 5. STANDARD INLINE ENGINES (I4 Petrol, I3 Turbo, I4 Diesel, I4 CNG, Hybrid Atkinson)
  // -------------------------------------------------------------
  else {
    const cylCount = numCylinders || 4;
    const blockLength = cylCount * 0.38 + 0.35;

    // Main Cylinder Block
    const blockMesh = makeCasing(new THREE.BoxGeometry(blockLength, 0.78, 0.68), mats.casingAluminum, 'block', 'Precision Die-Cast Cylinder Block', 'Cylinder Block');
    blockMesh.position.set(0, 0.04, 0);
    blockGroup.add(blockMesh);

    // Front horizontal rigid coolant distribution hard-line spanning across block
    const coolantLineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-blockLength * 0.42, 0.08, -0.37),
      new THREE.Vector3(0, 0.06, -0.38),
      new THREE.Vector3(blockLength * 0.42, 0.10, -0.36)
    ]);
    const coolantLine = new THREE.Mesh(new THREE.TubeGeometry(coolantLineCurve, 24, 0.032, 12, false), mats.chromeHardware);
    tag(coolantLine, 'coolant_hard_line', 'Coolant Distribution Hard-Line', 'Cooling System');
    blockGroup.add(coolantLine);

    // Thermostat housing neck
    const thermostatHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16), mats.castAluminum);
    thermostatHousing.rotateZ(Math.PI / 2);
    thermostatHousing.position.set(-blockLength * 0.46, 0.32, -0.25);
    tag(thermostatHousing, 'thermostat_housing', 'Thermostat Neck & ECT Sensor Bung', 'Cooling System');
    blockGroup.add(thermostatHousing);

    // Spin-on oil filter
    const filterBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.28, 20), mats.matteBlack);
    filterBody.rotateZ(Math.PI / 4);
    filterBody.position.set(-blockLength * 0.25, -0.22, -0.38);
    tag(filterBody, 'oil_filter', 'Full-Flow Spin-on Synthetic Oil Filter', 'Lubrication');
    blockGroup.add(filterBody);

    const oilSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.10, 6), mats.sensorBrass);
    oilSensor.position.set(-blockLength * 0.05, -0.18, -0.37);
    tag(oilSensor, 'oil_pressure_sensor', 'Piezoresistive Oil Pressure Transducer', 'Lubrication');
    blockGroup.add(oilSensor);

    // Ductile Iron Cylinder Liners & Pistons
    for (let i = 0; i < cylCount; i++) {
      const xPos = -((cylCount - 1) * 0.36) / 2 + i * 0.36;

      const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.74, 20, 1, true), mats.ductileIron);
      liner.position.set(xPos, 0.08, 0);
      cylinderLinersGroup.add(liner);

      const pistonGroup = new THREE.Group();
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.18, 20), mats.polishedAluminum);
      crown.castShadow = true;
      pistonGroup.add(crown);

      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.18, 12), mats.chromeHardware);
      pin.rotateX(Math.PI / 2);
      pin.position.y = -0.04;
      pistonGroup.add(pin);

      pistonGroup.position.set(xPos, 0.12, 0);
      pistonGroup.userData = { cylIndex: i, baseY: 0.12 };
      internalPistons.push(pistonGroup);
      cylinderLinersGroup.add(pistonGroup);

      const flashLight = new THREE.PointLight(0xff7700, 0.1, 1.2);
      flashLight.position.set(xPos, 0.42, 0);
      cylinderFlashes.push(flashLight);
      cylinderLinersGroup.add(flashLight);
    }
    blockGroup.add(cylinderLinersGroup);

    // Cylinder Head & Valve Cover
    const headMesh = makeCasing(new THREE.BoxGeometry(blockLength, 0.32, 0.65), mats.casingAluminum, 'cylinder_head', 'Multi-Valve DOHC Cylinder Head', 'Valvetrain');
    headMesh.position.set(0, 0.58, 0);
    headGroup.add(headMesh);

    const valveCover = makeCasing(new THREE.BoxGeometry(blockLength * 0.96, 0.22, 0.58), mats.casingBlack, 'valve_cover', 'Composite Baffled Cam Cover', 'Valvetrain');
    valveCover.position.set(0, 0.82, 0);
    headGroup.add(valveCover);

    // Spark plug coil-on-plug units or Diesel Injectors
    for (let i = 0; i < cylCount; i++) {
      const xPos = -((cylCount - 1) * 0.36) / 2 + i * 0.36;
      const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 12), mats.matteBlack);
      coil.position.set(xPos, 0.94, 0);
      tag(coil, `coil_${i + 1}`, `Coil-on-Plug Ignition Pack #${i + 1}`, 'Ignition');
      headGroup.add(coil);
    }

    // Fuel Delivery Subsystem (Petrol Rail, Diesel Common-Rail, or CNG Gas Injectors)
    if (engineId === 'i4_diesel') {
      // High-Pressure Diesel Common Rail
      const railTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, blockLength * 0.85, 16), mats.chromeHardware);
      railTube.rotateZ(Math.PI / 2);
      railTube.position.set(0, 0.72, -0.32);
      tag(railTube, 'common_rail', 'Forged Steel 2000-Bar Common Fuel Rail', 'Fuel Injection');
      headGroup.add(railTube);
    } else if (engineId === 'i4_cng') {
      // CNG Gas Injectors & Fuel Rail
      const cngRail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, blockLength * 0.85, 16), mats.sensorBrass);
      cngRail.rotateZ(Math.PI / 2);
      cngRail.position.set(0, 0.72, -0.32);
      tag(cngRail, 'gas_injectors', 'Multi-Point Electronic CNG Gas Injector Rail', 'CNG Delivery');
      headGroup.add(cngRail);

      // Electronic CNG Pressure Regulator
      const regulator = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), mats.polishedAluminum);
      regulator.position.set(-blockLength * 0.48, 0.45, -0.30);
      tag(regulator, 'cng_regulator', '2-Stage High-Pressure CNG Gas Regulator', 'CNG Delivery');
      headGroup.add(regulator);
    } else {
      // Standard Petrol High-Pressure Fuel Rail
      const fuelRail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, blockLength * 0.85, 16), mats.sensorBrass);
      fuelRail.rotateZ(Math.PI / 2);
      fuelRail.position.set(0, 0.72, -0.32);
      tag(fuelRail, 'fuel_rail', 'Direct-Injection Stainless Fuel Rail', 'Fuel Delivery');
      headGroup.add(fuelRail);
    }

    // Intake Plenum Assembly (Rear -Z)
    const intakePlenum = makeCasing(new THREE.BoxGeometry(blockLength * 0.82, 0.28, 0.32), mats.casingBlack, 'intake_plenum', 'Composite Air Induction Plenum', 'Air Induction');
    intakePlenum.position.set(0, 0.58, -0.48);
    headGroup.add(intakePlenum);

    // Exhaust System (Manifold, Turbocharger, DPF)
    if (engineType.features.hasTurbo || engineId === 'i4_diesel' || engineId === 'i3_turbo') {
      // Turbocharger Turbine & Compressor Housing
      const turbineHousing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.09, 16, 24), mats.castIron || mats.darkSteel);
      turbineHousing.position.set(0.12, 0.18, 0.58);
      tag(turbineHousing, engineId === 'i4_diesel' ? 'vgt_turbo' : 'turbocharger', 'Variable-Geometry / Twin-Scroll Turbocharger', 'Forced Induction');
      exhaustGroup.add(turbineHousing);

      const compressorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 20), mats.polishedAluminum);
      compressorHousing.rotateZ(Math.PI / 2);
      compressorHousing.position.set(-0.08, 0.18, 0.58);
      exhaustGroup.add(compressorHousing);

      if (engineId === 'i4_diesel') {
        // DPF Canister
        const dpf = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.65, 24), mats.exhaustStainless);
        dpf.position.set(0.42, -0.22, 0.65);
        tag(dpf, 'dpf_canister', 'Wall-Flow Monolith Diesel Particulate Filter (DPF)', 'Exhaust Aftertreatment');
        exhaustGroup.add(dpf);

        // EGR Valve
        const egr = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.18), mats.castAluminum);
        egr.position.set(-0.35, 0.45, 0.45);
        tag(egr, 'egr_valve', 'Pneumatic / Solenoid EGR Valve Body', 'Emissions Control');
        exhaustGroup.add(egr);
      }
    } else {
      // Naturally Aspirated 4-into-1 Organic Runners
      for (let r = 0; r < cylCount; r++) {
        const xPos = -((cylCount - 1) * 0.36) / 2 + r * 0.36;
        const runnerCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xPos, 0.54, 0.32),
          new THREE.Vector3(xPos * 0.7, 0.32, 0.55),
          new THREE.Vector3(0, 0.10, 0.68)
        ]);
        const runner = new THREE.Mesh(new THREE.TubeGeometry(runnerCurve, 16, 0.038, 12, false), mats.exhaustStainless);
        tag(runner, `exhaust_runner_${r + 1}`, `Tuned Mandrel Exhaust Runner #${r + 1}`, 'Exhaust');
        exhaustGroup.add(runner);
      }

      // Close-coupled catalytic converter
      const cat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.42, 20), mats.exhaustStainless);
      cat.position.set(0, -0.20, 0.72);
      tag(cat, 'catalytic_converter', 'Close-Coupled Ceramic Monolith Three-Way Catalyst', 'Exhaust Aftertreatment');
      exhaustGroup.add(cat);
    }

    // Oil pan underneath block
    const oilPan = new THREE.Mesh(new THREE.BoxGeometry(blockLength * 0.88, 0.25, 0.55), mats.darkSteel || mats.matteBlack);
    oilPan.position.set(0, -0.48, 0);
    tag(oilPan, 'oil_pan', 'Deep-Draw Stamped Steel Oil Pan Sump', 'Lubrication');
    blockGroup.add(oilPan);

    // Hybrid: Add Electric Motor Generator module to Transaxle
    if (engineId === 'hybrid_atkinson') {
      const eMotorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.42, 24), mats.castAluminum);
      eMotorHousing.rotateZ(Math.PI / 2);
      eMotorHousing.position.set(blockLength * 0.55 + 0.22, 0.05, 0);
      tag(eMotorHousing, 'transaxle_motor', '53 kW Permanent Magnet Traction Motor (MG2)', 'Hybrid Transaxle');
      transaxleGroup.add(eMotorHousing);

      const inverterBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.45), mats.matteBlack);
      inverterBox.position.set(blockLength * 0.50, 0.65, 0);
      tag(inverterBox, 'inverter_module', 'Hybrid Power Control Unit (PCU) & Boost Converter', 'Power Electronics');
      transaxleGroup.add(inverterBox);
    }
  }

  // -------------------------------------------------------------
  // ACCESSORY SERPENTINE DRIVE & FRONT PULLEYS
  // -------------------------------------------------------------
  if (layout !== 'BEV') {
    const crankPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24), mats.darkSteel || mats.matteBlack);
    crankPulley.rotateZ(Math.PI / 2);
    crankPulley.position.set(-0.85, -0.20, 0);
    accessoryGroup.add(crankPulley);
    pulleys.push(crankPulley);

    const altPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.06, 20), mats.chromeHardware);
    altPulley.rotateZ(Math.PI / 2);
    altPulley.position.set(-0.85, 0.25, -0.22);
    accessoryGroup.add(altPulley);
    pulleys.push(altPulley);

    const waterPumpPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20), mats.polishedAluminum);
    waterPumpPulley.rotateZ(Math.PI / 2);
    waterPumpPulley.position.set(-0.85, 0.15, 0.20);
    accessoryGroup.add(waterPumpPulley);
    pulleys.push(waterPumpPulley);
  }

  // Add all primary groups to root
  root.add(blockGroup);
  root.add(headGroup);
  root.add(exhaustGroup);
  root.add(transaxleGroup);
  root.add(accessoryGroup);

  return {
    rootGroup: root,
    groups: {
      blockGroup,
      headGroup,
      exhaustGroup,
      transaxleGroup,
      accessoryGroup,
      pulleys,
      cylinderFlashes,
      internalPistons,
      cylinderLinersGroup,
      casingMeshes,
      motorRotorGroup
    },
    /**
     * Kinematics update loop called every frame in animate()
     */
    updateKinematics: (simTime, rpm, activeFiringCylinder) => {
      const normRpm = Math.max(0, rpm || 1200);

      // 1. Pulley rotation
      if (pulleys.length > 0) {
        const rotSpeed = simTime * (normRpm / 180);
        pulleys.forEach((p, idx) => {
          p.rotation.x = rotSpeed * (idx % 2 === 0 ? 1 : 1.35);
        });
      }

      // 2. BEV Rotor rotation
      if (motorRotorGroup) {
        motorRotorGroup.rotation.x = simTime * (normRpm / 60) * Math.PI * 2;
      }

      // 3. Piston reciprocating kinematics
      if (internalPistons.length > 0) {
        const crankAngle = simTime * (normRpm / 60) * Math.PI * 2;
        const throwAngles = engineType.crankThrowAnglesDeg || [];

        internalPistons.forEach((piston) => {
          const { cylIndex = 0, baseY = 0.12, baseZ = 0, axis, side } = piston.userData;
          const throwDeg = throwAngles[cylIndex] !== undefined ? throwAngles[cylIndex] : (cylIndex % 2 === 0 ? 0 : 180);
          const phaseRad = (throwDeg * Math.PI) / 180;

          if (axis === 'horizontal') {
            // Flat boxer engine: moves along Z axis
            piston.position.z = baseZ + side * Math.cos(crankAngle + phaseRad) * 0.16;
          } else {
            // Standard vertical or angled V-cylinder
            piston.position.y = baseY + Math.cos(crankAngle + phaseRad) * 0.16;
          }
        });
      }

      // 4. Cylinder flash / electromagnetic pulses
      if (cylinderFlashes.length > 0) {
        const activeCyl = activeFiringCylinder || 1;
        cylinderFlashes.forEach((light, idx) => {
          const isFiring = (idx + 1) === activeCyl;
          light.intensity = normRpm > 10 ? (isFiring ? 3.5 : (Math.sin(simTime * 12 + idx) * 0.1 + 0.15)) : 0.05;
        });
      }
    }
  };
}
