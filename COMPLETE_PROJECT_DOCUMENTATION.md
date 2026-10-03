# VelocIQ Precision Telematics & Autonomous Fleet Intelligence
## Complete Technical, Architectural, and Operational Documentation
*Document Version: 1.0.0 Production Release*  
*Project Repository: `velociq`*  
*Target Environment: Enterprise Connected Vehicle Telematics & Intelligent Fleet Operations*

---

## 1. Executive Summary & Core Mission

**VelocIQ** is an enterprise-grade connected vehicle telematics and intelligent fleet management platform engineered to solve the fundamental physical contradiction of modern road logistics: **the non-linear penalty of speed on fuel and energy economy**.

At highway speeds, power required to displace air scales cubically with velocity ($P_{\text{drag}} \propto v^3$), while aggressive stop-and-go driving perpetually dissipates kinetic energy into waste friction heat ($E_k = \frac{1}{2}mv^2$).

VelocIQ resolves this challenge through a multi-tier cyber-physical architecture:
1. **High-Frequency ECU Telemetry Engine**: Sub-second ($300\text{ ms}$) multi-sensor simulation loop correlating Speed, RPM, MAF, and Coolant Temperature.
2. **Speed-to-Mileage Physics Engine**: Continuous mathematical modeling of aerodynamic drag, parabolic fuel curves, and kinetic braking tax accounting.
3. **GLOSA (Green Light Optimal Speed Advisory)**: V2X traffic light synchronization that computes dynamic velocity windows to pass through green signals without braking.
4. **Living Multi-Asset Digital Twin**: 90-day multi-variate operational baselines, behavioral drift metrics, and a 6-stage self-learning closed loop (Sense $\to$ Model $\to$ Diagnose $\to$ Prescribe $\to$ Actuate $\to$ Verify).
5. **3D Interactive WebGL Engine Twin**: Three.js mechanical simulation of a 4-cylinder engine block with kinematic slider-crank linkages, dynamic thermal gradient shaders, dynamometer power sweeps, and Mean-Value Engine Model (MVEM) Fault Detection and Isolation (FDI).
6. **Autonomous AI Agents & ML Subsystems**: On-device neural network tuning for driver classification, predictive failure forecasting, and autonomous cruise throttle rate-limiting.
7. **Zero-Key Real-Road Geospatial Engine**: Real-road expressway tracking, turn-by-turn HUD, tile provider switching (Esri Dark Canvas, OSM, Esri Satellite, TomTom), and multi-vehicle garage management.

---

## 2. Technology Stack & System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  React 18.3  │  React Router v7  │  Tailwind CSS 3.4  │  Custom Glass  │
├────────────────────────────────────────────────────────────────────────┤
│                       VISUALIZATION & 3D LAYER                         │
│  Three.js r186 (WebGL)  │  Recharts 2.14  │  Leaflet 1.9 & React-Leaflet│
├────────────────────────────────────────────────────────────────────────┤
│                    PHYSICS & INTELLIGENCE RUNTIME                      │
│  speedMileagePhysics.js │ engineTwinPhysics.js │ digitalTwinEngine.js  │
│  enginePhysicsFDI.js    │ osrmRouting.js       │ AI Model Tuner Loop   │
├────────────────────────────────────────────────────────────────────────┤
│                       STATE & CONTEXT MANAGEMENT                       │
│  SimulationContext.jsx  │ FleetContext.jsx     │ LocalStorage / SPIFFS │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Technologies Catalog:

| Category | Technology | Version | Operational Role & Implementation |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | `^18.3.1` | Concurrent mode, hooks-based functional component architecture, 300ms state updates. |
| **DOM Engine** | React DOM | `^18.3.1` | High-frequency virtual DOM reconciliation synchronized with telemetry ticks. |
| **Routing Engine** | React Router DOM | `^7.18.1` | Client-side routing across 10 operational modules with protected authentication guard. |
| **Build Tooling** | Vite | `^5.4.10` | Ultra-fast Hot Module Replacement (HMR) and optimized ES module bundling. |
| **3D Rendering Engine** | Three.js | `^0.186.1` | WebGL cylinder block, rotating crankshaft, reciprocating pistons, and vertex thermal shaders. |
| **Geospatial Cartography**| Leaflet | `^1.9.4` | High-performance interactive map canvas, custom rotating SVG vehicle markers, and geofence polygons. |
| **Map React Bridge** | React-Leaflet | `^4.2.1` | Declarative React components for map tiles, polylines, tooltips, and map events. |
| **Data Visualization** | Recharts | `^2.14.0` | Responsive SVG charts (parabolic speed-mileage curves, dyno torque/power, loss curves). |
| **Animation Engine** | Framer Motion | `^13.4.6` | Smooth UI transitions, drawer slides, accordion expansions, and notification toasts. |
| **Styling** | Tailwind CSS | `^3.4.13` | Utility-first responsive design, dark glassmorphism tokens, and custom keyframes. |
| **CSS Preprocessor** | PostCSS & Autoprefixer| `^8.4.7` / `^10.4.20` | CSS parsing, browser vendor prefixing, and custom Leaflet layer overrides. |
| **Cloud Integration** | Firebase | `^12.18.0` | Telematics cloud synchronization and persistent fleet telemetry database hooks. |

