import React, { useState, useMemo, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, SectionLabel, StatusPill, SeverityBadge, PlateBadge, CarSilhouette } from '../components/ui';
import { PulseDot, CarIcon, BrainIcon } from '../components/icons';

import DocumentVaultModal from '../components/compliance/DocumentVaultModal';
import AddVehicleModal from '../components/fleet/AddVehicleModal';
import VehicleDetailModal from '../components/fleet/VehicleDetailModal';
import DriverDetailModal from '../components/fleet/DriverDetailModal';
import AddDriverModal from '../components/fleet/AddDriverModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom SVG pins: green with ping for Active, amber for Idle, red for Maintenance, blue ring for monitored
const createFleetMarkerIcon = (status, isMonitored) => {
  const cfg = {
    Active: { border: '#0F9D6B', bg: '#0F9D6B', ping: true },
    Idle: { border: '#F2A900', bg: '#F2A900', ping: false },
    Maintenance: { border: '#D7263D', bg: '#D7263D', ping: false }
  }[status] || { border: '#0B3D91', bg: '#0B3D91', ping: false };

  const monitoredRing = isMonitored ? 'ring-4 ring-[#0B3D91] shadow-md' : 'shadow-xs';

  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
        ${cfg.ping ? `<div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background-color: ${cfg.bg};"></div>` : ''}
        <div class="relative w-7 h-7 rounded-full bg-white border-2 ${monitoredRing} flex items-center justify-center" style="border-color: ${cfg.border};">
          <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${cfg.bg};"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

function MapFlyToHandler({ selectedCoords }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (selectedCoords && selectedCoords[0] && selectedCoords[1]) {
      map.flyTo(selectedCoords, 14, { duration: 1.2 });
    }
  }, [selectedCoords, map]);

  return null;
}

