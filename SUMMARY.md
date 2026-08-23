# VelocIQ Dashboard: Implementation Summary

This document summarizes the complete implementation of the **VelocIQ Smart Speed & Fuel Management System** dashboard, including Phase 3 AI Model Tuning.

---

## 1. System Architecture

All dashboard components are interlinked and synchronized via a centralized state-driven simulation engine implemented in `src/App.jsx`.

```
                  ┌──────────────────────┐
                  │       App.jsx        │
                  │ (Central Simulation) │
                  └──────────┬───────────┘
         ┌───────────────────┼───────────────────┬──────────────────┐
         ▼                   ▼                   ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ ┌─────────────────┐
│ Telemetry Panel │ │ Fuel Mileage    │ │ Route Tracker  │ │ Diagnostics     │
│ (Live Gauges)   │ │ & Cost Savings  │ │ (Live GPS/ETA) │ │ (OBD DTC Scan)  │
└─────────────────┘ └─────────────────┘ └────────────────┘ └─────────────────┘
         ▲                   ▲                   ▲                  ▲
         └───────────────────┼───────────────────┼──────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Driver Score   │
                    │   & AI Coach    │
                    └─────────────────┘
                             ▲
                             │
                    ┌────────┴────────┐
                    │  AI Model Hub   │
                    │ (Tuning/Agent)  │
                    └─────────────────┘
```

---

## 2. Integrated Features & Components

### 🛰️ Central Simulation Loop (`App.jsx`)
* Runs a high-performance simulation every 300ms.
* Simulates physical vehicle characteristics (RPM matches speed, MAF correlates to RPM, coolant temperature responds to engine load).
* Monitors speeding violations and incident events (harsh brakes, overrevs, idling).
* Deducts driver score dynamically on incident triggers and appends event records.
* Integrates **AI Agent Cruise Optimizer** constraints (smoothens speed changes and reduces fuel flow rates by 15%).

### 🧠 AI Model Training & Tuning Panel (`AIModelTuner.jsx`)
* **Tuning Deck:** Customize hyperparameters (learning rate, training epochs, model type) for *Driving Classifier*, *Breakdown Predictor*, or *Fuel Optimizer* models.
* **Epoch-by-Epoch Loss Curves:** Run simulated training and plot real-time Recharts line graphs mapping training loss vs. validation accuracy.
* **Hyperparameter Physics:** Hyperparameters have a direct effect on the outcome (high learning rates cause loss to explode, low epochs result in underfitting).
* **Autonomous Toggles:** Control AI agent throttle optimization and cruise profiles.

### 📶 Simulation Control Panel (`SimulationSettings.jsx`)
* **BLE Stream Connection:** Toggles active hardware sync. When disconnected, telemetry freezes, status bar alerts "BLE Offline", and SPIFFS buffers records offline. When reconnected, data buffers sync back to the cloud.
* **Vehicle Profiles:** Toggle between **Sports Sedan**, **Eco Hatchback**, and **Heavy SUV** to change fuel burn ratios, RPM ranges, and MAF baselines.

### 🗺️ Live GPS Navigation (`RouteTracker.jsx`)
* Increments active Latitude and Longitude coordinates based on vehicle speed.
* Updates trip progress percentage towards a 25 km destination.
* Computes destination ETA in minutes dynamically based on transit speed (freezes when stationary).

### 💰 Fuel Cost & Savings Calculator (`CostSavingsCalculator.jsx`)
* Accepts custom fuel price input (e.g. ₹95/L).
* Calculates money spent on fuel for the active trip.
* Details actual money saved due to the 12.4% AI coach eco-driving efficiency and additional +15% AI Agent throttle optimizations.

### 📋 Odometer & Trip Logger (`TripLogger.jsx`)
* Displays current trip odometer, duration, average speed, and total fuel burned.
* **"End Current Trip"** action packages active stats and logs them into a persistent historical trip table (persisted via `localStorage`), resetting current trip counters to zero.

### 🔧 Parts Wear & Maintenance Tracker (`MaintenanceTracker.jsx`)
* Monitors health index for **Engine Oil**, **Brake Pads**, **Battery Health**, and **Coolant Fluid**.
* Wear rates scale with driving style (e.g. hard braking events immediately wear brake pad integrity by 1.5%).
* Renders active AI forecast confidence scores when models are trained.

### 🩺 OBD-II Fault Scanner (`ECUDiagnostics.jsx`)
* Simulated diagnostic scanner that queries check engine logs.
* Retrieves standard trouble codes:
  * `P0300`: Random/Multiple Cylinder Misfire
  * `P0171`: System Too Lean (Bank 1)
* **Clear Codes:** Clears OBD fault records, which turns off the status bar check engine MIL warnings.
* **Simulate Misfire:** Manual trigger to inject fault codes to test diagnostic warning feeds.

---

## 3. Code Modifications Index

| Component | File Path | Description |
| :--- | :--- | :--- |
| **Main Core** | [`App.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/App.jsx) | Orchestrates telemetry, configs, models, and route/parts state. |
| **Status Bar** | [`StatusBar.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/StatusBar.jsx) | Renders BLE offline counts and MIL Check Engine warnings. |
| **Live Gauges** | [`TelemetryPanel.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/TelemetryPanel.jsx) | Handles speeding flags, and BLE connection freeze screens. |
| **Fuel Economy** | [`FuelMileageCard.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/FuelMileageCard.jsx) | Computes km/L based on MAF and speed formulas. |
| **Driver Score** | [`DriverScore.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/DriverScore.jsx) | Renders driving scores and dynamic event penalty deltas. |
| **Diagnostics** | [`ECUDiagnostics.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/ECUDiagnostics.jsx) | Simulates querying DTC codes and resetting trouble logs. |
| **Settings Panel**| [`SimulationSettings.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/SimulationSettings.jsx) | Configures BLE toggles, profiles, and speed thresholds. |
| **AI Assistant** | [`AICoachingPanel.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/AICoachingPanel.jsx) | Generates gear-shifting, speeding, and model accuracy advice. |
| **Trip Odometer** | [`TripLogger.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/TripLogger.jsx) | Tracks active odometer counters and lists history tables. |
| **Parts Wear** | [`MaintenanceTracker.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/MaintenanceTracker.jsx) | Logs wear status of brakes, oil, coolant, battery and displays AI confidence. |
| **GPS Route** | [`RouteTracker.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/RouteTracker.jsx) | Tracks coordinates shifting and dynamic ETA countdowns. |
| **Calculator** | [`CostSavingsCalculator.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/CostSavingsCalculator.jsx) | Calculates total fuel costs and active AI Agent savings. |
| **Model Tuner** | [`AIModelTuner.jsx`](file:///c:/Users/KAVYA/OneDrive/Desktop/velociq/src/components/AIModelTuner.jsx) | Configures and runs simulated machine learning model training loops. |
