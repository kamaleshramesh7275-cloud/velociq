import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { SectionLabel, PlateBadge } from '../ui';
import ComplianceBadge, { getComplianceStatus } from './ComplianceBadge';

export default function DocumentVaultModal({ isOpen, onClose }) {
  const { drivers, vehicles, updateDocumentExpiry } = useFleet();
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' | 'vehicles'
  const [selectedDoc, setSelectedDoc] = useState(null); // for preview
  const [renewingDoc, setRenewingDoc] = useState(null); // { entityType, entityId, docKey, currentExpiry, name }
  const [newDate, setNewDate] = useState('');

  if (!isOpen) return null;

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    if (renewingDoc && newDate && updateDocumentExpiry) {
      updateDocumentExpiry(renewingDoc.entityType, renewingDoc.entityId, renewingDoc.docKey, newDate);
      setRenewingDoc(null);
      setNewDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Racing Stripe Accent */}
        <div className="h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <SectionLabel label="FMCSA / DOT QUALIFICATION & COMPLIANCE VAULT" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
              Document Expiration & Qualification Vault (DQF)
            </h2>
            <p className="font-mono text-xs text-slate-700 mt-0.5">
              Automated expiration monitoring, medical certifications, PUC emissions, and commercial registrations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Toggle Strip */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`pb-2 px-3 font-mono text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'drivers'
                ? 'border-[#0B3D91] text-[#0B3D91]'
                : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>👨‍✈️ Driver Qualifications (CDL / Medical)</span>
            <span className="rounded bg-blue-100 text-[#0B3D91] px-1.5 py-0.2 text-[9px]">{drivers?.length || 4}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`pb-2 px-3 font-mono text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'vehicles'
                ? 'border-[#0B3D91] text-[#0B3D91]'
                : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>🚛 Vehicle Certifications (DOT / PUC / Insurance)</span>
            <span className="rounded bg-blue-100 text-[#0B3D91] px-1.5 py-0.2 text-[9px]">{vehicles?.length || 10}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === 'drivers' ? (
            <div className="space-y-4">
              {drivers?.map((driver) => {
                const docs = driver.documents || {};
                return (
                  <div key={driver.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3D91] text-white font-display font-bold text-sm">
                          {driver.avatar}
                        </div>
                        <div>
                          <span className="font-display font-bold text-sm text-slate-900 block leading-tight">
                            {driver.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-700">
                            License: {driver.license} • Rating: ★ {driver.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {Object.entries(docs).map(([docKey, doc]) => (
                        <div key={docKey} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
                          <div>
                            <span className="font-display font-bold text-xs text-slate-900 block truncate">
                              {doc.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-600 block mt-0.5">
                              ID: {doc.docNumber || 'DOC-REG-99'}
                            </span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <ComplianceBadge expiryDate={doc.expiryDate} size="sm" />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedDoc({ title: `${driver.name} - ${doc.name}`, ...doc })}
                                className="p-1 rounded text-slate-500 hover:text-[#0B3D91] hover:bg-white"
                                title="View Digital Scan"
                              >
                                👁️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenewingDoc({
                                    entityType: 'driver',
                                    entityId: driver.id,
                                    docKey,
                                    currentExpiry: doc.expiryDate,
                                    name: `${driver.name} • ${doc.name}`
                                  });
                                  setNewDate(doc.expiryDate);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-white"
                                title="Renew Certificate Expiry"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles?.slice(0, 6).map((vehicle) => {
                const docs = vehicle.documents || {};
                return (
                  <div key={vehicle.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-bold text-sm text-slate-900">
                          {vehicle.name}
                        </span>
                        <PlateBadge plate={vehicle.licensePlate} size="sm" />
                        <span className="font-mono text-xs text-slate-500">({vehicle.type})</span>
                      </div>
                    </div>

                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {Object.entries(docs).map(([docKey, doc]) => (
                        <div key={docKey} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
                          <div>
                            <span className="font-display font-bold text-xs text-slate-900 block truncate">
                              {doc.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-600 block mt-0.5">
                              Policy: {doc.docNumber || 'POL-8820'}
                            </span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <ComplianceBadge expiryDate={doc.expiryDate} size="sm" />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedDoc({ title: `${vehicle.name} - ${doc.name}`, ...doc })}
                                className="p-1 rounded text-slate-500 hover:text-[#0B3D91] hover:bg-white"
                                title="View Digital Scan"
                              >
                                👁️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenewingDoc({
                                    entityType: 'vehicle',
                                    entityId: vehicle.id,
                                    docKey,
                                    currentExpiry: doc.expiryDate,
                                    name: `${vehicle.name} • ${doc.name}`
                                  });
                                  setNewDate(doc.expiryDate);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-white"
                                title="Renew Certificate Expiry"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Renewal Sub-Modal */}
        {renewingDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-display font-bold text-sm text-slate-900">
                  Renew Document Expiry
                </span>
                <button
                  type="button"
                  onClick={() => setRenewingDoc(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="font-mono text-xs font-bold text-[#0B3D91] block">
                  {renewingDoc.name}
                </span>
                <p className="font-mono text-[11px] text-slate-500 mt-1">
                  Current Expiry: {renewingDoc.currentExpiry}
                </p>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-slate-700 block mb-1">
                    New Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs bg-slate-50 text-slate-900"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenewingDoc(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0F9D6B] hover:bg-emerald-700 text-white font-mono text-xs font-bold"
                  >
                    Update & Extend
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Digital Document Scan Preview Sub-Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="font-display font-bold text-sm text-slate-900 truncate">
                    {selectedDoc.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Mock Certificate Visual */}
              <div className="p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center font-mono space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#0B3D91]/10 flex items-center justify-center text-[#0B3D91] font-bold text-lg">
                  DOT
                </div>
                <span className="font-display font-black text-base text-slate-900 block tracking-wider uppercase">
                  Official Regulatory Certificate
                </span>
                <p className="text-xs text-slate-600">
                  Identifier: <strong>{selectedDoc.docNumber || 'CERT-489201'}</strong>
                </p>
                <div className="flex items-center justify-center gap-3 text-xs pt-2">
                  <span className="text-slate-500">Expires: <strong>{selectedDoc.expiryDate}</strong></span>
                  <ComplianceBadge expiryDate={selectedDoc.expiryDate} />
                </div>
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  Digitally validated on VelocIQ Cloud Compliance Gateway (SHA-256 Verified).
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D91] text-white font-mono text-xs font-bold"
                >
                  Close Document Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
