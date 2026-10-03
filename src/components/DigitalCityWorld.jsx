import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { onControlPacket, sendFeedback } from '../services/telemetryBridge';
import { useFleet } from '../context/FleetContext';
import { VEHICLE_PHYSICS_PROFILES } from '../utils/speedMileagePhysics';

// ─── Constants & Physics ───────────────────────────────────────────────────
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225; // kg/m³
const TICK = 1 / 60; // 60 FPS physics tick

// ─── Procedural High-Res Asphalt Texture ────────────────────────────────────
function createAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Dark asphalt base
  ctx.fillStyle = '#181b24';
  ctx.fillRect(0, 0, 1024, 1024);

  // Road aggregate grain noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Double solid yellow center divider
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(502, 0);
  ctx.lineTo(502, 1024);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(522, 0);
  ctx.lineTo(522, 1024);
  ctx.stroke();

  // White outer shoulder boundary lines
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(60, 1024);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(964, 0);
  ctx.lineTo(964, 1024);
  ctx.stroke();

  // Dashed lane lines on each side
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 6;
  ctx.setLineDash([60, 40]);
  ctx.beginPath();
  ctx.moveTo(280, 0);
  ctx.lineTo(280, 1024);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(744, 0);
  ctx.lineTo(744, 1024);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  return texture;
}

// ─── Procedural Building Window Texture ─────────────────────────────────────
function createBuildingTexture(baseColorHex, glowHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 256, 512);

  // Grid of lit and unlit office windows
  const rows = 24;
  const cols = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() > 0.4;
      ctx.fillStyle = isLit ? glowHex : '#111827';
      ctx.fillRect(c * 30 + 10, r * 20 + 8, 18, 12);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// ─── Living City Environment Builder ────────────────────────────────────────