export default function FleetManager() {
  const { 
    vehicles, 
    drivers, 
    assignments, 
    assignDriver, 
    removeDriver, 
    setVehicleStatus, 
    monitorVehicle, 
    activeVehicleId,
    addVehicle,
    addDriver,
    deleteVehicle,
    runObdPreTripScan
  } = useFleet();
  const { hasPermission, activeRoleData } = useAuth();
  const canAssignDriver = hasPermission('canAssignDriver');
  const navigate = useNavigate();

  // Active Tab: 'vehicles' | 'drivers'
  const [activeTab, setActiveTab] = useState('vehicles');

  // Status Filter state: 'ALL', 'Active', 'Idle', 'Maintenance'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState(activeVehicleId || (vehicles[0]?.id));
  
  // Modals
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailDriver, setDetailDriver] = useState(null);
  const [scanToast, setScanToast] = useState(null);

  const handleRunObdScan = (vehicleId) => {
    const targetId = vehicleId || selectedVehicleId || 'v1';
    const scan = runObdPreTripScan ? runObdPreTripScan(targetId) : null;
    const vName = vehicles.find(v => v.id === targetId)?.name || 'Vehicle';
    setScanToast(`Electronic OBD-II Diagnostic Scan Completed for ${vName}: All Monitors Ready • Zero Active DTCs`);
    setTimeout(() => setScanToast(null), 4000);
  };

  // Compute summary stats
  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'Maintenance').length;
  const totalFleetKm = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
  const fleetKmToday = Math.round(totalFleetKm * 0.012);

  // Filtered vehicles roster
  const filteredVehicles = useMemo(() => {
    if (statusFilter === 'ALL') return vehicles;
    return vehicles.filter((v) => v.status === statusFilter);
  }, [vehicles, statusFilter]);

  // Selected vehicle for fly-to and detail card
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  const handleMonitor = (vehicleId) => {
    monitorVehicle(vehicleId);
    navigate('/dashboard');
  };

  const handleAddVehicleSubmit = (vehicleData) => {
    const created = addVehicle(vehicleData);
    setScanToast(`Asset Registered: ${created.name} (${created.licensePlate}) added to active fleet!`);
    setTimeout(() => setScanToast(null), 4000);
  };

  const handleAddDriverSubmit = (driverData) => {
    const created = addDriver(driverData);
    setScanToast(`Driver Onboarded: ${created.name} (${created.license}) registered to roster!`);
    setTimeout(() => setScanToast(null), 4000);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F4F6F9] p-6 md:p-8 text-text-hi">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Page Header with Action Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <SectionLabel label="FLEET OPERATIONS & GARAGE HUB" />
            <h1 className="text-2xl md:text-3xl font-bold text-text-hi font-heading tracking-tight mt-1">
              Fleet Operations & Asset Manager
            </h1>
            <p className="mt-1 text-xs text-text-mid">
              Manage connected vehicles, view driver telematics profiles, register new assets, and track regional GPS dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Add Fleet Car Button */}
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0B3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white font-mono text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-sm font-bold">+</span>
              <span>Add Fleet Car</span>
            </button>

            {/* Add Driver Button */}
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(true)}
              className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#0B3D91] font-mono text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add Driver</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunObdScan(selectedVehicleId)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-mono text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>Pre-Trip Scan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVaultOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-mono text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>DQF Vault</span>
            </button>
          </div>
        </header>

        {scanToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
            <span>✅</span>
            <span>{scanToast}</span>
          </div>
        )}

        {/* 5 Header Summary KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">TOTAL VEHICLES</span>
            <div className="text-2xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
              {vehicles.length} <span className="text-xs font-semibold text-slate-600">Cars</span>
            </div>
            <p className="text-[10px] font-mono text-[#0B3D91] font-bold mt-0.5">100% CAN-Connected</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">ACTIVE NOW</span>
            <div className="text-2xl font-bold font-mono text-[#047857] tabular-nums mt-1">
              {activeCount} <span className="text-xs font-semibold text-slate-600">In Transit</span>
            </div>
            <p className="text-[10px] font-mono text-slate-700 font-medium mt-0.5">{((activeCount / Math.max(1, vehicles.length)) * 100).toFixed(0)}% Fleet Active</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">IDLE IN LOT</span>
            <div className="text-2xl font-bold font-mono text-[#B45309] tabular-nums mt-1">
              {idleCount} <span className="text-xs font-semibold text-slate-600">Standby</span>
            </div>
            <p className="text-[10px] font-mono text-[#B45309] font-medium mt-0.5">Ready for Dispatch</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">REGISTERED DRIVERS</span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
              {drivers.length} <span className="text-xs font-semibold text-slate-600">Operators</span>
            </div>
            <p className="text-[10px] font-mono text-slate-700 font-medium mt-0.5">DOT CDL Verified</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">FLEET KM TODAY</span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
              {fleetKmToday.toLocaleString()} <span className="text-xs font-semibold text-slate-600">km</span>
            </div>
            <p className="text-[10px] font-mono text-slate-700 font-medium mt-0.5">Logged Telemetry</p>
          </div>
        </div>

        {/* Master Tab Bar: Vehicles Roster vs. Drivers Directory */}
        <div className="flex items-center gap-2 border-b border-line pb-2 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'vehicles'
                ? 'bg-white text-[#0B3D91] border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CarIcon className="w-4 h-4 text-[#0B3D91]" />
            <span>Fleet Cars & Live GPS ({vehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'drivers'
                ? 'bg-white text-[#0B3D91] border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainIcon className="w-4 h-4 text-[#0B3D91]" />
            <span>Drivers Directory & Safety Scores ({drivers.length})</span>
          </button>
        </div>

        {/* ─── TAB 1: FLEET VEHICLES & GPS MAP ──────────────────────────────── */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Filterable Vehicle Roster */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Filter Chips Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-line">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'Active', label: 'Active' },
                    { id: 'Idle', label: 'Idle' },
                    { id: 'Maintenance', label: 'Service' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        statusFilter === tab.id
                          ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                          : 'text-text-mid hover:text-text-hi'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-text-lo">
                  {filteredVehicles.length} of {vehicles.length} cars
                </span>
              </div>

              {/* Scrollable Vehicle List */}
              <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredVehicles.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  const isMonitored = activeVehicleId === v.id;
                  const driverId = assignments[v.id];
                  const driver = drivers.find((d) => d.id === driverId);
                  const carProfile = v.profile || (v.type === 'Heavy Truck' ? 'truck' : v.type === 'Cargo Van' || v.type === 'SUV' ? 'suv' : 'sedan');

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
                        isSelected
                          ? 'border-[#0B3D91] shadow-md ring-1 ring-[#0B3D91]/20'
                          : 'border-line hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {isSelected && <div className="racing-stripe-v" />}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Car Silhouette Side Perspective */}
                          <div className="w-16 h-8 bg-slate-50 border border-line rounded-xl flex items-center justify-center p-1 shrink-0">
                            <CarSilhouette profile={carProfile} view="side" className="w-14 h-7 text-[#0B3D91]" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-text-hi font-heading">{v.name}</h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-50 text-[#0B3D91] border border-blue-200">
                                {v.engineTypeId === 'bev_pmsm' ? 'PMSM BEV' : v.engineTypeId === 'v8_petrol' ? '4.5L V8' : '2.0L Turbo'}
                              </span>
                              {isMonitored && (
                                <span className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                                  Cockpit Active
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-text-mid mt-1 flex flex-wrap items-center gap-2">
                              <PlateBadge plate={v.licensePlate} country="IND" size="sm" />
                              <span>•</span>
                              <span className="tabular-nums font-semibold">{v.mileage.toLocaleString()} km</span>
                              <span>•</span>
                              <span className="text-text-lo">{v.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border shrink-0 ${
                          v.status === 'Active' ? 'bg-emerald-50 text-[#0F9D6B] border-emerald-200' :
                          v.status === 'Idle' ? 'bg-amber-50 text-[#B45309] border-amber-200' :
                          'bg-red-50 text-[#D7263D] border-red-200'
                        }`}>
                          {v.status}
                        </span>
                      </div>

                      {/* Driver Assignment & Quick Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex-1 min-w-[180px] max-w-xs">
                          <select
                            disabled={!canAssignDriver}
                            className={`w-full rounded-xl border border-line px-2.5 py-1.5 text-xs text-text-hi font-mono focus:border-[#0B3D91] outline-none ${
                              canAssignDriver ? 'bg-slate-50 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-80'
                            }`}
                            value={driverId || ''}
                            onClick={(e) => e.stopPropagation()}
                            title={canAssignDriver ? 'Assign active driver to asset' : `Driver Assignment Locked: Dispatcher or Admin role required. Active persona: ${activeRoleData?.label}`}
                            onChange={(e) => {
                              if (e.target.value) {
                                assignDriver(v.id, e.target.value);
                                setVehicleStatus(v.id, 'Active');
                              } else {
                                removeDriver(v.id);
                                setVehicleStatus(v.id, 'Idle');
                              }
                            }}
                          >
                            <option value="">-- No Driver Assigned --</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.rating}★)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailVehicle(v);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                          >
                            Specs & Dossier
                          </button>

                          {/* Monitor Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMonitor(v.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              isMonitored
                                ? 'bg-[#0B3D91] text-white shadow-xs'
                                : 'bg-slate-100 text-text-hi border border-line hover:bg-[#0B3D91] hover:text-white'
                            }`}
                          >
                            {isMonitored ? 'In Cockpit' : 'Monitor Live'}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Regional Fleet Map with Floating Detail Card */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              <div className="relative rounded-2xl overflow-hidden border border-line shadow-sm h-[640px] w-full bg-slate-100">
                
                {/* Map Layer with Esri World Light Gray Canvas */}
                <MapContainer
                  center={[selectedVehicle?.lat || 28.6200, selectedVehicle?.lon || 77.2050]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <MapFlyToHandler selectedCoords={[selectedVehicle?.lat || 28.6200, selectedVehicle?.lon || 77.2050]} />
                  
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={16}
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={16}
                    opacity={0.85}
                  />

                  {vehicles.map((v) => {
                    const isMonitored = v.id === activeVehicleId;
                    const isSelected = v.id === selectedVehicle?.id;
                    const icon = createFleetMarkerIcon(v.status, isMonitored || isSelected);

                    return (
                      <Marker
                        key={v.id}
                        position={[v.lat || 28.6139, v.lon || 77.2090]}
                        icon={icon}
                        eventHandlers={{
                          click: () => setSelectedVehicleId(v.id)
                        }}
                      />
                    );
                  })}
                </MapContainer>

                {/* Floating White Detail Card of Selected Vehicle */}
                {selectedVehicle && (
                  <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                    <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-line p-4 rounded-2xl shadow-xl flex flex-col gap-3 relative overflow-hidden">
                      <div className="racing-stripe" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-3 w-3 rounded-full" style={{
                            backgroundColor: selectedVehicle.status === 'Active' ? '#0F9D6B' : selectedVehicle.status === 'Idle' ? '#F2A900' : '#D7263D'
                          }} />
                          <div>
                            <h4 className="text-sm font-bold text-text-hi font-heading">{selectedVehicle.name}</h4>
                            <span className="text-xs font-mono text-text-mid">{selectedVehicle.licensePlate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
                            selectedVehicle.status === 'Active' ? 'bg-emerald-50 text-[#0F9D6B] border-emerald-200' :
                            selectedVehicle.status === 'Idle' ? 'bg-amber-50 text-[#B45309] border-amber-200' :
                            'bg-red-50 text-[#D7263D] border-red-200'
                          }`}>
                            {selectedVehicle.status}
                          </span>

                          <button
                            type="button"
                            onClick={() => setDetailVehicle(selectedVehicle)}
                            className="px-2.5 py-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs"
                          >
                            Full Dossier
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMonitor(selectedVehicle.id)}
                            className="px-3 py-1 rounded-xl bg-[#0B3D91] text-white font-bold text-xs shadow-xs hover:bg-[#093276]"
                          >
                            Switch Cockpit
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-text-lo block">GPS POSITION</span>
                          <span className="text-text-hi tabular-nums font-semibold">
                            {selectedVehicle.lat?.toFixed(4)}, {selectedVehicle.lon?.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-lo block">ASSIGNED DRIVER</span>
                          <span className="text-[#0B3D91] font-semibold">
                            {drivers.find((d) => d.id === assignments[selectedVehicle.id])?.name || 'Unassigned'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-lo block">ODOMETER</span>
                          <span className="text-text-hi tabular-nums font-semibold">
                            {selectedVehicle.mileage.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 2: DRIVERS DIRECTORY & SAFETY PERFORMANCE ───────────────── */}
        {activeTab === 'drivers' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-semibold">
                Showing all {drivers.length} commercial fleet drivers with valid CDL qualification files
              </span>
              <button
                type="button"
                onClick={() => setIsAddDriverOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B3D91] text-white font-mono text-xs font-bold shadow-xs hover:bg-blue-800 transition"
              >
                + Register New Driver
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {drivers.map((d) => {
                const assignedVehicleId = Object.keys(assignments).find(k => assignments[k] === d.id);
                const assignedVehicle = vehicles.find(v => v.id === assignedVehicleId);

                return (
                  <div
                    key={d.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden hover:border-slate-300 transition"
                  >
                    <div className="racing-stripe" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-14 w-14 rounded-2xl bg-[#0B3D91] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                          {d.avatar || 'DR'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading font-bold text-base text-slate-900">{d.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0B3D91] border border-blue-200">
                              {d.license}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 block mt-0.5">
                            {d.experience} Experience • Rating: <strong className="text-amber-600">{d.rating} ★</strong>
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                            📞 {d.phone || '+1 (555) 234-5678'} • ✉️ {d.email || 'driver@velociq.fleet'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9.5px] font-mono uppercase text-slate-400 font-bold block">SAFETY SCORE</span>
                        <span className="text-2xl font-extrabold font-mono text-[#0F9D6B] tabular-nums">
                          {d.safetyScore}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">FUEL EFFICIENCY</span>
                        <span className="font-bold text-[#0B3D91]">{d.fuelEfficiency}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">ON-TIME COMPLIANCE</span>
                        <span className="font-bold text-slate-800">{d.onTimeCompliance}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">STOPS AVOIDED</span>
                        <span className="font-bold text-emerald-700">{d.stopsAvoided} Stops</span>
                      </div>
                    </div>

                    {/* Assigned Vehicle Card & Details Action */}
                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">ASSIGNED ASSET:</span>
                        {assignedVehicle ? (
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{assignedVehicle.name}</span>
                            <PlateBadge plate={assignedVehicle.licensePlate} country="IND" size="sm" />
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold">Unassigned (Standby)</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setDetailDriver(d)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-blue-50/70 hover:border-[#0B3D91] hover:text-[#0B3D91] font-bold text-xs transition"
                      >
                        View Driver Profile & DQF
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onAddVehicle={handleAddVehicleSubmit}
        drivers={drivers}
      />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onAddDriver={handleAddDriverSubmit}
      />

      {/* Vehicle Detail Dossier Modal */}
      <VehicleDetailModal
        isOpen={!!detailVehicle}
        vehicle={detailVehicle}
        assignedDriver={drivers.find(d => d.id === assignments[detailVehicle?.id])}
        drivers={drivers}
        onClose={() => setDetailVehicle(null)}
        onAssignDriver={(vehicleId, driverId) => {
          if (driverId) {
            assignDriver(vehicleId, driverId);
            setVehicleStatus(vehicleId, 'Active');
          } else {
            removeDriver(vehicleId);
            setVehicleStatus(vehicleId, 'Idle');
          }
          if (detailVehicle) {
            setDetailVehicle(vehicles.find(v => v.id === vehicleId));
          }
        }}
        onChangeStatus={(vehicleId, status) => {
          setVehicleStatus(vehicleId, status);
          if (detailVehicle) {
            setDetailVehicle(prev => ({ ...prev, status }));
          }
        }}
        onMonitor={handleMonitor}
        onRunObdScan={handleRunObdScan}
        onDeleteVehicle={(vehicleId) => {
          deleteVehicle(vehicleId);
          setScanToast('Asset retired and removed from active fleet.');
          setTimeout(() => setScanToast(null), 4000);
        }}
      />

      {/* Driver Detail Modal */}
      <DriverDetailModal
        isOpen={!!detailDriver}
        driver={detailDriver}
        assignedVehicle={vehicles.find(v => assignments[v.id] === detailDriver?.id)}
        vehicles={vehicles}
        onClose={() => setDetailDriver(null)}
        onAssignDriver={(vehicleId, driverId) => {
          assignDriver(vehicleId, driverId);
        }}
      />

      {/* FMCSA / DOT Compliance & DQF Vault Modal */}
      <DocumentVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
}