---

## 3. Mathematical & Physical Formulations

### 3.1 Aerodynamic Drag Force & Cubic Power Dissipation
Aerodynamic resistance represents over 50% of total vehicle highway resistance above $80\text{ km/h}$:

$$F_d = \frac{1}{2} \cdot \rho \cdot C_d \cdot A \cdot v^2$$

$$P_d = F_d \cdot v = \frac{1}{2} \cdot \rho \cdot C_d \cdot A \cdot v^3$$

* $\rho = 1.225\text{ kg/m}^3$ (Dry air density at sea level, dynamically adjusted for temperature).
* $C_d$ = Drag coefficient (Sedan: `0.28`, SUV: `0.38`, Hatchback: `0.32`).
* $A$ = Frontal cross-sectional area (Sedan: $2.15\text{ m}^2$, SUV: $2.85\text{ m}^2$, Hatchback: $2.05\text{ m}^2$).
* $v$ = Relative air velocity in $\text{m/s}$ factoring in headwind vectors.

**The Cubic Implication**: Accelerating from $90\text{ km/h}$ ($25\text{ m/s}$) to $120\text{ km/h}$ ($33.33\text{ m/s}$) increases aerodynamic power dissipation by:

$$\left(\frac{120}{90}\right)^3 = 1.333^3 \approx 2.37 \times \text{ power (+137%)}$$

---

### 3.2 Speed vs. Mileage Parabolic Curve
Vehicle thermal and volumetric efficiency peaks in mid-range gears at moderate engine load ($55 - 65\text{ km/h}$). VelocIQ calculates continuous fuel economy $M(v)$ in $\text{km/L}$ via a multi-variable polynomial:

$$M(v) = M_{\text{peak}} \cdot \left[1 - \alpha \left(\frac{v - v_{\text{sweet}}}{v_{\text{sweet}}}\right)^2\right] - \beta \left(\frac{v}{100}\right)^3 - \gamma_{\text{load}}$$

---

### 3.3 Kinetic Braking Energy Loss & Stop-and-Go Tax
Every mechanical braking event converts momentum into waste friction heat across brake rotors:

$$\Delta E_k = \frac{1}{2} m \left(v_{\text{initial}}^2 - v_{\text{final}}^2\right)$$

$$\text{Fuel Wasted (Liters)} = \frac{\Delta E_k}{\text{Gasoline Energy Density (34,200 kJ/L)} \times \eta_{\text{thermal}} (0.28)}$$

A single harsh stop from $80\text{ km/h}$ to $0\text{ km/h}$ in a $1,400\text{ kg}$ sedan dissipates **$345.7\text{ kJ}$**, wasting $\approx 0.0361\text{ Liters}$ ($₹3.43$) per stop.

---

### 3.4 GLOSA (Green Light Optimal Speed Advisory)
Given an upcoming V2X traffic light at distance $D$ (meters) with remaining phase duration $T_{\text{rem}}$ (seconds):
* If light is GREEN: $v_{\text{target}} = \frac{D}{T_{\text{rem}}}$. Coasting at $v_{\text{target}}$ ensures intersection clearance prior to amber phase.
* If light is RED: $v_{\text{target}} = \frac{D}{T_{\text{rem}} + 2.0\text{s}}$. Vehicle arrives exactly upon green light transition, preserving 100% of kinetic momentum.

---

### 3.5 Thermodynamic Mean-Value Engine Model (MVEM) & Air Leak FDI
Plenum pressure dynamics are modeled in `src/utils/enginePhysicsFDI.js`:

$$\dot{P}_m = \frac{R \cdot T_m}{V_m} \cdot \left(\dot{m}_{\text{throttle}} + \dot{m}_{\text{leak}} - \dot{m}_{\text{cyl}}\right)$$