function buildPhotorealisticCity(scene) {
  const blocks = [];
  const streetLights = [];
  const trafficLights = [];

  // Ground terrain (dark city tarmac surround)
  const groundGeo = new THREE.PlaneGeometry(1200, 1200, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0D1117,
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const asphaltTex = createAsphaltTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.65,
    metalness: 0.2,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Road grid & Sidewalks (80 unit spacing)
  const ROAD_WIDTH = 22;
  for (let i = -4; i <= 4; i++) {
    // East-West Road
    const ewRoad = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.08, ROAD_WIDTH), roadMat);
    ewRoad.position.set(0, 0.04, i * 85);
    ewRoad.receiveShadow = true;
    scene.add(ewRoad);

    // North-South Road
    const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH, 0.08, 1200), roadMat);
    nsRoad.position.set(i * 85, 0.04, 0);
    nsRoad.receiveShadow = true;
    scene.add(nsRoad);

    // Sidewalk curbs alongside roads
    const ewCurbNorth = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.2, 3), sidewalkMat);
    ewCurbNorth.position.set(0, 0.1, i * 85 + (ROAD_WIDTH / 2 + 1.5));
    scene.add(ewCurbNorth);

    const ewCurbSouth = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.2, 3), sidewalkMat);
    ewCurbSouth.position.set(0, 0.1, i * 85 - (ROAD_WIDTH / 2 + 1.5));
    scene.add(ewCurbSouth);

    // Modern Double-Arm Streetlamps
    for (let sign of [-1, 1]) {
      const lampGroup = new THREE.Group();
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 8, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.3 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4;
      lampGroup.add(pole);

      // Arm & Lamp Head
      const armGeo = new THREE.BoxGeometry(3, 0.15, 0.2);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 7.9, 0);
      lampGroup.add(arm);

      const lampHeadMat = new THREE.MeshStandardMaterial({
        color: 0xFFFBEB,
        emissive: 0xFDE047,
        emissiveIntensity: 1.5,
      });
      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), lampHeadMat);
      lampHead.position.set(1.2, 7.7, 0);
      lampGroup.add(lampHead);

      // Real point light
      const pLight = new THREE.PointLight(0xFFFBEB, 1.8, 28, 1.5);
      pLight.position.set(1.2, 7.4, 0);
      lampGroup.add(pLight);
      streetLights.push(pLight);

      lampGroup.position.set(i * 85 + sign * 14, 0, sign * 14);
      scene.add(lampGroup);
    }
  }

  // 4-Way Traffic Light Intersections
  const trafficLightMats = [];
  [-85, 85].forEach(tx => {
    [-85, 85].forEach(tz => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 7, 8),
        new THREE.MeshStandardMaterial({ color: 0x0F172A })
      );
      pole.position.set(tx + 12, 3.5, tz + 12);
      scene.add(pole);

      const housing = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 2.2, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1E293B })
      );
      housing.position.set(tx + 12, 6, tz + 12);
      scene.add(housing);

      // Lenses (Red, Yellow, Green)
      const rMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
      const yMat = new THREE.MeshBasicMaterial({ color: 0x221100 });
      const gMat = new THREE.MeshBasicMaterial({ color: 0x002200 });

      const rLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), rMat);
      rLens.position.set(tx + 12, 6.7, tz + 12.32);
      scene.add(rLens);

      const yLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), yMat);
      yLens.position.set(tx + 12, 6.0, tz + 12.32);
      scene.add(yLens);

      const gLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), gMat);
      gLens.position.set(tx + 12, 5.3, tz + 12.32);
      scene.add(gLens);

      trafficLightMats.push({ rMat, yMat, gMat });
    });
  });

  // Modern Skyscrapers with Window Textures & Reflective Glass
  const winTexBlue = createBuildingTexture('#0F172A', '#60A5FA');
  const winTexGold = createBuildingTexture('#1E1B4B', '#FDE047');
  const winTexCyan = createBuildingTexture('#042F2E', '#2DD4BF');

  const buildingMats = [
    new THREE.MeshPhysicalMaterial({ map: winTexBlue, roughness: 0.2, metalness: 0.8, clearcoat: 0.8 }),
    new THREE.MeshPhysicalMaterial({ map: winTexGold, roughness: 0.25, metalness: 0.7, clearcoat: 0.9 }),
    new THREE.MeshPhysicalMaterial({ map: winTexCyan, roughness: 0.15, metalness: 0.9, clearcoat: 1.0 }),
    new THREE.MeshPhysicalMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.85, clearcoat: 0.5 }),
  ];

  for (let bx = -4; bx <= 4; bx++) {
    for (let bz = -4; bz <= 4; bz++) {
      if (Math.abs(bx) === 0 && Math.abs(bz) === 0) continue; // Keep center plaza open
      const offsets = [
        [bx * 85 - 28, bz * 85 - 28],
        [bx * 85 + 28, bz * 85 - 28],
        [bx * 85 - 28, bz * 85 + 28],
        [bx * 85 + 28, bz * 85 + 28],
      ];

      offsets.forEach(([x, z], idx) => {
        const w = 18 + Math.random() * 16;
        const h = 25 + Math.random() * 110;
        const d = 18 + Math.random() * 16;
        const mat = buildingMats[(bx + bz + idx + 20) % buildingMats.length];

        const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        building.position.set(x, h / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        blocks.push(building);

        // Rooftop Antennas & Helipads for tall towers
        if (h > 70) {
          const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.3, 14, 6),
            new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xFF0000, emissiveIntensity: 1.0 })
          );
          antenna.position.set(x, h + 7, z);
          scene.add(antenna);
        }
      });
    }
  }

  // Trees along Sidewalks
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 3, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451A03 });
  const foliageGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

  for (let i = -3; i <= 3; i++) {
    [-1, 1].forEach(sign => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 3.6;
      foliage.castShadow = true;
      treeGroup.add(foliage);

      treeGroup.position.set(i * 85 + 16 * sign, 0, sign * 26);
      scene.add(treeGroup);
    });
  }

  // Overhead Speed Radar Gantry
  const gantryGroup = new THREE.Group();
  const gantryBar = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_WIDTH + 4, 0.8, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8 })
  );
  gantryBar.position.y = 8;
  gantryGroup.add(gantryBar);

  const gantryDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.8, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x00FF66 })
  );
  gantryDisplay.position.set(0, 8, 0.6);
  gantryGroup.add(gantryDisplay);

  [-ROAD_WIDTH / 2 - 1, ROAD_WIDTH / 2 + 1].forEach(gx => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    leg.position.set(gx, 4, 0);
    gantryGroup.add(leg);
  });

  gantryGroup.position.set(0, 0, 160);
  scene.add(gantryGroup);

  return { blocks, streetLights, trafficLightMats, roadMat };
}

