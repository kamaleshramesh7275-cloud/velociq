import React from 'react';
import { Card, SectionLabel } from './ui';

export default function AITerminalFeed({ aiThoughtLogs = [] }) {
  return (
    <Card className="p-6 bg-white border border-line shadow-showroom flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
          <div>
            <SectionLabel label="AUTONOMOUS COGNITION LOG" />
            <h3 className="font-display text-lg font-bold text-text-hi mt-0.5 tracking-tight flex items-center gap-2">
              AI Reasoning & Telematics Agent
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#0B3D91]/20 bg-[#0B3D91]/10 font-mono text-[11px] text-[#0B3D91]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B3D91] animate-pulse" />
            <span className="font-bold">AGENT STREAM</span>
          </div>
        </div>

        {/* Tidy Feed Box on Light Sunken Surface */}
        <div className="rounded-xl border border-line bg-bg-sunken/60 p-4 font-mono text-xs overflow-y-auto max-h-64 space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-text-lo border-b border-line pb-1.5 flex items-center justify-between">
            <span>EVENT_BUS: CAN_TELEMETRY_DISPATCH</span>
            <span className="text-[#0F9D6B] font-bold">SYNCHRONIZED (300ms)</span>
          </div>

          {aiThoughtLogs.length === 0 ? (
            <div className="py-8 text-center text-text-lo">
              Awaiting streaming events from vehicle CAN bus...
            </div>
          ) : (
            aiThoughtLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2.5 leading-relaxed font-mono p-1.5 rounded hover:bg-white/80 transition-colors">
                <span className="text-[#0B3D91] font-bold shrink-0 text-[11px]">
                  [{log.time}]
                </span>
                <span className="text-text-hi text-xs">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Terminal Status Footer */}
      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between font-mono text-[11px] text-text-lo">
        <span>INFERENCE LATENCY: <strong className="text-[#0B3D91] tabular-nums font-bold">42ms</strong></span>
        <span>SUPERVISION: <strong className="text-text-mid font-semibold">Autonomous Cruise Optimizer</strong></span>
      </div>
    </Card>
  );
}
