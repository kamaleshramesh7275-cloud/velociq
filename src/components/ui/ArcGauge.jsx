import React, { useMemo } from 'react';

/**
 * Obsidian Command Dual / Single Arc Gauge
 * Color-banded arc with needle and digital telemetry readout
 */
export function ArcGauge({
  value = 0,
  min = 0,
  max = 140,
  label = 'SPEED',
  unit = 'KM/H',
  speedLimit = null,
  bands = [
    { from: 0, to: 55, color: '#06B6D4' },     // Cyan normal
    { from: 55, to: 65, color: '#10B981' },   // Emerald Sweet Spot
    { from: 65, to: 90, color: '#06B6D4' },   // Cyan Cruise
    { from: 90, to: 110, color: '#F59E0B' },  // Amber Caution
    { from: 110, to: 140, color: '#F43F5E' }, // Rose Drag Penalty
  ],
  size = 220,
}) {
  const clampedVal = Math.min(max, Math.max(min, value));
  const percentage = (clampedVal - min) / (max - min);

  // Gauge angles: 140 deg to 400 deg (260 deg sweep)
  const startAngle = 140;
  const sweepAngle = 260;
  const currentAngle = startAngle + percentage * sweepAngle;

  const radius = (size / 2) - 24;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Helper for polar to cartesian
  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, r, startAng, endAng) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Speed limit marker position
  const speedLimitAngle = useMemo(() => {
    if (!speedLimit) return null;
    const p = (Math.min(max, Math.max(min, speedLimit)) - min) / (max - min);
    return startAngle + p * sweepAngle;
  }, [speedLimit, min, max]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.88}`}>
        {/* Background Track */}
        <path
          d={describeArc(cx, cy, radius, startAngle, startAngle + sweepAngle)}
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Color Bands */}
        {bands.map((b, idx) => {
          const bStartP = (b.from - min) / (max - min);
          const bEndP = (b.to - min) / (max - min);
          const bStartA = startAngle + bStartP * sweepAngle;
          const bEndA = startAngle + bEndP * sweepAngle;
          return (
            <path
              key={idx}
              d={describeArc(cx, cy, radius, bStartA, bEndA)}
              fill="none"
              stroke={b.color}
              strokeWidth="6"
              strokeOpacity="0.4"
            />
          );
        })}

        {/* Active Progress Arc */}
        <path
          d={describeArc(cx, cy, radius, startAngle, currentAngle)}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="8"
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))',
          }}
        />

        {/* Speed Limit Marker */}
        {speedLimitAngle && (
          <g transform={`rotate(${speedLimitAngle - 90} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy - radius - 8}
              x2={cx}
              y2={cy - radius + 8}
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Digital Readout at center */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="font-mono font-black text-3xl fill-text-hi tracking-tight tabular-nums"
        >
          {typeof value === 'number' ? (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(1)) : value}
        </text>

        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="font-mono text-[10px] font-bold fill-[#0B3D91] uppercase tracking-[0.25em]"
        >
          {label}
        </text>

        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          className="font-mono text-[9px] font-bold fill-[#047857] tracking-wider"
        >
          {unit}
        </text>
      </svg>
    </div>
  );
}

/**
 * Obsidian Command Radial Health/Wear Gauge
 */
export function RadialGauge({
  value = 100, // 0 to 100
  label = 'OIL',
  sublabel = 'Remaining',
  size = 130,
  strokeWidth = 8,
  glow = true,
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const color =
    clamped > 60
      ? '#10B981' // Emerald
      : clamped > 25
      ? '#F59E0B' // Amber
      : '#F43F5E'; // Rose

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: glow ? `drop-shadow(0 0 6px ${color}80)` : 'none',
          }}
        />
      </svg>
      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-text-hi tabular-nums">
          {Math.round(clamped)}%
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-700 font-bold">
          {label}
        </span>
      </div>
    </div>
  );
}