// ─── Hyper-Realistic Vehicle Builder with PBR & Glow ────────────────────────
function buildPhotorealisticCar(scene) {
  const carRoot = new THREE.Group();
  const carChassis = new THREE.Group(); // Nested for pitch and roll physics
  carRoot.add(carChassis);

  // 1. High-Performance Metallic Car Paint Material
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: 0x1D4ED8, // Deep Performance Sapphire Blue
    metalness: 0.9,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
  });

  // Carbon Fiber Splitter / Aero Trim Material
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.8,
  });

  // Dark Tinted Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0F172A,
    transmission: 0.85,
    opacity: 0.8,
    transparent: true,
    roughness: 0.05,
    metalness: 0.1,
  });

  // Main Aerodynamic Body Mesh
  const bodyGeo = new THREE.BoxGeometry(2.1, 0.65, 4.5);
  const body = new THREE.Mesh(bodyGeo, paintMat);
  body.position.y = 0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  carChassis.add(body);

  // Sleek Cabin Cockpit Greenhouse
  const cabinGeo = new THREE.BoxGeometry(1.7, 0.55, 2.3);
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.05, -0.2);
  cabin.castShadow = true;
  carChassis.add(cabin);

  // Front Carbon Aero Splitter
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.6), carbonMat);
  splitter.position.set(0, 0.28, 2.3);
  carChassis.add(splitter);

  // Rear Carbon Diffuser & Quad Exhaust Tips
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 0.5), carbonMat);
  diffuser.position.set(0, 0.32, -2.3);
  carChassis.add(diffuser);

  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.1 });
  [-0.6, -0.45, 0.45, 0.6].forEach(ex => {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12), exhaustMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(ex, 0.32, -2.55);
    carChassis.add(tip);
  });

  // Rear Aerodynamic Spoiler Wing
  const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.35), carbonMat);
  wingBlade.position.set(0, 1.25, -2.1);
  carChassis.add(wingBlade);

  [-0.6, 0.6].forEach(wx => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.15), carbonMat);
    stand.position.set(wx, 1.08, -2.1);
    carChassis.add(stand);
  });

  // 2. High-Fidelity Wheels with Calipers & Thermal Glow
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.2 });
  const discMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.95, roughness: 0.15 });

  // Dynamic Thermal Caliper Materials (emissive updates with brake temps)
  const caliperMats = [
    new THREE.MeshStandardMaterial({ color: 0xDC2626, emissive: 0x000000, emissiveIntensity: 0 }), // FL
    new THREE.MeshStandardMaterial({ color: 0xDC2626, emissive: 0x000000, emissiveIntensity: 0 }), // FR
    new THREE.MeshStandardMaterial({ color: 0xDC2626, emissive: 0x000000, emissiveIntensity: 0 }), // RL
    new THREE.MeshStandardMaterial({ color: 0xDC2626, emissive: 0x000000, emissiveIntensity: 0 }), // RR
  ];

  const wheelPositions = [
    [-1.05, 0.35, 1.45],  // FL
    [1.05, 0.35, 1.45],   // FR
    [-1.05, 0.35, -1.45], // RL
    [1.05, 0.35, -1.45],  // RR
  ];

  const wheels = [];
  wheelPositions.forEach(([wx, wy, wz], i) => {
    const wheelHub = new THREE.Group();

    // Tire Cylinder
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelHub.add(tire);

    // Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.29, 16), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelHub.add(rim);

    // Ventilated Brake Rotor Disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.04, 16), discMat);
    disc.rotation.z = Math.PI / 2;
    wheelHub.add(disc);

    // High-Performance Caliper
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.18), caliperMats[i]);
    caliper.position.set(wx > 0 ? -0.1 : 0.1, 0.12, 0.08);
    wheelHub.add(caliper);

    wheelHub.position.set(wx, wy, wz);
    carRoot.add(wheelHub);
    wheels.push(wheelHub);
  });

  // 3. Projector Dual Headlights (SpotLights casting real beams)
  const headlightL = new THREE.SpotLight(0xF8FAFC, 4.5, 45, Math.PI / 6, 0.4, 1.2);
  headlightL.position.set(-0.75, 0.6, 2.3);
  const targetL = new THREE.Object3D();
  targetL.position.set(-0.75, 0, 30);
  carRoot.add(targetL);
  headlightL.target = targetL;
  carRoot.add(headlightL);

  const headlightR = new THREE.SpotLight(0xF8FAFC, 4.5, 45, Math.PI / 6, 0.4, 1.2);
  headlightR.position.set(0.75, 0.6, 2.3);
  const targetR = new THREE.Object3D();
  targetR.position.set(0.75, 0, 30);
  carRoot.add(targetR);
  headlightR.target = targetR;
  carRoot.add(headlightR);

  // Headlight Lenses (Emissive)
  const headlightLensMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });
  [-0.75, 0.75].forEach(lx => {
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.05), headlightLensMat);
    lens.position.set(lx, 0.6, 2.26);
    carChassis.add(lens);
  });

  // Dynamic Taillights & Brake Lights
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x991B1B,
    emissive: 0xDC2626,
    emissiveIntensity: 1.2,
  });
  [-0.75, 0.75].forEach(lx => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.05), tailMat);
    tail.position.set(lx, 0.65, -2.26);
    carChassis.add(tail);
  });

  // Turn Signal Blinkers
  const turnSignalMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const turnL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.05), turnSignalMat);
  turnL.position.set(-0.95, 0.6, 2.27);
  carChassis.add(turnL);

  const turnR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.05), turnSignalMat);
  turnR.position.set(0.95, 0.6, 2.27);
  carChassis.add(turnR);

  scene.add(carRoot);
  return {
    root: carRoot,
    chassis: carChassis,
    wheels,
    caliperMats,
    headlightL,
    headlightR,
    tailMat,
    turnSignalMat,
  };
}

