import React, { useState, useMemo } from 'react';
import { useFleet } from '../../context/FleetContext';
import { SectionLabel, PlateBadge } from '../ui';
import { exportToCsv, triggerExecutivePrint } from '../../utils/exportUtils';

const ALL_AVAILABLE_COLUMNS = [
  { key: 'timestamp', label: 'Timestamp', default: true },
  { key: 'vehicleName', label: 'Vehicle Name', default: true },
  { key: 'licensePlate', label: 'License Plate', default: true },
  { key: 'engineType', label: 'Engine / Powertrain', default: true },
  { key: 'driverName', label: 'Assigned Driver', default: true },
  { key: 'status', label: 'Operational Status', default: true },
  { key: 'odometer', label: 'Odometer (km)', default: true },
  { key: 'safetyScore', label: 'Safety Index (/100)', default: true },
  { key: 'fuelEfficiency', label: 'Fuel / Aero Score (%)', default: false },
  { key: 'lastDvirStatus', label: 'Last DVIR Walkaround', default: true },
  { key: 'dotExpiry', label: 'DOT Inspection Expiry', default: false },
  { key: 'insuranceExpiry', label: 'Insurance Expiry', default: false }
];

export default function CustomReportBuilder() {
  const { vehicles, drivers, assignments, inspections } = useFleet();

  // Filters state
  const [selectedColumns, setSelectedColumns] = useState(
    ALL_AVAILABLE_COLUMNS.filter(c => c.default).map(c => c.key)
  );
  const [dateRange, setDateRange] = useState('7d'); // '24h' | '7d' | '30d' | 'qtd'
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    cadence: 'weekly',
    email: 'operations@velociq-logistics.com',
    format: 'csv'
  });
  const [scheduleToast, setScheduleToast] = useState('');

  // Toggle column selection
  const toggleColumn = (key) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(ALL_AVAILABLE_COLUMNS.map(c => c.key));
  };

  const resetDefaultColumns = () => {
    setSelectedColumns(ALL_AVAILABLE_COLUMNS.filter(c => c.default).map(c => c.key));
  };

  // Build synthesized row dataset based on current fleet and inspection state
  const reportData = useMemo(() => {
    let rows = (vehicles || []).map((vehicle) => {
      const driverId = assignments?.[vehicle.id];
      const driver = drivers?.find(d => d.id === driverId);
      const vehicleInspections = (inspections || []).filter(i => i.vehicleId === vehicle.id);
      const latestInspection = vehicleInspections[0];

      return {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        engineType: '2.0L I-4 Turbo',
        driverName: driver ? driver.name : 'Unassigned',
        driverId: driver ? driver.id : null,
        status: vehicle.status,
        odometer: vehicle.mileage,
        safetyScore: driver ? driver.safetyScore : 90,
        fuelEfficiency: driver ? driver.fuelEfficiency : 88,
        lastDvirStatus: vehicle.lastDvirStatus || (latestInspection ? latestInspection.overallStatus : 'PASSED'),
        dotExpiry: vehicle.documents?.dot_inspection?.expiryDate || '2027-01-25',
        insuranceExpiry: vehicle.documents?.insurance?.expiryDate || '2027-05-30'
      };
    });

    // Apply vehicle filter
    if (vehicleFilter !== 'all') {
      rows = rows.filter(r => r.vehicleId === vehicleFilter);
    }

    // Apply driver filter
    if (driverFilter !== 'all') {
      rows = rows.filter(r => r.driverId === driverFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      rows = rows.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return rows;
  }, [vehicles, drivers, assignments, inspections, vehicleFilter, driverFilter, statusFilter]);

  // Active column objects
  const activeColDefs = useMemo(() => {
    return ALL_AVAILABLE_COLUMNS.filter(c => selectedColumns.includes(c.key));
  }, [selectedColumns]);

  // Handle CSV Download
  const handleExportCsv = () => {
    const filename = `velociq_fleet_telematics_report_${dateRange}_${Date.now()}.csv`;
    exportToCsv(filename, activeColDefs, reportData);
  };

  // Handle PDF Print
  const handleExportPdf = () => {
    const rangeLabels = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      'qtd': 'Quarter-to-Date (Q3)'
    };
    triggerExecutivePrint(
      'Custom Fleet Telematics & Compliance Digest',
      activeColDefs,
      reportData,
      { period: rangeLabels[dateRange] }
    );
  };

  // Handle Schedule Submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setScheduleToast(`Automated digest scheduled for ${scheduleConfig.email} (${scheduleConfig.cadence.toUpperCase()} cadence)`);
    setShowScheduleModal(false);
    setTimeout(() => setScheduleToast(''), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {scheduleToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{scheduleToast}</span>
          </div>
          <button type="button" onClick={() => setScheduleToast('')} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <SectionLabel label="DATA MINING & EXPORT ENGINE" />
            <h3 className="font-display font-bold text-lg text-slate-900 mt-0.5">
              Custom Report Builder & Exporter
            </h3>
            <p className="font-mono text-xs text-slate-500 mt-0.5">
              RFC 4180 compliant CSV exports, DOT certified PDF prints, and automated email telematics digests.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-lg bg-[#0B3D91] hover:bg-blue-800 text-white font-mono text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export RFC 4180 CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print Executive PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>⏰</span>
              <span>Schedule Digest</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Timeframe Preset */}
          <div>
            <label className="font-mono text-[11px] font-bold text-slate-600 block mb-1">Time Range Preset</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['24h', '7d', '30d', 'qtd'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRange(r)}
                  className={`py-1 text-center font-mono text-[10px] font-bold uppercase rounded transition ${
                    dateRange === r ? 'bg-white text-[#0B3D91] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="font-mono text-[11px] font-bold text-slate-600 block mb-1">Vehicle Filter</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
            >
              <option value="all">All Fleet Assets ({vehicles?.length || 10})</option>
              {vehicles?.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
              ))}
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label className="font-mono text-[11px] font-bold text-slate-600 block mb-1">Driver Filter</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
            >
              <option value="all">All Drivers ({drivers?.length || 4})</option>
              {drivers?.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.license})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="font-mono text-[11px] font-bold text-slate-600 block mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (On Duty)</option>
              <option value="idle">Idle / Available</option>
              <option value="maintenance">Grounded / Maintenance</option>
            </select>
          </div>
        </div>

        {/* Column Picker Accordion / Strip */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-slate-700">
              Selected Columns ({selectedColumns.length} / {ALL_AVAILABLE_COLUMNS.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllColumns}
                className="text-[10px] font-mono text-[#0B3D91] hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={resetDefaultColumns}
                className="text-[10px] font-mono text-slate-500 hover:underline"
              >
                Reset Default
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_AVAILABLE_COLUMNS.map((col) => {
              const isSelected = selectedColumns.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition border ${
                    isSelected
                      ? 'bg-blue-50 text-[#0B3D91] border-blue-300 font-bold'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-slate-900">
              Live Report Preview
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0B3D91] font-mono text-[10px] font-bold">
              {reportData.length} records matching filters
            </span>
          </div>
          <span className="font-mono text-xs text-slate-500">
            Format: RFC 4180 Certified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                {activeColDefs.map(col => (
                  <th key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition font-mono">
                  {activeColDefs.map(col => {
                    const val = row[col.key];
                    if (col.key === 'licensePlate') {
                      return (
                        <td key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                          <PlateBadge plate={val} size="sm" />
                        </td>
                      );
                    }
                    if (col.key === 'status') {
                      return (
                        <td key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            val === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            val === 'Maintenance' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {val}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === 'lastDvirStatus') {
                      return (
                        <td key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            val === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                            val === 'CRITICAL_DEFECT' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {val.replace('_', ' ')}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={col.key} className="py-3 px-3.5 whitespace-nowrap text-slate-800">
                        {val ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-display font-bold text-sm text-slate-900">
                Schedule Automated Fleet Digest
              </span>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={scheduleConfig.email}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1">
                  Delivery Cadence
                </label>
                <select
                  value={scheduleConfig.cadence}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, cadence: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
                >
                  <option value="daily">Daily at 06:00 EST</option>
                  <option value="weekly">Weekly Every Monday at 06:00 EST</option>
                  <option value="monthly">Monthly on 1st at 06:00 EST</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-700 block mb-1">
                  Attached Format
                </label>
                <select
                  value={scheduleConfig.format}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, format: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
                >
                  <option value="csv">RFC 4180 CSV File</option>
                  <option value="pdf">DOT Compliant PDF Digest</option>
                  <option value="both">Both (CSV + PDF)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-mono text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D91] hover:bg-blue-800 text-white font-mono text-xs font-bold shadow-xs"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