The Fault Detection and Isolation (FDI) engine classifies leak locations:
* **Intake Manifold Gasket Blowout**: Unmetered air downstream of throttle; causes extreme lean condition ($P_m > 45\text{ kPa}$), triggers DTC `P0171` and `P0106`.
* **Throttle Coupler Boot Tear**: Air enters downstream of MAF but upstream of throttle plate; triggers `P0101` and `P2187`.
* **Exhaust Header Flange Crack**: Pre-catalyst exhaust leak creating false lean readings at O2 sensor (`P0131`, `P2270`).
* **Downpipe Flex Breach**: Post-manifold leak; compromises catalytic backpressure.

---

### 3.6 Kinematic Piston & Crankshaft Mechanics
Cylinder slider-crank kinematics in Three.js WebGL:

$$x(\theta) = r \cdot (1 - \cos\theta) + l \cdot \left(1 - \sqrt{1 - \lambda^2 \sin^2\theta}\right)$$

$$v(\theta) = r \cdot \omega \cdot \left(\sin\theta + \frac{\lambda \sin 2\theta}{2 \sqrt{1 - \lambda^2 \sin^2\theta}}\right)$$

---

## 4. Comprehensive Operational Module Catalog

1. **Module 1: Live Telemetry & Aerodynamics (`/dashboard`)**: Dual circular high-refresh SVG gauges (Speed & RPM), live parabolic speed-mileage radar, instantaneous aerodynamic drag calculation, OBD-II DTC diagnostic scanner, and BLE connection resilience.
2. **Module 2: GPS Expressway Navigation & GLOSA (`/navigation`)**: Real-road navigation across the 25 km Delhi Fleet Corridor (Connaught Place to IGI Airport Cargo Terminal). Features rotating directional vehicle glyphs, turn-by-turn HUD, 4-tier tile provider switcher, GLOSA intersection speed countdowns, Limp-Home Range Governor, Open-Meteo live weather, and persistent trip log replay.
3. **Module 3: Speed-to-Mileage What-If Lab (`/simulator`)**: Dedicated physics experimentation workbench. Adjust cruising speed, vehicle profile, payload weight (kg), headwind/tailwind vector (km/h), ambient temperature (°C), fuel price, and stop frequency. Visualizes dual-axis Recharts curves (Mileage vs. Range) and saves Scenarios A, B, and C for side-by-side evaluation.
4. **Module 4: 3D Interactive WebGL Engine Twin & FDI (`/engine-twin`)**: Three.js mechanical simulation of a 4-cylinder engine block. Piston kinematics synchronized with vehicle RPM. Features CAD exploded factor slider (0.0 to 1.0), dynamic thermal shaders (70°C to 105°C+), dynamometer power sweep curves, live cylinder pressure oscilloscopes, and simulated intake/exhaust vacuum leak fault injection.
5. **Module 5: Predictive Maintenance & Wear Runway (`/maintenance`)**: Real-time degradation tracking for Engine Oil, Brake Pads, Starter Battery, and Cooling System. Features AI Remaining Useful Life (RUL) countdowns (days and km remaining) and one-click technician service resets.
6. **Module 6: Fleet Garage & Multi-Asset Tracking (`/fleet`)**: Regional multi-vehicle map canvas tracking all assets across Delhi NCR simultaneously. Vector status pins (Active emerald pulse, Idle amber, Maintenance ruby). Roster management with driver dispatch assignment and one-click telematics monitoring switcher.
7. **Module 7: Driver Safety Score & Kinetic Waste Log (`/safety`)**: Algorithmic safety score (0–100) with dynamic penalties for harsh braking (-3.5 pts), rapid acceleration (-2.5 pts), speeding (-0.8 pts), and overrev (-0.5 pts). Logs kinetic energy dissipated in kJ per incident and delivers AI coaching feedback.
8. **Module 8: Threat Defense & Remote Immobilizer (`/security`)**: Autonomous threat radar (Secure, Elevated, Critical, Alert), fuel siphoning detection, CAN bus dropout alarm, municipal geofence boundary sentry, and remote dispatcher engine immobilizer kill-switch.
9. **Module 9: Living Digital Twin & Self-Learning Optimizer (`/digital-twin`)**: 90-day operational baselines, multi-variate drift metrics, AI Driver Twin behavioral modeling (jerk index, throttle ramp aggressiveness), 3-pillar optimization radar (Safety, Efficiency, Health), and 6-stage closed loop self-learning cycle (Sense $\to$ Model $\to$ Diagnose $\to$ Prescribe $\to$ Actuate $\to$ Verify).
10. **Module 10: AI Analytics & 3-Tier Financial Matrix (`/analytics`)**: Side-by-side financial comparison between Eco (70 km/h), Cruise (95 km/h), and Rush (120 km/h) accounting for driver Value of Time ($/hr). Includes interactive neural network hyperparameter model tuner (learning rates, epochs) with live training loss vs. validation curves.

