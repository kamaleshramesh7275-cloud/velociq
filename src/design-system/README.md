# VelocIQ "Showroom Precision" Design System (v2 Light Automotive Theme)

The **Showroom Precision** design language transforms VelocIQ into an automotive digital showroom crossed with a precision engineering workbench: bright, clean, neat, and trustworthy, with every visual cue tied directly to cars, driving, and engines.

---

## 1. The 90/10 Light Theme Rule

* **Dominant Light Surface (~90%)**: Page background (`#F4F6F9`), cards (`#FFFFFF`), nested modules (`#EBEEF3`), panel gaps (`#DDE2EA`), forms, maps, tables.
* **Controlled Dark Surface (Max 10%)**: Strictly reserved for:
  1. The **Instrument Cluster** hero on `/dashboard` (styled like a real car dashboard behind a chrome bezel).
  2. The **3D Engine Digital Twin Viewport** (studio-lit dark stage).
  3. The **Sidebar brand header** and small status chips.

---

## 2. Color Tokens

| Token | Hex / Value | Automotive Role |
| :--- | :--- | :--- |
| `--bg-base` | `#F4F6F9` | Pearl-white showroom floor, page background |
| `--bg-surface` | `#FFFFFF` | Cards, polished white paint |
| `--bg-sunken` | `#EBEEF3` | Inputs, table stripes, nested panels |
| `--line` | `#DDE2EA` | Body panel seams, 1px gaps |
| `--text-hi` | `#0F172A` | Primary telemetry, gauges, headings |
| `--text-mid` | `#475569` | Secondary labels, descriptions |
| `--text-lo` | `#8492A6` | Units, dormant captions, timestamps |
| `--brand-blue` | `#0B3D91` | Primary deep racing blue. Headings, active nav, primary buttons |
| `--brand-red` | `#D7263D` | Signal / brake-light red. Critical alerts, racing stripe, drag redline |
| `--accent-green` | `#0F9D6B` | British-racing / eco green. Sweet-spot efficiency, healthy wear |
| `--accent-amber` | `#F2A900` | Amber dashboard warning light. Caution / maintenance warning |
| `--accent-sky` | `#1E88E5` | Live telemetry stream, planned GPS routes, links |
| `--cluster-bg` | `#0A0F1C` | Instrument cluster & 3D stage ONLY (the 10% dark) |

---

## 3. Typography Rules

* **Headings / Badges**: `Rajdhani` / `Barlow Semi Condensed` (600, 700), automotive sign face.
* **Body / Interface**: `Inter` (400, 500) for legibility.
* **Telemetry & Numeric**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` to eliminate jitter during 300ms real-time telemetry updates.

---

## 4. Automotive Design Motifs

1. **Racing Stripe**: 3px dual-line stripe (Blue `#0B3D91` + Red `#D7263D`) under header and on active navigation items.
2. **Speedometer Geometry**: `AnalogDial` uses real dial geometry (270° sweep, radial major/minor ticks, tapered needle with metallic hub cap).
3. **License-Plate Badges**: `PlateBadge` renders vehicle registration with blue country strip and embossed mono characters.
4. **Dashboard Warning-Light Icons**: Custom inline SVGs for Check Engine MIL, Oil Can, 12V Battery, Coolant, Brake System, TPMS, ABS, and Fuel.
5. **Gear-Shift Selector**: `GearSelector` styled as a P-R-N-D gated shifter for mode switching (Eco, Cruise, Rush).
6. **Vehicle Silhouettes**: `CarSilhouette` with top-view and side-view vector outlines for Sedan, SUV, Hatchback, and Truck.
7. **Chequered-Flag Divider**: Section end-markers on landing and trip summary.

---

## 5. UI Component Library (`src/components/ui/`)

* `Card`: Clean white card with body-panel seams and optional racing stripe.
* `SectionLabel`: Uppercase automotive tracking label with live status dots.
* `KpiTile`: Metric card with tabular figures, units, and green/red delta chips.
* `AnalogDial`: 270° sweep dual analog gauges for Speed, RPM, and Driver Score.
* `RadialGauge`: 360° wear percentage ring.
* `PlateBadge`: Authentic vehicle license plate component.
* `WarningLight`: Real instrument cluster warning light with active glow.
* `GearSelector`: P-R-N-D gated mode selector.
* `CarSilhouette`: Vector silhouettes in top and side perspectives.
* `RacingStripe`: 3px racing blue & brake red dual-stripe.
* `Slider` & `Toggle`: Automotive precision slider and rocker toggle.
* `Modal` & `Drawer`: Light dialogs and side diagnostic alert drawers.
* `CommandPalette`: Global `Ctrl+K` searchable launcher.
* `DataTable`: Striped telemetry tables with mono alignment.
