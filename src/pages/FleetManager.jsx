import React, { useState, useMemo, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, SectionLabel, StatusPill, SeverityBadge, PlateBadge, CarSilhouette } from '../components/ui';
import { PulseDot } from '../components/icons';

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
    activeVehicleId 
  } = useFleet();
  const navigate = useNavigate();

  // Status Filter state: 'ALL', 'Active', 'Idle', 'Maintenance'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState(activeVehicleId || (vehicles[0]?.id));

  // Compute summary stats (5 tiles per spec)
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

  return (
    <div className="flex-1 overflow-auto bg-[#F4F6F9] p-6 md:p-8 text-text-hi">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <SectionLabel label="FLEET OPERATIONS & GARAGE" />
            <h1 className="text-2xl md:text-3xl font-bold text-text-hi font-heading tracking-tight mt-1">
              Fleet Garage & Asset Monitor
            </h1>
            <p className="mt-1 text-xs text-text-mid">
              Regional vehicle tracking, driver pairings, real-time status diagnostics, and telemetry switching.
            </p>
          </div>
        </header>

        {/* 5 Header Summary KPI Tiles per Prompt Specification */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">TOTAL VEHICLES</span>
            <div className="text-2xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
              {vehicles.length} <span className="text-xs font-semibold text-slate-600">Units</span>
            </div>
            <p className="text-[10px] font-mono text-[#0B3D91] font-bold mt-0.5">100% Connected</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">ACTIVE NOW</span>
            <div className="text-2xl font-bold font-mono text-[#047857] tabular-nums mt-1">
              {activeCount} <span className="text-xs font-semibold text-slate-600">In Transit</span>
            </div>
            <p className="text-[10px] font-mono text-slate-700 font-medium mt-0.5">{((activeCount / vehicles.length) * 100).toFixed(0)}% Fleet Active</p>
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
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">IN MAINTENANCE</span>
            <div className="text-2xl font-bold font-mono text-[#D7263D] tabular-nums mt-1">
              {maintenanceCount} <span className="text-xs font-semibold text-slate-600">Depot</span>
            </div>
            <p className="text-[10px] font-mono text-[#D7263D] font-medium mt-0.5">Service Bay Queue</p>
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

        {/* 2-Column Split Workspace: Roster Left (cols 1-6) + Regional Map Right (cols 7-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Filterable Vehicle Roster */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Filter Chips Bar styled as Gear Selector */}
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
                {filteredVehicles.length} of {vehicles.length} assets
              </span>
            </div>

            {/* Scrollable Vehicle List */}
            <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredVehicles.map((v) => {
                const isSelected = selectedVehicle?.id === v.id;
                const isMonitored = activeVehicleId === v.id;
                const driverId = assignments[v.id];
                const driver = drivers.find((d) => d.id === driverId);
                const carProfile = v.profile || (v.type === 'Heavy Truck' ? 'truck' : v.type === 'SUV' ? 'suv' : 'sedan');

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
                            {isMonitored && (
                              <span className="text-[9px] font-mono uppercase bg-blue-50 text-[#0B3D91] border border-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                                Cockpit Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-text-mid mt-1 flex flex-wrap items-center gap-2">
                            <PlateBadge plate={v.licensePlate} country="IND" />
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

                    {/* Driver Assignment & Monitor Button */}
                    <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-3">
                      <div className="flex-1 max-w-xs">
                        <select
                          className="w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs text-text-hi font-mono focus:border-[#0B3D91] outline-none cursor-pointer"
                          value={driverId || ''}
                          onClick={(e) => e.stopPropagation()}
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
                              {d.name} (Rating: {d.rating} / 5.0)
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
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
                );
              })}
            </div>

          </div>

          {/* Right Column: Regional Fleet Map with Floating Detail Card */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            <div className="relative rounded-2xl overflow-hidden border border-line shadow-sm h-[620px] w-full bg-slate-100">
              
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
                          onClick={() => handleMonitor(selectedVehicle.id)}
                          className="px-3 py-1 rounded-xl bg-[#0B3D91] text-white font-bold text-xs shadow-xs hover:bg-[#093276]"
                        >
                          Switch Cockpit
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-text-lo block">GPS COORDINATES</span>
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

      </div>
    </div>
  );
}