// ─── Rain Particle System ───────────────────────────────────────────────────
function buildRainParticles(scene) {
  const RAIN_COUNT = 1800;
  const rainGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(RAIN_COUNT * 3);

  for (let i = 0; i < RAIN_COUNT * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = Math.random() * 60;
    positions[i + 2] = (Math.random() - 0.5) * 200;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: 0x93C5FD,
    size: 0.35,
    transparent: true,
    opacity: 0.75,
  });

  const rainPoints = new THREE.Points(rainGeo, rainMat);
  rainPoints.visible = false;
  scene.add(rainPoints);

  return { rainPoints, positions, rainGeo };
}

// ─── Autonomous AI Traffic Vehicles ─────────────────────────────────────────
function buildTrafficNPC(scene, x, z, dir = 1) {
  const npc = new THREE.Group();
  const colors = [0x059669, 0xD97706, 0x4F46E5, 0xDC2626, 0x0284C7, 0x475569];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 4.0), bodyMat);
  body.position.y = 0.55;
  npc.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1 })
  );
  cabin.position.set(0, 1.05, -0.2);
  npc.add(cabin);

  // NPC Headlights & Taillights
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xFFFFEE }));
  head.position.set(-0.6, 0.55, 2.02);
  npc.add(head);

  const head2 = head.clone();
  head2.position.set(0.6, 0.55, 2.02);
  npc.add(head2);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xEF4444 }));
  tail.position.set(-0.6, 0.55, -2.02);
  npc.add(tail);

  const tail2 = tail.clone();
  tail2.position.set(0.6, 0.55, -2.02);
  npc.add(tail2);

  npc.position.set(x, 0, z);
  if (dir < 0) npc.rotation.y = Math.PI;
  scene.add(npc);

  return { mesh: npc, dir, speed: 10 + Math.random() * 8, laneZ: z };
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function DigitalCityWorld({ onTelemetry, activeSource = 'digital-twin' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    engineOn: false,
    throttle: 0,
    brake: 0,
    steer: 0,
    gear: 'P',
    driveMode: 'SPORT',
    regenLevel: 1,
    handbrake: false,
    escOn: true,
    absOn: true,
    lightMode: 'AUTO',
    activeFaults: [],
  });

  const vehicleRef = useRef({
    speed: 0,          // km/h
    velX: 0, velZ: 0, // m/s
    posX: 0, posY: 0, posZ: 0,
    rotY: 0,           // radians
    rpm: 800,
    coolant: 85,
    oilTemp: 90,
    fuelL: 50,
    brakeTempFL: 45, brakeTempFR: 45, brakeTempRL: 45, brakeTempRR: 45,
    tireTempFL: 35, tireTempFR: 35, tireTempRL: 35, tireTempRR: 35,
    latG: 0, longG: 0,
    gear: 1,
  });

  const frameRef = useRef(0);
  const lastTelemetryRef = useRef(0);
  const [cameraMode, setCameraMode] = useState('chase'); // chase|cockpit|bumper|drone
  const [worldTime, setWorldTime] = useState('day');     // day|sunset|night
  const [weather, setWeather] = useState('clear');       // clear|rain|fog
  const [stats, setStats] = useState({ speed: 0, rpm: 800, gear: 'P', latG: '0.00', fuelL: '50.0' });

  const { activeVehicle } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';
  const physProfile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // ── 1. WebGL Renderer with ACES Filmic Tone Mapping ─────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0xB0D8F0, 0.004);

    // ── 2. Camera Setup ─────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(65, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, -16);

    // ── 3. Lighting System ──────────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x0F172A, 0.7);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xFFFBEB, 1.8);
    sun.position.set(120, 180, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    // ── 4. Build Environment & Vehicle ──────────────────────────────────────
    const city = buildPhotorealisticCity(scene);
    const car = buildPhotorealisticCar(scene);
    const rain = buildRainParticles(scene);

    // ── 5. Autonomous AI Traffic Fleet ──────────────────────────────────────
    const npcs = [];
    const lanes = [-6, -2, 2, 6];
    lanes.forEach(laneZ => {
      for (let k = 0; k < 3; k++) {
        const startX = -350 + Math.random() * 700;
        const dir = laneZ > 0 ? 1 : -1;
        npcs.push(buildTrafficNPC(scene, startX, laneZ * 5, dir));
      }
    });

    // ── 6. Keyboard Controls & Listeners ────────────────────────────────────
    const keys = {};
    const handleKey = (e) => { keys[e.code] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    const unsubControl = onControlPacket((cmd) => {
      Object.assign(stateRef.current, cmd);
    });

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);

    // ── 7. Dynamic Weather & Lighting Adjuster ──────────────────────────────
    function applyAtmosphere() {
      if (worldTime === 'night') {
        scene.background = new THREE.Color(0x050811);
        scene.fog.color = new THREE.Color(0x050811);
        sun.intensity = 0.15;
        sun.color = new THREE.Color(0x38BDF8);
        hemiLight.intensity = 0.2;
        city.streetLights.forEach(sl => { sl.intensity = 2.4; });
        car.headlightL.intensity = 5.5;
        car.headlightR.intensity = 5.5;
      } else if (worldTime === 'sunset') {
        scene.background = new THREE.Color(0xEA580C);
        scene.fog.color = new THREE.Color(0xC2410C);
        sun.intensity = 1.4;
        sun.color = new THREE.Color(0xFB923C);
        hemiLight.intensity = 0.5;
        city.streetLights.forEach(sl => { sl.intensity = 1.0; });
        car.headlightL.intensity = 3.5;
        car.headlightR.intensity = 3.5;
      } else {
        // Day
        scene.background = new THREE.Color(0x7DD3FC);
        scene.fog.color = new THREE.Color(0xBAE6FD);
        sun.intensity = 1.8;
        sun.color = new THREE.Color(0xFFFBEB);
        hemiLight.intensity = 0.8;
        city.streetLights.forEach(sl => { sl.intensity = 0.0; });
        car.headlightL.intensity = 1.5;
        car.headlightR.intensity = 1.5;
      }

      if (weather === 'rain') {
        rain.rainPoints.visible = true;
        scene.fog.density = 0.008;
        city.roadMat.roughness = 0.15; // Wet shiny asphalt
        city.roadMat.metalness = 0.4;
      } else if (weather === 'fog') {
        rain.rainPoints.visible = false;
        scene.fog.density = 0.022;
        city.roadMat.roughness = 0.65;
      } else {
        rain.rainPoints.visible = false;
        scene.fog.density = 0.003;
        city.roadMat.roughness = 0.65;
      }
    }

    applyAtmosphere();

    // ── 8. Physics & Animation Engine ───────────────────────────────────────
    let rafId;
    let prevTime = performance.now();
    let trafficLightTimer = 0;
    let trafficPhase = 0; // 0=Green, 1=Yellow, 2=Red

    function physicsStep(dt) {
      const s = stateRef.current;
      const v = vehicleRef.current;

      // Desktop Keyboard Hotkeys
      if (keys['KeyW'] || keys['ArrowUp']) s.throttle = Math.min(1, s.throttle + 0.06);
      else if (!keys['KeyW'] && !keys['ArrowUp']) s.throttle = Math.max(0, s.throttle - 0.10);

      if (keys['KeyS'] || keys['ArrowDown']) s.brake = Math.min(1, s.brake + 0.12);
      else s.brake = Math.max(0, s.brake - 0.15);

      if (keys['KeyA'] || keys['ArrowLeft']) s.steer = Math.max(-1, s.steer - 0.07);
      else if (keys['KeyD'] || keys['ArrowRight']) s.steer = Math.min(1, s.steer + 0.07);
      else s.steer *= 0.82;

      if (keys['Space']) s.handbrake = true;
      else s.handbrake = false;

      if (keys['KeyE']) s.engineOn = true;
      if (keys['KeyP']) s.gear = 'P';
      if (keys['KeyR']) s.gear = 'R';
      if (keys['KeyN']) s.gear = 'N';
      if (keys['Digit1'] || keys['KeyD']) s.gear = 'D';

      if (!s.engineOn) {
        v.rpm = Math.max(0, v.rpm - 80);
        v.speed *= 0.98;
        return;
      }

      // Drive Mode Multipliers
      const driveModeMult = { ECO: 0.7, COMFORT: 0.9, SPORT: 1.15, TRACK: 1.35, DRIFT: 1.25 }[s.driveMode] || 1;
      const gearActive = ['D', 'S'].includes(s.gear) || s.gear?.startsWith('M');
      const reverse = s.gear === 'R';

      if (s.gear === 'P' || s.gear === 'N') {
        v.rpm = Math.max(800, v.rpm * 0.92);
        v.speed *= 0.97;
        v.longG = 0;
        v.latG = 0;
        return;
      }

      // Physics Calculation
      const mass = physProfile.massKg || 1450;
      const Cd = physProfile.Cd || 0.28;
      const A = physProfile.frontalAreaM2 || 2.2;
      const maxPowerW = (physProfile.maxPowerKw || 140) * 1000;

      const vMs = v.speed / 3.6;
      const driveForce = gearActive ? (s.throttle * maxPowerW * driveModeMult) / Math.max(1.2, vMs) : 0;
      const dragForce = 0.5 * AIR_DENSITY * Cd * A * vMs * vMs;

      let brakeForce = s.brake * mass * GRAVITY * 1.1;
      if (s.handbrake) brakeForce = mass * GRAVITY * 1.8;

      const direction = reverse ? -1 : 1;
      const netForce = direction * driveForce - dragForce - brakeForce;
      const accel = netForce / mass;

      const newVMs = Math.max(-10, Math.min(65, vMs + accel * dt));
      v.speed = newVMs * 3.6;

      // Realistic Steering & Yaw Rate
      const steerAngle = s.steer * 0.42 * (1 - Math.min(0.65, vMs / 70));
      const wheelbase = 2.75;
      const yawRate = vMs > 0.4 ? (vMs * Math.tan(steerAngle)) / wheelbase : 0;
      const effectiveYawRate = s.escOn ? yawRate * 0.88 : yawRate;

      v.rotY += effectiveYawRate * dt;
      v.posX += Math.sin(v.rotY) * newVMs * dt;
      v.posZ += Math.cos(v.rotY) * newVMs * dt;

      // Bound within digital twin world
      v.posX = Math.max(-420, Math.min(420, v.posX));
      v.posZ = Math.max(-420, Math.min(420, v.posZ));

      // Realistic RPM & Sound Synthesis
      const targetRpm = s.engineOn ? (850 + s.throttle * 6500 * driveModeMult * Math.min(1, vMs / 32)) : 0;
      v.rpm = v.rpm + (targetRpm - v.rpm) * 0.18;

      // Engine Coolant & Oil Thermals
      v.coolant += (v.rpm > 3500 ? 0.03 : -0.008) * dt * 60;
      v.coolant = Math.max(70, Math.min(112, v.coolant));
      v.oilTemp = v.coolant + (v.rpm / 8000) * 15;

      // Fuel / Energy Depletion
      const burnRate = (s.throttle * (physProfile.maxFuelConsumptionLPH || 16)) / 3600;
      v.fuelL = Math.max(0, v.fuelL - burnRate * dt);

      // Brake Rotor Thermal Friction Model ($Q = \mu \cdot F \cdot v$)
      const frictionHeat = (s.brake * 14 + Math.abs(s.steer) * 4) * Math.max(0.5, vMs / 10);
      const coolingRate = 0.15 + (vMs / 40) * 0.4; // Airflow cooling

      v.brakeTempFL = Math.min(480, Math.max(30, v.brakeTempFL + (frictionHeat * 6 - (v.brakeTempFL - 25) * coolingRate) * dt));
      v.brakeTempFR = Math.min(480, Math.max(30, v.brakeTempFR + (frictionHeat * 6 - (v.brakeTempFR - 25) * coolingRate) * dt));
      v.brakeTempRL = Math.min(480, Math.max(30, v.brakeTempRL + (frictionHeat * 4 - (v.brakeTempRL - 25) * coolingRate) * dt));
      v.brakeTempRR = Math.min(480, Math.max(30, v.brakeTempRR + (frictionHeat * 4 - (v.brakeTempRR - 25) * coolingRate) * dt));

      v.tireTempFL = 30 + (v.brakeTempFL / 480) * 65;
      v.tireTempFR = 30 + (v.brakeTempFR / 480) * 65;

      // 3-Axis G-Forces
      v.latG = (effectiveYawRate * vMs) / GRAVITY;
      v.longG = accel / GRAVITY;
    }

    function updateCarVisuals() {
      const v = vehicleRef.current;
      const s = stateRef.current;

      car.root.position.set(v.posX, 0, v.posZ);
      car.root.rotation.y = v.rotY;

      // Dynamic Chassis Suspension Pitch & Roll
      // Pitch: nose dips down on braking (-longG), squats rear on acceleration (+longG)
      const targetPitch = Math.max(-0.08, Math.min(0.06, -v.longG * 0.05));
      // Roll: car leans outward on sharp turns
      const targetRoll = Math.max(-0.10, Math.min(0.10, -v.latG * 0.06));

      car.chassis.rotation.x += (targetPitch - car.chassis.rotation.x) * 0.15;
      car.chassis.rotation.z += (targetRoll - car.chassis.rotation.z) * 0.15;

      // Wheel Spin & Steering Angle
      const rollDelta = (v.speed / 3.6) * TICK / 0.36;
      car.wheels.forEach((w, i) => {
        w.children[0].rotation.x += rollDelta;
        w.children[1].rotation.x += rollDelta;
        w.children[2].rotation.x += rollDelta;
        // Front Wheel Steer Pivot
        if (i < 2) w.rotation.y = s.steer * 0.42;
      });

      // Dynamic Brake Caliper Incandescent Thermal Glow
      car.caliperMats.forEach((mat, i) => {
        const temp = [v.brakeTempFL, v.brakeTempFR, v.brakeTempRL, v.brakeTempRR][i];
        if (temp > 240) {
          const glowIntensity = Math.min(3.5, (temp - 240) / 60);
          mat.emissive.setHex(0xFF3300);
          mat.emissiveIntensity = glowIntensity;
        } else {
          mat.emissiveIntensity = 0;
        }
      });

      // Dynamic Brake Lights (Bright neon red on brake)
      if (s.brake > 0.05 || s.handbrake) {
        car.tailMat.emissiveIntensity = 4.5;
        car.tailMat.color.setHex(0xFF0000);
      } else {
        car.tailMat.emissiveIntensity = 1.2;
        car.tailMat.color.setHex(0x991B1B);
      }

      // Turn Signals Blinking
      const isTurning = Math.abs(s.steer) > 0.25;
      if (isTurning && Math.floor(Date.now() / 400) % 2 === 0) {
        car.turnSignalMat.color.setHex(0xF59E0B);
      } else {
        car.turnSignalMat.color.setHex(0x000000);
      }
    }

    function updateRainVFX(dt) {
      if (weather !== 'rain') return;
      const v = vehicleRef.current;
      const p = rain.positions;
      for (let i = 1; i < p.length; i += 3) {
        p[i] -= 85 * dt;
        if (p[i] < 0) {
          p[i] = 60;
          p[i - 1] = v.posX + (Math.random() - 0.5) * 120;
          p[i + 1] = v.posZ + (Math.random() - 0.5) * 120;
        }
      }
      rain.rainGeo.attributes.position.needsUpdate = true;
    }

    function updateNPCs(dt) {
      npcs.forEach(npc => {
        npc.mesh.position.x += npc.dir * (npc.speed / 3.6) * dt * 10;
        if (npc.mesh.position.x > 400) npc.mesh.position.x = -400;
        if (npc.mesh.position.x < -400) npc.mesh.position.x = 400;
      });

      // Traffic Light State Machine
      trafficLightTimer += dt;
      if (trafficLightTimer > 6.0) {
        trafficLightTimer = 0;
        trafficPhase = (trafficPhase + 1) % 3;
        city.trafficLightMats.forEach(({ rMat, yMat, gMat }) => {
          if (trafficPhase === 0) {
            // Green
            gMat.color.setHex(0x00FF66);
            yMat.color.setHex(0x221100);
            rMat.color.setHex(0x220000);
          } else if (trafficPhase === 1) {
            // Yellow
            gMat.color.setHex(0x002200);
            yMat.color.setHex(0xFFCC00);
            rMat.color.setHex(0x220000);
          } else {
            // Red
            gMat.color.setHex(0x002200);
            yMat.color.setHex(0x221100);
            rMat.color.setHex(0xFF0000);
          }
        });
      }
    }

    function updateCamera(mode) {
      const v = vehicleRef.current;
      const lookAt = new THREE.Vector3(v.posX, 0.8, v.posZ);

      switch (mode) {
        case 'cockpit':
          camera.position.set(
            v.posX + Math.sin(v.rotY) * 0.6,
            1.25,
            v.posZ + Math.cos(v.rotY) * 0.6
          );
          camera.lookAt(
            v.posX + Math.sin(v.rotY) * 30,
            1.1,
            v.posZ + Math.cos(v.rotY) * 30
          );
          break;
        case 'bumper':
          camera.position.set(
            v.posX + Math.sin(v.rotY) * 2.3,
            0.65,
            v.posZ + Math.cos(v.rotY) * 2.3
          );
          camera.lookAt(
            v.posX + Math.sin(v.rotY) * 30,
            0.6,
            v.posZ + Math.cos(v.rotY) * 30
          );
          break;
        case 'drone':
          camera.position.set(v.posX, 55, v.posZ + 25);
          camera.lookAt(lookAt);
          break;
        case 'chase':
        default: {
          const chaseDist = 13 + (v.speed / 3.6) * 0.12;
          const tx = v.posX - Math.sin(v.rotY) * chaseDist;
          const tz = v.posZ - Math.cos(v.rotY) * chaseDist;
          camera.position.x += (tx - camera.position.x) * 0.12;
          camera.position.y += (6.5 - camera.position.y) * 0.12;
          camera.position.z += (tz - camera.position.z) * 0.12;
          camera.lookAt(lookAt);
          break;
        }
      }
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      physicsStep(dt);
      updateCarVisuals();
      updateRainVFX(dt);
      updateNPCs(dt);
      updateCamera(cameraMode);

      renderer.render(scene, camera);

      // Dispatch 60Hz/20Hz Real-World Authoritative Telemetry
      if (now - lastTelemetryRef.current > 50) {
        lastTelemetryRef.current = now;
        const v = vehicleRef.current;
        const s = stateRef.current;
        const tel = {
          speed: Math.max(0, v.speed),
          rpm: Math.round(v.rpm),
          coolant: Math.round(v.coolant),
          oilTemp: Math.round(v.oilTemp || 90),
          fuelL: v.fuelL,
          fuelPct: (v.fuelL / 50) * 100,
          latG: v.latG,
          longG: v.longG,
          brakeTempFL: Math.round(v.brakeTempFL),
          brakeTempFR: Math.round(v.brakeTempFR),
          brakeTempRL: Math.round(v.brakeTempRL),
          brakeTempRR: Math.round(v.brakeTempRR),
          tireTempFL: Math.round(v.tireTempFL),
          tireTempFR: Math.round(v.tireTempFR),
          gear: s.gear,
          driveMode: s.driveMode,
          posX: v.posX,
          posZ: v.posZ,
          rotY: v.rotY,
          throttle: s.throttle,
          brake: s.brake,
          steer: s.steer,
          isRealWorldLive: true,
        };

        onTelemetry?.(tel);
        sendFeedback({ speed: tel.speed, rpm: tel.rpm, coolant: tel.coolant, gear: tel.gear });
        setStats({
          speed: Math.round(tel.speed),
          rpm: Math.round(tel.rpm),
          gear: tel.gear,
          latG: Math.abs(tel.latG).toFixed(2),
          fuelL: tel.fuelL.toFixed(1),
        });
      }
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      unsubControl();
      renderer.dispose();
    };
  }, [vehicleProfile, worldTime, weather, cameraMode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 480, background: '#0A0E15' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
        tabIndex={0}
      />

      {/* ── Precision Telemetry HUD Overlay ──────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14, right: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {/* Speedometer */}
        <div style={{
          background: 'rgba(10,14,21,0.88)', border: '1px solid #00D4FF55',
          backdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 18px',
          boxShadow: '0 8px 32px rgba(0,212,255,0.15)',
        }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#00D4FF', lineHeight: 1, letterSpacing: -1 }}>
            {stats.speed}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2, letterSpacing: 1 }}>KM/H</div>
        </div>

        {/* Center: Tachometer + Gear */}
        <div style={{
          background: 'rgba(10,14,21,0.88)', border: '1px solid #1E293B',
          backdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 22px', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 26, fontWeight: 900,
            color: stats.rpm > 5800 ? '#EF4444' : '#F8FAFC', lineHeight: 1,
          }}>
            {stats.rpm}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', letterSpacing: 1 }}>RPM</div>
          <div style={{
            fontSize: 22, fontWeight: 900, color: '#F59E0B', marginTop: 4,
            textShadow: '0 0 12px rgba(245,158,11,0.4)',
          }}>
            {stats.gear}
          </div>
        </div>

        {/* Dynamics & Fuel */}
        <div style={{
          background: 'rgba(10,14,21,0.88)', border: '1px solid #1E293B',
          backdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 18px', textAlign: 'right',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>{stats.latG} G</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B' }}>LATERAL G</div>
          <div style={{
            fontSize: 13, fontWeight: 800,
            color: Number(stats.fuelL) < 8 ? '#EF4444' : '#10B981', marginTop: 4,
          }}>
            {stats.fuelL} L
          </div>
        </div>
      </div>

      {/* ── Top Bar Controls: Time & Weather & Camera ────────────────── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, pointerEvents: 'all',
      }}>
        {/* Time Mode */}
        {['day', 'sunset', 'night'].map(t => (
          <button
            key={t}
            onClick={() => setWorldTime(t)}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
              background: worldTime === t ? '#38BDF822' : 'rgba(15,23,42,0.8)',
              border: worldTime === t ? '1px solid #38BDF8' : '1px solid #334155',
              color: worldTime === t ? '#38BDF8' : '#94A3B8',
              cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all 0.15s',
            }}
          >
            {t === 'day' ? '☀ DAY' : t === 'sunset' ? '🌅 DUSK' : '🌙 NIGHT'}
          </button>
        ))}

        {/* Weather Mode */}
        {['clear', 'rain', 'fog'].map(w => (
          <button
            key={w}
            onClick={() => setWeather(w)}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
              background: weather === w ? '#F59E0B22' : 'rgba(15,23,42,0.8)',
              border: weather === w ? '1px solid #F59E0B' : '1px solid #334155',
              color: weather === w ? '#F59E0B' : '#94A3B8',
              cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all 0.15s',
            }}
          >
            {w === 'clear' ? '⛅ CLEAR' : w === 'rain' ? '🌧 RAIN' : '🌫 FOG'}
          </button>
        ))}
      </div>

      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, pointerEvents: 'all',
      }}>
        {['chase', 'cockpit', 'bumper', 'drone'].map(mode => (
          <button
            key={mode}
            onClick={() => setCameraMode(mode)}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
              background: cameraMode === mode ? '#00D4FF22' : 'rgba(15,23,42,0.8)',
              border: cameraMode === mode ? '1px solid #00D4FF' : '1px solid #334155',
              color: cameraMode === mode ? '#00D4FF' : '#94A3B8',
              cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all 0.15s',
            }}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Keyboard Control Ribbon ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(15,23,42,0.85)', border: '1px solid #334155',
        borderRadius: 10, padding: '5px 14px', fontSize: 10, color: '#94A3B8',
        pointerEvents: 'none', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        <span style={{ color: '#00D4FF', fontWeight: 800 }}>W/S</span> Throttle/Brake · <span style={{ color: '#00D4FF', fontWeight: 800 }}>A/D</span> Steer · <span style={{ color: '#F59E0B', fontWeight: 800 }}>SPACE</span> Handbrake · <span style={{ color: '#10B981', fontWeight: 800 }}>E</span> Engine · <span style={{ color: '#A855F7', fontWeight: 800 }}>P/R/N/D</span> Gears
      </div>
    </div>
  );
}