---

## 5. Geospatial Architecture & Zero-Key Map Engine

VelocIQ operates a multi-layer geospatial engine built on Leaflet 1.9.4 and React-Leaflet 4.2.1, completely independent of commercial map API keys or vendor watermarks:

| Provider Key | Provider Name | Key Required | Watermark | Role |
| :--- | :--- | :--- | :--- | :--- |
| `esri_dark` | **Esri Dark Canvas** | **None** | **None** | **Default Telematics Theme**; dark slate background with crisp highway text. |
| `osm` | **OpenStreetMap** | **None** | **None** | Civic open standard; high road and street-level detail. |
| `esri_satellite`| **Esri Satellite** | **None** | **None** | Photorealistic aerial imagery for terrain and depot inspection. |
| `tomtom` | **TomTom Traffic** | Optional Free Key| **None** | Live highway congestion color overlay. |

---

## 6. Design System & Strict Zero-Emoji Policy

1. **Strict Zero-Emoji Policy**:
   * Emojis suffer from platform fragmentation (iOS vs. Android vs. Windows display differently) and lack corporate aesthetic dignity.
   * **100% of icons in VelocIQ are bespoke inline vector SVGs** created in `src/components/icons/index.jsx`.
   * High-contrast vector glyphs scale infinitely, support CSS color inheritance (`currentColor`), and ensure identical rendering across every client device.
2. **Precision Dark Glassmorphic Tokens**:
   * Base background: Deep navy-slate (`#020617` / `bg-slate-950`).
   * Glass panels: `bg-slate-900/80` with `backdrop-blur-md`.
   * Accent color system: Cyan (`#06b6d4`), Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`).

---

## 7. Data Models & Telemetry Schema

```typescript
interface TelemetryPacket {
  speed: number;             // Vehicle speed in km/h (0 - 180)
  rpm: number;               // Engine RPM (800 - 6500)
  coolant: number;           // Coolant temperature in °C (60 - 115)
  maf: number;               // Mass Air Flow sensor in g/s (2.0 - 45.0)
  fuel: number;              // Fuel tank level percentage (0 - 100%)
  tripMileage: number;       // Cumulative trip fuel economy in km/L
  co2: number;               // Cumulative CO2 emitted in kg
  score: number;             // Driver safety score (0 - 100)
  voltage: number;           // 12V Battery electrical potential (11.8 - 14.4V)
  events: Array<{            // Dynamic driving event history
    label: string;
    delta: number;
    timestamp?: string;
  }>;
  partsWear: {               // Health percentage remaining
    oil: number;             // Engine oil (0 - 100%)
    brakes: number;          // Brake pads (0 - 100%)
    battery: number;         // Starter battery (0 - 100%)
    coolant: number;         // Cooling system (0 - 100%)
  };
  predictedFailureDays: {    // Days until service required
    oil: number;
    brakes: number;
    battery: number;
    coolant: number;
  };
  route: {
    progress: number;        // Percentage completed (0 - 100%)
    lat: number;             // Current latitude
    lon: number;             // Current longitude
    heading: number;         // Compass heading in degrees (0 - 360)
    etaMinutes: number;      // Dynamic arrival estimate
  };
}
```

---

## 8. Development, Installation & Verification Guide

### Quick Start:
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
# Default port: http://localhost:3005

# 3. Production build
npm run build
```

### Verification Checklist:
* [x] **Live Gauges**: Dynamic Speed & RPM needle sweeps in `/dashboard`.
* [x] **Expressway Navigation**: Vehicle moves along Delhi route with turn-by-turn HUD in `/navigation`.
* [x] **What-If Simulator**: Sliders update dual-axis Recharts curves in `/simulator`.
* [x] **3D WebGL Engine Twin**: Piston kinematics synchronize with RPM and explode cleanly in `/engine-twin`.
* [x] **Fleet Garage**: Multi-vehicle map pins render and switch telemetry in `/fleet`.
* [x] **Living Digital Twin**: 6-stage self-learning cycle executes seamlessly in `/digital-twin`.

---
*Authorized by VelocIQ Engineering & System Architecture Team.*
